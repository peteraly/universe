import React, { useState, useMemo } from 'react'

const DataGrid = ({
  events,
  isLoading,
  onEventSelect,
  onBulkAction,
  currentPage,
  itemsPerPage,
  onPageChange,
  canEdit,
  canDelete,
  userRole
}) => {
  const [selectedEvents, setSelectedEvents] = useState(new Set())
  const [searchTerm, setSearchTerm] = useState('')

  const filteredEvents = useMemo(() => {
    if (!searchTerm) return events
    return events.filter(event =>
      event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.venue.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [events, searchTerm])

  const handleSelectEvent = (eventId) => {
    const newSelected = new Set(selectedEvents)
    if (newSelected.has(eventId)) {
      newSelected.delete(eventId)
    } else {
      newSelected.add(eventId)
    }
    setSelectedEvents(newSelected)
  }

  const handleSelectAll = () => {
    if (selectedEvents.size === filteredEvents.length) {
      setSelectedEvents(new Set())
    } else {
      setSelectedEvents(new Set(filteredEvents.map(e => e.id)))
    }
  }

  const handleBulkAction = (action) => {
    if (selectedEvents.size === 0) return
    onBulkAction(action, Array.from(selectedEvents))
    setSelectedEvents(new Set())
  }

  const getConfidenceColor = (confidence) => {
    if (confidence < 60) return 'text-red-600 bg-red-100'
    if (confidence < 80) return 'text-yellow-600 bg-yellow-100'
    return 'text-green-600 bg-green-100'
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'text-yellow-600 bg-yellow-100'
      case 'approved': return 'text-green-600 bg-green-100'
      case 'rejected': return 'text-red-600 bg-red-100'
      case 'archived': return 'text-gray-600 bg-gray-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow">
        <div className="p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading events...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-900">Events Data Grid</h3>
          <div className="flex items-center space-x-4">
            <input
              type="text"
              placeholder="Search events..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-64"
            />
            {selectedEvents.size > 0 && (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">
                  {selectedEvents.size} selected
                </span>
                <button
                  onClick={() => handleBulkAction('approve')}
                  className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                >
                  Approve
                </button>
                <button
                  onClick={() => handleBulkAction('reject')}
                  className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                >
                  Reject
                </button>
                <button
                  onClick={() => handleBulkAction('archive')}
                  className="bg-gray-600 text-white px-3 py-1 rounded text-sm hover:bg-gray-700"
                >
                  Archive
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left">
                <input
                  type="checkbox"
                  checked={selectedEvents.size === filteredEvents.length && filteredEvents.length > 0}
                  onChange={handleSelectAll}
                  className="rounded border-gray-300"
                />
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Event
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Confidence
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Category
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredEvents.map((event) => (
              <tr
                key={event.id}
                className={`hover:bg-gray-50 cursor-pointer ${
                  selectedEvents.has(event.id) ? 'bg-blue-50' : ''
                }`}
                onClick={() => onEventSelect(event)}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <input
                    type="checkbox"
                    checked={selectedEvents.has(event.id)}
                    onChange={(e) => {
                      e.stopPropagation()
                      handleSelectEvent(event.id)
                    }}
                    className="rounded border-gray-300"
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900 max-w-xs truncate">
                    {event.name}
                  </div>
                  <div className="text-sm text-gray-500 max-w-xs truncate">
                    {event.venue}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getConfidenceColor(event.confidence)}`}>
                    {event.confidence}%
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(event.status)}`}>
                    {event.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {event.category}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {event.date} {event.time}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    {canEdit && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          onEventSelect(event)
                        }}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Edit
                      </button>
                    )}
                    {canDelete && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          // Handle delete
                        }}
                        className="text-red-600 hover:text-red-900"
                      >
                        Archive
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="px-6 py-4 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing {filteredEvents.length} of {filteredEvents.length} events
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="px-3 py-1 text-sm">
              Page {currentPage}
            </span>
            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={filteredEvents.length < itemsPerPage}
              className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DataGrid
