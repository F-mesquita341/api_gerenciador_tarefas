/**
 * Geração automática da documentação Swagger.
 *
 * O swagger-autogen lê estaticamente o arquivo de rotas, descobre os endpoints
 * e combina o que encontrou com as informações declaradas abaixo, produzindo o
 * swagger-output.json que o swagger-ui-express serve em /api-docs.
 *
 * Uso: npm run swagger
 */
const swaggerAutogen = require('swagger-autogen')();

const doc = {
  info: {
    title: 'API de Gerenciamento de Tarefas',
    description:
      'API RESTful construída com Clean Architecture (Express + Sequelize + SQLite). ' +
      'Gerencia usuários e suas tarefas, aplicando a regra de negócio que limita cada ' +
      'usuário a no máximo 5 tarefas simultâneas com status EM_ANDAMENTO.',
    version: '1.0.0',
  },
  host: 'localhost:3000',
  basePath: '/',
  schemes: ['http'],
  consumes: ['application/json'],
  produces: ['application/json'],

  tags: [
    {
      name: 'Usuários',
      description: 'Cadastro e consulta de usuários, os donos das tarefas.',
    },
    {
      name: 'Tarefas',
      description:
        'CRUD de tarefas e as transições de estado PENDENTE -> EM_ANDAMENTO -> CONCLUIDA.',
    },
  ],

  // Schemas reutilizáveis: a interface mostra um modelo nomeado em vez de um
  // JSON solto repetido em cada rota.
  definitions: {
    Usuario: {
      id: 1,
      nome: 'Ana Souza',
      email: 'ana.souza@exemplo.com',
    },

    NovoUsuario: {
      $nome: 'Ana Souza',
      $email: 'ana.souza@exemplo.com',
    },

    Tarefa: {
      id: 1,
      titulo: 'Modelar o banco de dados',
      descricao: 'Definir as tabelas de usuários e tarefas',
      status: 'PENDENTE',
      usuarioId: 1,
    },

    NovaTarefa: {
      $titulo: 'Modelar o banco de dados',
      descricao: 'Definir as tabelas de usuários e tarefas',
      $usuarioId: 1,
    },

    AtualizarTarefa: {
      titulo: 'Modelar o banco de dados - revisado',
      descricao: 'Nova descrição da tarefa',
    },

    ListaDeTarefas: [
      {
        id: 1,
        titulo: 'Modelar o banco de dados',
        descricao: 'Definir as tabelas de usuários e tarefas',
        status: 'PENDENTE',
        usuarioId: 1,
      },
    ],

    ListaDeUsuarios: [
      {
        id: 1,
        nome: 'Ana Souza',
        email: 'ana.souza@exemplo.com',
      },
    ],

    // Erro de negócio ou de domínio: mensagem única.
    Erro: {
      erro: 'Tarefa 42 não encontrada.',
    },

    // Erro de validação estrutural (Zod): lista os campos reprovados.
    ErroDeValidacao: {
      erro: 'Dados inválidos.',
      detalhes: [
        {
          campo: 'titulo',
          mensagem: 'O título da tarefa é obrigatório.',
        },
      ],
    },
  },
};

const outputFile = './swagger-output.json';
const endpointsFiles = ['./src/app.js'];

swaggerAutogen(outputFile, endpointsFiles, doc).then(() => {
  console.log('[swagger] swagger-output.json gerado com sucesso.');
});
