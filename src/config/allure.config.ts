/**
 * Configuración de Allure Reports
 * Proporciona información de categorías, severidades y etiquetas personalizadas
 */

export const allureConfig = {
  // Categorías de fallos
  categories: [
    {
      name: 'Errores de Autenticación',
      matchedStatuses: ['failed'],
      messageRegex: '.*[Uu]nauthorized|[Aa]uth.*',
    },
    {
      name: 'Errores de Validación',
      matchedStatuses: ['failed'],
      messageRegex: '.*[Vv]alidat.*|[Aa]ssert.*',
    },
    {
      name: 'Errores de Navegación',
      matchedStatuses: ['failed'],
      messageRegex: '.*[Nn]avigate|URL|[Tt]imeout.*',
    },
    {
      name: 'Errores de Elemento',
      matchedStatuses: ['failed'],
      messageRegex: '.*[Ee]lement.*|locator|selector.*',
    },
    {
      name: 'Errores de Red',
      matchedStatuses: ['failed'],
      messageRegex: '.*[Nn]etwork|HTTP.*',
    },
    {
      name: 'Errores del Sistema',
      matchedStatuses: ['failed'],
      messageRegex: '.*[Ss]ystem|[Ee]rror|Exception.*',
    },
  ],

  // Severidades disponibles
  severities: {
    BLOCKER: 'blocker',
    CRITICAL: 'critical',
    MAJOR: 'major',
    NORMAL: 'normal',
    MINOR: 'minor',
    TRIVIAL: 'trivial',
  },

  // Estados de test
  statuses: {
    PASSED: 'passed',
    FAILED: 'failed',
    BROKEN: 'broken',
    SKIPPED: 'skipped',
  },

  // Etiquetas personalizadas
  labels: {
    STORY: 'story',
    FEATURE: 'feature',
    SUITE: 'suite',
    EPIC: 'epic',
    TAG: 'tag',
    ISSUE: 'issue',
    TESTCASE: 'testcase',
  },

  // Tipos de adjuntos soportados
  attachments: {
    TEXT: 'text/plain',
    HTML: 'text/html',
    JSON: 'application/json',
    PNG: 'image/png',
    JPG: 'image/jpg',
    GIF: 'image/gif',
    PDF: 'application/pdf',
    VIDEO: 'video/mp4',
  },
};

// Interfaz para test data
export interface TestData {
  featureName: string;
  storyName: string;
  severity: 'blocker' | 'critical' | 'major' | 'normal' | 'minor' | 'trivial';
  tags?: string[];
  issueId?: string;
  testCaseId?: string;
  description?: string;
}

// Helpers para crear test data
export const createTestData = (overrides?: Partial<TestData>): TestData => ({
  featureName: 'Default Feature',
  storyName: 'Default Story',
  severity: 'normal',
  tags: [],
  ...overrides,
});

// Mapa de severidades para tests comunes
export const testSeverities = {
  login: 'critical',
  payment: 'blocker',
  registration: 'major',
  profileUpdate: 'normal',
  uiInteraction: 'minor',
};
