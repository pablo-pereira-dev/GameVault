# Decisões — Tarefa 2, rodada 1

| # | Apontamento (resumo) | Parecer | Decisão | Justificativa |
| --- | --- | --- | --- | --- |
| 1 | GamesModule não importado no AppModule | código | aceito | Necessário para registrar o módulo no container do NestJS (ID6). |
| 2 | ValidationPipe configurado localmente em vez de global | código | aceito | Arquitetura exige ValidationPipe global no main.ts com whitelist e forbidNonWhitelisted (ID7). |
| 3 | Resposta de sucesso fora do envelope global { data: ... } | código | aceito | Contrato global da API exige serialização em { data: ... } via interceptor ou serialização (ID10). |
