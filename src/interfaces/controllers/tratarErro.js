const ValidacaoError = require('../../domain/errors/ValidacaoError');
const NaoEncontradoError = require('../../domain/errors/NaoEncontradoError');
const RegraDeNegocioError = require('../../domain/errors/RegraDeNegocioError');

/**
 * Traduz um erro de domínio para o status HTTP correspondente.
 *
 * Este é o único ponto do projeto onde regras de negócio viram códigos HTTP —
 * o domínio continua sem saber que a web existe.
 *
 *   ValidacaoError      -> 400 Bad Request
 *   NaoEncontradoError  -> 404 Not Found
 *   RegraDeNegocioError -> 409 Conflict  (inclui o bloqueio por limite atingido)
 *   qualquer outro      -> 500 Internal Server Error
 */
function tratarErro(erro, res) {
  if (erro instanceof ValidacaoError) {
    return res.status(400).json({ erro: erro.message });
  }

  if (erro instanceof NaoEncontradoError) {
    return res.status(404).json({ erro: erro.message });
  }

  if (erro instanceof RegraDeNegocioError) {
    return res.status(409).json({ erro: erro.message });
  }

  console.error('[erro inesperado]', erro);
  return res.status(500).json({ erro: 'Erro interno do servidor.' });
}

module.exports = tratarErro;
