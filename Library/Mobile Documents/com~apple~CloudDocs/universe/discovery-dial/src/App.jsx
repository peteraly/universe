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
          <div className="min-h-screen bg-gray-100 flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">Admin Panel</h1>
              <p className="text-gray-600 mb-8">Admin panel is being rebuilt. Check back soon!</p>
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
