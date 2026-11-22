---
issue: 22
status: rascunho   # rascunho | aprovada
---

# US11 — Cadastrar e entrar no sistema

## O problema

Atualmente o sistema não possui controle de identidade ou sessão. Qualquer pessoa acessa a loja como visitante anônimo, impossibilitando que clientes acessem dados exclusivos (como carrinho próprio, pedidos pagos em "Minhas Compras") e impedindo que a área administrativa restrinja a gestão do catálogo aos administradores autorizados.

## A história

**Como** visitante ou usuário, **eu quero** criar uma conta e entrar no sistema com minhas credenciais **para que** eu possa acessar os recursos exclusivos do meu perfil (como minhas compras, carrinho ou gestão do catálogo).

## Critérios de aceite

- [ ] **CA1 — Dado** que sou um visitante com dados válidos (nome, e-mail e senha), **quando** submeto meu cadastro, **então** minha conta é criada no banco com perfil de usuário comum (`role: USER`) e a senha é armazenada com hash criptográfico seguro (`bcrypt`), sem texto legível.
- [ ] **CA2 — Dado** que tento me cadastrar com um e-mail já cadastrado, **quando** confirmo o cadastro, **então** a aplicação recusa a operação informando conflito de e-mail em uso, sem duplicar registros no banco.
- [ ] **CA3 — Dado** que possuo cadastro ativo e informo credenciais corretas, **quando** solicito entrar, **então** sou autenticado com sucesso recebendo um token de acesso JWT, sou redirecionado para a vitrine da loja e vejo no cabeçalho minhas opções de perfil e ação de sair.
- [ ] **CA4 — Dado** que informo um e-mail não cadastrado OU uma senha incorreta, **quando** tento entrar, **então** recebo exatamente a mesma mensagem genérica de credenciais inválidas (HTTP 401), sem revelar se o e-mail existe no sistema.
- [ ] **CA5 — Dado** que deixo campos obrigatórios em branco ou com formato inválido (ex.: e-mail malformado ou senha menor que 6 caracteres), **quando** tento cadastrar ou entrar, **então** vejo o destaque visual dos campos a serem preenchidos/corrigidos e o envio não é realizado.
- [ ] **CA6 — Dado** que sou um usuário comum autenticado (`role: USER`), **quando** tento acessar qualquer rota ou funcionalidade restrita a administradores (ex.: rotas de gestão de jogos), **então** meu acesso é impedido com erro de permissão negada (HTTP 403 Forbidden).
- [ ] **CA7 — Dado** que estou autenticado, **quando** aciono a opção de sair (logout), **então** o token de acesso é removido da sessão local do navegador e a interface retorna ao estado deslogado.
- [ ] **CA8 — Dado** que minha sessão expirou ou o token JWT é inválido, **quando** tento realizar uma operação protegida (como consultar meu perfil em `/auth/me`), **então** a sessão é encerrada localmente e sou redirecionado para a tela de login.
- [ ] **CA9 — Dado** que ocorre falha de conexão de rede durante o cadastro ou login, **quando** tento enviar os dados, **então** recebo aviso de perda de conexão sem que a aplicação trave, mantendo os dados preenchidos no formulário para nova tentativa.
- [ ] **CA10 — Dado** que fecho a aba antes de submeter o formulário de cadastro ou login, **quando** retorno posteriormente à aplicação, **então** nenhum dado não salvo é mantido ou persistido.

## Fora de escopo

- Redefinição ou recuperação de senha por e-mail ("esqueci minha senha").
- Login social / OAuth (Google, GitHub, etc.).
- Confirmação de e-mail com envio de link de ativação.
- Interface visual para criação e atribuição de administradores (a atribuição de administrador é estritamente manual direta no banco, conforme RN07).

## Abandono no meio

- Caso a conexão falhe durante o envio do cadastro ou do login, o sistema exibe feedback de falha de conexão e mantém os campos preenchidos para que o usuário tente novamente sem precisar redigitar tudo (CA9).
- Caso o visitante feche a aba ou saia da página durante o preenchimento, as informações digitadas são descartadas e nenhuma credencial ou sessão residual é gravada (CA10).
- Caso o usuário tente navegar com token JWT expirado ou adulterado, a validação de sessão falha, os dados locais da sessão são limpos e o usuário é redirecionado à tela de login (CA8).

## Assume que

| Premissa | Issue que fecha |
| --- | --- |
| Usuário administrador é provisionado diretamente no banco de dados via SQL pelo administrador do sistema (sem tela de cadastro de admin) | Operação manual permanente (RN07) |

## Depende de

- Infraestrutura de banco de dados PostgreSQL e Prisma ORM já integrados.

## Dúvidas em aberto

| # | Dúvida | Quem responde |
| --- | --- | --- |
