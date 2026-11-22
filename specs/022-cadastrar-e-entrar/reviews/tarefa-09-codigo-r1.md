# Parecer de Código — Tarefa 9

**Veredito:** APROVADO

Conferência documental concluída: o diff altera exatamente **uma linha**, em `docs/architecture.md` §2 (linha 33), e nada mais.

- **Nomes exatos:** `@nestjs/jwt` (package.json `^12.0.5`) e `bcrypt` (`^6.0.0`) — grafia idêntica à de `apps/api/package.json`. ✔
- **Papéis corretos:** "emissão/verificação de JWT" e "hash de senha" batem com o plano ("Geração e verificação de JWT via `@nestjs/jwt`", "Hashing de senhas com `bcrypt`") e com a spec (CA1: "hash criptográfico seguro (`bcrypt`)"). ✔
- **Consistência com o package.json:** as duas únicas dependências *runtime* de autenticação (`@nestjs/jwt`, `bcrypt`) agora aparecem na stack; nenhuma outra dependência de auth existe em `dependencies`. `@types/bcrypt` é stub de tipos em `devDependencies` e não compõe a stack runtime. ✔
- **Sem duplicação com §2.1/ID9:** ID9 descreve o *mecanismo* (guard global `JwtAuthGuard`, `@Public()`, `RolesGuard`, `@Roles`) — padrão de acesso —, não a biblioteca. A linha nova acrescenta o *que* (`@nestjs/jwt`) e seu papel, sem repetir a regra de autorização. `bcrypt` não era citado em lugar algum do documento (§5 traz só o atributo `passwordHash`). ✔
- **Formato/estilo:** uso de `·` e `backticks` segue o padrão já adotado nas linhas "Frontend" e "Testes e Lint" da própria §2 e em `@nestjs/swagger` (§2.2). ✔
- **Escopo mínimo:** um arquivo, uma linha — conforme "Arquivos previstos" e "escopo mínimo (uma linha)" do plano. ✔

## Apontamentos (bloqueiam)

Nenhum. Não há violação de camada, formato de resposta, segredo, tratamento de erro, abstração ou duplicação de regra neste diff.

## Sugestões (não bloqueiam)

- Nenhuma alteração necessária. Registro apenas para evitar interpretação futura equivocada da conferência: **não** incluir `@types/bcrypt` na §2 — é `@types/*` de `devDependencies`, e a seção descreve a stack de execução; incluí-la seria ruído, não ganho.
- A mudança é de **exatidão** e não introduz decisão arquitetural nova, portanto não exige linha no §7 Histórico nem bump de versão — coerente com a restrição de "uma linha" do plano.

## Observações fora do escopo deste diff

- O preâmbulo da §2 ("Definição **estrita**: nenhuma dependência entra sem aparecer aqui. Esta seção e o `package.json` contam a mesma história") segue sem ser integralmente satisfeito: `class-validator`, `@nestjs/config`, `pg`, `dotenv`, `reflect-metadata`, `rxjs`, entre outros, não constam da stack. É condição **pré-existente** que este diff não tocou e que a tarefa 9 explicitamente não cobre ("toda dependência de **autenticação**"). Candidato a Issue de manutenção — não bloqueia esta tarefa.
