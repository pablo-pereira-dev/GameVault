# Parecer de Código — Tarefa 7

**Veredito:** APONTAMENTOS

Verificação executada: `npm test --prefix apps/web` → 9 arquivos, 59 testes passaram. `npm run build --prefix apps/web` (e `npm run lint`) **não rodaram** — o shell do revisor recusou a execução (`Permission denied: shell`), então não há confirmação de type-check/lint neste parecer.

## Apontamentos (bloqueiam)

1. **O redirecionamento de rota roda antes da restauração de sessão, quebrando deep links autenticados** — `apps/web/src/router.tsx:93-107` (com `resolveRoute` em `:51-52`)
   Regra violada: architecture §2 — padrões de roteamento do React 19 com History API e sessão restaurada na carga; §4 — o estado da sessão vem da camada de serviço, não de um valor local imediato.
   Prejuízo concreto: na primeira renderização `isAuthenticated` é sempre `false`. O efeito de restauração (`:93-99`) inicia `restoreSession()`, que é assíncrono, mas o efeito de redirect (`:103-107`) roda logo em seguida no mesmo commit, ainda com o estado antigo, e faz `replaceState` para `/login`. Quando `getMe()` resolve e despacha `authenticated`, a URL já é `/login` — e `resolveRoute` devolve `view: 'login'` para `/login` independentemente da sessão (`:51-52`). Resultado: um ADMIN que recarrega `/admin/games` (ou qualquer usuário que abra uma rota profunda direto) cai no formulário de login em vez da rota pretendida. Acontece em todo refresh de rota protegida.

2. **Falta o lazy loading por rota exigido pela arquitetura** — `apps/web/src/router.tsx:4-7`
   Regra violada: architecture §2, "Padrões de código — React 19": *"Roteamento com lazy loading por rota"*.
   Prejuízo concreto: `CreateGamePage`, `LoginPage`, `RegisterPage` e `StorePage` (com seus CSS) entram todos no bundle inicial; a rota deixou de servir também como ponto de code splitting. A justificativa sinalizada (`renderToString` não resolve `lazy`) é limitação do harness de teste, não da arquitetura — é possível manter `resolveRoute` puro e testável e carregar as páginas por `import()` dinâmico com fallback de `Suspense`, sem introduzir dependência nova (a stack estrita do §2 continua intacta).

3. **Rotas com múltiplos donos: o diff cria novas cópias de literais que já têm definição** — `apps/web/src/shared/components/Header.tsx:8-10`, `apps/web/src/features/auth/pages/LoginPage.tsx:7`, `apps/web/src/router.tsx:11-16` (em conflito com `authService.ts:4`)
   Regra violada: architecture §4 — `shared/` guarda o que é reutilizado em mais de uma feature; e o critério de revisão "duplicação de regra que já existe em outro lugar do repo".
   Prejuízo concreto: `/login` existe em `ROUTES.login`, em `Header.LOGIN_PATH` e em `authService.LOGIN_PATH`; o redirect do 401 usa o terceiro, o router usa o primeiro e o link do Header usa o segundo. Trocar a rota de login exige editar três arquivos; se um divergir, o 401 leva a uma URL que o `resolveRoute` trata como desconhecida ou o link do Header aponta para rota morta. O mesmo vale para `'/'` (`ROUTES.store`, `Header.STORE_PATH`, `LoginPage.STORE_PATH`).

## Sugestões (não bloqueiam)

- **Cobertura dos fios do componente.** Os testes são honestos nos nomes (`controlador usado pela página`, `limites do renderToString`), mas não exercitam o que liga o JSX à lógica: `onSubmit → controller.submit`, `onClick do Sair → handleLogout` (`Header.tsx:44`), `form.loading → button disabled/label`. Uma regressão em qualquer um desses fios passa nos 59 testes. Como a stack proíbe jsdom/Testing Library, extraia esses fios para funções puras testáveis ou documente explicitamente o gap.
- **`void restoreSession()` sem tratamento de rejeição** — `apps/web/src/router.tsx:98`. `createAuthActions.restoreSession` relança erros que não sejam `UnauthorizedError`; uma queda de rede no `/auth/me` vira unhandled rejection, sem feedback nem retry para o usuário.
- **Copy de 403 na interface** — `apps/web/src/router.tsx:73`: "403 Forbidden" é uma resposta que o front nunca recebeu. O bloqueio de navegação está correto e é exatamente o papel do front (o 403 real é do backend, ID9); apenas a redação sugere uma resposta HTTP que não houve.
- **Avisos `react(only-export-components)`.** Aceitáveis: o §2 só nomeia o Oxlint como linter e a lista de arquivos do plano foi respeitada. Quando a lista abrir, extrair `navigate`/`resolveRoute`/`handleLogout` para módulos `.ts` resolve os 4 avisos sem custo.
- **Tokens de design.** Os valores literais estão corretos, mas o `.gv-header__brand` usa 20px/700 com comentário `t1` (`Header.css`), enquanto o design-tokens define `t1` = 32px/700 para "nome da loja". Ajuste o comentário ou o tamanho. A repetição das variáveis `--gv-*` em cada CSS segue o padrão já adotado em `RegisterPage.css`; vale centralizar num `tokens.css` compartilhado na próxima folga de arquivos.
- **StorePage placeholder** é adequado para dar destino ao redirect do CA3; apenas garantir que a história do catálogo o substitua em vez de conviver com ele.

## Observações fora do escopo deste diff

- `apps/web/src/features/auth/services/authService.ts:4,56-58` (tarefa 5): `LOGIN_PATH` próprio e `defaultRedirect` com `window.location.assign` — o legado entra na duplicação do item 3, mas quem a resolve é este diff.
- `apps/web/src/features/admin/pages/CreateGamePage.tsx` (pré-existente): `catch (err: any)`, sem tokens de design e sem tratamento de 403 — não tocado aqui.
- `apps/web/src/features/auth/pages/RegisterPage.tsx` (pré-existente): chama `register` diretamente em vez de passar pelo `AuthContext`, ao contrário do `LoginPage`; continua dentro da camada `services/`, mas é uma assimetria a considerar.
