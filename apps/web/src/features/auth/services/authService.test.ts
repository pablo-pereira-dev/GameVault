import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  LOGIN_PATH,
  TOKEN_KEY,
  UnauthorizedError,
  clearSession,
  getMe,
  handleUnauthorized,
  login,
  type StorageLike,
} from './authService';

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

describe('authService', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('persists the access token after a successful login (CA3)', async () => {
    const storage = makeStorage();
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ data: { accessToken: 'jwt-token' } }),
    } as Response);

    const token = await login(
      { email: 'ana@example.com', password: 'senha123' },
      { storage },
    );

    expect(fetch).toHaveBeenCalledWith(
      '/auth/login',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'ana@example.com', password: 'senha123' }),
      }),
    );
    expect(token).toBe('jwt-token');
    expect(storage.getItem(TOKEN_KEY)).toBe('jwt-token');
  });

  it('sends the Bearer token when requesting /auth/me (CA3, CA8)', async () => {
    const storage = makeStorage({ [TOKEN_KEY]: 'jwt-token' });
    const user = {
      id: '1',
      name: 'Ana',
      email: 'ana@example.com',
      role: 'USER',
      createdAt: '2026-01-01T00:00:00.000Z',
    };
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ data: user }),
    } as Response);

    const result = await getMe({ storage });

    expect(fetch).toHaveBeenCalledWith(
      '/auth/me',
      expect.objectContaining({
        method: 'GET',
        headers: expect.objectContaining({ Authorization: 'Bearer jwt-token' }),
      }),
    );
    expect(result).toEqual(user);
  });

  it('does not fetch or redirect when there is no stored token', async () => {
    const storage = makeStorage();
    const redirect = vi.fn<(path: string) => void>();
    const fetchFn = vi.fn<typeof fetch>();

    await expect(getMe({ storage, redirect, fetchFn })).rejects.toBeInstanceOf(UnauthorizedError);

    expect(fetchFn).not.toHaveBeenCalled();
    expect(redirect).not.toHaveBeenCalled();
  });

  it('removes the token on clearSession (CA7)', () => {
    const storage = makeStorage({ [TOKEN_KEY]: 'jwt-token' });

    clearSession({ storage });

    expect(storage.getItem(TOKEN_KEY)).toBeNull();
  });

  it('clears the session and redirects when /auth/me answers 401 (CA8)', async () => {
    const storage = makeStorage({ [TOKEN_KEY]: 'expired-token' });
    const redirect = vi.fn<(path: string) => void>();
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: async () => ({ statusCode: 401, message: 'Unauthorized', error: 'Unauthorized' }),
    } as Response);

    await expect(getMe({ storage, redirect })).rejects.toBeInstanceOf(UnauthorizedError);

    expect(storage.getItem(TOKEN_KEY)).toBeNull();
    expect(redirect).toHaveBeenCalledWith(LOGIN_PATH);
  });

  it('treats the 401 as a single shared handler (CA8)', () => {
    const storage = makeStorage({ [TOKEN_KEY]: 'invalid-token' });
    const redirect = vi.fn<(path: string) => void>();

    expect(handleUnauthorized({ status: 401 } as Response, storage, redirect)).toBe(true);
    expect(storage.getItem(TOKEN_KEY)).toBeNull();
    expect(redirect).toHaveBeenCalledWith(LOGIN_PATH);

    const otherStorage = makeStorage({ [TOKEN_KEY]: 'valid-token' });
    const otherRedirect = vi.fn<(path: string) => void>();
    expect(handleUnauthorized({ status: 200 } as Response, otherStorage, otherRedirect)).toBe(false);
    expect(otherStorage.getItem(TOKEN_KEY)).toBe('valid-token');
    expect(otherRedirect).not.toHaveBeenCalled();
  });

  it('throws a generic error on invalid credentials (CA4)', async () => {
    const storage = makeStorage();
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: async () => ({ statusCode: 401, message: 'Credenciais inválidas', error: 'Unauthorized' }),
    } as Response);

    await expect(
      login({ email: 'ana@example.com', password: 'wrong' }, { storage }),
    ).rejects.toThrow('Credenciais inválidas');
    expect(storage.getItem(TOKEN_KEY)).toBeNull();
  });

  it('never triggers the unauthorized handler on the login 401 (CA4)', async () => {
    const storage = makeStorage({ [TOKEN_KEY]: 'previous-token' });
    const redirect = vi.fn<(path: string) => void>();
    const fetchFn = vi.fn<typeof fetch>().mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: async () => ({ message: 'Credenciais inválidas' }),
    } as Response);

    await expect(
      login({ email: 'ana@example.com', password: 'wrong' }, { storage, redirect, fetchFn }),
    ).rejects.toThrow('Credenciais inválidas');

    expect(storage.getItem(TOKEN_KEY)).toBe('previous-token');
    expect(redirect).not.toHaveBeenCalled();
  });
});
