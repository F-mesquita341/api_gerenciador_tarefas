const tratarErro = require('./tratarErro');

/**
 * Ponte entre o HTTP e os casos de uso das tarefas.
 *
 * Recebe TODOS os serviços pelo construtor (Injeção de Dependência) e não
 * contém nenhuma regra de negócio: apenas lê a requisição, chama o caso de uso
 * e devolve o status HTTP adequado.
 *
 * Os métodos são arrow functions para que possam ser passados direto ao router
 * do Express sem perder o `this`.
 */
class TarefaController {
  constructor({
    listarTarefasService,
    buscarTarefaService,
    criarTarefaService,
    atualizarTarefaService,
    excluirTarefaService,
    iniciarTarefaService,
    concluirTarefaService,
  }) {
    this.listarTarefasService = listarTarefasService;
    this.buscarTarefaService = buscarTarefaService;
    this.criarTarefaService = criarTarefaService;
    this.atualizarTarefaService = atualizarTarefaService;
    this.excluirTarefaService = excluirTarefaService;
    this.iniciarTarefaService = iniciarTarefaService;
    this.concluirTarefaService = concluirTarefaService;
  }

  listar = async (req, res) => {
    try {
      const tarefas = await this.listarTarefasService.executar();
      return res.status(200).json(tarefas);
    } catch (erro) {
      return tratarErro(erro, res);
    }
  };

  buscarPorId = async (req, res) => {
    try {
      const tarefa = await this.buscarTarefaService.executar(req.params.id);
      return res.status(200).json(tarefa);
    } catch (erro) {
      return tratarErro(erro, res);
    }
  };

  criar = async (req, res) => {
    try {
      const { titulo, descricao, usuarioId } = req.body;
      const tarefa = await this.criarTarefaService.executar({ titulo, descricao, usuarioId });
      return res.status(201).json(tarefa);
    } catch (erro) {
      return tratarErro(erro, res);
    }
  };

  atualizar = async (req, res) => {
    try {
      const { titulo, descricao } = req.body;
      const tarefa = await this.atualizarTarefaService.executar(req.params.id, {
        titulo,
        descricao,
      });
      return res.status(200).json(tarefa);
    } catch (erro) {
      return tratarErro(erro, res);
    }
  };

  excluir = async (req, res) => {
    try {
      await this.excluirTarefaService.executar(req.params.id);
      return res.status(204).send();
    } catch (erro) {
      return tratarErro(erro, res);
    }
  };

  iniciar = async (req, res) => {
    try {
      const tarefa = await this.iniciarTarefaService.executar(req.params.id);
      return res.status(200).json(tarefa);
    } catch (erro) {
      return tratarErro(erro, res);
    }
  };

  concluir = async (req, res) => {
    try {
      const tarefa = await this.concluirTarefaService.executar(req.params.id);
      return res.status(200).json(tarefa);
    } catch (erro) {
      return tratarErro(erro, res);
    }
  };
}

module.exports = TarefaController;
