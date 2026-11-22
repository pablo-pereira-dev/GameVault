import type { Dispatch } from 'react';
import { UnauthorizedError, type User } from '../services/authService';
import type { AuthAction, AuthActions } from './authReducer';

export interface AuthActionsDeps {
  login(email: string, password: string): Promise<void>;
  getMe(): Promise<User>;
  clearSession(): void;
}

/** Ações da sessão chamadas pelo Provider; injetáveis para testar o wiring sem DOM. */
export function createAuthActions(
  dispatch: Dispatch<AuthAction>,
  services: AuthActionsDeps,
): AuthActions {
  async function restoreSession(): Promise<void> {
    try {
      const user = await services.getMe();
      dispatch({ type: 'authenticated', user });
    } catch (error) {
      if (error instanceof UnauthorizedError) {
        dispatch({ type: 'unauthorized' });
        return;
      }
      throw error;
    }
  }

  async function login(email: string, password: string): Promise<void> {
    await services.login(email, password);
    await restoreSession();
  }

  function logout(): void {
    services.clearSession();
    dispatch({ type: 'logout' });
  }

  return { login, logout, restoreSession };
}
