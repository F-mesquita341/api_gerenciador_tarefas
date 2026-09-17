const DomainError = require('./DomainError');

/**
 * A operação é sintaticamente válida, mas viola uma regra de negócio:
 * transição de status inválida ou limite de tarefas em andamento atingido.
 */
class RegraDeNegocioError extends DomainError {}

module.exports = RegraDeNegocioError;
