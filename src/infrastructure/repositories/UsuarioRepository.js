const Usuario = require('../../domain/entities/Usuario');

/**
 * UsuarioRepository — mesma ideia do TarefaRepository: esconde o Sequelize e
 * devolve entidades de domínio para as camadas de cima.
 */
class UsuarioRepository {
  constructor(usuarioModel) {
    this.usuarioModel = usuarioModel;
  }

  #paraEntidade(registro) {
    if (!registro) {
      return null;
    }

    return new Usuario({
      id: registro.id,
      nome: registro.nome,
      email: registro.email,
    });
  }

  async criar(usuario) {
    const registro = await this.usuarioModel.create({
      nome: usuario.nome,
      email: usuario.email,
    });

    return this.#paraEntidade(registro);
  }

  async listarTodos() {
    const registros = await this.usuarioModel.findAll({ order: [['id', 'ASC']] });
    return registros.map((registro) => this.#paraEntidade(registro));
  }

  async buscarPorId(id) {
    const registro = await this.usuarioModel.findByPk(id);
    return this.#paraEntidade(registro);
  }

  async buscarPorEmail(email) {
    const registro = await this.usuarioModel.findOne({ where: { email } });
    return this.#paraEntidade(registro);
  }
}

module.exports = UsuarioRepository;
