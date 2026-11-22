import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { register } from '../services/authService';
import {
  INITIAL_REGISTER_STATE,
  type RegisterFormState,
  type RegisterValues,
} from './registerForm';
import { createRegisterController } from './registerController';
import './RegisterPage.css';

export default function RegisterPage() {
  const [form, setForm] = useState<RegisterFormState>(INITIAL_REGISTER_STATE);
  const controller = useMemo(() => createRegisterController({ register, dispatch: setForm }), []);

  // CA10: dados do rascunho existem só em memória e são descartados ao desmontar.
  useEffect(() => () => controller.discard(), [controller]);

  const updateField = (field: keyof RegisterValues, value: string) => {
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
    <div className="register-page">
      <h1>Criar conta</h1>
      {form.successMessage && (
        <div className="success-message" role="alert">
          {form.successMessage}
        </div>
      )}
      {form.errorMessage && (
        <div className="error-message" role="alert">
          {form.errorMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        <div className="form-group">
          <label htmlFor="name">Nome</label>
          <input
            id="name"
            type="text"
            value={form.values.name}
            onChange={(event) => updateField('name', event.target.value)}
            aria-invalid={!!form.errors.name}
          />
          {form.errors.name && (
            <span className="field-error" role="alert">
              {form.errors.name}
            </span>
          )}
        </div>

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
          {form.loading ? 'Cadastrando...' : 'Cadastrar'}
        </button>
      </form>
    </div>
  );
}
