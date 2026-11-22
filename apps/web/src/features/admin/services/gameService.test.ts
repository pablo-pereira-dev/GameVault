import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { LOGIN_PATH, TOKEN_KEY, type StorageLike } from '../../auth/services/authService';
import { createGame } from './gameService';

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

const gameData = {
  title: 'Test Game',
  description: 'A test game',
  price: 99.90,
  stock: 10,
  imageUrl: 'http://example.com/image.jpg',
};

describe('gameService', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
    vi.stubGlobal('localStorage', makeStorage({ [TOKEN_KEY]: 'jwt-token' }));
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('should create a game successfully (CA1)', async () => {
    const mockGame = {
      id: '1',
      title: 'Test Game',
      description: 'A test game',
      price: 99.90,
      stock: 10,
      imageUrl: 'http://example.com/image.jpg',
      createdAt: new Date().toISOString(),
    };

    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: mockGame }),
    } as Response);

    const result = await createGame({
      title: 'Test Game',
      description: 'A test game',
      price: 99.90,
      stock: 10,
      imageUrl: 'http://example.com/image.jpg',
    });

    expect(fetch).toHaveBeenCalledWith('/games', expect.any(Object));
    expect(result).toEqual(mockGame);
  });

  it('should throw conflict error on 409 (CA2)', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      status: 409,
      json: async () => ({ message: 'Já existe um jogo cadastrado com este título.' }),
    } as Response);

    await expect(
      createGame({
        title: 'Existing Game',
        description: 'Desc',
        price: 50,
        stock: 5,
        imageUrl: 'http://example.com/img.jpg',
      })
    ).rejects.toThrow('Já existe um jogo cadastrado com este título.');
  });

  it('should handle network failure or timeout (CA5)', async () => {
    vi.mocked(fetch).mockRejectedValueOnce(new Error('Network error'));

    await expect(
      createGame({
        title: 'Game',
        description: 'Desc',
        price: 50,
        stock: 5,
        imageUrl: 'http://example.com/img.jpg',
      })
    ).rejects.toThrow();
  });

  it('sends the Bearer token when creating a game (CA6)', async () => {
    const storage = makeStorage({ [TOKEN_KEY]: 'jwt-token' });
    const game = { ...gameData, id: '1', createdAt: '2026-01-01T00:00:00.000Z' };
    const fetchFn = vi.fn<typeof fetch>().mockResolvedValueOnce({
      ok: true,
      status: 201,
      json: async () => ({ data: game }),
    } as Response);

    await createGame(gameData, { storage, fetchFn });

    expect(fetchFn).toHaveBeenCalledWith(
      '/games',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
          Authorization: 'Bearer jwt-token',
        }),
        body: JSON.stringify(gameData),
      }),
    );
  });

  it('clears the session and redirects when POST /games answers 401 (CA8)', async () => {
    const storage = makeStorage({ [TOKEN_KEY]: 'expired-token' });
    const redirect = vi.fn<(path: string) => void>();
    const unauthorized = {
      ok: false,
      status: 401,
      json: async () => ({ statusCode: 401, message: 'Unauthorized' }),
    } as Response;
    const fetchFn = vi.fn<typeof fetch>().mockResolvedValueOnce(unauthorized);

    await expect(createGame(gameData, { storage, redirect, fetchFn })).rejects.toThrow();

    expect(storage.getItem(TOKEN_KEY)).toBeNull();
    expect(redirect).toHaveBeenCalledWith(LOGIN_PATH);
  });
});
