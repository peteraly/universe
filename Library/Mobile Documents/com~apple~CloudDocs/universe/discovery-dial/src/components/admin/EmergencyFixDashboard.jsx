import React, { useState, useEffect, useCallback } from 'react'
import EmergencyFixSidebar from './EmergencyFixSidebar'
import EmergencyFixEventCuration from './EmergencyFixEventCuration'
import EmergencyFixSystemHealth from './EmergencyFixSystemHealth'
import EmergencyFixConfiguration from './EmergencyFixConfiguration'
import EmergencyFixIntelligence from './EmergencyFixIntelligence'
import EventEditModal from './EventEditModal'

const EmergencyFixDashboard = () => {
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
          // Simulate checking for new events
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

  const handleDeleteEvent = useCallback((eventId) => {
    setEvents(prev => prev.filter(event => event.id !== eventId))
  }, [])

  const handleBulkAction = useCallback((action, selectedIds) => {
    switch (action) {
      case 'delete':
        setEvents(prev => prev.filter(event => !selectedIds.includes(event.id)))
        break
      case 'publish':
        setEvents(prev => prev.map(event => 
          selectedIds.includes(event.id) 
            ? { ...event, status: 'published' }
            : event
        ))
        break
      case 'unpublish':
        setEvents(prev => prev.map(event => 
          selectedIds.includes(event.id) 
            ? { ...event, status: 'draft' }
            : event
        ))
        break
      default:
        break
    }
  }, [])

  const handleConfigUpdate = useCallback((newConfig) => {
    setConfig(newConfig)
  }, [])

  const handleSaveEvent = useCallback((updatedEvent) => {
    setEvents(prev => prev.map(event => 
      event.id === updatedEvent.id ? updatedEvent : event
    ))
    setEditingEvent(null)
  }, [])

  const handleCloseModal = useCallback(() => {
    setEditingEvent(null)
  }, [])

  // Render the appropriate layer component
  const renderLayerContent = () => {
    switch (currentLayer) {
      case 'Layer1':
        return (
          <EmergencyFixEventCuration
            events={events}
            onEventsUpdate={handleEventsUpdate}
            onEdit={handleEditEvent}
            onDelete={handleDeleteEvent}
            onBulkAction={handleBulkAction}
          />
        )
      case 'Layer2':
        return <EmergencyFixSystemHealth />
      case 'Layer3':
        return (
          <EmergencyFixConfiguration
            config={config}
            onConfigUpdate={handleConfigUpdate}
          />
        )
      case 'Layer4':
        return <EmergencyFixIntelligence />
      default:
        return (
          <EmergencyFixEventCuration
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
    <div className="min-h-screen bg-white flex">
      {/* Fixed Left Sidebar */}
      <EmergencyFixSidebar
        currentLayer={currentLayer}
        onNavigate={setCurrentLayer}
      />

      {/* Main Content Area - Pure White */}
      <div className="flex-1 ml-64">
        {renderLayerContent()}
      </div>

      {/* Event Edit Modal */}
      {editingEvent && (
        <EventEditModal
          event={editingEvent}
          onSave={handleSaveEvent}
          onClose={handleCloseModal}
        />
      )}
    </div>
  )
}

export default EmergencyFixDashboard


