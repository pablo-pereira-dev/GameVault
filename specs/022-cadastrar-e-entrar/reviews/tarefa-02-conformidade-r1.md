# Parecer de Conformidade — Tarefa 2

**Veredito:** APROVADO

## Critérios verificados
| Critério (da spec) | Situação | Onde |
| --- | --- | --- |
| CA1 — cadastro grava `role: USER` | atendido | `apps/api/src/auth/auth.service.ts:18`; `apps/api/src/auth/auth.service.spec.ts:54-67` (unitário) e `:108-119` (integração no banco) |
| CA1 — senha persistida como hash bcrypt, sem texto legível | atendido | `apps/api/src/auth/auth.service.ts:15` (bcrypt, salt 10); `auth.service.spec.ts:33-52` (`bcrypt.getRounds` = 10 e `bcrypt.compare` = true); `:123-125` (hash real lido do banco) |
| CA1 — resposta do cadastro não devolve senha/hash | atendido | `apps/api/src/auth/auth.service.ts:19` (`select` sem `passwordHash`); `auth.controller.spec.ts:56-62`; `auth.service.spec.ts:117-119` |
| CA2 — e-mail duplicado recusado com HTTP 409 e mensagem de e-mail em uso | atendido | `apps/api/src/auth/auth.service.ts:22-24` (`P2002` → `ConflictException('E-mail já está em uso.')`); `auth.service.spec.ts:69-77`; `auth.controller.spec.ts:93-105` |
| CA2 — sem duplicar registros no banco | atendido | `auth.service.spec.ts:128-138` (`count(...) === 1` após a segunda tentativa) |
| CA5 (metade do servidor) — campos obrigatórios em branco/ausentes | atendido | `apps/api/src/auth/dto/register.dto.ts:8-10`; `register.dto.spec.ts:24-38`; `auth.controller.spec.ts:66-73` |
| CA5 (metade do servidor) — e-mail malformado | atendido | `register.dto.ts:17`; `register.dto.spec.ts:44-46`; `auth.controller.spec.ts:75-82` |
| CA5 (metade do servidor) — senha menor que 6 caracteres | atendido | `register.dto.ts:26`; `register.dto.spec.ts:54-56`; `auth.controller.spec.ts:84-91` |
| CA5 — validação realmente ativa no app (não só no teste) | atendido | `ValidationPipe` global com `whitelist`/`forbidNonWhitelisted` em `apps/api/src/app.module.ts:24-31`, equivalente ao usado nos testes |
| Escopo — nada de login/JWT/guards desta tarefa implementado | atendido | diff contém apenas `auth.service`, `auth.controller`, `auth.module`, `dto/register.dto` e specs; nenhum artefato de Tarefas 3–4 |
| Escopo — arquivos previstos entregues | atendido | todos os quatro arquivos previstos + `app.module.ts` apenas com o wiring de `AuthModule` (necessário para o endpoint existir) |

Testes: `npm test --prefix apps/api` → 9 arquivos / 38 testes passando; os dois testes de integração de `AuthService` executam contra o PostgreSQL real (`auth.service.spec.ts:92-101`, 481ms e 248ms no run verbose), não são mock.

## Apontamentos
Nenhum.
