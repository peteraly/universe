import React, { useState, useEffect } from 'react'
import MissionControlHeader from './MissionControlHeader'
import CoreMetricsColumn from './CoreMetricsColumn'
import DataPipelineColumn from './DataPipelineColumn'
import SystemHealthColumn from './SystemHealthColumn'
import { Toast } from './LoadingStates'

const MissionControlDashboard = () => {
  const [currentTab, setCurrentTab] = useState('dashboard')
  const [userRole, setUserRole] = useState('cto')
  const [toasts, setToasts] = useState([])

  // Mock data - in real app, this would come from APIs
  const [metrics, setMetrics] = useState({
    totalEvents: 2247,
    activeVenues: 3,
    maxVenues: 5,
    venueCapacity: 60,
    discoveryRatio: 1.5,
    activeEvents: 847
  })

  const [pipelineData, setPipelineData] = useState({
    lastRun: '45 minutes ago',
    nextRun: '15 minutes',
    eventsProcessed: 2247,
    status: 'complete'
  })

  const [systemData, setSystemData] = useState({
    dbResponse: '45ms',
    storageUsage: 90,
    apiUptime: '99.9%'
  })

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      // Update metrics with small random changes
      setMetrics(prev => ({
        ...prev,
        totalEvents: prev.totalEvents + Math.floor(Math.random() * 3),
        activeEvents: prev.activeEvents + Math.floor(Math.random() * 2) - 1
      }))

      // Update pipeline data
      setPipelineData(prev => ({
        ...prev,
        eventsProcessed: prev.eventsProcessed + Math.floor(Math.random() * 5)
      }))
    }, 30000) // Update every 30 seconds

    return () => clearInterval(interval)
  }, [])

  const showToast = (type, title, message) => {
    const id = Date.now()
    setToasts(prev => [...prev, { id, type, title, message }])
  }

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }

  const handleAction = (action) => {
    switch (action) {
      case 'addEvent':
        showToast('info', 'Add Event', 'Opening event creation form...')
        break
      case 'viewReports':
        showToast('info', 'Reports', 'Loading comprehensive reports...')
        break
      case 'syncComplete':
        showToast('success', 'Sync Complete', 'Manual sync completed successfully!')
        break
      case 'viewPipelineDetails':
        showToast('info', 'Pipeline Details', 'Opening detailed pipeline view...')
        break
      case 'viewHealthDetails':
        showToast('info', 'Health Details', 'Loading detailed health metrics...')
        break
      default:
        console.log('Action:', action)
    }
  }

  const handleNavigate = (path) => {
    // Extract tab from path
    const tab = path.split('/').pop() || 'dashboard'
    setCurrentTab(tab)
    
    // In a real app, you'd use React Router here
    window.history.pushState({}, '', path)
  }

  const handleRoleChange = (newRole) => {
    setUserRole(newRole)
    showToast('info', 'Role Changed', `Switched to ${newRole.toUpperCase()} role`)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Import design tokens */}
      <style>{`
        @import url('../styles/design-tokens.css');
      `}</style>

      {/* Mission Control Header */}
      <MissionControlHeader
        userRole={userRole}
        onRoleChange={handleRoleChange}
        onNavigate={handleNavigate}
        currentTab={currentTab}
      />

      {/* Main Content - 3 Column Grid */}
      <main className="container mx-auto px-4 py-6">
        <div className="dashboard-grid grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Column 1: Core Metrics */}
          <div className="lg:col-span-1">
            <CoreMetricsColumn metrics={metrics} />
          </div>

          {/* Column 2: Data Pipeline & Content */}
          <div className="lg:col-span-1">
            <DataPipelineColumn 
              pipelineData={pipelineData} 
              onAction={handleAction}
            />
          </div>

          {/* Column 3: System Health & Activity */}
          <div className="lg:col-span-1">
            <SystemHealthColumn 
              systemData={systemData} 
              onAction={handleAction}
            />
          </div>
        </div>
      </main>

      {/* Toast Notifications */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {toasts.map(toast => (
          <Toast
            key={toast.id}
            type={toast.type}
            title={toast.title}
            message={toast.message}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </div>

      {/* Custom CSS for responsive grid */}
      <style jsx>{`
        .dashboard-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 24px;
        }

        @media (min-width: 768px) {
          .dashboard-grid {
            grid-template-columns: 1fr 1fr;
            gap: 20px;
          }
        }

        @media (min-width: 1024px) {
          .dashboard-grid {
            grid-template-columns: 1fr 1fr 1fr;
            gap: 24px;
          }
        }

        /* Ensure equal height columns */
        .dashboard-grid > div {
          display: flex;
          flex-direction: column;
        }

        .dashboard-grid > div > div {
          flex: 1;
        }
      `}</style>
    </div>
  )
}

export default MissionControlDashboard
