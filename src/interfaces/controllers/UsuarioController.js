const tratarErro = require('./tratarErro');

/** Ponte entre o HTTP e os casos de uso dos usuários. */
class UsuarioController {
  constructor({ criarUsuarioService, listarUsuariosService, listarTarefasDoUsuarioService }) {
    this.criarUsuarioService = criarUsuarioService;
    this.listarUsuariosService = listarUsuariosService;
    this.listarTarefasDoUsuarioService = listarTarefasDoUsuarioService;
  }

  criar = async (req, res) => {
    try {
      const { nome, email } = req.body;
      const usuario = await this.criarUsuarioService.executar({ nome, email });
      return res.status(201).json(usuario);
    } catch (erro) {
      return tratarErro(erro, res);
    }
  };

  listar = async (req, res) => {
    try {
      const usuarios = await this.listarUsuariosService.executar();
      return res.status(200).json(usuarios);
    } catch (erro) {
      return tratarErro(erro, res);
    }
  };

  listarTarefas = async (req, res) => {
    try {
      const tarefas = await this.listarTarefasDoUsuarioService.executar(req.params.id);
      return res.status(200).json(tarefas);
    } catch (erro) {
      return tratarErro(erro, res);
    }
  };
}

module.exports = UsuarioController;
