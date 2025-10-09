import React from 'react'
import DiscoveryDialExact from './components/DiscoveryDialExact.jsx'
import MissionControlDashboard from './components/admin/MissionControlDashboard.jsx'
import AccessibilityEnhancements from './components/AccessibilityEnhancements.jsx'
import './App.css'

function App() {
  // Simple routing based on current pathname
  const currentPath = window.location.pathname
  
  return (
    <AccessibilityEnhancements>
      <div className="App">
        {currentPath === '/admin' ? <MissionControlDashboard /> : <DiscoveryDialExact />}
      </div>
    </AccessibilityEnhancements>
  )
}

export default App
