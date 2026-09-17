const { Router } = require('express');

/** Mapeia as rotas de usuários para os métodos do controller. */
module.exports = (usuarioController) => {
  const router = Router();

  router.get('/', usuarioController.listar);
  router.post('/', usuarioController.criar);
  router.get('/:id/tarefas', usuarioController.listarTarefas);

  return router;
};
