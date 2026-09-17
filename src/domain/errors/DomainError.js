/**
 * Erro base do domínio.
 *
 * Todos os erros de negócio herdam daqui. Isso permite que a camada de
 * interface distinga "erro esperado de negócio" de "bug inesperado" sem que o
 * domínio precise conhecer HTTP.
 */
class DomainError extends Error {
  constructor(mensagem) {
    super(mensagem);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = DomainError;
