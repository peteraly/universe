import React, { useState, useEffect } from 'react'

const AlgorithmicPreview = ({ event, onEventUpdate, userRole }) => {
  const [isEditing, setIsEditing] = useState(false)
  const [editedEvent, setEditedEvent] = useState(null)

  useEffect(() => {
    if (event) {
      setEditedEvent({ ...event })
    }
  }, [event])

  const canEdit = ['admin', 'curator'].includes(userRole)

  const handleSave = () => {
    if (editedEvent && onEventUpdate) {
      onEventUpdate(editedEvent)
      setIsEditing(false)
    }
  }

  const handleCancel = () => {
    setEditedEvent({ ...event })
    setIsEditing(false)
  }

  const getConfidenceColor = (confidence) => {
    if (confidence < 60) return 'text-red-600'
    if (confidence < 80) return 'text-yellow-600'
    return 'text-green-600'
  }

  const getConfidenceBgColor = (confidence) => {
    if (confidence < 60) return 'bg-red-100'
    if (confidence < 80) return 'bg-yellow-100'
    return 'bg-green-100'
  }

  if (!event) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-center text-gray-500">
          <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Event Selected</h3>
          <p className="text-sm text-gray-500">Select an event from the data grid to view details and AI analysis</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-900">Algorithmic Preview</h3>
          {canEdit && (
            <div className="flex space-x-2">
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                >
                  Edit
                </button>
              ) : (
                <>
                  <button
                    onClick={handleSave}
                    className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                  >
                    Save
                  </button>
                  <button
                    onClick={handleCancel}
                    className="bg-gray-600 text-white px-3 py-1 rounded text-sm hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* 5-Orb Visualization */}
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-3">AI Confidence Analysis</h4>
          <div className="grid grid-cols-5 gap-3">
            {[
              { label: 'Content', value: event.confidence },
              { label: 'Category', value: Math.floor(event.confidence * 0.9) },
              { label: 'Venue', value: Math.floor(event.confidence * 0.85) },
              { label: 'Timing', value: Math.floor(event.confidence * 0.95) },
              { label: 'Quality', value: Math.floor(event.confidence * 0.88) }
            ].map((orb, index) => (
              <div key={index} className="text-center">
                <div className={`w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center text-white font-bold text-sm ${getConfidenceBgColor(orb.value)}`}>
                  <span className={getConfidenceColor(orb.value)}>{orb.value}%</span>
                </div>
                <p className="text-xs text-gray-600">{orb.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Event Details */}
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-3">Event Details</h4>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Event Name</label>
              {isEditing ? (
                <input
                  type="text"
                  value={editedEvent?.name || ''}
                  onChange={(e) => setEditedEvent({ ...editedEvent, name: e.target.value })}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                />
              ) : (
                <p className="text-sm text-gray-900">{event.name}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Category</label>
              {isEditing ? (
                <select
                  value={editedEvent?.category || ''}
                  onChange={(e) => setEditedEvent({ ...editedEvent, category: e.target.value })}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                >
                  <option value="Social/Fun">Social/Fun</option>
                  <option value="Professional">Professional</option>
                  <option value="Arts/Culture">Arts/Culture</option>
                  <option value="Sports">Sports</option>
                  <option value="Food">Food</option>
                  <option value="Music">Music</option>
                </select>
              ) : (
                <p className="text-sm text-gray-900">{event.category}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Venue</label>
              {isEditing ? (
                <input
                  type="text"
                  value={editedEvent?.venue || ''}
                  onChange={(e) => setEditedEvent({ ...editedEvent, venue: e.target.value })}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                />
              ) : (
                <p className="text-sm text-gray-900">{event.venue}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Date</label>
                {isEditing ? (
                  <input
                    type="date"
                    value={editedEvent?.date || ''}
                    onChange={(e) => setEditedEvent({ ...editedEvent, date: e.target.value })}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                  />
                ) : (
                  <p className="text-sm text-gray-900">{event.date}</p>
                )}
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Time</label>
                {isEditing ? (
                  <input
                    type="time"
                    value={editedEvent?.time || ''}
                    onChange={(e) => setEditedEvent({ ...editedEvent, time: e.target.value })}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                  />
                ) : (
                  <p className="text-sm text-gray-900">{event.time}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Price</label>
              {isEditing ? (
                <input
                  type="text"
                  value={editedEvent?.price || ''}
                  onChange={(e) => setEditedEvent({ ...editedEvent, price: e.target.value })}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                />
              ) : (
                <p className="text-sm text-gray-900">{event.price}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Description</label>
              {isEditing ? (
                <textarea
                  value={editedEvent?.description || ''}
                  onChange={(e) => setEditedEvent({ ...editedEvent, description: e.target.value })}
                  rows={3}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                />
              ) : (
                <p className="text-sm text-gray-900">{event.description}</p>
              )}
            </div>
          </div>
        </div>

        {/* Tags */}
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-3">AI-Generated Tags</h4>
          <div className="flex flex-wrap gap-2">
            {event.tags?.map((tag, index) => (
              <span
                key={index}
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Status Actions */}
        {canEdit && (
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-3">Status Actions</h4>
            <div className="flex space-x-2">
              <button
                onClick={() => onEventUpdate({ ...event, status: 'approved' })}
                className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
              >
                Approve
              </button>
              <button
                onClick={() => onEventUpdate({ ...event, status: 'rejected' })}
                className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
              >
                Reject
              </button>
              <button
                onClick={() => onEventUpdate({ ...event, status: 'archived' })}
                className="bg-gray-600 text-white px-3 py-1 rounded text-sm hover:bg-gray-700"
              >
                Archive
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AlgorithmicPreview


