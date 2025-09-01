import { describe, test, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import { NotificationCenter } from '@/components/ui/notification-center';
import { PushNotificationSubscriber } from '@/components/ui/push-notification-subscriber';

// Mock service worker
const server = setupServer(
  // Mock API routes
  rest.post('/api/notifications', (req, res, ctx) => {
    const { action } = req.body as any;
    
    switch (action) {
      case 'send_notification':
        return res(
          ctx.json({
            success: true,
            notificationId: 'test-notification-id',
            auditId: 'test-audit-id'
          })
        );
      case 'send_template':
        return res(
          ctx.json({
            success: true,
            notificationId: 'test-template-notification-id',
            auditId: 'test-audit-id'
          })
        );
      case 'send_bulk':
        return res(
          ctx.json({
            success: true,
            notificationIds: ['bulk-1', 'bulk-2'],
            auditId: 'test-audit-id'
          })
        );
      default:
        return res(ctx.status(400), ctx.json({ error: 'Invalid action' }));
    }
  }),

  rest.get('/api/notifications', (req, res, ctx) => {
    const userId = req.url.searchParams.get('userId');
    const type = req.url.searchParams.get('type');
    const limit = req.url.searchParams.get('limit');
    const offset = req.url.searchParams.get('offset');

    const mockNotifications = [
      {
        id: 'notif1',
        type: 'in-app',
        title: 'Test Notification 1',
        message: 'This is a test notification',
        userId: userId,
        createdAt: new Date().toISOString(),
        read: false,
        category: 'test',
        priority: 'normal'
      },
      {
        id: 'notif2',
        type: 'push',
        title: 'Test Notification 2',
        message: 'This is a push notification',
        userId: userId,
        createdAt: new Date().toISOString(),
        read: true,
        category: 'alert',
        priority: 'high'
      }
    ];

    let filteredNotifications = mockNotifications;
    
    if (type) {
      filteredNotifications = mockNotifications.filter(n => n.type === type);
    }

    return res(
      ctx.json({
        success: true,
        notifications: filteredNotifications,
        total: filteredNotifications.length,
        auditId: 'test-audit-id'
      })
    );
  }),

  rest.put('/api/notifications', (req, res, ctx) => {
    const { action } = req.body as any;
    
    switch (action) {
      case 'mark_read':
        return res(
          ctx.json({
            success: true,
            auditId: 'test-audit-id'
          })
        );
      case 'delete':
        return res(
          ctx.json({
            success: true,
            auditId: 'test-audit-id'
          })
        );
      default:
        return res(ctx.status(400), ctx.json({ error: 'Invalid action' }));
    }
  }),

  rest.post('/api/notifications/push', (req, res, ctx) => {
    const { action } = req.body as any;
    
    switch (action) {
      case 'subscribe':
        return res(
          ctx.json({
            success: true,
            subscriptionId: 'test-subscription-id',
            auditId: 'test-audit-id'
          })
        );
      case 'unsubscribe':
        return res(
          ctx.json({
            success: true,
            auditId: 'test-audit-id'
          })
        );
      case 'send':
        return res(
          ctx.json({
            success: true,
            auditId: 'test-audit-id'
          })
        );
      default:
        return res(ctx.status(400), ctx.json({ error: 'Invalid action' }));
    }
  }),

  rest.get('/api/notifications/push/vapid-key', (req, res, ctx) => {
    return res(
      ctx.json({
        success: true,
        publicKey: 'test-vapid-public-key',
        auditId: 'test-audit-id'
      })
    );
  })
);

// Mock browser APIs
const mockNotification = {
  requestPermission: jest.fn(),
  permission: 'granted'
};

const mockServiceWorker = {
  register: jest.fn().mockResolvedValue({
    pushManager: {
      subscribe: jest.fn().mockResolvedValue({
        endpoint: 'https://fcm.googleapis.com/fcm/send/test',
        keys: {
          p256dh: 'test-p256dh-key',
          auth: 'test-auth-key'
        }
      }),
      getSubscription: jest.fn().mockResolvedValue(null)
    }
  })
};

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn()
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

Object.defineProperty(window, 'Notification', {
  value: mockNotification
});

Object.defineProperty(navigator, 'serviceWorker', {
  value: mockServiceWorker
});

// Mock useNotifications hook
jest.mock('@/lib/hooks/useNotifications', () => ({
  useNotifications: () => ({
    sendNotification: jest.fn().mockResolvedValue('test-notification-id'),
    sendTemplateNotification: jest.fn().mockResolvedValue('test-template-notification-id'),
    sendBulkNotification: jest.fn().mockResolvedValue(['bulk-1', 'bulk-2']),
    getUserNotifications: jest.fn().mockResolvedValue([
      {
        id: 'notif1',
        type: 'in-app',
        title: 'Test Notification 1',
        message: 'This is a test notification',
        userId: 'test-user',
        createdAt: new Date().toISOString(),
        read: false,
        category: 'test',
        priority: 'normal'
      },
      {
        id: 'notif2',
        type: 'push',
        title: 'Test Notification 2',
        message: 'This is a push notification',
        userId: 'test-user',
        createdAt: new Date().toISOString(),
        read: true,
        category: 'alert',
        priority: 'high'
      }
    ]),
    markAsRead: jest.fn().mockResolvedValue(undefined),
    deleteNotification: jest.fn().mockResolvedValue(undefined),
    getStats: jest.fn().mockResolvedValue({
      total: 2,
      unread: 1,
      read: 1,
      byType: {
        'in-app': 1,
        'push': 1
      }
    })
  })
}));

describe('Notification System Integration', () => {
  beforeAll(() => server.listen());
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
    localStorageMock.setItem.mockImplementation(() => {});
    localStorageMock.removeItem.mockImplementation(() => {});
  });

  describe('NotificationCenter Component', () => {
    test('should render notification center', async () => {
      render(
        <NotificationCenter
          userId="test-user"
          culturalContext="maya"
          language="maya"
        />
      );

      // Wait for notifications to load
      await waitFor(() => {
        expect(screen.getByText('Test Notification 1')).toBeInTheDocument();
        expect(screen.getByText('Test Notification 2')).toBeInTheDocument();
      });
    });

    test('should display notification count', async () => {
      render(
        <NotificationCenter
          userId="test-user"
          culturalContext="maya"
          language="maya"
          showUnreadCount={true}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('1')).toBeInTheDocument(); // Unread count
      });
    });

    test('should mark notification as read', async () => {
      render(
        <NotificationCenter
          userId="test-user"
          culturalContext="maya"
          language="maya"
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Test Notification 1')).toBeInTheDocument();
      });

      // Click on notification to mark as read
      const notification = screen.getByText('Test Notification 1');
      fireEvent.click(notification);

      // Verify API call was made
      await waitFor(() => {
        expect(screen.getByText('Test Notification 1')).toHaveClass('read');
      });
    });

    test('should delete notification', async () => {
      render(
        <NotificationCenter
          userId="test-user"
          culturalContext="maya"
          language="maya"
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Test Notification 1')).toBeInTheDocument();
      });

      // Click delete button
      const deleteButton = screen.getByLabelText('Eliminar notificación');
      fireEvent.click(deleteButton);

      // Verify notification is removed
      await waitFor(() => {
        expect(screen.queryByText('Test Notification 1')).not.toBeInTheDocument();
      });
    });

    test('should filter notifications by type', async () => {
      render(
        <NotificationCenter
          userId="test-user"
          culturalContext="maya"
          language="maya"
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Test Notification 1')).toBeInTheDocument();
        expect(screen.getByText('Test Notification 2')).toBeInTheDocument();
      });

      // Select push notifications filter
      const filterSelect = screen.getByLabelText('Filtrar por tipo');
      fireEvent.change(filterSelect, { target: { value: 'push' } });

      // Verify only push notifications are shown
      await waitFor(() => {
        expect(screen.queryByText('Test Notification 1')).not.toBeInTheDocument();
        expect(screen.getByText('Test Notification 2')).toBeInTheDocument();
      });
    });

    test('should handle cultural adaptation', async () => {
      render(
        <NotificationCenter
          userId="test-user"
          culturalContext="maya"
          language="maya"
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Centro de Notificaciones')).toBeInTheDocument();
        expect(screen.getByText('Sin notificaciones')).toBeInTheDocument();
      });
    });

    test('should handle keyboard navigation', async () => {
      render(
        <NotificationCenter
          userId="test-user"
          culturalContext="maya"
          language="maya"
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Test Notification 1')).toBeInTheDocument();
      });

      // Test tab navigation
      const notification = screen.getByText('Test Notification 1');
      notification.focus();

      // Test keyboard interactions
      fireEvent.keyDown(notification, { key: 'Enter' });
      fireEvent.keyDown(notification, { key: 'Delete' });

      // Verify accessibility attributes
      expect(notification).toHaveAttribute('tabIndex', '0');
      expect(notification).toHaveAttribute('role', 'button');
    });

    test('should handle empty notifications', async () => {
      // Mock empty notifications
      jest.doMock('@/lib/hooks/useNotifications', () => ({
        useNotifications: () => ({
          getUserNotifications: jest.fn().mockResolvedValue([]),
          markAsRead: jest.fn(),
          deleteNotification: jest.fn(),
          getStats: jest.fn().mockResolvedValue({
            total: 0,
            unread: 0,
            read: 0,
            byType: {}
          })
        })
      }));

      render(
        <NotificationCenter
          userId="test-user"
          culturalContext="maya"
          language="maya"
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Sin notificaciones')).toBeInTheDocument();
      });
    });

    test('should handle API errors gracefully', async () => {
      // Mock API error
      server.use(
        rest.get('/api/notifications', (req, res, ctx) => {
          return res(ctx.status(500), ctx.json({ error: 'Internal server error' }));
        })
      );

      render(
        <NotificationCenter
          userId="test-user"
          culturalContext="maya"
          language="maya"
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Error al cargar notificaciones')).toBeInTheDocument();
      });
    });
  });

  describe('PushNotificationSubscriber Component', () => {
    test('should render subscription component', () => {
      render(
        <PushNotificationSubscriber
          userId="test-user"
          culturalContext="maya"
          language="maya"
        />
      );

      expect(screen.getByText('Notificaciones Push')).toBeInTheDocument();
      expect(screen.getByText('Suscribirse')).toBeInTheDocument();
    });

    test('should check browser support', () => {
      render(
        <PushNotificationSubscriber
          userId="test-user"
          culturalContext="maya"
          language="maya"
        />
      );

      // Should show support status
      expect(screen.getByText('Estado del navegador')).toBeInTheDocument();
    });

    test('should request notification permission', async () => {
      mockNotification.requestPermission.mockResolvedValue('granted');

      render(
        <PushNotificationSubscriber
          userId="test-user"
          culturalContext="maya"
          language="maya"
        />
      );

      const requestButton = screen.getByText('Solicitar Permisos');
      fireEvent.click(requestButton);

      await waitFor(() => {
        expect(mockNotification.requestPermission).toHaveBeenCalled();
      });
    });

    test('should subscribe to push notifications', async () => {
      mockNotification.permission = 'granted';

      render(
        <PushNotificationSubscriber
          userId="test-user"
          culturalContext="maya"
          language="maya"
        />
      );

      const subscribeButton = screen.getByText('Suscribirse');
      fireEvent.click(subscribeButton);

      await waitFor(() => {
        expect(screen.getByText('Suscrito')).toBeInTheDocument();
      });
    });

    test('should unsubscribe from push notifications', async () => {
      mockNotification.permission = 'granted';
      
      // Mock existing subscription
      mockServiceWorker.register.mockResolvedValue({
        pushManager: {
          subscribe: jest.fn(),
          getSubscription: jest.fn().mockResolvedValue({
            endpoint: 'https://fcm.googleapis.com/fcm/send/test',
            keys: {
              p256dh: 'test-p256dh-key',
              auth: 'test-auth-key'
            },
            unsubscribe: jest.fn().mockResolvedValue(true)
          })
        }
      });

      render(
        <PushNotificationSubscriber
          userId="test-user"
          culturalContext="maya"
          language="maya"
        />
      );

      const unsubscribeButton = screen.getByText('Cancelar Suscripción');
      fireEvent.click(unsubscribeButton);

      await waitFor(() => {
        expect(screen.getByText('No Suscrito')).toBeInTheDocument();
      });
    });

    test('should handle permission denied', async () => {
      mockNotification.requestPermission.mockResolvedValue('denied');

      render(
        <PushNotificationSubscriber
          userId="test-user"
          culturalContext="maya"
          language="maya"
        />
      );

      const requestButton = screen.getByText('Solicitar Permisos');
      fireEvent.click(requestButton);

      await waitFor(() => {
        expect(screen.getByText('Permisos Denegados')).toBeInTheDocument();
      });
    });

    test('should handle subscription errors', async () => {
      mockNotification.permission = 'granted';
      mockServiceWorker.register.mockRejectedValue(new Error('Service Worker registration failed'));

      render(
        <PushNotificationSubscriber
          userId="test-user"
          culturalContext="maya"
          language="maya"
        />
      );

      const subscribeButton = screen.getByText('Suscribirse');
      fireEvent.click(subscribeButton);

      await waitFor(() => {
        expect(screen.getByText('Error al suscribirse')).toBeInTheDocument();
      });
    });

    test('should handle cultural adaptation', () => {
      render(
        <PushNotificationSubscriber
          userId="test-user"
          culturalContext="maya"
          language="maya"
        />
      );

      expect(screen.getByText('Notificaciones Push')).toBeInTheDocument();
      expect(screen.getByText('Recibe notificaciones importantes')).toBeInTheDocument();
    });

    test('should handle keyboard navigation', () => {
      render(
        <PushNotificationSubscriber
          userId="test-user"
          culturalContext="maya"
          language="maya"
        />
      );

      const subscribeButton = screen.getByText('Suscribirse');
      
      // Test keyboard navigation
      subscribeButton.focus();
      fireEvent.keyDown(subscribeButton, { key: 'Enter' });

      // Verify accessibility attributes
      expect(subscribeButton).toHaveAttribute('tabIndex', '0');
      expect(subscribeButton).toHaveAttribute('role', 'button');
    });

    test('should call onSubscriptionChange callback', async () => {
      const mockCallback = jest.fn();
      mockNotification.permission = 'granted';

      render(
        <PushNotificationSubscriber
          userId="test-user"
          culturalContext="maya"
          language="maya"
          onSubscriptionChange={mockCallback}
        />
      );

      const subscribeButton = screen.getByText('Suscribirse');
      fireEvent.click(subscribeButton);

      await waitFor(() => {
        expect(mockCallback).toHaveBeenCalledWith(true);
      });
    });
  });

  describe('API Integration', () => {
    test('should send notification via API', async () => {
      const response = await fetch('/api/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'send_notification',
          type: 'in-app',
          title: 'Test API Notification',
          message: 'This is a test notification sent via API',
          userId: 'test-user',
          priority: 'normal',
          category: 'test',
          culturalContext: 'maya',
          language: 'maya'
        })
      });

      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.notificationId).toBeDefined();
      expect(data.auditId).toBeDefined();
    });

    test('should send template notification via API', async () => {
      const response = await fetch('/api/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'send_template',
          templateId: 'welcome',
          userId: 'test-user',
          variables: { name: 'Juan' },
          options: {
            type: 'email',
            priority: 'normal',
            culturalContext: 'maya',
            language: 'maya'
          }
        })
      });

      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.notificationId).toBeDefined();
    });

    test('should send bulk notifications via API', async () => {
      const response = await fetch('/api/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'send_bulk',
          templateId: 'welcome',
          users: [
            { userId: 'user1', variables: { name: 'Ana' } },
            { userId: 'user2', variables: { name: 'Carlos' } }
          ],
          options: {
            type: 'email',
            priority: 'normal'
          }
        })
      });

      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.notificationIds).toHaveLength(2);
    });

    test('should get notifications via API', async () => {
      const response = await fetch('/api/notifications?userId=test-user&limit=10&offset=0');
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.notifications).toBeDefined();
      expect(data.total).toBeDefined();
    });

    test('should mark notification as read via API', async () => {
      const response = await fetch('/api/notifications', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'mark_read',
          userId: 'test-user',
          notificationId: 'test-notification-id'
        })
      });

      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });

    test('should delete notification via API', async () => {
      const response = await fetch('/api/notifications', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'delete',
          userId: 'test-user',
          notificationId: 'test-notification-id'
        })
      });

      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });

    test('should subscribe to push notifications via API', async () => {
      const response = await fetch('/api/notifications/push', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'subscribe',
          userId: 'test-user',
          subscription: {
            endpoint: 'https://fcm.googleapis.com/fcm/send/test',
            keys: {
              p256dh: 'test-p256dh-key',
              auth: 'test-auth-key'
            }
          },
          culturalContext: 'maya',
          language: 'maya'
        })
      });

      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.subscriptionId).toBeDefined();
    });

    test('should get VAPID public key via API', async () => {
      const response = await fetch('/api/notifications/push/vapid-key');
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.publicKey).toBeDefined();
    });

    test('should handle API validation errors', async () => {
      const response = await fetch('/api/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'send_notification',
          // Missing required fields
          type: 'invalid-type',
          title: '',
          message: '',
          userId: ''
        })
      });

      const data = await response.json();
      
      expect(response.status).toBe(400);
      expect(data.error).toBeDefined();
    });

    test('should handle API server errors', async () => {
      // Mock server error
      server.use(
        rest.post('/api/notifications', (req, res, ctx) => {
          return res(ctx.status(500), ctx.json({ error: 'Internal server error' }));
        })
      );

      const response = await fetch('/api/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'send_notification',
          type: 'in-app',
          title: 'Test',
          message: 'Test message',
          userId: 'test-user'
        })
      });

      const data = await response.json();
      
      expect(response.status).toBe(500);
      expect(data.error).toBe('Internal server error');
    });
  });

  describe('Service Worker Integration', () => {
    test('should register service worker', async () => {
      const registration = await mockServiceWorker.register('/service-worker.js');
      
      expect(registration).toBeDefined();
      expect(mockServiceWorker.register).toHaveBeenCalledWith('/service-worker.js');
    });

    test('should handle push subscription', async () => {
      const registration = await mockServiceWorker.register('/service-worker.js');
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: 'test-vapid-public-key'
      });

      expect(subscription).toBeDefined();
      expect(subscription.endpoint).toBe('https://fcm.googleapis.com/fcm/send/test');
      expect(subscription.keys).toBeDefined();
    });

    test('should handle existing subscription', async () => {
      const existingSubscription = {
        endpoint: 'https://fcm.googleapis.com/fcm/send/existing',
        keys: {
          p256dh: 'existing-p256dh-key',
          auth: 'existing-auth-key'
        }
      };

      mockServiceWorker.register.mockResolvedValue({
        pushManager: {
          subscribe: jest.fn(),
          getSubscription: jest.fn().mockResolvedValue(existingSubscription)
        }
      });

      const registration = await mockServiceWorker.register('/service-worker.js');
      const subscription = await registration.pushManager.getSubscription();

      expect(subscription).toEqual(existingSubscription);
    });
  });

  describe('Error Handling and Edge Cases', () => {
    test('should handle network errors', async () => {
      // Mock network error
      server.use(
        rest.get('/api/notifications', (req, res, ctx) => {
          return res.networkError('Failed to connect');
        })
      );

      render(
        <NotificationCenter
          userId="test-user"
          culturalContext="maya"
          language="maya"
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Error de conexión')).toBeInTheDocument();
      });
    });

    test('should handle malformed JSON responses', async () => {
      server.use(
        rest.get('/api/notifications', (req, res, ctx) => {
          return res(ctx.text('Invalid JSON'));
        })
      );

      render(
        <NotificationCenter
          userId="test-user"
          culturalContext="maya"
          language="maya"
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Error al procesar respuesta')).toBeInTheDocument();
      });
    });

    test('should handle timeout errors', async () => {
      // Mock timeout
      server.use(
        rest.get('/api/notifications', (req, res, ctx) => {
          return res(ctx.delay(10000)); // 10 second delay
        })
      );

      render(
        <NotificationCenter
          userId="test-user"
          culturalContext="maya"
          language="maya"
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Tiempo de espera agotado')).toBeInTheDocument();
      }, { timeout: 5000 });
    });

    test('should handle concurrent requests', async () => {
      const promises = Array(5).fill(null).map(() =>
        fetch('/api/notifications?userId=test-user')
      );

      const responses = await Promise.all(promises);
      
      responses.forEach(response => {
        expect(response.status).toBe(200);
      });
    });

    test('should handle large notification lists', async () => {
      const largeNotifications = Array(100).fill(null).map((_, index) => ({
        id: `notif${index}`,
        type: 'in-app',
        title: `Notification ${index}`,
        message: `Message ${index}`,
        userId: 'test-user',
        createdAt: new Date().toISOString(),
        read: index % 2 === 0,
        category: 'test',
        priority: 'normal'
      }));

      server.use(
        rest.get('/api/notifications', (req, res, ctx) => {
          return res(
            ctx.json({
              success: true,
              notifications: largeNotifications,
              total: largeNotifications.length,
              auditId: 'test-audit-id'
            })
          );
        })
      );

      render(
        <NotificationCenter
          userId="test-user"
          culturalContext="maya"
          language="maya"
          maxNotifications={50}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Notification 0')).toBeInTheDocument();
        expect(screen.getByText('Notification 49')).toBeInTheDocument();
        expect(screen.queryByText('Notification 50')).not.toBeInTheDocument();
      });
    });
  });
});
