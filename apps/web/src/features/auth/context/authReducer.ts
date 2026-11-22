import type { User } from '../services/authService';

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}

export const initialAuthState: AuthState = { user: null, isAuthenticated: false };

export function authenticatedState(user: User): AuthState {
  return { user, isAuthenticated: true };
}

export function loggedOutState(): AuthState {
  return { user: null, isAuthenticated: false };
}

export type AuthAction =
  | { type: 'authenticated'; user: User }
  | { type: 'unauthorized' }
  | { type: 'logout' };

export function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'authenticated':
      return authenticatedState(action.user);
    case 'unauthorized':
    case 'logout':
      return loggedOutState();
    default:
      return state;
  }
}

export interface AuthActions {
  login(email: string, password: string): Promise<void>;
  logout(): void;
  restoreSession(): Promise<void>;
}

export type AuthContextValue = AuthState & AuthActions;

/** Monta o valor exposto pelo Provider a partir do estado atual — usado também nos testes. */
export function buildAuthContextValue<S extends AuthState, A extends AuthActions>(
  state: S,
  actions: A,
): S & A {
  return { ...state, ...actions };
}
