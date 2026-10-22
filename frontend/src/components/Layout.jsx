import { Link } from 'react-router-dom';

/**
 * Page shell: header with the application title, the page content and a footer.
 */
export default function Layout({ children }) {
  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="container header-inner">
          <Link to="/" className="brand">
            <img src="/favicon.svg" alt="" width="36" height="36" />
            <span className="brand-text">
              <strong>Lab Exam App</strong>
              <small>B.Tech Full Stack Development - Lab Examination</small>
            </span>
          </Link>
          <nav className="app-nav">
            <Link to="/">Home</Link>
          </nav>
        </div>
      </header>

      <main className="container app-main">{children}</main>

      <footer className="app-footer">
        <div className="container">
          React + Vite frontend &middot; Spring Boot + MySQL backend
        </div>
      </footer>
    </div>
  );
}
