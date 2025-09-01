import { chromium, FullConfig } from '@playwright/test';

async function globalTeardown(config: FullConfig) {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  // Limpiar datos de prueba
  await page.goto('http://localhost:3000');
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
    
    // Limpiar IndexedDB
    if ('indexedDB' in window) {
      indexedDB.deleteDatabase('LLuminataOffline');
    }
  });

  await browser.close();
}

export default globalTeardown;
