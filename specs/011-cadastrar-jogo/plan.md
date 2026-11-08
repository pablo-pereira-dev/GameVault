# Plano — Issue #11 (US08 — Cadastrar jogo)

## Decisões técnicas

- **Banco de dados:** Modelo `Game` no Prisma ORM com `title @unique`, `price` (Decimal/Float), `stock` (Int), `description`, `imageUrl`, `createdAt`.
- **Backend:** Módulo `games` no NestJS (`GamesController`, `GamesService`, `CreateGameDto` com `class-validator`). Proteção administrativa (`@Roles(Role.ADMIN)` ou mock de admin conforme arquitetura). Tratamento de erro `P2002` do Prisma mapeado para `ConflictException` (409).
- **Frontend:** Camada de serviço em `features/admin/services/gameService.ts` e página de cadastro em `features/admin/pages/CreateGamePage.tsx`. Gerenciamento de estado local no React (descartando dados ao desmontar/fechar aba) e tratamento de falha/timeout de rede.

## Tarefas

- [x] **Tarefa 1 — Configurar modelo Game no Prisma e migração**
  - Cobre: Infraestrutura base para CA1, CA2
  - Teste primeiro: Teste de integração do Prisma para criação e restrição de unicidade em `Game`
  - Arquivos previstos: `apps/api/prisma/schema.prisma`, `apps/api/src/prisma/prisma.service.ts`

- [ ] **Tarefa 2 — Implementar criação de jogo e validação de campos obrigatórios no Backend**
  - Cobre: CA1, CA3
  - Teste primeiro: Teste unitário e e2e no `GamesController`/`GamesService` testando DTO com falhas de validação (campos obrigatórios) e sucesso no cadastro
  - Arquivos previstos: `apps/api/src/games/dto/create-game.dto.ts`, `apps/api/src/games/games.service.ts`, `apps/api/src/games/games.controller.ts`, `apps/api/src/games/games.module.ts`, e testes correspondentes

- [ ] **Tarefa 3 — Tratar conflito de título duplicado no Backend**
  - Cobre: CA2
  - Teste primeiro: Teste unitário/e2e validando que ao tentar cadastrar jogo com título existente, o backend retorna `409 Conflict`
  - Arquivos previstos: `apps/api/src/games/games.service.ts`, `apps/api/src/games/games.controller.ts`, e testes correspondentes

- [ ] **Tarefa 4 — Implementar formulário de cadastro de jogo e tratamento de rede no Frontend**
  - Cobre: CA1, CA2, CA3, CA4, CA5
  - Teste primeiro: Testes unitários/componentes do formulário testando submissão bem sucedida, destaque de campos faltantes, descarte de estado ao fechar e tratamento de erro/timeout de rede
  - Arquivos previstos: `apps/web/src/features/admin/services/gameService.ts`, `apps/web/src/features/admin/pages/CreateGamePage.tsx`, e testes correspondentes

## Critérios sem tarefa

-
