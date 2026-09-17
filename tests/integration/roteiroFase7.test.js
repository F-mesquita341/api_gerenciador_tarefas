const request = require('supertest');

const app = require('../../src/app');
const { sincronizar, fecharConexao } = require('../../src/infrastructure/database');
const {
  LIMITE_TAREFAS_EM_ANDAMENTO,
} = require('../../src/application/services/tarefa/IniciarTarefaService');

/**
 * Roteiro de validação exigido pela Fase 7 da atividade, automatizado.
 *
 * Os testes rodam contra um SQLite em memória (NODE_ENV=test é definido pelo
 * Jest), então não encostam no database.sqlite de desenvolvimento.
 *
 * Os passos são executados em ordem porque contam uma história única:
 * criar usuário -> criar tarefas -> listar -> iniciar até bater o limite ->
 * alterar -> excluir.
 */
describe('Roteiro de validação da Fase 7', () => {
  let usuarioId;
  let brunoId;
  const tarefaIds = [];

  beforeAll(async () => {
    await sincronizar({ force: true });
  });

  afterAll(async () => {
    await fecharConexao();
  });

  // ------------------------------------------------------------------ passo 1
  describe('1) POST /usuarios - criação de um usuário válido', () => {
    it('cria o usuário e devolve 201', async () => {
      const resposta = await request(app)
        .post('/usuarios')
        .send({ nome: 'Ana Souza', email: 'ana.souza@exemplo.com' });

      expect(resposta.status).toBe(201);
      expect(resposta.body).toMatchObject({ nome: 'Ana Souza', email: 'ana.souza@exemplo.com' });
      expect(resposta.body.id).toBeDefined();

      usuarioId = resposta.body.id;
    });

    it('recusa usuário sem e-mail com 400', async () => {
      // Quem barra agora é o middleware do Zod, antes do controller, por isso a
      // resposta traz o detalhamento por campo em vez de uma mensagem única.
      const resposta = await request(app).post('/usuarios').send({ nome: 'Sem email' });

      expect(resposta.status).toBe(400);
      expect(resposta.body.erro).toBe('Dados inválidos.');
      expect(resposta.body.detalhes).toContainEqual({
        campo: 'email',
        mensagem: 'O e-mail é obrigatório.',
      });
    });

    it('recusa e-mail duplicado com 400', async () => {
      const resposta = await request(app)
        .post('/usuarios')
        .send({ nome: 'Outra Ana', email: 'ana.souza@exemplo.com' });

      expect(resposta.status).toBe(400);
    });
  });

  // ------------------------------------------------------------------ passo 2
  describe('2) POST /tarefas - tarefas vinculadas ao usuário', () => {
    it('cria uma tarefa a mais que o limite, todas PENDENTE', async () => {
      for (let i = 1; i <= LIMITE_TAREFAS_EM_ANDAMENTO + 1; i += 1) {
        const resposta = await request(app)
          .post('/tarefas')
          .send({ titulo: `Tarefa ${i}`, descricao: `Descrição da tarefa ${i}`, usuarioId });

        expect(resposta.status).toBe(201);
        expect(resposta.body.status).toBe('PENDENTE');
        expect(resposta.body.usuarioId).toBe(usuarioId);

        tarefaIds.push(resposta.body.id);
      }

      expect(tarefaIds).toHaveLength(LIMITE_TAREFAS_EM_ANDAMENTO + 1);
    });

    it('recusa tarefa sem título com 400', async () => {
      const resposta = await request(app).post('/tarefas').send({ usuarioId });

      expect(resposta.status).toBe(400);
      expect(resposta.body.erro).toBe('Dados inválidos.');
      expect(resposta.body.detalhes).toContainEqual({
        campo: 'titulo',
        mensagem: 'O título da tarefa é obrigatório.',
      });
    });

    it('recusa tarefa de usuário inexistente com 404', async () => {
      const resposta = await request(app)
        .post('/tarefas')
        .send({ titulo: 'Tarefa orfã', usuarioId: 9999 });

      expect(resposta.status).toBe(404);
    });
  });

  // ------------------------------------------------------------------ passo 3
  describe('3) GET /tarefas - listagem geral', () => {
    it('lista todas as tarefas cadastradas', async () => {
      const resposta = await request(app).get('/tarefas');

      expect(resposta.status).toBe(200);
      expect(Array.isArray(resposta.body)).toBe(true);
      expect(resposta.body).toHaveLength(LIMITE_TAREFAS_EM_ANDAMENTO + 1);
    });

    it('lista as tarefas de um usuário específico', async () => {
      const resposta = await request(app).get(`/usuarios/${usuarioId}/tarefas`);

      expect(resposta.status).toBe(200);
      expect(resposta.body).toHaveLength(LIMITE_TAREFAS_EM_ANDAMENTO + 1);
    });
  });

  // ------------------------------------------------------------------ passo 4
  describe('4) POST /tarefas/:id/iniciar - regra de negócio', () => {
    it('inicia tarefas até o limite, mudando o status para EM_ANDAMENTO', async () => {
      for (let i = 0; i < LIMITE_TAREFAS_EM_ANDAMENTO; i += 1) {
        const resposta = await request(app).post(`/tarefas/${tarefaIds[i]}/iniciar`);

        expect(resposta.status).toBe(200);
        expect(resposta.body.status).toBe('EM_ANDAMENTO');
      }
    });

    it('bloqueia a tarefa seguinte porque o limite foi atingido', async () => {
      const idBloqueado = tarefaIds[LIMITE_TAREFAS_EM_ANDAMENTO];
      const resposta = await request(app).post(`/tarefas/${idBloqueado}/iniciar`);

      expect(resposta.status).toBe(400);
      expect(resposta.body.erro).toMatch(/Limite atingido/i);
      expect(resposta.body.erro).toContain(String(LIMITE_TAREFAS_EM_ANDAMENTO));

      // e o status da tarefa bloqueada continua intacto
      const conferencia = await request(app).get(`/tarefas/${idBloqueado}`);
      expect(conferencia.body.status).toBe('PENDENTE');
    });

    it('libera uma vaga quando uma tarefa é concluída', async () => {
      const conclusao = await request(app).post(`/tarefas/${tarefaIds[0]}/concluir`);
      expect(conclusao.status).toBe(200);
      expect(conclusao.body.status).toBe('CONCLUIDA');

      const resposta = await request(app).post(
        `/tarefas/${tarefaIds[LIMITE_TAREFAS_EM_ANDAMENTO]}/iniciar`
      );

      expect(resposta.status).toBe(200);
      expect(resposta.body.status).toBe('EM_ANDAMENTO');
    });

    it('recusa iniciar uma tarefa inexistente com 404', async () => {
      const resposta = await request(app).post('/tarefas/9999/iniciar');

      expect(resposta.status).toBe(404);
    });

    it('conta o limite por usuário, não globalmente', async () => {
      // A Ana já está no limite; o Bruno começa do zero e deve conseguir iniciar.
      const outro = await request(app)
        .post('/usuarios')
        .send({ nome: 'Bruno Lima', email: 'bruno.lima@exemplo.com' });

      brunoId = outro.body.id;

      const tarefaDoBruno = await request(app)
        .post('/tarefas')
        .send({ titulo: 'Primeira do Bruno', usuarioId: brunoId });

      const resposta = await request(app).post(`/tarefas/${tarefaDoBruno.body.id}/iniciar`);

      expect(resposta.status).toBe(200);
      expect(resposta.body.status).toBe('EM_ANDAMENTO');
    });

    it('recusa iniciar uma tarefa já concluída, mesmo com vaga disponível', async () => {
      // Usa o Bruno justamente porque ele tem folga no limite: assim o 400 vem
      // da transição inválida da entidade, e não da regra de capacidade.
      const criada = await request(app)
        .post('/tarefas')
        .send({ titulo: 'Segunda do Bruno', usuarioId: brunoId });

      await request(app).post(`/tarefas/${criada.body.id}/iniciar`);
      await request(app).post(`/tarefas/${criada.body.id}/concluir`);

      const resposta = await request(app).post(`/tarefas/${criada.body.id}/iniciar`);

      expect(resposta.status).toBe(400);
      expect(resposta.body.erro).toMatch(/CONCLUIDA/);
    });

    it('recusa concluir uma tarefa que ainda está PENDENTE', async () => {
      const criada = await request(app)
        .post('/tarefas')
        .send({ titulo: 'Terceira do Bruno', usuarioId: brunoId });

      const resposta = await request(app).post(`/tarefas/${criada.body.id}/concluir`);

      expect(resposta.status).toBe(400);
      expect(resposta.body.erro).toMatch(/EM_ANDAMENTO/);
    });
  });

  // ------------------------------------------------------------------ passo 5
  describe('5) PUT e DELETE /tarefas/:id', () => {
    const ultimaPosicao = () => tarefaIds[tarefaIds.length - 1];

    it('altera o texto da tarefa', async () => {
      const resposta = await request(app)
        .put(`/tarefas/${ultimaPosicao()}`)
        .send({ titulo: 'Título alterado em sala', descricao: 'Descrição atualizada' });

      expect(resposta.status).toBe(200);
      expect(resposta.body.titulo).toBe('Título alterado em sala');
      expect(resposta.body.descricao).toBe('Descrição atualizada');
    });

    it('recusa alterar tarefa inexistente com 404', async () => {
      const resposta = await request(app).put('/tarefas/9999').send({ titulo: 'Fantasma' });

      expect(resposta.status).toBe(404);
    });

    it('recusa alterar para um título vazio com 400', async () => {
      const resposta = await request(app).put(`/tarefas/${ultimaPosicao()}`).send({ titulo: '  ' });

      expect(resposta.status).toBe(400);
    });

    it('apaga a tarefa e ela deixa de existir no banco', async () => {
      const id = ultimaPosicao();

      const exclusao = await request(app).delete(`/tarefas/${id}`);
      expect(exclusao.status).toBe(204);

      const conferencia = await request(app).get(`/tarefas/${id}`);
      expect(conferencia.status).toBe(404);
    });

    it('recusa apagar tarefa inexistente com 404', async () => {
      const resposta = await request(app).delete('/tarefas/9999');

      expect(resposta.status).toBe(404);
    });
  });
});
