import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { errorMessage } from '../api/client';
import { ordersApi, productsApi } from '../api/services';
import { ErrorMessage } from '../components/ErrorMessage';
import { Spinner } from '../components/Spinner';
import { t } from '../i18n';
import type { Product, SellerOrder } from '../types';
import { StatusPill } from './Orders';

export function SellerDashboard() {
  const [products, setProducts] = useState<Product[] | null>(null);
  const [orders, setOrders] = useState<SellerOrder[] | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    Promise.all([productsApi.mine(), ordersApi.listForSeller()])
      .then(([p, o]) => {
        setProducts(p);
        setOrders(o);
      })
      .catch((err) => setError(errorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  async function removeProduct(id: string, name: string) {
    if (!window.confirm(t.seller.confirmDelete(name))) return;
    setError('');
    setBusy(true);
    try {
      await productsApi.remove(id);
      setProducts((prev) => prev?.filter((p) => p.id !== id) ?? null);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  async function updateStock(product: Product, stock: number) {
    setError('');
    setBusy(true);
    try {
      const updated = await productsApi.update(product.id, { stock });
      setProducts((prev) => prev?.map((p) => (p.id === updated.id ? updated : p)) ?? null);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  if (loading) return <Spinner />;

  return (
    <>
      <div className="row spread">
        <h1 className="page-title">{t.seller.title}</h1>
        <Link to="/seller/products/new" className="btn btn-primary">
          {t.seller.addProduct}
        </Link>
      </div>
      <ErrorMessage message={error} />

      <h2>{t.seller.myProducts}</h2>
      {!products || products.length === 0 ? (
        <p className="muted">{t.seller.noProducts}</p>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>{t.seller.colProduct}</th>
              <th>{t.seller.colCategory}</th>
              <th>{t.seller.colPrice}</th>
              <th>{t.seller.colStock}</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id}>
                <td>
                  <Link to={`/products/${p.id}`}>{p.name}</Link>
                </td>
                <td>
                  <span className="badge">{t.categories[p.category]}</span>
                </td>
                <td>{p.price.toLocaleString('tr-TR')} ₺</td>
                <td>
                  <input
                    type="number"
                    className="qty-input"
                    min={0}
                    defaultValue={p.stock}
                    disabled={busy}
                    onBlur={(e) => {
                      const s = Number(e.target.value);
                      if (s >= 0 && s !== p.stock) void updateStock(p, s);
                    }}
                    aria-label={t.seller.stockOf(p.name)}
                  />
                </td>
                <td>
                  <button
                    className="btn btn-ghost btn-sm text-danger"
                    disabled={busy}
                    onClick={() => void removeProduct(p.id, p.name)}
                  >
                    {t.seller.delete}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <h2 className="mt-2">{t.seller.incomingOrders}</h2>
      {!orders || orders.length === 0 ? (
        <p className="muted">{t.seller.noOrders}</p>
      ) : (
        <div className="stack">
          {orders.map((order) => (
            <div key={order.id} className="card">
              <div className="row spread">
                <span className="muted">
                  {new Date(order.createdAt).toLocaleString('tr-TR')}
                </span>
                <StatusPill status={order.status} />
              </div>
              <ul>
                {order.items.map((item) => (
                  <li key={item.productId}>
                    {item.name} × {item.quantity} —{' '}
                    {item.lineTotal.toLocaleString('tr-TR')} ₺
                  </li>
                ))}
              </ul>
              <strong>{t.seller.sellerShare(order.sellerTotal.toLocaleString('tr-TR'))}</strong>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
