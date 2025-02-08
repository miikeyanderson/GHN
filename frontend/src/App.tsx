import { useState } from 'react'
import TestConnection from './components/TestConnection'
import ErrorTester from './components/ErrorTester'
import './App.css'

const App = () => {
  const [showErrorTester, setShowErrorTester] = useState(false)

  return (
    <div className="App">
      <TestConnection />
      
      <div style={{ marginTop: '2rem', textAlign: 'center' }}>
        <button
          onClick={() => setShowErrorTester(!showErrorTester)}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          {showErrorTester ? 'Hide Error Tester' : 'Show Error Tester'}
        </button>
      </div>

      {showErrorTester && <ErrorTester />}
    </div>
  )
}

export default App
