# Parecer de Conformidade — Tarefa 7

**Veredito:** APROVADO

> **Julgamento sobre os limites declarados (pedido no despacho):**
> - **Testes sem DOM — legítimo.** `apps/web/package.json` não declara `jsdom` nem `@testing-library/react` (só Vitest) e `docs/architecture.md` §2 também não prevê biblioteca de DOM. O uso de `renderToString` + harnesses puros do controlador é a adaptação correta à stack. Ressalva: o `submit` real do formulário e o destaque CSS (`.login-page input[aria-invalid='true']`) não são *executados* pelos testes — são verificáveis por leitura em `LoginPage.tsx:34-36,51-66` e `LoginPage.css:69-73`.
> - **`StorePage` placeholder — legítimo.** CA3 exige redirecionamento à "vitrine da loja" sem nomear arquivo e o catálogo ainda não tem história nesta fatia. O placeholder é apenas destino de navegação (sem listagem, sem chamada à API, sem dependência nova, com os tokens do projeto) — não é escopo inflado.
> - **CA3 "opções de perfil" — interpretado conforme o plano aprovado:** o cabeçalho exibe o nome do usuário e a ação **Sair** (`Header.tsx:38-41`), que é exatamente o que a tarefa e o plano definiram; não há tela de perfil nesta fatia para linkedar.
> - **Execução:** `npm test --prefix apps/web` passou (9 arquivos, 59 testes). `npm run build --prefix apps/web` **não rodou** — o shell negou permissão ao comando em todas as tentativas (inclusive variantes). É limitação do harness, não defeito do diff; nenhum critério foi considerado atendido com base nele.

## Critérios verificados
| Critério (da spec) | Situação | Onde |
| --- | --- | --- |
| CA3 — login com credenciais corretas: JWT, redirect à vitrine, cabeçalho com perfil/sair | atendido | `LoginPage.tsx:15-18,34-36` → `loginController.ts:50-52` → `navigate('/')`; `Header.tsx:38-41` (nome + Sair). Token gravado em `authService.ts:113-116` e perfil em `authActions.ts:29-32`; prova em `LoginPage.test.tsx:59-71` e `Header.test.tsx:44-56` |
| CA4 — 401 genérico idêntico, sem revelar existência do e-mail | atendido | `loginForm.ts:20,49-53` (texto único) + `authService.ts:104-107` (401 de login não limpa nem redireciona); prova em `LoginPage.test.tsx:73-84` e `authService.test.ts:140-152,154-169` |
| CA5 — destaque visual e bloqueio de envio com campos vazios/malformados | atendido | `loginForm.ts:25-39,41-43` + `LoginPage.tsx:50-76` (`aria-invalid` + `.field-error`) + `LoginPage.css:69-73`; prova em `LoginPage.test.tsx:33-57` |
| CA6 — USER barrado em rota administrativa (403 na interface) | atendido | `router.tsx:55-62` (`view: 'forbidden'`) + `router.tsx:68-75` (`Acesso negado … 403 Forbidden`); prova em `router.test.tsx:35-38,116-124` |
| CA7 — logout remove token e volta ao estado deslogado | atendido | `Header.tsx:13-19` (`auth.logout()` → `clearSession` → `removeStoredToken`) + `Header.tsx:39-41`; prova em `Header.test.tsx:59-65` e `authService.test.ts:102-108` |
| CA8 — token expirado/inválido encerra sessão e redireciona ao login | atendido | Wiring da tarefa em `App.tsx:8-11` + `router.tsx:90-98` (`restoreSession()` na carga); limpeza/redirect em `authService.ts:72-84,146-173` e `authActions.ts:16-27`, testado em `authService.test.ts:110-138` |
| CA9 — queda de rede: aviso, sem travar, dados preservados | atendido | `http.ts:12-21,36-42` → `loginForm.ts:59-63` (`values: state.values`, `loading: false`); prova em `LoginPage.test.tsx:86-96` |
| CA10 — fechar a aba não persiste rascunho | atendido | `LoginPage.tsx:20-26` (cleanup com `controllerRef.discard()`) + `loginController.ts:56-58`; prova em `LoginPage.test.tsx:98-111` (storage intocado) e `LoginPage.test.tsx:136-158` (render não lê/grava storage) |

## Apontamentos
