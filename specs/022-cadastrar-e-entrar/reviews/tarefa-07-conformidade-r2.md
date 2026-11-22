# Parecer de Conformidade — Tarefa 7

**Veredito:** APROVADO

> **Verificação das correções aceitas na triagem r1** (`tarefa-07-decisoes-r1.md`):
> - **#1 guard de hidratação — efetivo.** `resolveRoute` recebe `sessionReady` e suprime o redirect até a restauração terminar (`router.tsx:69-105`); `AppRouter` mantém a marca em `false`, dispara `restoreSession()` uma única vez (ref anti-StrictMode) e a levanta em `.then(finishRestore, finishRestore)` — sucesso ou falha (`router.tsx:121-140`). Deep link ADMIN autenticado permanece na rota; sessão inválida redireciona ao login; nenhum redirect antecipado. Prova em `router.test.tsx:87-105`. A rejeição de `restoreSession` também deixa de ser unhandled — sem criar rodada nova, apenas não regressou.
> - **#2 lazy loading — efetivo.** Quatro páginas carregadas por `lazy(() => import(...))` com `<Suspense fallback>` na casca (`router.tsx:1-19,154-166`); injeção de páginas eager apenas no harness de teste. Architecture §2 atendida no código.
> - **#3 paths centralizados — efetivo.** `ROUTES` é a única fonte (`routes.ts:1-7`); router reexporta o mesmo objeto (`router.tsx:11,21`), Header (`Header.tsx:5`), LoginPage (`LoginPage.tsx:4,17`) e `authService.LOGIN_PATH` (`authService.ts:1,6`) consomem dele. Busca no `src/` encontra os literais só em `routes.ts` e `routes.test.ts`; identidade e alias provados em `routes.test.ts:5-21`.
> - **Execução:** `npm test --prefix apps/web` → **10 arquivos, 69 testes passando**. `npm run build --prefix apps/web` foi **negado pelo harness** (`Permission denied: shell`, inclusive via `cd apps/web && npm run build`) — mesma limitação registrada no parecer r1. Nenhum critério foi considerado atendido com base no build; a confirmação de code splitting vale pelo código-fonte lido, não por artefato de build.

## Critérios verificados
| Critério (da spec) | Situação | Onde |
| --- | --- | --- |
| CA3 — login com credenciais corretas: JWT, vitrine, cabeçalho com perfil/sair | atendido | `LoginPage.tsx:15-18,34-36` → `loginController.ts:50-52` → `navigate(ROUTES.store)`; `Header.tsx:38-41`; prova em `LoginPage.test.tsx:59-71`, `Header.test.tsx:44-56` |
| CA4 — 401 genérico idêntico, sem revelar existência do e-mail | atendido | `loginForm.ts:20,49-53` + `authService.ts:106-109` (401 de login não limpa nem redireciona); prova em `LoginPage.test.tsx:73-84`, `authService.test.ts` |
| CA5 — destaque visual e bloqueio de envio com campos vazios/malformados | atendido | `loginForm.ts:25-39,41-43` + `LoginPage.tsx:50-76` (`aria-invalid` + `.field-error`) + `LoginPage.css:69-73`; prova em `LoginPage.test.tsx:33-57` |
| CA6 — USER barrado em rota ADMIN (403 real do backend) | atendido | `router.tsx:83-93,107-114` (`view: 'forbidden'`); bloqueio real por `RolesGuard` é da tarefa 4; prova em `router.test.tsx:58-70` e no teste de composição USER/ADMIN |
| CA7 — logout remove token e volta ao estado deslogado | atendido | `Header.tsx:13-19,39-41` → `authActions.ts:34-37` → `authService.ts:70-72,88-90`; prova em `Header.test.tsx:59-65`, `authService.test.ts` |
| CA8 — token expirado/inválido encerra sessão e redireciona ao login | atendido | `authService.ts:74-86,148-175` (limpeza + `redirect(LOGIN_PATH)`, agora derivado de `ROUTES`) + `authActions.ts:16-27` + guard `router.tsx:121-152`; prova em `router.test.tsx:87-105` e `authService.test.ts` |
| CA9 — queda de rede: aviso, sem travar, dados preservados | atendido | `http.ts:27-42` → `loginForm.ts:59-63` (`values: state.values`, `loading: false`); prova em `LoginPage.test.tsx:86-96` |
| CA10 — fechar a aba não persiste rascunho | atendido | `LoginPage.tsx:20-26` (cleanup via ref) + `loginController.ts:56-58`; prova em `LoginPage.test.tsx:98-111,136-158` (storage intocado) |
| Correção r1 #1 — hidratação antes do redirect | atendido | `router.tsx:69-105,121-140`; `router.test.tsx:87-105` |
| Correção r1 #2 — lazy loading por rota | atendido | `router.tsx:1-19,154-166` |
| Correção r1 #3 — paths com dono único | atendido | `routes.ts:1-7`; consumidores em `router.tsx:11,21`, `Header.tsx:5`, `LoginPage.tsx:4,17`, `authService.ts:1,6`; `routes.test.ts:5-21` |

## Apontamentos
