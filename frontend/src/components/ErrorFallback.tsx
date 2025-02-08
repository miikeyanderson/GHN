import type { FallbackProps } from '@sentry/types';

export const ErrorFallback = ({ error, componentStack, resetError }: FallbackProps) => {
  return (
    <div className="error-fallback">
      <div className="error-content">
        <h2>Something went wrong</h2>
        <div className="error-details">
          <p>Error: {error.message}</p>
          {componentStack && (
            <pre className="error-stack">
              Component Stack:
              {componentStack}
            </pre>
          )}
        </div>
        <button onClick={resetError}>Try again</button>
      </div>
    </div>
  );
};
