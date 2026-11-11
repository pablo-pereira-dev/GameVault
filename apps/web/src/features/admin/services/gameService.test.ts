import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createGame } from './gameService';

describe('gameService', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
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
});
