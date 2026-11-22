# Decisões — Tarefa 2, rodada 1

| # | Apontamento (resumo) | Parecer | Decisão | Justificativa |
| --- | --- | --- | --- | --- |
| 1 | E-mail persistido sem normalização de caixa; unicidade depende de índice case-sensitive (`register.dto.ts:13-18`, `auth.service.ts:18-21`) | código | aceito | — |
| 2 | `name` aceita só espaços — `@IsNotEmpty()` aprova `"   "` (`register.dto.ts:9-11`) | código (sugestão promovida pelo usuário) | aceito | — |
