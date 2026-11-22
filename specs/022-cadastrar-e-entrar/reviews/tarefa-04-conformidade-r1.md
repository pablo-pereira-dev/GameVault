# Parecer de Conformidade — Tarefa 4

**Veredito:** APROVADO

## Critérios verificados
| Critério (da spec) | Situação | Onde |
| --- | --- | --- |
| CA6 — usuário `USER` negado com HTTP 403 em rota administrativa | atendido | `apps/api/src/auth/guards/roles.guard.ts:19-23` (retorno `false` → 403), `apps/api/src/games/games.controller.ts:14` (`@Roles(Role.ADMIN)`), `apps/api/test/auth.e2e-spec.ts:128-139` e `:141-147` — e2e prova 403 + corpo `{ statusCode: 403, error: 'Forbidden' }`, nenhum jogo criado para USER e 201 para ADMIN (não é só teste de guard isolado) |
| CA6 — `@Roles(Role.ADMIN)` no POST `/games` é legítimo, não escopo inflado | atendido | A própria spec cita "rotas de gestão de jogos" como exemplo (spec.md:23) e o Mapa de Domínios define o guard de Games como `JwtAuthGuard` + `RolesGuard` (architecture.md:247); o teste-first da tarefa exige uma rota `@Roles(Role.ADMIN)` real. Sem esse decorator o critério não seria verificável por HTTP |
| CA8 — rejeição com HTTP 401 para token ausente/expirado/adulterado na metade backend | atendido | `apps/api/src/app.module.ts:19-26` (guards globais, JwtAuthGuard antes de RolesGuard), `apps/api/src/auth/guards/jwt-auth.guard.ts:25-50`, `apps/api/test/auth.e2e-spec.ts:80-126` e `apps/api/src/auth/guards/jwt-auth.guard.spec.ts:41-87` — 401 sem header, com esquema não-Bearer, expirado e assinado com outro secret |
| CA8 — `GET /auth/me` devolve o perfil autenticado sem vazar `passwordHash` | atendido | `apps/api/src/auth/auth.controller.ts:36-43`, `apps/api/src/auth/auth.service.ts:66-71`, `apps/api/src/auth/auth.service.spec.ts:376-408`, `apps/api/test/auth.e2e-spec.ts:88-101` — `select` explícito e asserção `not.toHaveProperty('passwordHash')` |
| ID9 — `@Public()` no healthcheck e em register/login | atendido | `apps/api/src/app.controller.ts:12`, `apps/api/src/auth/auth.controller.ts:16,26` — necessário e legítimo: com `JwtAuthGuard` global (ID9, architecture.md:60), sem `@Public()` o healthcheck quebraria e register/login (CA1/CA3) deixariam de ser públicos; e2e cobre o healthcheck em `apps/api/test/auth.e2e-spec.ts:149-150` |
| Testes da tarefa executam e provam os critérios | atendido | `npm test --prefix apps/api`: 13 arquivos / 88 testes passaram; `npm run test:e2e --prefix apps/api`: 2 arquivos / 8 testes passaram |
| Escopo — limpeza local de sessão e redirecionamento para login (CA8 frontend) | fora desta tarefa | Nenhuma alteração em `apps/web/` no diff; permanece nas tarefas 5 e 7, conforme delimitado no despacho |
| Glossário — `Role.USER` / `Role.ADMIN` e campos de `User` | atendido | Enum gerado do Prisma usado em guards/decorators/controller; resposta de `/auth/me` com `id, name, email, role, createdAt` (architecture.md:148) |

## Apontamentos
