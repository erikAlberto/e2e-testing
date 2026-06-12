import { defineConfig } from '@playwright/test';
import { defineBddConfig } from 'playwright-bdd';

defineBddConfig({
  features: 'features/*.feature',
  steps: 'src/steps/*.ts',
});

export default defineConfig({
  testDir: '.features-gen',
  use: {
    headless: false,
    trace: 'on-first-retry', // Herramienta poderosa de debug de Playwright
  },
  projects: [
    { name: 'chromium' },
  ],
});
