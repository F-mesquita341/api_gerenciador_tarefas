/**
 * Enumeração dos status possíveis de uma tarefa.
 *
 * Vive no domínio porque é uma regra de negócio: é o domínio que decide
 * quais estados existem, não o banco de dados nem o framework HTTP.
 */
const StatusTarefa = Object.freeze({
  PENDENTE: 'PENDENTE',
  EM_ANDAMENTO: 'EM_ANDAMENTO',
  CONCLUIDA: 'CONCLUIDA',
});

/** @returns {string[]} lista de status válidos */
function valoresDeStatus() {
  return Object.values(StatusTarefa);
}

/** @returns {boolean} se o valor informado é um status conhecido */
function statusValido(status) {
  return valoresDeStatus().includes(status);
}

module.exports = { StatusTarefa, valoresDeStatus, statusValido };
