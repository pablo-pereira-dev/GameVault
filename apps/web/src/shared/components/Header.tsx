import type { MouseEvent } from 'react';
import type { AuthContextValue } from '../../features/auth/context/authReducer';
import { useAuth } from '../../features/auth/context/useAuth';
import { ROUTES } from '../constants/routes';
import './Header.css';

export type NavigateFn = (path: string, options?: { replace?: boolean }) => void;

/** CA7: a ação Sair encerra a sessão e devolve o visitante à vitrine. */
export function handleLogout(
  auth: Pick<AuthContextValue, 'logout'>,
  navigate: NavigateFn,
): void {
  auth.logout();
  navigate(ROUTES.store);
}

export default function Header({ navigate }: { navigate: NavigateFn }) {
  const auth = useAuth();

  const go =
    (path: string) =>
    (event: MouseEvent<HTMLAnchorElement>): void => {
      event.preventDefault();
      navigate(path);
    };

  return (
    <header className="gv-header">
      <div className="gv-header__inner">
        <a className="gv-header__brand" href={ROUTES.store} onClick={go(ROUTES.store)}>
          GameVault
        </a>
        <nav className="gv-header__nav" aria-label="Navegação principal">
          {auth.isAuthenticated ? (
            <>
              <span className="gv-header__user">{auth.user?.name}</span>
              <button
                type="button"
                className="gv-header__logout"
                onClick={() => handleLogout(auth, navigate)}
              >
                Sair
              </button>
            </>
          ) : (
            <>
              <a className="gv-header__link" href={ROUTES.login} onClick={go(ROUTES.login)}>
                Entrar
              </a>
              <a
                className="gv-header__link gv-header__link--strong"
                href={ROUTES.register}
                onClick={go(ROUTES.register)}
              >
                Criar conta
              </a>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
