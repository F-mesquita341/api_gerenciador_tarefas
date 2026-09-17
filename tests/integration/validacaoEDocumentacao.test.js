const request = require('supertest');

const app = require('../../src/app');
const { sincronizar, fecharConexao } = require('../../src/infrastructure/database');

/**
 * Testes da camada acrescentada na Atividade da Aula 09:
 * validação estrutural com Zod e documentação Swagger em /api-docs.
 */
describe('Validação de entrada com Zod', () => {
  let usuarioId;

  beforeAll(async () => {
    await sincronizar({ force: true });

    const usuario = await request(app)
      .post('/usuarios')
      .send({ nome: 'Carla Dias', email: 'carla.dias@exemplo.com' });

    usuarioId = usuario.body.id;
  });

  afterAll(async () => {
    await fecharConexao();
  });

  describe('POST /usuarios', () => {
    it('recusa nome com menos de 3 caracteres', async () => {
      const resposta = await request(app)
        .post('/usuarios')
        .send({ nome: 'Ab', email: 'ab@exemplo.com' });

      expect(resposta.status).toBe(400);
      expect(resposta.body.erro).toBe('Dados inválidos.');
      expect(resposta.body.detalhes).toContainEqual({
        campo: 'nome',
        mensagem: 'O nome deve ter no mínimo 3 caracteres.',
      });
    });

    it('recusa e-mail em formato inválido', async () => {
      const resposta = await request(app)
        .post('/usuarios')
        .send({ nome: 'Nome Válido', email: 'isto-nao-e-um-email' });

      expect(resposta.status).toBe(400);
      expect(resposta.body.detalhes).toContainEqual({
        campo: 'email',
        mensagem: 'E-mail em formato inválido.',
      });
    });

    it('lista todos os campos reprovados de uma só vez', async () => {
      const resposta = await request(app).post('/usuarios').send({ nome: 'Ab', email: 'invalido' });

      expect(resposta.status).toBe(400);
      expect(resposta.body.detalhes).toHaveLength(2);
      expect(resposta.body.detalhes.map((d) => d.campo).sort()).toEqual(['email', 'nome']);
    });

    it('recusa corpo completamente vazio', async () => {
      const resposta = await request(app).post('/usuarios').send({});

      expect(resposta.status).toBe(400);
      expect(resposta.body.detalhes.map((d) => d.campo).sort()).toEqual(['email', 'nome']);
    });

    it('aceita dados válidos e normaliza o corpo', async () => {
      const resposta = await request(app)
        .post('/usuarios')
        .send({ nome: '  Diego Alves  ', email: 'diego.alves@exemplo.com' });

      expect(resposta.status).toBe(201);
      expect(resposta.body.nome).toBe('Diego Alves');
    });

    it('descarta campos desconhecidos em vez de persisti-los', async () => {
      const resposta = await request(app)
        .post('/usuarios')
        .send({ nome: 'Elisa Rocha', email: 'elisa.rocha@exemplo.com', admin: true });

      expect(resposta.status).toBe(201);
      expect(resposta.body.admin).toBeUndefined();
    });
  });

  describe('POST /tarefas', () => {
    it('recusa título vazio ou só com espaços', async () => {
      const resposta = await request(app).post('/tarefas').send({ titulo: '   ', usuarioId });

      expect(resposta.status).toBe(400);
      expect(resposta.body.detalhes).toContainEqual({
        campo: 'titulo',
        mensagem: 'O título da tarefa é obrigatório.',
      });
    });

    it('recusa usuarioId não numérico', async () => {
      const resposta = await request(app)
        .post('/tarefas')
        .send({ titulo: 'Tarefa válida', usuarioId: 'abc' });

      expect(resposta.status).toBe(400);
      expect(resposta.body.detalhes).toContainEqual({
        campo: 'usuarioId',
        mensagem: 'O ID do usuário é obrigatório.',
      });
    });

    it('recusa usuarioId negativo', async () => {
      const resposta = await request(app)
        .post('/tarefas')
        .send({ titulo: 'Tarefa válida', usuarioId: -5 });

      expect(resposta.status).toBe(400);
      expect(resposta.body.detalhes).toContainEqual({
        campo: 'usuarioId',
        mensagem: 'O ID do usuário deve ser um número positivo.',
      });
    });

    it('aceita usuarioId como texto, convertendo para número', async () => {
      const resposta = await request(app)
        .post('/tarefas')
        .send({ titulo: 'Tarefa com id em texto', usuarioId: String(usuarioId) });

      expect(resposta.status).toBe(201);
      expect(resposta.body.usuarioId).toBe(usuarioId);
    });

    it('deixa a validação de existência do usuário para o caso de uso', async () => {
      // O Zod aprova o formato; quem sabe que o usuário 9999 não existe é o
      // serviço, que responde 404. As duas camadas são complementares.
      const resposta = await request(app)
        .post('/tarefas')
        .send({ titulo: 'Tarefa órfã', usuarioId: 9999 });

      expect(resposta.status).toBe(404);
    });
  });

  describe('Rotas sem corpo continuam sem validação estrutural', () => {
    it('POST /tarefas/:id/iniciar não exige corpo', async () => {
      const criada = await request(app)
        .post('/tarefas')
        .send({ titulo: 'Tarefa para iniciar', usuarioId });

      const resposta = await request(app).post(`/tarefas/${criada.body.id}/iniciar`);

      expect(resposta.status).toBe(200);
      expect(resposta.body.status).toBe('EM_ANDAMENTO');
    });
  });
});

describe('Documentação Swagger', () => {
  it('serve a interface em /api-docs', async () => {
    const resposta = await request(app).get('/api-docs/');

    expect(resposta.status).toBe(200);
    expect(resposta.text).toContain('swagger-ui');
  });

  describe('conteúdo do swagger-output.json', () => {
    const documentacao = require('../../swagger-output.json');

    it('declara o título e o host exigidos pela atividade', () => {
      expect(documentacao.info.title).toBe('API de Gerenciamento de Tarefas');
      expect(documentacao.host).toBe('localhost:3000');
      expect(documentacao.schemes).toEqual(['http']);
    });

    it('agrupa as rotas nas tags Usuários e Tarefas', () => {
      expect(documentacao.tags.map((t) => t.name)).toEqual(['Usuários', 'Tarefas']);
    });

    it('documenta o corpo esperado na criação de tarefas', () => {
      const corpo = documentacao.paths['/tarefas/'].post.parameters.find((p) => p.in === 'body');

      expect(corpo.required).toBe(true);
      expect(corpo.schema.$ref).toBe('#/definitions/NovaTarefa');
      expect(documentacao.definitions.NovaTarefa.required).toEqual(['titulo', 'usuarioId']);
    });

    it('documenta a regra de negócio do limite na rota de iniciar', () => {
      const respostas = documentacao.paths['/tarefas/{id}/iniciar'].post.responses;

      expect(respostas['200'].description).toBe('Tarefa iniciada com sucesso.');
      expect(respostas['400'].description).toContain(
        'Retornado quando o usuário atinge o limite máximo de 5 tarefas com status EM_ANDAMENTO.'
      );
    });

    it('documenta o 400 de falha de validação estrutural nas rotas de POST', () => {
      expect(documentacao.paths['/tarefas/'].post.responses['400'].schema.$ref).toBe(
        '#/definitions/ErroDeValidacao'
      );
      expect(documentacao.paths['/usuarios/'].post.responses['400'].schema.$ref).toBe(
        '#/definitions/ErroDeValidacao'
      );
    });
  });
});
