const NaoEncontradoError = require('../../../domain/errors/NaoEncontradoError');

/** Caso de uso: buscar uma tarefa pelo id. */
class BuscarTarefaService {
  constructor(tarefaRepository) {
    this.tarefaRepository = tarefaRepository;
  }

  async executar(id) {
    const tarefa = await this.tarefaRepository.buscarPorId(id);

    if (!tarefa) {
      throw new NaoEncontradoError(`Tarefa ${id} não encontrada.`);
    }

    return tarefa;
  }
}

module.exports = BuscarTarefaService;
