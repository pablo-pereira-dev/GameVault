import { afterEach, describe, expect, it, vi } from 'vitest';
import { renderToString } from 'react-dom/server';
import { CONNECTION_ERROR_MESSAGE } from '../../../shared/services/http';
import { AuthProvider } from '../context/AuthContext';
import {
  EMPTY_LOGIN_VALUES,
  INITIAL_LOGIN_STATE,
  INVALID_CREDENTIALS_MESSAGE,
  type LoginFormState,
  type LoginValues,
} from './loginForm';
import { createLoginController, type LoginFn } from './loginController';
import LoginPage from './LoginPage';

const validValues: LoginValues = { email: 'ana@example.com', password: 'senha123' };

/**
 * Harness que reproduz o setState do React: guarda o estado e aplica cada updater
 * despachado pelo controlador — exatamente o caminho usado pela página no submit.
 */
function makeHarness(values: LoginValues) {
  let state: LoginFormState = { ...INITIAL_LOGIN_STATE, values };
  const login = vi.fn<LoginFn>().mockResolvedValue(undefined);
  const navigateToStore = vi.fn();
  const dispatch = vi.fn<(update: (current: LoginFormState) => LoginFormState) => void>(
    (update) => {
      state = update(state);
    },
  );
  const controller = createLoginController({ login, dispatch, navigateToStore });
  return { controller, login, navigateToStore, dispatch, getState: () => state };
}

describe('LoginPage — controlador usado pela página (CA3, CA4, CA5, CA9, CA10)', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('CA5: bloqueia submissão com campos vazios sem chamar login nem navegar', () => {
    const empty = { email: '', password: '' };
    const { controller, login, navigateToStore, getState } = makeHarness(empty);

    controller.submit(empty);

    expect(login).not.toHaveBeenCalled();
    expect(navigateToStore).not.toHaveBeenCalled();
    expect(getState().errors).toEqual({
      email: 'E-mail é obrigatório.',
      password: 'Senha é obrigatória.',
    });
    expect(getState().loading).toBe(false);
  });

  it('CA5: bloqueia e-mail malformado e senha curta', () => {
    const invalid = { email: 'ana@invalido', password: '12345' };
    const { controller, login, getState } = makeHarness(invalid);

    controller.submit(invalid);

    expect(login).not.toHaveBeenCalled();
    expect(getState().errors).toEqual({
      email: 'E-mail inválido.',
      password: 'Senha deve ter pelo menos 6 caracteres.',
    });
  });

  it('CA3: credenciais válidas autenticam, limpam o formulário e navegam para a vitrine', async () => {
    const { controller, login, navigateToStore, getState } = makeHarness(validValues);

    controller.submit(validValues);

    expect(login).toHaveBeenCalledWith(validValues);
    expect(getState().loading).toBe(true);

    await vi.waitFor(() => expect(navigateToStore).toHaveBeenCalledOnce());
    expect(getState().values).toEqual(EMPTY_LOGIN_VALUES);
    expect(getState().loading).toBe(false);
    expect(getState().errorMessage).toBe('');
  });

  it('CA4: 401 devolve a mensagem genérica exata, sem navegar e preservando os dados', async () => {
    const { controller, login, navigateToStore, getState } = makeHarness(validValues);
    login.mockRejectedValueOnce(new Error(INVALID_CREDENTIALS_MESSAGE));

    controller.submit(validValues);

    await vi.waitFor(() => expect(getState().loading).toBe(false));
    expect(getState().errorMessage).toBe(INVALID_CREDENTIALS_MESSAGE);
    expect(getState().values).toEqual(validValues);
    expect(navigateToStore).not.toHaveBeenCalled();
  });

  it('CA9: queda de rede avisa, preserva os dados e não navega', async () => {
    const { controller, login, navigateToStore, getState } = makeHarness(validValues);
    login.mockRejectedValueOnce(new Error(CONNECTION_ERROR_MESSAGE));

    controller.submit(validValues);

    await vi.waitFor(() => expect(getState().loading).toBe(false));
    expect(getState().errorMessage).toBe(CONNECTION_ERROR_MESSAGE);
    expect(getState().values).toEqual(validValues);
    expect(navigateToStore).not.toHaveBeenCalled();
    expect(login).toHaveBeenCalledTimes(1);
  });

  it('CA10: descarte ao desmontar volta ao estado inicial sem tocar no storage', () => {
    const storage = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
    };
    vi.stubGlobal('localStorage', storage);
    const { controller, getState } = makeHarness(validValues);

    controller.discard();

    expect(getState()).toEqual(INITIAL_LOGIN_STATE);
    expect(storage.setItem).not.toHaveBeenCalled();
    expect(storage.getItem).not.toHaveBeenCalled();
  });
});

describe('LoginPage — estrutura renderizável (limites do renderToString)', () => {
  it('renderiza e-mail, senha e botão de entrar sem estado de erro', () => {
    const html = renderToString(
      <AuthProvider>
        <LoginPage navigate={vi.fn()} />
      </AuthProvider>,
    );

    expect(html).toContain('Entrar');
    expect(html).toContain('E-mail');
    expect(html).toContain('Senha');
    expect(html).toContain('type="password"');
    expect(html).toMatch(/aria-invalid="false"/);
    expect(html).not.toMatch(/aria-invalid="true"/);
    expect(html).not.toContain(INVALID_CREDENTIALS_MESSAGE);
    expect(html).toContain('Entrar</button>');
  });

  it('não lê nem grava no storage apenas ao renderizar', () => {
    const storage = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
    };
    vi.stubGlobal('localStorage', storage);

    renderToString(
      <AuthProvider>
        <LoginPage navigate={vi.fn()} />
      </AuthProvider>,
    );

    expect(storage.getItem).not.toHaveBeenCalled();
    expect(storage.setItem).not.toHaveBeenCalled();
    vi.unstubAllGlobals();
  });
});
