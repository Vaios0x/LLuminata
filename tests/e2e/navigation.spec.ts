import { test, expect } from '@playwright/test';

test.describe('Navigation Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should navigate to homepage successfully', async ({ page }) => {
    await expect(page).toHaveTitle(/LLuminata/);
    await expect(page.locator('h1')).toContainText('LLuminata');
  });

  test('should navigate to dashboard', async ({ page }) => {
    await page.click('text=Dashboard');
    await expect(page).toHaveURL(/.*dashboard/);
    await expect(page.locator('h1')).toContainText('Dashboard');
  });

  test('should navigate to lessons page', async ({ page }) => {
    await page.click('text=Lecciones');
    await expect(page).toHaveURL(/.*lessons/);
    await expect(page.locator('h1')).toContainText('Lecciones');
  });

  test('should navigate to offline content page', async ({ page }) => {
    await page.click('text=Offline');
    await expect(page).toHaveURL(/.*offline/);
    await expect(page.locator('h1')).toContainText('Contenido Offline');
  });

  test('should navigate to AI test page', async ({ page }) => {
    await page.click('text=Test AI');
    await expect(page).toHaveURL(/.*test-ai/);
    await expect(page.locator('h1')).toContainText('Pruebas de Servicios de IA');
  });

  test('should navigate to login page', async ({ page }) => {
    await page.click('text=Iniciar Sesión');
    await expect(page).toHaveURL(/.*login/);
    await expect(page.locator('h1')).toContainText('Iniciar Sesión');
  });

  test('should navigate to signup page', async ({ page }) => {
    await page.click('text=Registrarse');
    await expect(page).toHaveURL(/.*signup/);
    await expect(page.locator('h1')).toContainText('Registrarse');
  });

  test('should navigate using keyboard', async ({ page }) => {
    // Navegar usando Tab
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Enter');
    
    // Verificar que se navegó a alguna página
    await expect(page).not.toHaveURL('/');
  });

  test('should have proper ARIA labels', async ({ page }) => {
    const navLinks = page.locator('nav a');
    const count = await navLinks.count();
    
    for (let i = 0; i < count; i++) {
      const link = navLinks.nth(i);
      const ariaLabel = await link.getAttribute('aria-label');
      expect(ariaLabel).toBeTruthy();
    }
  });

  test('should support back and forward navigation', async ({ page }) => {
    // Navegar a dashboard
    await page.click('text=Dashboard');
    await expect(page).toHaveURL(/.*dashboard/);
    
    // Volver atrás
    await page.goBack();
    await expect(page).toHaveURL('/');
    
    // Ir adelante
    await page.goForward();
    await expect(page).toHaveURL(/.*dashboard/);
  });

  test('should handle 404 pages gracefully', async ({ page }) => {
    await page.goto('/non-existent-page');
    
    // Verificar que se muestra una página de error
    await expect(page.locator('h1')).toContainText('404');
    await expect(page.locator('text=Volver al inicio')).toBeVisible();
  });

  test('should maintain navigation state after page refresh', async ({ page }) => {
    await page.click('text=Dashboard');
    await expect(page).toHaveURL(/.*dashboard/);
    
    await page.reload();
    await expect(page).toHaveURL(/.*dashboard/);
  });

  test('should have proper focus management', async ({ page }) => {
    // Verificar que el primer elemento es focusable
    await page.keyboard.press('Tab');
    const focusedElement = page.locator(':focus');
    await expect(focusedElement).toBeVisible();
    
    // Verificar que se puede navegar con Tab
    await page.keyboard.press('Tab');
    const secondFocusedElement = page.locator(':focus');
    await expect(secondFocusedElement).toBeVisible();
    await expect(secondFocusedElement).not.toEqual(focusedElement);
  });

  test('should support deep linking', async ({ page }) => {
    // Navegar directamente a una página específica
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/.*dashboard/);
    await expect(page.locator('h1')).toContainText('Dashboard');
  });

  test('should handle navigation with query parameters', async ({ page }) => {
    await page.goto('/lessons?culture=maya&language=es-GT');
    await expect(page).toHaveURL(/.*lessons.*culture=maya.*language=es-GT/);
  });

  test('should support navigation in different viewports', async ({ page }) => {
    // Test en móvil
    await page.setViewportSize({ width: 375, height: 667 });
    await page.click('text=Dashboard');
    await expect(page).toHaveURL(/.*dashboard/);
    
    // Test en tablet
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/');
    await page.click('text=Dashboard');
    await expect(page).toHaveURL(/.*dashboard/);
    
    // Test en desktop
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/');
    await page.click('text=Dashboard');
    await expect(page).toHaveURL(/.*dashboard/);
  });

  test('should handle navigation with slow network', async ({ page }) => {
    // Simular red lenta
    await page.route('**/*', route => {
      route.continue();
    });
    
    await page.click('text=Dashboard');
    await expect(page).toHaveURL(/.*dashboard/);
  });

  test('should handle navigation with offline mode', async ({ page }) => {
    // Simular modo offline
    await page.route('**/*', route => {
      route.abort();
    });
    
    await page.click('text=Dashboard');
    // Verificar que se muestra contenido offline o mensaje de error apropiado
    await expect(page.locator('text=Sin conexión')).toBeVisible();
  });
});
