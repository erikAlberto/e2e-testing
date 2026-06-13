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
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  reporter: [
    ['list'],
    ['allure-playwright', {
      outputFolder: 'allure-results',
      suiteTitle: true,
      categories: [
        {
          'name': 'Errores Críticos',
          'matchedStatuses': ['failed'],
          'messageRegex': '.*Error.*',
        },
        {
          'name': 'Fallos en Assertions',
          'matchedStatuses': ['failed'],
          'messageRegex': '.*AssertionError.*',
        },
        {
          'name': 'Timeouts',
          'matchedStatuses': ['failed'],
          'messageRegex': '.*Timeout.*',
        },
      ],
    }],
  ],
  projects: [
    { 
      name: 'sports season tickets management system',
      use: {
        baseURL: 'http://localhost:3000',
      },
    },
  ],
  timeout: 30000,
  expect: {
    timeout: 5000,
  },
});
