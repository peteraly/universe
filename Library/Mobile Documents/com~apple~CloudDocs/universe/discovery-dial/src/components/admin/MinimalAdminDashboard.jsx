import React, { useState, useEffect, useCallback } from 'react'
import URLParser from './URLParser'
import CleanEventTable from './CleanEventTable'
import EventEditModal from './EventEditModal'
import { parseEvents, checkForNewEvents, exportToCSV } from '../../utils/eventParser'

const MinimalAdminDashboard = () => {
  const [events, setEvents] = useState([])
  const [isParsing, setIsParsing] = useState(false)
  const [parsingProgress, setParsingProgress] = useState(0)
  const [isAutoRefresh, setIsAutoRefresh] = useState(false)
  const [editingEvent, setEditingEvent] = useState(null)
  const [toasts, setToasts] = useState([])

  // Load events from localStorage on mount
  useEffect(() => {
    const savedEvents = localStorage.getItem('admin-events')
    if (savedEvents) {
      setEvents(JSON.parse(savedEvents))
    }
  }, [])

  // Save events to localStorage whenever events change
  useEffect(() => {
    localStorage.setItem('admin-events', JSON.stringify(events))
  }, [events])

  // Auto-refresh functionality
  useEffect(() => {
    if (!isAutoRefresh) return

    const interval = setInterval(async () => {
      try {
        // Check for new events from the last parsed URL
        const lastUrl = localStorage.getItem('last-parsed-url')
        if (lastUrl) {
          const newEvents = await checkForNewEvents(lastUrl, events)
          if (newEvents.length > 0) {
            setEvents(prev => [...prev, ...newEvents])
            showToast('success', 'New Events Found', `${newEvents.length} new events added automatically`)
          }
        }
      } catch (error) {
        console.error('Auto-refresh error:', error)
      }
    }, 6 * 60 * 60 * 1000) // Check every 6 hours

    return () => clearInterval(interval)
  }, [isAutoRefresh, events])

  // Toast management
  const showToast = useCallback((type, title, message) => {
    const id = Date.now()
    setToasts(prev => [...prev, { id, type, title, message }])
    setTimeout(() => removeToast(id), 5000)
  }, [])

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }, [])

  // Parse events from URL
  const handleParse = useCallback(async (url) => {
    setIsParsing(true)
    setParsingProgress(0)
    
    try {
      // Save the URL for auto-refresh
      localStorage.setItem('last-parsed-url', url)
      
      const newEvents = await parseEvents(url, (progress) => {
        setParsingProgress(progress)
      })
      
      // Check for duplicates and add only new events
      const existingIds = new Set(events.map(event => event.id))
      const uniqueNewEvents = newEvents.filter(event => !existingIds.has(event.id))
      
      if (uniqueNewEvents.length > 0) {
        setEvents(prev => [...prev, ...uniqueNewEvents])
        showToast('success', 'Events Parsed', `Successfully parsed ${uniqueNewEvents.length} new events`)
      } else {
        showToast('info', 'No New Events', 'All events from this URL are already in the system')
      }
      
    } catch (error) {
      showToast('error', 'Parse Error', error.message)
    } finally {
      setIsParsing(false)
      setParsingProgress(0)
    }
  }, [events, showToast])

  // Toggle auto-refresh
  const handleAutoRefresh = useCallback(() => {
    setIsAutoRefresh(prev => !prev)
    showToast('info', 'Auto-Refresh', `Auto-refresh ${!isAutoRefresh ? 'enabled' : 'disabled'}`)
  }, [isAutoRefresh, showToast])

  // Edit event
  const handleEditEvent = useCallback((event) => {
    setEditingEvent(event)
  }, [])

  // Save edited event
  const handleSaveEvent = useCallback((updatedEvent) => {
    setEvents(prev => prev.map(event => 
      event.id === updatedEvent.id ? updatedEvent : event
    ))
    showToast('success', 'Event Updated', 'Event has been successfully updated')
  }, [showToast])

  // Delete event
  const handleDeleteEvent = useCallback((eventToDelete) => {
    setEvents(prev => prev.filter(event => event.id !== eventToDelete.id))
    showToast('warning', 'Event Deleted', `Deleted event: ${eventToDelete.title}`)
  }, [showToast])

  // Bulk actions
  const handleBulkAction = useCallback((action, eventIds) => {
    if (action === 'delete') {
      setEvents(prev => prev.filter(event => !eventIds.includes(event.id)))
      showToast('warning', 'Bulk Delete', `Deleted ${eventIds.length} events`)
    } else if (action === 'archive') {
      setEvents(prev => prev.map(event => 
        eventIds.includes(event.id) ? { ...event, status: 'archived' } : event
      ))
      showToast('success', 'Bulk Archive', `Archived ${eventIds.length} events`)
    }
  }, [showToast])

  // Export to CSV
  const handleExportCSV = useCallback(() => {
    exportToCSV(events)
    showToast('success', 'Export Complete', 'Events exported to CSV file')
  }, [events, showToast])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Event Management</h1>
              <p className="text-sm text-gray-500">Parse and manage events from venue websites</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <div className={`w-2 h-2 rounded-full ${isAutoRefresh ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                <span>{isAutoRefresh ? 'Auto-Refresh ON' : 'Auto-Refresh OFF'}</span>
              </div>
              <a 
                href="/" 
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
              >
                Back to Discovery Dial
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* URL Parser */}
        <URLParser
          onParse={handleParse}
          onAutoRefresh={handleAutoRefresh}
          isAutoRefresh={isAutoRefresh}
          isParsing={isParsing}
        />

        {/* Events Table */}
        <CleanEventTable
          events={events}
          onEdit={handleEditEvent}
          onDelete={handleDeleteEvent}
          onBulkAction={handleBulkAction}
        />
      </div>

      {/* Edit Modal */}
      <EventEditModal
        event={editingEvent}
        isOpen={!!editingEvent}
        onClose={() => setEditingEvent(null)}
        onSave={handleSaveEvent}
      />

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
    </div>
  )
}

export default MinimalAdminDashboard


