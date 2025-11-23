import vitest from '@vitest/eslint-plugin';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';
import testingLibrary from 'eslint-plugin-testing-library';
import { defineConfig, globalIgnores } from 'eslint/config';

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores(['.next/**', 'out/**', 'build/**', 'next-env.d.ts']),
  {
    files: ['src/**/*.{test,spec}.?(c|m)[jt]s?(x)'],
    plugins: {
      vitest,
      testingLibrary,
    },
    rules: {
      ...vitest.configs.recommended.rules,
    },
    settings: {
      vitest: {
        typecheck: true,
      },
    },
    languageOptions: {
      globals: {
        ...vitest.environments.env.globals,
      },
    },
  },
  {
    name: 'storybook-rules',
    files: ['**/*.stories.@(ts|tsx|js|jsx)'],
    rules: {
      'storybook/csf-component': 'error',
      'storybook/default-exports': 'error',
      'storybook/no-stories-of': 'error',
      'storybook/no-uninstalled-addons': 'error',
    },
  },
]);

export default eslintConfig;
