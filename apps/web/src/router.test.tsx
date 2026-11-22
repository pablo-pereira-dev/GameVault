import type { ComponentType } from 'react';
import { renderToString } from 'react-dom/server';
import { afterEach, describe, expect, it, vi } from 'vitest';
import App from './App';
import CreateGamePage from './features/admin/pages/CreateGamePage';
import LoginPage from './features/auth/pages/LoginPage';
import RegisterPage from './features/auth/pages/RegisterPage';
import StorePage from './features/store/pages/StorePage';
import AppRouter, { ROUTES, navigate, resolveRoute } from './router';
import {
  authenticatedState,
  buildAuthContextValue,
  initialAuthState,
} from './features/auth/context/authReducer';
import { AuthContext } from './features/auth/context/useAuth';
import type { User } from './features/auth/services/authService';

const user: User = {
  id: '1',
  name: 'Ana',
  email: 'ana@example.com',
  role: 'USER',
  createdAt: '2026-01-01T00:00:00.000Z',
};

const admin: User = { ...user, role: 'ADMIN' };

/**
 * As páginas reais são importadas de forma "eager" apenas nos testes: o lazy do
 * router não resolve em renderToString (limite declarado deste harness).
 */
const eagerPages = {
  store: StorePage,
  login: LoginPage,
  register: RegisterPage,
  admin: CreateGamePage,
};

function makeAuth(currentUser: User | null) {
  return buildAuthContextValue(
    currentUser ? authenticatedState(currentUser) : initialAuthState,
    {
      login: vi.fn(async (_email: string, _password: string) => {}),
      logout: vi.fn(),
      restoreSession: vi.fn(async () => {}),
    },
  );
}

describe('resolveRoute — decisão pura de roteamento (CA3, CA6)', () => {
  it('visitante em rota protegida é levado ao login', () => {
    expect(resolveRoute(ROUTES.adminGames, { isAuthenticated: false, role: null })).toEqual({
      view: 'login',
      redirect: ROUTES.login,
    });
  });

  it('usuário comum em rota ADMIN é barrado com acesso negado', () => {
    expect(resolveRoute(ROUTES.adminGames, { isAuthenticated: true, role: 'USER' })).toEqual({
      view: 'forbidden',
      redirect: null,
    });
  });

  it('administrador acessa a rota ADMIN', () => {
    expect(resolveRoute(ROUTES.adminGames, { isAuthenticated: true, role: 'ADMIN' })).toEqual({
      view: 'admin',
      redirect: null,
    });
  });

  it('rotas públicas e a vitrine seguem liberadas para o visitante', () => {
    const visitor = { isAuthenticated: false, role: null };
    expect(resolveRoute(ROUTES.store, visitor)).toEqual({ view: 'store', redirect: null });
    expect(resolveRoute(ROUTES.login, visitor)).toEqual({ view: 'login', redirect: null });
    expect(resolveRoute(ROUTES.register, visitor)).toEqual({ view: 'register', redirect: null });
  });

  it('normaliza rotas desconhecidas para a vitrine', () => {
    expect(resolveRoute('/rota-inexistente', { isAuthenticated: false, role: null })).toEqual({
      view: 'store',
      redirect: ROUTES.store,
    });
  });
});

describe('restauração de sessão antes do redirect (CA8)', () => {
  it('não redireciona a rota protegida enquanto a sessão não foi hidratada', () => {
    expect(
      resolveRoute(ROUTES.adminGames, { isAuthenticated: false, role: null }, false),
    ).toEqual({ view: 'login', redirect: null });
  });

  it('deep link autenticado permanece na rota administrativa após a restauração', () => {
    expect(
      resolveRoute(ROUTES.adminGames, { isAuthenticated: true, role: 'ADMIN' }, true),
    ).toEqual({ view: 'admin', redirect: null });
  });

  it('sessão inválida após a restauração redireciona ao login', () => {
    expect(
      resolveRoute(ROUTES.adminGames, { isAuthenticated: false, role: null }, true),
    ).toEqual({ view: 'login', redirect: ROUTES.login });
  });
});

describe('navegação sem recarregar a página (History API)', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('pushState e popstate movem a aplicação sem location.assign', () => {
    const pushState = vi.fn();
    const replaceState = vi.fn();
    const dispatchEvent = vi.fn(() => true);
    class FakePopStateEvent {
      type: string;
      constructor(type: string) {
        this.type = type;
      }
    }
    vi.stubGlobal('PopStateEvent', FakePopStateEvent);
    vi.stubGlobal('window', {
      location: { pathname: '/', href: 'http://localhost/' },
      history: { pushState, replaceState },
      dispatchEvent,
    });

    navigate(ROUTES.login);

    expect(pushState).toHaveBeenCalledWith(null, '', ROUTES.login);
    expect(replaceState).not.toHaveBeenCalled();
    expect(dispatchEvent).toHaveBeenCalledWith(expect.objectContaining({ type: 'popstate' }));
  });
});

describe('AppRouter — composição renderizável (limites do renderToString)', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('App monta AuthProvider acima do Header e do roteador', () => {
    const html = renderToString(<App />);

    expect(html).toContain('GameVault');
    expect(html).toContain('Entrar');
    // renderToString não resolve import() dinâmico: o fallback é o esperado aqui.
    expect(html).toContain('Carregando...');
  });

  it('visitante vê a vitrine quando as páginas eager são injetadas', () => {
    const html = renderToString(
      <AuthContext.Provider value={makeAuth(null)}>
        <AppRouter pages={eagerPages} />
      </AuthContext.Provider>,
    );

    expect(html).toContain('Vitrine da loja');
  });

  it('USER em rota administrativa vê acesso negado na interface', () => {
    vi.stubGlobal('window', { location: { pathname: ROUTES.adminGames } });

    const html = renderToString(
      <AuthContext.Provider value={makeAuth(user)}>
        <AppRouter pages={eagerPages} />
      </AuthContext.Provider>,
    );

    expect(html).toContain('Acesso negado');
    expect(html).not.toContain('Cadastrar Novo Jogo');
  });

  it('ADMIN em rota administrativa vê a gestão de jogos', () => {
    vi.stubGlobal('window', { location: { pathname: ROUTES.adminGames } });

    const html = renderToString(
      <AuthContext.Provider value={makeAuth(admin)}>
        <AppRouter pages={eagerPages} />
      </AuthContext.Provider>,
    );

    expect(html).toContain('Cadastrar Novo Jogo');
    expect(html).not.toContain('Acesso negado');
  });

  it('aceita páginas injetadas para testar a composição sem resolver o lazy', () => {
    const Marker = () => <p>Página injetada no teste</p>;
    const html = renderToString(
      <AuthContext.Provider value={makeAuth(null)}>
        <AppRouter
          pages={{ store: Marker, login: Marker, register: Marker, admin: Marker }}
        />
      </AuthContext.Provider>,
    );

    expect(html).toContain('Página injetada no teste');
    expect(html).not.toContain('Vitrine da loja');
  });

  it('mostra o fallback do Suspense enquanto a página lazy não resolve', () => {
    let resolvePage: () => void = () => {};
    const pending = new Promise<void>((resolve) => {
      resolvePage = resolve;
    });
    const Suspended: ComponentType = () => {
      throw pending;
    };

    const html = renderToString(
      <AuthContext.Provider value={makeAuth(null)}>
        <AppRouter
          pages={{ store: Suspended, login: Suspended, register: Suspended, admin: Suspended }}
        />
      </AuthContext.Provider>,
    );

    expect(html).toContain('Carregando...');
    resolvePage();
  });
});
