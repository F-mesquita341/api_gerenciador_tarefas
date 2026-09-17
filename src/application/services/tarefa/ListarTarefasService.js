/**
 * Caso de uso: listar todas as tarefas cadastradas.
 * Uma classe, uma responsabilidade (SRP).
 */
class ListarTarefasService {
  constructor(tarefaRepository) {
    this.tarefaRepository = tarefaRepository;
  }

  async executar() {
    return this.tarefaRepository.listarTodas();
  }
}

module.exports = ListarTarefasService;
