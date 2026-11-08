import { useState } from 'react';
import { createGame } from '../services/gameService';

export default function CreateGamePage() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!title.trim()) newErrors.title = 'Título é obrigatório.';
    if (!description.trim()) newErrors.description = 'Descrição é obrigatória.';
    if (!price || Number(price) <= 0) newErrors.price = 'Preço deve ser maior que zero.';
    if (stock === '' || Number(stock) < 0) newErrors.stock = 'Estoque inválido.';
    if (!imageUrl.trim()) newErrors.imageUrl = 'URL da imagem é obrigatória.';
    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage('');
    setErrorMessage('');

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setErrors({});
    setLoading(true);

    try {
      await createGame({
        title,
        description,
        price: Number(price),
        stock: Number(stock),
        imageUrl,
      });
      setSuccessMessage('Jogo cadastrado com sucesso e disponível na loja!');
      setTitle('');
      setDescription('');
      setPrice('');
      setStock('');
      setImageUrl('');
    } catch (err: any) {
      setErrorMessage(err.message || 'Erro ao cadastrar jogo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-game-page">
      <h1>Cadastrar Novo Jogo</h1>
      {successMessage && <div className="success-message" role="alert">{successMessage}</div>}
      {errorMessage && <div className="error-message" role="alert">{errorMessage}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="title">Título</label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            aria-invalid={!!errors.title}
          />
          {errors.title && <span className="field-error" role="alert">{errors.title}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="description">Descrição</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            aria-invalid={!!errors.description}
          />
          {errors.description && <span className="field-error" role="alert">{errors.description}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="price">Preço (R$)</label>
          <input
            id="price"
            type="number"
            step="0.01"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            aria-invalid={!!errors.price}
          />
          {errors.price && <span className="field-error" role="alert">{errors.price}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="stock">Estoque</label>
          <input
            id="stock"
            type="number"
            value={stock}
            onChange={(e) => setStock(e.target.value)}
            aria-invalid={!!errors.stock}
          />
          {errors.stock && <span className="field-error" role="alert">{errors.stock}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="imageUrl">URL da Imagem</label>
          <input
            id="imageUrl"
            type="text"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            aria-invalid={!!errors.imageUrl}
          />
          {errors.imageUrl && <span className="field-error" role="alert">{errors.imageUrl}</span>}
        </div>

        <button type="submit" disabled={loading}>
          {loading ? 'Cadastrando...' : 'Cadastrar Jogo'}
        </button>
      </form>
    </div>
  );
}
