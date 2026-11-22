# Parecer de Código — Tarefa 5 (rodada 2)

**Veredito:** APROVADO

Verificação executada: `git diff 3ffa875…` lido por completo, mais leitura estática de `gameService.test.ts`, `CreateGamePage.test.tsx`, `vitest.config.ts`, `tsconfig.app.json`, `vite.config.ts` e `package.json`. `npm test` e `npm run build` foram **negados por permissão do harness** nesta sessão (mesma limitação da rodada 1), então a afirmação do implementador (27 testes / build OK / lint zero) não foi verificada por execução — o julgamento abaixo vem da leitura do diff e do código ao redor.

Os 7 itens aceitos na triagem estão efetivamente entregues: helper HTTP compartilhado com `gameService` migrado; testes do Provider reescritos com `objectContaining` e teste de wiring real; funções puras e hook extraídos para `authReducer.ts`/`authActions.ts`/`useAuth.ts` (o que zera os avisos `only-export-components` sem nova dependência); early-return no `getMe()` sem token; `redirect`/`storage`/`fetchFn` injetados no Provider; `onUnauthorized` no `request()` com o 401 do login deliberadamente fora; setup redundante removido.

- **§2 (stack estrita):** nenhuma dependência nova. `react-dom/server` já vem de `react-dom`; padrões React 19 mantidos (função + hooks, sem classes). OK.
- **§4 (camada de dados):** `shared/services/http.ts` é o reuso correto entre `admin` e `auth`; nenhum componente faz `fetch` direto. OK.
- **TDD/qualidade:** 27 testes, asserções parciais, teste de wiring que atravessa Provider → `getMe` → `request` → `fetchFn` injetado. Sem acoplamento à forma interna do estado. OK.
- **Centralização do 401:** `handleUnauthorized` é o ponto único; `getMe` o aciona via `onUnauthorized`. OK.
- **401 do login (CA4):** `login()` não repassa `onUnauthorized`, lança erro genérico e há teste explícito provando que nem redireciona nem apaga token prévio. OK.

## Apontamentos (bloqueiam)

(nenhum)

## Sugestões (não bloqueiam)

- **`request()` sobrescreve silenciosamente o `signal` do chamador** — `apps/web/src/shared/services/http.ts:34`. O spread `{ ...init, signal: controller.signal }` descarta qualquer `AbortSignal` passado pelo chamador. Hoje ninguém passa, mas se uma feature futura precisar cancelar a requisição na desmontagem (ex.: limpeza ao sair da tela, family CA10), o sinal será ignorado sem erro. Preservar com `AbortSignal.any([init.signal, controller.signal])` ou só definir `signal` quando `init.signal` estiver ausente.
- **Wiring do `login` ainda não é testado pelo Provider** — `apps/web/src/features/auth/context/AuthContext.tsx:29-31`. O teste de wiring cobre `restoreSession` e `logout`, mas `serviceLogin({ email, password }, serviceOptions)` só é exercitado via `createAuthActions` com serviços stubados. Um `fetchFn` injetado no `<AuthProvider>` que não chegasse ao `serviceLogin` passaria despercebido. Um teste análogo ao de `restoreSession`, com `fetchFn`/`storage` injetados, fecharia o triângulo.

## Observações fora do escopo deste diff

- **`gameService` migrado não repassa `onUnauthorized`** — `apps/web/src/features/admin/services/gameService.ts:15-21`. Como `/games` é rota protegida (architecture ID9), um 401 por token expirado ao cadastrar jogo não dispara limpeza+redirect (CA8). **Não é regressão desta rodada** — o comportamento já existia antes da extração do helper — e decorre da decisão aceita de tornar `onUnauthorized` opt-in. Candidata a Issue de manutenção / alinhamento nas tarefas 6-7.
- **`getMe()` sem token lança `UnauthorizedError`** — `apps/web/src/features/auth/services/authService.ts:111-115`. Representa "visitante anônimo" como exceção; `restoreSession()` então dispatches `unauthorized` → `loggedOutState()`. O comportamento está correto (sem redirect), apenas semanticamente mistura "ausência de sessão" com "sessão inválida".
- `main.tsx`/`App.tsx` ainda não montam `AuthProvider` — esperado pelo plano (Tarefa 7), registrado apenas para não parecer omissão.
- Build, testes e lint não executados por negação de permissão do shell; checagem de tipos não foi validada por execução nesta rodada.
