export interface LoginValues {
  email: string;
  password: string;
}

export interface LoginFormState {
  values: LoginValues;
  errors: Record<string, string>;
  errorMessage: string;
  loading: boolean;
}

export const EMPTY_LOGIN_VALUES: LoginValues = { email: '', password: '' };

export const INITIAL_LOGIN_STATE: LoginFormState = {
  values: EMPTY_LOGIN_VALUES,
  errors: {},
  errorMessage: '',
  loading: false,
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** CA4 — texto genérico idêntico para e-mail desconhecido e senha incorreta. */
export const INVALID_CREDENTIALS_MESSAGE = 'Credenciais inválidas.';

const GENERIC_ERROR_MESSAGE = 'Erro ao entrar.';

export function validateLogin(values: LoginValues): Record<string, string> {
  const errors: Record<string, string> = {};
  if (!values.email.trim()) {
    errors.email = 'E-mail é obrigatório.';
  } else if (!EMAIL_PATTERN.test(values.email.trim())) {
    errors.email = 'E-mail inválido.';
  }
  if (!values.password) {
    errors.password = 'Senha é obrigatória.';
  } else if (values.password.length < 6) {
    errors.password = 'Senha deve ter pelo menos 6 caracteres.';
  }
  return errors;
}

export function shouldSubmitLogin(values: LoginValues): boolean {
  return Object.keys(validateLogin(values)).length === 0;
}

/** authService já devolve o texto genérico do 401; qualquer outro Error passa direto. */
export function translateLoginError(error: unknown): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return GENERIC_ERROR_MESSAGE;
}

/** CA9: a transição de erro nunca apaga values — o visitante tenta de novo sem redigitar. */
export function applyLoginError(state: LoginFormState, error: unknown): LoginFormState {
  return {
    ...state,
    values: state.values,
    errorMessage: translateLoginError(error),
    loading: false,
  };
}
