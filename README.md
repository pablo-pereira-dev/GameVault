# GameVault

O jogador não tem um único lugar onde encontrar e comprar jogos; o GameVault reúne o catálogo em uma vitrine com carrinho e pagamento.

## Autores

- Pablo — [@pablo-pereira-dev](https://github.com/pablo-pereira-dev)

## Documentação

- [PRD](docs/prd.md)
- [Jornadas de usuário](docs/user-flows.md)
- [Tokens de design](docs/design-tokens.md)
- [Arquitetura](docs/architecture.md)

## Protótipo

- [Protótipo no Stitch (loja e admin)](https://stitch.withgoogle.com/projects/17513263099732936981)

## Stack

- NestJS
- Prisma
- PostgreSQL
- React
- Vitest

## Rodando localmente (do zero)

### Pré-requisitos

- **Node.js 22.22.3+** (ou 24.15+/26+) e **npm** — o NestJS 12 e o Vite 8 exigem versões recentes
- **Docker** com **Docker Compose**
- **Git**

### 1. Clone o repositório

```bash
git clone https://github.com/<seu-usuario>/GameVault.git
cd GameVault
```

### 2. Instale as dependências

O projeto é um monorepo com workspaces npm (`apps/api` e `apps/web`). Instale tudo de uma vez na raiz:

```bash
npm install
```

### 3. Configure as variáveis de ambiente

Crie o arquivo **`apps/api/.env`**:

```env
DATABASE_URL="postgresql://app:app@localhost:5433/appdb"
JWT_SECRET="troque-por-uma-chave-longa-e-aleatoria"
# Opcionais:
# JWT_EXPIRES_IN="15m"
# PORT="3000"
```

- `DATABASE_URL` aponta para o Postgres do `docker-compose.yml` (note a porta **5433**).
- `JWT_SECRET` é **obrigatório**: a API se recusa a iniciar sem ele. Gere um valor com `openssl rand -hex 32`.
- O `.env` já está no `.gitignore` — nunca comite credenciais.

### 4. Suba o banco de dados

```bash
docker compose up -d db
```

### 5. Gere o client do Prisma e aplique as migrações

```bash
cd apps/api
npx prisma generate
npx prisma migrate deploy
cd ../..
```

### 6. Inicie a API e o front

Em **dois terminais**, a partir da raiz:

```bash
npm run api   # API em http://localhost:3000 — Swagger em http://localhost:3000/docs
npm run web   # Front Vite em http://localhost:5173
```

### 7. Verificação rápida

| O que conferir | Endereço / comando |
| --- | --- |
| API online | `http://localhost:3000` |
| Documentação da API | `http://localhost:3000/docs` |
| Frontend | `http://localhost:5173` |
| Testes | `npm test` |

### Comandos úteis

| Comando | Finalidade |
| --- | --- |
| `npm run build` | Build da API e do front |
| `npm test` | Testes das duas aplicações |
| `npm run lint` | Lint das duas aplicações |
| `docker compose down` | Parar o banco (os dados ficam no volume) |
