# Parecer de Código — Tarefa 3

**Veredito:** APONTAMENTOS

Conformidades verificadas eOK: ID6 (Controller só delega ao Service; `PrismaService` e `JwtService` injetados no Service), ID8 (todo acesso via `prisma.user.findUnique`, sem SQL cru), ID10 (sucesso em `{ data: ... }` via interceptor; erro em `{ statusCode, message, error }` via filter), ID17 (`JWT_SECRET` lido por `ConfigService` em `JwtModule.registerAsync`, nenhum segredo em código — teste usa segredo fictício apenas em `.spec.ts`), `@HttpCode(200)` correto, payload `{ sub, email, role }` sem dados sensíveis, mensagem centralizada em `INVALID_CREDENTIALS_MESSAGE` garantindo corpo 401 idêntico nos dois caminhos. `npm test --prefix apps/api`: **71 testes passando**. Lint (Oxlint, declarado no architecture §2) não pôde ser executado — permissão de shell negada; o parecer fica incompleto nesse ponto.

## Apontamentos (bloqueiam)
1. **Regra de normalização de e-mail duplicada entre DTOs** — `apps/api/src/auth/dto/login.dto.ts:6` (cópia literal de `apps/api/src/auth/dto/register.dto.ts:8`)
   Regra violada: `docs/architecture.md` §2.1 ID7 (toda entrada passa por DTO com validação) combinado com o critério de revisão "duplicação de regra que já existe em outro lugar do repo". O próprio comentário no arquivo admite o espelhamento: *"Mirrors RegisterDto so an account created with mixed case is found on login"*.
   Prejuízo concreto: a identidade da conta depende dessa transformação. Se amanhã a regra mudar em um dos dois arquivos (ex.: tratar domínio IDN, remover `+tag`) e o outro ficar, um usuário cadastrado com determinado e-mail deixa de conseguir logar — e o teste de integração "log in with an email typed in another case" continua verde porque cobre só o caso atual. Extrair para um `@Transform` compartilhado (ex.: em `common/`) usado pelos dois DTOs elimina a divergência estruturalmente.

2. **Short-circuit do `bcrypt.compare` cria oracle de tempo para enumeração de e-mail** — `apps/api/src/auth/auth.service.ts:40`
   Regra violada: `docs/architecture.md` §2.1 ID9 (autenticação), agravado pelo requisito explícito da spec (CA4: "sem revelar se o e-mail existe no sistema"), que o item do despacho me pediu para avaliar.
   Prejuízo concreto: quando `user` é `null`, o código atribui `false` sem executar o bcrypt — a resposta volta em ~1 ms; quando o e-mail existe e a senha está errada, o `bcrypt.compare` (cost 10) leva ~50–100 ms. Os corpos HTTP são idênticos (isso está correto e testado), mas o diferencial de latência é facilmente mensurável pela rede e permite ao atacante distinguir "e-mail inexistente" de "senha errada", anulando a intenção do CA4. A correção é barata: sempre executar um `bcrypt.compare` contra um hash dummy fixo quando o usuário não é encontrado, e só então lançar a mesma `UnauthorizedException`.

## Sugestões (não bloqueiam)
- **JWT sem `expiresIn`:** conforme sinalizado, `JwtModule.registerAsync` registra só o `secret`. Tokens nunca expiram. Não bloqueio porque a Tarefa 3 não declara validade e a Tarefa 4 trata de expiração (CA8), mas vale já adicionar `signOptions: { expiresIn: configService.get('JWT_EXPIRES_IN') ?? '...' }` via `ConfigService` para não criar tokens eternos em produção e facilitar o teste de CA8.
- **Fail-fast do segredo:** `configService.get<string>('JWT_SECRET')` pode devolver `undefined`; nesse caso o erro aparece como 500 na primeira chamada de login, não na subida. Uma validação no `useFactory` (lançar se ausente) tornaria a falha explícita no boot.
- **Texto da mensagem:** a implementação usa `"Credenciais inválidas."` (com ponto) enquanto o plan.md cita `"Credenciais inválidas"`. A igualdade entre os dois caminhos está garantida; apenas confirme na triagem de conformidade se o literal deve ser exato — e, seguindo ID10/ID 2.2, faça o frontend consumir a `message` da API em vez de reescrever o texto.
- **Acoplamento menor nos testes unitários:** `expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { email } })` (`auth.service.spec.ts`) prende o teste à forma da query. No caso específico isso até reforça o ID8, mas trocar por `expect.any(Object)` reduziria quebras em refatorações de consulta sem perder a garantia de que o lookup ocorreu.

## Observações fora do escopo deste diff
- `AuthService.register` ainda usa `catch (error: any)` (preexistente da Tarefa 2, não tocado aqui) — candidata a Issue de manutenção para tipar como `unknown` e estreitar com `Prisma.PrismaClientKnownRequestError`.
- O `GlobalExceptionFilter` pré-existente loga a URL de conexão com `password=...` em cenários de erro de banco (visível na saída dos testes); fora deste diff, mas vale Issue de manutenção por ID17.
