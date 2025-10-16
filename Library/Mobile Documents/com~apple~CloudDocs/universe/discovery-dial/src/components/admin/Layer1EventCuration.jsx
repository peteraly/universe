import React, { useState, useCallback } from 'react'
import CleanEventTable from './CleanEventTable'
import EventEditModal from './EventEditModal'
import { parseEvents, exportToCSV } from '../../utils/eventParser'

const Layer1EventCuration = ({ events, onEventsUpdate, onEdit, onDelete, onBulkAction }) => {
  const [url, setUrl] = useState('')
  const [isParsing, setIsParsing] = useState(false)
  const [parsingProgress, setParsingProgress] = useState(0)
  const [toasts, setToasts] = useState([])

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
  const handleParse = async () => {
    if (!url.trim()) return
    
    setIsParsing(true)
    setParsingProgress(0)
    
    try {
      const newEvents = await parseEvents(url.trim(), (progress) => {
        setParsingProgress(progress)
      })
      
      // Check for duplicates and add only new events
      const existingIds = new Set(events.map(event => event.id))
      const uniqueNewEvents = newEvents.filter(event => !existingIds.has(event.id))
      
      if (uniqueNewEvents.length > 0) {
        onEventsUpdate([...events, ...uniqueNewEvents])
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
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleParse()
    }
  }

  const handleExportCSV = () => {
    exportToCSV(events)
    showToast('success', 'Export Complete', 'Events exported to CSV file')
  }

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Event Curation Hub</h2>
          <p className="text-gray-600">Parse and manage events from venue websites</p>
        </div>

        {/* URL Parser Card */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <div className="flex items-center space-x-4">
            {/* URL Input */}
            <div className="flex-1">
              <input
                type="url"
                placeholder="Enter venue website URL (e.g., https://thingstododc.com/)"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyPress={handleKeyPress}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={isParsing}
              />
            </div>

            {/* Parse Button */}
            <button
              onClick={handleParse}
              disabled={!url.trim() || isParsing}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {isParsing ? 'Parsing...' : 'Parse Events'}
            </button>

            {/* Export Button */}
            <button
              onClick={handleExportCSV}
              className="px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
            >
              Export CSV
            </button>
          </div>

          {/* Progress Bar */}
          {isParsing && (
            <div className="mt-4">
              <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                <span>Parsing events...</span>
                <span>{parsingProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${parsingProgress}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* Quick URL Suggestions */}
          <div className="mt-4">
            <p className="text-sm text-gray-500 mb-2">Quick start:</p>
            <div className="flex flex-wrap gap-2">
              {[
                'https://thingstododc.com/',
                'https://www.eventbrite.com/d/dc--washington/',
                'https://www.meetup.com/find/events/?location=us--dc--washington'
              ].map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => setUrl(suggestion)}
                  className="px-3 py-1 bg-gray-100 text-gray-700 rounded text-sm hover:bg-gray-200 transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Events Table */}
        <CleanEventTable
          events={events}
          onEdit={onEdit}
          onDelete={onDelete}
          onBulkAction={onBulkAction}
        />
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
    </div>
  )
}

export default Layer1EventCuration


