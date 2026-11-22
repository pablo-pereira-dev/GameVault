# Parecer de Conformidade — Tarefa 6

**Veredito:** APROVADO

## Critérios verificados
| Critério (da spec) | Situação | Onde |
| --- | --- | --- |
| CA1 — metade frontend (formulário + chamada ao serviço) | atendido | `apps/web/src/features/auth/pages/RegisterPage.tsx:23-44` (submit → `register(form.values)`); `apps/web/src/features/auth/services/authService.ts:120-144` (POST `/auth/register`, retorna `User` sem gravar token); teste em `apps/web/src/features/auth/services/authService.test.ts:172-201` |
| CA2 — conflito de e-mail (409) | atendido | `authService.ts:134-136` (`EmailAlreadyInUseError`); `registerForm.ts:52-61` (tradução); `RegisterPage.tsx:54-58` (`role="alert"`); testes em `authService.test.ts:204-217` e `RegisterPage.test.tsx:50-52,64-70` |
| CA5 — metade cadastro (campos obrigatórios, e-mail, senha < 6) | atendido | `registerForm.ts:27-50` (validação + bloqueio); `RegisterPage.tsx:26-29,60-107` (`noValidate`, early return, `aria-invalid`, spans de erro); testes em `RegisterPage.test.tsx:21-46,82-94` |
| CA9 — falha de conexão, sem travar e com dados preservados | atendido | `apps/web/src/shared/services/http.ts:1-3,32-45` (mensagem compartilhada); `authService.test.ts:236-239`; `registerForm.ts:63-71` (`values` preservados, `loading: false`); `RegisterPage.tsx:41-43,98-111` |
| CA10 — aba fechada antes de submeter (cadastro) | atendido | `RegisterPage.tsx:14` (somente `useState`, sem effects/storage); `authService.ts:119-144` (register não toca storage, não redireciona); teste em `RegisterPage.test.tsx:97-111` (nenhum `getItem`/`setItem` no render) |
| CA1 (hash bcrypt/`role: USER` no banco), CA3, CA4, CA6, CA7, CA8 e metade login de CA5/CA9/CA10 | fora desta tarefa | Tarefas 2, 3, 4, 5 e 7 do `plan.md`; roteamento de `RegisterPage` também é da Tarefa 7 |

**Nota sobre a limitação declarada:** é restrição legítima da stack, não lacuna de conformidade. `apps/web/package.json` não declara `jsdom`/`@testing-library/react`, `vitest.config.ts` roda em ambiente Node e `docs/architecture.md:30-36` veta dependência não declarada — logo cliques, eventos DOM e desmontagem não são simuláveis sem furar a arquitetura. Quanto à desmontagem, não há nada a provar: o componente não registra listeners, timers, effects nem escrita em storage, e o estado em memória desaparece com a aba; a asserção de ausência de storage access é equivalente ao requisito. O restante da cadeia é evidenciado em camadas — service (409 → erro próprio; `Failed to fetch` → `CONNECTION_ERROR_MESSAGE`), redutor puro (`applySubmitError` preserva `values` e reabilita o botão) e JSX que renderiza `errorMessage` e mantém `value={form.values.*}` — sem mock que teste o mock. `npm test --prefix apps/web`: 6 arquivos, 41 testes, todos passando. `npm run build --prefix apps/web` não rodou (comando não liberado neste harness: `permission denied`), então o parecer fica incompleto quanto ao build.

## Apontamentos
