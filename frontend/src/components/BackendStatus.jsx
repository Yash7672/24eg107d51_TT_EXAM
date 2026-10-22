/**
 * Small badge that shows whether the backend can be reached.
 *
 * @param {'loading' | 'online' | 'offline'} status
 * @param {object} health  the JSON body returned by /api/health (optional)
 */
export default function BackendStatus({ status, health }) {
  const labels = {
    loading: 'Checking backend...',
    online: 'Backend connected',
    offline: 'Backend not reachable',
  };

  return (
    <span className={`status-pill status-${status}`}>
      <span className="status-dot" aria-hidden="true" />
      {labels[status] ?? status}
      {health?.database ? <span className="status-detail"> (database: {health.database})</span> : null}
    </span>
  );
}
