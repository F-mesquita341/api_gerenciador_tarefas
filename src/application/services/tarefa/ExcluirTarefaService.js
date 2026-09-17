const NaoEncontradoError = require('../../../domain/errors/NaoEncontradoError');

/**
 * Caso de uso: excluir uma tarefa.
 * Também verifica previamente a existência do id, como pede o enunciado.
 */
class ExcluirTarefaService {
  constructor(tarefaRepository) {
    this.tarefaRepository = tarefaRepository;
  }

  async executar(id) {
    const tarefa = await this.tarefaRepository.buscarPorId(id);

    if (!tarefa) {
      throw new NaoEncontradoError(`Tarefa ${id} não encontrada.`);
    }

    await this.tarefaRepository.excluir(id);

    return tarefa;
  }
}

module.exports = ExcluirTarefaService;
