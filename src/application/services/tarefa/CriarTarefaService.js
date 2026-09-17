const Tarefa = require('../../../domain/entities/Tarefa');
const NaoEncontradoError = require('../../../domain/errors/NaoEncontradoError');

/**
 * Caso de uso: criar uma tarefa vinculada a um usuário.
 *
 * O serviço orquestra: confere se o usuário existe, deixa a ENTIDADE validar as
 * regras do próprio objeto (título obrigatório, status inicial) e manda o
 * repositório persistir.
 */
class CriarTarefaService {
  constructor(tarefaRepository, usuarioRepository) {
    this.tarefaRepository = tarefaRepository;
    this.usuarioRepository = usuarioRepository;
  }

  async executar({ titulo, descricao, usuarioId }) {
    const usuario = await this.usuarioRepository.buscarPorId(usuarioId);

    if (!usuario) {
      throw new NaoEncontradoError(`Usuário ${usuarioId} não encontrado.`);
    }

    const tarefa = new Tarefa({ titulo, descricao, usuarioId: usuario.id });

    return this.tarefaRepository.criar(tarefa);
  }
}

module.exports = CriarTarefaService;
