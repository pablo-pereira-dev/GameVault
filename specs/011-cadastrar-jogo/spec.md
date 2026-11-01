---
issue: 11
status: aprovada
---

# US08 — Cadastrar jogo (Administrador)

## O problema

Administradores precisam de uma forma prática e validada de cadastrar novos jogos na plataforma, informando título, descrição, preço, estoque e imagem, para que os produtos fiquem disponíveis para compra na vitrine da loja.

## A história

**Como** administrador, **eu quero** cadastrar um novo jogo com suas informações **para que** ele fique disponível na loja.

## Critérios de aceite

- [ ] **CA1 — Dado** que estou cadastrando um jogo com todas as informações obrigatórias preenchidas corretamente, **quando** submeto o formulário de cadastro, **então** recebo uma mensagem de que o cadastro foi realizado e o jogo fica disponível na loja.
- [ ] **CA2 — Dado** que já existe um jogo cadastrado com o mesmo título, **quando** tento cadastrar o jogo, **então** vejo uma mensagem informando que o dado já existe (conflito).
- [ ] **CA3 — Dado** que faltam informações obrigatórias (como título, preço ou estoque), **quando** tento cadastrar o jogo, **então** visualizo os campos faltantes em destaque, indicando o que está faltando.
- [ ] **CA4 — Dado** que fecho a aba quando estou cadastrando um jogo, **quando** retorno ao sistema, **então** as informações preenchidas são descartadas e nenhum registro é criado.
- [ ] **CA5 — Dado** que caia a conexão de rede, **quando** tento cadastrar um jogo, **então** devo receber uma mensagem informando a perda de conexão após alguns segundos de espera.

## Fora de escopo

- Edição de jogos existentes (coberto por US09).
- Remoção de jogos (coberto por US10).
- Upload físico de arquivos de imagem (será utilizado campo de texto `imageUrl`).

## Abandono no meio

- Caso o administrador feche a aba ou cancele a operação durante o preenchimento do formulário, as informações preenchidas são descartadas e nenhum registro é criado no sistema (CA4).
- Caso ocorra queda de conexão de rede durante a submissão, o sistema exibe mensagem informando a perda de conexão após o tempo limite de espera (CA5).

## Assume que

| Premissa | Issue que fecha |
| --- | --- |
| Autenticação de Administrador via JWT/Roles `@Roles(Role.ADMIN)` | US01 / Sistema base |

## Depende de

- Infraestrutura de banco de dados Prisma e módulo de jogos (`games`) básico.

## Dúvidas em aberto

| # | Dúvida | Quem responde |
| --- | --- | --- |
