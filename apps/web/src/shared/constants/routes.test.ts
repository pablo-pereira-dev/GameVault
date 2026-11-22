import { describe, expect, it } from 'vitest';
import { LOGIN_PATH } from '../../features/auth/services/authService';
import { ROUTES as ROUTES_FROM_ROUTER } from '../../router';
import { ROUTES } from './routes';

describe('ROUTES — fonte única dos paths', () => {
  it('define os paths canônicos em um único módulo', () => {
    expect(ROUTES).toEqual({
      store: '/',
      login: '/login',
      register: '/register',
      adminGames: '/admin/games',
    });
  });

  it('o router reexporta o mesmo objeto, sem criar uma segunda definição', () => {
    expect(ROUTES_FROM_ROUTER).toBe(ROUTES);
  });

  it('authService deriva LOGIN_PATH do módulo canônico', () => {
    expect(LOGIN_PATH).toBe(ROUTES.login);
  });
});
