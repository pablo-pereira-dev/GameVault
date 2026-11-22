# Plano — Issue #22 (US11 — Cadastrar e entrar no sistema)

## Decisões técnicas

- **Banco de dados (Prisma):** Modelo `User` com `id` (UUID), `name` (String), `email` (String @unique), `passwordHash` (String), `role` (Enum `Role` com `USER` e `ADMIN`, padrão `USER`), e `createdAt` (DateTime).
- **Backend (NestJS):** Módulo `auth` com `AuthController`, `AuthService`. Hashing de senhas com `bcrypt` (salt rounds = 10). Geração e verificação de JWT via `@nestjs/jwt` com segredo configurado via `ConfigService` (`JWT_SECRET`). Tratamento de conflito de e-mail duplicado retornando HTTP 409 (`ConflictException`). Erro de credenciais inválidas genérico retornando HTTP 401 (`UnauthorizedException`). Guards de autenticação `JwtAuthGuard` (com `@Public()`) e controle de acesso `RolesGuard` (com `@Roles(...)`). Endpoint `GET /auth/me` para restauração de perfil autenticado.
- **Frontend (React 19):** Módulo `features/auth/` com camada de serviço `authService.ts`, contexto/hook de autenticação `AuthContext` para gerenciar estado global do usuário, persistência do token no `localStorage` e injeção do cabeçalho `Authorization: Bearer <token>`. Páginas `RegisterPage` e `LoginPage` utilizando os design tokens do projeto, com validações de formulário, destaque visual de campos obrigatórios, tratamento de erros de rede e redirecionamentos. Atualização do cabeçalho compartilhado para refletir o estado autenticado e ação de logout.

## Tarefas

- [x] **Tarefa 1 — Configurar modelo User no Prisma e gerar migração**
  - Cobre: Infraestrutura base para CA1, CA2, CA6
  - Teste primeiro: Teste de integração do Prisma validando persistência do modelo `User` e restrição de unicidade no campo `email`
  - Arquivos previstos: `apps/api/prisma/schema.prisma`, migração do Prisma

- [x] **Tarefa 2 — Implementar serviço de hashing e registro de usuário (Register) no Backend**
  - Cobre: CA1, CA2, CA5
  - Teste primeiro: Testes unitários e de integração em `AuthService` e `AuthController` validando DTO com campos obrigatórios/validações, hashing seguro com bcrypt, atribuição de role padrão `USER` e lançamento de HTTP 409 ao tentar cadastrar e-mail duplicado
  - Arquivos previstos: `apps/api/src/auth/dto/register.dto.ts`, `apps/api/src/auth/auth.service.ts`, `apps/api/src/auth/auth.controller.ts`, `apps/api/src/auth/auth.module.ts`, testes correspondentes

- [x] **Tarefa 3 — Implementar autenticação (Login) com JWT no Backend**
  - Cobre: CA3, CA4, CA5
  - Teste primeiro: Testes unitários e de integração em `AuthService` e `AuthController` validando emissão de token JWT para credenciais válidas e retorno estrito de HTTP 401 genérico ("Credenciais inválidas") tanto para e-mail não cadastrado quanto para senha incorreta
  - Arquivos previstos: `apps/api/src/auth/dto/login.dto.ts`, `apps/api/src/auth/auth.service.ts`, `apps/api/src/auth/auth.controller.ts`, testes correspondentes

- [ ] **Tarefa 4 — Configurar Guards de autenticação JWT, rota /auth/me e autorização por Roles no Backend**
  - Cobre: CA6, CA8
  - Teste primeiro: Testes unitários e e2e validando que rota protegida exige token válido, que `GET /auth/me` retorna os dados do usuário autenticado, e que `RolesGuard` nega acesso com HTTP 403 Forbidden para usuário comum (`role: USER`) em rota administrativa (`@Roles(Role.ADMIN)`)
  - Arquivos previstos: `apps/api/src/auth/guards/jwt-auth.guard.ts`, `apps/api/src/auth/guards/roles.guard.ts`, `apps/api/src/auth/decorators/public.decorator.ts`, `apps/api/src/auth/decorators/roles.decorator.ts`, `apps/api/src/auth/auth.controller.ts`, `apps/api/src/app.module.ts`, testes correspondentes

- [ ] **Tarefa 5 — Implementar serviço de autenticação e contexto de sessão no Frontend**
  - Cobre: CA3, CA7, CA8
  - Teste primeiro: Testes unitários no serviço de autenticação e hook de sessão testando persistência e remoção do token no `localStorage`, anexação do token Bearer nas requisições e limpeza de sessão com redirecionamento quando a API responde 401
  - Arquivos previstos: `apps/web/src/features/auth/services/authService.ts`, `apps/web/src/features/auth/context/AuthContext.tsx`, testes correspondentes

- [ ] **Tarefa 6 — Implementar página de Cadastro de Usuário e validações no Frontend**
  - Cobre: CA1, CA2, CA5, CA9, CA10
  - Teste primeiro: Testes de componente em `RegisterPage` testando validação visual de campos obrigatórios, bloqueio de submissão inválida, feedback de conflito para e-mail duplicado, tratamento de erro de conexão e descarte de dados ao desmontar
  - Arquivos previstos: `apps/web/src/features/auth/pages/RegisterPage.tsx`, testes correspondentes

- [ ] **Tarefa 7 — Implementar página de Login, estado de sessão no Header e Logout no Frontend**
  - Cobre: CA3, CA4, CA5, CA6, CA7, CA8, CA9, CA10
  - Teste primeiro: Testes de componente em `LoginPage` e Header testando fluxo de login com sucesso, mensagem genérica de erro (401), feedback de falha de conexão, atualização do Header para exibir nome do usuário logado e ação de logout, e bloqueio de rotas administrativas para usuário comum
  - Arquivos previstos: `apps/web/src/features/auth/pages/LoginPage.tsx`, `apps/web/src/shared/components/Header.tsx` (ou componente equivalente), `apps/web/src/router.tsx`, testes correspondentes

## Critérios sem tarefa

-
