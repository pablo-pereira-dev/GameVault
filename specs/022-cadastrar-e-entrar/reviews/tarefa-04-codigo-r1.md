# Parecer de Código — Tarefa 4

**Veredito:** APROVADO

Diff lido por inteiro. `npm test --prefix apps/api` → 13 arquivos / 88 testes passam; `npm run test:e2e --prefix apps/api` → 2 arquivos / 8 testes passam. Verificações pedidas: ID6 (Controller → Service → Prisma) OK em `AuthController.me → AuthService.me → findUniqueOrThrow`; ID7 preservado (ValidationPipe global com `whitelist/forbidNonWhitelisted` intacto, sem corpo novo a validar); ID8 OK (somente Prisma); ID9 OK (guard global via `APP_GUARD`, ordem `JwtAuthGuard` antes de `RolesGuard`, `@Public()` no healthcheck/register/login, `@Roles(Role.ADMIN)` em `POST /games`); ID10 OK (`UnauthorizedException`/`false` → envelope `{ statusCode, message, error }` confirmado nos e2e); ID17 OK (segredo lido de `JWT_SECRET` via `ConfigService`, com falha explícita de boot se ausente — nenhum segredo real no código; as strings nos testes são fixtures claramente falsas). Token expirado e adulterado cobertos em unitário e e2e; `passwordHash` fora do `select` e assertado como ausente nos dois níveis.

## Apontamentos (bloqueiam)

Nenhum.

## Sugestões (não bloqueiam)

- **`apps/api/src/auth/guards/jwt-auth.guard.ts:50`** — `extractToken` compara `scheme === 'Bearer'` de forma sensível a caixa. RFC 7235 define o *auth-scheme* como case-insensitive, então um cliente enviando `bearer <token>` recebe 401 embora o token seja válido. Prejuízo concreto: rejeição de cliente conforme a especificação HTTP. Não bloqueia porque nenhum cliente atual envia essa variação.

- **`apps/api/src/auth/auth.service.ts:67` (com `GlobalExceptionFilter`)** — `findUniqueOrThrow` faz o `P2025` virar 404 (ID10). Se o `sub` de um token ainda válido apontar para um usuário removido do banco, `/auth/me` responde 404, mas a Tarefa 5 só limpa a sessão local em 401 — a sessão ficaria órfã no navegador. Como não existe fluxo de exclusão de usuário na aplicação (admins são provisionados manualmente, RN07), o caso é remoto; se quiser endurecer, converter a ausência em `UnauthorizedException` no service, mantendo o filtro global intacto.

- **`apps/api/src/auth/auth.module.ts:35` + `apps/api/src/app.module.ts:20-22`** — o `JwtAuthGuard` global resolve `JwtService` apenas porque `AuthModule` reexporta `JwtModule`. É a solução correta e os testes provam que funciona, mas o vínculo é implícito: remover o reexport (mudança que parece inofensiva) derruba o bootstrap com erro de DI. Vale um comentário junto ao `exports` ou ao registro do guard explicando a dependência.

- **`apps/api/test/auth.e2e-spec.ts:64`** — `bcrypt.hash(password, 10)` replica literalmente o `SALT_ROUNDS = 10` de `AuthService`. Se o custo do hash subir para 12, o e2e continua verde sem detectar divergência. Sugestão: exportar a constante e reutilizá-la no teste.

## Observações fora do escopo deste diff

- Os e2e dependem de PostgreSQL real e de `JWT_SECRET` válido no ambiente (architecture §5.3 / ID17); aqui ambos estavam disponíveis. Em CI, a esteira precisa injetar o mesmo secret ou `AuthModule` recusará o boot — conferir na configuração do GitHub Actions quando essa tarefa for integrada.
- Durante `npm test` aparecem logs do `GlobalExceptionFilter` originados de `common/filters/global-exception.filter.spec.ts:119` (fora deste diff), incluindo uma string de teste `password=secret`. Não é credencial real nem foi tocado aqui; apenas registro caso queira virar Issue de manutenção.
