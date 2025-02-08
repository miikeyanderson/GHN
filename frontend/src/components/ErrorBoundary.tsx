import { Component, ErrorInfo, ReactNode } from 'react';
import * as Sentry from '@sentry/react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo });
    
    // Log to Sentry
    Sentry.withScope((scope) => {
      scope.setExtras({
        componentStack: errorInfo.componentStack,
        errorInfo,
      });
      scope.setLevel('error');
      Sentry.captureException(error);
    });
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary" style={{
          padding: '20px',
          maxWidth: '800px',
          margin: '0 auto',
          textAlign: 'center'
        }}>
          <h2 style={{ color: '#dc3545' }}>Oops, something went wrong!</h2>
          <p>Our team has been notified of this issue.</p>
          
          <button
            onClick={() => Sentry.showReportDialog()}
            style={{
              padding: '8px 16px',
              backgroundColor: '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              marginTop: '16px'
            }}
          >
            Report this issue
          </button>

          <details 
            style={{ 
              marginTop: '20px',
              textAlign: 'left',
              whiteSpace: 'pre-wrap',
              backgroundColor: '#f8f9fa',
              padding: '15px',
              borderRadius: '4px'
            }}
          >
            <summary style={{ cursor: 'pointer', marginBottom: '10px' }}>
              Technical Details
            </summary>
            <div style={{ color: '#6c757d' }}>
              <strong>Error:</strong> {this.state.error?.toString()}
              {this.state.errorInfo && (
                <>
                  <br /><br />
                  <strong>Component Stack:</strong>
                  <pre style={{ margin: '10px 0' }}>
                    {this.state.errorInfo.componentStack}
                  </pre>
                </>
              )}
            </div>
          </details>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
