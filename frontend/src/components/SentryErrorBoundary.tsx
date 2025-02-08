import { Component, PropsWithChildren } from 'react'
import * as Sentry from '@sentry/react'

interface Props extends PropsWithChildren {
  fallback?: React.ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class SentryErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  public componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo)
    Sentry.captureException(error, {
      contexts: {
        react: {
          componentStack: errorInfo.componentStack
        }
      }
    })
  }

  public render() {
    const { hasError, error } = this.state
    const { fallback, children } = this.props

    if (hasError) {
      return fallback || (
        <div style={{
          padding: '20px',
          margin: '20px',
          border: '1px solid #dc3545',
          borderRadius: '4px',
          backgroundColor: '#fff'
        }}>
          <h2 style={{ color: '#dc3545' }}>Something went wrong</h2>
          <pre style={{ 
            whiteSpace: 'pre-wrap',
            backgroundColor: '#f8f9fa',
            padding: '10px',
            borderRadius: '4px'
          }}>
            {error?.message}
          </pre>
          <button
            onClick={() => window.location.reload()}
            style={{
              backgroundColor: '#0d6efd',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '4px',
              cursor: 'pointer',
              marginTop: '10px'
            }}
          >
            Reload page
          </button>
        </div>
      )
    }

    return children
  }
}
