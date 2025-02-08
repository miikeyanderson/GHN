import * as Sentry from '@sentry/react'

interface ErrorButtonProps {
  label: string
  action: () => void
  style?: React.CSSProperties
}

const ErrorButton: React.FC<ErrorButtonProps> = ({ label, action, style }) => (
  <button
    onClick={() => {
      // Add breadcrumb before triggering error
      Sentry.addBreadcrumb({
        category: 'error-demo',
        message: `User clicked "${label}" button`,
        level: 'info'
      })
      action()
    }}
    style={{
      backgroundColor: '#dc3545',
      color: 'white',
      border: 'none',
      padding: '8px 16px',
      borderRadius: '4px',
      cursor: 'pointer',
      margin: '5px',
      ...style
    }}
  >
    {label}
  </button>
)

const ErrorDemo = () => {
  const throwError = () => {
    throw new Error('Synchronous error from button click')
  }

  const throwAsyncError = async () => {
    try {
      // Simulate an API call that fails
      await new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Async operation failed')), 100)
      })
    } catch (error) {
      Sentry.captureException(error)
      throw error
    }
  }

  const throwComponentError = () => {
    // This will trigger during render
    throw new Error('Component render error')
  }

  return (
    <div style={{ 
      padding: '20px',
      backgroundColor: '#f8f9fa',
      borderRadius: '8px',
      margin: '20px 0'
    }}>
      <h3>Error Testing Panel</h3>
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <ErrorButton
          label="Trigger Sync Error"
          errorType="sync"
          action={throwError}
        />
        <ErrorButton
          label="Trigger Async Error"
          errorType="async"
          action={() => throwAsyncError()}
        />
        <ErrorButton
          label="Trigger Render Error"
          errorType="render"
          action={throwComponentError}
        />
      </div>
    </div>
  )
}

export default ErrorDemo
