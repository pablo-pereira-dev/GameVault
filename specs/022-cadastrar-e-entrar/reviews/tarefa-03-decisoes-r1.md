# Decisões — Tarefa 3, rodada 1

| # | Apontamento (resumo) | Parecer | Decisão | Justificativa |
| --- | --- | --- | --- | --- |
| 1 | Regra de normalização de e-mail duplicada entre `login.dto.ts:6` e `register.dto.ts:8` — extrair `@Transform` compartilhado | código | aceito | — |
| 2 | Short-circuit do `bcrypt.compare` em `auth.service.ts:40` cria oracle de tempo (CA4) — sempre comparar contra hash dummy | código | aceito | — |
| 3 | JWT sem `expiresIn` — tokens eternos; adicionar `signOptions` via `ConfigService` | código (sugestão promovida) | aceito | — |
| 4 | Fail-fast do segredo — validar `JWT_SECRET` ausente no boot da aplicação | código (sugestão promovida) | aceito | — |
| 5 | Texto da mensagem — usar o literal exato do plano, `"Credenciais inválidas"` (sem ponto) | código (sugestão promovida) | aceito | — |
| 6 | `toHaveBeenCalledWith({ where: { email } })` prende o teste à forma da query — afrouxar para `expect.any(Object)` | código (sugestão promovida) | aceito | — |
