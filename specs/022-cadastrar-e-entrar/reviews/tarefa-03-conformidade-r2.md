# Parecer de Conformidade — Tarefa 3

**Veredito:** APROVADO

## Critérios verificados
| Critério (da spec) | Situação | Onde |
| --- | --- | --- |
| CA3 — metade backend: autenticação com credenciais corretas e emissão de token JWT | atendido | `auth.service.ts:40-64` (lookup, `bcrypt.compare`, `signAsync` com `{ sub, email, role }`, retorno `{ accessToken }`); `auth.controller.ts:22-31` (`POST /auth/login`, `@HttpCode(200)`); provas em `auth.service.spec.ts` (JWT verificado com `jwt.verify`, unitário + integração real) e `auth.controller.spec.ts` (HTTP com token verificável). Redirecionamento/cabeçalho permanecem nas tarefas 5/7 — fora deste diff. |
| CA4 — HTTP 401 estritamente idêntico para e-mail não cadastrado e senha incorreta, sem revelar existência | atendido | `auth.service.ts:10,46-55` (mesma `UnauthorizedException` com o literal `"Credenciais inválidas"` nos dois caminhos; `bcrypt.compare` sempre executado contra hash real ou dummy); corpo `{ statusCode, message, error }` idêntico assertido em `auth.controller.spec.ts` (unitário e integração com Prisma real) e `auth.service.spec.ts` (comparação de `getResponse()`). |
| CA5 — metade servidor: DTO + `ValidationPipe` recusando campos ausentes/malformados com HTTP 400 e sem chamar o serviço | atendido | `dto/login.dto.ts:10-21` (`@NormalizeEmail`, `@IsEmail`, `@IsString`, `@MinLength(6)`, whitelist); `dto/login.dto.spec.ts` (ausência, e-mail malformado, senha curta/branca, propriedade extra); `auth.controller.spec.ts` (400 com `expect(authService.login).not.toHaveBeenCalled()`). Destaque visual fica nas tarefas 6/7 — fora deste diff. |
| Escopo da tarefa — sem guardas, `/auth/me`, `RolesGuard` ou frontend | atendido | O diff toca apenas `auth/` (service, controller, module, DTOs, testes), `common/decorators/normalize-email.decorator.ts`, `.env.example` e artefatos de revisão. As correções R1#3/#4 foram explicitamente aceitas na triagem (`tarefa-03-decisoes-r1.md`), portanto não são escopo inflado. |
| Glossário (architecture §5.1) e casos de abandono (CA8/CA9/CA10) | atendido | `User`/`passwordHash`/`role` usados de forma consistente; CA8/CA9/CA10 são das tarefas 4-7, sem tratamento indevido neste diff. |
| R1#1 — normalização de e-mail compartilhada | efetiva | `common/decorators/normalize-email.decorator.ts:8-11` é a fonte única; `login.dto.ts:10` e `register.dto.ts:23` consomem `@NormalizeEmail()`; `login.dto.spec.ts:36-56` compara os dois DTOs em 3 grafias. |
| R1#2 — `bcrypt.compare` sempre executado (oracle de tempo) | efetiva | `auth.service.ts:11-14,46-49` — hash dummy de custo 10 no caminho de usuário inexistente; teste em `auth.service.spec.ts` com `vi.spyOn(bcrypt, 'compare')` exige 1 chamada em cada caminho de falha e respostas idênticas. |
| R1#3 — `expiresIn` via `ConfigService` | efetiva | `auth.module.ts:8,18-20` (`JWT_EXPIRES_IN` com fallback `15m`); `auth.module.spec.ts:19-30`; `.env.example:3`; teste de integração afirma `exp` numérico e `exp > iat`. |
| R1#4 — fail-fast de `JWT_SECRET` | efetiva | `auth.module.ts:10-14` lança no `useFactory` para segredo ausente/em branco; `auth.module.spec.ts:7-17` cobre `undefined` e `'   '`. |
| R1#5 — mensagem literal sem ponto | efetiva | `auth.service.ts:10` (`'Credenciais inválidas'`); asserções exatas de `message` em `auth.service.spec.ts` e `auth.controller.spec.ts`. |
| R1#6 — teste de query menos acoplado | efetiva | `auth.service.spec.ts`: `expect(prisma.user.findUnique).toHaveBeenCalledWith(expect.any(Object))`. |
| Verificação de testes (método do revisor) | atendido | `npm test --prefix apps/api` → 11 arquivos, **77 testes aprovados**. Os logs `ERROR` na saída são dos casos pré-existentes de `GlobalExceptionFilter`, não falhas. |

## Apontamentos

(nenhum)
