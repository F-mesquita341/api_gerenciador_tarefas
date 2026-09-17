/** Caso de uso: listar todos os usuários cadastrados. */
class ListarUsuariosService {
  constructor(usuarioRepository) {
    this.usuarioRepository = usuarioRepository;
  }

  async executar() {
    return this.usuarioRepository.listarTodos();
  }
}

module.exports = ListarUsuariosService;
