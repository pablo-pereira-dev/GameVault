import { request } from '../../../shared/services/http';

export const TOKEN_KEY = 'gamevault_access_token';
export const LOGIN_PATH = '/login';
export const EMAIL_IN_USE_MESSAGE = 'E-mail já está em uso.';

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
}

export type Role = 'USER' | 'ADMIN';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  createdAt: string;
}

export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export type RedirectFn = (path: string) => void;

export interface AuthServiceOptions {
  storage?: StorageLike;
  redirect?: RedirectFn;
  fetchFn?: typeof fetch;
}

export class UnauthorizedError extends Error {
  constructor(message = 'Sessão expirada.') {
    super(message);
    this.name = 'UnauthorizedError';
  }
}

export class EmailAlreadyInUseError extends Error {
  constructor(message = EMAIL_IN_USE_MESSAGE) {
    super(message);
    this.name = 'EmailAlreadyInUseError';
  }
}

export function defaultRedirect(path: string): void {
  window.location.assign(path);
}

export function getStoredToken(storage: StorageLike = localStorage): string | null {
  return storage.getItem(TOKEN_KEY);
}

export function persistToken(token: string, storage: StorageLike = localStorage): void {
  storage.setItem(TOKEN_KEY, token);
}

export function removeStoredToken(storage: StorageLike = localStorage): void {
  storage.removeItem(TOKEN_KEY);
}

/** Ponto único de tratamento do 401 em operações protegidas: limpa a sessão e redireciona. */
export function handleUnauthorized(
  response: Response,
  storage: StorageLike,
  redirect: RedirectFn,
): boolean {
  if (response.status !== 401) {
    return false;
  }
  removeStoredToken(storage);
  redirect(LOGIN_PATH);
  return true;
}

export function clearSession(options: Pick<AuthServiceOptions, 'storage'> = {}): void {
  removeStoredToken(options.storage ?? localStorage);
}

export async function login(
  data: LoginData,
  options: AuthServiceOptions = {},
): Promise<string> {
  const response = await request(
    '/auth/login',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    },
    { fetchFn: options.fetchFn },
  );

  // 401 de login é credencial inválida (CA4), não sessão expirada: sem limpeza nem redirect.
  if (response.status === 401) {
    throw new Error('Credenciais inválidas.');
  }
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Erro ao entrar.');
  }

  const json = await response.json();
  const token: string = json.data.accessToken;
  persistToken(token, options.storage ?? localStorage);
  return token;
}

/** Cadastro não autentica: não grava token, não redireciona e não toca no storage. */
export async function register(
  data: RegisterData,
  options: AuthServiceOptions = {},
): Promise<User> {
  const response = await request(
    '/auth/register',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    },
    { fetchFn: options.fetchFn },
  );

  if (response.status === 409) {
    throw new EmailAlreadyInUseError();
  }
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Erro ao cadastrar usuário.');
  }

  const json = await response.json();
  return json.data;
}

export async function getMe(options: AuthServiceOptions = {}): Promise<User> {
  const storage = options.storage ?? localStorage;
  const redirect = options.redirect ?? defaultRedirect;

  const token = getStoredToken(storage);
  if (!token) {
    // Visitante anônimo: nada a restaurar, sem chamada e sem ejeção para /login.
    throw new UnauthorizedError();
  }

  const response = await request(
    '/auth/me',
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    },
    {
      fetchFn: options.fetchFn,
      onUnauthorized: (unauthorized) => handleUnauthorized(unauthorized, storage, redirect),
    },
  );

  if (response.status === 401) {
    throw new UnauthorizedError();
  }
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Erro ao carregar perfil.');
  }

  const json = await response.json();
  return json.data;
}
