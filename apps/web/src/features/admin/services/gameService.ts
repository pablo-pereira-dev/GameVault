import { request } from '../../../shared/services/http';
import {
  defaultRedirect,
  getStoredToken,
  handleUnauthorized,
  type AuthServiceOptions,
} from '../../auth/services/authService';

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

export async function createGame(
  data: CreateGameData,
  options: AuthServiceOptions = {},
): Promise<Game> {
  const storage = options.storage ?? localStorage;
  const redirect = options.redirect ?? defaultRedirect;
  const token = getStoredToken(storage);

  const response = await request(
    '/games',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    },
    {
      fetchFn: options.fetchFn,
      onUnauthorized: (unauthorized) => handleUnauthorized(unauthorized, storage, redirect),
    },
  );

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
