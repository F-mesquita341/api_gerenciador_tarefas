const Tarefa = require('../../domain/entities/Tarefa');

/**
 * TarefaRepository — Information Expert / Pure Fabrication (GRASP).
 *
 * É a única classe do sistema que sabe que existe um ORM chamado Sequelize.
 * Ela recebe o model por injeção de dependência e devolve sempre ENTIDADES DE
 * DOMÍNIO, nunca instâncias do Sequelize. Assim, os casos de uso conversam com
 * objetos de negócio e poderiam trocar SQLite por Postgres (ou por um array em
 * memória) sem que uma linha da camada de aplicação mudasse.
 */
class TarefaRepository {
  constructor(tarefaModel) {
    this.tarefaModel = tarefaModel;
  }

  /** Converte um registro do ORM na entidade pura de domínio. */
  #paraEntidade(registro) {
    if (!registro) {
      return null;
    }

    return new Tarefa({
      id: registro.id,
      titulo: registro.titulo,
      descricao: registro.descricao,
      status: registro.status,
      usuarioId: registro.usuarioId,
    });
  }

  // ---------------------------------------------------------------- CREATE
  async criar(tarefa) {
    const registro = await this.tarefaModel.create({
      titulo: tarefa.titulo,
      descricao: tarefa.descricao,
      status: tarefa.status,
      usuarioId: tarefa.usuarioId,
    });

    return this.#paraEntidade(registro);
  }

  // ------------------------------------------------------------------ READ
  async listarTodas() {
    const registros = await this.tarefaModel.findAll({ order: [['id', 'ASC']] });
    return registros.map((registro) => this.#paraEntidade(registro));
  }

  async buscarPorId(id) {
    const registro = await this.tarefaModel.findByPk(id);
    return this.#paraEntidade(registro);
  }

  // ---------------------------------------------------------------- UPDATE
  async salvar(tarefa) {
    const registro = await this.tarefaModel.findByPk(tarefa.id);

    if (!registro) {
      return null;
    }

    registro.titulo = tarefa.titulo;
    registro.descricao = tarefa.descricao;
    registro.status = tarefa.status;
    await registro.save();

    return this.#paraEntidade(registro);
  }

  // ---------------------------------------------------------------- DELETE
  /** @returns {Promise<boolean>} true se algum registro foi removido */
  async excluir(id) {
    const removidos = await this.tarefaModel.destroy({ where: { id } });
    return removidos > 0;
  }

  // ------------------------------------------------------- buscas específicas
  async listarPorUsuario(usuarioId) {
    const registros = await this.tarefaModel.findAll({
      where: { usuarioId },
      order: [['id', 'ASC']],
    });

    return registros.map((registro) => this.#paraEntidade(registro));
  }

  /**
   * Conta quantas tarefas de um usuário estão em determinado status.
   * É esta consulta que alimenta a regra do limite de tarefas em andamento.
   */
  async contarPorUsuarioEStatus(usuarioId, status) {
    return this.tarefaModel.count({ where: { usuarioId, status } });
  }
}

module.exports = TarefaRepository;
