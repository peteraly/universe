import React from 'react'
import DiscoveryDialCompass from './components/DiscoveryDialCompass.jsx'
import DialTestComponent from './components/DialTestComponent.jsx'
import EmergencyFixDashboard from './components/admin/EmergencyFixDashboard.jsx'
import AccessibilityEnhancements from './components/AccessibilityEnhancements.jsx'
import './App.css'
import './styles/override.css'

function App() {
  // Simple routing based on current pathname
  const currentPath = window.location.pathname
  
  return (
    <AccessibilityEnhancements>
      <div className="App">
        {currentPath === '/admin' ? <EmergencyFixDashboard /> : <DialTestComponent />}
      </div>
    </AccessibilityEnhancements>
  )
}

export default App
