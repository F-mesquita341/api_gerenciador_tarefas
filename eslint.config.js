const globals = require('globals');
const prettier = require('eslint-config-prettier');

/**
 * Flat config do ESLint.
 * O objetivo aqui é padronizar o código sem brigar com o Prettier:
 * o `eslint-config-prettier` entra por último e desliga as regras de formatação.
 */
module.exports = [
  {
    ignores: ['node_modules/**', 'coverage/**', 'swagger-output.json'],
  },
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 2023,
      sourceType: 'commonjs',
      globals: {
        ...globals.node,
      },
    },
    rules: {
      'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      'no-console': 'off',
      eqeqeq: ['error', 'always'],
      'prefer-const': 'error',
      'no-var': 'error',
    },
  },
  {
    files: ['tests/**/*.js'],
    languageOptions: {
      globals: {
        ...globals.jest,
      },
    },
  },
  prettier,
];
