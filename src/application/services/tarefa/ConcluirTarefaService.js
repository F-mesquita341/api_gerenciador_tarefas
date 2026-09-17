const NaoEncontradoError = require('../../../domain/errors/NaoEncontradoError');

/**
 * Caso de uso: concluir uma tarefa.
 *
 * A validação da transição (só conclui o que está EM_ANDAMENTO) é feita pela
 * entidade; aqui apenas orquestramos busca, transição e persistência.
 */
class ConcluirTarefaService {
  constructor(tarefaRepository) {
    this.tarefaRepository = tarefaRepository;
  }

  async executar(id) {
    const tarefa = await this.tarefaRepository.buscarPorId(id);

    if (!tarefa) {
      throw new NaoEncontradoError(`Tarefa ${id} não encontrada.`);
    }

    tarefa.concluir();

    return this.tarefaRepository.salvar(tarefa);
  }
}

module.exports = ConcluirTarefaService;
