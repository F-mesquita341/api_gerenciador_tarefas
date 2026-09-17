const { StatusTarefa, statusValido, valoresDeStatus } = require('./StatusTarefa');
const ValidacaoError = require('../errors/ValidacaoError');
const RegraDeNegocioError = require('../errors/RegraDeNegocioError');

/**
 * Entidade Tarefa — objeto puro de negócio.
 *
 * Esta classe é o coração da aplicação: não importa Express, não importa
 * Sequelize e não sabe que existe um banco de dados. Ela só conhece as regras
 * da própria tarefa.
 *
 * Transições de estado permitidas:
 *
 *   PENDENTE --iniciar()--> EM_ANDAMENTO --concluir()--> CONCLUIDA
 *
 * Qualquer tentativa de pular etapas lança RegraDeNegocioError.
 */
class Tarefa {
  constructor({ id = null, titulo, descricao = null, status = StatusTarefa.PENDENTE, usuarioId }) {
    Tarefa.validarTitulo(titulo);

    if (usuarioId === undefined || usuarioId === null || usuarioId === '') {
      throw new ValidacaoError('A tarefa deve estar vinculada a um usuário.');
    }

    if (!statusValido(status)) {
      throw new ValidacaoError(
        `Status inválido: "${status}". Valores aceitos: ${valoresDeStatus().join(', ')}.`
      );
    }

    this.id = id;
    this.titulo = String(titulo).trim();
    this.descricao =
      descricao === null || descricao === undefined ? null : String(descricao).trim();
    this.status = status;
    this.usuarioId = usuarioId;
  }

  /** Garante que o título é obrigatório e não é só espaço em branco. */
  static validarTitulo(titulo) {
    if (titulo === undefined || titulo === null || String(titulo).trim() === '') {
      throw new ValidacaoError('O título da tarefa é obrigatório.');
    }
  }

  /**
   * Coloca a tarefa em andamento.
   * Só é possível iniciar uma tarefa que esteja PENDENTE.
   */
  iniciar() {
    if (this.status !== StatusTarefa.PENDENTE) {
      throw new RegraDeNegocioError(
        `Não é possível iniciar uma tarefa com status ${this.status}. ` +
          `Apenas tarefas ${StatusTarefa.PENDENTE} podem ser iniciadas.`
      );
    }

    this.status = StatusTarefa.EM_ANDAMENTO;
    return this;
  }

  /**
   * Conclui a tarefa.
   * Só é possível concluir uma tarefa que já esteja EM_ANDAMENTO — pular de
   * PENDENTE direto para CONCLUIDA é uma transição inválida.
   */
  concluir() {
    if (this.status !== StatusTarefa.EM_ANDAMENTO) {
      throw new RegraDeNegocioError(
        `Não é possível concluir uma tarefa com status ${this.status}. ` +
          `A tarefa precisa estar ${StatusTarefa.EM_ANDAMENTO}.`
      );
    }

    this.status = StatusTarefa.CONCLUIDA;
    return this;
  }

  /** Altera os dados descritivos da tarefa, revalidando o título. */
  atualizar({ titulo, descricao }) {
    if (titulo !== undefined) {
      Tarefa.validarTitulo(titulo);
      this.titulo = String(titulo).trim();
    }

    if (descricao !== undefined) {
      this.descricao = descricao === null ? null : String(descricao).trim();
    }

    return this;
  }

  /** @returns {boolean} se a tarefa está em andamento */
  estaEmAndamento() {
    return this.status === StatusTarefa.EM_ANDAMENTO;
  }

  /** Representação serializável — é o que o controller devolve no corpo HTTP. */
  toJSON() {
    return {
      id: this.id,
      titulo: this.titulo,
      descricao: this.descricao,
      status: this.status,
      usuarioId: this.usuarioId,
    };
  }
}

module.exports = Tarefa;
