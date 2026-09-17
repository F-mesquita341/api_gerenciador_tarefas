const { z } = require('zod');

/**
 * Schema de entrada de POST /tarefas.
 *
 * O `usuarioId` usa coerção para aceitar tanto 1 quanto "1" — é comum um
 * cliente HTTP mandar o id como texto.
 */
const criarTarefaSchema = z.object({
  titulo: z
    .string({ error: 'O título da tarefa é obrigatório.' })
    .trim()
    .min(1, 'O título da tarefa é obrigatório.')
    .max(200, 'O título deve ter no máximo 200 caracteres.'),

  descricao: z
    .string({ error: 'A descrição deve ser um texto.' })
    .trim()
    .max(2000, 'A descrição deve ter no máximo 2000 caracteres.')
    .nullish(),

  usuarioId: z.coerce
    .number({ error: 'O ID do usuário é obrigatório.' })
    .int('O ID do usuário deve ser um número inteiro.')
    .positive('O ID do usuário deve ser um número positivo.'),
});

module.exports = criarTarefaSchema;
