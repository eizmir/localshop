import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { assetUrl, errorMessage } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { t } from '../i18n';
import type { Product } from '../types';

export function ProductCard({ product }: { product: Product }) {
  const { user } = useAuth();
  const { quantityOf, addItem, setQuantity } = useCart();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const isSeller = user?.role === 'seller';
  const outOfStock = product.stock === 0;
  const quantity = quantityOf(product.id);

  async function run(action: () => Promise<void>) {
    setError('');
    setBusy(true);
    try {
      await action();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  function addToCart() {
    if (!user) {
      navigate('/login', { state: { from: { pathname: location.pathname } } });
      return;
    }
    void run(async () => {
      await addItem(product.id, 1);
      toast.show(t.product.added);
    });
  }

  return (
    <div className="product-card">
      <Link to={`/products/${product.id}`} className="product-card-link">
        <div className="product-image">
          {product.imageUrl ? (
            <img src={assetUrl(product.imageUrl)} alt={product.name} loading="lazy" />
          ) : (
            <span className="product-image-placeholder">🛍</span>
          )}
        </div>
        <div className="product-card-body">
          <span className="badge">{t.categories[product.category]}</span>
          <h3>{product.name}</h3>
          <p className="muted clamp">{product.description}</p>
        </div>
      </Link>
      <div className="product-card-footer">
        <strong>{product.price.toLocaleString('tr-TR')} ₺</strong>
        {isSeller ? (
          <span className="muted">{t.product.stock(product.stock)}</span>
        ) : outOfStock ? (
          <span className="text-danger">{t.product.outOfStock}</span>
        ) : quantity > 0 ? (
          <div className="qty-stepper">
            <button
              className="btn btn-sm qty-step"
              onClick={() => void run(() => setQuantity(product.id, quantity - 1))}
              disabled={busy}
              aria-label={t.product.decrease}
            >
              −
            </button>
            <span className="qty-value" aria-live="polite">
              {quantity}
            </span>
            <button
              className="btn btn-sm qty-step"
              onClick={() => void run(() => setQuantity(product.id, quantity + 1))}
              disabled={busy || quantity >= product.stock}
              aria-label={t.product.increase}
            >
              +
            </button>
          </div>
        ) : (
          <button className="btn btn-primary btn-sm" onClick={addToCart} disabled={busy}>
            {busy ? t.product.adding : t.product.addToCart}
          </button>
        )}
      </div>
      {error && <p className="field-error">{error}</p>}
    </div>
  );
}
