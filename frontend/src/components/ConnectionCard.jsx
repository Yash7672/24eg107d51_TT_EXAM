/**
 * One row of the connection status page.
 *
 * It shows the state of a single connection with a coloured badge:
 *   working     -> green  WORKING
 *   failed      -> red    NOT WORKING
 *   checking    -> blue   CHECKING
 *   unknown     -> amber  UNKNOWN  (the state could not be determined)
 *
 * @param {string} title       name of the connection
 * @param {'working' | 'failed' | 'checking' | 'unknown'} state
 * @param {string} [badge]     own badge text, defaults to the state name
 * @param {string} [description] short explanation of what is checked
 * @param {import('react').ReactNode} [action] the button of this row
 * @param {import('react').ReactNode} [children] detail rows
 *                                             (<div><dt>..</dt><dd>..</dd></div>)
 */
const BADGE_TEXT = {
  working: 'WORKING',
  failed: 'NOT WORKING',
  checking: 'CHECKING',
  unknown: 'UNKNOWN',
};

// The colour class of the badge (green / red / blue / amber).
const BADGE_CLASS = {
  working: 'connected',
  failed: 'disconnected',
  checking: 'checking',
  unknown: 'unknown',
};

export default function ConnectionCard({ title, state, badge, description, action, children }) {
  const badgeText = badge ?? BADGE_TEXT[state] ?? String(state).toUpperCase();
  const badgeColour = BADGE_CLASS[state] ?? 'unknown';

  return (
    <article className={`card check-row check-${state}`}>
      <div className="check-main">
        <div className="check-head">
          <h2>{title}</h2>
          <span className={`conn-badge conn-badge-${badgeColour}`} role="status" aria-live="polite">
            <span className="conn-dot" aria-hidden="true" />
            {badgeText}
          </span>
        </div>

        {description ? <p className="muted conn-desc">{description}</p> : null}

        {action}
      </div>

      {children ? <dl className="conn-details">{children}</dl> : null}
    </article>
  );
}
