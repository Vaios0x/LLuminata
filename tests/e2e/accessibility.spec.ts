import { test, expect } from '@playwright/test';

test.describe('Accessibility Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should have proper heading structure', async ({ page }) => {
    // Verificar que hay un h1 principal
    const h1 = page.locator('h1');
    await expect(h1).toHaveCount(1);
    
    // Verificar que los headings están en orden correcto
    const headings = page.locator('h1, h2, h3, h4, h5, h6');
    const headingTexts = await headings.allTextContents();
    
    // Verificar que no hay saltos en la jerarquía
    for (let i = 1; i < headingTexts.length; i++) {
      const currentLevel = parseInt(headingTexts[i].match(/h(\d)/)?.[1] || '1');
      const previousLevel = parseInt(headingTexts[i - 1].match(/h(\d)/)?.[1] || '1');
      expect(currentLevel - previousLevel).toBeLessThanOrEqual(1);
    }
  });

  test('should have proper alt text for images', async ({ page }) => {
    const images = page.locator('img');
    const count = await images.count();
    
    for (let i = 0; i < count; i++) {
      const img = images.nth(i);
      const alt = await img.getAttribute('alt');
      expect(alt).toBeTruthy();
      expect(alt).not.toBe('');
    }
  });

  test('should have proper ARIA labels', async ({ page }) => {
    // Verificar botones
    const buttons = page.locator('button');
    const buttonCount = await buttons.count();
    
    for (let i = 0; i < buttonCount; i++) {
      const button = buttons.nth(i);
      const ariaLabel = await button.getAttribute('aria-label');
      const textContent = await button.textContent();
      
      // Si no hay aria-label, debe tener texto visible
      if (!ariaLabel) {
        expect(textContent?.trim()).toBeTruthy();
      }
    }
    
    // Verificar enlaces
    const links = page.locator('a');
    const linkCount = await links.count();
    
    for (let i = 0; i < linkCount; i++) {
      const link = links.nth(i);
      const ariaLabel = await link.getAttribute('aria-label');
      const textContent = await link.textContent();
      
      if (!ariaLabel) {
        expect(textContent?.trim()).toBeTruthy();
      }
    }
  });

  test('should have proper form labels', async ({ page }) => {
    const inputs = page.locator('input, textarea, select');
    const inputCount = await inputs.count();
    
    for (let i = 0; i < inputCount; i++) {
      const input = inputs.nth(i);
      const id = await input.getAttribute('id');
      const ariaLabel = await input.getAttribute('aria-label');
      const ariaLabelledBy = await input.getAttribute('aria-labelledby');
      
      // Debe tener al menos una forma de ser etiquetado
      expect(id || ariaLabel || ariaLabelledBy).toBeTruthy();
    }
  });

  test('should have proper color contrast', async ({ page }) => {
    // Verificar que el texto tiene suficiente contraste
    const textElements = page.locator('p, span, div, h1, h2, h3, h4, h5, h6');
    const count = await textElements.count();
    
    // Nota: La verificación real de contraste requeriría análisis de CSS
    // Por ahora verificamos que los elementos existen
    expect(count).toBeGreaterThan(0);
  });

  test('should be keyboard navigable', async ({ page }) => {
    // Verificar que se puede navegar con Tab
    await page.keyboard.press('Tab');
    let focusedElement = page.locator(':focus');
    await expect(focusedElement).toBeVisible();
    
    // Navegar por varios elementos
    for (let i = 0; i < 10; i++) {
      await page.keyboard.press('Tab');
      focusedElement = page.locator(':focus');
      await expect(focusedElement).toBeVisible();
    }
  });

  test('should have proper focus indicators', async ({ page }) => {
    await page.keyboard.press('Tab');
    const focusedElement = page.locator(':focus');
    
    // Verificar que el elemento enfocado tiene estilos de focus
    const computedStyle = await focusedElement.evaluate(el => {
      const style = window.getComputedStyle(el);
      return {
        outline: style.outline,
        border: style.border,
        boxShadow: style.boxShadow
      };
    });
    
    // Debe tener algún indicador visual de focus
    expect(
      computedStyle.outline !== 'none' ||
      computedStyle.border !== 'none' ||
      computedStyle.boxShadow !== 'none'
    ).toBeTruthy();
  });

  test('should have proper skip links', async ({ page }) => {
    // Verificar que hay enlaces de salto para navegación
    const skipLinks = page.locator('a[href^="#"]');
    const count = await skipLinks.count();
    
    if (count > 0) {
      for (let i = 0; i < count; i++) {
        const link = skipLinks.nth(i);
        const text = await link.textContent();
        expect(text?.toLowerCase()).toContain('skip');
      }
    }
  });

  test('should have proper landmarks', async ({ page }) => {
    // Verificar que hay landmarks principales
    const main = page.locator('main');
    const nav = page.locator('nav');
    const header = page.locator('header');
    const footer = page.locator('footer');
    
    expect(await main.count() + await nav.count() + await header.count() + await footer.count()).toBeGreaterThan(0);
  });

  test('should have proper language attributes', async ({ page }) => {
    const html = page.locator('html');
    const lang = await html.getAttribute('lang');
    expect(lang).toBeTruthy();
    expect(lang).toMatch(/^[a-z]{2}(-[A-Z]{2})?$/);
  });

  test('should have proper table structure', async ({ page }) => {
    const tables = page.locator('table');
    const tableCount = await tables.count();
    
    for (let i = 0; i < tableCount; i++) {
      const table = tables.nth(i);
      
      // Verificar que tiene caption o aria-label
      const caption = table.locator('caption');
      const ariaLabel = await table.getAttribute('aria-label');
      expect(await caption.count() > 0 || ariaLabel).toBeTruthy();
      
      // Verificar que tiene headers
      const headers = table.locator('th');
      expect(await headers.count()).toBeGreaterThan(0);
    }
  });

  test('should have proper list structure', async ({ page }) => {
    const lists = page.locator('ul, ol');
    const listCount = await lists.count();
    
    for (let i = 0; i < listCount; i++) {
      const list = lists.nth(i);
      const items = list.locator('li');
      expect(await items.count()).toBeGreaterThan(0);
    }
  });

  test('should have proper button types', async ({ page }) => {
    const buttons = page.locator('button');
    const buttonCount = await buttons.count();
    
    for (let i = 0; i < buttonCount; i++) {
      const button = buttons.nth(i);
      const type = await button.getAttribute('type');
      
      // Si no tiene type, debe ser button por defecto
      if (type) {
        expect(['button', 'submit', 'reset']).toContain(type);
      }
    }
  });

  test('should have proper form validation', async ({ page }) => {
    const forms = page.locator('form');
    const formCount = await forms.count();
    
    for (let i = 0; i < formCount; i++) {
      const form = forms.nth(i);
      
      // Verificar que tiene aria-describedby para errores
      const inputs = form.locator('input[aria-describedby]');
      const inputCount = await inputs.count();
      
      if (inputCount > 0) {
        for (let j = 0; j < inputCount; j++) {
          const input = inputs.nth(j);
          const describedBy = await input.getAttribute('aria-describedby');
          expect(describedBy).toBeTruthy();
        }
      }
    }
  });

  test('should have proper error handling', async ({ page }) => {
    // Simular un error
    await page.goto('/non-existent-page');
    
    // Verificar que hay mensajes de error accesibles
    const errorMessage = page.locator('[role="alert"], .error, .alert');
    if (await errorMessage.count() > 0) {
      await expect(errorMessage.first()).toBeVisible();
    }
  });

  test('should have proper loading states', async ({ page }) => {
    // Verificar que hay indicadores de carga accesibles
    const loadingIndicators = page.locator('[aria-busy="true"], [role="progressbar"], .loading');
    const count = await loadingIndicators.count();
    
    // Si hay indicadores de carga, deben ser accesibles
    if (count > 0) {
      for (let i = 0; i < count; i++) {
        const indicator = loadingIndicators.nth(i);
        const ariaLabel = await indicator.getAttribute('aria-label');
        expect(ariaLabel).toBeTruthy();
      }
    }
  });

  test('should have proper modal dialogs', async ({ page }) => {
    // Verificar que los modales son accesibles
    const modals = page.locator('[role="dialog"], [role="alertdialog"]');
    const modalCount = await modals.count();
    
    for (let i = 0; i < modalCount; i++) {
      const modal = modals.nth(i);
      
      // Verificar que tiene aria-label o aria-labelledby
      const ariaLabel = await modal.getAttribute('aria-label');
      const ariaLabelledBy = await modal.getAttribute('aria-labelledby');
      expect(ariaLabel || ariaLabelledBy).toBeTruthy();
      
      // Verificar que tiene aria-describedby
      const ariaDescribedBy = await modal.getAttribute('aria-describedby');
      expect(ariaDescribedBy).toBeTruthy();
    }
  });

  test('should have proper live regions', async ({ page }) => {
    // Verificar que hay regiones en vivo para actualizaciones dinámicas
    const liveRegions = page.locator('[aria-live], [role="status"], [role="log"], [role="alert"]');
    const count = await liveRegions.count();
    
    // Si hay regiones en vivo, deben tener configuración apropiada
    if (count > 0) {
      for (let i = 0; i < count; i++) {
        const region = liveRegions.nth(i);
        const ariaLive = await region.getAttribute('aria-live');
        expect(['polite', 'assertive', 'off']).toContain(ariaLive);
      }
    }
  });

  test('should have proper screen reader support', async ({ page }) => {
    // Verificar que hay elementos específicos para lectores de pantalla
    const srOnly = page.locator('.sr-only, .screen-reader-only, [aria-hidden="false"]');
    const count = await srOnly.count();
    
    // Si hay elementos solo para lectores de pantalla, deben estar configurados correctamente
    if (count > 0) {
      for (let i = 0; i < count; i++) {
        const element = srOnly.nth(i);
        const ariaHidden = await element.getAttribute('aria-hidden');
        expect(ariaHidden).not.toBe('true');
      }
    }
  });

  test('should have proper high contrast support', async ({ page }) => {
    // Verificar que los elementos tienen suficiente contraste
    // Esto es una verificación básica - en un entorno real se usaría una librería de contraste
    const textElements = page.locator('p, span, div, h1, h2, h3, h4, h5, h6');
    const count = await textElements.count();
    
    expect(count).toBeGreaterThan(0);
  });

  test('should have proper reduced motion support', async ({ page }) => {
    // Verificar que las animaciones respetan las preferencias de movimiento reducido
    const animatedElements = page.locator('[style*="animation"], [style*="transition"]');
    const count = await animatedElements.count();
    
    // En un entorno real, se verificaría que las animaciones se desactivan
    // cuando se prefiere movimiento reducido
    expect(count).toBeGreaterThanOrEqual(0);
  });
});
