import { useCallback, useEffect, useState } from 'react';
import { API_BASE_URL, API_BASE_URL_CONFIGURED, healthApi } from '../api/api.js';
import ConnectionCard from '../components/ConnectionCard.jsx';
import ErrorAlert from '../components/ErrorAlert.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';

/** Moment the JavaScript of this page started - used for the uptime counter. */
const PAGE_LOADED_AT = Date.now();

/**
 * Connection Status Dashboard.
 *
 * It shows three separate connections:
 *   1. the React website itself (checked in the browser),
 *   2. the Spring Boot backend (checked with a real GET /api/health call),
 *   3. the Aiven MySQL database (taken from the answer of the backend).
 *
 * The browser never talks to MySQL directly - the database state is only the
 * value that the backend reports after its own real database check.
 */
export default function StatusDashboard() {
  const [state, setState] = useState('checking');
  const [health, setHealth] = useState(null);
  const [error, setError] = useState('');
  const [checkedAt, setCheckedAt] = useState(null);
  const [checks, setChecks] = useState(0);
  const [latencyMs, setLatencyMs] = useState(null);
  const [uptime, setUptime] = useState(0);

  const loadHealth = useCallback(async () => {
    setState('checking');
    setError('');
    const startedAt = performance.now();

    try {
      const response = await healthApi.check();
      setHealth(response.data);
      setLatencyMs(Math.round(performance.now() - startedAt));
      setCheckedAt(new Date());
      setChecks((count) => count + 1);
      setState('connected');
    } catch (err) {
      setHealth(null);
      setLatencyMs(null);
      setError(err.message);
      setCheckedAt(new Date());
      setChecks((count) => count + 1);
      setState('disconnected');
    }
  }, []);

  useEffect(() => {
    loadHealth();
  }, [loadHealth]);

  // Uptime of this page - it proves that the frontend code is really running.
  useEffect(() => {
    const timer = setInterval(() => {
      setUptime(Math.floor((Date.now() - PAGE_LOADED_AT) / 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const frontendState = typeof document !== 'undefined' && document.readyState !== 'loading' ? 'connected' : 'checking';

  // The database state is only known when the backend answered. If the
  // backend is unreachable the database state is "unknown", never "UP".
  const databaseReported = health?.database ?? null;
  const databaseState =
    state !== 'connected' ? 'unknown' : databaseReported === 'UP' ? 'connected' : databaseReported === 'DOWN' ? 'disconnected' : 'unknown';

  const databaseBadge =
    databaseState === 'connected'
      ? 'CONNECTED'
      : databaseState === 'disconnected'
        ? 'DISCONNECTED'
        : databaseState === 'checking'
          ? 'CHECKING'
          : 'UNKNOWN';

  return (
    <>
      <section className="hero">
        <h1>Connection Status Dashboard</h1>
        <p>
          Every value on this page comes from a real check. The frontend is checked in the browser,
          the backend is checked with a <code>GET /api/health</code> call and the database state is
          the answer that the backend gives after its own database check.
        </p>
        <div className="toolbar">
          <div className="muted">
            {checkedAt
              ? `Last checked: ${checkedAt.toLocaleString()} (${checks} check${checks === 1 ? '' : 's'})`
              : 'Waiting for the first check...'}
          </div>
          <button type="button" className="btn btn-primary" onClick={loadHealth} disabled={state === 'checking'}>
            {state === 'checking' ? 'Checking...' : 'Refresh'}
          </button>
        </div>
      </section>

      {state === 'checking' ? <LoadingSpinner label="Contacting the backend..." /> : null}

      <ErrorAlert message={error} onRetry={loadHealth} />

      {!API_BASE_URL_CONFIGURED ? (
        <div className="alert alert-warning" role="alert">
          <div className="alert-body">
            <strong>VITE_API_BASE_URL is not set in this build.</strong>
            <p>
              The frontend therefore calls the local fallback <code>{API_BASE_URL}</code>. On Netlify set
              the environment variable <code>VITE_API_BASE_URL</code> to the Render URL (without a trailing
              slash) and rebuild the site.
            </p>
          </div>
        </div>
      ) : null}

      <section className="status-grid">
        <ConnectionCard
          title="React website"
          description="This page is running in your browser - the JavaScript bundle was loaded and executed."
          state={frontendState}
          badge="CONNECTED"
        >
          <div>
            <dt>Page loaded at</dt>
            <dd>{new Date(PAGE_LOADED_AT).toLocaleTimeString()}</dd>
          </div>
          <div>
            <dt>Uptime</dt>
            <dd>{uptime} second{uptime === 1 ? '' : 's'}</dd>
          </div>
          <div>
            <dt>Page address</dt>
            <dd>{typeof window !== 'undefined' ? window.location.href : '-'}</dd>
          </div>
          <div>
            <dt>API base URL</dt>
            <dd>{API_BASE_URL}</dd>
          </div>
        </ConnectionCard>

        <ConnectionCard
          title="Spring Boot backend"
          description="Checked with a real request to GET /api/health through the Axios client."
          state={state}
        >
          <div>
            <dt>Application</dt>
            <dd>{health?.application ?? '-'}</dd>
          </div>
          <div>
            <dt>Application status</dt>
            <dd>{health?.status ?? '-'}</dd>
          </div>
          <div>
            <dt>Round trip</dt>
            <dd>{latencyMs === null ? '-' : `${latencyMs} ms`}</dd>
          </div>
          <div>
            <dt>Endpoint</dt>
            <dd>{`${API_BASE_URL}/api/health`}</dd>
          </div>
          <div>
            <dt>Message</dt>
            <dd>{health?.message ?? (error ? '-' : 'No answer yet.')}</dd>
          </div>
        </ConnectionCard>

        <ConnectionCard
          title="Aiven MySQL database"
          description="The value reported by the backend in the database field of /api/health."
          state={databaseState}
          badge={databaseBadge}
        >
          <div>
            <dt>Reported status</dt>
            <dd>{databaseReported ?? 'unknown (backend did not answer)'}</dd>
          </div>
          <div>
            <dt>Database check</dt>
            <dd>
              {health?.databaseLatencyMs === undefined || health?.databaseLatencyMs === null
                ? '-'
                : `${health.databaseLatencyMs} ms`}
            </dd>
          </div>
          <div>
            <dt>Checked at</dt>
            <dd>{health?.timestamp ? new Date(health.timestamp).toLocaleString() : '-'}</dd>
          </div>
          <div>
            <dt>Source</dt>
            <dd>{API_BASE_URL}/api/health</dd>
          </div>
        </ConnectionCard>
      </section>

      {health ? (
        <section className="card">
          <h2>Answer of GET /api/health</h2>
          <p className="muted">This is the raw response body that the backend returned.</p>
          <pre className="json-block">{JSON.stringify(health, null, 2)}</pre>
        </section>
      ) : null}
    </>
  );
}
