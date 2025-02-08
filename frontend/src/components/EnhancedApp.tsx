import { Suspense } from 'react';
import * as Sentry from '@sentry/react';
import App from '../App';
import { ErrorFallback } from './ErrorFallback';

export const EnhancedApp = () => {
  const SentryErrorBoundary = Sentry.ErrorBoundary;

  return (
    <SentryErrorBoundary fallback={ErrorFallback} showDialog>
      <Suspense fallback={<div>Loading...</div>}>
        <App />
      </Suspense>
    </SentryErrorBoundary>
  );
};
