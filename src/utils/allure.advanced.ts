/**
 * Ejemplos Avanzados de Integración con Allure
 * Muestra casos de uso más complejos y personalizaciones
 */

import { allure } from 'allure-playwright';
import { AllureUtils } from './allure.utils';
import { Page, APIRequestContext } from '@playwright/test';

function getErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  try {
    return typeof err === 'string' ? err : JSON.stringify(err);
  } catch {
    return String(err);
  }
}

function getErrorStack(err: unknown): string {
  if (err instanceof Error) return err.stack || err.message;
  return getErrorMessage(err);
}

// ============================================
// 1. EJEMPLO: Captura de Errores con Contexto
// ============================================
export async function captureErrorWithContext(
  error: Error,
  page: Page,
  stepName: string
) {
  console.error(`[${stepName}] ${error.message}`);

  try {
    // Capturar screenshot del error
    await AllureUtils.attachScreenshot(page, `Error en ${stepName}`);

    // Capturar HTML de la página
    await AllureUtils.attachPageHtml(page, `HTML - ${stepName}`);

    // Información del error
    AllureUtils.attachText('Error Details', error.stack || error.message);

    // URL donde ocurrió el error
    AllureUtils.attachJson('Page Context', {
      url: page.url(),
      title: await page.title(),
      timestamp: new Date().toISOString(),
    });
  } catch (captureError) {
    console.error('Error capturando contexto:', getErrorStack(captureError));
  }
}

// ============================================
// 2. EJEMPLO: Captura de Llamadas a API
// ============================================
export async function captureApiCall(
  request: APIRequestContext,
  method: string,
  url: string,
  data?: object,
  response?: any
) {
  const apiInfo: Record<string, any> = {
    method,
    url,
    timestamp: new Date().toISOString(),
  };

  if (data) {
    apiInfo['request_body'] = data;
  }

  if (response) {
    apiInfo['status_code'] = response.status;
    apiInfo['response_headers'] = response.headers;
    try {
      apiInfo['response_body'] = await response.json();
    } catch {
      apiInfo['response_body'] = 'No JSON response';
    }
  }

  AllureUtils.attachJson('API Call', apiInfo);
}

// ============================================
// 3. EJEMPLO: Captura de Performance
// ============================================
export async function capturePerformanceMetrics(page: Page) {
  try {
    const metrics = await page.evaluate(() => {
      const perfData = window.performance.timing;
      const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
      const connectTime = perfData.responseEnd - perfData.requestStart;
      const renderTime = perfData.domComplete - perfData.domLoading;

      return {
        pageLoadTime: `${pageLoadTime}ms`,
        connectTime: `${connectTime}ms`,
        renderTime: `${renderTime}ms`,
        serverResponseTime: `${perfData.responseEnd - perfData.fetchStart}ms`,
        resourceLoadTime: `${perfData.loadEventEnd - perfData.domContentLoadedEventEnd}ms`,
      };
    });

    AllureUtils.attachJson('Performance Metrics', metrics);
  } catch (error) {
    console.error('Error capturando métricas:', getErrorMessage(error));
  }
}

// ============================================
// 4. EJEMPLO: Captura de Datos de Base de Datos
// ============================================
export async function captureDbData(
  query: string,
  results: any[],
  executionTime: number
) {
  const dbInfo = {
    query,
    recordsReturned: results.length,
    executionTimeMs: executionTime,
    timestamp: new Date().toISOString(),
    sampleRecords: results.slice(0, 5), // Primeros 5 registros
  };

  AllureUtils.attachJson('Database Query', dbInfo);
}

// ============================================
// 5. EJEMPLO: Step Wrapper con Allure
// ============================================
export async function allureStep<T>(
  stepName: string,
  stepAction: () => Promise<T>
): Promise<T> {
  // @ts-ignore - Allure API
  return await allure.step(stepName, async () => {
    const startTime = Date.now();
    try {
      const result = await stepAction();
      const duration = Date.now() - startTime;

      AllureUtils.attachText(
        `${stepName} - Success`,
        `Ejecutado en ${duration}ms`
      );

      return result;
    } catch (err: unknown) {
      const duration = Date.now() - startTime;
      AllureUtils.attachText(
        `${stepName} - Error`,
        `Falló después de ${duration}ms: ${getErrorMessage(err)}`
      );
      if (err instanceof Error) throw err;
      throw new Error(getErrorMessage(err));
    }
  });
}

// ============================================
// 6. EJEMPLO: Captura de Network Activity
// ============================================
export async function captureNetworkActivity(page: Page) {
  const failedRequests: any[] = [];
  const slowRequests: any[] = [];

  page.on('response', (response) => {
    const startTime = (response as any)._request.startTime;
    const duration = Date.now() - (startTime || Date.now());

    // Capturar requests fallidas
    if (response.status() >= 400) {
      failedRequests.push({
        url: response.url(),
        status: response.status(),
        statusText: response.statusText(),
      });
    }

    // Capturar requests lentas (>3s)
    if (duration > 3000) {
      slowRequests.push({
        url: response.url(),
        duration: `${duration}ms`,
        status: response.status(),
      });
    }
  });

  return {
    getFailedRequests: () => failedRequests,
    getSlowRequests: () => slowRequests,
    attachReport: () => {
      if (failedRequests.length > 0) {
        AllureUtils.attachJson('Failed Requests', failedRequests);
      }
      if (slowRequests.length > 0) {
        AllureUtils.attachJson('Slow Requests', slowRequests);
      }
    },
  };
}

// ============================================
// 7. EJEMPLO: Step con Retry y Allure
// ============================================
export async function retryableStep<T>(
  stepName: string,
  stepAction: () => Promise<T>,
  retries: number = 3
): Promise<T> {
  let lastError: Error | undefined;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      AllureUtils.addLabel('retry', `${attempt}/${retries}`);
      return await allureStep(`${stepName} (Intento ${attempt})`, stepAction);
    } catch (err: unknown) {
      if (err instanceof Error) {
        lastError = err;
      } else {
        lastError = new Error(String(err));
      }

      if (attempt < retries) {
        console.log(`Reintentando ${stepName}... (${attempt}/${retries})`);
        await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
      }
    }
  }

  throw (
    lastError ?? new Error(`Retryable step "${stepName}" failed after ${retries} attempts`)
  );
}

// ============================================
// 8. EJEMPLO: Context Manager para Tests
// ============================================
export class TestContext {
  private artifacts: Map<string, any> = new Map();

  addArtifact(name: string, data: any) {
    this.artifacts.set(name, data);
  }

  async attachAllArtifacts() {
    for (const [name, data] of this.artifacts) {
      if (typeof data === 'object') {
        AllureUtils.attachJson(name, data);
      } else if (typeof data === 'string') {
        AllureUtils.attachText(name, data);
      }
    }
  }

  addLabel(name: string, value: string) {
    AllureUtils.addLabel(name, value);
  }

  addTestData(testData: any) {
    this.addArtifact('Test Data', testData);
  }

  async addPageSnapshot(page: Page) {
    await AllureUtils.attachPageInfo(page);
    await AllureUtils.attachScreenshot(page, 'Page Snapshot');
  }
}

// ============================================
// EJEMPLOS DE USO EN STEPS
// ============================================

/*

// Uso en un Given step
Given('I perform a complex action', async ({ page, request }) => {
  const context = new TestContext();
  context.addLabel('complexity', 'high');

  try {
    await allureStep('Navegar a página', async () => {
      await page.goto('https://example.com');
    });

    await allureStep('Capturar métrica de performance', async () => {
      await capturePerformanceMetrics(page);
    });

    await allureStep('Hacer llamada a API', async () => {
      const response = await request.get('https://api.example.com/data');
      await captureApiCall(request, 'GET', 'https://api.example.com/data', null, response);
    });

    await context.addPageSnapshot(page);
    await context.attachAllArtifacts();
  } catch (error) {
    await captureErrorWithContext(error as Error, page, 'Complex Action');
    throw error;
  }
});

// Uso con retry
Then('verificar que el elemento está visible', async ({ page }) => {
  await retryableStep(
    'Element visibility check',
    async () => {
      await page.isVisible('.selector');
    },
    3
  );
});

*/
