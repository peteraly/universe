import React from 'react'
import DiscoveryDialCompass from './components/DiscoveryDialCompass.jsx'
import EmergencyFixDashboard from './components/admin/EmergencyFixDashboard.jsx'
import AccessibilityEnhancements from './components/AccessibilityEnhancements.jsx'
import './App.css'

function App() {
  // Simple routing based on current pathname
  const currentPath = window.location.pathname
  
  return (
    <AccessibilityEnhancements>
      <div className="App">
        {currentPath === '/admin' ? <EmergencyFixDashboard /> : <DiscoveryDialCompass />}
      </div>
    </AccessibilityEnhancements>
  )
}

export default App
