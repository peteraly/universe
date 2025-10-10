import React, { useState, useEffect, useCallback } from 'react'
import ProfessionalSidebar from './ProfessionalSidebar'
import Layer1EventCuration from './Layer1EventCuration'
import Layer2SystemHealth from './Layer2SystemHealth'
import Layer3Configuration from './Layer3Configuration'
import Layer4Intelligence from './Layer4Intelligence'
import EventEditModal from './EventEditModal'

const ProfessionalAdminDashboard = () => {
  const [currentLayer, setCurrentLayer] = useState('Layer1') // Default to Event Curation
  const [events, setEvents] = useState([])
  const [config, setConfig] = useState({
    autoRefresh: false,
    refreshInterval: 6,
    maxEventsPerPage: 20,
    enableNotifications: true,
    enableAutoPublish: false,
    aiConfidenceThreshold: 85
  })
  const [editingEvent, setEditingEvent] = useState(null)

  // Load data from localStorage on mount
  useEffect(() => {
    const savedEvents = localStorage.getItem('admin-events')
    const savedConfig = localStorage.getItem('admin-config')
    
    if (savedEvents) {
      setEvents(JSON.parse(savedEvents))
    }
    if (savedConfig) {
      setConfig(JSON.parse(savedConfig))
    }
  }, [])

  // Save data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('admin-events', JSON.stringify(events))
  }, [events])

  useEffect(() => {
    localStorage.setItem('admin-config', JSON.stringify(config))
  }, [config])

  // Auto-refresh functionality
  useEffect(() => {
    if (!config.autoRefresh) return

    const interval = setInterval(async () => {
      try {
        // Check for new events from the last parsed URL
        const lastUrl = localStorage.getItem('last-parsed-url')
        if (lastUrl) {
          // In a real implementation, this would check for new events
          console.log('Auto-refresh: Checking for new events...')
        }
      } catch (error) {
        console.error('Auto-refresh error:', error)
      }
    }, config.refreshInterval * 60 * 60 * 1000) // Convert hours to milliseconds

    return () => clearInterval(interval)
  }, [config.autoRefresh, config.refreshInterval])

  // Event management functions
  const handleEventsUpdate = useCallback((newEvents) => {
    setEvents(newEvents)
  }, [])

  const handleEditEvent = useCallback((event) => {
    setEditingEvent(event)
  }, [])

  const handleSaveEvent = useCallback((updatedEvent) => {
    setEvents(prev => prev.map(event => 
      event.id === updatedEvent.id ? updatedEvent : event
    ))
    setEditingEvent(null)
  }, [])

  const handleDeleteEvent = useCallback((eventToDelete) => {
    setEvents(prev => prev.filter(event => event.id !== eventToDelete.id))
  }, [])

  const handleBulkAction = useCallback((action, eventIds) => {
    if (action === 'delete') {
      setEvents(prev => prev.filter(event => !eventIds.includes(event.id)))
    } else if (action === 'archive') {
      setEvents(prev => prev.map(event => 
        eventIds.includes(event.id) ? { ...event, status: 'archived' } : event
      ))
    }
  }, [])

  const handleConfigUpdate = useCallback((newConfig) => {
    setConfig(newConfig)
  }, [])

  // Render current layer
  const renderCurrentLayer = () => {
    switch (currentLayer) {
      case 'Layer1':
        return (
          <Layer1EventCuration
            events={events}
            onEventsUpdate={handleEventsUpdate}
            onEdit={handleEditEvent}
            onDelete={handleDeleteEvent}
            onBulkAction={handleBulkAction}
          />
        )
      case 'Layer2':
        return <Layer2SystemHealth />
      case 'Layer3':
        return (
          <Layer3Configuration
            config={config}
            onConfigUpdate={handleConfigUpdate}
          />
        )
      case 'Layer4':
        return <Layer4Intelligence />
      default:
        return (
          <Layer1EventCuration
            events={events}
            onEventsUpdate={handleEventsUpdate}
            onEdit={handleEditEvent}
            onDelete={handleDeleteEvent}
            onBulkAction={handleBulkAction}
          />
        )
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Fixed Sidebar */}
      <ProfessionalSidebar 
        currentLayer={currentLayer}
        onNavigate={setCurrentLayer}
      />

      {/* Main Content Area */}
      <div className="ml-64">
        {/* Layer Content */}
        {renderCurrentLayer()}
      </div>

      {/* Edit Modal */}
      <EventEditModal
        event={editingEvent}
        isOpen={!!editingEvent}
        onClose={() => setEditingEvent(null)}
        onSave={handleSaveEvent}
      />
    </div>
  )
}

export default ProfessionalAdminDashboard
