import { useState, useCallback } from 'react'
import useErrorTracking from '../hooks/useErrorTracking'

const ErrorTester = () => {
  const { 
    addBreadcrumb, 
    captureError, 
    startErrorFlow, 
    endErrorFlow,
    addUserInteraction,
    addNetworkBreadcrumb
  } = useErrorTracking()
  const [asyncOperationCount, setAsyncOperationCount] = useState(0)

  const simulateErrors = {
    runtime: () => {
      const flowContext = startErrorFlow('runtime-error', { 
        timestamp: Date.now(),
        component: 'ErrorTester',
        action: 'runtime-error-simulation'
      })

      addBreadcrumb(
        'Preparing to simulate runtime error',
        'error-simulation',
        'info',
        { step: 'preparation' }
      )
      
      try {
        addBreadcrumb(
          'Executing error-prone code',
          'error-simulation',
          'warning',
          { step: 'execution' }
        )
        throw new Error('Simulated runtime error')
      } catch (error) {
        addBreadcrumb(
          'Error caught in try-catch block',
          'error-simulation',
          'error',
          { step: 'error-caught' }
        )
        captureError(error as Error, {
          errorType: 'runtime',
          location: 'ErrorTester.runtime',
          flowContext
        })
        throw error // Re-throw to trigger error boundary
      } finally {
        endErrorFlow('runtime-error', flowContext)
      }
    },

    async: async () => {
      const operationId = asyncOperationCount
      setAsyncOperationCount(prev => prev + 1)
      
      const flowContext = startErrorFlow('async-error', { 
        operationId,
        component: 'ErrorTester',
        action: 'async-error-simulation'
      })
      
      try {
        // Simulate API call preparation
        addBreadcrumb(
          'Preparing async operation',
          'async-flow',
          'info',
          { operationId, step: 'preparation' }
        )

        // Simulate API call
        addNetworkBreadcrumb(
          'POST',
          'https://api.example.com/data',
          undefined,
          { operationId, step: 'request-start' }
        )

        await new Promise(resolve => setTimeout(resolve, 1000))

        // Simulate API error response
        addNetworkBreadcrumb(
          'POST',
          'https://api.example.com/data',
          500,
          { operationId, step: 'request-error' }
        )
        
        throw new Error('Simulated async error: API returned 500')
      } catch (error) {
        captureError(error as Error, {
          errorType: 'async',
          operationId,
          location: 'ErrorTester.async',
          flowContext
        })
      } finally {
        endErrorFlow('async-error', flowContext)
      }
    },

    component: () => {
      const flowContext = startErrorFlow('component-error', {
        component: 'ErrorTester',
        action: 'component-error-simulation'
      })
      
      try {
        addBreadcrumb(
          'Initializing component error simulation',
          'error-simulation',
          'info',
          { step: 'initialization' }
        )

        // Simulate some component state changes
        addBreadcrumb(
          'Component attempting to update state',
          'error-simulation',
          'info',
          { step: 'state-update' }
        )

        // Access undefined property to cause React error
        const obj: any = undefined
        addBreadcrumb(
          'Attempting to access undefined property',
          'error-simulation',
          'warning',
          { step: 'invalid-access' }
        )

        return obj.nonexistent.property
      } catch (error) {
        captureError(error as Error, {
          errorType: 'component',
          location: 'ErrorTester.component',
          flowContext
        })
        throw error // Re-throw to trigger error boundary
      } finally {
        endErrorFlow('component-error', flowContext)
      }
    }
  }

  const handleErrorButtonClick = useCallback((errorType: keyof typeof simulateErrors) => {
    addUserInteraction('click', `error-button-${errorType}`, {
      errorType,
      timestamp: Date.now()
    })
    simulateErrors[errorType]()
  }, [addUserInteraction])

  return (
    <div className="error-tester" style={{ marginTop: '2rem' }}>
      <h3>Error Testing Panel</h3>
      <p style={{ fontSize: '0.9rem', color: '#666', marginTop: '0.5rem' }}>
        Each error will generate detailed breadcrumbs and system information for debugging
      </p>
      <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
        <button
          onClick={() => handleErrorButtonClick('runtime')}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: '#dc3545',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Trigger Runtime Error
        </button>
        <button
          onClick={() => handleErrorButtonClick('async')}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: '#ffc107',
            color: 'black',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Trigger Async Error
        </button>
        <button
          onClick={() => handleErrorButtonClick('component')}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: '#17a2b8',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Trigger Component Error
        </button>
      </div>
    </div>
  )
}

export default ErrorTester
