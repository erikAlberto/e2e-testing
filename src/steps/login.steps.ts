import { createBdd } from 'playwright-bdd';
import { expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';

const { Given, When, Then } = createBdd();

// Se utiliza el fixture page inyectado por playwright-bdd
let loginPage: LoginPage;

Given('el usuario está en la página de login', async ({ page }) => {
  loginPage = new LoginPage(page);
  await loginPage.navegar();
});

When('ingresa credenciales válidas', async () => {
  await loginPage.iniciarSesion('Admin', 'admin123');
});

Then('debería ser redirigido al panel principal', async ({ page }) => {
  await expect(page).toHaveURL(/.*dashboard/);
});
