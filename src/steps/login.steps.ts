import { createBdd } from 'playwright-bdd';
import { expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { AllureUtils, setupPageListeners, consoleLogs } from '../utils/allure.utils';

const { Given, When, Then } = createBdd();

// Se utiliza el fixture page inyectado por playwright-bdd
let loginPage: LoginPage;

Given('el usuario está en la página de login', async ({ page }) => {
  // Configurar listeners de Allure
  setupPageListeners(page);
  AllureUtils.addLabel('story', 'Login');
  AllureUtils.addLabel('severity', 'critical');
  
  try {
    loginPage = new LoginPage(page);
    await loginPage.navegar();
    
    // Adjuntar screenshot de la página de login
    await AllureUtils.attachScreenshot(page, 'Página de Login Inicial');
    await AllureUtils.attachPageInfo(page);
    
    AllureUtils.attachText('Step Info', 'Usuario navegó exitosamente a la página de login');
  } catch (error) {
    await AllureUtils.attachScreenshot(page, 'Error al navegar');
    throw error;
  }
});

When('ingresa credenciales válidas', async () => {
  try {
    AllureUtils.addLabel('feature', 'Autenticación');
    
    const isCI = process.env.CI === 'true' || process.env.CI === '1';
    const envUser = process.env.TEST_USER;
    const envPass = process.env.TEST_PASSWORD;
    if (isCI) {
      if (!envUser || !envPass) {
        throw new Error('TEST_USER and TEST_PASSWORD must be set in CI environment');
      }
    }

    const username = envUser ?? 'Admin';
    const password = envPass ?? 'admin123';
      const credenciales = {
        usuario: username,
        contraseña: '***',
      };
      AllureUtils.attachJson('Credenciales', credenciales);

      await loginPage.iniciarSesion(username, password);
      AllureUtils.attachText('Step Info', 'Credenciales ingresadas correctamente');
  } catch (error) {
    throw error;
  }
});

Then('debería ser redirigido al panel principal', async ({ page }) => {
  try {
    await expect(page).toHaveURL(/.*dashboard/);
    
    // Adjuntar screenshot del dashboard
    await AllureUtils.attachScreenshot(page, 'Dashboard Principal');
    await AllureUtils.attachPageInfo(page);
    
    // Adjuntar logs si existen
    if (consoleLogs.length > 0) {
      AllureUtils.attachConsoleLogs(consoleLogs);
    }
    
    AllureUtils.attachText('Step Info', 'Usuario redirigido correctamente al dashboard');
  } catch (error) {
    await AllureUtils.attachScreenshot(page, 'Error - No se redirigi ó al dashboard');
    if (consoleLogs.length > 0) {
      AllureUtils.attachConsoleLogs(consoleLogs);
    }
    throw error;
  }
});
