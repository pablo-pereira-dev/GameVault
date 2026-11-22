/** Ponto único da mensagem de queda de conexão (CA9), compartilhado pelas features. */
export const CONNECTION_ERROR_MESSAGE =
  'Falha de conexão com a rede. Tente novamente após alguns segundos.';

const TIMEOUT_MS = 10_000;

export interface HttpRequestOptions {
  fetchFn?: typeof fetch;
  onUnauthorized?: (response: Response) => void;
}

export function isConnectionError(error: unknown): boolean {
  if (!(error instanceof Error)) {
    return false;
  }
  if (error.name === 'AbortError') {
    return true;
  }
  const message = error.message.toLowerCase();
  return message === 'failed to fetch' || message.includes('network') || message.includes('fetch');
}

/**
 * Wrapper de rede compartilhado: timeout, abort e normalização de falha de conexão
 * ficam aqui; cada feature só decide o que fazer com a resposta.
 */
export async function request(
  path: string,
  init: RequestInit,
  options: HttpRequestOptions = {},
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);
  let response: Response;

  try {
    response = await (options.fetchFn ?? fetch)(path, { ...init, signal: controller.signal });
  } catch (error) {
    if (isConnectionError(error)) {
      throw new Error(CONNECTION_ERROR_MESSAGE);
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }

  if (response.status === 401) {
    options.onUnauthorized?.(response);
  }
  return response;
}
