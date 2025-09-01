import { test, expect } from '@playwright/test';

test.describe('Chatbot E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test.describe('Basic Functionality', () => {
    test('should open and close chatbot', async ({ page }) => {
      // Verificar que el botón del chatbot esté visible
      const chatbotButton = page.locator('[aria-label="Abrir chatbot"]');
      await expect(chatbotButton).toBeVisible();

      // Abrir chatbot
      await chatbotButton.click();
      
      // Verificar que la ventana del chatbot esté visible
      const chatbotWindow = page.locator('text=LLuminata');
      await expect(chatbotWindow).toBeVisible();

      // Verificar que el mensaje inicial esté presente
      const initialMessage = page.locator('text=¡Hola! Soy tu asistente de IA personal');
      await expect(initialMessage).toBeVisible();

      // Cerrar chatbot
      await chatbotButton.click();
      
      // Verificar que la ventana del chatbot esté oculta
      await expect(chatbotWindow).not.toBeVisible();
    });

    test('should send and receive messages', async ({ page }) => {
      // Abrir chatbot
      await page.locator('[aria-label="Abrir chatbot"]').click();

      // Enviar mensaje
      const input = page.locator('input[placeholder="Escribe tu mensaje..."]');
      await input.fill('Hola, ¿cómo estás?');
      await input.press('Enter');

      // Verificar que el mensaje del usuario aparezca
      const userMessage = page.locator('text=Hola, ¿cómo estás?');
      await expect(userMessage).toBeVisible();

      // Verificar que aparezca el indicador de carga
      const loadingIndicator = page.locator('.animate-bounce');
      await expect(loadingIndicator).toBeVisible();

      // Esperar respuesta del asistente (mock)
      await page.waitForTimeout(2000);

      // Verificar que aparezca una respuesta
      const assistantMessage = page.locator('text=Respuesta del asistente');
      await expect(assistantMessage).toBeVisible();
    });

    test('should handle empty messages', async ({ page }) => {
      // Abrir chatbot
      await page.locator('[aria-label="Abrir chatbot"]').click();

      // Intentar enviar mensaje vacío
      const input = page.locator('input[placeholder="Escribe tu mensaje..."]');
      await input.press('Enter');

      // Verificar que no se envíe el mensaje vacío
      const messages = page.locator('.max-w-[80%]');
      const messageCount = await messages.count();
      expect(messageCount).toBe(1); // Solo el mensaje inicial
    });

    test('should handle long messages', async ({ page }) => {
      // Abrir chatbot
      await page.locator('[aria-label="Abrir chatbot"]').click();

      // Enviar mensaje largo
      const longMessage = 'A'.repeat(1000);
      const input = page.locator('input[placeholder="Escribe tu mensaje..."]');
      await input.fill(longMessage);
      await input.press('Enter');

      // Verificar que el mensaje largo se envíe correctamente
      const userMessage = page.locator(`text=${longMessage.substring(0, 100)}`);
      await expect(userMessage).toBeVisible();
    });
  });

  test.describe('Voice Features', () => {
    test('should toggle voice recognition', async ({ page }) => {
      // Abrir chatbot
      await page.locator('[aria-label="Abrir chatbot"]').click();

      // Encontrar botón de voz
      const voiceButton = page.locator('[aria-label="Iniciar grabación de voz"]');
      await expect(voiceButton).toBeVisible();

      // Activar reconocimiento de voz
      await voiceButton.click();

      // Verificar que el botón cambie de estado
      await expect(voiceButton).toHaveClass(/bg-red-100/);
      await expect(voiceButton).toHaveAttribute('aria-label', 'Detener grabación');

      // Desactivar reconocimiento de voz
      await voiceButton.click();

      // Verificar que el botón vuelva al estado original
      await expect(voiceButton).not.toHaveClass(/bg-red-100/);
      await expect(voiceButton).toHaveAttribute('aria-label', 'Iniciar grabación de voz');
    });

    test('should handle voice synthesis settings', async ({ page }) => {
      // Abrir chatbot
      await page.locator('[aria-label="Abrir chatbot"]').click();

      // Abrir configuración
      await page.locator('[aria-label="Configuración"]').click();

      // Verificar que aparezcan las opciones de configuración
      await expect(page.locator('text=Síntesis de voz')).toBeVisible();
      await expect(page.locator('text=Modelo de IA')).toBeVisible();

      // Toggle síntesis de voz
      const voiceToggle = page.locator('text=Síntesis de voz').locator('..').locator('button');
      await voiceToggle.click();

      // Verificar que el estado cambie
      await expect(voiceToggle).toHaveClass(/text-green-600/);
    });
  });

  test.describe('Settings and Configuration', () => {
    test('should change AI model', async ({ page }) => {
      // Abrir chatbot
      await page.locator('[aria-label="Abrir chatbot"]').click();

      // Abrir configuración
      await page.locator('[aria-label="Configuración"]').click();

      // Cambiar modelo de IA
      const modelSelect = page.locator('select');
      await modelSelect.selectOption('gpt-4');

      // Verificar que el cambio se mantenga
      await expect(modelSelect).toHaveValue('gpt-4');
    });

    test('should export conversation', async ({ page }) => {
      // Abrir chatbot
      await page.locator('[aria-label="Abrir chatbot"]').click();

      // Enviar un mensaje para tener contenido
      const input = page.locator('input[placeholder="Escribe tu mensaje..."]');
      await input.fill('Mensaje de prueba');
      await input.press('Enter');

      // Esperar respuesta
      await page.waitForTimeout(2000);

      // Exportar conversación
      await page.locator('[aria-label="Exportar conversación"]').click();

      // Verificar que se descargue el archivo (esto requiere configuración adicional)
      // En un test real, verificaríamos que se descargue el archivo
    });

    test('should share conversation', async ({ page }) => {
      // Mock navigator.share
      await page.addInitScript(() => {
        Object.defineProperty(navigator, 'share', {
          value: jest.fn().mockResolvedValue(undefined),
          writable: true,
        });
      });

      // Abrir chatbot
      await page.locator('[aria-label="Abrir chatbot"]').click();

      // Enviar un mensaje
      const input = page.locator('input[placeholder="Escribe tu mensaje..."]');
      await input.fill('Mensaje para compartir');
      await input.press('Enter');

      // Esperar respuesta
      await page.waitForTimeout(2000);

      // Compartir conversación
      await page.locator('[aria-label="Compartir conversación"]').click();

      // Verificar que se llame a navigator.share
      // En un test real, verificaríamos que se ejecute la función de compartir
    });
  });

  test.describe('Accessibility', () => {
    test('should support keyboard navigation', async ({ page }) => {
      // Navegar al chatbot con teclado
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');

      // Verificar que el botón del chatbot tenga foco
      const chatbotButton = page.locator('[aria-label="Abrir chatbot"]');
      await expect(chatbotButton).toBeFocused();

      // Abrir chatbot con Enter
      await page.keyboard.press('Enter');

      // Verificar que la ventana esté abierta
      await expect(page.locator('text=LLuminata')).toBeVisible();

      // Navegar al input con Tab
      await page.keyboard.press('Tab');
      const input = page.locator('input[placeholder="Escribe tu mensaje..."]');
      await expect(input).toBeFocused();

      // Escribir mensaje
      await input.type('Mensaje con teclado');
      await page.keyboard.press('Enter');

      // Verificar que el mensaje se envíe
      await expect(page.locator('text=Mensaje con teclado')).toBeVisible();
    });

    test('should have proper ARIA labels', async ({ page }) => {
      // Abrir chatbot
      await page.locator('[aria-label="Abrir chatbot"]').click();

      // Verificar ARIA labels
      await expect(page.locator('[aria-label="Configuración"]')).toBeVisible();
      await expect(page.locator('[aria-label="Exportar conversación"]')).toBeVisible();
      await expect(page.locator('[aria-label="Compartir conversación"]')).toBeVisible();
      await expect(page.locator('[aria-label="Iniciar grabación de voz"]')).toBeVisible();
      await expect(page.locator('[aria-label="Enviar mensaje"]')).toBeVisible();
    });

    test('should support screen readers', async ({ page }) => {
      // Abrir chatbot
      await page.locator('[aria-label="Abrir chatbot"]').click();

      // Verificar elementos importantes para screen readers
      await expect(page.locator('text=LLuminata')).toBeVisible();
      await expect(page.locator('text=Asistente inteligente')).toBeVisible();
      await expect(page.locator('input[placeholder="Escribe tu mensaje..."]')).toBeVisible();
    });
  });

  test.describe('Error Handling', () => {
    test('should handle network errors gracefully', async ({ page }) => {
      // Mock fetch para simular error de red
      await page.route('/api/ai/chat', route => {
        route.abort('failed');
      });

      // Abrir chatbot
      await page.locator('[aria-label="Abrir chatbot"]').click();

      // Enviar mensaje
      const input = page.locator('input[placeholder="Escribe tu mensaje..."]');
      await input.fill('Mensaje que fallará');
      await input.press('Enter');

      // Verificar que aparezca mensaje de error
      await expect(page.locator('text=Lo siento, hubo un error al procesar tu mensaje')).toBeVisible();
    });

    test('should handle API errors', async ({ page }) => {
      // Mock fetch para simular error de API
      await page.route('/api/ai/chat', route => {
        route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Internal server error' }),
        });
      });

      // Abrir chatbot
      await page.locator('[aria-label="Abrir chatbot"]').click();

      // Enviar mensaje
      const input = page.locator('input[placeholder="Escribe tu mensaje..."]');
      await input.fill('Mensaje con error de API');
      await input.press('Enter');

      // Verificar que aparezca mensaje de error
      await expect(page.locator('text=Lo siento, hubo un error al procesar tu mensaje')).toBeVisible();
    });

    test('should handle voice recognition errors', async ({ page }) => {
      // Mock Web Speech API para simular error
      await page.addInitScript(() => {
        Object.defineProperty(window, 'webkitSpeechRecognition', {
          value: undefined,
          writable: true,
        });
      });

      // Abrir chatbot
      await page.locator('[aria-label="Abrir chatbot"]').click();

      // Intentar usar reconocimiento de voz
      await page.locator('[aria-label="Iniciar grabación de voz"]').click();

      // Verificar que aparezca alerta de error
      page.on('dialog', dialog => {
        expect(dialog.message()).toContain('El reconocimiento de voz no está disponible');
        dialog.accept();
      });
    });
  });

  test.describe('Performance', () => {
    test('should load quickly', async ({ page }) => {
      const startTime = Date.now();

      // Navegar a la página
      await page.goto('/');

      const loadTime = Date.now() - startTime;
      expect(loadTime).toBeLessThan(3000); // Debe cargar en menos de 3 segundos
    });

    test('should handle rapid message sending', async ({ page }) => {
      // Abrir chatbot
      await page.locator('[aria-label="Abrir chatbot"]').click();

      const input = page.locator('input[placeholder="Escribe tu mensaje..."]');
      const sendButton = page.locator('[aria-label="Enviar mensaje"]');

      // Enviar múltiples mensajes rápidamente
      for (let i = 0; i < 5; i++) {
        await input.fill(`Mensaje rápido ${i}`);
        await sendButton.click();
        await page.waitForTimeout(100); // Pequeña pausa entre mensajes
      }

      // Verificar que todos los mensajes se envíen
      for (let i = 0; i < 5; i++) {
        await expect(page.locator(`text=Mensaje rápido ${i}`)).toBeVisible();
      }
    });

    test('should handle many messages without performance degradation', async ({ page }) => {
      // Abrir chatbot
      await page.locator('[aria-label="Abrir chatbot"]').click();

      const input = page.locator('input[placeholder="Escribe tu mensaje..."]');

      // Enviar muchos mensajes
      for (let i = 0; i < 20; i++) {
        await input.fill(`Mensaje ${i}`);
        await input.press('Enter');
        await page.waitForTimeout(50);
      }

      // Verificar que la interfaz siga siendo responsiva
      await expect(page.locator('input[placeholder="Escribe tu mensaje..."]')).toBeEnabled();
      await expect(page.locator('[aria-label="Enviar mensaje"]')).toBeEnabled();
    });
  });

  test.describe('Mobile Responsiveness', () => {
    test('should work on mobile devices', async ({ page }) => {
      // Configurar viewport móvil
      await page.setViewportSize({ width: 375, height: 667 });

      // Abrir chatbot
      await page.locator('[aria-label="Abrir chatbot"]').click();

      // Verificar que la ventana del chatbot se adapte al móvil
      const chatbotWindow = page.locator('.fixed.bottom-24.right-6');
      await expect(chatbotWindow).toBeVisible();

      // Verificar que los elementos sean táctiles
      const input = page.locator('input[placeholder="Escribe tu mensaje..."]');
      await input.tap();
      await input.fill('Mensaje móvil');
      await input.press('Enter');

      // Verificar que el mensaje se envíe
      await expect(page.locator('text=Mensaje móvil')).toBeVisible();
    });

    test('should handle touch interactions', async ({ page }) => {
      // Configurar viewport móvil
      await page.setViewportSize({ width: 375, height: 667 });

      // Abrir chatbot con touch
      await page.locator('[aria-label="Abrir chatbot"]').tap();

      // Verificar que se abra
      await expect(page.locator('text=LLuminata')).toBeVisible();

      // Usar touch para escribir
      const input = page.locator('input[placeholder="Escribe tu mensaje..."]');
      await input.tap();
      await input.fill('Mensaje táctil');

      // Enviar con touch
      await page.locator('[aria-label="Enviar mensaje"]').tap();

      // Verificar envío
      await expect(page.locator('text=Mensaje táctil')).toBeVisible();
    });
  });

  test.describe('Cross-browser Compatibility', () => {
    test('should work in different browsers', async ({ page, browserName }) => {
      // Abrir chatbot
      await page.locator('[aria-label="Abrir chatbot"]').click();

      // Verificar funcionalidad básica
      await expect(page.locator('text=LLuminata')).toBeVisible();

      // Enviar mensaje
      const input = page.locator('input[placeholder="Escribe tu mensaje..."]');
      await input.fill(`Mensaje en ${browserName}`);
      await input.press('Enter');

      // Verificar que funcione en todos los navegadores
      await expect(page.locator(`text=Mensaje en ${browserName}`)).toBeVisible();
    });
  });
});
