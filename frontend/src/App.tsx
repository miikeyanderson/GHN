import './App.css'
import * as Sentry from '@sentry/react'

function App() {
  const throwError = (type: string) => {
    // Add breadcrumb before error
    Sentry.addBreadcrumb({
      category: 'error-test',
      message: `User clicked ${type} error button`,
      level: 'info',
    })

    switch (type) {
      case 'sync':
        throw new Error('Synchronous Error Example')
      
      case 'async':
        Promise.reject(new Error('Async Error Example'))
        break
      
      case 'custom': {
        const error = new Error('Custom Error with Extra Context')
        Sentry.withScope((scope) => {
          scope.setExtra('customData', { 
            timeOfError: new Date().toISOString(),
            userAction: 'Testing custom error'
          })
          scope.setTag('error-type', 'custom')
          Sentry.captureException(error)
        })
        throw error
      }
      default:
        throw new Error('Unknown error type')
    }
  }

  return (
    <div className="App" style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <h1 style={{ color: '#333', marginBottom: '30px' }}>Sentry Error Testing</h1>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <button 
          onClick={() => throwError('sync')}
          style={{
            padding: '10px 20px',
            backgroundColor: '#f44336',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Throw Sync Error
        </button>

        <button 
          onClick={() => throwError('async')}
          style={{
            padding: '10px 20px',
            backgroundColor: '#2196f3',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Throw Async Error
        </button>

        <button 
          onClick={() => throwError('custom')}
          style={{
            padding: '10px 20px',
            backgroundColor: '#4caf50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Throw Custom Error
        </button>
      </div>
    </div>
  )
}

export default App
