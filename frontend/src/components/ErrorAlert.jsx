/**
 * Error box with an optional retry button.
 *
 * @param {string} message  readable error message
 * @param {Function} onRetry called when the user clicks "Try again"
 */
export default function ErrorAlert({ message, onRetry }) {
  if (!message) return null;

  return (
    <div className="alert alert-error" role="alert">
      <div className="alert-body">
        <strong>Something went wrong.</strong>
        <p>{message}</p>
      </div>
      {onRetry ? (
        <button type="button" className="btn btn-secondary" onClick={onRetry}>
          Try again
        </button>
      ) : null}
    </div>
  );
}
