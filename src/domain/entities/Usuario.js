const ValidacaoError = require('../errors/ValidacaoError');

const FORMATO_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Entidade Usuario — objeto puro de negócio, dono das tarefas.
 * Assim como Tarefa, não conhece framework nem banco de dados.
 */
class Usuario {
  constructor({ id = null, nome, email }) {
    if (nome === undefined || nome === null || String(nome).trim() === '') {
      throw new ValidacaoError('O nome do usuário é obrigatório.');
    }

    if (email === undefined || email === null || String(email).trim() === '') {
      throw new ValidacaoError('O e-mail do usuário é obrigatório.');
    }

    const emailNormalizado = String(email).trim().toLowerCase();

    if (!FORMATO_EMAIL.test(emailNormalizado)) {
      throw new ValidacaoError(`E-mail inválido: "${email}".`);
    }

    this.id = id;
    this.nome = String(nome).trim();
    this.email = emailNormalizado;
  }

  toJSON() {
    return {
      id: this.id,
      nome: this.nome,
      email: this.email,
    };
  }
}

module.exports = Usuario;
