import { useEffect, useRef, useState, type FormEvent } from 'react';
import { ROUTES } from '../../../shared/constants/routes';
import { useAuth } from '../context/useAuth';
import { INITIAL_LOGIN_STATE, type LoginFormState, type LoginValues } from './loginForm';
import { createLoginController } from './loginController';
import './LoginPage.css';

export default function LoginPage({ navigate }: { navigate: (path: string) => void }) {
  const { login } = useAuth();
  const [form, setForm] = useState<LoginFormState>(INITIAL_LOGIN_STATE);

  // O controlador é recriado com as ações mais recentes; a ref (atualizada só
  // em efeitos) permite descartar o rascunho apenas na desmontagem (CA10).
  const controller = createLoginController({
    login: (values) => login(values.email, values.password),
    dispatch: setForm,
    navigateToStore: () => navigate(ROUTES.store),
  });
  const controllerRef = useRef(controller);

  useEffect(() => {
    controllerRef.current = controller;
  }, [controller]);

  useEffect(() => () => controllerRef.current.discard(), []);

  const updateField = (field: keyof LoginValues, value: string) => {
    setForm((current) => ({
      ...current,
      values: { ...current.values, [field]: value },
    }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    controller.submit(form.values);
  };

  return (
    <div className="login-page">
      <h1>Entrar</h1>
      {form.errorMessage && (
        <div className="error-message" role="alert">
          {form.errorMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        <div className="form-group">
          <label htmlFor="email">E-mail</label>
          <input
            id="email"
            type="email"
            value={form.values.email}
            onChange={(event) => updateField('email', event.target.value)}
            aria-invalid={!!form.errors.email}
          />
          {form.errors.email && (
            <span className="field-error" role="alert">
              {form.errors.email}
            </span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="password">Senha</label>
          <input
            id="password"
            type="password"
            value={form.values.password}
            onChange={(event) => updateField('password', event.target.value)}
            aria-invalid={!!form.errors.password}
          />
          {form.errors.password && (
            <span className="field-error" role="alert">
              {form.errors.password}
            </span>
          )}
        </div>

        <button
          type="submit"
          className={form.loading ? 'loading' : undefined}
          disabled={form.loading}
        >
          {form.loading ? 'Entrando...' : 'Entrar'}
        </button>
      </form>
    </div>
  );
}
