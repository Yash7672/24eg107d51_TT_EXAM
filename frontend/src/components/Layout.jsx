import { Link } from 'react-router-dom';

export default function Layout({ children }) {
  return (
    <div className="dash-shell">
      <aside className="dash-sidebar">
        <div className="dash-brand">SMART BILLING SYSTEM</div>
        <nav className="dash-nav">
          <Link to="/">Billing Dashboard</Link>
          <Link to="/status">Status</Link>
        </nav>
      </aside>
      <div className="dash-main">
        <header className="dash-topbar">
          <div>Billing Dashboard</div>
          <div>{new Date().toLocaleString()}</div>
        </header>
        <main className="dash-content">{children}</main>
      </div>
    </div>
  );
}
