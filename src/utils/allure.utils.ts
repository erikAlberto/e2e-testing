import { allure } from 'allure-playwright';
import { Page } from '@playwright/test';

/**
 * Utilidades para integración con Allure Reports
 */
export class AllureUtils {
  /**
   * Adjunta una screenshot al reporte
   */
  static async attachScreenshot(page: Page, name: string) {
    try {
      const screenshot = await page.screenshot();
      // @ts-ignore - Allure API no está tipada completamente
      allure.attachment(name, screenshot, 'image/png');
    } catch (error) {
      console.error(`Error capturando screenshot: ${error}`);
    }
  }

  /**
   * Adjunta información de la página al reporte
   */
  static async attachPageInfo(page: Page) {
    try {
      const url = page.url();
      const title = await page.title();
      // @ts-ignore
      allure.parameter('URL', url);
      // @ts-ignore
      allure.parameter('Page Title', title);
    } catch (error) {
      console.error(`Error capturando info de página: ${error}`);
    }
  }

  /**
   * Marca un paso como importante en el reporte
   */
  static step(name: string) {
    // @ts-ignore
    return allure.step(name, async () => {});
  }

  /**
   * Adjunta un HTML al reporte
   */
  static attachHtml(name: string, content: string) {
    try {
      // @ts-ignore
      allure.attachment(name, content, 'text/html');
    } catch (error) {
      console.error(`Error adjuntando HTML: ${error}`);
    }
  }

  /**
   * Adjunta un JSON al reporte
   */
  static attachJson(name: string, data: object) {
    try {
      const jsonString = JSON.stringify(data, null, 2);
      // @ts-ignore
      allure.attachment(name, jsonString, 'application/json');
    } catch (error) {
      console.error(`Error adjuntando JSON: ${error}`);
    }
  }

  /**
   * Adjunta un texto al reporte
   */
  static attachText(name: string, text: string) {
    try {
      // @ts-ignore
      allure.attachment(name, text, 'text/plain');
    } catch (error) {
      console.error(`Error adjuntando texto: ${error}`);
    }
  }

  /**
   * Adjunta el HTML de la página al reporte
   */
  static async attachPageHtml(page: Page, name: string = 'Page HTML') {
    try {
      const html = await page.content();
      this.attachHtml(name, html);
    } catch (error) {
      console.error(`Error capturando HTML de página: ${error}`);
    }
  }

  /**
   * Adjunta los logs de consola de la navegador al reporte
   */
  static attachConsoleLogs(logs: string[]) {
    if (logs.length > 0) {
      try {
        const logsText = logs.join('\n');
        this.attachText('Browser Console Logs', logsText);
      } catch (error) {
        console.error(`Error adjuntando logs: ${error}`);
      }
    }
  }

  /**
   * Añade un label personalizado
   */
  static addLabel(name: string, value: string) {
    try {
      // @ts-ignore
      allure.label(name, value);
    } catch (error) {
      console.error(`Error añadiendo label: ${error}`);
    }
  }

  /**
   * Añade una descripción al test
   */
  static setDescription(description: string) {
    try {
      // @ts-ignore
      allure.description(description);
    } catch (error) {
      console.error(`Error estableciendo descripción: ${error}`);
    }
  }

  /**
   * Añade un link al reporte
   */
  static addLink(url: string, name?: string) {
    try {
      // @ts-ignore
      allure.link(url, name || url);
    } catch (error) {
      console.error(`Error añadiendo link: ${error}`);
    }
  }
}

// Variable global para almacenar logs
export let consoleLogs: string[] = [];

/**
 * Configura listeners para capturar eventos de página
 */
export function setupPageListeners(page: Page) {
  consoleLogs = [];

  page.on('console', (msg) => {
    const logMessage = `[${msg.type().toUpperCase()}] ${msg.text()}`;
    consoleLogs.push(logMessage);
  });

  page.on('pageerror', (error) => {
    consoleLogs.push(`[ERROR] ${error.message}`);
  });

  page.on('response', (response) => {
    if (response.status() >= 400) {
      consoleLogs.push(`[HTTP ${response.status()}] ${response.url()}`);
    }
  });
}
