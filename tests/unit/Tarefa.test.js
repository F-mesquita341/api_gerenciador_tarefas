const Tarefa = require('../../src/domain/entities/Tarefa');
const { StatusTarefa } = require('../../src/domain/entities/StatusTarefa');
const ValidacaoError = require('../../src/domain/errors/ValidacaoError');
const RegraDeNegocioError = require('../../src/domain/errors/RegraDeNegocioError');

/**
 * Testes da ENTIDADE pura: nenhum banco, nenhum HTTP.
 * É isto que a Clean Architecture compra — o núcleo é testável sozinho.
 */
describe('Entidade Tarefa', () => {
  describe('construtor', () => {
    it('cria a tarefa com status PENDENTE por padrão', () => {
      const tarefa = new Tarefa({ titulo: 'Estudar', usuarioId: 1 });

      expect(tarefa.status).toBe(StatusTarefa.PENDENTE);
      expect(tarefa.titulo).toBe('Estudar');
      expect(tarefa.usuarioId).toBe(1);
    });

    it('remove espaços em volta do título', () => {
      expect(new Tarefa({ titulo: '  Estudar  ', usuarioId: 1 }).titulo).toBe('Estudar');
    });

    it('exige o título', () => {
      expect(() => new Tarefa({ usuarioId: 1 })).toThrow(ValidacaoError);
      expect(() => new Tarefa({ titulo: '   ', usuarioId: 1 })).toThrow(
        'O título da tarefa é obrigatório.'
      );
    });

    it('exige o vínculo com um usuário', () => {
      expect(() => new Tarefa({ titulo: 'Estudar' })).toThrow(ValidacaoError);
    });

    it('rejeita um status desconhecido', () => {
      expect(() => new Tarefa({ titulo: 'Estudar', usuarioId: 1, status: 'ARQUIVADA' })).toThrow(
        ValidacaoError
      );
    });
  });

  describe('transições de estado', () => {
    it('iniciar() leva de PENDENTE para EM_ANDAMENTO', () => {
      const tarefa = new Tarefa({ titulo: 'Estudar', usuarioId: 1 });

      tarefa.iniciar();

      expect(tarefa.status).toBe(StatusTarefa.EM_ANDAMENTO);
      expect(tarefa.estaEmAndamento()).toBe(true);
    });

    it('concluir() leva de EM_ANDAMENTO para CONCLUIDA', () => {
      const tarefa = new Tarefa({ titulo: 'Estudar', usuarioId: 1 });

      tarefa.iniciar();
      tarefa.concluir();

      expect(tarefa.status).toBe(StatusTarefa.CONCLUIDA);
    });

    it('não deixa iniciar uma tarefa que já está em andamento', () => {
      const tarefa = new Tarefa({ titulo: 'Estudar', usuarioId: 1 });
      tarefa.iniciar();

      expect(() => tarefa.iniciar()).toThrow(RegraDeNegocioError);
    });

    it('não deixa pular de PENDENTE direto para CONCLUIDA', () => {
      const tarefa = new Tarefa({ titulo: 'Estudar', usuarioId: 1 });

      expect(() => tarefa.concluir()).toThrow(RegraDeNegocioError);
      expect(tarefa.status).toBe(StatusTarefa.PENDENTE);
    });

    it('não deixa iniciar uma tarefa já concluída', () => {
      const tarefa = new Tarefa({ titulo: 'Estudar', usuarioId: 1 });
      tarefa.iniciar();
      tarefa.concluir();

      expect(() => tarefa.iniciar()).toThrow(RegraDeNegocioError);
    });
  });

  describe('atualizar()', () => {
    it('altera título e descrição', () => {
      const tarefa = new Tarefa({ titulo: 'Antigo', usuarioId: 1 });

      tarefa.atualizar({ titulo: 'Novo', descricao: 'Detalhes' });

      expect(tarefa.titulo).toBe('Novo');
      expect(tarefa.descricao).toBe('Detalhes');
    });

    it('preserva o campo não informado', () => {
      const tarefa = new Tarefa({ titulo: 'Antigo', descricao: 'Mantida', usuarioId: 1 });

      tarefa.atualizar({ titulo: 'Novo' });

      expect(tarefa.descricao).toBe('Mantida');
    });

    it('continua exigindo um título válido', () => {
      const tarefa = new Tarefa({ titulo: 'Antigo', usuarioId: 1 });

      expect(() => tarefa.atualizar({ titulo: '' })).toThrow(ValidacaoError);
      expect(tarefa.titulo).toBe('Antigo');
    });
  });
});
