# Parecer de Conformidade — Tarefa 2

**Veredito:** APROVADO

## Critérios verificados
| Critério (da spec) | Situação | Onde |
| --- | --- | --- |
| CA1 — conta criada com `role: USER` | atendido | `apps/api/src/auth/auth.service.ts:19` (`role: Role.USER`); teste unitário `auth.service.spec.ts:54-67` e integração real `:120-136` |
| CA1 — senha armazenada como hash bcrypt, sem texto legível | atendido | `auth.service.ts:15` (`bcrypt.hash`, salt 10); `auth.service.spec.ts:32-52` (`getRounds=10`, `bcrypt.compare=true`); hash lido do banco em `:123-125` |
| CA1 — resposta não devolve senha/hash | atendido | `auth.service.ts:20` (`select` sem `passwordHash`); `auth.controller.spec.ts:61-62`; `auth.service.spec.ts:134-135` |
| CA2 — e-mail duplicado recusado com HTTP 409 e mensagem de conflito | atendido | `auth.service.ts:23-24` (`P2002` → `ConflictException('E-mail já está em uso.')`); `auth.service.spec.ts:69-77`; `auth.controller.spec.ts:106-118` |
| CA2 — sem duplicar registros no banco | atendido | `auth.service.spec.ts:160` (`count === 1` após a segunda tentativa) |
| CA5 (metade do servidor) — campos obrigatórios/formatos inválidos recusados com 400, sem chamar o serviço | atendido | `register.dto.ts:17-18,26,34-35`; `register.dto.spec.ts:26-70`; `auth.controller.spec.ts:88-104`; `ValidationPipe` global em `app.module.ts` |
| **Correção 1 (rodada 1) — normalização de caixa do e-mail no DTO** | **efetiva** | `register.dto.ts:8-9,25` (`@Transform(normalizeEmail)` = `trim().toLowerCase()`); prova em `register.dto.spec.ts:46-49`, `auth.controller.spec.ts:66-77` (caminho HTTP) e `auth.service.spec.ts:147-160` (contra o banco: caixa mista → 409 e `count === 1`) |
| **Correção 2 (rodada 1) — `name` só espaços recusado com 400** | **efetiva** | `register.dto.ts:5-6,16-18` (`@Transform(trimString)` converte `"   "` em `""` antes do `@IsNotEmpty()`); prova em `register.dto.spec.ts:36-37` e `auth.controller.spec.ts:79-86` (`expect(400)` + `register` não chamado) |
| Escopo — apenas Register, sem artefatos de Login/JWT/Guards (Tarefas 3-4) | atendido | diff contém só `auth.service`, `auth.controller`, `auth.module`, `dto/register.dto` + specs e o wiring de `AuthModule` em `app.module.ts` |
| Glossário — termos `User`, `passwordHash`, `role` USER/ADMIN | atendido | `docs/architecture.md:148` x `auth.service.ts:19-20`; sem divergência |

Testes: `npm test --prefix apps/api` → **9 arquivos / 45 testes passando** (os logs `ERROR` de `GlobalExceptionFilter` são esperados, dos testes de tratamento de erro). As correções acrescentaram 7 testes em relação aos 38 da rodada 1, todos verdes.

## Apontamentos
Nenhum.
