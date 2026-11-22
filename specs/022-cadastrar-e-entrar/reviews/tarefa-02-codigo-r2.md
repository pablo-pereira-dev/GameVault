# Parecer de Código — Tarefa 2 (rodada 2)

**Veredito:** APROVADO

Testes executados: `npm test --prefix apps/api` → **9 arquivos / 45 testes passando** (incluindo os testes de integração contra o PostgreSQL real). Diferente da rodada 1, o shell estava disponível e o parecer abaixo é dinâmico, não apenas estático.

Os dois apontamentos aceitos na triagem foram verificados e estão completos:

1. **Normalização de e-mail (ID7)** — `register.dto.ts:9` agora aplica `@Transform(normalizeEmail)` (`trim().toLowerCase()`) antes do `@IsEmail()`. Coberto em três níveis: DTO (`register.dto.spec.ts:41-45`), controller (`auth.controller.spec.ts:66-77`) e integração (`auth.service.spec.ts:154-167`, que prova que `Auth-Service-Integration@Example.com` gera 409 na segunda tentativa e deixa **uma** linha). A regra ficou na entrada da API, como direcionado — não no Service.
2. **`name` só-espaços (CA5)** — `@Transform(trimString)` converte `"   "` em `""` antes do `@IsNotEmpty()`, que então recusa com 400. Coberto em `register.dto.spec.ts:34-36`, `auth.controller.spec.ts:80-88` e na persistência sem espaços em `auth.service.spec.ts:170-175`.

Reavaliados os eixos pedidos, nenhum bloqueante novo:

- **ID6:** Controller só recebe/devolve HTTP; `AuthService` injeta `PrismaService` e concentra a regra; `AuthModule` apenas faz o wiring. Idêntico ao padrão de `games`.
- **ID7:** DTO com `class-validator` + `ValidationPipe` global (`whitelist`, `forbidNonWhitelisted`, `transform` — `app.module.ts:24-31`). `forbidNonWhitelisted` continua barrando `role: 'ADMIN'` no corpo (defesa contra mass assignment). `class-transformer` é dependência direta declarada em `package.json:34` — nenhuma dependência nova entrou.
- **ID8:** Todo acesso via Prisma, sem SQL à mão.
- **ID10:** Sucesso pelo `TransformInterceptor` → `{ data: ... }`; `ConflictException` pelo `GlobalExceptionFilter` → `{ statusCode, message, error }`, provado em `auth.controller.spec.ts:108-114`.
- **Segurança do hash:** bcrypt, 10 rounds (conforme `plan.md`), `bcrypt.compare` e `getRounds` verificados no unitário; hash real lido do banco no teste de integração; `select` impede vazamento de `passwordHash` na resposta. Nenhum texto legível persistido.
- **Consistência com `games`:** estrutura de módulo/serviço/controller, injeção de `PrismaService` e mapeamento `P2002 → 409` seguem o mesmo desenho. Nenhuma divergência introduzida nesta rodada.

O diff da rodada 2 tocou apenas os dois pontos aceitos e seus testes — nenhum efeito colateral detectado.

## Apontamentos (bloqueiam)

Nenhum.

## Sugestões (não bloqueiam)

- **`normalizeEmail` ainda não é reutilizável pela Tarefa 3.** `register.dto.ts:9` declara o transform como `const` local, não exportado. O objetivo registrado na triagem era que login e registro *compartilhassem* a regra; hoje o login ainda não existe, mas quando `login.dto.ts` surgir, o caminho mais fácil será copiar a função. Exportá-la agora (ou extraí-la para um helper/decorador compartilhado em `common/`) fecha essa intenção sem custo.
- Demais sugestões da rodada 1 permanecem **abertas, não bloqueantes** (conforme `tarefa-02-decisoes-r1.md`): `@MaxLength(72)` na senha por causa do truncamento do bcrypt em 72 bytes; `catch (error: unknown)` em `auth.service.ts:22` com checagem de `error.meta?.target`; schema de resposta no Swagger (architecture §2.2); `PrismaModule @Global` para não multiplicar pools; `toBeGreaterThanOrEqual(10)` no teste de rounds; limpeza do banco também no `beforeEach`.

## Observações fora do escopo deste diff

- **`prisma.service.spec.ts:56` roda `deleteMany({})` e o Vitest executa arquivos em paralelo** — segue aberto desde a rodada 1 e é a única ameaça real de flakiness aos testes de integração novos. Candidato a Issue de manutenção no spec pré-existente.
- **Sem `@Public()` ainda** — `POST /auth/register` nasce aberto porque hoje não há guard global; a Tarefa 4 precisa marcar a rota ao introduzir o `JwtAuthGuard` global, senão o cadastro nasce trancado.
- **`docs/architecture.md` §6 (Mapa de Domínios)** ainda lista só `Games`. Com `AuthModule` no código, o mapa ficou desatualizado — é atualização de documento, não defeito deste diff.

*(Parecer somente leitura; a gravação em `specs/022-cadastrar-e-entrar/reviews/tarefa-02-codigo-r2.md` fica a cargo do fluxo `/utf-task`, não deste revisor.)*
