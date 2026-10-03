/** Small shared presentational helpers. */

export function Spinner({ className = 'h-4 w-4' }) {
  return (
    <svg className={`animate-spin ${className}`} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
      />
    </svg>
  );
}

export function EmptyState({ title, message, action }) {
  return (
    <div className="card flex flex-col items-center gap-2 px-6 py-12 text-center">
      <p className="text-base font-semibold text-slate-800">{title}</p>
      {message && <p className="max-w-sm text-sm text-slate-500">{message}</p>}
      {action}
    </div>
  );
}

export function ErrorBanner({ message, onRetry }) {
  if (!message) return null;
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
      <span>{message}</span>
      {onRetry && (
        <button type="button" onClick={onRetry} className="btn-secondary py-1 text-xs">
          Retry
        </button>
      )}
    </div>
  );
}

export function StarRating({ rating }) {
  if (rating === null || rating === undefined) return null;
  return (
    <span className="inline-flex items-center gap-1 text-sm font-medium text-slate-700">
      <svg className="h-4 w-4 text-amber-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
        <path d="M9.05 2.93c.3-.92 1.6-.92 1.9 0l1.36 4.18a1 1 0 00.95.69h4.4c.96 0 1.36 1.24.58 1.81l-3.56 2.58a1 1 0 00-.36 1.12l1.36 4.18c.3.92-.75 1.69-1.54 1.12l-3.56-2.58a1 1 0 00-1.18 0l-3.56 2.58c-.79.57-1.84-.2-1.54-1.12l1.36-4.18a1 1 0 00-.36-1.12L1.71 9.61C.93 9.04 1.33 7.8 2.29 7.8h4.4a1 1 0 00.95-.69l1.36-4.18z" />
      </svg>
      {rating.toFixed(1)}
    </span>
  );
}
