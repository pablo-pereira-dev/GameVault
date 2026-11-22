import { request } from '../../../shared/services/http';

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
  const response = await request('/games', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    if (response.status === 409) {
      throw new Error(errorData.message || 'Já existe um jogo cadastrado com este título.');
    }
    throw new Error(errorData.message || 'Erro ao cadastrar jogo.');
  }

  const json = await response.json();
  return json.data;
}
