const { DataTypes } = require('sequelize');

/**
 * Tabela de usuários.
 *
 * Este arquivo é um detalhe de infraestrutura: descreve como o Sequelize
 * persiste o usuário. A regra de negócio do usuário mora em domain/entities.
 */
module.exports = (sequelize) =>
  sequelize.define(
    'Usuario',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      nome: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: { notEmpty: true },
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: { isEmail: true },
      },
    },
    {
      tableName: 'usuarios',
      timestamps: true,
    }
  );
