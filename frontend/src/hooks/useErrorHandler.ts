import { useCallback } from 'react';
import * as Sentry from '@sentry/react';

interface ErrorHandlerOptions {
  context?: Record<string, unknown>;
  tags?: Record<string, string>;
  level?: Sentry.SeverityLevel;
}

export const useErrorHandler = () => {
  const handleError = useCallback((error: Error, options: ErrorHandlerOptions = {}) => {
    const { context = {}, tags = {}, level = 'error' } = options;

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error caught by useErrorHandler:', error);
      console.debug('Error context:', context);
    }

    // Report to Sentry
    Sentry.withScope((scope) => {
      // Add error context
      scope.setExtras({
        ...context,
        timestamp: new Date().toISOString(),
        url: window.location.href,
      });

      // Add tags
      scope.setTags({
        ...tags,
        errorType: error.name,
        environment: process.env.NODE_ENV,
      });

      // Set error level
      scope.setLevel(level);

      // Capture the error
      Sentry.captureException(error);
    });

    // You can add additional error reporting services here
  }, []);

  return { handleError };
};
