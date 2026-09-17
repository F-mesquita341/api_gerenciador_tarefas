const { sequelize } = require('./connection');
const definirUsuarioModel = require('./models/UsuarioModel');
const definirTarefaModel = require('./models/TarefaModel');

const UsuarioModel = definirUsuarioModel(sequelize);
const TarefaModel = definirTarefaModel(sequelize);

// As duas entidades são interligadas: um usuário possui muitas tarefas e
// toda tarefa pertence a exatamente um usuário.
UsuarioModel.hasMany(TarefaModel, {
  foreignKey: { name: 'usuarioId', allowNull: false },
  as: 'tarefas',
  onDelete: 'CASCADE',
});

TarefaModel.belongsTo(UsuarioModel, {
  foreignKey: { name: 'usuarioId', allowNull: false },
  as: 'usuario',
});

/**
 * Sincroniza os modelos com o banco. O servidor chama esta função ANTES de
 * escutar a porta HTTP, garantindo que as tabelas existam na primeira execução.
 *
 * @param {object} opcoes opções repassadas ao `sequelize.sync` (ex.: `{ force: true }`)
 */
async function sincronizar(opcoes = {}) {
  await sequelize.authenticate();
  await sequelize.sync(opcoes);
  return sequelize;
}

/** Encerra a conexão — usado pelos testes e pelo script de seed. */
async function fecharConexao() {
  await sequelize.close();
}

module.exports = {
  sequelize,
  UsuarioModel,
  TarefaModel,
  sincronizar,
  fecharConexao,
};
