import {
  INITIAL_REGISTER_STATE,
  applySubmitError,
  shouldSubmitRegister,
  validateRegister,
  type RegisterFormState,
  type RegisterValues,
} from './registerForm';

const REGISTER_SUCCESS_MESSAGE = 'Conta criada com sucesso!';

/** Única função de envio usada pela página; injetada nos testes para exercitar o mesmo caminho. */
export type RegisterFn = (values: RegisterValues) => Promise<unknown>;

export interface RegisterControllerDeps {
  register: RegisterFn;
  /** Espelho do setState do componente: recebe um updater do estado do formulário. */
  dispatch: (update: (current: RegisterFormState) => RegisterFormState) => void;
}

export interface RegisterController {
  submit(values: RegisterValues): void;
  /** CA10: descarta o rascunho em memória — chamado pelo cleanup de efeito da página. */
  discard(): void;
}

/**
 * Controlador do formulário de cadastro. Toda decisão de submissão (guard,
 * carregamento, 409, queda de rede, sucesso) vive aqui — o componente apenas
 * repassa os valores e renderiza o estado devolvido.
 */
export function createRegisterController(deps: RegisterControllerDeps): RegisterController {
  return {
    submit(values) {
      // CA5: o guard impede qualquer chamada à API com dados inválidos.
      if (!shouldSubmitRegister(values)) {
        deps.dispatch((current) => ({
          ...current,
          values,
          errors: validateRegister(values),
          errorMessage: '',
          successMessage: '',
          loading: false,
        }));
        return;
      }

      deps.dispatch((current) => ({
        ...current,
        values,
        errors: {},
        errorMessage: '',
        successMessage: '',
        loading: true,
      }));

      deps.register(values).then(
        () => deps.dispatch(() => ({
          ...INITIAL_REGISTER_STATE,
          successMessage: REGISTER_SUCCESS_MESSAGE,
        })),
        (error: unknown) => deps.dispatch((current) => applySubmitError(current, error)),
      );
    },

    discard() {
      deps.dispatch(() => INITIAL_REGISTER_STATE);
    },
  };
}
