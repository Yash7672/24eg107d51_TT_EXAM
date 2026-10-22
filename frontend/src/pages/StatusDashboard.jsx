import { useCallback, useEffect, useRef, useState } from 'react';
import { API_BASE_URL, API_BASE_URL_CONFIGURED, healthApi } from '../api/api.js';
import ConnectionCard from '../components/ConnectionCard.jsx';
import ErrorAlert from '../components/ErrorAlert.jsx';

/** Moment the JavaScript of this page started - used for the uptime counter. */
const PAGE_LOADED_AT = Date.now();

/**
 * Connection Status page with three buttons.
 *
 *   1. "Check website"  - checks that this React page is really running
 *                         (JavaScript executed, timers work).
 *   2. "Check backend"  - real GET /api/health call through the Axios client.
 *   3. "Check database" - the same real call, but only the database result
 *                         of the answer is used.
 *
 * Every check runs automatically when the page is opened or refreshed, so the
 * page always shows WORKING / NOT WORKING without any interaction.
 *
 * The browser never talks to MySQL directly. The database state is only the
 * value that the backend reports after its own real database check.
 */
export default function StatusDashboard() {
  const [website, setWebsite] = useState('checking');
  const [backend, setBackend] = useState('checking');
  const [database, setDatabase] = useState('checking');
  const [health, setHealth] = useState(null);
  const [error, setError] = useState('');
  const [checkedAt, setCheckedAt] = useState(null);
  const [uptime, setUptime] = useState(0);
  const [lastCheckMs, setLastCheckMs] = useState(null);
  const timerWorks = useRef(false);

  // --- check 1: the website itself -----------------------------------------
  const checkWebsite = useCallback(() => {
    const pageLoaded = typeof document !== 'undefined' && document.readyState !== 'loading';
    setWebsite(pageLoaded && timerWorks.current ? 'working' : 'checking');
  }, []);

  // --- check 2 and 3: the backend API (and the database it reports) ---------
  const fetchHealth = useCallback(async () => {
    const startedAt = performance.now();
    try {
      const response = await healthApi.check();
      setHealth(response.data);
      setLastCheckMs(Math.round(performance.now() - startedAt));
      setError('');
      setCheckedAt(new Date());
      return { ok: true, data: response.data };
    } catch (err) {
      setHealth(null);
      setLastCheckMs(null);
      setError(err.message);
      setCheckedAt(new Date());
      return { ok: false, data: null };
    }
  }, []);

  const checkBackend = useCallback(async () => {
    setBackend('checking');
    const result = await fetchHealth();
    if (result.ok) {
      setBackend('working');
      setDatabase(result.data?.database === 'UP' ? 'working' : result.data?.database === 'DOWN' ? 'failed' : 'unknown');
    } else {
      setBackend('failed');
      setDatabase('unknown');
    }
  }, [fetchHealth]);

  const checkDatabase = useCallback(async () => {
    setDatabase('checking');
    const result = await fetchHealth();
    if (!result.ok) {
      setBackend('failed');
      setDatabase('unknown');
      return;
    }
    setBackend('working');
    setDatabase(result.data?.database === 'UP' ? 'working' : result.data?.database === 'DOWN' ? 'failed' : 'unknown');
  }, [fetchHealth]);

  // --- run every check automatically on load and on every refresh ----------
  useEffect(() => {
    // A running timer is the proof that the JavaScript of this page works.
    const ticker = setInterval(() => {
      timerWorks.current = true;
      setUptime(Math.floor((Date.now() - PAGE_LOADED_AT) / 1000));
      // The first tick confirms that the browser timers run -> the page works.
      setWebsite((state) => {
        if (state !== 'checking') return state;
        const pageLoaded = typeof document !== 'undefined' && document.readyState !== 'loading';
        return pageLoaded ? 'working' : state;
      });
    }, 1000);
    checkWebsite();
    checkBackend();
    return () => clearInterval(ticker);
  }, [checkWebsite, checkBackend]);

  const buttonLabel = (state, name) => (state === 'checking' ? 'Checking...' : name);

  return (
    <>
      <section className="hero">
        <h1>Connection Status</h1>
        <p>
          Three real checks - the website in your browser, the backend API on Render and the
          Aiven MySQL database. Every check runs again automatically when you refresh the page.
        </p>
        <p className="muted">
          Last check: {checkedAt ? checkedAt.toLocaleString() : 'waiting for the first check...'}
        </p>
      </section>

      {error ? <ErrorAlert message={error} onRetry={checkBackend} /> : null}

      {!API_BASE_URL_CONFIGURED ? (
        <div className="alert alert-warning" role="alert">
          <div className="alert-body">
            <strong>VITE_API_BASE_URL is not set in this build.</strong>
            <p>
              The frontend therefore calls the local fallback <code>{API_BASE_URL}</code>. Set the
              variable in Netlify to the Render URL and rebuild the site.
            </p>
          </div>
        </div>
      ) : null}

      <section className="check-list">
        <ConnectionCard
          title="1. React website"
          state={website}
          description="Checks that this page is really running: the JavaScript bundle was executed and the browser timers are running."
          action={
            <button type="button" className="btn btn-primary" onClick={checkWebsite} disabled={website === 'checking'}>
              {buttonLabel(website, 'Check website')}
            </button>
          }
        >
          <div>
            <dt>Page loaded at</dt>
            <dd>{new Date(PAGE_LOADED_AT).toLocaleTimeString()}</dd>
          </div>
          <div>
            <dt>Uptime</dt>
            <dd>
              {uptime} second{uptime === 1 ? '' : 's'}
            </dd>
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
          title="2. Spring Boot backend"
          state={backend}
          description={
            <>
              Real request to <code>GET /api/health</code> through the Axios client.
            </>
          }
          action={
            <button type="button" className="btn btn-primary" onClick={checkBackend} disabled={backend === 'checking'}>
              {buttonLabel(backend, 'Check backend')}
            </button>
          }
        >
          <div>
            <dt>Endpoint</dt>
            <dd>{`${API_BASE_URL}/api/health`}</dd>
          </div>
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
            <dd>{lastCheckMs === null ? '-' : `${lastCheckMs} ms`}</dd>
          </div>
          <div>
            <dt>Message</dt>
            <dd>{health?.message ?? (error ? '-' : 'No answer yet.')}</dd>
          </div>
        </ConnectionCard>

        <ConnectionCard
          title="3. Aiven MySQL database"
          state={database}
          description="The value that the backend reports in the database field of the health response - the browser never connects to MySQL itself."
          action={
            <button type="button" className="btn btn-primary" onClick={checkDatabase} disabled={database === 'checking'}>
              {buttonLabel(database, 'Check database')}
            </button>
          }
        >
          <div>
            <dt>Reported status</dt>
            <dd>{health?.database ?? 'unknown (the backend did not answer)'}</dd>
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
            <dd>{`${API_BASE_URL}/api/health`}</dd>
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
