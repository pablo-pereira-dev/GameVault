# Parecer de Conformidade — Tarefa 5

**Veredito:** APROVADO

## Critérios verificados
| Critério (da spec) | Situação | Onde |
| --- | --- | --- |
| CA3 — autenticação com sucesso recebendo token de acesso JWT (nesta tarefa: serviço/contexto; vitrine e cabeçalho → tarefa 7) | atendido | `apps/web/src/features/auth/services/authService.ts:101-130` (POST `/auth/login`, leitura de `json.data.accessToken`, persistência em `TOKEN_KEY`); `apps/web/src/features/auth/context/AuthContext.tsx:53-69` (`login` → `restoreSession()` → estado autenticado); teste `apps/web/src/features/auth/services/authService.test.ts:36-86` |
| CA7 — logout remove o token da sessão local e a interface volta ao estado deslogado | atendido | `apps/web/src/features/auth/services/authService.ts:70-72` (`clearSession`) + `apps/web/src/features/auth/context/AuthContext.tsx:71-74` (`clearSession()` + dispatch `logout` → `loggedOutState()`); testes `authService.test.ts:88-94` e `AuthContext.test.tsx:30-32` |
| CA8 — sessão expirada/token inválido em operação protegida (`/auth/me` com 401): encerrar sessão localmente e redirecionar para o login | atendido | `apps/web/src/features/auth/services/authService.ts:56-68, 132-147` (`handleUnauthorized` remove o token e chama `redirect(LOGIN_PATH)`; `getMe` lança `UnauthorizedError`); `AuthContext.tsx:57-63` zera o estado; testes `authService.test.ts:96-124` e `AuthContext.test.tsx:34-38` |
| Escopo da tarefa — páginas de login/cadastro, Header, router e `App.tsx` ficam para as tarefas 6/7 | atendido | O diff contém apenas os 4 arquivos previstos em `apps/web/src/features/auth/`; nenhuma tela, cabeçalho, rota ou `App.tsx` foi alterado |

`npm test --prefix apps/web`: 4 arquivos, 15 testes, todos passando. Nota de execução: `npm run build --prefix apps/web` não pôde ser rodado nesta sessão — o ambiente negou permissão ao shell para esse comando (e para um typecheck equivalente); trata-se de indisponibilidade do comando, não de falha observada no código. O sinalizou-se também que o 401 do login é tratado como credencial inválida sem limpar a sessão (`authService.ts:118-120`), o que está correto — CA4 não deve acionar a limpeza de CA8.

## Apontamentos

(nenhum)
