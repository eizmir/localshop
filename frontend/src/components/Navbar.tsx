import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { t } from '../i18n';

export function Navbar() {
  const { user, signOut } = useAuth();
  const { count } = useCart();
  const navigate = useNavigate();

  return (
    <header className="navbar">
      <Link to="/" className="brand">
        {t.appName}
      </Link>
      <nav>
        <NavLink to="/">{t.nav.products}</NavLink>
        {user?.role === 'customer' && (
          <>
            <NavLink to="/cart">
              {t.nav.cart}
              {count > 0 && <span className="cart-badge">{count}</span>}
            </NavLink>
            <NavLink to="/orders">{t.nav.myOrders}</NavLink>
          </>
        )}
        {user?.role === 'seller' && <NavLink to="/seller">{t.nav.sellerPanel}</NavLink>}
        {user && (
          <NavLink to="/settings" className="nav-icon" title={t.nav.settings} aria-label={t.nav.settings}>
            ⚙
          </NavLink>
        )}
        {user ? (
          <button
            className="btn btn-ghost"
            onClick={() => {
              signOut();
              navigate('/');
            }}
          >
            {t.nav.logout(user.name)}
          </button>
        ) : (
          <>
            <NavLink to="/login">{t.nav.login}</NavLink>
            <NavLink to="/register" className="btn btn-primary btn-sm">
              {t.nav.register}
            </NavLink>
          </>
        )}
      </nav>
    </header>
  );
}
