import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { API_BASE_URL, healthApi } from '../api/api.js';
import BackendStatus from '../components/BackendStatus.jsx';
import ErrorAlert from '../components/ErrorAlert.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';

/**
 * Welcome page. It shows the title of the application and checks whether the
 * backend is reachable.
 */
export default function Home() {
  const [status, setStatus] = useState('loading');
  const [health, setHealth] = useState(null);
  const [error, setError] = useState('');

  const loadHealth = useCallback(async () => {
    setStatus('loading');
    setError('');
    try {
      const response = await healthApi.check();
      setHealth(response.data);
      setStatus('online');
    } catch (err) {
      setHealth(null);
      setError(err.message);
      setStatus('offline');
    }
  }, []);

  useEffect(() => {
    loadHealth();
  }, [loadHealth]);

  return (
    <>
      <section className="hero">
        <h1>Welcome to the Lab Examination Starter</h1>
        <p>
          This project is the ready-to-use foundation for the Full Stack Development lab
          examination. The React frontend talks to the Spring Boot backend through a REST
          API, and the backend stores its data in MySQL (Aiven).
        </p>
        <BackendStatus status={status} health={health} />
        <p className="hero-links">
          <Link className="btn btn-primary" to="/status">
            Open the connection status dashboard
          </Link>
        </p>
      </section>

      {status === 'loading' ? <LoadingSpinner label="Contacting the backend..." /> : null}

      <ErrorAlert message={error} onRetry={loadHealth} />

      {health ? (
        <section className="card">
          <h2>Backend health</h2>
          <dl className="detail-list">
            <div>
              <dt>Application</dt>
              <dd>{health.application}</dd>
            </div>
            <div>
              <dt>Application status</dt>
              <dd>{health.status}</dd>
            </div>
            <div>
              <dt>Database status</dt>
              <dd>{health.database}</dd>
            </div>
            <div>
              <dt>Message</dt>
              <dd>{health.message}</dd>
            </div>
            <div>
              <dt>Checked at</dt>
              <dd>{health.timestamp ? new Date(health.timestamp).toLocaleString() : '-'}</dd>
            </div>
          </dl>
        </section>
      ) : null}

      <section className="card">
        <h2>How to build the exam application on top of this</h2>
        <ol className="steps">
          <li>
            Add the entity in <code>backend/src/main/java/com/labexam/app/entity</code> and the
            repository in <code>backend/src/main/java/com/labexam/app/repository</code>.
          </li>
          <li>
            Add request/response DTOs in <code>backend/src/main/java/com/labexam/app/dto</code>,
            then the service and the REST controller.
          </li>
          <li>
            Add the page in <code>frontend/src/pages</code> and the API calls in{' '}
            <code>frontend/src/api/api.js</code>.
          </li>
          <li>
            Push to GitHub. Render redeploys the backend and Netlify rebuilds the frontend
            automatically.
          </li>
        </ol>
      </section>

      <section className="card">
        <h2>Environment</h2>
        <p className="muted">
          The frontend reads the backend address from <code>VITE_API_BASE_URL</code>.
        </p>
        <code className="code-block">{API_BASE_URL}</code>
      </section>
    </>
  );
}
