const { Router } = require('express');

const validarCorpo = require('../middlewares/validarCorpo');
const criarUsuarioSchema = require('../middlewares/schemas/criarUsuarioSchema');

/**
 * Mapeia as rotas de usuários para os métodos do controller.
 * As anotações `#swagger` ficam aqui pelo mesmo motivo explicado em
 * tarefaRoutes.js: o gerador lê o código estaticamente e não alcança o
 * controller, que é injetado em tempo de execução.
 */
module.exports = (usuarioController) => {
  const router = Router();

  router.get(
    '/',
    /*
      #swagger.tags = ['Usuários']
      #swagger.summary = 'Lista todos os usuários'
      #swagger.responses[200] = {
        description: 'Lista de usuários.',
        schema: { $ref: '#/definitions/ListaDeUsuarios' }
      }
    */
    usuarioController.listar
  );

  router.post(
    '/',
    /*
      #swagger.tags = ['Usuários']
      #swagger.summary = 'Cria um novo usuário'
      #swagger.description = 'Cadastra um usuário. O nome precisa ter no mínimo 3 caracteres e o e-mail precisa ser válido e único.'
      #swagger.parameters['body'] = {
        in: 'body',
        description: 'Dados do usuário: nome (mínimo 3 caracteres) e e-mail válido.',
        required: true,
        schema: { $ref: '#/definitions/NovoUsuario' }
      }
      #swagger.responses[201] = { description: 'Usuário criado.', schema: { $ref: '#/definitions/Usuario' } }
      #swagger.responses[400] = {
        description: 'Falha de validação estrutural do corpo (Zod), ou e-mail já cadastrado.',
        schema: { $ref: '#/definitions/ErroDeValidacao' }
      }
    */
    validarCorpo(criarUsuarioSchema),
    usuarioController.criar
  );

  router.get(
    '/:id/tarefas',
    /*
      #swagger.tags = ['Usuários']
      #swagger.summary = 'Lista as tarefas de um usuário'
      #swagger.description = 'Útil para conferir quantas tarefas do usuário estão EM_ANDAMENTO antes de tentar iniciar outra.'
      #swagger.parameters['id'] = { in: 'path', description: 'Id do usuário', required: true, type: 'integer' }
      #swagger.responses[200] = { description: 'Tarefas do usuário.', schema: { $ref: '#/definitions/ListaDeTarefas' } }
      #swagger.responses[404] = { description: 'Usuário não encontrado.', schema: { $ref: '#/definitions/Erro' } }
    */
    usuarioController.listarTarefas
  );

  return router;
};
