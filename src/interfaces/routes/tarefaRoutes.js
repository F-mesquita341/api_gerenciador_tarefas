const { Router } = require('express');

/**
 * Mapeia as rotas de tarefas para os métodos do controller.
 * O controller já chega pronto (com os serviços injetados) vindo do app.js.
 */
module.exports = (tarefaController) => {
  const router = Router();

  router.get('/', tarefaController.listar);
  router.get('/:id', tarefaController.buscarPorId);
  router.post('/', tarefaController.criar);
  router.put('/:id', tarefaController.atualizar);
  router.delete('/:id', tarefaController.excluir);

  // Rotas de transição de estado (a regra do limite de 5 age em /iniciar)
  router.post('/:id/iniciar', tarefaController.iniciar);
  router.post('/:id/concluir', tarefaController.concluir);

  return router;
};
