import { describe, test, expect, beforeEach, jest } from '@jest/globals';
import { notificationSystem } from '@/lib/notifications';
import { redisCache } from '@/lib/redis-cache';
import { generateSecurityAudit } from '@/lib/security';

// Mock dependencies
jest.mock('@/lib/redis-cache');
jest.mock('@/lib/security');
jest.mock('web-push');
jest.mock('nodemailer');
jest.mock('twilio');

const mockRedisCache = redisCache as jest.Mocked<typeof redisCache>;
const mockGenerateSecurityAudit = generateSecurityAudit as jest.MockedFunction<typeof generateSecurityAudit>;

describe('Notification System', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRedisCache.set.mockResolvedValue('OK');
    mockRedisCache.get.mockResolvedValue(null);
    mockRedisCache.del.mockResolvedValue(1);
    mockGenerateSecurityAudit.mockResolvedValue({
      id: 'test-audit-id',
      userId: 'test-user',
      action: 'test-action',
      timestamp: new Date().toISOString(),
      metadata: {}
    });
  });

  describe('Initialization', () => {
    test('should initialize notification system', async () => {
      const system = new (require('@/lib/notifications').NotificationSystem)();
      await expect(system.initialize()).resolves.not.toThrow();
    });

    test('should validate configuration', async () => {
      const system = new (require('@/lib/notifications').NotificationSystem)({
        pushEndpoint: 'invalid-url'
      });
      
      await expect(system.initialize()).rejects.toThrow('Invalid push endpoint');
    });
  });

  describe('Send Notification', () => {
    test('should send in-app notification', async () => {
      const notificationData = {
        type: 'in-app' as const,
        title: 'Test Notification',
        message: 'This is a test notification',
        userId: 'test-user',
        priority: 'normal' as const,
        category: 'test' as const
      };

      const notificationId = await notificationSystem.sendNotification(notificationData);
      
      expect(notificationId).toBeDefined();
      expect(mockRedisCache.set).toHaveBeenCalledWith(
        `notification:${notificationId}`,
        expect.objectContaining({
          id: notificationId,
          ...notificationData
        }),
        86400
      );
    });

    test('should send push notification', async () => {
      const mockSubscription = {
        endpoint: 'https://fcm.googleapis.com/fcm/send/test',
        keys: {
          p256dh: 'test-p256dh-key',
          auth: 'test-auth-key'
        }
      };

      mockRedisCache.get.mockResolvedValueOnce(JSON.stringify(mockSubscription));

      const notificationData = {
        type: 'push' as const,
        title: 'Push Test',
        message: 'Push notification test',
        userId: 'test-user',
        priority: 'high' as const,
        category: 'alert' as const
      };

      const notificationId = await notificationSystem.sendNotification(notificationData);
      
      expect(notificationId).toBeDefined();
      expect(mockRedisCache.get).toHaveBeenCalledWith('push_subscription:test-user');
    });

    test('should send email notification', async () => {
      const notificationData = {
        type: 'email' as const,
        title: 'Email Test',
        message: 'Email notification test',
        userId: 'test-user',
        priority: 'normal' as const,
        category: 'newsletter' as const,
        email: 'test@example.com'
      };

      const notificationId = await notificationSystem.sendNotification(notificationData);
      
      expect(notificationId).toBeDefined();
    });

    test('should send SMS notification', async () => {
      const notificationData = {
        type: 'sms' as const,
        title: 'SMS Test',
        message: 'SMS notification test',
        userId: 'test-user',
        priority: 'high' as const,
        category: 'alert' as const,
        phone: '+1234567890'
      };

      const notificationId = await notificationSystem.sendNotification(notificationData);
      
      expect(notificationId).toBeDefined();
    });

    test('should handle notification with cultural context', async () => {
      const notificationData = {
        type: 'in-app' as const,
        title: 'Cultural Test',
        message: 'Cultural notification test',
        userId: 'test-user',
        priority: 'normal' as const,
        category: 'test' as const,
        culturalContext: 'maya',
        language: 'maya'
      };

      const notificationId = await notificationSystem.sendNotification(notificationData);
      
      expect(notificationId).toBeDefined();
      expect(mockRedisCache.set).toHaveBeenCalledWith(
        `notification:${notificationId}`,
        expect.objectContaining({
          culturalContext: 'maya',
          language: 'maya'
        }),
        86400
      );
    });
  });

  describe('Template Notifications', () => {
    test('should send template notification', async () => {
      const templateId = 'welcome';
      const userId = 'test-user';
      const variables = { name: 'Juan' };
      const options = {
        type: 'email' as const,
        priority: 'normal' as const,
        culturalContext: 'maya',
        language: 'maya'
      };

      const notificationId = await notificationSystem.sendTemplateNotification(
        templateId,
        userId,
        variables,
        options
      );

      expect(notificationId).toBeDefined();
    });

    test('should handle missing template', async () => {
      const templateId = 'non-existent';
      const userId = 'test-user';
      const variables = { name: 'Juan' };
      const options = { type: 'email' as const };

      await expect(
        notificationSystem.sendTemplateNotification(templateId, userId, variables, options)
      ).rejects.toThrow('Template not found');
    });

    test('should handle template with missing variables', async () => {
      const templateId = 'welcome';
      const userId = 'test-user';
      const variables = {}; // Missing required 'name' variable
      const options = { type: 'email' as const };

      await expect(
        notificationSystem.sendTemplateNotification(templateId, userId, variables, options)
      ).rejects.toThrow('Missing required variables');
    });
  });

  describe('Bulk Notifications', () => {
    test('should send bulk notifications', async () => {
      const templateId = 'welcome';
      const users = [
        { userId: 'user1', variables: { name: 'Ana' } },
        { userId: 'user2', variables: { name: 'Carlos' } }
      ];
      const options = {
        type: 'email' as const,
        priority: 'normal' as const
      };

      const notificationIds = await notificationSystem.sendBulkNotification(
        templateId,
        users,
        options
      );

      expect(notificationIds).toHaveLength(2);
      expect(notificationIds[0]).toBeDefined();
      expect(notificationIds[1]).toBeDefined();
    });

    test('should handle bulk notification errors', async () => {
      const templateId = 'welcome';
      const users = [
        { userId: 'user1', variables: { name: 'Ana' } },
        { userId: 'user2', variables: {} } // Missing required variable
      ];
      const options = { type: 'email' as const };

      const notificationIds = await notificationSystem.sendBulkNotification(
        templateId,
        users,
        options
      );

      expect(notificationIds).toHaveLength(1); // Only first notification should succeed
    });
  });

  describe('Get User Notifications', () => {
    test('should get user notifications', async () => {
      const mockNotifications = [
        {
          id: 'notif1',
          type: 'in-app',
          title: 'Test 1',
          message: 'Message 1',
          userId: 'test-user',
          createdAt: new Date().toISOString(),
          read: false
        },
        {
          id: 'notif2',
          type: 'push',
          title: 'Test 2',
          message: 'Message 2',
          userId: 'test-user',
          createdAt: new Date().toISOString(),
          read: true
        }
      ];

      mockRedisCache.keys.mockResolvedValue(['notification:notif1', 'notification:notif2']);
      mockRedisCache.get
        .mockResolvedValueOnce(JSON.stringify(mockNotifications[0]))
        .mockResolvedValueOnce(JSON.stringify(mockNotifications[1]));

      const notifications = await notificationSystem.getUserNotifications('test-user', {
        limit: 10,
        offset: 0
      });

      expect(notifications).toHaveLength(2);
      expect(notifications[0].id).toBe('notif1');
      expect(notifications[1].id).toBe('notif2');
    });

    test('should filter notifications by type', async () => {
      const mockNotifications = [
        {
          id: 'notif1',
          type: 'in-app',
          title: 'Test 1',
          message: 'Message 1',
          userId: 'test-user',
          createdAt: new Date().toISOString(),
          read: false
        }
      ];

      mockRedisCache.keys.mockResolvedValue(['notification:notif1']);
      mockRedisCache.get.mockResolvedValueOnce(JSON.stringify(mockNotifications[0]));

      const notifications = await notificationSystem.getUserNotifications('test-user', {
        type: 'in-app',
        limit: 10,
        offset: 0
      });

      expect(notifications).toHaveLength(1);
      expect(notifications[0].type).toBe('in-app');
    });

    test('should handle empty notifications', async () => {
      mockRedisCache.keys.mockResolvedValue([]);

      const notifications = await notificationSystem.getUserNotifications('test-user', {
        limit: 10,
        offset: 0
      });

      expect(notifications).toHaveLength(0);
    });
  });

  describe('Mark as Read', () => {
    test('should mark notification as read', async () => {
      const notificationId = 'test-notif';
      const userId = 'test-user';

      const mockNotification = {
        id: notificationId,
        type: 'in-app',
        title: 'Test',
        message: 'Test message',
        userId: userId,
        createdAt: new Date().toISOString(),
        read: false
      };

      mockRedisCache.get.mockResolvedValueOnce(JSON.stringify(mockNotification));

      await notificationSystem.markAsRead(notificationId, userId);

      expect(mockRedisCache.set).toHaveBeenCalledWith(
        `notification:${notificationId}`,
        expect.objectContaining({
          read: true
        }),
        86400
      );
    });

    test('should handle non-existent notification', async () => {
      const notificationId = 'non-existent';
      const userId = 'test-user';

      mockRedisCache.get.mockResolvedValueOnce(null);

      await expect(
        notificationSystem.markAsRead(notificationId, userId)
      ).rejects.toThrow('Notification not found');
    });

    test('should handle unauthorized access', async () => {
      const notificationId = 'test-notif';
      const userId = 'test-user';

      const mockNotification = {
        id: notificationId,
        type: 'in-app',
        title: 'Test',
        message: 'Test message',
        userId: 'other-user', // Different user
        createdAt: new Date().toISOString(),
        read: false
      };

      mockRedisCache.get.mockResolvedValueOnce(JSON.stringify(mockNotification));

      await expect(
        notificationSystem.markAsRead(notificationId, userId)
      ).rejects.toThrow('Unauthorized access');
    });
  });

  describe('Delete Notification', () => {
    test('should delete notification', async () => {
      const notificationId = 'test-notif';
      const userId = 'test-user';

      const mockNotification = {
        id: notificationId,
        type: 'in-app',
        title: 'Test',
        message: 'Test message',
        userId: userId,
        createdAt: new Date().toISOString(),
        read: false
      };

      mockRedisCache.get.mockResolvedValueOnce(JSON.stringify(mockNotification));

      await notificationSystem.deleteNotification(notificationId, userId);

      expect(mockRedisCache.del).toHaveBeenCalledWith(`notification:${notificationId}`);
    });

    test('should handle non-existent notification', async () => {
      const notificationId = 'non-existent';
      const userId = 'test-user';

      mockRedisCache.get.mockResolvedValueOnce(null);

      await expect(
        notificationSystem.deleteNotification(notificationId, userId)
      ).rejects.toThrow('Notification not found');
    });
  });

  describe('Get Notification Stats', () => {
    test('should get notification stats for user', async () => {
      const userId = 'test-user';
      const mockNotifications = [
        { id: 'notif1', type: 'in-app', read: false, userId },
        { id: 'notif2', type: 'push', read: true, userId },
        { id: 'notif3', type: 'email', read: false, userId }
      ];

      mockRedisCache.keys.mockResolvedValue(['notification:notif1', 'notification:notif2', 'notification:notif3']);
      mockRedisCache.get
        .mockResolvedValueOnce(JSON.stringify(mockNotifications[0]))
        .mockResolvedValueOnce(JSON.stringify(mockNotifications[1]))
        .mockResolvedValueOnce(JSON.stringify(mockNotifications[2]));

      const stats = await notificationSystem.getNotificationStats(userId);

      expect(stats.total).toBe(3);
      expect(stats.unread).toBe(2);
      expect(stats.read).toBe(1);
      expect(stats.byType).toEqual({
        'in-app': 1,
        'push': 1,
        'email': 1
      });
    });

    test('should get global notification stats', async () => {
      const mockNotifications = [
        { id: 'notif1', type: 'in-app', read: false, userId: 'user1' },
        { id: 'notif2', type: 'push', read: true, userId: 'user2' },
        { id: 'notif3', type: 'email', read: false, userId: 'user1' }
      ];

      mockRedisCache.keys.mockResolvedValue(['notification:notif1', 'notification:notif2', 'notification:notif3']);
      mockRedisCache.get
        .mockResolvedValueOnce(JSON.stringify(mockNotifications[0]))
        .mockResolvedValueOnce(JSON.stringify(mockNotifications[1]))
        .mockResolvedValueOnce(JSON.stringify(mockNotifications[2]));

      const stats = await notificationSystem.getNotificationStats();

      expect(stats.total).toBe(3);
      expect(stats.unread).toBe(2);
      expect(stats.read).toBe(1);
    });
  });

  describe('Template Management', () => {
    test('should register template', async () => {
      const template = {
        id: 'test-template',
        name: 'Test Template',
        type: 'email',
        title: 'Test Title',
        message: 'Test message with {variable}',
        variables: ['variable'],
        culturalAdaptations: {
          'maya': {
            title: 'Maya Title',
            message: 'Maya message with {variable}'
          }
        }
      };

      await notificationSystem.registerTemplate(template);

      expect(mockRedisCache.set).toHaveBeenCalledWith(
        'template:test-template',
        template,
        86400
      );
    });

    test('should get template', async () => {
      const template = {
        id: 'test-template',
        name: 'Test Template',
        type: 'email',
        title: 'Test Title',
        message: 'Test message',
        variables: []
      };

      mockRedisCache.get.mockResolvedValueOnce(JSON.stringify(template));

      const retrievedTemplate = await notificationSystem.getTemplate('test-template');

      expect(retrievedTemplate).toEqual(template);
    });

    test('should handle missing template', async () => {
      mockRedisCache.get.mockResolvedValueOnce(null);

      await expect(
        notificationSystem.getTemplate('non-existent')
      ).rejects.toThrow('Template not found');
    });
  });

  describe('Error Handling', () => {
    test('should handle Redis connection errors', async () => {
      mockRedisCache.set.mockRejectedValueOnce(new Error('Redis connection failed'));

      const notificationData = {
        type: 'in-app' as const,
        title: 'Test',
        message: 'Test message',
        userId: 'test-user',
        priority: 'normal' as const,
        category: 'test' as const
      };

      await expect(
        notificationSystem.sendNotification(notificationData)
      ).rejects.toThrow('Redis connection failed');
    });

    test('should handle invalid notification data', async () => {
      const invalidData = {
        type: 'invalid-type' as any,
        title: '',
        message: '',
        userId: ''
      };

      await expect(
        notificationSystem.sendNotification(invalidData)
      ).rejects.toThrow();
    });

    test('should handle missing required fields', async () => {
      const incompleteData = {
        type: 'in-app' as const,
        title: 'Test'
        // Missing message and userId
      };

      await expect(
        notificationSystem.sendNotification(incompleteData as any)
      ).rejects.toThrow();
    });
  });

  describe('Cultural Adaptation', () => {
    test('should adapt content for Maya culture', async () => {
      const notificationData = {
        type: 'in-app' as const,
        title: 'Welcome',
        message: 'Hello {name}, welcome to our platform',
        userId: 'test-user',
        priority: 'normal' as const,
        category: 'welcome' as const,
        culturalContext: 'maya',
        language: 'maya',
        variables: { name: 'Juan' }
      };

      const notificationId = await notificationSystem.sendNotification(notificationData);

      expect(notificationId).toBeDefined();
      expect(mockRedisCache.set).toHaveBeenCalledWith(
        `notification:${notificationId}`,
        expect.objectContaining({
          culturalContext: 'maya',
          language: 'maya'
        }),
        86400
      );
    });

    test('should handle unsupported cultural context', async () => {
      const notificationData = {
        type: 'in-app' as const,
        title: 'Test',
        message: 'Test message',
        userId: 'test-user',
        priority: 'normal' as const,
        category: 'test' as const,
        culturalContext: 'unsupported',
        language: 'unsupported'
      };

      const notificationId = await notificationSystem.sendNotification(notificationData);

      expect(notificationId).toBeDefined();
      // Should fall back to default content
    });
  });

  describe('Security and Audit', () => {
    test('should generate security audit for notification send', async () => {
      const notificationData = {
        type: 'in-app' as const,
        title: 'Test',
        message: 'Test message',
        userId: 'test-user',
        priority: 'normal' as const,
        category: 'test' as const
      };

      await notificationSystem.sendNotification(notificationData);

      expect(mockGenerateSecurityAudit).toHaveBeenCalledWith(
        'notification_sent',
        'test-user',
        expect.objectContaining({
          notificationId: expect.any(String),
          type: 'in-app',
          category: 'test'
        })
      );
    });

    test('should validate user permissions', async () => {
      const notificationData = {
        type: 'in-app' as const,
        title: 'Test',
        message: 'Test message',
        userId: 'test-user',
        priority: 'normal' as const,
        category: 'test' as const
      };

      // Mock user permissions check
      mockRedisCache.get.mockResolvedValueOnce(JSON.stringify({
        permissions: ['send_notifications']
      }));

      const notificationId = await notificationSystem.sendNotification(notificationData);

      expect(notificationId).toBeDefined();
    });
  });
});
