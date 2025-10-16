import React, { useState, useEffect } from 'react'
import DataGrid from '../components/DataGrid'
import AlgorithmicPreview from '../components/AlgorithmicPreview'

const EventCurationHub = ({ userRole }) => {
  const [events, setEvents] = useState([])
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(50)
  const [sortBy, setSortBy] = useState('confidence')
  const [sortOrder, setSortOrder] = useState('asc')
  const [filterStatus, setFilterStatus] = useState('all')

  useEffect(() => {
    loadEvents()
  }, [currentPage, sortBy, sortOrder, filterStatus])

  const loadEvents = async () => {
    setIsLoading(true)
    // Simulate API call with server-side pagination
    const mockEvents = generateMockEvents()
    
    // Sort by confidence score (lowest first for priority)
    const sortedEvents = mockEvents.sort((a, b) => {
      if (sortBy === 'confidence') {
        return sortOrder === 'asc' ? a.confidence - b.confidence : b.confidence - a.confidence
      }
      return 0
    })

    // Filter by status
    const filteredEvents = filterStatus === 'all' 
      ? sortedEvents 
      : sortedEvents.filter(event => event.status === filterStatus)

    // Simulate pagination
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    const paginatedEvents = filteredEvents.slice(startIndex, endIndex)

    setTimeout(() => {
      setEvents(paginatedEvents)
      setIsLoading(false)
    }, 500)
  }

  const generateMockEvents = () => {
    const categories = ['Social/Fun', 'Professional', 'Arts/Culture', 'Sports', 'Food', 'Music']
    const statuses = ['pending', 'approved', 'rejected', 'archived']
    const events = []

    for (let i = 1; i <= 1000; i++) {
      events.push({
        id: i,
        name: `Event ${i}: ${categories[Math.floor(Math.random() * categories.length)]} Experience`,
        category: categories[Math.floor(Math.random() * categories.length)],
        date: new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        time: `${Math.floor(Math.random() * 12) + 1}:${Math.floor(Math.random() * 4) * 15} ${Math.random() > 0.5 ? 'AM' : 'PM'}`,
        venue: `Venue ${Math.floor(Math.random() * 50) + 1}`,
        price: Math.random() > 0.5 ? 'Free' : `$${Math.floor(Math.random() * 50) + 10}`,
        status: statuses[Math.floor(Math.random() * statuses.length)],
        confidence: Math.floor(Math.random() * 100), // AI confidence score
        tags: ['tag1', 'tag2', 'tag3'].slice(0, Math.floor(Math.random() * 3) + 1),
        description: `This is a detailed description for event ${i} that provides context and information.`,
        createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString()
      })
    }
    return events
  }

  const handleEventSelect = (event) => {
    setSelectedEvent(event)
  }

  const handleEventUpdate = (updatedEvent) => {
    setEvents(events.map(event => 
      event.id === updatedEvent.id ? updatedEvent : event
    ))
    setSelectedEvent(updatedEvent)
  }

  const handleBulkAction = (action, eventIds) => {
    console.log(`Bulk ${action} for events:`, eventIds)
    // Implement bulk actions
  }

  const canEdit = ['admin', 'curator'].includes(userRole)
  const canDelete = ['admin'].includes(userRole)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Event Curation Hub</h2>
          <p className="text-gray-600">High-density data grid with AI confidence prioritization</p>
        </div>
        <div className="flex items-center space-x-4">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="archived">Archived</option>
          </select>
          <select
            value={`${sortBy}-${sortOrder}`}
            onChange={(e) => {
              const [field, order] = e.target.value.split('-')
              setSortBy(field)
              setSortOrder(order)
            }}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
          >
            <option value="confidence-asc">Confidence (Low to High)</option>
            <option value="confidence-desc">Confidence (High to Low)</option>
            <option value="date-asc">Date (Oldest First)</option>
            <option value="date-desc">Date (Newest First)</option>
          </select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Low Confidence</p>
              <p className="text-xl font-semibold text-gray-900">
                {events.filter(e => e.confidence < 60).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <svg className="w-5 h-5 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Medium Confidence</p>
              <p className="text-xl font-semibold text-gray-900">
                {events.filter(e => e.confidence >= 60 && e.confidence < 80).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">High Confidence</p>
              <p className="text-xl font-semibold text-gray-900">
                {events.filter(e => e.confidence >= 80).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Total Events</p>
              <p className="text-xl font-semibold text-gray-900">{events.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Data Grid */}
        <div className="lg:col-span-2">
          <DataGrid
            events={events}
            isLoading={isLoading}
            onEventSelect={handleEventSelect}
            onBulkAction={handleBulkAction}
            currentPage={currentPage}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
            canEdit={canEdit}
            canDelete={canDelete}
            userRole={userRole}
          />
        </div>

        {/* Algorithmic Preview Panel */}
        <div className="lg:col-span-1">
          <AlgorithmicPreview
            event={selectedEvent}
            onEventUpdate={handleEventUpdate}
            userRole={userRole}
          />
        </div>
      </div>
    </div>
  )
}

export default EventCurationHub


