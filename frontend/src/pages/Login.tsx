import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { errorMessage } from '../api/client';
import { authApi } from '../api/services';
import { ErrorMessage } from '../components/ErrorMessage';
import { useAuth } from '../context/AuthContext';
import { t } from '../i18n';

export function Login() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const auth = await authApi.login({ email, password });
      signIn(auth);
      const from = (location.state as { from?: { pathname: string } })?.from?.pathname;
      navigate(from ?? (auth.user.role === 'seller' ? '/seller' : '/'), { replace: true });
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card form auth-card">
      <h1 className="page-title">{t.login.title}</h1>
      <ErrorMessage message={error} />
      <form className="form" onSubmit={onSubmit}>
        <div className="field">
          <label htmlFor="email">{t.login.email}</label>
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
          <label htmlFor="password">{t.login.password}</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
        </div>
        <button className="btn btn-primary" disabled={loading}>
          {loading ? t.login.submitting : t.login.submit}
        </button>
      </form>
      <p className="muted">
        {t.login.noAccount} <Link to="/register">{t.login.registerLink}</Link>
      </p>
    </div>
  );
}
