import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { assetUrl, errorMessage } from '../api/client';
import { cartApi, productsApi } from '../api/services';
import { ErrorMessage } from '../components/ErrorMessage';
import { Spinner } from '../components/Spinner';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { t } from '../i18n';
import type { Product } from '../types';

export function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { refresh } = useCart();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState('');
  const [added, setAdded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    if (!id) return;
    productsApi
      .get(id)
      .then(setProduct)
      .catch((err) => setError(errorMessage(err)))
      .finally(() => setLoading(false));
  }, [id]);

  async function addToCart() {
    if (!product) return;
    if (!user) {
      navigate('/login', { state: { from: { pathname: `/products/${product.id}` } } });
      return;
    }
    setError('');
    setAdded(false);
    setAdding(true);
    try {
      await cartApi.addItem(product.id, quantity);
      await refresh();
      setAdded(true);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setAdding(false);
    }
  }

  if (loading) return <Spinner />;
  if (!product) return <ErrorMessage message={error || t.product.notFound} />;

  return (
    <div className="card detail-card">
      {product.imageUrl && (
        <div className="product-detail-image">
          <img src={assetUrl(product.imageUrl)} alt={product.name} />
        </div>
      )}
      <span className="badge">{t.categories[product.category]}</span>
      <h1 className="page-title heading-tight">
        {product.name}
      </h1>
      <p>{product.description}</p>
      <div className="row spread">
        <strong className="price-lg">
          {product.price.toLocaleString('tr-TR')} ₺
        </strong>
        <span className={product.stock > 0 ? 'muted' : 'text-danger'}>
          {product.stock > 0 ? t.product.stock(product.stock) : t.product.outOfStock}
        </span>
      </div>
      <ErrorMessage message={error} />
      {added && (
        <div className="success-box">
          {t.product.added} <Link to="/cart">{t.product.goToCart}</Link>
        </div>
      )}
      {user?.role !== 'seller' && product.stock > 0 && (
        <div className="row mt-1">
          <input
            type="number"
            className="qty-input"
            min={1}
            max={product.stock}
            value={quantity}
            onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
            aria-label={t.product.quantity}
          />
          <button className="btn btn-primary" onClick={addToCart} disabled={adding}>
            {adding ? t.product.adding : t.product.addToCart}
          </button>
        </div>
      )}
    </div>
  );
}
