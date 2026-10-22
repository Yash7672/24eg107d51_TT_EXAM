/**
 * One card of the connection status dashboard.
 *
 * It shows the state of a single connection with a coloured badge:
 *   connected    -> green  CONNECTED
 *   disconnected -> red    DISCONNECTED
 *   checking     -> blue   CHECKING
 *   unknown      -> amber  UNKNOWN  (the state could not be determined)
 *
 * @param {string} title       name of the connection, e.g. "Spring Boot backend"
 * @param {string} description short explanation of what is checked
 * @param {'connected' | 'disconnected' | 'checking' | 'unknown'} state
 * @param {string} [badge]     own badge text, defaults to the state name
 * @param {import('react').ReactNode} [children] optional detail rows
 *                                             (<div><dt>..</dt><dd>..</dd></div>)
 */
export default function ConnectionCard({ title, description, state, badge, children }) {
  const defaultBadges = {
    connected: 'CONNECTED',
    disconnected: 'DISCONNECTED',
    checking: 'CHECKING',
    unknown: 'UNKNOWN',
  };

  const badgeText = badge ?? defaultBadges[state] ?? String(state).toUpperCase();

  return (
    <article className={`card conn-card conn-${state}`}>
      <div className="conn-head">
        <h2>{title}</h2>
        <span className={`conn-badge conn-badge-${state}`} role="status" aria-live="polite">
          <span className="conn-dot" aria-hidden="true" />
          {badgeText}
        </span>
      </div>

      <p className="muted conn-desc">{description}</p>

      {children ? <dl className="conn-details">{children}</dl> : null}
    </article>
  );
}
