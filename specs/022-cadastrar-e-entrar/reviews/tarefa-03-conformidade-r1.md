# Parecer de Conformidade — Tarefa 3

**Veredito:** APROVADO

## Critérios verificados
| Critério (da spec) | Situação | Onde |
| --- | --- | --- |
| CA3 —metade backend: emissão de token JWT e resposta de sucesso para credenciais corretas | atendido | `auth.service.ts:36-54` (busca, `bcrypt.compare`, `signAsync` com `sub/email/role`, retorno `{ accessToken }`); `auth.controller.ts:22-31` (`POST /auth/login`, HTTP 200); provas em `auth.service.spec.ts` (unitário e integração) e `auth.controller.spec.ts` (integração HTTP com `jwt.verify`) |
| CA4 — HTTP 401 genérico idêntico para e-mail não cadastrado e senha incorreta | atendido | `auth.service.ts:40-46` (mesma `UnauthorizedException`'Credenciais inválidas.' nos dois caminhos); corpo `{ statusCode, message, error }` idêntico assertido em `auth.controller.spec.ts` (unitário e integração real com Prisma) e em `auth.service.spec.ts` (comparação de `getResponse()`) |
| CA5 — metade servidor: DTO + ValidationPipe recusando com HTTP 400 | atendido | `dto/login.dto.ts:8-26` (`@IsEmail`, `@IsString`, `@MinLength(6)`, whitelist); `dto/login.dto.spec.ts` (campos ausentes, e-mail malformado, senha curta/branca, propriedades extras); `auth.controller.spec.ts` (400 com `expect(authService.login).not.toHaveBeenCalled()`); pipe global já vigente em `app.module.ts:24-31` |
| Escopo da tarefa — sem guardas, `/auth/me` ou frontend | atendido | O diff contém apenas `auth.service.ts`, `auth.controller.ts`, `auth.module.ts`, `dto/login.dto.ts` e seus testes; nenhum guard, decorator, rota `/auth/me` ou arquivo em `apps/web` |

**Sobre `auth.module.ts` (fora da lista de arquivos previstos):** edição necessária e legítima. `AuthService` agora injeta `JwtService` (`auth.service.ts:16`), e não existe registro global de `JwtModule` em `app.module.ts`; sem `JwtModule.registerAsync` em `auth.module.ts:11-17` a aplicação não resolveria a dependência. O registro busca o segredo via `ConfigService` (`JWT_SECRET`), conforme a decisão técnica do `plan.md:6` e ID17 de `docs/architecture.md` — não é escopo inflado, é infraestrutura obrigatória da emissão de token.

**Testes:** `npm test --prefix apps/api` → 10 arquivos, 71 testes, todos aprovados (inclusive os testes de integração com banco real). O destaque visual de campos (CA5) e redirecionamento/cabeçalho (CA3) permanecem nas tarefas 6/7 e 5/7, respectivamente — corretamente fora deste diff.

## Apontamentos

(nenhum)
