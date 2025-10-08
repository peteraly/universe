import React, { useState, useEffect } from 'react'

const CuratorWorkbench = () => {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedEvents, setSelectedEvents] = useState(new Set())
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')

  useEffect(() => {
    loadEvents()
  }, [])

  const loadEvents = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/events/curation/queue')
      const data = await response.json()
      
      if (data.success) {
        setEvents(data.queue || [])
      } else {
        console.error('Failed to load events:', data.error)
      }
    } catch (error) {
      console.error('Error loading events:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSelectEvent = (eventId, selected) => {
    const newSelected = new Set(selectedEvents)
    if (selected) {
      newSelected.add(eventId)
    } else {
      newSelected.delete(eventId)
    }
    setSelectedEvents(newSelected)
  }

  const handleSelectAll = () => {
    const allEventIds = new Set(events.map(event => event.id))
    setSelectedEvents(allEventIds)
  }

  const handleDeselectAll = () => {
    setSelectedEvents(new Set())
  }

  const handleApproveEvent = async (eventId) => {
    try {
      const response = await fetch('/api/events/curation/approve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Session-ID': 'session_123' // Mock session
        },
        body: JSON.stringify({ eventId, curatorId: 'curator_123' })
      })
      
      const data = await response.json()
      
      if (data.success) {
        setEvents(prev => prev.filter(event => event.id !== eventId))
        setSelectedEvents(prev => {
          const newSelected = new Set(prev)
          newSelected.delete(eventId)
          return newSelected
        })
      } else {
        console.error('Failed to approve event:', data.error)
      }
    } catch (error) {
      console.error('Error approving event:', error)
    }
  }

  const handleRejectEvent = async (eventId, reason) => {
    try {
      const response = await fetch('/api/events/curation/reject', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Session-ID': 'session_123' // Mock session
        },
        body: JSON.stringify({ eventId, curatorId: 'curator_123', reason })
      })
      
      const data = await response.json()
      
      if (data.success) {
        setEvents(prev => prev.filter(event => event.id !== eventId))
        setSelectedEvents(prev => {
          const newSelected = new Set(prev)
          newSelected.delete(eventId)
          return newSelected
        })
      } else {
        console.error('Failed to reject event:', data.error)
      }
    } catch (error) {
      console.error('Error rejecting event:', error)
    }
  }

  const handleBulkApprove = async () => {
    if (selectedEvents.size === 0) return

    try {
      const response = await fetch('/api/events/curation/bulk-approve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Session-ID': 'session_123' // Mock session
        },
        body: JSON.stringify({ 
          eventIds: Array.from(selectedEvents), 
          curatorId: 'curator_123' 
        })
      })
      
      const data = await response.json()
      
      if (data.success) {
        setEvents(prev => prev.filter(event => !selectedEvents.has(event.id)))
        setSelectedEvents(new Set())
      } else {
        console.error('Failed to bulk approve events:', data.error)
      }
    } catch (error) {
      console.error('Error bulk approving events:', error)
    }
  }

  const handleBulkReject = async (reason) => {
    if (selectedEvents.size === 0) return

    try {
      const response = await fetch('/api/events/curation/bulk-reject', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Session-ID': 'session_123' // Mock session
        },
        body: JSON.stringify({ 
          eventIds: Array.from(selectedEvents), 
          curatorId: 'curator_123',
          reason 
        })
      })
      
      const data = await response.json()
      
      if (data.success) {
        setEvents(prev => prev.filter(event => !selectedEvents.has(event.id)))
        setSelectedEvents(new Set())
      } else {
        console.error('Failed to bulk reject events:', data.error)
      }
    } catch (error) {
      console.error('Error bulk rejecting events:', error)
    }
  }

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        event.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterStatus === 'all' || event.status === filterStatus
    return matchesSearch && matchesFilter
  })

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '400px',
        fontSize: '1.1rem',
        color: '#666'
      }}>
        Loading curation queue...
      </div>
    )
  }

  return (
    <div style={{
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '20px',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '30px',
        paddingBottom: '20px',
        borderBottom: '1px solid #e5e7eb'
      }}>
        <h1 style={{ fontSize: '2rem', fontWeight: '700', color: '#1f2937' }}>
          Curator Workbench
        </h1>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={handleSelectAll}
            style={{
              padding: '8px 16px',
              background: '#f3f4f6',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            Select All
          </button>
          <button
            onClick={handleDeselectAll}
            style={{
              padding: '8px 16px',
              background: '#f3f4f6',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            Deselect All
          </button>
        </div>
      </div>

      {/* Search and Filter */}
      <div style={{
        display: 'flex',
        gap: '20px',
        marginBottom: '30px',
        flexWrap: 'wrap'
      }}>
        <div style={{ flex: 1, minWidth: '300px' }}>
          <input
            type="text"
            placeholder="Search events..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '12px',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              fontSize: '1rem'
            }}
          />
        </div>
        
        <div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            style={{
              padding: '12px 16px',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              fontSize: '1rem',
              background: 'white'
            }}
          >
            <option value="all">All Events</option>
            <option value="pending_curation">Pending Review</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedEvents.size > 0 && (
        <div style={{
          display: 'flex',
          gap: '10px',
          marginBottom: '20px',
          padding: '15px',
          background: '#f9fafb',
          borderRadius: '8px'
        }}>
          <span style={{ fontWeight: '600' }}>
            {selectedEvents.size} event(s) selected
          </span>
          <button
            onClick={handleBulkApprove}
            style={{
              padding: '8px 16px',
              background: '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            Bulk Approve
          </button>
          <button
            onClick={() => handleBulkReject('Bulk rejection')}
            style={{
              padding: '8px 16px',
              background: '#ef4444',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            Bulk Reject
          </button>
        </div>
      )}

      {/* Events List */}
      {filteredEvents.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '60px 20px',
          background: '#f9fafb',
          borderRadius: '12px',
          border: '2px dashed #d1d5db'
        }}>
          <h3 style={{ fontSize: '1.5rem', marginBottom: '10px', color: '#6b7280' }}>
            No events in curation queue
          </h3>
          <p style={{ color: '#9ca3af' }}>
            All events have been reviewed or there are no pending events.
          </p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gap: '20px',
          gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))'
        }}>
          {filteredEvents.map(event => (
            <div
              key={event.id}
              style={{
                background: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '12px',
                padding: '20px',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
              }}
            >
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: '15px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <input
                    type="checkbox"
                    checked={selectedEvents.has(event.id)}
                    onChange={(e) => handleSelectEvent(event.id, e.target.checked)}
                    style={{ transform: 'scale(1.2)' }}
                  />
                  <h3 style={{
                    fontSize: '1.2rem',
                    fontWeight: '600',
                    color: '#1f2937',
                    margin: 0
                  }}>
                    {event.name}
                  </h3>
                </div>
                <span style={{
                  padding: '4px 12px',
                  borderRadius: '20px',
                  fontSize: '0.8rem',
                  fontWeight: '600',
                  background: event.status === 'approved' ? '#dcfce7' : '#fef3c7',
                  color: event.status === 'approved' ? '#166534' : '#92400e'
                }}>
                  {event.status}
                </span>
              </div>
              
              <div style={{ marginBottom: '15px' }}>
                <p style={{ margin: '5px 0', color: '#6b7280' }}>
                  <strong>Description:</strong> {event.description}
                </p>
                <p style={{ margin: '5px 0', color: '#6b7280' }}>
                  <strong>Date:</strong> {event.date} at {event.time}
                </p>
                <p style={{ margin: '5px 0', color: '#6b7280' }}>
                  <strong>Venue:</strong> {event.venue}
                </p>
                <p style={{ margin: '5px 0', color: '#6b7280' }}>
                  <strong>Quality Score:</strong> {event.qualityScore ? (event.qualityScore * 100).toFixed(1) + '%' : 'N/A'}
                </p>
              </div>
              
              <div style={{
                display: 'flex',
                gap: '8px',
                flexWrap: 'wrap'
              }}>
                <button
                  onClick={() => handleApproveEvent(event.id)}
                  style={{
                    padding: '8px 12px',
                    background: '#10b981',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '0.9rem'
                  }}
                >
                  Approve
                </button>
                
                <button
                  onClick={() => handleRejectEvent(event.id, 'Quality issues')}
                  style={{
                    padding: '8px 12px',
                    background: '#ef4444',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '0.9rem'
                  }}
                >
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default CuratorWorkbench
