const express = require('express');
const swaggerUi = require('swagger-ui-express');

const { UsuarioModel, TarefaModel } = require('./infrastructure/database');
const TarefaRepository = require('./infrastructure/repositories/TarefaRepository');
const UsuarioRepository = require('./infrastructure/repositories/UsuarioRepository');

const ListarTarefasService = require('./application/services/tarefa/ListarTarefasService');
const BuscarTarefaService = require('./application/services/tarefa/BuscarTarefaService');
const CriarTarefaService = require('./application/services/tarefa/CriarTarefaService');
const AtualizarTarefaService = require('./application/services/tarefa/AtualizarTarefaService');
const ExcluirTarefaService = require('./application/services/tarefa/ExcluirTarefaService');
const IniciarTarefaService = require('./application/services/tarefa/IniciarTarefaService');
const ConcluirTarefaService = require('./application/services/tarefa/ConcluirTarefaService');
const ListarTarefasDoUsuarioService = require('./application/services/tarefa/ListarTarefasDoUsuarioService');
const CriarUsuarioService = require('./application/services/usuario/CriarUsuarioService');
const ListarUsuariosService = require('./application/services/usuario/ListarUsuariosService');

const TarefaController = require('./interfaces/controllers/TarefaController');
const UsuarioController = require('./interfaces/controllers/UsuarioController');
const tarefaRoutes = require('./interfaces/routes/tarefaRoutes');
const usuarioRoutes = require('./interfaces/routes/usuarioRoutes');

/**
 * Composition root.
 *
 * Aqui todas as classes são instanciadas MANUALMENTE, de dentro para fora:
 *
 *   models -> repositories -> services -> controllers -> rotas -> app Express
 *
 * Nenhum container mágico: a montagem das dependências fica explícita e
 * visível, que é exatamente o que a atividade pede.
 */

// 1) Repositórios recebem os models do Sequelize
const tarefaRepository = new TarefaRepository(TarefaModel);
const usuarioRepository = new UsuarioRepository(UsuarioModel);

// 2) Serviços (casos de uso) recebem os repositórios
const listarTarefasService = new ListarTarefasService(tarefaRepository);
const buscarTarefaService = new BuscarTarefaService(tarefaRepository);
const criarTarefaService = new CriarTarefaService(tarefaRepository, usuarioRepository);
const atualizarTarefaService = new AtualizarTarefaService(tarefaRepository);
const excluirTarefaService = new ExcluirTarefaService(tarefaRepository);
const iniciarTarefaService = new IniciarTarefaService(tarefaRepository);
const concluirTarefaService = new ConcluirTarefaService(tarefaRepository);
const listarTarefasDoUsuarioService = new ListarTarefasDoUsuarioService(
  tarefaRepository,
  usuarioRepository
);
const criarUsuarioService = new CriarUsuarioService(usuarioRepository);
const listarUsuariosService = new ListarUsuariosService(usuarioRepository);

// 3) Controllers recebem os serviços
const tarefaController = new TarefaController({
  listarTarefasService,
  buscarTarefaService,
  criarTarefaService,
  atualizarTarefaService,
  excluirTarefaService,
  iniciarTarefaService,
  concluirTarefaService,
});

const usuarioController = new UsuarioController({
  criarUsuarioService,
  listarUsuariosService,
  listarTarefasDoUsuarioService,
});

// 4) Aplicação Express recebe as rotas já conectadas aos controllers
const app = express();

app.use(express.json());

app.get('/', (req, res) => {
  res.status(200).json({
    api: 'Gerenciador de Tarefas',
    versao: '1.0.0',
    documentacao: '/api-docs',
    rotas: ['/usuarios', '/usuarios/:id/tarefas', '/tarefas', '/tarefas/:id/iniciar'],
  });
});

app.use('/usuarios', usuarioRoutes(usuarioController));
app.use('/tarefas', tarefaRoutes(tarefaController));

// Documentação interativa. O swagger-output.json é gerado por `npm run swagger`
// e vem versionado, mas a API não pode depender dele para subir: se o arquivo
// faltar, /api-docs explica o que fazer e o resto continua funcionando.
let documentacao = null;

try {
  documentacao = require('../swagger-output.json');
} catch {
  console.warn(
    '[swagger] swagger-output.json não encontrado. Rode `npm run swagger` para gerá-lo.'
  );
}

if (documentacao) {
  app.use(
    '/api-docs',
    swaggerUi.serve,
    swaggerUi.setup(documentacao, {
      customSiteTitle: 'API de Gerenciamento de Tarefas - Documentação',
      // deepLinking dá a cada endpoint uma URL própria (ex.:
      // /api-docs/#/Tarefas/post_tarefas__id__iniciar), útil para apontar
      // direto para a rota que se quer mostrar.
      swaggerOptions: { deepLinking: true },
    })
  );
} else {
  app.use('/api-docs', (req, res) => {
    res.status(503).json({
      erro: 'Documentação ainda não gerada. Execute `npm run swagger` e reinicie o servidor.',
    });
  });
}

// Rota inexistente
app.use((req, res) => {
  res.status(404).json({ erro: `Rota não encontrada: ${req.method} ${req.originalUrl}` });
});

// Rede de segurança: JSON malformado no corpo e qualquer erro não tratado
app.use((erro, req, res, _next) => {
  if (erro.type === 'entity.parse.failed') {
    return res.status(400).json({ erro: 'Corpo da requisição não é um JSON válido.' });
  }

  console.error('[erro inesperado]', erro);
  return res.status(500).json({ erro: 'Erro interno do servidor.' });
});

module.exports = app;
