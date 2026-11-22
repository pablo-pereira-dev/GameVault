# Parecer de Código — Tarefa 5

**Veredito:** APONTAMENTOS

Verificação executada: `npm test --prefix apps/web` → 4 arquivos / 15 testes passaram. `npm run build --prefix apps/web` e `npm run lint --prefix apps/web` foram negados por permissão do harness; o julgamento abaixo vem da leitura do diff e do código ao redor.

## Apontamentos (bloqueiam)

1. **Wrapper de rede duplicado em vez de compartilhado** — `apps/web/src/features/auth/services/authService.ts:74-99` (vs. `apps/web/src/features/admin/services/gameService.ts:15-16,40-45`)
   Regra violada: `architecture.md` §3/§4 — "`src/shared/` guarda o que é reutilizado em mais de uma feature" e "mudança de contrato mexe só nessa camada". A reprova do papel cita expressamente "duplicação de regra que já existe em outro lugar do repo".
   Prejuízo concreto: o timeout de 10 s, o `AbortController`, a detecção de `AbortError`/`Failed to fetch`/`network`/`fetch` e a mensagem de queda de conexão (CA9) agora existem em duas implementações. Qualquer ajuste futuro nessa mensagem ou no timeout precisa ser feito duas vezes e pode divergir entre login/cadastro e cadastro de jogos. O novo serviço deveria ter sido construído sobre um helper HTTP em `src/shared/services/`, com `gameService` migrado na mesma linha.

2. **Testes do Provider/hook acoplados à forma interna do estado e cegos ao wiring** — `apps/web/src/features/auth/context/AuthContext.test.tsx:22-38,40-52`
   Regra violada: reprova do papel — "teste acoplado a detalhe de implementação, que quebra em qualquer refatoração"; constituição §4 (TDD).
   Prejuízo concreto: quatro testes afirmam a forma exata `{ user, isAuthenticated }` de constantes/funções puras. Inserir um campo legítimo como `isLoading` quebra quatro testes sem nenhuma mudança de comportamento. Mais grave: `renderToString` captura apenas o valor inicial do contexto — não executa efeitos nem callbacks assíncronos. Um bug real no Provider (ex.: `value={{ ...initialAuthState, ... }}` em vez de `...state` em `AuthContext.tsx:77`, ou `logout()` que esquece o `dispatch` em `:71-74`) passaria em todos os testes, porque as transições são testadas no reducer isolado, nunca através do hook. O teste "exposes the session through useAuth" dá falsa sensação de cobertura do "hook de sessão" pedido no plano. Reconheço a restrição de stack (sem jsdom/testing-library), mas isso não torna os testes atuais menos acoplados.

## Sugestões (não bloqueiam)

- **Os 5 avisos `react(only-export-components)`**（`AuthContext.tsx`: `initialAuthState`, `authenticatedState`, `loggedOutState`, `authReducer`, `useAuth` ao lado de `AuthProvider`）são sintoma real: o Fast Refresh do `@vitejs/plugin-react` degrada para full reload nesse módulo. Mover as funções puras e o hook para `authReducer.ts`/`useAuth.ts`, deixando `AuthContext.tsx` exportar só o componente, zera os avisos sem nova dependência.
- **`getMe()` redireciona mesmo sem token** (`authService.ts:137-146`): sem token ele ainda chama `/auth/me`, recebe 401 e dispara `handleUnauthorized` → `/login`. Se a Tarefa 7 chamar `restoreSession()` no bootstrap, todo visitante anônimo será ejetado para o login. Um early-return quando `getStoredToken()` for `null` evita isso e não conflita com CA8 (que fala de sessão expirada/inválida, não de ausência de sessão).
- **Redirect acoplado à navegação full-page** (`authService.ts:40-42`, `AuthContext.tsx:53-64`): `defaultRedirect` usa `window.location.assign`. O `redirect` já é injetável no serviço, mas o Provider não repassa essa injeção — vale expor a opção no `AuthProvider` para a Tarefa 7 plugar a navegação SPA sem recarregar a página.
- **Centralização do 401 é parcial** (`authService.ts:56-68,74-99`): `handleUnauthorized` é um helper correto e testado, mas precisa ser chamado manualmente por cada operação protegida; `request()` não o invoca. Como futuros serviços (carrinho, pedidos) também farão chamadas protegidas, uma opção `onUnauthorized` no `request()` tornaria o ponto único realmente automático — mantendo fora dela o 401 de `login`, que é credencial inválida (CA4), não sessão expirada.
- **Setup redundante no teste** (`authService.test.ts:20-23`): `vi.stubGlobal('localStorage', makeStorage())` no `beforeEach` nunca é lido — todas as chamadas passam `{ storage }` explicitamente. Remover reduz ruído e deixa claro que a injeção de dependências é o que realmente isola os testes.

## Observações fora do escopo deste diff

- `gameService.ts:15-16,40-45` mantém a cópia pré-existente do wrapper de rede. Extraí-la para `src/shared/services/` exige tocar em arquivo fora desta tarefa — candidata a Issue de manutenção / decisão do usuário na triagem do apontamento 1.
- `main.tsx` e `App.tsx` ainda não montam `AuthProvider`; é o esperado pelo plano (Tarefa 7), apenas registrado para não parecer omissão desta tarefa.
- Build e lint não rodaram por negação de permissão do harness; a checagem de tipos/fast-refresh não foi validada por execução.
