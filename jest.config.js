/**
 * Configuração do Jest.
 * Os testes de integração sobem a API em memória (SQLite :memory:), por isso
 * o ambiente é "node" e não o jsdom.
 */
module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.js'],
  collectCoverageFrom: ['src/**/*.js'],
  coveragePathIgnorePatterns: ['/node_modules/', 'src/server.js'],
  verbose: true,
};
