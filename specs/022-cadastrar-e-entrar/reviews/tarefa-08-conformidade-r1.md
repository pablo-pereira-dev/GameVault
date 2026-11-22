# Parecer de Conformidade — Tarefa 8

**Veredito:** APROVADO

## Critérios verificados
| Critério (da spec) | Situação | Onde |
| --- | --- | --- |
| CA6 — acesso a funcionalidade administrativa (`POST /games`) autenticado; NEGADO com 403 permanece no backend | atendido | `apps/web/src/features/admin/services/gameService.ts:36` (header Bearer enviado), `apps/web/src/features/admin/services/gameService.test.ts:96-118` (asserção do header). A regra de 403 para `role: USER` já vinha da Tarefa 4 e não foi alterada — nenhum tratamento de 403 foi inventado neste diff. |
| CA8 — 401 em operação protegida encerra sessão localmente e redireciona para login | atendido | `apps/web/src/features/admin/services/gameService.ts:42` (repassa `onUnauthorized` ao `request`), `apps/web/src/features/auth/services/authService.ts:75-86` (`handleUnauthorized`: remove token + redirect `LOGIN_PATH`), `apps/web/src/shared/services/http.ts:47-49` (dispara o callback no 401), `apps/web/src/features/admin/services/gameService.test.ts:120-134` (asserções de storage vazio e redirect) |
| Pendência 1 da auditoria final — guard global quebrou `POST /games` pela interface | atendido | `apps/web/src/features/admin/services/gameService.ts:26-44`: token lido do storage, `Authorization: Bearer <token>` anexado e callback de 401 wired; `http.ts` não precisou mudar (já tinha `fetchFn`/`onUnauthorized`) e não foi alterado, exatamente como previsto no plano. |

Verificação executada: `git diff 69f5ded2712daa8acbba527d7d618d587dd4f192` — apenas 2 arquivos (`gameService.ts`, `gameService.test.ts`), sem escopo inflado. `npm test --prefix apps/web`: 10 arquivos / 71 testes passados, incluindo os dois testes novos que provam comportamento real (fetch injetado, storage injetado e redirect espiado — não é mock testando mock). `npm run build --prefix apps/web` não rodou: o harness negou permissão ao comando (não está na lista liberada), portanto a checagem de tipos via `tsc -b` não pôde ser confirmada por execução; a leitura do código não revela incompatibilidade de tipos (assinatura `createGame(data, options?)` é retrocompatível com o único chamador de produção em `CreateGamePage.tsx:40`).

## Apontamentos
