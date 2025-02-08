import React from 'react'
import { createRoot } from 'react-dom/client'
import * as Sentry from '@sentry/react'
import { Integrations } from '@sentry/tracing'
import type { FallbackRender } from '@sentry/react'
import App from './App.tsx'
import './index.css'

// Separate Sentry configuration
// Get system information for debugging
const getSystemInfo = () => {
  const info: Record<string, string> = {
    userAgent: navigator.userAgent,
    language: navigator.language,
    platform: navigator.platform,
    screenResolution: `${window.screen.width}x${window.screen.height}`,
    viewport: `${window.innerWidth}x${window.innerHeight}`,
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  };

  // Add memory info if available
  if ('memory' in performance) {
    const memory = (performance as any).memory;
    info.totalJSHeapSize = `${Math.round(memory.totalJSHeapSize / 1048576)}MB`;
    info.usedJSHeapSize = `${Math.round(memory.usedJSHeapSize / 1048576)}MB`;
  }

  return info;
};

// Initialize performance monitoring
const initPerformanceMonitoring = () => {
  try {
    // Monitor route changes
    let lastRoute = window.location.pathname;
    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        if (lastRoute !== window.location.pathname) {
          Sentry.addBreadcrumb({
            category: 'navigation',
            message: `Route changed from ${lastRoute} to ${window.location.pathname}`,
            level: 'info',
          });
          lastRoute = window.location.pathname;
        }
        Sentry.captureMessage('Performance entry', {
          level: 'info',
          extra: { performanceEntry: entry },
        });
      });
    });
    observer.observe({ entryTypes: ['navigation', 'resource', 'largest-contentful-paint'] });
  } catch (e) {
    console.error('Failed to initialize performance monitoring:', e);
  }
};

const initSentry = () => {
  try {
    const systemInfo = getSystemInfo();
    
    Sentry.init({
      dsn: "https://5ed411df17209b6685f28dc270720924@o4508683153375232.ingest.us.sentry.io/4508782805450752",
      integrations: [new Integrations.BrowserTracing()],
      environment: import.meta.env.MODE || 'development',
      release: '1.0.0',
      tracesSampleRate: 1.0,
      maxBreadcrumbs: 100,
      beforeBreadcrumb(breadcrumb) {
        // Add timestamp to all breadcrumbs
        return {
          ...breadcrumb,
          timestamp: Date.now(),
        };
      },
      beforeSend(event, hint) {
        try {
          const error = hint?.originalException;
          const errorStack = error instanceof Error ? error.stack : undefined;

          // Add rich context to every error
          event.tags = {
            ...event.tags,
            ...systemInfo,
            'error.type': error?.constructor?.name,
            'error.handled': Boolean(hint) ? 'yes' : 'no',
          };

          event.extra = {
            ...event.extra,
            'error.stack': errorStack,
            'document.referrer': document.referrer,
            'document.title': document.title,
            'route.current': window.location.pathname,
            'route.search': window.location.search,
            'route.hash': window.location.hash,
            'performance.memory': (performance as any)?.memory ? JSON.stringify((performance as any).memory) : 'unavailable',
            'performance.navigation': performance?.navigation ? JSON.stringify(performance.navigation) : 'unavailable',
            'performance.timing': performance?.timing ? JSON.stringify(performance.timing) : 'unavailable',
          };

          // Add network information if available
          if ('connection' in navigator) {
            const conn = (navigator as any).connection;
            event.extra['network.type'] = conn.effectiveType;
            event.extra['network.downlink'] = conn.downlink;
            event.extra['network.rtt'] = conn.rtt;
          }

          // Add local storage keys (but not values for privacy)
          event.extra['localStorage.keys'] = Object.keys(localStorage);

          // Add recent console logs
          const originalConsole = {
            log: console.log,
            warn: console.warn,
            error: console.error,
          };
          const recentLogs: string[] = [];
          const MAX_LOGS = 10;

          // Override console methods to capture logs
          ['log', 'warn', 'error'].forEach((method) => {
            console[method as keyof typeof console] = (...args: any[]) => {
              recentLogs.push(`[${method.toUpperCase()}] ${args.join(' ')}`);
              if (recentLogs.length > MAX_LOGS) recentLogs.shift();
              originalConsole[method as keyof typeof originalConsole](...args);
            };
          });

          event.extra['console.recent'] = recentLogs;
        } catch (e) {
          console.error('Error enriching Sentry event:', e);
        }
        return event;
      },
    });

    // Initialize performance monitoring
    initPerformanceMonitoring();

    // Add global error listeners
    window.addEventListener('unhandledrejection', (event) => {
      Sentry.captureException(event.reason, {
        extra: {
          type: 'unhandledrejection',
          promise: event.promise,
        },
      });
    });

    window.addEventListener('error', (event) => {
      Sentry.captureException(event.error, {
        extra: {
          type: 'window.error',
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
        },
      });
    });

  } catch (e) {
    console.error('Failed to initialize Sentry:', e);
  }
};

// Separate error fallback component
const ErrorFallback: FallbackRender = (errorData) => (
  <div style={{
    padding: '20px',
    margin: '20px',
    backgroundColor: '#fff3f3',
    border: '1px solid #ffcdd2',
    borderRadius: '4px',
    textAlign: 'center'
  }}>
    <h2 style={{ color: '#d32f2f' }}>Something went wrong</h2>
    <p style={{ color: '#666' }}>
      {errorData.error instanceof Error ? errorData.error.message : 'An unexpected error occurred'}
    </p>
    <button
      onClick={() => {
        // Clear any error state
        errorData.resetError();
        // Reload the page if needed
        window.location.reload();
      }}
      style={{
        padding: '8px 16px',
        backgroundColor: '#4caf50',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer'
      }}
    >
      Try again
    </button>
  </div>
);

// Initialize Sentry
initSentry();

// Create the error boundary wrapped app
const SentryWrappedApp = () => (
  <Sentry.ErrorBoundary
    fallback={ErrorFallback}
    onError={(error) => {
      console.error('Caught by error boundary:', error);
      Sentry.captureException(error);
    }}
  >
    <App />
  </Sentry.ErrorBoundary>
);

// Get the root element
const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Failed to find root element');
}

// Create and render the app
const root = createRoot(rootElement);
root.render(
  <React.StrictMode>
    <SentryWrappedApp />
  </React.StrictMode>
);

