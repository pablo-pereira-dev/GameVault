import { describe, expect, it, vi } from 'vitest';
import { renderToString } from 'react-dom/server';
import { AuthProvider } from './AuthContext';
import { createAuthActions } from './authActions';
import {
  authenticatedState,
  authReducer,
  buildAuthContextValue,
  initialAuthState,
  loggedOutState,
  type AuthContextValue,
} from './authReducer';
import { useAuth } from './useAuth';
import {
  LOGIN_PATH,
  TOKEN_KEY,
  UnauthorizedError,
  clearSession,
  type StorageLike,
  type User,
} from '../services/authService';

const user: User = {
  id: '1',
  name: 'Ana',
  email: 'ana@example.com',
  role: 'USER',
  createdAt: '2026-01-01T00:00:00.000Z',
};

function makeStorage(initial: Record<string, string> = {}): StorageLike {
  const data = new Map(Object.entries(initial));
  return {
    getItem: (key) => data.get(key) ?? null,
    setItem: (key, value) => {
      data.set(key, value);
    },
    removeItem: (key) => {
      data.delete(key);
    },
  };
}

function noopServices() {
  return {
    login: vi.fn(async (_email: string, _password: string) => {}),
    getMe: vi.fn(async () => user),
    clearSession: vi.fn(),
  };
}

/** Sonda de renderização: entrega o valor do contexto sem gravar estado fora do componente. */
function Probe({ onSession }: { onSession(session: AuthContextValue): void }) {
  const session = useAuth();
  onSession(session);
  return <span>{`${session.isAuthenticated}:${session.user?.name ?? 'anon'}`}</span>;
}

describe('AuthContext', () => {
  it('starts in the logged-out state (CA3)', () => {
    expect(initialAuthState).toEqual(expect.objectContaining({ user: null, isAuthenticated: false }));
  });

  it('builds the authenticated state from the profile (CA3)', () => {
    expect(authenticatedState(user)).toEqual(
      expect.objectContaining({ user, isAuthenticated: true }),
    );
  });

  it('builds the logged-out state (CA7)', () => {
    expect(loggedOutState()).toEqual(expect.objectContaining({ user: null, isAuthenticated: false }));
  });

  it('zeroes the state on a 401 reaction (CA8)', () => {
    expect(authReducer(authenticatedState(user), { type: 'unauthorized' })).toEqual(
      expect.objectContaining({ user: null, isAuthenticated: false }),
    );
  });

  it('merges the current state and the actions into the context value', () => {
    const actions = {
      login: vi.fn(async (_email: string, _password: string) => {}),
      logout: vi.fn(),
      restoreSession: vi.fn(async () => {}),
    };
    // Um campo novo no estado não pode quebrar a asserção do valor exposto.
    const state = { ...authenticatedState(user), isLoading: false };

    expect(buildAuthContextValue(state, actions)).toEqual(
      expect.objectContaining({
        user,
        isAuthenticated: true,
        isLoading: false,
        login: actions.login,
        logout: actions.logout,
        restoreSession: actions.restoreSession,
      }),
    );
  });

  it('dispatches the logout action after clearing the session (CA7)', () => {
    const storage = makeStorage({ [TOKEN_KEY]: 'jwt-token' });
    const dispatch = vi.fn();
    const actions = createAuthActions(dispatch, {
      ...noopServices(),
      clearSession: () => clearSession({ storage }),
    });

    actions.logout();

    expect(storage.getItem(TOKEN_KEY)).toBeNull();
    expect(dispatch).toHaveBeenCalledWith({ type: 'logout' });
  });

  it('authenticates the session after a successful login (CA3)', async () => {
    const services = noopServices();
    const dispatch = vi.fn();
    const actions = createAuthActions(dispatch, services);

    await actions.login('ana@example.com', 'senha123');

    expect(services.login).toHaveBeenCalledWith('ana@example.com', 'senha123');
    expect(services.getMe).toHaveBeenCalledOnce();
    expect(dispatch).toHaveBeenCalledWith({ type: 'authenticated', user });
  });

  it('ends the session when restoring a profile gets a 401 (CA8)', async () => {
    const services = noopServices();
    services.getMe.mockRejectedValueOnce(new UnauthorizedError());
    const dispatch = vi.fn();
    const actions = createAuthActions(dispatch, services);

    await expect(actions.restoreSession()).resolves.toBeUndefined();

    expect(dispatch).toHaveBeenCalledWith({ type: 'unauthorized' });
  });

  it('exposes the session through useAuth inside the provider (CA3, CA7)', () => {
    const onSession = vi.fn<(session: AuthContextValue) => void>();

    const html = renderToString(
      <AuthProvider>
        <Probe onSession={onSession} />
      </AuthProvider>,
    );

    expect(html).toContain('false:anon');
    expect(onSession.mock.calls[0]![0]).toEqual(
      expect.objectContaining({
        user: null,
        isAuthenticated: false,
        login: expect.any(Function),
        logout: expect.any(Function),
        restoreSession: expect.any(Function),
      }),
    );
  });

  it('clears the injected storage through the provider action (CA7)', () => {
    const storage = makeStorage({ [TOKEN_KEY]: 'jwt-token' });
    const onSession = vi.fn<(session: AuthContextValue) => void>();

    renderToString(
      <AuthProvider storage={storage}>
        <Probe onSession={onSession} />
      </AuthProvider>,
    );
    onSession.mock.calls[0]![0].logout();

    expect(storage.getItem(TOKEN_KEY)).toBeNull();
  });

  it('forwards the injected redirect to the protected request (CA8)', async () => {
    const storage = makeStorage({ [TOKEN_KEY]: 'expired-token' });
    const redirect = vi.fn<(path: string) => void>();
    const fetchFn = vi.fn<typeof fetch>().mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: async () => ({ message: 'Unauthorized' }),
    } as Response);
    const onSession = vi.fn<(session: AuthContextValue) => void>();

    renderToString(
      <AuthProvider storage={storage} redirect={redirect} fetchFn={fetchFn}>
        <Probe onSession={onSession} />
      </AuthProvider>,
    );
    await onSession.mock.calls[0]![0].restoreSession();

    expect(fetchFn).toHaveBeenCalledWith(
      '/auth/me',
      expect.objectContaining({
        headers: expect.objectContaining({ Authorization: 'Bearer expired-token' }),
      }),
    );
    expect(redirect).toHaveBeenCalledWith(LOGIN_PATH);
    expect(storage.getItem(TOKEN_KEY)).toBeNull();
  });
});
