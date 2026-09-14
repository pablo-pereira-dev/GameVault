# 🎨 Tokens de Design

**Projeto:** GameVault
**Versão:** 0.1.0 · completo (não commitado)
**Última atualização:** 2026-09-13

> 🤖 **Este documento existe para a IA parar de inventar um botão diferente a cada
> tela.** Não é um design system — é o mínimo que dá à prototipagem assistida algo a
> que obedecer.
>
> ✍️ Definido via `/utf-design`. Sempre que uma tela precisar de um valor novo que não
> está aqui, ele entra **com papel semântico** — nunca pelo nome da aparência.

---

## Paleta

Nome semântico, nunca `azul-2` — a cor muda, o papel dela não.

| Token | Valor | Onde se usa |
| :--- | :--- | :--- |
| `fundo` | `#0f172a` (azul-escuro) | fundo da loja (vitrine) |
| `superficie` | `#f8fafc` (quase branco) | cards de jogo, menus, carrinho |
| `primaria` | `#16a34a` (verde) | ação de compra: botão de finalizar, adicionar ao carrinho |
| `texto` | `#0f172a` (azul-escuro) | texto principal (sobre superfície) |
| `texto-suave` | `#64748b` (cinza) | legendas, descrições, "pagamento em processamento" |
| `sucesso` | `#22c55e` (verde-claro) | confirmações: pagamento aprovado, cadastro realizado |
| `perigo` | `#dc2626` (vermelho) | erros: item sem estoque, compra recusada, falha ao carregar |
| `desabilitado` | `#cbd5e1` (cinza-claro) | controles inativos (finalizar com carrinho vazio) |

---

## Escala de espaçamento

Uma progressão só — é ela que faz as telas "encaixarem" entre si.

| Token | Valor | Onde se usa |
| :--- | :--- | :--- |
| `esp-1` | 4px | respiros mínimos entre elementos |
| `esp-2` | 8px | espaçamento interno de cards e botões |
| `esp-3` | 16px | espaçamento padrão entre seções |
| `esp-4` | 24px | margens de página e áreas de destaque |
| `esp-5` | 32px | separação entre grandes blocos da tela |

---

## Tipografia

Família principal: **Plus Jakarta Sans** (fallback: sans-serif do sistema).

| Token | Tamanho | Peso | Papel |
| :--- | :--- | :--- | :--- |
| `t1` | 32px | 700 (bold) | Nome da loja (GameVault), título de página |
| `t2` | 20px | 600 (semibold) | Título de card de jogo, título de seção |
| `t3` | 20px | 800 (extrabold) | Preço em destaque |
| `t4` | 14px | 800 (extrabold) | Badges de desconto (-50% OFF) |
| `t5` | 16px | 500 (medium) | Gêneros, avaliação (★ 4.9), metadados, plataformas |
| `t6` | 14px | 400 (regular) | Corpo, descrições, legendas |

---

## Estados de botão

Todo botão da vitrine (principal = cor `primaria`) passa por estes cinco estados.

| Estado | Como fica |
| :--- | :--- |
| **normal** | fundo `primaria` (`#16a34a`), texto branco |
| **hover** | verde mais escuro `#15803d`, texto branco |
| **foco (teclado)** | anel de 2px `sucesso` (`#22c55e`) ao redor do botão |
| **desabilitado** | fundo `desabilitado` (`#cbd5e1`), texto `texto-suave`, sem clique |
| **carregando** | `primaria` a 70% de opacidade + indicador de progresso (bloqueia duplo clique) |

---

## 🔗 Protótipo

- **Link:** pendente — o aluno ainda não tem protótipo. Não inventar endereço.

Quando a pendência for resolvida: as telas do protótipo devem ser **as das jornadas do
`docs/user-flows.md`** (vitrine, detalhe do jogo, carrinho, checkout/pagamento, minhas
compras) — é assim que o protótipo vira insumo da prototipagem assistida por IA, em vez
de decoração.

---

## 📌 Dúvidas em aberto

| # | Dúvida | Onde precisa ser resolvida |
| :-- | :------ | :-------------------------- |
| 1 | Protótipo (3 a 5 telas das jornadas) ainda não existe. | Antes/na prototipagem da Entrega 3; também alimenta o `/utf-architecture`. |

---

## 🛠️ Histórico

| Data | Versão | O que mudou |
| :--- | :----- | :---------- |
| 2026-09-13 | 0.1.0 | Paleta, espaçamento, tipografia (Plus Jakarta Sans) e estados de botão definidos via `/utf-design` |