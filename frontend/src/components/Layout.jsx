import { NavLink, Link } from 'react-router-dom';

/**
 * Shell of the application: a fixed sidebar with exactly two entries
 * (Shop and Billing) on one solid colour and the white content area on the
 * right. The cart badge shows how many products are already in the list.
 */
export default function Layout({ children, cartCount = 0 }) {
  return (
    <div className="dash-shell">
      <aside className="dash-sidebar">
        <Link to="/" className="dash-brand">SMART SHOP</Link>
        <nav className="dash-nav">
          <NavLink to="/" end>Shop</NavLink>
          <NavLink to="/billing">
            <span>Billing</span>
            {cartCount > 0 && <span className="dash-badge">{cartCount}</span>}
          </NavLink>
        </nav>
      </aside>
      <div className="dash-main">
        <header className="dash-topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span>Shop Billing System</span>
            <Link to="/status" style={{ fontSize: '0.85rem', color: '#2563eb', textDecoration: 'none', fontWeight: 500 }}>
              Check Connection
            </Link>
          </div>
          <div>{new Date().toLocaleString()}</div>
        </header>
        <main className="dash-content">{children}</main>
      </div>
    </div>
  );
}
