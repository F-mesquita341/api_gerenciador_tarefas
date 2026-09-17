/**
 * Middleware de validação estrutural do corpo da requisição.
 *
 * É uma fábrica: recebe um schema do Zod e devolve o middleware do Express já
 * amarrado a ele, o que permite reaproveitar a mesma lógica em qualquer rota.
 *
 *   router.post('/', validarCorpo(criarTarefaSchema), tarefaController.criar);
 *
 * Esta camada é COMPLEMENTAR à validação do domínio, não substituta:
 *
 *   - Aqui (fronteira HTTP): o payload tem o formato certo? Os tipos batem?
 *     O e-mail parece um e-mail? É uma preocupação de transporte.
 *   - No domínio (entidades Tarefa/Usuario): os invariantes de negócio valem?
 *     Uma tarefa pode sair deste status? É uma preocupação de negócio.
 *
 * Por isso o middleware vive em `interfaces` e não conhece nada do domínio.
 */
function validarCorpo(schema) {
  return (req, res, next) => {
    const resultado = schema.safeParse(req.body);

    if (!resultado.success) {
      const detalhes = resultado.error.issues.map((problema) => ({
        campo: problema.path.join('.') || '(corpo)',
        mensagem: problema.message,
      }));

      return res.status(400).json({ erro: 'Dados inválidos.', detalhes });
    }

    // Segue adiante com o corpo já normalizado pelo schema: strings sem espaços
    // nas pontas, números convertidos e campos desconhecidos descartados.
    req.body = resultado.data;

    return next();
  };
}

module.exports = validarCorpo;
