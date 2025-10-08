import React from 'react'
import DiscoveryDial from './components/DiscoveryDial.jsx'
import AdminApp from './components/AdminApp.jsx'
import AccessibilityEnhancements from './components/AccessibilityEnhancements.jsx'
import './App.css'

function App() {
  // Simple routing based on current pathname
  const currentPath = window.location.pathname
  
  return (
    <AccessibilityEnhancements>
      <div className="App">
        {currentPath === '/admin' ? <AdminApp /> : <DiscoveryDial />}
      </div>
    </AccessibilityEnhancements>
  )
}

export default App
