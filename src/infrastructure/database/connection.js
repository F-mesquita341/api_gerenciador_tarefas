const path = require('path');
const { Sequelize } = require('sequelize');

/**
 * Define onde o SQLite guarda os dados.
 *
 * - DB_STORAGE permite apontar para outro arquivo (útil em demonstrações).
 * - Em ambiente de teste usamos um banco em memória, para que cada execução
 *   do Jest comece limpa e não suje o banco de desenvolvimento.
 * - Caso contrário, o arquivo database.sqlite na raiz do projeto.
 */
function resolverStorage() {
  if (process.env.DB_STORAGE) {
    return process.env.DB_STORAGE;
  }

  if (process.env.NODE_ENV === 'test') {
    return ':memory:';
  }

  return path.resolve(__dirname, '..', '..', '..', 'database.sqlite');
}

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: resolverStorage(),
  logging: process.env.DB_LOG === 'true' ? console.log : false,
});

module.exports = { sequelize, resolverStorage };
