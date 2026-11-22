import './StorePage.css';

/**
 * Placeholder mínimo da vitrine: a spec pede que o login redirecione para a
 * loja, mas o catálogo ainda não tem história implementada nesta fatia.
 */
export default function StorePage() {
  return (
    <section className="store-page">
      <h1>Vitrine da loja</h1>
      <p>Bem-vindo à GameVault. O catálogo de jogos estará disponível em breve.</p>
    </section>
  );
}
