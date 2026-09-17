const { StatusTarefa } = require('../../../domain/entities/StatusTarefa');
const NaoEncontradoError = require('../../../domain/errors/NaoEncontradoError');
const RegraDeNegocioError = require('../../../domain/errors/RegraDeNegocioError');

/**
 * Quantas tarefas um mesmo usuário pode manter EM_ANDAMENTO ao mesmo tempo.
 * É a regra de negócio complexa exigida pela atividade.
 */
const LIMITE_TAREFAS_EM_ANDAMENTO = 5;

/**
 * Caso de uso: iniciar uma tarefa.
 *
 * Fluxo:
 *   1. localiza a tarefa (é dela que sai o usuário dono);
 *   2. pergunta ao repositório quantas tarefas desse usuário já estão
 *      EM_ANDAMENTO;
 *   3. se já houver 5 ou mais, barra a operação com RegraDeNegocioError;
 *   4. caso contrário, delega a troca de status para a ENTIDADE (tarefa.iniciar())
 *      e manda o repositório salvar.
 *
 * Note a divisão de papéis: o limite por usuário é uma regra de aplicação
 * (depende de consultar outras tarefas), enquanto "de qual status posso sair"
 * é uma regra da própria entidade.
 */
class IniciarTarefaService {
  constructor(tarefaRepository) {
    this.tarefaRepository = tarefaRepository;
  }

  async executar(id) {
    const tarefa = await this.tarefaRepository.buscarPorId(id);

    if (!tarefa) {
      throw new NaoEncontradoError(`Tarefa ${id} não encontrada.`);
    }

    const emAndamento = await this.tarefaRepository.contarPorUsuarioEStatus(
      tarefa.usuarioId,
      StatusTarefa.EM_ANDAMENTO
    );

    if (emAndamento >= LIMITE_TAREFAS_EM_ANDAMENTO) {
      throw new RegraDeNegocioError(
        `Limite atingido: o usuário ${tarefa.usuarioId} já possui ${emAndamento} tarefas ` +
          `com status ${StatusTarefa.EM_ANDAMENTO} e o máximo permitido é ` +
          `${LIMITE_TAREFAS_EM_ANDAMENTO}. Conclua uma tarefa antes de iniciar outra.`
      );
    }

    tarefa.iniciar();

    return this.tarefaRepository.salvar(tarefa);
  }
}

module.exports = IniciarTarefaService;
module.exports.LIMITE_TAREFAS_EM_ANDAMENTO = LIMITE_TAREFAS_EM_ANDAMENTO;
