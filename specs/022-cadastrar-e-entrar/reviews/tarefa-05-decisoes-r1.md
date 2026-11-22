# Decisões — Tarefa 5, rodada 1

| # | Apontamento (resumo) | Parecer | Decisão | Justificativa |
| --- | --- | --- | --- | --- |
| 1 | Wrapper de rede duplicado entre `authService.ts` e `gameService.ts` — extrair helper HTTP em `src/shared/services/` e migrar ambos | código | aceito | — |
| 2 | Testes do Provider/hook acoplados à forma do estado e cegos ao wiring — testar as funções que o Provider efetivamente expõe/usar `objectContaining` | código | aceito | — |
| 3 | Avisos `react(only-export-components)`: mover funções puras e `useAuth` para `authReducer.ts`/`useAuth.ts`, deixando `AuthContext.tsx` com só o componente | código (sugestão promovida) | aceito | — |
| 4 | `getMe()` redireciona mesmo sem token — early-return quando não há token | código (sugestão promovida) | aceito | — |
| 5 | Provider não repassa a injeção de `redirect` — expor a opção para a Tarefa 7 plugar navegação SPA | código (sugestão promovida) | aceito | — |
| 6 | Centralização parcial do 401 — opção `onUnauthorized` no `request()`, mantendo o 401 do login (CA4) fora | código (sugestão promovida) | aceito | — |
| 7 | Setup redundante: remover `vi.stubGlobal('localStorage', ...)` do `beforeEach` de `authService.test.ts` | código (sugestão promovida) | aceito | — |
