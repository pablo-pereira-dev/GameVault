# Parecer de Código — Tarefa 6 (rodada 2)

**Veredito:** APROVADO

Correções aceitas na triagem — verificadas:

- **Item 1 (CSS):** `RegisterPage.css` define todas as cinco classes que o JSX usa (`.register-page`, `.form-group`, `.field-error`, `.error-message`, `.success-message`), o destaque em `input[aria-invalid='true']`, banners com `perigo`/`sucesso` distintos e os cinco estados de botão. Valores são literais semânticos espelhados de `docs/design-tokens.md`, com regras escopadas sob `.register-page` — `architecture.md` §2 ("CSS puro com os tokens de `docs/design-tokens.md`") e §4 atendidos. Nenhum vazamento para outras páginas; nenhuma dependência nova.
- **Item 2 (controlador/testes):** `handleSubmit` passa `form.values` a `controller.submit` e o cleanup de `useEffect` chama `controller.discard()`; os testes exercitam exatamente esse controlador com `register`/`dispatch` injetados (guard CA5, sucesso CA1, 409 CA2, queda de rede CA9, descarte CA10). O acesso à API continua só em `authService` → `request` (§4) — a injeção não trouxe `fetch` para a camada de página. Asserções estruturais deixaram de fixar contagens/ausência de `role="alert"`.

`npm test --prefix apps/web`: 6 arquivos, 39 testes, todos passando. `npm run build --prefix apps/web`: permissão negada neste harness (igual à rodada 1), então o parecer fica incompleto quanto ao build.

## Apontamentos (bloqueiam)

Nenhum. Não há regressão ou problema novo introduzido nesta rodada.

## Sugestões (não bloqueiam)

- `RegisterPage.test.tsx:120-126,138-140` — `vi.stubGlobal('localStorage', storage)` é feito no teste de CA10 (primeiro `describe`), mas `afterEach(vi.unstubAllGlobals)` só existe no segundo `describe`. O stub vaza para o teste seguinte; hoje sem efeito (o render não toca storage), mas frágil se alguém adicionar um teste depois dele. Mover o `afterEach` para o escopo do arquivo resolve.
- `registerController.ts:57-63` — a Promise em voo dispara `dispatch` mesmo que a página já tenha desmontado (cleanup `discard()` e resolução correm em paralelo). React 19 ignora `setState` em componente desmontado, então CA10 segue atendido; mas um flag de ativo ou `AbortController` tornaria o contrato do controlador explícito se ele for reutilizado fora de um componente React.
- `RegisterPage.tsx:18-23` — depois do sucesso, `successMessage` permanece no estado se o usuário voltar a digitar (o `updateField` preserva as mensagens). Cosmético: o banner "Conta criada" continua visível sobre o novo rascunho.

## Observações fora do escopo deste diff

- `npm run build --prefix apps/web` não pôde ser executado (permissão de shell negada); recomendo ao fluxo rodá-lo antes da triagem.
- `index.css` ainda traz os tokens do scaffold Vite, e as famílias Space Grotesk/Hanken Grotesk declaradas no CSS novo não são carregadas em nenhum ponto do app (o fallback `sans-serif` cobre). Ambos pré-existentes, não tocados neste diff — candidatas a Issue de manutenção.
- Os `--gv-*` são literais porque não existe camada global de tokens em código; se ela surgir, trocar os literais por referências evita duas fontes de verdade.
