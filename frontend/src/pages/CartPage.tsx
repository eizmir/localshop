import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { errorMessage } from '../api/client';
import { cartApi, ordersApi } from '../api/services';
import { ErrorMessage } from '../components/ErrorMessage';
import { Spinner } from '../components/Spinner';
import { useCart } from '../context/CartContext';
import { t } from '../i18n';
import type { Cart } from '../types';

export function CartPage() {
  const navigate = useNavigate();
  const { refresh } = useCart();
  const [cart, setCart] = useState<Cart | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    cartApi
      .get()
      .then(setCart)
      .catch((err) => setError(errorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  async function mutate(action: () => Promise<Cart>) {
    setError('');
    setBusy(true);
    try {
      setCart(await action());
      await refresh();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  async function checkout() {
    setError('');
    setBusy(true);
    try {
      const order = await ordersApi.create();
      await refresh();
      navigate(`/payment/${order.id}`);
    } catch (err) {
      setError(errorMessage(err));
      setBusy(false);
    }
  }

  if (loading) return <Spinner />;

  return (
    <>
      <h1 className="page-title">{t.cart.title}</h1>
      <ErrorMessage message={error} />
      {!cart || cart.items.length === 0 ? (
        <p className="muted">
          {t.cart.empty} <Link to="/">{t.cart.browse}</Link>
        </p>
      ) : (
        <>
          <table className="table">
            <thead>
              <tr>
                <th>{t.cart.colProduct}</th>
                <th>{t.cart.colPrice}</th>
                <th>{t.cart.colQuantity}</th>
                <th>{t.cart.colTotal}</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {cart.items.map((item) => (
                <tr key={item.productId}>
                  <td>
                    <Link to={`/products/${item.productId}`}>{item.name}</Link>
                  </td>
                  <td>{item.price.toLocaleString('tr-TR')} ₺</td>
                  <td>
                    <input
                      type="number"
                      className="qty-input"
                      min={1}
                      max={item.stock}
                      value={item.quantity}
                      disabled={busy}
                      onChange={(e) => {
                        const q = Number(e.target.value);
                        if (q >= 1) void mutate(() => cartApi.updateItem(item.productId, q));
                      }}
                      aria-label={t.cart.quantityOf(item.name)}
                    />
                  </td>
                  <td>{item.lineTotal.toLocaleString('tr-TR')} ₺</td>
                  <td>
                    <button
                      className="btn btn-ghost btn-sm text-danger"
                      disabled={busy}
                      onClick={() => void mutate(() => cartApi.removeItem(item.productId))}
                    >
                      {t.cart.remove}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="row spread mt-1">
            <strong className="total-lg">
              {t.cart.total(cart.totalPrice.toLocaleString('tr-TR'))}
            </strong>
            <button className="btn btn-primary" onClick={checkout} disabled={busy}>
              {busy ? t.cart.processing : t.cart.checkout}
            </button>
          </div>
        </>
      )}
    </>
  );
}
