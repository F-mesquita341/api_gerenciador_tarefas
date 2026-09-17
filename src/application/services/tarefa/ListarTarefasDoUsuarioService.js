const NaoEncontradoError = require('../../../domain/errors/NaoEncontradoError');

/** Caso de uso: listar as tarefas de um usuário específico. */
class ListarTarefasDoUsuarioService {
  constructor(tarefaRepository, usuarioRepository) {
    this.tarefaRepository = tarefaRepository;
    this.usuarioRepository = usuarioRepository;
  }

  async executar(usuarioId) {
    const usuario = await this.usuarioRepository.buscarPorId(usuarioId);

    if (!usuario) {
      throw new NaoEncontradoError(`Usuário ${usuarioId} não encontrado.`);
    }

    return this.tarefaRepository.listarPorUsuario(usuario.id);
  }
}

module.exports = ListarTarefasDoUsuarioService;
