# Parecer de Código — Tarefa 6

**Veredito:** APONTAMENTOS

> Execução: `npm test --prefix apps/web` e `npm run build --prefix apps/web` não puderam ser rodados neste subagente (permissão de shell negada). Parecer baseado na leitura integral do diff e do contexto; nenhum arquivo foi alterado.

## Apontamentos (bloqueiam)

1. **O "destaque visual" de CA5 não existe: todas as classes usadas pela página estão indefinidas** — `apps/web/src/features/auth/pages/RegisterPage.tsx:47,50,55,61,71,77,87,93,103`
   Regra violada: `docs/architecture.md` §2 — "Estilo: CSS puro com os tokens de `docs/design-tokens.md`"; e a decisão técnica do `plan.md`: páginas com "validações de formulário, **destaque visual de campos obrigatórios**". Busca em todo o repo: nenhuma regra para `.register-page`, `.form-group`, `.field-error`, `.error-message` ou `.success-message` em `index.css`, `App.css` ou qualquer outro `.css`.
   Prejuízo concreto: `aria-invalid={!!form.errors.name}` é semântica para leitor de tela, não estilo. Após submeter vazio, o DOM muda mas a tela não: o usuário não consegue ver **qual** campo corrigir, e as mensagens de erro/conflict/sucesso aparecem como texto corrido sem distinção. A tela inteira também fica sem layout (`.register-page`). O próprio implementador sinalizou a ausência; "reutilizar classes existentes" aqui significa reutilizar classes que só existem no JSX. Como a página é nova neste diff, o defeito é introduzido aqui — a causa comum (CreateGamePage sem CSS) vai para Observações.

2. **Os testes não exercitam o componente que dizem cobrir e são acoplados aos helpers internos** — `apps/web/src/features/auth/pages/RegisterPage.test.tsx:21-79, 86-112`
   Regra violada: critério do revisor "teste acoplado a detalhe de implementação, que quebra em qualquer refatoração"; `.agents/rules/utf-rules.md` §4 (TDD de verdade); e o próprio `plan.md`: "Testes de **componente** em `RegisterPage` testando validação visual de campos obrigatórios, **bloqueio de submissão inválida, feedback de conflito para e-mail duplicado, tratamento de erro de conexão e descarte de dados ao desmontar**".
   Prejuízo concreto: (a) remover o guard de `handleSubmit` (`RegisterPage.tsx:26-29`) ou o bloco que renderiza `errorMessage` (`:54-58`) deixa **todos** os testes verdes — o que é testado é `shouldSubmitRegister`/`translateRegisterError`/`applySubmitError`, não a página; (b) não existe **nenhum** teste de desmontagem: o item "descarte de dados ao desmontar (CA10)" virou "localStorage não foi lido no `renderToString`" (`:100-112`), que não prova descarte algum; (c) as asserções de `:94-97` (`aria-invalid="false"` exatamente 3×, ausência de `role="alert"` e de `disabled`) quebram ao acrescentar um campo ou trocar o rótulo do botão, sem mudança de comportamento. A restrição de stack (sem `@testing-library/react` em `package.json`, §2) explica o uso de `renderToString`, mas não autoriza rotular testes de helpers como cobertura de componente — o limite deve ser declarado, não disfarçado.

## Sugestões (não bloqueiam)

- `registerForm.ts:11,30-31` — `errors: Record<string, string>` aceita chave arbitrária: `form.errors.nmae` compila e some silenciosamente. `Partial<Record<keyof RegisterValues, string>>` daria checagem de tipo sem custo.
- `RegisterPage.tsx:16-21` — `updateField` não limpa o erro do campo alterado: depois de corrigir um e-mail malformado, `aria-invalid="true"` e a mensagem persistem até o próximo submit. Mesmo padrão do `CreateGamePage.tsx` (pré-existente), mas vale não replicar.
- `registerForm.ts:64-71` — `values: state.values` é redundante (o `...state` já preserva) e `errors` não é limpo; se `applySubmitError` for chamado com erros de campo pendentes, a tela mostra banner e erros antigos juntos.
- `registerForm.ts:52-61` — `translateRegisterError` repassa qualquer `Error.message`. Uma exceção inesperada (JSON malformado de proxy, por exemplo) vaza texto técnico bruto na UI. Allowlist com fallback genérico seria mais segura.
- Acessibilidade: os inputs têm `aria-invalid` mas não `aria-describedby` apontando para o `<span role="alert">`; a mensagem de sucesso usa `role="alert"` (`:50`), adequado seria `role="status"` (anúncio polito); faltam `autoComplete="email"` e `autoComplete="new-password"`.
- `registerForm.ts` em `pages/`: a justificativa informada ("evitar aviso `only-export-components`") não se aplica — a stack usa Oxlint, não há ESLint nem `.oxlintrc*` no repo. A colocalização é aceitável como seam de teste, mas o motivo real deve ser esse, não uma regra inexistente.
- Pontos que **não** são apontamento, para calibragem: nenhuma dependência nova (§2 respeitado); nenhum `fetch` no componente — tudo passa por `authService` → `request` (§4 respeitado); componente de função + hooks + um único `useState` (React 19 OK); `authService.test.ts` cobre bem 201/409/400/falha de rede e verifica ausência de efeito de sessão; as regras do front (trim, e-mail, mínimo 6) batem com `register.dto.ts` hoje. A extração de funções puras não é "abstração para um caso só": sem DOM de teste na stack, é o único seam disponível para TDD — o defeito está no que os testes afirmam cobrir, não na extração.

## Observações fora do escopo deste diff

- As classes `.form-group`, `.field-error`, `.success-message`, `.error-message` já eram usadas por `CreateGamePage.tsx` sem definição em CSS — candidata a Issue de manutenção para criar a camada de estilos de formulário com os tokens de `docs/design-tokens.md`.
- `index.css` ainda contém os tokens do scaffold Vite, não a paleta/tipografia de `docs/design-tokens.md` — pré-existente.
- `RegisterPage` não está roteado e `apps/web/src/router.tsx` ainda não existe; pelo `plan.md` isso pertence à Tarefa 7 — não é defeito deste diff.
- Não foi possível confirmar em tempo real que os comandos de teste/build passam (permissão de shell negada); recomendo ao fluxo executá-los antes da triagem.
