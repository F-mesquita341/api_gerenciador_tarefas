const { Router } = require('express');

const validarCorpo = require('../middlewares/validarCorpo');
const criarTarefaSchema = require('../middlewares/schemas/criarTarefaSchema');

/**
 * Mapeia as rotas de tarefas para os métodos do controller.
 * O controller já chega pronto (com os serviços injetados) vindo do app.js.
 *
 * As anotações `#swagger` ficam aqui, e não no controller, por uma limitação
 * real do gerador: o swagger-autogen lê o código estaticamente, e o handler
 * destas rotas é `tarefaController.criar`, onde `tarefaController` é um
 * parâmetro de função resolvido só em tempo de execução. Nenhum analisador
 * estático consegue seguir daqui até o arquivo do controller. Anotar nas rotas
 * mantém a documentação funcionando sem sacrificar a injeção de dependência.
 */
module.exports = (tarefaController) => {
  const router = Router();

  router.get(
    '/',
    /*
      #swagger.tags = ['Tarefas']
      #swagger.summary = 'Lista todas as tarefas'
      #swagger.description = 'Retorna todas as tarefas cadastradas, de todos os usuários, ordenadas por id.'
      #swagger.responses[200] = {
        description: 'Lista de tarefas.',
        schema: { $ref: '#/definitions/ListaDeTarefas' }
      }
    */
    tarefaController.listar
  );

  router.get(
    '/:id',
    /*
      #swagger.tags = ['Tarefas']
      #swagger.summary = 'Busca uma tarefa pelo id'
      #swagger.parameters['id'] = { in: 'path', description: 'Id da tarefa', required: true, type: 'integer' }
      #swagger.responses[200] = { description: 'Tarefa encontrada.', schema: { $ref: '#/definitions/Tarefa' } }
      #swagger.responses[404] = { description: 'Tarefa não encontrada.', schema: { $ref: '#/definitions/Erro' } }
    */
    tarefaController.buscarPorId
  );

  router.post(
    '/',
    /*
      #swagger.tags = ['Tarefas']
      #swagger.summary = 'Cria uma nova tarefa'
      #swagger.description = 'Cria uma tarefa vinculada a um usuário existente. Toda tarefa nasce com status PENDENTE.'
      #swagger.parameters['body'] = {
        in: 'body',
        description: 'Dados da tarefa: título (obrigatório), descrição (opcional) e o id do usuário dono (obrigatório).',
        required: true,
        schema: { $ref: '#/definitions/NovaTarefa' }
      }
      #swagger.responses[201] = { description: 'Tarefa criada.', schema: { $ref: '#/definitions/Tarefa' } }
      #swagger.responses[400] = {
        description: 'Falha de validação estrutural do corpo (Zod): título ausente ou usuarioId inválido.',
        schema: { $ref: '#/definitions/ErroDeValidacao' }
      }
      #swagger.responses[404] = { description: 'Usuário informado não existe.', schema: { $ref: '#/definitions/Erro' } }
    */
    validarCorpo(criarTarefaSchema),
    tarefaController.criar
  );

  router.put(
    '/:id',
    /*
      #swagger.tags = ['Tarefas']
      #swagger.summary = 'Atualiza o texto de uma tarefa'
      #swagger.description = 'Altera título e/ou descrição. O status não é alterado por esta rota.'
      #swagger.parameters['id'] = { in: 'path', description: 'Id da tarefa', required: true, type: 'integer' }
      #swagger.parameters['body'] = {
        in: 'body',
        description: 'Campos a alterar.',
        required: true,
        schema: { $ref: '#/definitions/AtualizarTarefa' }
      }
      #swagger.responses[200] = { description: 'Tarefa atualizada.', schema: { $ref: '#/definitions/Tarefa' } }
      #swagger.responses[400] = { description: 'Título inválido.', schema: { $ref: '#/definitions/Erro' } }
      #swagger.responses[404] = { description: 'Tarefa não encontrada.', schema: { $ref: '#/definitions/Erro' } }
    */
    tarefaController.atualizar
  );

  router.delete(
    '/:id',
    /*
      #swagger.tags = ['Tarefas']
      #swagger.summary = 'Exclui uma tarefa'
      #swagger.parameters['id'] = { in: 'path', description: 'Id da tarefa', required: true, type: 'integer' }
      #swagger.responses[204] = { description: 'Tarefa excluída. Sem corpo na resposta.' }
      #swagger.responses[404] = { description: 'Tarefa não encontrada.', schema: { $ref: '#/definitions/Erro' } }
    */
    tarefaController.excluir
  );

  // Rotas de transição de estado (a regra do limite de 5 age em /iniciar)

  router.post(
    '/:id/iniciar',
    /*
      #swagger.tags = ['Tarefas']
      #swagger.summary = 'Inicia uma tarefa (PENDENTE -> EM_ANDAMENTO)'
      #swagger.description = 'REGRA DE NEGÓCIO: antes de iniciar, o serviço conta quantas tarefas do usuário dono já estão com status EM_ANDAMENTO. Se o total for igual ou superior a 5, a operação é barrada. Concluir uma tarefa libera uma vaga. O limite é contado por usuário, não globalmente.'
      #swagger.parameters['id'] = { in: 'path', description: 'Id da tarefa', required: true, type: 'integer' }
      #swagger.responses[200] = {
        description: 'Tarefa iniciada com sucesso.',
        schema: { $ref: '#/definitions/TarefaEmAndamento' }
      }
      #swagger.responses[400] = {
        description: 'Retornado quando o usuário atinge o limite máximo de 5 tarefas com status EM_ANDAMENTO. Também cobre a transição inválida, quando a tarefa não está PENDENTE.',
        schema: { $ref: '#/definitions/ErroLimiteAtingido' }
      }
      #swagger.responses[404] = { description: 'Tarefa não encontrada.', schema: { $ref: '#/definitions/Erro' } }
    */
    tarefaController.iniciar
  );

  router.post(
    '/:id/concluir',
    /*
      #swagger.tags = ['Tarefas']
      #swagger.summary = 'Conclui uma tarefa (EM_ANDAMENTO -> CONCLUIDA)'
      #swagger.description = 'Só é possível concluir uma tarefa que esteja EM_ANDAMENTO. Concluir libera uma vaga no limite de 5 tarefas em andamento do usuário.'
      #swagger.parameters['id'] = { in: 'path', description: 'Id da tarefa', required: true, type: 'integer' }
      #swagger.responses[200] = { description: 'Tarefa concluída com sucesso.', schema: { $ref: '#/definitions/TarefaConcluida' } }
      #swagger.responses[400] = {
        description: 'Transição inválida: a tarefa não está EM_ANDAMENTO.',
        schema: { $ref: '#/definitions/Erro' }
      }
      #swagger.responses[404] = { description: 'Tarefa não encontrada.', schema: { $ref: '#/definitions/Erro' } }
    */
    tarefaController.concluir
  );

  return router;
};
