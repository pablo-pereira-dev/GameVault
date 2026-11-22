# Parecer de Código — Tarefa 3 (rodada 2)

**Veredito:** APROVADO

Os 6 itens aceitos na triagem r1 estão corretamente implementados e não introduzem regressões. Conformidades reverificadas: **ID6** (`auth.controller.ts:29-31` só delega ao Service; `PrismaService` e `JwtService` injetados no Service), **ID7** (`LoginDto` com `class-validator` + pipe global `whitelist/forbidNonWhitelisted`; normalização agora com fonte única em `common/decorators/normalize-email.decorator.ts`, usada pelos dois DTOs — sem duplicação), **ID8** (`prisma.user.findUnique` em `auth.service.ts:42`, nenhum SQL cru), **ID9** (emissão JWT com `{ sub, email, role }`; `JwtAuthGuard`/`RolesGuard`/`@Public()` permanecem na Tarefa 4, fora deste diff), **ID10** (sucesso `{ data: { accessToken } }` via interceptor; erro `{ statusCode, message, error }` via filter; corpo 401 literalmente idêntico nos dois caminhos), **ID17** (`JWT_SECRET` lido via `ConfigService` em `JwtModule.registerAsync`, fail-fast em `auth.module.ts:12-14`, nenhum segredo real em código — apenas valores fictícios em `.spec.ts`). `npm test --prefix apps/api`: **11 arquivos, 77 testes passando**. Lint (Oxlint, declarado no architecture §2) não pôde ser executado — permissão de shell negada para `npm run lint --prefix apps/api`; o parecer fica incompleto nesse ponto.

## Apontamentos (bloqueiam)

(nenhum)

## Sugestões (não bloqueiam)

- **`JWT_EXPIRES_IN` vazio dribla o fallback** — `apps/api/src/auth/auth.module.ts:19`: `?? '15m'` só cobre `undefined`; se a variável estiver definida como `""`, `expiresIn` vira string vazia e `jwt.signAsync` estoura em runtime (500 no login), não no boot. Como o item 4 (fail-fast) foi aceito justamente para `JWT_SECRET`, vale tratar `JWT_EXPIRES_IN` com o mesmo critério (ex.: `configService.get('JWT_EXPIRES_IN')?.trim() || '15m'`). Não bloqueia porque `.env.example` já traz `"15m"`.
- **Assertion do oracle de tempo está fraca** — `apps/api/src/auth/auth.service.spec.ts:279`: `expect(compareSpy.mock.calls[0][1]).toEqual(expect.any(String))` passa mesmo que o código compare contra `''` ou um hash malformado (o que eliminaria o ganho de latência sem quebrar o teste). Afirmar um formato bcrypt válido (ex.: `/^\$2[aby]\$\d{2}\$/`) daria proteção real à correção do item 2.
- **Ressalva de frente para a Tarefa 4 (ID9)** — quando o guard global `JwtAuthGuard` for instalado, `POST /auth/login` e `POST /auth/register` precisarão receber `@Public()`; sem isso o próprio login ficará protegido. É responsabilidade da Tarefa 4, apenas registrado aqui para sustentabilidade.
- `auth.module.spec.ts:8,14,20` usa `await import()` dinâmico sem necessidade aparente; import estático no topo simplify a leitura — pura preferência.

## Observações fora do escopo deste diff

- `AuthService.register` mantém `catch (error: any)` (`auth.service.ts:32`), pré-existente da Tarefa 2 e não tocado nesta rodada — candidata a Issue de manutenção (tipar `unknown` e estreitar para `Prisma.PrismaClientKnownRequestError`).
- O `GlobalExceptionFilter` pré-existente continua logando a URL de conexão com `password=...` (visível na saída dos testes: `Database connection terminated unexpectedly at password=secret`) — também fora deste diff, mas vale Issue de manutenção por ID17.
