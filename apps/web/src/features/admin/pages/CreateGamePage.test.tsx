import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import CreateGamePage from './CreateGamePage';

describe('CreateGamePage', () => {
  it('should render form fields (CA1, CA3)', () => {
    const html = renderToString(<CreateGamePage />);
    expect(html).toContain('Cadastrar Novo Jogo');
    expect(html).toContain('Título');
    expect(html).toContain('Descrição');
    expect(html).toContain('Preço');
    expect(html).toContain('Estoque');
    expect(html).toContain('URL da Imagem');
  });
});
