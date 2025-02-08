import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import * as Sentry from '@sentry/react';
import { store, persistor } from './store';
import { AppRouter } from './routes';
import ErrorBoundary from './components/ErrorBoundary';
import Notifications from './components/Notifications';
import LoadingSpinner from './components/LoadingSpinner';
import './App.css';

// Configure React Query client with error handling
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
      suspense: false,
    },
    mutations: {
      retry: 1,
    },
  },
  logger: {
    log: (message) => {
      console.log(message);
    },
    warn: (message) => {
      console.warn(message);
    },
    error: (error) => {
      console.error(error);
      Sentry.captureException(error);
    },
  },
});

// Configure Sentry
Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  integrations: [
    new Sentry.BrowserTracing(),
    new Sentry.Replay(),
  ],
  environment: import.meta.env.VITE_SENTRY_ENVIRONMENT || 'development',
  tracesSampleRate: 1.0,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
});

function App() {
  return (
    <Provider store={store}>
      <PersistGate loading={<LoadingSpinner />} persistor={persistor}>
        <QueryClientProvider client={queryClient}>
          <ErrorBoundary>
            <AppRouter />
            <Notifications />
          </ErrorBoundary>
        </QueryClientProvider>
      </PersistGate>
    </Provider>
  );
}

export default Sentry.withProfiler(App);
