import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useParams } from 'react-router-dom';
import { errorMessage } from '../api/client';
import { ordersApi, paymentsApi } from '../api/services';
import { ErrorMessage } from '../components/ErrorMessage';
import { Spinner } from '../components/Spinner';
import { useCart } from '../context/CartContext';
import { t } from '../i18n';
import type { Order } from '../types';
import { StatusPill } from './Orders';

export function Payment() {
  const { orderId } = useParams<{ orderId: string }>();
  const { refresh } = useCart();
  const [order, setOrder] = useState<Order | null>(null);
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [error, setError] = useState('');
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);

  useEffect(() => {
    if (!orderId) return;
    ordersApi
      .get(orderId)
      .then(setOrder)
      .catch((err) => setError(errorMessage(err)))
      .finally(() => setLoading(false));
  }, [orderId]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!orderId) return;
    setError('');
    setResult(null);
    setPaying(true);
    try {
      const res = await paymentsApi.pay({ orderId, cardNumber, cardHolder, expiry, cvv });
      setResult({ success: res.success, message: res.message });
      setOrder(res.order);
      if (res.success) await refresh();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setPaying(false);
    }
  }

  if (loading) return <Spinner />;
  if (!order) return <ErrorMessage message={error || t.payment.orderNotFound} />;

  const payable = order.status === 'PENDING_PAYMENT' || order.status === 'PAYMENT_FAILED';

  return (
    <div className="card form-card">
      <div className="row spread">
        <h1 className="page-title">{t.payment.title}</h1>
        <StatusPill status={order.status} />
      </div>
      <p className="muted">
        {t.payment.orderTotal}{' '}
        <strong>{order.totalPrice.toLocaleString('tr-TR')} ₺</strong>
      </p>

      {result && (
        <div className={result.success ? 'success-box' : 'error-box'} role="alert">
          {result.message}
          {result.success && (
            <>
              {' '}
              <Link to="/orders">{t.payment.goToOrders}</Link>
            </>
          )}
        </div>
      )}
      <ErrorMessage message={error} />

      {payable && (
        <form className="form form-wide" onSubmit={onSubmit}>
          <div className="field">
            <label htmlFor="cardNumber">{t.payment.cardNumber}</label>
            <input
              id="cardNumber"
              value={cardNumber}
              onChange={(e) => setCardNumber(e.target.value.replace(/[^\d ]/g, ''))}
              placeholder="4242 4242 4242 4242"
              required
              inputMode="numeric"
              autoComplete="cc-number"
            />
          </div>
          <div className="field">
            <label htmlFor="cardHolder">{t.payment.cardHolder}</label>
            <input
              id="cardHolder"
              value={cardHolder}
              onChange={(e) => setCardHolder(e.target.value)}
              required
              autoComplete="cc-name"
            />
          </div>
          <div className="row">
            <div className="field flex-1">
              <label htmlFor="expiry">{t.payment.expiry}</label>
              <input
                id="expiry"
                value={expiry}
                onChange={(e) => setExpiry(e.target.value)}
                placeholder="12/27"
                required
                maxLength={5}
                autoComplete="cc-exp"
              />
            </div>
            <div className="field flex-1">
              <label htmlFor="cvv">{t.payment.cvv}</label>
              <input
                id="cvv"
                value={cvv}
                onChange={(e) => setCvv(e.target.value.replace(/\D/g, ''))}
                required
                maxLength={4}
                inputMode="numeric"
                autoComplete="cc-csc"
              />
            </div>
          </div>
          <button className="btn btn-primary" disabled={paying}>
            {paying ? t.payment.paying : t.payment.pay(order.totalPrice.toLocaleString('tr-TR'))}
          </button>
          <p className="muted small-note">{t.payment.testCards}</p>
        </form>
      )}
    </div>
  );
}
