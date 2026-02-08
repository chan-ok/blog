import vitest from '@vitest/eslint-plugin';
import testingLibrary from 'eslint-plugin-testing-library';
import { defineConfig, globalIgnores } from 'eslint/config';
import js from '@eslint/js';
import tseslint from 'typescript-eslint';

const eslintConfig = defineConfig([
  js.configs.recommended,
  ...tseslint.configs.recommended,
  globalIgnores([
    '.node_modules',
    '.husky/**',
    '.kiro/**',
    '.netlify/**',
    '.pnpm-store/**',
    '.serena/**',
    '.vscode/**',
    '.next/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
    'dist/**',
  ]),
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
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  // Storybook rules temporarily disabled due to flat config compatibility issues
  // TODO: Re-enable when eslint-plugin-storybook supports flat config properly
  // {
  //   name: 'storybook-rules',
  //   files: ['**/*.stories.@(ts|tsx|js|jsx)'],
  //   rules: {
  //     'storybook/csf-component': 'error',
  //     'storybook/default-exports': 'error',
  //     'storybook/no-stories-of': 'error',
  //     'storybook/no-uninstalled-addons': 'error',
  //   },
  // },
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'warn',
    },
  },
]);

export default eslintConfig;
