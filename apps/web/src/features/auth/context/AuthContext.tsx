import { useReducer, type ReactNode } from 'react';
import {
  clearSession,
  getMe,
  login as serviceLogin,
  type AuthServiceOptions,
  type RedirectFn,
  type StorageLike,
} from '../services/authService';
import { createAuthActions } from './authActions';
import { authReducer, buildAuthContextValue, initialAuthState } from './authReducer';
import { AuthContext } from './useAuth';

export function AuthProvider({
  children,
  redirect,
  storage,
  fetchFn,
}: {
  children: ReactNode;
  redirect?: RedirectFn;
  storage?: StorageLike;
  fetchFn?: typeof fetch;
}) {
  const [state, dispatch] = useReducer(authReducer, initialAuthState);
  const serviceOptions: AuthServiceOptions = { redirect, storage, fetchFn };

  const actions = createAuthActions(dispatch, {
    login: async (email, password) => {
      await serviceLogin({ email, password }, serviceOptions);
    },
    getMe: () => getMe(serviceOptions),
    clearSession: () => clearSession({ storage }),
  });

  return (
    <AuthContext.Provider value={buildAuthContextValue(state, actions)}>
      {children}
    </AuthContext.Provider>
  );
}
