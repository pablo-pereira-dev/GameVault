# 🎨 Tokens de Design

**Projeto:** GameVault
**Versão:** 0.2.1 · completo (revisado)
**Última atualização:** 2026-10-11

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
| `fundo` | `#0b0f19` (obsidiana profunda) | fundo da loja (vitrine e páginas) |
| `superficie` | `#111827` (ardósia escura) | cards de jogo, menus, carrinho, modais |
| `superficie-alta` | `#1f293d` (ardósia elevada) | hover de cards, popovers, superfícies elevadas |
| `primaria` | `#6366f1` (electric indigo) | ações de compra: botões "Comprar Agora", "Adicionar ao Carrinho", checkout |
| `secundaria` | `#06b6d4` (ciano neon) | especificações técnicas, plataformas (PC, Mac, Cloud), badges e filtros ativos |
| `sucesso` | `#10b981` (emerald mint) | confirmações de compra, descontos (-60%), gratuidade ("Grátis"), tags de lançamento |
| `perigo` | `#ba1a1a` (vermelho escuro) | erros: sem estoque, compra recusada, falhas |
| `texto` | `#f9fafb` (branco off-white) | texto principal (alto contraste sobre fundo escuro) |
| `texto-suave` | `#9ca3af` (cinza ardósia) | legendas, metadados, "pagamento em processamento" |
| `desabilitado` | `#313540` (cinza escuro) | controles inativos (finalizar com carrinho vazio) |
| `borda` | `#374151` (borda sutil) | contornos de cards e divisores de seção |

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

Famílias principais: **Space Grotesk** (títulos, preços, badges) e **Hanken Grotesk** (corpo, metadados, rótulos).  
Fallback: `sans-serif` do sistema.

| Token | Família | Tamanho | Peso | Papel |
| :--- | :--- | :--- | :--- | :--- |
| `t1` | Space Grotesk | 32px | 700 (bold) | Nome da loja (GameVault), título de página |
| `t2` | Space Grotesk | 20px | 600 (semibold) | Título de card de jogo, título de seção |
| `t3` | Space Grotesk | 20px | 700 (bold) | Preço em destaque |
| `t4` | Space Grotesk | 14px | 700 (bold) | Badges de desconto (-50% OFF) |
| `t5` | Hanken Grotesk | 14px | 600 (semibold) | Rótulos, metadados, plataformas, avaliações |
| `t6` | Hanken Grotesk | 14px | 400 (regular) | Corpo de texto, descrições, mensagens de status |

---

## Estados de botão

Todo botão da vitrine (principal = cor `primaria`) passa por estes cinco estados.

| Estado | Como fica |
| :--- | :--- |
| **normal** | fundo `primaria` (`#6366f1`), texto branco (`#ffffff`) |
| **hover** | indigo mais escuro `#4f46e5`, texto branco |
| **foco (teclado)** | anel de 2px `secundaria` (`#06b6d4`) ao redor do botão |
| **desabilitado** | fundo `desabilitado` (`#313540`), texto `texto-suave` (`#9ca3af`), sem clique |
| **carregando** | `primaria` a 70% de opacidade + indicador de progresso (bloqueia duplo clique) |

---

## 🔗 Protótipo

- **Link (Loja & Admin):** [https://stitch.withgoogle.com/projects/17513263099732936981](https://stitch.withgoogle.com/projects/17513263099732936981)

### Telas das Jornadas Principais (`docs/user-flows.md`):
1. **Vitrine / Catálogo:** `Loja de Jogos - Catálogo Disponível` (`f1da8fefefde4794a7579485d8662f8e`)
2. **Detalhes do Jogo:** `Detalhes do Jogo - Informações Completas` (`45a33d554c4b44bc83f9d1ca3c400beb`)
3. **Carrinho:** `Carrinho de Compras - Item Adicionado com Sucesso` (`862f8a52fffe4725b3df6c3f8e566c4e`)
4. **Checkout (Jornada 1):** `Checkout - Pagamento com Cartão` (`a6c7458c58ec4df7b25fbdf47108f231`) e `Checkout - Redirecionamento Gateway` (`b29c9a3f94ed44f7ad171004b72e65ec`)
5. **Confirmação / Pedidos (Jornada 2):** `Confirmação de Pagamento e Histórico de Compras` (`040440abe9ea4159a8618e4a39c11d9e`) e `Minhas Compras - Lista de Pedidos Realizados` (`207b7a9d54a94897b37cd991a71d6070`)

### Telas Administrativas (Gestão de Jogos):
- **Cadastro:** `Cadastrar Jogo - Cadastro Realizado com Sucesso` (`e0abde75f53241fabb667c84dc9c03fa`)
- **Edição:** `Editar Jogo - Atualizado com Sucesso` (`082245515fe845dba953529285f138ed`)
- **Remoção:** `Remover Jogo - Operação Realizada com Sucesso` (`c3acd57050a44490b37e9ba1abb9d42c`)

---

## 📌 Dúvidas em aberto

| # | Dúvida | Onde precisa ser resolvida |
| :-- | :------ | :-------------------------- |
| - | *Nenhuma pendência no momento.* | Protótipo vinculado e tokens semânticos ratificados. |

---

## 🛠️ Histórico

| Data | Versão | O que mudou |
| :--- | :----- | :---------- |
| 2026-10-11 | 0.2.1 | Paleta de cores e estados de botão atualizados para o tema escuro do Stitch (Electric Indigo, Ciano Neon, Menta, Obsidiana) |
| 2026-10-11 | 0.2.0 | Revisão via `/utf-design`: tipografia atualizada para Space Grotesk + Hanken Grotesk e registro do link/telas do protótipo Stitch (loja e admin) |
| 2026-09-13 | 0.1.0 | Paleta, espaçamento, tipografia (Plus Jakarta Sans) e estados de botão definidos via `/utf-design` |