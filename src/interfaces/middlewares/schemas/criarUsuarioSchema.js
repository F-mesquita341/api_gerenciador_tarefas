const { z } = require('zod');

/**
 * Schema de entrada de POST /usuarios.
 *
 * Regras pedidas pela atividade: nome obrigatório com no mínimo 3 letras e
 * e-mail em formato válido.
 */
const criarUsuarioSchema = z.object({
  nome: z
    .string({ error: 'O nome é obrigatório.' })
    .trim()
    .min(3, 'O nome deve ter no mínimo 3 caracteres.')
    .max(120, 'O nome deve ter no máximo 120 caracteres.'),

  email: z.email({
    // A mensagem muda conforme o campo esteja ausente ou apenas malformado.
    error: (problema) =>
      problema.input === undefined || problema.input === null || problema.input === ''
        ? 'O e-mail é obrigatório.'
        : 'E-mail em formato inválido.',
  }),
});

module.exports = criarUsuarioSchema;
