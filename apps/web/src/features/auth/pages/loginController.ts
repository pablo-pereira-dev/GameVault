import {
  INITIAL_LOGIN_STATE,
  applyLoginError,
  shouldSubmitLogin,
  validateLogin,
  type LoginFormState,
  type LoginValues,
} from './loginForm';

/** Única função de autenticação usada pela página; injetada nos testes. */
export type LoginFn = (values: LoginValues) => Promise<unknown>;

export interface LoginControllerDeps {
  login: LoginFn;
  /** Espelho do setState do componente: recebe um updater do estado do formulário. */
  dispatch: (update: (current: LoginFormState) => LoginFormState) => void;
  /** CA3: único efeito de navegação — levar à vitrine depois de autenticar. */
  navigateToStore: () => void;
}

export interface LoginController {
  submit(values: LoginValues): void;
  /** CA10: descarta o rascunho em memória — chamado pelo cleanup de efeito da página. */
  discard(): void;
}

/**
 * Controlador do formulário de login. Guard (CA5), 401 genérico (CA4), queda de
 * conexão (CA9), sucesso com navegação (CA3) e descarte (CA10) vivem aqui; o
 * componente só repassa valores e renderiza o estado devolvido.
 */
export function createLoginController(deps: LoginControllerDeps): LoginController {
  return {
    submit(values) {
      if (!shouldSubmitLogin(values)) {
        deps.dispatch((current) => ({
          ...current,
          values,
          errors: validateLogin(values),
          errorMessage: '',
          loading: false,
        }));
        return;
      }

      deps.dispatch((current) => ({
        ...current,
        values,
        errors: {},
        errorMessage: '',
        loading: true,
      }));

      deps.login(values).then(
        () => {
          deps.dispatch(() => ({ ...INITIAL_LOGIN_STATE }));
          deps.navigateToStore();
        },
        (error: unknown) => deps.dispatch((current) => applyLoginError(current, error)),
      );
    },

    discard() {
      deps.dispatch(() => INITIAL_LOGIN_STATE);
    },
  };
}
