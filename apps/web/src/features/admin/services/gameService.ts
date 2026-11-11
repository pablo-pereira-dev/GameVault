export interface CreateGameData {
  title: string;
  description: string;
  price: number;
  stock: number;
  imageUrl: string;
}

export interface Game extends CreateGameData {
  id: string;
  createdAt: string;
}

export async function createGame(data: CreateGameData): Promise<Game> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);

  try {
    const response = await fetch('/games', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      if (response.status === 409) {
        throw new Error(errorData.message || 'Já existe um jogo cadastrado com este título.');
      }
      throw new Error(errorData.message || 'Erro ao cadastrar jogo.');
    }

    const json = await response.json();
    return json.data;
  } catch (err: any) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError' || err.message === 'Failed to fetch' || err.message.includes('network') || err.message.includes('fetch')) {
      throw new Error('Falha de conexão com a rede. Tente novamente após alguns segundos.');
    }
    throw err;
  }
}
