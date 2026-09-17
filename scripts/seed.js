/**
 * Script de carga inicial do banco.
 *
 * Deixa o cenário pronto para a demonstração da Fase 7: um usuário com o limite
 * de tarefas em andamento já esgotado e uma tarefa PENDENTE sobrando, para que
 * o bloqueio possa ser demonstrado em uma única requisição.
 *
 * Repare que o seed NÃO escreve SQL: ele usa os mesmos repositórios e casos de
 * uso da API, o que serve como mais uma prova de que a arquitetura funciona
 * fora do contexto HTTP.
 *
 * Uso: npm run seed
 */
const {
  sincronizar,
  fecharConexao,
  UsuarioModel,
  TarefaModel,
} = require('../src/infrastructure/database');

const TarefaRepository = require('../src/infrastructure/repositories/TarefaRepository');
const UsuarioRepository = require('../src/infrastructure/repositories/UsuarioRepository');
const CriarUsuarioService = require('../src/application/services/usuario/CriarUsuarioService');
const CriarTarefaService = require('../src/application/services/tarefa/CriarTarefaService');
const IniciarTarefaService = require('../src/application/services/tarefa/IniciarTarefaService');

const LIMITE = IniciarTarefaService.LIMITE_TAREFAS_EM_ANDAMENTO;

const TITULOS = [
  'Levantar requisitos do sistema',
  'Modelar o banco de dados',
  'Implementar a camada de domínio',
  'Escrever os casos de uso',
  'Montar os controllers e as rotas',
  'Preparar a apresentação em sala',
  'Revisar a documentação do projeto',
];

async function semear() {
  // `force: true` recria as tabelas: o seed sempre parte de um banco limpo.
  await sincronizar({ force: true });

  const usuarioRepository = new UsuarioRepository(UsuarioModel);
  const tarefaRepository = new TarefaRepository(TarefaModel);

  const criarUsuario = new CriarUsuarioService(usuarioRepository);
  const criarTarefa = new CriarTarefaService(tarefaRepository, usuarioRepository);
  const iniciarTarefa = new IniciarTarefaService(tarefaRepository);

  const ana = await criarUsuario.executar({ nome: 'Ana Souza', email: 'ana.souza@exemplo.com' });
  const bruno = await criarUsuario.executar({
    nome: 'Bruno Lima',
    email: 'bruno.lima@exemplo.com',
  });

  console.log(`[seed] usuários criados: #${ana.id} ${ana.nome} e #${bruno.id} ${bruno.nome}`);

  const tarefasDaAna = [];
  for (const titulo of TITULOS) {
    tarefasDaAna.push(await criarTarefa.executar({ titulo, usuarioId: ana.id }));
  }

  // Esgota o limite da Ana: as LIMITE primeiras tarefas vão para EM_ANDAMENTO.
  for (let i = 0; i < LIMITE; i += 1) {
    await iniciarTarefa.executar(tarefasDaAna[i].id);
  }

  const pendentes = tarefasDaAna.slice(LIMITE);

  console.log(`[seed] ${LIMITE} tarefas da Ana estão EM_ANDAMENTO (limite esgotado).`);
  console.log(
    `[seed] tarefas ainda PENDENTES da Ana: ${pendentes.map((t) => `#${t.id}`).join(', ')}`
  );
  console.log('');
  console.log('Para ver o bloqueio da regra de negócio, suba a API (npm start) e chame:');
  console.log(`  POST http://localhost:3000/tarefas/${pendentes[0].id}/iniciar`);
  console.log('  -> deve responder 400 com a mensagem de limite atingido.');
}

semear()
  .then(() => fecharConexao())
  .catch(async (erro) => {
    console.error('[seed] falhou:', erro.message);
    await fecharConexao();
    process.exit(1);
  });
