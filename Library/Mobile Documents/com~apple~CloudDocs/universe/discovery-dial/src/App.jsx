import React from 'react'
import DiscoveryDialExact from './components/DiscoveryDialExact.jsx'
import EmergencyFixDashboard from './components/admin/EmergencyFixDashboard.jsx'
import AccessibilityEnhancements from './components/AccessibilityEnhancements.jsx'
import './App.css'

function App() {
  // Simple routing based on current pathname
  const currentPath = window.location.pathname
  
  return (
    <AccessibilityEnhancements>
      <div className="App">
        {currentPath === '/admin' ? <EmergencyFixDashboard /> : <DiscoveryDialExact />}
      </div>
    </AccessibilityEnhancements>
  )
}

export default App
