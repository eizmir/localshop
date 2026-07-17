import { useEffect, useState } from 'react';
import { errorMessage } from '../api/client';
import { ordersApi } from '../api/services';
import { ErrorMessage } from '../components/ErrorMessage';
import { Spinner } from '../components/Spinner';
import { t } from '../i18n';
import type { Order, OrderStatus } from '../types';

export function StatusPill({ status }: { status: OrderStatus }) {
  return <span className={`status-pill status-${status}`}>{t.statuses[status]}</span>;
}

export function Orders() {
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ordersApi
      .listMine()
      .then(setOrders)
      .catch((err) => setError(errorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;

  return (
    <>
      <h1 className="page-title">{t.orders.title}</h1>
      <ErrorMessage message={error} />
      {!orders || orders.length === 0 ? (
        <p className="muted">{t.orders.empty}</p>
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
              <strong>{t.orders.total(order.totalPrice.toLocaleString('tr-TR'))}</strong>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
