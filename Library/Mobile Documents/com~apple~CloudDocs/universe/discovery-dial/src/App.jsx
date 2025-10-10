import React from 'react'
import DiscoveryDialExact from './components/DiscoveryDialExact.jsx'
import AccessibilityEnhancements from './components/AccessibilityEnhancements.jsx'
import './App.css'

function App() {
  // Simple routing based on current pathname
  const currentPath = window.location.pathname
  
  return (
    <AccessibilityEnhancements>
      <div className="App">
        {currentPath === '/admin' ? (
          <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">Admin Dashboard</h1>
              <p className="text-gray-600 mb-8">Building clean, table-based admin interface with best practices UI/UX</p>
              <a 
                href="/" 
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Back to Discovery Dial
              </a>
            </div>
          </div>
        ) : (
          <DiscoveryDialExact />
        )}
      </div>
    </AccessibilityEnhancements>
  )
}

export default App
