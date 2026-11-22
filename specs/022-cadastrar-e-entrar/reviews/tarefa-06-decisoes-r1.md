# Decisões — Tarefa 6, rodada 1

| # | Apontamento (resumo) | Parecer | Decisão | Justificativa |
| --- | --- | --- | --- | --- |
| 1 | Destaque visual de CA5 inexistente: classes `.register-page`, `.form-group`, `.field-error`, `.error-message`, `.success-message` não definidas em nenhum CSS | código | aceito | — |
| 2 | Testes não exercitam o componente e são acoplados aos helpers internos: remover o guard do `handleSubmit` ou o banner de erro deixa os testes verdes; não há teste de descarte ao desmontar (CA10) | código | aceito | — |
