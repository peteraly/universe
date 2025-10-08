import React from 'react'
import DiscoveryDial from './components/DiscoveryDial.jsx'
import AccessibilityEnhancements from './components/AccessibilityEnhancements.jsx'
import './App.css'

function App() {
  return (
    <AccessibilityEnhancements>
      <div className="App">
        <DiscoveryDial />
      </div>
    </AccessibilityEnhancements>
  )
}

export default App
