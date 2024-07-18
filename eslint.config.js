import js from '@eslint/js';
import ts from 'typescript-eslint';
import svelte from 'eslint-plugin-svelte';
import prettier from 'eslint-plugin-prettier/recommended';
import globals from 'globals';

/** @type {import('eslint').Linter.FlatConfig[]} */
export default [
  js.configs.recommended,
  ...ts.configs.recommended,
  ...svelte.configs['flat/recommended'],
  ...svelte.configs['flat/prettier'],
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node
      }
    }
  },
  {
    files: ['**/*.svelte'],
    languageOptions: {
      parserOptions: {
        parser: ts.parser
      }
    }
  },
  {
    ignores: ['dist/'],
    rules: {
      // eqeqeq: 'warn',
      // '@typescript-eslint/no-var-requires': 'warn',
      '@typescript-eslint/no-explicit-any': 'warn'
    }
  },
  prettier
];
