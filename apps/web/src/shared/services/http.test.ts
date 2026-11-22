import { afterEach, describe, expect, it, vi } from 'vitest';
import { CONNECTION_ERROR_MESSAGE, request } from './http';

describe('shared http request', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('invokes onUnauthorized automatically on a 401 response', async () => {
    const onUnauthorized = vi.fn();
    const fetchFn = vi
      .fn<typeof fetch>()
      .mockResolvedValue({ ok: false, status: 401 } as Response);

    const response = await request('/auth/me', { method: 'GET' }, { fetchFn, onUnauthorized });

    expect(onUnauthorized).toHaveBeenCalledWith(response);
  });

  it('does not invoke onUnauthorized on other statuses', async () => {
    const onUnauthorized = vi.fn();
    const fetchFn = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce({ ok: true, status: 200 } as Response)
      .mockResolvedValueOnce({ ok: false, status: 403 } as Response);

    await request('/games', { method: 'POST' }, { fetchFn, onUnauthorized });
    await request('/games', { method: 'POST' }, { fetchFn, onUnauthorized });

    expect(onUnauthorized).not.toHaveBeenCalled();
  });

  it('normalizes network failures and aborts to the single connection message (CA9)', async () => {
    const network = vi.fn<typeof fetch>().mockRejectedValue(new Error('Failed to fetch'));
    const aborted = vi
      .fn<typeof fetch>()
      .mockRejectedValue(Object.assign(new Error('aborted'), { name: 'AbortError' }));

    await expect(request('/auth/login', { method: 'POST' }, { fetchFn: network })).rejects.toThrow(
      CONNECTION_ERROR_MESSAGE,
    );
    await expect(request('/games', { method: 'POST' }, { fetchFn: aborted })).rejects.toThrow(
      CONNECTION_ERROR_MESSAGE,
    );
  });

  it('aborts a stalled request after 10 seconds (CA9)', async () => {
    vi.useFakeTimers();
    const fetchFn = vi.fn<typeof fetch>((_input, init) => {
      return new Promise<Response>((_resolve, reject) => {
        init?.signal?.addEventListener('abort', () => {
          reject(Object.assign(new Error('aborted'), { name: 'AbortError' }));
        });
      });
    });

    // Anexa o handler antes de avançar o relógio: o abort acontece durante o advance.
    const pending = expect(
      request('/games', { method: 'POST' }, { fetchFn }),
    ).rejects.toThrow(CONNECTION_ERROR_MESSAGE);
    await vi.advanceTimersByTimeAsync(10_000);

    await pending;
    expect(fetchFn).toHaveBeenCalledWith(
      '/games',
      expect.objectContaining({ signal: expect.any(AbortSignal) }),
    );
  });
});
