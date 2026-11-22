import { EmailAlreadyInUseError } from '../services/authService';

export interface RegisterValues {
  name: string;
  email: string;
  password: string;
}

export interface RegisterFormState {
  values: RegisterValues;
  errors: Record<string, string>;
  errorMessage: string;
  successMessage: string;
  loading: boolean;
}

export const EMPTY_REGISTER_VALUES: RegisterValues = { name: '', email: '', password: '' };

export const INITIAL_REGISTER_STATE: RegisterFormState = {
  values: EMPTY_REGISTER_VALUES,
  errors: {},
  errorMessage: '',
  successMessage: '',
  loading: false,
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const GENERIC_ERROR_MESSAGE = 'Erro ao cadastrar usuário.';

export function validateRegister(values: RegisterValues): Record<string, string> {
  const errors: Record<string, string> = {};
  if (!values.name.trim()) {
    errors.name = 'Nome é obrigatório.';
  }
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

export function shouldSubmitRegister(values: RegisterValues): boolean {
  return Object.keys(validateRegister(values)).length === 0;
}

/** 409 tem mensagem própria; qualquer outro Error (inclusive o de conexão do http.ts) passa direto. */
export function translateRegisterError(error: unknown): string {
  if (error instanceof EmailAlreadyInUseError) {
    return error.message;
  }
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return GENERIC_ERROR_MESSAGE;
}

/** CA9: a transição de erro nunca apaga values — o usuário tenta de novo sem redigitar. */
export function applySubmitError(state: RegisterFormState, error: unknown): RegisterFormState {
  return {
    ...state,
    values: state.values,
    successMessage: '',
    errorMessage: translateRegisterError(error),
    loading: false,
  };
}
