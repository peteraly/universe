import React, { useState, useEffect } from 'react'

const IntelligenceCenter = () => {
  const [incidents, setIncidents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedIncident, setSelectedIncident] = useState(null)
  const [quarantineMode, setQuarantineMode] = useState(false)
  const [driftDetection, setDriftDetection] = useState({ active: false, threshold: 0.15 })
  const [lastUpdate, setLastUpdate] = useState(null)

  useEffect(() => {
    loadIncidents()
    loadIntelligenceStatus()
    
    const interval = setInterval(() => {
      loadIncidents()
      loadIntelligenceStatus()
    }, 30000) // Update every 30 seconds
    
    return () => clearInterval(interval)
  }, [])

  const loadIncidents = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('/api/intelligence/incidents', {
        headers: {
          'X-Session-ID': 'session_123' // Mock session
        }
      })
      
      const data = await response.json()
      
      if (data.success) {
        setIncidents(data.incidents || [])
        setLastUpdate(new Date().toISOString())
      } else {
        setError(data.error || 'Failed to load incidents')
      }
    } catch (err) {
      setError('Network error: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const loadIntelligenceStatus = async () => {
    try {
      const response = await fetch('/api/intelligence/status', {
        headers: {
          'X-Session-ID': 'session_123' // Mock session
        }
      })
      
      const data = await response.json()
      
      if (data.success) {
        setQuarantineMode(data.quarantineMode || false)
        setDriftDetection(data.driftDetection || { active: false, threshold: 0.15 })
      }
    } catch (err) {
      console.error('Failed to load intelligence status:', err)
    }
  }

  const handleQuarantineToggle = async () => {
    try {
      const response = await fetch('/api/intelligence/quarantine', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Session-ID': 'session_123' // Mock session
        },
        body: JSON.stringify({ enabled: !quarantineMode })
      })
      
      const data = await response.json()
      
      if (data.success) {
        setQuarantineMode(!quarantineMode)
      } else {
        setError(data.error || 'Failed to toggle quarantine mode')
      }
    } catch (err) {
      setError('Network error: ' + err.message)
    }
  }

  const handleDriftThresholdChange = async (newThreshold) => {
    try {
      const response = await fetch('/api/intelligence/drift', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Session-ID': 'session_123' // Mock session
        },
        body: JSON.stringify({ threshold: newThreshold })
      })
      
      const data = await response.json()
      
      if (data.success) {
        setDriftDetection(prev => ({ ...prev, threshold: newThreshold }))
      } else {
        setError(data.error || 'Failed to update drift threshold')
      }
    } catch (err) {
      setError('Network error: ' + err.message)
    }
  }

  const handleIncidentAction = async (incidentId, action) => {
    try {
      const response = await fetch('/api/intelligence/incidents/action', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Session-ID': 'session_123' // Mock session
        },
        body: JSON.stringify({ incidentId, action })
      })
      
      const data = await response.json()
      
      if (data.success) {
        loadIncidents() // Refresh incidents
      } else {
        setError(data.error || 'Failed to perform incident action')
      }
    } catch (err) {
      setError('Network error: ' + err.message)
    }
  }

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return '#ef4444'
      case 'high': return '#f59e0b'
      case 'medium': return '#3b82f6'
      case 'low': return '#10b981'
      default: return '#6b7280'
    }
  }

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'critical': return '🚨'
      case 'high': return '⚠️'
      case 'medium': return 'ℹ️'
      case 'low': return '✅'
      default: return '❓'
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return '#ef4444'
      case 'investigating': return '#f59e0b'
      case 'resolved': return '#10b981'
      case 'quarantined': return '#8b5cf6'
      default: return '#6b7280'
    }
  }

  if (loading && incidents.length === 0) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '400px',
        fontSize: '1.1rem',
        color: '#666'
      }}>
        Loading intelligence center...
      </div>
    )
  }

  if (error) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '400px',
        fontSize: '1.1rem',
        color: '#ef4444',
        flexDirection: 'column',
        gap: '10px'
      }}>
        <div>❌ Error loading intelligence center</div>
        <div style={{ fontSize: '0.9rem', color: '#666' }}>{error}</div>
        <button
          onClick={loadIncidents}
          style={{
            padding: '8px 16px',
            background: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer'
          }}
        >
          Retry
        </button>
      </div>
    )
  }

  return (
    <div style={{
      maxWidth: '1400px',
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
          Intelligence Center
        </h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '0.9rem', color: '#6b7280' }}>
            Last updated: {lastUpdate ? new Date(lastUpdate).toLocaleTimeString() : 'Never'}
          </span>
          <button
            onClick={loadIncidents}
            disabled={loading}
            style={{
              padding: '8px 16px',
              background: loading ? '#9ca3af' : '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* Intelligence Controls */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '20px',
        marginBottom: '30px'
      }}>
        {/* Quarantine Control */}
        <div style={{
          background: 'white',
          border: '1px solid #e5e7eb',
          borderRadius: '12px',
          padding: '20px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
        }}>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '15px', color: '#1f2937' }}>
            Quarantine Control
          </h3>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '10px'
          }}>
            <span>Quarantine Mode:</span>
            <span style={{
              color: quarantineMode ? '#ef4444' : '#10b981',
              fontWeight: '600'
            }}>
              {quarantineMode ? 'ACTIVE' : 'INACTIVE'}
            </span>
          </div>
          <button
            onClick={handleQuarantineToggle}
            style={{
              width: '100%',
              padding: '10px',
              background: quarantineMode ? '#ef4444' : '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: '600'
            }}
          >
            {quarantineMode ? 'Disable Quarantine' : 'Enable Quarantine'}
          </button>
        </div>

        {/* Drift Detection */}
        <div style={{
          background: 'white',
          border: '1px solid #e5e7eb',
          borderRadius: '12px',
          padding: '20px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
        }}>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '15px', color: '#1f2937' }}>
            Drift Detection
          </h3>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '10px'
          }}>
            <span>Status:</span>
            <span style={{
              color: driftDetection.active ? '#10b981' : '#6b7280',
              fontWeight: '600'
            }}>
              {driftDetection.active ? 'ACTIVE' : 'INACTIVE'}
            </span>
          </div>
          <div style={{ marginBottom: '10px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem' }}>
              Threshold: {driftDetection.threshold}
            </label>
            <input
              type="range"
              min="0.05"
              max="0.5"
              step="0.05"
              value={driftDetection.threshold}
              onChange={(e) => handleDriftThresholdChange(parseFloat(e.target.value))}
              style={{ width: '100%' }}
            />
          </div>
        </div>
      </div>

      {/* Incidents List */}
      <div style={{
        background: 'white',
        border: '1px solid #e5e7eb',
        borderRadius: '12px',
        padding: '20px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
      }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '20px', color: '#1f2937' }}>
          Active Incidents
        </h2>
        
        {incidents.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '60px 20px',
            background: '#f9fafb',
            borderRadius: '12px',
            border: '2px dashed #d1d5db'
          }}>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '10px', color: '#6b7280' }}>
              No active incidents
            </h3>
            <p style={{ color: '#9ca3af' }}>
              System is operating normally with no intelligence alerts.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {incidents.map(incident => (
              <div
                key={incident.id}
                style={{
                  padding: '20px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  background: '#f9fafb',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onClick={() => setSelectedIncident(incident)}
              >
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: '15px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '1.5rem' }}>
                      {getSeverityIcon(incident.severity)}
                    </span>
                    <div>
                      <h3 style={{
                        fontSize: '1.1rem',
                        fontWeight: '600',
                        color: '#1f2937',
                        margin: 0
                      }}>
                        {incident.title}
                      </h3>
                      <div style={{
                        fontSize: '0.9rem',
                        color: '#6b7280'
                      }}>
                        {incident.component} • {incident.type}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{
                      padding: '4px 12px',
                      borderRadius: '20px',
                      fontSize: '0.8rem',
                      fontWeight: '600',
                      background: getSeverityColor(incident.severity),
                      color: 'white'
                    }}>
                      {incident.severity.toUpperCase()}
                    </span>
                    <span style={{
                      padding: '4px 12px',
                      borderRadius: '20px',
                      fontSize: '0.8rem',
                      fontWeight: '600',
                      background: getStatusColor(incident.status),
                      color: 'white'
                    }}>
                      {incident.status.toUpperCase()}
                    </span>
                  </div>
                </div>
                
                <div style={{ marginBottom: '15px' }}>
                  <p style={{ margin: '5px 0', color: '#6b7280' }}>
                    {incident.description}
                  </p>
                  <div style={{
                    display: 'flex',
                    gap: '20px',
                    fontSize: '0.9rem',
                    color: '#6b7280'
                  }}>
                    <span>Detected: {new Date(incident.detectedAt).toLocaleString()}</span>
                    <span>Confidence: {(incident.confidence * 100).toFixed(1)}%</span>
                    <span>Impact: {incident.impact}</span>
                  </div>
                </div>
                
                <div style={{
                  display: 'flex',
                  gap: '8px',
                  flexWrap: 'wrap'
                }}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleIncidentAction(incident.id, 'investigate')
                    }}
                    style={{
                      padding: '6px 12px',
                      background: '#3b82f6',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '0.8rem'
                    }}
                  >
                    Investigate
                  </button>
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleIncidentAction(incident.id, 'quarantine')
                    }}
                    style={{
                      padding: '6px 12px',
                      background: '#8b5cf6',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '0.8rem'
                    }}
                  >
                    Quarantine
                  </button>
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleIncidentAction(incident.id, 'resolve')
                    }}
                    style={{
                      padding: '6px 12px',
                      background: '#10b981',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '0.8rem'
                    }}
                  >
                    Resolve
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Incident Detail Modal */}
      {selectedIncident && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '30px',
            maxWidth: '600px',
            width: '90%',
            maxHeight: '80vh',
            overflow: 'auto'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px'
            }}>
              <h2 style={{ fontSize: '1.5rem', margin: 0 }}>
                {selectedIncident.title}
              </h2>
              <button
                onClick={() => setSelectedIncident(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                  color: '#6b7280'
                }}
              >
                ×
              </button>
            </div>
            
            <div style={{ marginBottom: '20px' }}>
              <p style={{ margin: '10px 0', color: '#6b7280' }}>
                {selectedIncident.description}
              </p>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '15px',
                marginTop: '20px'
              }}>
                <div>
                  <strong>Severity:</strong> {selectedIncident.severity}
                </div>
                <div>
                  <strong>Status:</strong> {selectedIncident.status}
                </div>
                <div>
                  <strong>Component:</strong> {selectedIncident.component}
                </div>
                <div>
                  <strong>Type:</strong> {selectedIncident.type}
                </div>
                <div>
                  <strong>Confidence:</strong> {(selectedIncident.confidence * 100).toFixed(1)}%
                </div>
                <div>
                  <strong>Impact:</strong> {selectedIncident.impact}
                </div>
                <div>
                  <strong>Detected:</strong> {new Date(selectedIncident.detectedAt).toLocaleString()}
                </div>
                <div>
                  <strong>Last Updated:</strong> {new Date(selectedIncident.updatedAt).toLocaleString()}
                </div>
              </div>
            </div>
            
            <div style={{
              display: 'flex',
              gap: '10px',
              justifyContent: 'flex-end'
            }}>
              <button
                onClick={() => setSelectedIncident(null)}
                style={{
                  padding: '8px 16px',
                  background: '#6b7280',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default IntelligenceCenter
