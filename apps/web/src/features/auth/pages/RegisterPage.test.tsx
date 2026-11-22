import { afterEach, describe, expect, it, vi } from 'vitest';
import { renderToString } from 'react-dom/server';
import { CONNECTION_ERROR_MESSAGE } from '../../../shared/services/http';
import {
  EMAIL_IN_USE_MESSAGE,
  EmailAlreadyInUseError,
  type User,
} from '../services/authService';
import {
  EMPTY_REGISTER_VALUES,
  INITIAL_REGISTER_STATE,
  type RegisterFormState,
  type RegisterValues,
} from './registerForm';
import { createRegisterController, type RegisterFn } from './registerController';
import RegisterPage from './RegisterPage';

const validValues: RegisterValues = {
  name: 'Ana',
  email: 'ana@example.com',
  password: 'senha123',
};

const createdUser: User = {
  id: '1',
  name: 'Ana',
  email: 'ana@example.com',
  role: 'USER',
  createdAt: '2026-01-01T00:00:00.000Z',
};

/**
 * Reproduz o setState do React: guarda o estado atual e aplica cada updater
 * despachado pelo controlador. Assim os testes exercitam exatamente o código
 * que a página chama no submit e no cleanup, não helpers isolados.
 */
function makeHarness(values: RegisterValues) {
  let state: RegisterFormState = { ...INITIAL_REGISTER_STATE, values };
  const register = vi.fn<RegisterFn>().mockResolvedValue(createdUser);
  const dispatch = vi.fn<(update: (current: RegisterFormState) => RegisterFormState) => void>(
    (update) => {
      state = update(state);
    },
  );
  const controller = createRegisterController({ register, dispatch });
  return { controller, register, dispatch, getState: () => state };
}

describe('RegisterPage — controlador usado pela página (CA1, CA2, CA5, CA9)', () => {
  it('CA5: bloqueia submissão inválida sem chamar register e marca os campos', () => {
    const invalid = { name: '   ', email: 'ana@invalido', password: '12345' };
    const { controller, register, getState } = makeHarness(invalid);

    controller.submit(invalid);

    expect(register).not.toHaveBeenCalled();
    expect(getState().errors).toEqual({
      name: 'Nome é obrigatório.',
      email: 'E-mail inválido.',
      password: 'Senha deve ter pelo menos 6 caracteres.',
    });
    expect(getState().loading).toBe(false);
  });

  it('CA5: bloqueia submissão com campos vazios', () => {
    const empty = { name: '', email: '', password: '' };
    const { controller, register, getState } = makeHarness(empty);

    controller.submit(empty);

    expect(register).not.toHaveBeenCalled();
    expect(getState().errors).toEqual({
      name: 'Nome é obrigatório.',
      email: 'E-mail é obrigatório.',
      password: 'Senha é obrigatória.',
    });
    expect(getState().loading).toBe(false);
  });

  it('CA1: envia dados válidos, limpa o formulário e mostra sucesso', async () => {
    const { controller, register, getState } = makeHarness(validValues);
    register.mockResolvedValueOnce(createdUser);

    controller.submit(validValues);

    expect(register).toHaveBeenCalledWith(validValues);
    expect(getState().loading).toBe(true);

    await vi.waitFor(() => expect(getState().successMessage).toBe('Conta criada com sucesso!'));
    expect(getState().values).toEqual(EMPTY_REGISTER_VALUES);
    expect(getState().loading).toBe(false);
    expect(getState().errorMessage).toBe('');
  });

  it('CA2: conflito 409 gera o banner de e-mail em uso e preserva os dados', async () => {
    const { controller, register, getState } = makeHarness(validValues);
    register.mockRejectedValueOnce(new EmailAlreadyInUseError());

    controller.submit(validValues);

    await vi.waitFor(() => expect(getState().loading).toBe(false));
    expect(getState().errorMessage).toBe(EMAIL_IN_USE_MESSAGE);
    expect(getState().successMessage).toBe('');
    expect(getState().values).toEqual(validValues);
  });

  it('CA9: falha de conexão avisa, preserva os dados e reabilita o botão', async () => {
    const { controller, register, getState } = makeHarness(validValues);
    register.mockRejectedValueOnce(new Error(CONNECTION_ERROR_MESSAGE));

    controller.submit(validValues);

    await vi.waitFor(() => expect(getState().loading).toBe(false));
    expect(getState().errorMessage).toBe(CONNECTION_ERROR_MESSAGE);
    expect(getState().successMessage).toBe('');
    expect(getState().values).toEqual(validValues);
    expect(register).toHaveBeenCalledTimes(1);
  });

  it('CA10: descarte ao desmontar volta ao estado inicial sem gravar no storage', () => {
    const storage = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
    };
    vi.stubGlobal('localStorage', storage);
    const { controller, getState } = makeHarness(validValues);

    controller.discard();

    expect(getState()).toEqual(INITIAL_REGISTER_STATE);
    expect(storage.setItem).not.toHaveBeenCalled();
    expect(storage.getItem).not.toHaveBeenCalled();
  });
});

describe('RegisterPage — estrutura renderizável (limites do renderToString)', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('renderiza os campos e o botão sem estado de erro', () => {
    const html = renderToString(<RegisterPage />);

    expect(html).toContain('Criar conta');
    expect(html).toContain('Nome');
    expect(html).toContain('E-mail');
    expect(html).toContain('Senha');
    expect(html).toContain('type="password"');
    // Verificações parciais: não fixam contagem de campos nem rótulo do botão.
    expect(html).toMatch(/aria-invalid="false"/);
    expect(html).not.toMatch(/aria-invalid="true"/);
    expect(html).not.toContain(EMAIL_IN_USE_MESSAGE);
    expect(html).toContain('Cadastrar</button>');
  });

  it('não lê nem grava no storage apenas ao renderizar', () => {
    const storage = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
    };
    vi.stubGlobal('localStorage', storage);

    renderToString(<RegisterPage />);

    expect(storage.getItem).not.toHaveBeenCalled();
    expect(storage.setItem).not.toHaveBeenCalled();
  });
});
