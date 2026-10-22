import { Link } from 'react-router-dom';

/**
 * Shown for every route that does not exist.
 */
export default function NotFound() {
  return (
    <section className="card">
      <h1>404 - Page not found</h1>
      <p className="muted">The page you are looking for does not exist.</p>
      <Link to="/" className="btn btn-primary">
        Back to home
      </Link>
    </section>
  );
}
