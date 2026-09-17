# API Gerenciador de Tarefas

API RESTful construída com **Clean Architecture** em Node.js, usando Express para o transporte
HTTP e Sequelize + SQLite para persistência.

O sistema gerencia duas entidades interligadas — **Usuário** e **Tarefa** — e implementa uma regra
de negócio não trivial: **um usuário não pode ter mais de 5 tarefas em andamento ao mesmo tempo**.

---

## Como rodar

```bash
npm install
```

```bash
npm start
```

A API sobe em `http://localhost:3000`. O Sequelize sincroniza as tabelas **antes** de o servidor
escutar a porta, então o arquivo `database.sqlite` é criado sozinho na primeira execução.

A documentação interativa fica em **`http://localhost:3000/api-docs`**.

### Scripts disponíveis

| Script               | O que faz                                                     |
| -------------------- | ------------------------------------------------------------- |
| `npm start`          | Sobe a API                                                    |
| `npm run dev`        | Regera a documentação e sobe a API com Nodemon                |
| `npm run swagger`    | Gera o `swagger-output.json` a partir das anotações nas rotas |
| `npm test`           | Roda a suíte Jest + Supertest                                 |
| `npm run test:watch` | Testes em modo observação                                     |
| `npm run seed`       | Recria o banco com dados de demonstração                      |
| `npm run lint`       | Verifica o código com ESLint                                  |
| `npm run lint:fix`   | Corrige automaticamente o que for possível                    |
| `npm run format`     | Formata o projeto com Prettier                                |

---

## Arquitetura

A organização das pastas reflete a **Regra de Dependência**: as setas de dependência apontam
sempre para dentro, em direção ao domínio.

```
                 ┌──────────────────────────────────────────┐
   HTTP  ───────▶│ interfaces/   controllers, routes        │
                 │      │                                   │
                 │      ▼                                   │
                 │ application/  services (casos de uso)    │
                 │      │                                   │
                 │      ▼                                   │
                 │ domain/       entities, errors  ◀── NÚCLEO PURO
                 │      ▲                                   │
                 │      │                                   │
                 │ infrastructure/ database, repositories   │
                 └──────────────────────────────────────────┘
                                          │
                                          ▼
                                      SQLite
```

```
src/
├── server.js                       # sincroniza o banco e sobe a porta HTTP
├── app.js                          # composition root: injeção manual de dependências
├── domain/
│   ├── entities/                   # Tarefa, Usuario, StatusTarefa — JS puro
│   └── errors/                     # ValidacaoError, NaoEncontradoError, RegraDeNegocioError
├── application/services/
│   ├── tarefa/                     # um caso de uso por arquivo (SRP)
│   └── usuario/
├── infrastructure/
│   ├── database/                   # conexão Sequelize + models + sincronizar()
│   └── repositories/               # esconde o ORM atrás de métodos de negócio
└── interfaces/
    ├── controllers/                # traduz HTTP <-> caso de uso
    └── routes/                     # mapeia verbo + caminho -> método do controller
```

**O que cada camada pode importar:**

| Camada           | Pode importar                                               |
| ---------------- | ----------------------------------------------------------- |
| `domain`         | nada além dela mesma — **zero** Express, **zero** Sequelize |
| `application`    | apenas `domain`                                             |
| `infrastructure` | `domain` (para devolver entidades) + o ORM                  |
| `interfaces`     | `domain` e `application`                                    |

O teste prático disso está em `tests/unit/`: as entidades são testadas sem subir banco nem
servidor.

### Injeção de dependência manual

Nada de container mágico. Em [`src/app.js`](src/app.js) as classes são instanciadas à mão, de
dentro para fora:

```
models  ->  repositories  ->  services  ->  controllers  ->  routers  ->  app
```

---

## Modelo de dados

**Usuario** — `id`, `nome`, `email` (único)
**Tarefa** — `id`, `titulo`, `descricao`, `status`, `usuarioId` (chave estrangeira)

Um usuário possui muitas tarefas; toda tarefa pertence a exatamente um usuário.

### Ciclo de vida da tarefa

```
PENDENTE ──iniciar()──▶ EM_ANDAMENTO ──concluir()──▶ CONCLUIDA
```

Toda tarefa nasce `PENDENTE`. As transições ficam na própria entidade
([`src/domain/entities/Tarefa.js`](src/domain/entities/Tarefa.js)) e qualquer tentativa de pular
etapas — concluir algo que nunca foi iniciado, reiniciar algo já concluído — lança
`RegraDeNegocioError`.

---

## Endpoints

| Método   | Rota                    | Descrição                      | Sucesso |
| -------- | ----------------------- | ------------------------------ | ------- |
| `GET`    | `/`                     | Informações da API             | 200     |
| `GET`    | `/api-docs`             | Documentação interativa        | 200     |
| `POST`   | `/usuarios`             | Cria um usuário                | 201     |
| `GET`    | `/usuarios`             | Lista os usuários              | 200     |
| `GET`    | `/usuarios/:id/tarefas` | Lista as tarefas de um usuário | 200     |
| `POST`   | `/tarefas`              | Cria uma tarefa                | 201     |
| `GET`    | `/tarefas`              | Lista todas as tarefas         | 200     |
| `GET`    | `/tarefas/:id`          | Busca uma tarefa               | 200     |
| `PUT`    | `/tarefas/:id`          | Altera título/descrição        | 200     |
| `DELETE` | `/tarefas/:id`          | Exclui a tarefa                | 204     |
| `POST`   | `/tarefas/:id/iniciar`  | Passa para `EM_ANDAMENTO`      | 200     |
| `POST`   | `/tarefas/:id/concluir` | Passa para `CONCLUIDA`         | 200     |

### Códigos de erro

| Status | Quando acontece                                                                |
| ------ | ------------------------------------------------------------------------------ |
| `400`  | Falha de validação estrutural do corpo (Zod), com o detalhamento por campo     |
| `400`  | Dado inválido para o domínio: e-mail já cadastrado, título vazio no `PUT`      |
| `400`  | Regra de negócio violada: limite de 5 atingido ou transição de status inválida |
| `404`  | Tarefa ou usuário inexistente                                                  |
| `500`  | Erro inesperado                                                                |

Todos os erros respondem no mesmo formato:

```json
{ "erro": "mensagem explicativa" }
```

### Exemplos

Criar um usuário:

```bash
curl -X POST http://localhost:3000/usuarios -H "Content-Type: application/json" -d "{\"nome\":\"Ana Souza\",\"email\":\"ana.souza@exemplo.com\"}"
```

Criar uma tarefa:

```bash
curl -X POST http://localhost:3000/tarefas -H "Content-Type: application/json" -d "{\"titulo\":\"Modelar o banco\",\"usuarioId\":1}"
```

Iniciar uma tarefa:

```bash
curl -X POST http://localhost:3000/tarefas/1/iniciar
```

---

## A regra de negócio: limite de 5 tarefas em andamento

Implementada em
[`src/application/services/tarefa/IniciarTarefaService.js`](src/application/services/tarefa/IniciarTarefaService.js).

Ao receber `POST /tarefas/:id/iniciar`, o serviço:

1. localiza a tarefa (404 se não existir) — é dela que sai o usuário dono;
2. pergunta ao repositório **quantas tarefas daquele usuário estão `EM_ANDAMENTO`**
   (`contarPorUsuarioEStatus`);
3. se já houver **5 ou mais**, lança `RegraDeNegocioError` e a API responde **400**;
4. caso contrário, chama `tarefa.iniciar()` — a entidade valida a transição — e manda o
   repositório salvar.

Resposta do bloqueio:

```json
{
  "erro": "Limite atingido: o usuário 1 já possui 5 tarefas com status EM_ANDAMENTO e o máximo permitido é 5. Conclua uma tarefa antes de iniciar outra."
}
```

Duas observações de projeto:

- **O limite é por usuário, não global.** Outro usuário continua conseguindo iniciar tarefas
  normalmente, e concluir uma tarefa libera uma vaga imediatamente.
- **A checagem de capacidade vem antes da checagem de transição**, como descreve o enunciado.
  Consequência prática: se o usuário estiver no limite e tentar iniciar uma tarefa já concluída,
  a mensagem devolvida será a de limite atingido, não a de transição inválida.

A divisão de responsabilidades é proposital: _quantas tarefas o usuário pode ter em andamento_ é
uma regra de aplicação (depende de consultar outras tarefas), enquanto _de qual status posso sair_
é uma regra da própria entidade.

---

## Documentação interativa (Swagger)

Com a API no ar, a documentação fica em **`http://localhost:3000/api-docs`**: as rotas aparecem
agrupadas nas tags `Usuários` e `Tarefas`, com o corpo esperado, os exemplos de resposta e as regras
de negócio de cada endpoint.

A geração é automática, a partir das anotações no próprio código:

```bash
npm run swagger
```

O comando executa o [`swagger.js`](swagger.js) da raiz, que usa o **swagger-autogen** para ler as
rotas e combiná-las com as informações declaradas ali (título, host, tags e os schemas
reutilizáveis), produzindo o `swagger-output.json`. O `npm run dev` já regera antes de subir o
servidor. O arquivo gerado vem versionado, então um clone consegue abrir o `/api-docs` sem precisar
gerar nada antes.

### Onde ficam as anotações, e por quê

As anotações `#swagger` estão nos **arquivos de rota** ([`tarefaRoutes.js`](src/interfaces/routes/tarefaRoutes.js)
e [`usuarioRoutes.js`](src/interfaces/routes/usuarioRoutes.js)), e não nos controllers.

O motivo é concreto: o swagger-autogen faz análise **estática** do código. Nas rotas deste projeto o
handler é `tarefaController.criar`, onde `tarefaController` é um _parâmetro de função_ que só existe
em tempo de execução, injetado pelo composition root em [`src/app.js`](src/app.js). Nenhum
analisador estático consegue seguir daí até o arquivo do controller. Anotar nas rotas mantém a
documentação funcionando sem abrir mão da injeção de dependência — as anotações continuam na camada
`interfaces`, ao lado dos controllers.

---

## Validação de entrada (Zod)

O projeto valida a entrada em **duas camadas complementares**, não redundantes:

| Camada                                       | Pergunta que responde                          | Exemplo                                             |
| -------------------------------------------- | ---------------------------------------------- | --------------------------------------------------- |
| **Zod**, na fronteira HTTP (`interfaces`)    | O payload tem o formato certo? Os tipos batem? | `nome` tem 3+ caracteres? `email` parece um e-mail? |
| **Entidade**, no domínio (`domain/entities`) | Os invariantes de negócio valem?               | Esta tarefa pode sair do status em que está?        |

O middleware [`validarCorpo.js`](src/interfaces/middlewares/validarCorpo.js) é uma fábrica: recebe um
schema e devolve o middleware do Express já amarrado a ele.

```js
router.post('/', validarCorpo(criarTarefaSchema), tarefaController.criar);
```

Quando o corpo é reprovado, a resposta é `400` com o detalhamento por campo:

```json
{
  "erro": "Dados inválidos.",
  "detalhes": [
    { "campo": "nome", "mensagem": "O nome deve ter no mínimo 3 caracteres." },
    { "campo": "email", "mensagem": "E-mail em formato inválido." }
  ]
}
```

Quando o corpo é aprovado, o middleware substitui o `req.body` pelo dado **já normalizado** pelo
schema: strings sem espaços nas pontas, números convertidos e campos desconhecidos descartados.

Os schemas estão em [`src/interfaces/middlewares/schemas/`](src/interfaces/middlewares/schemas) e a
validação é aplicada nas rotas de `POST`. O `PUT /tarefas/:id` continua validado pelo domínio.

> **Sobre o Zod estar em `dependencies`:** o enunciado da atividade sugere instalá-lo com
> `--save-dev`, mas o middleware o importa a cada requisição — é código de runtime. Em
> `devDependencies`, um `npm install --omit=dev` derrubaria a API. O `swagger-autogen`, esse sim, é
> dependência de desenvolvimento legítima: só roda para gerar o arquivo, nunca durante a execução.

---

## Testes

```bash
npm test
```

- `tests/unit/` — entidades de domínio isoladas, sem banco e sem HTTP.
- `tests/integration/roteiroFase7.test.js` — o roteiro de validação completo via Supertest.
- `tests/integration/validacaoEDocumentacao.test.js` — a validação do Zod campo a campo e o
  conteúdo do `swagger-output.json`, incluindo a documentação da regra de negócio.

Os testes de integração rodam contra um **SQLite em memória** (o Jest define `NODE_ENV=test`),
então não encostam no `database.sqlite` de desenvolvimento.

### Roteiro de validação

O arquivo [`requests.http`](requests.http) reproduz o mesmo roteiro para execução manual — abra-o
no VS Code com a extensão _REST Client_ e dispare as requisições de cima para baixo.

Para chegar rápido ao ponto interessante:

```bash
npm run seed
```

O seed recria o banco com a Ana já no limite (5 tarefas `EM_ANDAMENTO`) e tarefas `PENDENTE`
sobrando, e imprime no terminal a requisição exata que demonstra o bloqueio.

| #   | Passo                    | Rota                        | Esperado                            |
| --- | ------------------------ | --------------------------- | ----------------------------------- |
| 1   | Criar usuário            | `POST /usuarios`            | 201                                 |
| 2   | Criar tarefas do usuário | `POST /tarefas`             | 201, `status: "PENDENTE"`           |
| 3   | Listar tarefas           | `GET /tarefas`              | 200 com a lista                     |
| 4   | Iniciar 5 tarefas        | `POST /tarefas/:id/iniciar` | 200, `status: "EM_ANDAMENTO"`       |
| 4b  | Iniciar a 6ª             | `POST /tarefas/:id/iniciar` | **400 com a mensagem de limite**    |
| 5   | Alterar o texto          | `PUT /tarefas/:id`          | 200 com o título novo               |
| 5b  | Excluir                  | `DELETE /tarefas/:id`       | 204, e o `GET` seguinte devolve 404 |

---

## Variáveis de ambiente

| Variável     | Padrão            | Para que serve                                        |
| ------------ | ----------------- | ----------------------------------------------------- |
| `PORT`       | `3000`            | Porta HTTP                                            |
| `DB_STORAGE` | `database.sqlite` | Caminho do arquivo SQLite (`:memory:` em testes)      |
| `DB_LOG`     | `false`           | `true` imprime no console o SQL gerado pelo Sequelize |

---

## Solução de problemas

**`npm install` avisa sobre scripts de instalação não aprovados.** O `sqlite3` é um módulo nativo
e precisa rodar um script para baixar o binário pré-compilado. Se o `require('sqlite3')` falhar
após a instalação, aprove o script e reinstale:

```bash
npm approve-scripts sqlite3
```

**Quero começar do zero.** Pare a API, apague o `database.sqlite` e rode `npm run seed` (ou
simplesmente `npm start`, que recria as tabelas vazias).

---

## Stack

| Camada          | Ferramenta          |
| --------------- | ------------------- |
| Runtime         | Node.js >= 20.17    |
| HTTP            | Express             |
| ORM / Banco     | Sequelize + SQLite3 |
| Testes          | Jest + Supertest    |
| Qualidade       | ESLint + Prettier   |
| Desenvolvimento | Nodemon             |

---

## Autores

- Felipe Mesquita Pinto
- Wheverson de Abreu Lima

Projeto desenvolvido como atividade de laboratório: construção de uma API RESTful aplicando
Clean Architecture.
