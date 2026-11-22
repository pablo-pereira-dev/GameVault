import { describe, expect, it, vi } from 'vitest';
import { renderToString } from 'react-dom/server';
import { AuthProvider } from '../../features/auth/context/AuthContext';
import {
  authenticatedState,
  buildAuthContextValue,
  initialAuthState,
  type AuthContextValue,
} from '../../features/auth/context/authReducer';
import { AuthContext } from '../../features/auth/context/useAuth';
import type { User } from '../../features/auth/services/authService';
import { ROUTES } from '../constants/routes';
import Header, { handleLogout } from './Header';

const user: User = {
  id: '1',
  name: 'Ana',
  email: 'ana@example.com',
  role: 'USER',
  createdAt: '2026-01-01T00:00:00.000Z',
};

function makeAuth(state = initialAuthState): AuthContextValue {
  return buildAuthContextValue(state, {
    login: vi.fn(async (_email: string, _password: string) => {}),
    logout: vi.fn(),
    restoreSession: vi.fn(async () => {}),
  });
}

describe('Header — estado da sessão (CA3, CA7)', () => {
  it('visitante vê Entrar e Criar conta, sem nome nem ação de sair', () => {
    const html = renderToString(
      <AuthProvider>
        <Header navigate={vi.fn()} />
      </AuthProvider>,
    );

    expect(html).toContain('GameVault');
    expect(html).toContain('Entrar');
    expect(html).toContain('Criar conta');
    expect(html).not.toContain('>Sair</button>');
    expect(html).not.toContain(user.name);
  });

  it('autenticado vê o nome do usuário e a ação de sair', () => {
    const html = renderToString(
      <AuthContext.Provider value={makeAuth(authenticatedState(user))}>
        <Header navigate={vi.fn()} />
      </AuthContext.Provider>,
    );

    expect(html).toContain(user.name);
    expect(html).toContain('>Sair</button>');
    expect(html).not.toContain('Criar conta');
  });

  it('CA7: Sair encerra a sessão e volta à vitrine', () => {
    const auth = makeAuth(authenticatedState(user));
    const navigate = vi.fn<(path: string) => void>();

    handleLogout(auth, navigate);

    expect(auth.logout).toHaveBeenCalledOnce();
    expect(navigate).toHaveBeenCalledWith(ROUTES.store);
  });
});

describe('Header — links derivados dos paths canônicos', () => {
  it('usa ROUTES para os destinos de vitrine, login e cadastro', () => {
    const html = renderToString(
      <AuthProvider>
        <Header navigate={vi.fn()} />
      </AuthProvider>,
    );

    expect(html).toContain(`href="${ROUTES.store}"`);
    expect(html).toContain(`href="${ROUTES.login}"`);
    expect(html).toContain(`href="${ROUTES.register}"`);
  });
});
