const DomainError = require('./DomainError');

/** O recurso solicitado não existe no repositório. */
class NaoEncontradoError extends DomainError {}

module.exports = NaoEncontradoError;
