const app = require('./app');
const { sincronizar } = require('./infrastructure/database');

const PORTA = process.env.PORT || 3000;

/**
 * Ponto de entrada da aplicação.
 *
 * O enunciado é explícito: o Sequelize precisa sincronizar com o banco ANTES
 * de o servidor começar a escutar a porta HTTP.
 */
async function iniciarServidor() {
  try {
    await sincronizar();
    console.log('[banco] sincronizado com sucesso.');

    app.listen(PORTA, () => {
      console.log(`[servidor] API do Gerenciador de Tarefas ouvindo em http://localhost:${PORTA}`);
    });
  } catch (erro) {
    console.error('[servidor] falha ao iniciar:', erro);
    process.exit(1);
  }
}

iniciarServidor();
