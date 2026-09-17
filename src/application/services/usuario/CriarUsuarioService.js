const Usuario = require('../../../domain/entities/Usuario');
const ValidacaoError = require('../../../domain/errors/ValidacaoError');

/** Caso de uso: cadastrar um usuário, impedindo e-mail duplicado. */
class CriarUsuarioService {
  constructor(usuarioRepository) {
    this.usuarioRepository = usuarioRepository;
  }

  async executar({ nome, email }) {
    const usuario = new Usuario({ nome, email });

    const jaExiste = await this.usuarioRepository.buscarPorEmail(usuario.email);

    if (jaExiste) {
      throw new ValidacaoError(`Já existe um usuário cadastrado com o e-mail ${usuario.email}.`);
    }

    return this.usuarioRepository.criar(usuario);
  }
}

module.exports = CriarUsuarioService;
