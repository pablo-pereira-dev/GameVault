import {
  lazy,
  Suspense,
  useEffect,
  useRef,
  useState,
  type ComponentType,
} from 'react';
import { useAuth } from './features/auth/context/useAuth';
import type { Role } from './features/auth/services/authService';
import { ROUTES } from './shared/constants/routes';
import Header from './shared/components/Header';
import './router.css';

// Code splitting por rota (architecture §2): as páginas entram em chunks próprios.
const CreateGamePage = lazy(() => import('./features/admin/pages/CreateGamePage'));
const LoginPage = lazy(() => import('./features/auth/pages/LoginPage'));
const RegisterPage = lazy(() => import('./features/auth/pages/RegisterPage'));
const StorePage = lazy(() => import('./features/store/pages/StorePage'));

export { ROUTES };

/** Injeção de páginas eager permite testar a casca sem resolver import() dinâmico. */
export interface RouterPages {
  store: ComponentType;
  login: ComponentType<{ navigate: (path: string) => void }>;
  register: ComponentType;
  admin: ComponentType;
}

const lazyPages: RouterPages = {
  store: StorePage,
  login: LoginPage,
  register: RegisterPage,
  admin: CreateGamePage,
};

export type NavigateFn = (path: string, options?: { replace?: boolean }) => void;

/** Roteamento à mão: History API, sem recarregar a página e sem dependências novas. */
export function navigate(path: string, options: { replace?: boolean } = {}): void {
  if (typeof window === 'undefined') {
    return;
  }
  if (options.replace) {
    window.history.replaceState(null, '', path);
  } else {
    window.history.pushState(null, '', path);
  }
  if (typeof PopStateEvent !== 'undefined') {
    window.dispatchEvent(new PopStateEvent('popstate'));
  }
}

export type View = 'store' | 'login' | 'register' | 'admin' | 'forbidden';

export interface RouteDecision {
  view: View;
  /** Quando preenchido, o browser deve trocar a URL (replaceState) para este caminho. */
  redirect: string | null;
}

export interface SessionForRouting {
  isAuthenticated: boolean;
  role: Role | null;
}

/** Decisão pura de rota — testável sem DOM (CA3, CA6, CA8). */
export function resolveRoute(
  path: string,
  session: SessionForRouting,
  sessionReady = true,
): RouteDecision {
  let decision: RouteDecision;

  switch (path) {
    case ROUTES.login:
      decision = { view: 'login', redirect: null };
      break;
    case ROUTES.register:
      decision = { view: 'register', redirect: null };
      break;
    case ROUTES.adminGames:
      if (!session.isAuthenticated) {
        decision = { view: 'login', redirect: ROUTES.login };
        break;
      }
      if (session.role !== 'ADMIN') {
        decision = { view: 'forbidden', redirect: null };
        break;
      }
      decision = { view: 'admin', redirect: null };
      break;
    default:
      // Vitrine é a rota pública de entrada; caminhos desconhecidos são normalizados.
      decision = {
        view: 'store',
        redirect: path === ROUTES.store ? null : ROUTES.store,
      };
  }

  // Antes da hidratação a URL de origem é preservada: o redirect só é emitido
  // depois que restoreSession termina, com a sessão já resolvida (CA8).
  return sessionReady ? decision : { view: decision.view, redirect: null };
}

function ForbiddenPage() {
  return (
    <section className="gv-forbidden">
      <h1>Acesso negado</h1>
      <p>Você não tem permissão para acessar esta área (403 Forbidden).</p>
    </section>
  );
}

export default function AppRouter({ pages = lazyPages }: { pages?: RouterPages }) {
  const { isAuthenticated, user, restoreSession } = useAuth();
  const [path, setPath] = useState<string>(() =>
    typeof window === 'undefined' ? ROUTES.store : window.location.pathname,
  );
  const [sessionReady, setSessionReady] = useState(false);
  const restoreStarted = useRef(false);

  useEffect(() => {
    const onPopState = () => setPath(window.location.pathname);
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  // CA8: valida a sessão na carga. O ref evita chamadas repetidas (StrictMode e
  // mudanças de identidade das ações do Provider); a marca de prontidão só é
  // levantada quando a restauração termina, sucesso ou falha.
  useEffect(() => {
    if (restoreStarted.current) {
      return;
    }
    restoreStarted.current = true;
    const finishRestore = () => setSessionReady(true);
    void restoreSession().then(finishRestore, finishRestore);
  }, [restoreSession]);

  const decision = resolveRoute(
    path,
    { isAuthenticated, role: user?.role ?? null },
    sessionReady,
  );

  useEffect(() => {
    if (decision.redirect && decision.redirect !== path) {
      navigate(decision.redirect, { replace: true });
    }
  }, [decision.redirect, path]);

  const { store: Store, login: Login, register: Register, admin: Admin } = pages;

  return (
    <div className="gv-app">
      <Header navigate={navigate} />
      <main className="gv-app__content">
        <Suspense fallback={<p className="gv-app__loading" role="status">Carregando...</p>}>
          {decision.view === 'login' && <Login navigate={navigate} />}
          {decision.view === 'register' && <Register />}
          {decision.view === 'store' && <Store />}
          {decision.view === 'admin' && <Admin />}
          {decision.view === 'forbidden' && <ForbiddenPage />}
        </Suspense>
      </main>
    </div>
  );
}
