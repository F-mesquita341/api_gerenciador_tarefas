const { DataTypes } = require('sequelize');
const { StatusTarefa, valoresDeStatus } = require('../../../domain/entities/StatusTarefa');

/**
 * Tabela de tarefas.
 *
 * Observe o `defaultValue` do status: toda tarefa nasce PENDENTE, como pede o
 * enunciado, e `usuarioId` é a chave estrangeira obrigatória para o usuário.
 */
module.exports = (sequelize) =>
  sequelize.define(
    'Tarefa',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      titulo: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: { notEmpty: true },
      },
      descricao: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      status: {
        type: DataTypes.ENUM(...valoresDeStatus()),
        allowNull: false,
        defaultValue: StatusTarefa.PENDENTE,
      },
      usuarioId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      tableName: 'tarefas',
      timestamps: true,
    }
  );
