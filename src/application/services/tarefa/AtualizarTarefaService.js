const NaoEncontradoError = require('../../../domain/errors/NaoEncontradoError');

/**
 * Caso de uso: atualizar título/descrição de uma tarefa.
 *
 * Conforme o enunciado, o serviço verifica ANTES se o id existe e lança erro
 * caso não encontre.
 */
class AtualizarTarefaService {
  constructor(tarefaRepository) {
    this.tarefaRepository = tarefaRepository;
  }

  async executar(id, { titulo, descricao }) {
    const tarefa = await this.tarefaRepository.buscarPorId(id);

    if (!tarefa) {
      throw new NaoEncontradoError(`Tarefa ${id} não encontrada.`);
    }

    tarefa.atualizar({ titulo, descricao });

    return this.tarefaRepository.salvar(tarefa);
  }
}

module.exports = AtualizarTarefaService;
