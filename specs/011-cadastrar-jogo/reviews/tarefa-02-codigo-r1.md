# Parecer de Código — Tarefa 2

**Veredito:** APONTAMENTOS

## Apontamentos (bloqueiam)
1. **`GamesModule` não importado no módulo raiz (`AppModule`)** — `apps/api/src/games/games.module.ts`
   Regra violada: Arquitetura modular do NestJS (`docs/architecture.md` § 2.1 — ID6).
   Prejuízo concreto: O módulo de jogos não é registrado no container de injeção de dependências da aplicação principal, fazendo com que a rota `POST /games` resulte em erro 404 Not Found em ambiente de execução.

2. **`ValidationPipe` configurado localmente no Controller em vez de global** — `apps/api/src/games/games.controller.ts:9`
   Regra violada: `docs/architecture.md` (§ 2.1 — ID7): *"Toda entrada da API passa por DTO com `class-validator` + `ValidationPipe` global configurado com `whitelist: true, forbidNonWhitelisted: true`."*
   Prejuízo concreto: Viola a padronização arquitetural ao exigir configuração manual por controller em vez de garantir validação global automática para toda a aplicação.

3. **Resposta de sucesso fora do formato de envelope global (`{ data: ... }`)** — `apps/api/src/games/games.controller.ts:11`
   Regra violada: `docs/architecture.md` (§ 2.1 — ID10): *"Sucesso: Interceptor global serializa respostas em `{ data: ... }`."*
   Prejuízo concreto: O endpoint retorna o objeto puro do Prisma diretamente, quebrando o contrato global de API esperado pelo frontend e clientes.

## Sugestões (não bloqueiam)
- Adicionar testes de integração/E2E com Supertest para validar o ciclo completo da requisição HTTP.

## Observações fora do escopo deste diff
- A rota `POST /games` ainda não possui o guard de autenticação e controle de acesso de Administrador.
