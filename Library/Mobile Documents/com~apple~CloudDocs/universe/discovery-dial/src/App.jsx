import React from 'react'
import DiscoveryDialExact from './components/DiscoveryDialExact.jsx'
import ProfessionalAdminDashboard from './components/admin/ProfessionalAdminDashboard.jsx'
import AccessibilityEnhancements from './components/AccessibilityEnhancements.jsx'
import './App.css'

function App() {
  // Simple routing based on current pathname
  const currentPath = window.location.pathname
  
  return (
    <AccessibilityEnhancements>
      <div className="App">
        {currentPath === '/admin' ? <ProfessionalAdminDashboard /> : <DiscoveryDialExact />}
      </div>
    </AccessibilityEnhancements>
  )
}

export default App
