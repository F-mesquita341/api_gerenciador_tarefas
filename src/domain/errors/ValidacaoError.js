const DomainError = require('./DomainError');

/** Dados de entrada inválidos (título vazio, e-mail ausente, status desconhecido...). */
class ValidacaoError extends DomainError {}

module.exports = ValidacaoError;
