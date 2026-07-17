import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { errorMessage } from '../api/client';
import { authApi } from '../api/services';
import { ErrorMessage } from '../components/ErrorMessage';
import { useAuth } from '../context/AuthContext';
import { t } from '../i18n';
import type { Role } from '../types';

export function Register() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [role, setRole] = useState<Role>('customer');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const auth = await authApi.register({
        name,
        email,
        password,
        role,
        phone: phone || undefined,
        address: address || undefined,
      });
      signIn(auth);
      navigate(auth.user.role === 'seller' ? '/seller' : '/', { replace: true });
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card form auth-card">
      <h1 className="page-title">{t.register.title}</h1>
      <ErrorMessage message={error} />
      <form className="form" onSubmit={onSubmit}>
        <div className="field">
          <label htmlFor="name">{t.register.name}</label>
          <input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            minLength={2}
            autoComplete="name"
          />
        </div>
        <div className="field">
          <label htmlFor="email">{t.register.email}</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
        </div>
        <div className="field">
          <label htmlFor="password">{t.register.password}</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            autoComplete="new-password"
          />
        </div>
        <div className="field">
          <label htmlFor="phone">{t.register.phone}</label>
          <input
            id="phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="05xx xxx xx xx"
            autoComplete="tel"
          />
        </div>
        <div className="field">
          <label htmlFor="address">{t.register.address}</label>
          <textarea
            id="address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            rows={2}
            autoComplete="street-address"
          />
        </div>
        <div className="field">
          <label htmlFor="role">{t.register.accountType}</label>
          <select id="role" value={role} onChange={(e) => setRole(e.target.value as Role)}>
            <option value="customer">{t.register.customerOption}</option>
            <option value="seller">{t.register.sellerOption}</option>
          </select>
        </div>
        <button className="btn btn-primary" disabled={loading}>
          {loading ? t.register.submitting : t.register.submit}
        </button>
      </form>
      <p className="muted">
        {t.register.haveAccount} <Link to="/login">{t.register.loginLink}</Link>
      </p>
    </div>
  );
}
