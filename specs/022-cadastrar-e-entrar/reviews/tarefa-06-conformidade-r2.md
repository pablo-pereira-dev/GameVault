# Parecer de Conformidade — Tarefa 6

**Veredito:** APROVADO

## Critérios verificados
| Critério (da spec) | Situação | Onde |
| --- | --- | --- |
| CA1 — metade frontend (formulário + chamada ao serviço) | atendido | `RegisterPage.tsx:25-28` (`handleSubmit` → `controller.submit(form.values)`); `registerController.ts:44` (`deps.register(values)`); `authService.ts:119-144` (POST `/auth/register`, retorna `User`, sem gravar token/redirecionar); testes em `authService.test.ts:172-201` e `RegisterPage.test.tsx:74-83` |
| CA2 — conflito de e-mail (409) | atendido | `authService.ts:134-136` (`EmailAlreadyInUseError`); `registerForm.ts:52-61` (tradução da mensagem); `registerController.ts:47` (`applySubmitError`); `RegisterPage.tsx:38-42` (banner `role="alert"`); testes em `authService.test.ts:204-217` e `RegisterPage.test.tsx:85-94` |
| CA5 — destaque visual + bloqueio de submissão inválida | atendido | `registerForm.ts:30-48` (nome obrigatório, e-mail obrigatório/malformado, senha < 6) e `shouldSubmitRegister`; `registerController.ts:30-41` (guard: não chama `register` quando inválido); `RegisterPage.tsx:44` (`noValidate`), `:51,68,85` (`aria-invalid`), `:54-57,71-74,88-91` (`.field-error`); **correção efetiva:** `RegisterPage.css` (tokens) define `.register-page input[aria-invalid='true']` com borda/anel vermelhos e todas as classes usadas no JSX; testes em `RegisterPage.test.tsx:41-63` e `authService.test.ts:220-227` |
| CA9 — falha de conexão, sem travar e com dados preservados | atendido | `http.ts:1-3,38-42` (`Failed to fetch` → `CONNECTION_ERROR_MESSAGE`); `authService.ts:137-140`; `registerForm.ts:63-71` (`applySubmitError` preserva `values`, `loading: false`); `RegisterPage.tsx:96-102` (botão reabilitado); teste em `RegisterPage.test.tsx:96-106` |
| CA10 — aba fechada antes de submeter (cadastro) | atendido | **correção efetiva:** `registerController.ts:66-68` (`discard()` → `INITIAL_REGISTER_STATE`) chamado pelo cleanup `RegisterPage.tsx:16`; estado apenas em memória, `register` não toca storage; teste em `RegisterPage.test.tsx:108-122` (descarte via `controller.discard()` + nenhum `getItem`/`setItem`) |
| CA1 (hash bcrypt / `role: USER` no banco), CA3, CA4, CA6, CA7, CA8 e metade login de CA5/CA9/CA10 | fora desta tarefa | Tarefas 2, 3, 4, 5 e 7 do `plan.md`; roteamento de `RegisterPage` também pertence à Tarefa 7 |

**Verificação das correções aceitas na triagem (r1):** (1) o CSS novo cobre 100% das classes usadas pela página (`.register-page`, `.form-group`, `.field-error`, `.error-message`, `.success-message`, `button.loading`) com os valores literais de `docs/design-tokens.md`, e o realce de CA5 agora é visual — não apenas `aria-invalid`; (2) a lógica de submit/descarte foi centralizada em `createRegisterController`, que a página efetivamente consome (`useMemo` + `useEffect` + `handleSubmit`), e os testes passaram a acionar `controller.submit`/`controller.discard` através de um `dispatch` que espelha o `setState` do React — remover o guard agora quebra os testes, e existe teste explícito de descarte. Ambos os apontamentos encerrados estão resolvidos, sem reabertura.

**Execução:** `npm test --prefix apps/web` — 6 arquivos, **39 testes passando**. `npm run build --prefix apps/web` não pode ser rodado neste subagente (`Permission denied: shell`), mesma limitação de harness registrada em r1; o implementador relata build OK e lint limpo. Nenhum arquivo foi alterado.

## Apontamentos
(nenhum)
