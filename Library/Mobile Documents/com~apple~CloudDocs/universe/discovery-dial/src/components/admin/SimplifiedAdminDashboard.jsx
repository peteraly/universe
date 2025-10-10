import React, { useState, useEffect, useCallback } from 'react'
import FixedSidebar from './FixedSidebar'
import QuickActionsBar from './QuickActionsBar'
import Layer4Intelligence from './Layer4Intelligence'
import Layer2Health from './Layer2Health'
import Layer3Config from './Layer3Config'
import Layer1Curation from './Layer1Curation'

const SimplifiedAdminDashboard = () => {
  const [currentLayer, setCurrentLayer] = useState('Layer4') // Default to Intelligence
  const [isFrozen, setIsFrozen] = useState(false)
  const [toasts, setToasts] = useState([])

  // Mock data - in real app, this would come from Discovery Dial APIs
  const [recommendations, setRecommendations] = useState([
    {
      id: 1,
      priority: 'P0',
      title: 'Critical: Data Pipeline Failure',
      rootCause: 'The normalization engine is failing on 15% of incoming events. Immediate attention required.',
      agentId: 'NORM-001',
      timestamp: '2 minutes ago',
      category: 'Data Quality'
    },
    {
      id: 2,
      priority: 'P1',
      title: 'Performance: API Response Time',
      rootCause: 'API response times have increased by 200ms over the last hour. Consider scaling resources.',
      agentId: 'PERF-002',
      timestamp: '15 minutes ago',
      category: 'Performance'
    },
    {
      id: 3,
      priority: 'P2',
      title: 'Enhancement: User Experience',
      rootCause: 'Consider adding keyboard shortcuts for power users to improve efficiency.',
      agentId: 'UX-003',
      timestamp: '1 hour ago',
      category: 'Enhancement'
    }
  ])

  const [events, setEvents] = useState([
    { id: 1, name: 'Summer Concert Series', category: 'Music', venue: 'Central Park', date: '2024-07-15', status: 'active' },
    { id: 2, name: 'Tech Workshop', category: 'Technology', venue: 'Innovation Hub', date: '2024-07-20', status: 'pending' },
    { id: 3, name: 'Art Exhibition', category: 'Art', venue: 'Gallery One', date: '2024-07-25', status: 'active' },
    { id: 4, name: 'Food Festival', category: 'Food', venue: 'Downtown Plaza', date: '2024-08-01', status: 'inactive' }
  ])

  const [healthData, setHealthData] = useState({
    overallHealth: 98,
    apiResponse: 45,
    storageUsage: 78,
    uptime: 99.9
  })

  const [config, setConfig] = useState({
    aiConfidenceThreshold: 85,
    autoSyncInterval: '15 minutes',
    maxEventsPerPage: 50,
    enableNotifications: true,
    enableAutoPublish: false
  })

  // Toast management
  const showToast = useCallback((type, title, message) => {
    const id = Date.now()
    setToasts(prev => [...prev, { id, type, title, message }])
    setTimeout(() => removeToast(id), 5000)
  }, [])

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }, [])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.ctrlKey || e.metaKey) return // Ignore modifier keys
      
      switch (e.key) {
        case '1':
          setCurrentLayer('Layer1')
          break
        case '2':
          setCurrentLayer('Layer2')
          break
        case '3':
          setCurrentLayer('Layer3')
          break
        case '4':
          setCurrentLayer('Layer4')
          break
        case 'a':
          if (currentLayer === 'Layer4') {
            handleBulkApprove()
          }
          break
        case 'r':
          if (currentLayer === 'Layer4') {
            handleBulkReject()
          }
          break
        case 'f':
          handleFreezeToggle()
          break
        case 'e':
          handleExport()
          break
        default:
          break
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [currentLayer])

  // Action handlers
  const handleRecommendationApprove = useCallback((recommendation) => {
    setRecommendations(prev => prev.filter(rec => rec.id !== recommendation.id))
    showToast('success', 'Approved', `Approved recommendation: ${recommendation.title}`)
  }, [showToast])

  const handleRecommendationReject = useCallback((recommendation) => {
    setRecommendations(prev => prev.filter(rec => rec.id !== recommendation.id))
    showToast('info', 'Rejected', `Rejected recommendation: ${recommendation.title}`)
  }, [showToast])

  const handleShowDetails = useCallback((recommendation) => {
    showToast('info', 'Details', `Showing details for: ${recommendation.title}`)
  }, [showToast])

  const handleBulkApprove = useCallback(() => {
    const p0Recommendations = recommendations.filter(rec => rec.priority === 'P0')
    setRecommendations(prev => prev.filter(rec => rec.priority !== 'P0'))
    showToast('success', 'Bulk Approved', `Approved ${p0Recommendations.length} P0 recommendations`)
  }, [recommendations, showToast])

  const handleBulkReject = useCallback(() => {
    const p2Recommendations = recommendations.filter(rec => rec.priority === 'P2')
    setRecommendations(prev => prev.filter(rec => rec.priority !== 'P2'))
    showToast('info', 'Bulk Rejected', `Rejected ${p2Recommendations.length} P2 recommendations`)
  }, [recommendations, showToast])

  const handleExport = useCallback(() => {
    showToast('success', 'Export', 'Data exported to Google Sheets successfully')
  }, [showToast])

  const handleFreezeToggle = useCallback(() => {
    setIsFrozen(prev => !prev)
    showToast('warning', 'System Status', `System ${isFrozen ? 'unfrozen' : 'frozen'}`)
  }, [isFrozen, showToast])

  const handleConfigSave = useCallback((newConfig) => {
    setConfig(newConfig)
    showToast('success', 'Configuration', 'Configuration saved successfully')
  }, [showToast])

  const handleEventEdit = useCallback((event) => {
    showToast('info', 'Edit Event', `Editing event: ${event.name}`)
  }, [showToast])

  const handleEventDelete = useCallback((event) => {
    setEvents(prev => prev.filter(e => e.id !== event.id))
    showToast('warning', 'Delete Event', `Deleted event: ${event.name}`)
  }, [showToast])

  const handleEventAdd = useCallback(() => {
    showToast('info', 'Add Event', 'Opening event creation form')
  }, [showToast])

  // Render current layer
  const renderCurrentLayer = () => {
    switch (currentLayer) {
      case 'Layer4':
        return (
          <Layer4Intelligence
            recommendations={recommendations}
            onApprove={handleRecommendationApprove}
            onReject={handleRecommendationReject}
            onShowDetails={handleShowDetails}
          />
        )
      case 'Layer2':
        return <Layer2Health healthData={healthData} />
      case 'Layer3':
        return <Layer3Config config={config} onSave={handleConfigSave} />
      case 'Layer1':
        return (
          <Layer1Curation
            events={events}
            onEdit={handleEventEdit}
            onDelete={handleEventDelete}
            onAdd={handleEventAdd}
          />
        )
      default:
        return (
          <Layer4Intelligence
            recommendations={recommendations}
            onApprove={handleRecommendationApprove}
            onReject={handleRecommendationReject}
            onShowDetails={handleShowDetails}
          />
        )
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Fixed Sidebar */}
      <FixedSidebar 
        currentLayer={currentLayer}
        onNavigate={setCurrentLayer}
      />

      {/* Main Content Area */}
      <div className="ml-64">
        {/* Quick Actions Bar */}
        <QuickActionsBar
          onBulkApprove={handleBulkApprove}
          onExport={handleExport}
          onFreeze={handleFreezeToggle}
          onUnfreeze={handleFreezeToggle}
          isFrozen={isFrozen}
        />

        {/* Layer Content */}
        {renderCurrentLayer()}
      </div>

      {/* Toast Notifications */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className="bg-white border border-gray-200 rounded-lg shadow-lg p-4 max-w-sm"
          >
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <span className="text-lg">
                  {toast.type === 'success' ? '✅' : 
                   toast.type === 'warning' ? '⚠️' : 
                   toast.type === 'error' ? '❌' : 'ℹ️'}
                </span>
              </div>
              <div className="ml-3 flex-1">
                <h4 className="text-sm font-medium text-gray-900">{toast.title}</h4>
                <p className="text-sm text-gray-500 mt-1">{toast.message}</p>
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="ml-4 text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Keyboard Shortcuts Help */}
      <div className="fixed bottom-4 right-4 z-40">
        <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3 text-xs text-gray-600">
          <div className="font-medium mb-1">Keyboard Shortcuts:</div>
          <div>1-4: Navigate layers</div>
          <div>A: Approve all P0</div>
          <div>R: Reject all P2</div>
          <div>F: Freeze/Unfreeze</div>
          <div>E: Export to Sheets</div>
        </div>
      </div>
    </div>
  )
}

export default SimplifiedAdminDashboard
