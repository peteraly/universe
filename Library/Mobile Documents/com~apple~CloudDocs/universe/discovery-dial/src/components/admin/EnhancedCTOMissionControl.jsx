import React, { useState, useEffect } from 'react'
import EnhancedHeader from './EnhancedHeader'
import EnhancedDashboard from './EnhancedDashboard'
import EnhancedDataTable from './EnhancedDataTable'
import EnhancedModal, { EnhancedFormModal, ConfirmationModal } from './EnhancedModal'
import { LoadingOverlay, EmptyState, Toast } from './LoadingStates'

const EnhancedCTOMissionControl = () => {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [userRole, setUserRole] = useState('cto')
  const [loading, setLoading] = useState(false)
  const [toasts, setToasts] = useState([])
  const [metrics, setMetrics] = useState({
    totalEvents: 1247,
    activeVenues: 89,
    systemHealth: 98,
    pipelineStatus: 'Running'
  })

  // Mock data for demonstration
  const [events, setEvents] = useState([])
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [showEventModal, setShowEventModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [eventToDelete, setEventToDelete] = useState(null)

  useEffect(() => {
    loadEvents()
  }, [])

  const loadEvents = async () => {
    setLoading(true)
    // Simulate API call
    setTimeout(() => {
      const mockEvents = Array.from({ length: 50 }, (_, i) => ({
        id: `event-${i + 1}`,
        name: `Event ${i + 1}: ${['Concert', 'Workshop', 'Festival', 'Meetup', 'Conference'][i % 5]}`,
        category: ['Music', 'Tech', 'Art', 'Social', 'Business'][i % 5],
        venue: `Venue ${i % 10 + 1}`,
        date: new Date(Date.now() + i * 24 * 60 * 60 * 1000).toISOString(),
        status: ['active', 'inactive', 'pending'][i % 3],
        aiConfidence: Math.floor(Math.random() * 100),
        tags: [`tag${i % 3}`, `tag${(i + 1) % 3}`]
      }))
      setEvents(mockEvents)
      setLoading(false)
    }, 1000)
  }

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
        setSelectedEvent(null)
        setShowEventModal(true)
        break
      case 'runPipeline':
        showToast('info', 'Pipeline Started', 'Data pipeline has been triggered successfully')
        break
      case 'systemCheck':
        showToast('info', 'System Check', 'Running comprehensive system diagnostics...')
        break
      case 'viewReports':
        setActiveTab('reports')
        break
      case 'viewPipeline':
        setActiveTab('pipeline')
        break
      case 'viewHealth':
        setActiveTab('health')
        break
      default:
        console.log('Action:', action)
    }
  }

  const handleEditEvent = (event) => {
    setSelectedEvent(event)
    setShowEventModal(true)
  }

  const handleDeleteEvent = (event) => {
    setEventToDelete(event)
    setShowDeleteModal(true)
  }

  const confirmDeleteEvent = () => {
    if (eventToDelete) {
      setEvents(prev => prev.filter(e => e.id !== eventToDelete.id))
      showToast('success', 'Event Deleted', `${eventToDelete.name} has been deleted successfully`)
      setShowDeleteModal(false)
      setEventToDelete(null)
    }
  }

  const handleSaveEvent = (formData) => {
    if (selectedEvent) {
      // Update existing event
      setEvents(prev => prev.map(e => e.id === selectedEvent.id ? { ...e, ...formData } : e))
      showToast('success', 'Event Updated', `${formData.name} has been updated successfully`)
    } else {
      // Create new event
      const newEvent = {
        id: `event-${Date.now()}`,
        ...formData,
        status: 'active',
        aiConfidence: Math.floor(Math.random() * 100)
      }
      setEvents(prev => [newEvent, ...prev])
      showToast('success', 'Event Created', `${formData.name} has been created successfully`)
    }
    setShowEventModal(false)
    setSelectedEvent(null)
  }

  const eventColumns = [
    { key: 'name', label: 'Event Name', type: 'text' },
    { key: 'category', label: 'Category', type: 'text' },
    { key: 'venue', label: 'Venue', type: 'text' },
    { key: 'date', label: 'Date', type: 'date' },
    { key: 'status', label: 'Status', type: 'status' },
    { key: 'aiConfidence', label: 'AI Confidence', type: 'text' }
  ]

  const eventFormFields = [
    {
      name: 'name',
      label: 'Event Name',
      type: 'text',
      required: true,
      placeholder: 'Enter event name'
    },
    {
      name: 'category',
      label: 'Category',
      type: 'select',
      required: true,
      options: [
        { value: 'Music', label: 'Music' },
        { value: 'Tech', label: 'Technology' },
        { value: 'Art', label: 'Art' },
        { value: 'Social', label: 'Social' },
        { value: 'Business', label: 'Business' }
      ]
    },
    {
      name: 'venue',
      label: 'Venue',
      type: 'text',
      required: true,
      placeholder: 'Enter venue name'
    },
    {
      name: 'date',
      label: 'Event Date',
      type: 'datetime-local',
      required: true
    },
    {
      name: 'description',
      label: 'Description',
      type: 'textarea',
      rows: 4,
      placeholder: 'Enter event description'
    }
  ]

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <EnhancedDashboard 
            metrics={metrics} 
            onAction={handleAction}
          />
        )
      
      case 'events':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Event Management</h2>
                <p className="text-gray-600">Manage and curate events in your system</p>
              </div>
              <button
                onClick={() => handleAction('addEvent')}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center space-x-2"
              >
                <span>➕</span>
                <span>Add Event</span>
              </button>
            </div>

            <LoadingOverlay loading={loading}>
              <EnhancedDataTable
                data={events}
                columns={eventColumns}
                onEdit={handleEditEvent}
                onDelete={handleDeleteEvent}
                loading={loading}
                selectable={true}
                searchable={true}
                pagination={true}
                pageSize={10}
              />
            </LoadingOverlay>
          </div>
        )

      case 'health':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">System Health</h2>
              <p className="text-gray-600">Monitor system performance and health metrics</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">API Health</h3>
                  <span className="text-green-600 text-2xl">✅</span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Response Time</span>
                    <span className="font-medium">45ms</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Uptime</span>
                    <span className="font-medium">99.9%</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Database</h3>
                  <span className="text-green-600 text-2xl">✅</span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Connections</span>
                    <span className="font-medium">12/50</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Query Time</span>
                    <span className="font-medium">2.3ms</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Storage</h3>
                  <span className="text-yellow-600 text-2xl">⚠️</span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Used</span>
                    <span className="font-medium">78%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Available</span>
                    <span className="font-medium">2.1GB</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )

      case 'pipeline':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Data Pipeline</h2>
              <p className="text-gray-600">Monitor and manage the automated data pipeline</p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Pipeline Status</h3>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                  Running
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Recent Runs</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="text-sm font-medium">Full Sync</p>
                        <p className="text-xs text-gray-500">2 hours ago</p>
                      </div>
                      <span className="text-green-600 text-sm">✅ Success</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="text-sm font-medium">Incremental</p>
                        <p className="text-xs text-gray-500">4 hours ago</p>
                      </div>
                      <span className="text-green-600 text-sm">✅ Success</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Statistics</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Events Processed</span>
                      <span className="font-medium">1,247</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Success Rate</span>
                      <span className="font-medium">98.5%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Avg Processing Time</span>
                      <span className="font-medium">2.3s</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )

      default:
        return (
          <EmptyState
            icon="🚀"
            title="Welcome to Mission Control"
            description="Select a tab from the navigation to get started with managing your Discovery Dial system."
          />
        )
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Import design tokens */}
      <style>{`
        @import url('./styles/design-tokens.css');
      `}</style>

      {/* Enhanced Header */}
      <EnhancedHeader
        userRole={userRole}
        onRoleChange={setUserRole}
        onNavigate={setActiveTab}
      />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        {renderContent()}
      </main>

      {/* Event Form Modal */}
      <EnhancedFormModal
        isOpen={showEventModal}
        onClose={() => {
          setShowEventModal(false)
          setSelectedEvent(null)
        }}
        onSubmit={handleSaveEvent}
        title={selectedEvent ? 'Edit Event' : 'Add New Event'}
        fields={eventFormFields}
        initialData={selectedEvent || {}}
        submitText={selectedEvent ? 'Update Event' : 'Create Event'}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false)
          setEventToDelete(null)
        }}
        onConfirm={confirmDeleteEvent}
        title="Delete Event"
        message={`Are you sure you want to delete "${eventToDelete?.name}"? This action cannot be undone.`}
        type="danger"
        confirmText="Delete Event"
      />

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
    </div>
  )
}

export default EnhancedCTOMissionControl
