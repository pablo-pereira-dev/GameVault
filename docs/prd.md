# 📄 Product Requirements Document (PRD)

**Projeto:** GameVault (nome provisório = nome do repositório)
**Versão:** 0.1.3 · rascunho completo (não commitado)
**Última atualização:** 2026-09-13

> 🤖 **Este documento é a fonte da verdade sobre o QUE o produto faz.** Regra de
> negócio que não estiver aqui não existe — nem para a equipe, nem para a IA.
> Tecnologia **não** se discute aqui: isso é assunto do `architecture.md`.
>
> ✍️ Rascunho completo via `/utf-prd` — aguardando leitura e commit do aluno.

---

## 🎯 1. Visão Geral e Objetivo

**O problema:** o jogador não tem um único lugar onde encontrar e visualizar jogos disponíveis para compra.

**A solução:** o produto é uma vitrine de jogos onde o usuário navega pelo catálogo, adiciona jogos ao carrinho e realiza pedidos com pagamento.

**Como saberemos que deu certo:** ao finalizar um pedido, o estoque do jogo diminui e o usuário passa a ter uma seção própria onde visualiza os itens que comprou.

---

## 📖 2. Glossário Ubíquo

> Os termos do negócio, como o cliente fala. É daqui que o `architecture.md`
> deriva os nomes das entidades.

| Termo | Significa | Não confundir com |
| :---- | :-------- | :---------------- |
| **jogo** | A entidade que o usuário pode adquirir | com *pedido* — o jogo existe independente de ser comprado |
| **loja** | A página onde são exibidos todos os jogos disponíveis | com *minhas compras* — a loja mostra o que ainda dá para comprar |
| **carrinho** | Onde o usuário vê os jogos que tem interesse antes de realizar o pedido | com *pedido* — no carrinho ainda não há compromisso de compra (o estoque não muda) |
| **estoque** | A quantidade total de unidades de cada jogo disponíveis para venda | com *unidades vendidas* — o estoque só diminui quando o pedido é pago |
| **pagamento** | O ato de confirmar o pedido dos produtos | com *pedido* — o pedido existe antes de ser pago |
| **minhas compras** | Onde são listados todos os pedidos que o usuário já pagou | com *carrinho* — só entra aqui o que teve pagamento confirmado |

---

## 👤 3. Atores e Permissões

> ⚠️ A coluna **"Não pode"** vira Guard e controle de role na API.

| Ator | Quem é | Pode | Não pode |
| :--- | :----- | :--- | :------- |
| **Usuário** | Pessoa que navega na loja e compra jogos | Visualizar os jogos disponíveis; visualizar um jogo específico ao selecioná-lo; adicionar e remover jogos do carrinho; ver as próprias compras; fazer o pedido | Adicionar jogos ao estoque; cancelar uma compra já realizada; excluir um jogo da loja; editar as informações de um jogo; alterar manualmente o valor total do carrinho |
| **Administrador** | Responsável pelo catálogo e estoque | Adicionar, remover e editar um jogo do estoque | Alterar o total de um carrinho de um usuário; realizar pedidos como se fosse um usuário; apagar o histórico de compras de um usuário |

---

## 📝 4. Escopo Funcional (User Stories)

> Uma story por vez, no formato do modelo abaixo. Cada uma carrega dois eixos:
> **Prioridade (MoSCoW)** — `Must Have` é o escopo comprometido do projeto
> (o escopo mínimo da ficha é `Must Have` por definição); `Should`/`Could`
> entram se sobrar tempo, mas ficam documentadas — nada se perde; o
> `Won't Have` vira item da seção *Fora de Escopo* — e **Tamanho (esforço)** —
> `S` cabe numa sessão, `M` vira algumas tarefas no plano, `L` pede divisão.
> Toda story nasce `Draft` — **só você promove a `Ready`**; `Live` é quando o PR
> da história mescla (o auditor final confere).

### US01 — Visualizar jogos na loja · `Must Have` · `S` · Status: `⚪ Draft`

<!-- Status: `⚪ Draft` (não codificar) · `🟡 Ready` (vira Issue) · `🟢 Live` (PR mesclado) -->

**Como** usuário, **eu quero** visualizar os jogos disponíveis na loja **para que** eu possa escolher o que comprar.

**Critérios de aceite:**

- [ ] **Dado** que há jogos cadastrados, **quando** abro a loja, **então** vejo a lista de jogos disponíveis.
- [ ] **Dado** que ainda não há jogos cadastrados, **quando** abro a loja, **então** vejo uma mensagem informando que não há jogos cadastrados, em vez de uma página quebrada.

**Regras relacionadas:** RN01

---

### US02 — Ver detalhes de um jogo · `Must Have` · `S` · Status: `⚪ Draft`

**Como** usuário, **eu quero** selecionar um jogo na loja e ver seus detalhes **para que** eu decida se vale a compra.

**Critérios de aceite:**

- [ ] **Dado** que há informações completas, **quando** seleciono o jogo, **então** vejo as informações sobre ele.
- [ ] **Dado** que há informações parciais, **quando** seleciono o jogo, **então** vejo as informações disponíveis e uma indicação das que estão faltando.
- [ ] **Dado** que não há informações, **quando** seleciono o jogo, **então** vejo uma mensagem informando que não há informações, em vez de uma página quebrada.

**Regras relacionadas:** —

---

### US03 — Adicionar jogo ao carrinho · `Must Have` · `M` · Status: `⚪ Draft`

**Como** usuário, **eu quero** adicionar um jogo ao meu carrinho **para que** eu possa reservá-lo antes de comprar.

**Critérios de aceite:**

- [ ] **Dado** que há item em estoque, **quando** tento adicionar um jogo ao carrinho, **então** visualizo o jogo no carrinho.
- [ ] **Dado** que não há estoque do item, **quando** tento adicionar um jogo ao carrinho, **então** recebo uma mensagem informando que não há o item em estoque.

**Regras relacionadas:** RN01, RN02

---

### US04 — Remover jogo do carrinho · `Must Have` · `S` · Status: `⚪ Draft`

**Como** usuário, **eu quero** remover um jogo do meu carrinho **para que** eu possa ajustar o que pretendo comprar antes de fechar o pedido.

**Critérios de aceite:**

- [ ] **Dado** que há item no carrinho, **quando** tento remover o jogo, **então** o jogo é removido e, caso não haja mais jogos, é exibida a mensagem de carrinho vazio.
- [ ] **Dado** que o carrinho sumiu, **quando** ainda não finalizei a compra, **então** recebo uma mensagem informando que o carrinho está vazio.

**Regras relacionadas:** RN02

---

### US05 — Fazer o pedido (checkout) · `Must Have` · `M` · Status: `⚪ Draft`

**Como** usuário, **eu quero** fechar o pedido com os jogos do meu carrinho **para que** eu confirme minha compra.

**Critérios de aceite:**

- [ ] **Dado** que há itens no carrinho, **quando** finalizo a compra, **então** recebo a confirmação de que o pagamento foi realizado e sou redirecionado para a lista de compras realizadas.
- [ ] **Dado** que há itens no carrinho sem estoque, **quando** finalizo a compra, **então** recebo uma mensagem informando qual produto está sem estoque e permaneço na tela do carrinho.

**Regras relacionadas:** RN01, RN02

---

### US06 — Pagamento confirmado · `Must Have` · `M` · Status: `⚪ Draft`

**Como** usuário, **eu quero** que meu pedido só seja dado como pago quando o pagamento for realmente confirmado **para que** apenas compras aprovadas baixem o estoque e apareçam em minhas compras.

**Critérios de aceite:**

- [ ] **Dado** que o pagamento foi aprovado, **quando** a confirmação chega, **então** o pedido é marcado como pago, vai para as compras realizadas e o estoque diminui na quantidade comprada.
- [ ] **Dado** que o pagamento não foi autorizado, **quando** eu finalizo o pedido, **então** recebo uma mensagem informando que a compra foi recusada.
- [ ] **Dado** que o gateway não confirmou o pagamento, **quando** o sistema avalia o pedido, **então** o pedido não é marcado como pago.
- [ ] **Dado** que o pedido já teve pagamento realizado, **quando** chega uma nova tentativa de pagamento, **então** o sistema impede o segundo pagamento.
- [ ] **Dado** que a compra não foi confirmada, **quando** o sistema processa o pedido, **então** o estoque não diminui e o pedido não aparece em "minhas compras".
- [ ] **Dado** que o gateway não responde em até 3 horas, **quando** o prazo expira, **então** a tentativa de pagamento é dada como expirada, o usuário é avisado de que nenhuma resposta foi recebida e pode tentar novamente.

**Regras relacionadas:** RN01, RN03, RN04, RN06

---

### US07 — Visualizar minhas compras · `Must Have` · `S` · Status: `⚪ Draft`

**Como** usuário, **eu quero** visualizar a lista dos meus pedidos já pagos **para que** eu possa acompanhar o que comprei.

**Critérios de aceite:**

- [ ] **Dado** que realizei compras, **quando** abro a tela "Minhas compras", **então** vejo a lista das minhas compras começando da mais recente.
- [ ] **Dado** que ocorre erro ao carregar, **quando** abro a tela "Minhas compras", **então** vejo uma mensagem de que não foi possível carregar a lista.
- [ ] **Dado** que ainda não realizei compras, **quando** abro a tela "Minhas compras", **então** vejo uma mensagem de que não há compras realizadas.

**Regras relacionadas:** RN04

---

### US08 — Cadastrar jogo (Administrador) · `Must Have` · `S` · Status: `⚪ Draft`

**Como** administrador, **eu quero** cadastrar um novo jogo com suas informações **para que** ele fique disponível na loja.

**Critérios de aceite:**

- [ ] **Dado** que estou cadastrando um jogo, **quando** adiciono as informações, **então** recebo uma mensagem de que o cadastro foi realizado e ele está disponível na loja.
- [ ] **Dado** que já existe um dado igual (jogo já cadastrado), **quando** tento cadastrar um jogo, **então** vejo uma mensagem informando que o dado já existe.
- [ ] **Dado** que faltam informações obrigatórias, **quando** tento cadastrar um jogo, **então** visualizo os campos faltantes em destaque, indicando o que está faltando.

**Regras relacionadas:** —

---

### US09 — Editar jogo (Administrador) · `Must Have` · `S` · Status: `⚪ Draft`

**Como** administrador, **eu quero** editar as informações de um jogo já cadastrado **para que** a loja se mantenha atualizada.

**Critérios de aceite:**

- [ ] **Dado** que há um jogo, **quando** edito suas informações, **então** visualizo uma mensagem de que o jogo foi atualizado.
- [ ] **Dado** que um jogo não existe mais, **quando** tento editar suas informações, **então** visualizo uma mensagem de que o jogo não está mais cadastrado.

**Regras relacionadas:** —

---

### US10 — Remover jogo (Administrador) · `Must Have` · `S` · Status: `⚪ Draft`

**Como** administrador, **eu quero** remover um jogo da loja **para que** eu possa tirar da vitrine algo que não devo mais vender.

**Critérios de aceite:**

- [ ] **Dado** que o jogo existe, **quando** excluo do estoque, **então** vejo uma mensagem de que a operação foi realizada com sucesso.
- [ ] **Dado** que o jogo não existe mais, **quando** excluo, **então** vejo uma mensagem informando que o jogo foi removido.
- [ ] **Dado** que ocorre algum erro no processo, **quando** excluo o jogo, **então** vejo uma mensagem de que não foi possível realizar a operação e o jogo não é removido do estoque.

**Regras relacionadas:** RN05

---

## 🛡️ 5. Regras de Negócio (Constraints)

| ID | Regra |
| :-- | :---- |
| RN01 | O estoque de um jogo só diminui quando o pagamento do pedido é confirmado. |
| RN02 | O valor total do carrinho é sempre calculado pelo sistema — ninguém altera o total manualmente. |
| RN03 | Um pedido não pode ter mais de um pagamento aprovado. |
| RN04 | Um pedido só entra para "minhas compras" se o pagamento for confirmado pelo gateway. |
| RN05 | Um jogo pode ser removido da loja, mas pedidos pagos que o referenciam continuam visíveis no histórico de "minhas compras" (remoção visual; a compra não é apagada). |
| RN06 | Uma tentativa de pagamento expira se o gateway não responder em 3 horas; o sistema avisa o usuário de que nenhuma resposta foi recebida e ele pode tentar novamente. |

---

## 🚫 6. Fora de Escopo (Non-goals)

> O que o produto deliberadamente **não** faz neste semestre — o `Won't Have`
> do MoSCoW, com o motivo de cada corte.

- **Avaliação de jogos (notas/opiniões de usuários)** — recurso de comunidade e engajamento; o semestre é focado na venda (catálogo → carrinho → pedido → pagamento).
- **Venda entre usuários / venda de jogos usados** — o vendedor é sempre a loja, com seu catálogo de jogos; revenda e mercado entre pessoas ficam fora.
- **Parcerias e cupons de desconto** — precificação por fora complica o escopo; o preço é único e definido pelo administrador (não há desconto aplicado na compra).
- **Cancelamento ou estorno de compra** — compra paga não pode ser cancelada; o sistema não oferece fluxo de cancelamento nem de devolução (movido da antiga RN02).

---

## ⚙️ 7. Requisitos Não Funcionais (Qualidade)

> Só os que você consegue justificar na defesa.

- **Segurança de acesso:** apenas o usuário autenticado acessa o próprio carrinho e as próprias compras; senhas nunca são armazenadas em texto puro. *(o mecanismo de autenticação é decisão do `/utf-architecture`)*
- **Compatibilidade:** o sistema funciona nos principais navegadores modernos (Chrome, Edge, Firefox, Safari) nas versões atuais.
- **Consistência do estoque (concorrência):** dois pedidos simultâneos nunca vendem a mesma unidade; o estoque é revalidado no fechamento do pedido e na confirmação do pagamento.
- **Estado do pedido sempre definido:** todo pedido termina em um estado reconhecível — aguardando pagamento, pago ou recusado — e o usuário sempre consegue saber em qual está.

---

## 📌 Dúvidas em aberto

| # | Dúvida | Onde precisa ser resolvida |
| :-- | :------ | :-------------------------- |
| 1 | Aceite do professor para o tema (único na turma) ainda pendente. | Antes de qualquer story virar Issue (`/utf-backlog`). |

---

## 🛠️ 8. Histórico

| Data | Versão | O que mudou |
| :--- | :----- | :---------- |
| 2026-09-13 | 0.1.3 | Nova RN06 (expiração da tentativa de pagamento em 3h) e critério correspondente na US06 — decisão dos nós vermelhos do /utf-flows |
| 2026-09-13 | 0.1.2 | US08 com critérios tristes (duplicado + campos obrigatórios); seção 7 (NFRs) preenchida |
| 2026-09-13 | 0.1.1 | Fora de Escopo preenchido; cancelamento de compra movido da RN02 para Fora de Escopo; RNs renumeradas e referências atualizadas |
| 2026-09-13 | 0.1.0 | Rascunho em entrevista — seções 1 a 5 (US01–US10, RN01–06) |