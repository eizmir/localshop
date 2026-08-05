import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { errorMessage } from '../api/client';
import { addressesApi } from '../api/services';
import { ErrorMessage } from '../components/ErrorMessage';
import { Spinner } from '../components/Spinner';
import { useToast } from '../context/ToastContext';
import { t } from '../i18n';
import type { Address } from '../types';

export function Settings() {
  const toast = useToast();
  const [addresses, setAddresses] = useState<Address[] | null>(null);
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    addressesApi
      .list()
      .then(setAddresses)
      .catch((err) => setError(errorMessage(err)));
  }, []);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      const created = await addressesApi.create({ title, text });
      setAddresses((current) => [...(current ?? []), created]);
      setTitle('');
      setText('');
      toast.show(t.settings.added);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  async function remove(id: string) {
    setError('');
    setBusy(true);
    try {
      setAddresses(await addressesApi.remove(id));
      toast.show(t.settings.removed);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  if (!addresses && !error) return <Spinner />;

  return (
    <>
      <h1 className="page-title">{t.settings.title}</h1>
      <ErrorMessage message={error} />

      <div className="card form-card">
        <h2>{t.settings.addressesTitle}</h2>
        {!addresses || addresses.length === 0 ? (
          <p className="muted">{t.settings.empty}</p>
        ) : (
          <ul className="address-list">
            {addresses.map((address) => (
              <li key={address.id} className="address-row">
                <div>
                  <strong>{address.title}</strong>
                  <p className="muted">{address.text}</p>
                </div>
                <button
                  className="btn btn-ghost btn-sm text-danger"
                  disabled={busy}
                  onClick={() => void remove(address.id)}
                >
                  {t.settings.remove}
                </button>
              </li>
            ))}
          </ul>
        )}

        <h2 className="heading-tight">{t.settings.addTitle}</h2>
        <form className="form" onSubmit={onSubmit}>
          <div className="field">
            <label htmlFor="addressTitle">{t.settings.addressTitle}</label>
            <input
              id="addressTitle"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              minLength={2}
              maxLength={60}
              placeholder={t.settings.addressTitlePlaceholder}
            />
          </div>
          <div className="field">
            <label htmlFor="addressText">{t.settings.addressText}</label>
            <textarea
              id="addressText"
              value={text}
              onChange={(e) => setText(e.target.value)}
              required
              minLength={5}
              maxLength={300}
              rows={3}
            />
          </div>
          <button className="btn btn-primary" disabled={busy}>
            {busy ? t.settings.adding : t.settings.add}
          </button>
        </form>
      </div>
    </>
  );
}
