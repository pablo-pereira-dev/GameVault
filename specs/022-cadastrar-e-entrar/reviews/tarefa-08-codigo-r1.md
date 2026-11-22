# Parecer de Código — Tarefa 8

**Veredito:** APROVADO

Checklist do despacho: reuso de `getStoredToken`/`handleUnauthorized`/`AuthServiceOptions`/`defaultRedirect` ✓ · camada de dados §4 ✓ · padrão de `getMe` ✓ · asserção real do header ✓ · stack estrita (zero dependências novas) ✓ · sem escopo inventado ✓. O diff toca exatamente `gameService.ts` e `gameService.test.ts`; `http.ts` e `CreateGamePage.tsx` permanecem intactos, como sinalizado.

## Apontamentos (bloqueiam)

Nenhum. Não há violação de camada, segredo, erro engolido, abstração de caso único, duplicação de regra ou teste acoplado a detalhe de implementação no que foi alterado. O acoplamento administrativo → auth é indireção existente, não criada aqui, e foi explicitamente pedido pelo plano.

## Sugestões (não bloqueiam)

- **`Authorization: Bearer null` quando não há token** — `apps/web/src/features/admin/services/gameService.ts:28-36`. Diferente de `getMe` (`authService.ts:152-156`), `createGame` não guarda a ausência de token e monta o header com o `null` interpolado. O desfecho de CA8 continua correto (o backend devolve 401, `handleUnauthorized` limpa e redireciona), mas há uma ida ao servidor evitável e um header inválido nos logs da API. Prejuízo concreto: ruído diagnóstico e latência desnecessária, não quebra de critério. Alinhar à guarda de `getMe` se tornaria sustentável.
- **Helpers compartilhados ainda moram em `features/auth/`** — `apps/web/src/features/admin/services/gameService.ts:2-7`. `getStoredToken`, `handleUnauthorized`, `defaultRedirect` e `AuthServiceOptions` agora são consumidos por duas features. O `docs/architecture.md` §4 diz que `src/shared/` guarda o reutilizado em mais de uma feature (e já há `shared/services/http.ts`). Extrair para `shared/services/` inverteria a dependência admin → auth. Não bloqueia porque o plano pediu reuso e não realocação — mover agora seria escopo inventado.

## Observações fora do escopo deste diff

- `apps/web/src/features/admin/services/gameService.test.ts:60` — o teste de CA1 segue com `expect.any(Object)`. É pré-existente (a linha não foi alterada; o diff só tocou o `beforeEach`), e o novo teste de CA6 já faz a asserção literal de `Authorization: 'Bearer jwt-token'`, então a cobertura está garantida. Candidato a Issue de manutenção para endurecer o teste antigo.
- **Verificação incompleta quanto ao build:** `npm test --prefix apps/web` passou (10 arquivos, 71 testes). `npm run build --prefix apps/web` (`tsc -b && vite build`) foi negado pelo harness com `permission.rejected` em três tentativas; não há como afirmar que a checagem de tipos passou. Recomendo quem roda o fluxo `/utf-task` executar o build antes da triagem.
