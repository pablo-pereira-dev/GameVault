# Parecer de Código — Tarefa 2

**Veredito:** APONTAMENTOS

Conferido sem apontamento: ID6 (Controller só delega, `AuthService` injeta `PrismaService`), ID8 (tudo via Prisma), ID10 (sucesso passa pelo `TransformInterceptor`; `ConflictException` cai no `GlobalExceptionFilter` e sai como `{statusCode, message, error}` — o teste de controller prova isso), `select` que impede `passwordHash` de vazar na resposta, e `forbidNonWhitelisted` bloqueando `role: 'ADMIN'` no corpo (defesa em profundidade contra escalada por mass assignment). Estrutura, DTO e testes seguem o padrão de `games` com fidelidade.

**Testes não executados:** este harness negou acesso a shell, então `npm test --prefix apps/api` não rodou. O parecer abaixo é estático, sobre a árvore de trabalho.

## Apontamentos (bloqueiam)

1. **E-mail é persistido sem normalização de caixa, e a unicidade depende só de um índice case-sensitive** — `apps/api/src/auth/dto/register.dto.ts:13-18` e `apps/api/src/auth/auth.service.ts:18-21`
   Regra violada: ID7 — a entrada da API é tratada no DTO + `ValidationPipe`, e a normalização do identificador é parte desse tratamento; hoje ela não acontece em lugar nenhum. O 409 inteiro repousa na `UNIQUE INDEX "User_email_key"` (`prisma/migrations/20261122144415_add_user_model/migration.sql:17`), que no PostgreSQL compara byte a byte.
   Prejuízo concreto: `Ada@Example.com` e `ada@example.com` passam os dois por `@IsEmail()` e viram duas contas — o P2002 nunca dispara e CA2 falha no caso mais comum de digitação (teclado móvel capitaliza a primeira letra). Pior na Tarefa 3: o login vai buscar `findUnique({ where: { email } })` com a caixa exatamente como o usuário digitou, então a conta criada como `Ada@…` devolve 401 com a senha certa. Consertar depois exige migração de dados e decisão sobre qual registro sobrevive; consertar agora é uma linha no DTO. A direção do conserto (sem prescrever implementação): normalizar no DTO, onde a entrada entra — não no Service, para que login e registro compartilhem a mesma regra.

## Sugestões (não bloqueiam)

- **`AuthModule` instancia um segundo `PrismaClient`** — `apps/api/src/auth/auth.module.ts:8-10` declara `PrismaService` em `providers`, criando um pool de conexões próprio por módulo (o `games` já fazia o mesmo). Com `orders`, `payments` e `users` chegando, cada módulo soma um pool e o limite de conexões do Postgres/Neon estoura. Vale um `PrismaModule` `@Global` exportando o `PrismaService` — refatoração que precisa englobar `games` também, por isso não bloqueia aqui.
- **`ConfigModule` importado e nunca usado** — `auth.module.ts:8`. Copiado do `games`, onde também sobra. É ruído que sugere que o módulo lê configuração (não lê).
- **DTO sem teto de tamanho** — `register.dto.ts`. `@MaxLength(72)` na senha importa: o bcrypt trunca silenciosamente em 72 bytes, então duas senhas diferentes que compartilhem os primeiros 72 bytes autenticam igual. E-mail pede ~254 e nome ~100 — sem isso, um corpo de megabytes de `name` vai inteiro para uma coluna `TEXT`.
- **`name` aceita só espaços** — `register.dto.ts:9-11`. `@IsNotEmpty()` aprova `"   "`, e esse valor aparece no cabeçalho na Tarefa 7. Um `@Transform` com `trim` resolve junto com a normalização do e-mail.
- **`catch (error: any)`** — `auth.service.ts:22`. O `GlobalExceptionFilter` já demonstra o caminho tipado (`instanceof Prisma.PrismaClientKnownRequestError`); aqui basta estreitar para `unknown` e checar `error.meta?.target`. Aproveitar para condicionar a mensagem a `target` incluir `email`: hoje *qualquer* P2002 vira "E-mail já está em uso", o que passa a mentir no dia em que existir uma segunda constraint única em `User`.
- **`role: Role.USER` duplica o default do schema** — `auth.service.ts:19` contra `schema.prisma:35`. Duas fontes de verdade para a mesma regra: mudar o default no schema não muda o comportamento. O plano pede atribuição explícita, então é defensável — só registre que a decisão agora mora em dois arquivos.
- **Teste de integração não limpa antes** — `auth.service.spec.ts:92-106` só limpa no `afterEach`. Uma execução abortada deixa o registro e o próximo run falha no primeiro caso com 409 em vez de 201. Limpar no `beforeEach` (ou e-mail único por execução) elimina o resíduo.
- **`expect(bcrypt.getRounds(hash)).toBe(10)`** — `auth.service.spec.ts:49`. Acopla o teste a um número mágico; endurecer o custo do bcrypt (decisão legítima e esperada) quebra um teste que não está medindo o comportamento errado. `toBeGreaterThanOrEqual(10)` preserva a intenção.
- **`toHaveBeenCalledWith(validPayload)`** — `auth.controller.spec.ts:63`. Acopla ao corpo cru entregue ao Service; o valor real do teste já está nas asserções sobre `response.body.data`. `expect.objectContaining(...)` ou simplesmente remover essa linha reduz o atrito.
- **Swagger sem schema de resposta** — `auth.controller.ts:13` documenta só o status 201, sem `type`. O `architecture.md` §2.2 diz que o frontend deriva os contratos de `/docs`; sem schema, a Tarefa 5 não tem tipo para o corpo de registro. Um DTO de resposta (id, name, email, role, createdAt) fecha isso — e o `games` tem a mesma lacuna.
- **Mapeamento P2002 → 409 duplicado entre `games.service` e `auth.service`.** São quatro linhas e mensagens diferentes; extrair agora seria abstração para dois casos. Só vale unificar quando aparecer o terceiro.

## Observações fora do escopo deste diff

- **`prisma.service.spec.ts:56` apaga *todos* os usuários (`deleteMany({})`) e o Vitest roda arquivos em paralelo** (`vitest.config.ts` sem `fileParallelism: false`). O teste de integração novo em `auth.service.spec.ts` cria, conta e depende de um usuário que pode ser apagado no meio por esse arquivo — falha intermitente em CI. A correção é no spec pré-existente (limpar por e-mail, como o novo já faz no `afterEach`).
- **`apps/api/generated/` está no `.gitignore` e ausente neste checkout**, então não pude confirmar que `../../generated/prisma/enums.js` exporta `Role` no formato esperado. O caminho está correto em relação a `schema.prisma:8` e ao `prisma.service.ts:2`; o risco real é de processo: build e teste dependem de `prisma generate` antes, e não há workflow em `.github/workflows/` garantindo isso.
- **Nenhum `@Public()` ainda** — o `register` nasce aberto porque o `JwtAuthGuard` global não existe; a Tarefa 4 precisa marcar esta rota, ou ela nascerá trancada.
- **`prisma.service.ts` não valida `DATABASE_URL` ausente** — `new PrismaPg({ connectionString: undefined })` falha longe da causa. Candidato a Issue de manutenção.
