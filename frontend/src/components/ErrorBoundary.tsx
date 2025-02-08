import { Component, ErrorInfo, ReactNode } from 'react';
import * as Sentry from '@sentry/react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundaryComponent extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    Sentry.captureException(error, {
      contexts: {
        react: {
          componentStack: errorInfo.componentStack,
        },
      },
    });
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="error-boundary">
          <h2>Oops, something went wrong!</h2>
          <p>We're sorry for the inconvenience. Please try refreshing the page.</p>
          <button
            onClick={() => {
              this.setState({ hasError: false, error: null });
              window.location.reload();
            }}
            className="primary-button"
          >
            Refresh Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

const ErrorBoundary = Sentry.withErrorBoundary(ErrorBoundaryComponent, {
  fallback: (props) => (
    <div className="error-boundary">
      <h2>Oops, something went wrong!</h2>
      <p>We're sorry for the inconvenience. Please try refreshing the page.</p>
      <button
        onClick={props.resetError}
        className="primary-button"
      >
        Try Again
      </button>
    </div>
  ),
});

export default ErrorBoundary;
