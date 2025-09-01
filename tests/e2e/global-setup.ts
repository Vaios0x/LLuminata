import { chromium, FullConfig } from '@playwright/test';

async function globalSetup(config: FullConfig) {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  // Configurar datos de prueba en localStorage
  await page.goto('http://localhost:3000');
  await page.evaluate(() => {
    localStorage.setItem('test-user', JSON.stringify({
      id: 'test-student-123',
      name: 'Test Student',
      email: 'test@example.com',
      role: 'student',
      culture: 'maya',
      language: 'es-GT'
    }));

    // Configurar datos offline de prueba
    localStorage.setItem('offline-packages', JSON.stringify([
      {
        id: 'test-package-1',
        version: '1.0.0',
        studentId: 'test-student-123',
        culture: 'maya',
        language: 'es-GT',
        lessons: [
          {
            id: 'test-lesson-1',
            title: 'Test Lesson',
            description: 'Test lesson description',
            content: {
              text: 'Test lesson content',
              audio: '/audio/test.mp3',
              images: ['/images/test.jpg']
            }
          }
        ],
        metadata: {
          totalLessons: 1,
          totalResources: 0,
          totalSize: 1024,
          estimatedDownloadTime: 1
        }
      }
    ]));

    // Configurar preferencias de accesibilidad
    localStorage.setItem('accessibility-preferences', JSON.stringify({
      highContrast: false,
      screenReader: false,
      fontSize: 'medium',
      reducedMotion: false
    }));
  });

  await browser.close();
}

export default globalSetup;
