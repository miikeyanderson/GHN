import { useState, useEffect } from 'react'
import axios from 'axios'
import * as Sentry from '@sentry/react'
import useErrorTracking from '../hooks/useErrorTracking'

const TestConnection = () => {
  const [message, setMessage] = useState('Testing connection...')
  const [error, setError] = useState('')
  const errorTracking = useErrorTracking()

  useEffect(() => {
    const testConnection = async () => {
      const flowId = Date.now().toString()
      errorTracking.startErrorFlow('connection-test', {
        flowId,
        component: 'TestConnection',
        action: 'initial-connection'
      })

      try {
        errorTracking.addBreadcrumb(
          'Initiating backend connection test',
          'connection',
          'info',
          { endpoint: 'http://localhost:8000/test' }
        )

        const response = await axios.get('http://localhost:8000/test')
        
        errorTracking.addBreadcrumb(
          'Backend connection successful',
          'connection',
          'info',
          { 
            response: response.data,
            status: response.status
          }
        )

        setMessage(response.data.message)
        setError('')
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Unknown error')
        console.error('Connection error:', error)
        setMessage('Connection failed')
        setError(error.message)

        errorTracking.captureError(error, {
          flowId,
          component: 'TestConnection',
          endpoint: 'http://localhost:8000/test'
        })
      } finally {
        errorTracking.endErrorFlow('connection-test')
      }
    }

    testConnection()
  }, [errorTracking])

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <h2>Backend Connection Test</h2>
      <div style={{ marginTop: '20px' }}>
        <strong>Status: </strong>
        <span style={{ color: error ? 'red' : 'green' }}>{message}</span>
      </div>
      {error && (
        <div style={{ marginTop: '10px', color: 'red' }}>
          <strong>Error: </strong>
          {error}
          <div style={{ marginTop: '10px' }}>
            <button
              onClick={() => Sentry.showReportDialog()}
              style={{
                padding: '8px 16px',
                backgroundColor: '#dc3545',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Report this issue
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default TestConnection
