import React, { useState, useEffect } from 'react'

const AgentConsole = () => {
  const [agents, setAgents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedAgent, setSelectedAgent] = useState(null)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingAgent, setEditingAgent] = useState(null)
  const [lastUpdate, setLastUpdate] = useState(null)

  const [newAgent, setNewAgent] = useState({
    name: '',
    type: 'curation',
    description: '',
    config: {},
    enabled: true
  })

  useEffect(() => {
    loadAgents()
    const interval = setInterval(loadAgents, 10000) // Update every 10 seconds
    return () => clearInterval(interval)
  }, [])

  const loadAgents = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('/api/agents', {
        headers: {
          'X-Session-ID': 'session_123' // Mock session
        }
      })
      
      const data = await response.json()
      
      if (data.success) {
        setAgents(data.agents || [])
        setLastUpdate(new Date().toISOString())
      } else {
        setError(data.error || 'Failed to load agents')
      }
    } catch (err) {
      setError('Network error: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateAgent = async () => {
    try {
      const response = await fetch('/api/agents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Session-ID': 'session_123' // Mock session
        },
        body: JSON.stringify(newAgent)
      })
      
      const data = await response.json()
      
      if (data.success) {
        setAgents(prev => [...prev, data.agent])
        setShowCreateForm(false)
        setNewAgent({ name: '', type: 'curation', description: '', config: {}, enabled: true })
      } else {
        setError(data.error || 'Failed to create agent')
      }
    } catch (err) {
      setError('Network error: ' + err.message)
    }
  }

  const handleUpdateAgent = async (agentId, updates) => {
    try {
      const response = await fetch(`/api/agents/${agentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Session-ID': 'session_123' // Mock session
        },
        body: JSON.stringify(updates)
      })
      
      const data = await response.json()
      
      if (data.success) {
        setAgents(prev => prev.map(agent => 
          agent.id === agentId ? { ...agent, ...updates } : agent
        ))
        setEditingAgent(null)
      } else {
        setError(data.error || 'Failed to update agent')
      }
    } catch (err) {
      setError('Network error: ' + err.message)
    }
  }

  const handleDeleteAgent = async (agentId) => {
    if (!confirm('Are you sure you want to delete this agent?')) return

    try {
      const response = await fetch(`/api/agents/${agentId}`, {
        method: 'DELETE',
        headers: {
          'X-Session-ID': 'session_123' // Mock session
        }
      })
      
      const data = await response.json()
      
      if (data.success) {
        setAgents(prev => prev.filter(agent => agent.id !== agentId))
      } else {
        setError(data.error || 'Failed to delete agent')
      }
    } catch (err) {
      setError('Network error: ' + err.message)
    }
  }

  const handleStartAgent = async (agentId) => {
    try {
      const response = await fetch(`/api/agents/${agentId}/start`, {
        method: 'POST',
        headers: {
          'X-Session-ID': 'session_123' // Mock session
        }
      })
      
      const data = await response.json()
      
      if (data.success) {
        setAgents(prev => prev.map(agent => 
          agent.id === agentId ? { ...agent, status: 'active' } : agent
        ))
      } else {
        setError(data.error || 'Failed to start agent')
      }
    } catch (err) {
      setError('Network error: ' + err.message)
    }
  }

  const handleStopAgent = async (agentId) => {
    try {
      const response = await fetch(`/api/agents/${agentId}/stop`, {
        method: 'POST',
        headers: {
          'X-Session-ID': 'session_123' // Mock session
        }
      })
      
      const data = await response.json()
      
      if (data.success) {
        setAgents(prev => prev.map(agent => 
          agent.id === agentId ? { ...agent, status: 'inactive' } : agent
        ))
      } else {
        setError(data.error || 'Failed to stop agent')
      }
    } catch (err) {
      setError('Network error: ' + err.message)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return '#10b981'
      case 'inactive': return '#6b7280'
      case 'error': return '#ef4444'
      case 'starting': return '#f59e0b'
      case 'stopping': return '#f59e0b'
      default: return '#6b7280'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active': return '🟢'
      case 'inactive': return '⚪'
      case 'error': return '🔴'
      case 'starting': return '🟡'
      case 'stopping': return '🟡'
      default: return '❓'
    }
  }

  const getTypeIcon = (type) => {
    switch (type) {
      case 'curation': return '📝'
      case 'intelligence': return '🧠'
      case 'health': return '🏥'
      case 'config': return '⚙️'
      case 'knowledge': return '📚'
      default: return '🤖'
    }
  }

  if (loading && agents.length === 0) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '400px',
        fontSize: '1.1rem',
        color: '#666'
      }}>
        Loading agent console...
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
        <div>❌ Error loading agent console</div>
        <div style={{ fontSize: '0.9rem', color: '#666' }}>{error}</div>
        <button
          onClick={loadAgents}
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
          Agent Console
        </h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '0.9rem', color: '#6b7280' }}>
            Last updated: {lastUpdate ? new Date(lastUpdate).toLocaleTimeString() : 'Never'}
          </span>
          <button
            onClick={() => setShowCreateForm(true)}
            style={{
              padding: '8px 16px',
              background: '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            + Create Agent
          </button>
        </div>
      </div>

      {/* Agent Statistics */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '20px',
        marginBottom: '30px'
      }}>
        <div style={{
          background: 'white',
          border: '1px solid #e5e7eb',
          borderRadius: '12px',
          padding: '20px',
          textAlign: 'center',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{ fontSize: '2rem', fontWeight: '700', color: '#3b82f6' }}>
            {agents.length}
          </div>
          <div style={{ fontSize: '0.9rem', color: '#6b7280' }}>Total Agents</div>
        </div>
        
        <div style={{
          background: 'white',
          border: '1px solid #e5e7eb',
          borderRadius: '12px',
          padding: '20px',
          textAlign: 'center',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{ fontSize: '2rem', fontWeight: '700', color: '#10b981' }}>
            {agents.filter(agent => agent.status === 'active').length}
          </div>
          <div style={{ fontSize: '0.9rem', color: '#6b7280' }}>Active</div>
        </div>
        
        <div style={{
          background: 'white',
          border: '1px solid #e5e7eb',
          borderRadius: '12px',
          padding: '20px',
          textAlign: 'center',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{ fontSize: '2rem', fontWeight: '700', color: '#ef4444' }}>
            {agents.filter(agent => agent.status === 'error').length}
          </div>
          <div style={{ fontSize: '0.9rem', color: '#6b7280' }}>Errors</div>
        </div>
        
        <div style={{
          background: 'white',
          border: '1px solid #e5e7eb',
          borderRadius: '12px',
          padding: '20px',
          textAlign: 'center',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{ fontSize: '2rem', fontWeight: '700', color: '#8b5cf6' }}>
            {agents.filter(agent => agent.type === 'intelligence').length}
          </div>
          <div style={{ fontSize: '0.9rem', color: '#6b7280' }}>Intelligence</div>
        </div>
      </div>

      {/* Agents List */}
      <div style={{
        background: 'white',
        border: '1px solid #e5e7eb',
        borderRadius: '12px',
        padding: '20px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
      }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '20px', color: '#1f2937' }}>
          Agent Registry
        </h2>
        
        {agents.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '60px 20px',
            background: '#f9fafb',
            borderRadius: '12px',
            border: '2px dashed #d1d5db'
          }}>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '10px', color: '#6b7280' }}>
              No agents registered
            </h3>
            <p style={{ color: '#9ca3af' }}>
              Create your first agent to get started.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {agents.map(agent => (
              <div
                key={agent.id}
                style={{
                  padding: '20px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  background: '#f9fafb',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onClick={() => setSelectedAgent(agent)}
              >
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: '15px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '1.5rem' }}>
                      {getTypeIcon(agent.type)}
                    </span>
                    <div>
                      <h3 style={{
                        fontSize: '1.2rem',
                        fontWeight: '600',
                        color: '#1f2937',
                        margin: 0
                      }}>
                        {agent.name}
                      </h3>
                      <div style={{
                        fontSize: '0.9rem',
                        color: '#6b7280'
                      }}>
                        {agent.type} • {agent.description}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{
                      padding: '4px 12px',
                      borderRadius: '20px',
                      fontSize: '0.8rem',
                      fontWeight: '600',
                      background: getStatusColor(agent.status),
                      color: 'white'
                    }}>
                      {getStatusIcon(agent.status)} {agent.status.toUpperCase()}
                    </span>
                  </div>
                </div>
                
                <div style={{ marginBottom: '15px' }}>
                  <div style={{
                    display: 'flex',
                    gap: '20px',
                    fontSize: '0.9rem',
                    color: '#6b7280'
                  }}>
                    <span>ID: {agent.id}</span>
                    <span>Version: {agent.version || '1.0.0'}</span>
                    <span>Uptime: {agent.uptime || '0s'}</span>
                    <span>Last Heartbeat: {agent.lastHeartbeat ? new Date(agent.lastHeartbeat).toLocaleTimeString() : 'Never'}</span>
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
                      setEditingAgent(agent)
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
                    Edit
                  </button>
                  
                  {agent.status === 'active' ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleStopAgent(agent.id)
                      }}
                      style={{
                        padding: '6px 12px',
                        background: '#ef4444',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '0.8rem'
                      }}
                    >
                      Stop
                    </button>
                  ) : (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleStartAgent(agent.id)
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
                      Start
                    </button>
                  )}
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDeleteAgent(agent.id)
                    }}
                    style={{
                      padding: '6px 12px',
                      background: '#6b7280',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '0.8rem'
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Agent Modal */}
      {showCreateForm && (
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
            maxWidth: '500px',
            width: '90%',
            maxHeight: '80vh',
            overflow: 'auto'
          }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '20px' }}>
              Create New Agent
            </h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>
                  Name:
                </label>
                <input
                  type="text"
                  value={newAgent.name}
                  onChange={(e) => setNewAgent({ ...newAgent, name: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #d1d5db',
                    borderRadius: '4px'
                  }}
                />
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>
                  Type:
                </label>
                <select
                  value={newAgent.type}
                  onChange={(e) => setNewAgent({ ...newAgent, type: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #d1d5db',
                    borderRadius: '4px'
                  }}
                >
                  <option value="curation">Curation</option>
                  <option value="intelligence">Intelligence</option>
                  <option value="health">Health</option>
                  <option value="config">Config</option>
                  <option value="knowledge">Knowledge</option>
                </select>
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>
                  Description:
                </label>
                <textarea
                  value={newAgent.description}
                  onChange={(e) => setNewAgent({ ...newAgent, description: e.target.value })}
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #d1d5db',
                    borderRadius: '4px'
                  }}
                />
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <input
                  type="checkbox"
                  id="enabled"
                  checked={newAgent.enabled}
                  onChange={(e) => setNewAgent({ ...newAgent, enabled: e.target.checked })}
                />
                <label htmlFor="enabled">Enabled</label>
              </div>
            </div>
            
            <div style={{
              display: 'flex',
              gap: '10px',
              justifyContent: 'flex-end',
              marginTop: '20px'
            }}>
              <button
                onClick={() => setShowCreateForm(false)}
                style={{
                  padding: '8px 16px',
                  background: '#6b7280',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleCreateAgent}
                disabled={!newAgent.name}
                style={{
                  padding: '8px 16px',
                  background: newAgent.name ? '#10b981' : '#9ca3af',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: newAgent.name ? 'pointer' : 'not-allowed'
                }}
              >
                Create Agent
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Agent Detail Modal */}
      {selectedAgent && (
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
                {getTypeIcon(selectedAgent.type)} {selectedAgent.name}
              </h2>
              <button
                onClick={() => setSelectedAgent(null)}
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
                {selectedAgent.description}
              </p>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '15px',
                marginTop: '20px'
              }}>
                <div>
                  <strong>Status:</strong> {selectedAgent.status}
                </div>
                <div>
                  <strong>Type:</strong> {selectedAgent.type}
                </div>
                <div>
                  <strong>Version:</strong> {selectedAgent.version || '1.0.0'}
                </div>
                <div>
                  <strong>Uptime:</strong> {selectedAgent.uptime || '0s'}
                </div>
                <div>
                  <strong>Last Heartbeat:</strong> {selectedAgent.lastHeartbeat ? new Date(selectedAgent.lastHeartbeat).toLocaleString() : 'Never'}
                </div>
                <div>
                  <strong>Created:</strong> {selectedAgent.createdAt ? new Date(selectedAgent.createdAt).toLocaleString() : 'Unknown'}
                </div>
              </div>
            </div>
            
            <div style={{
              display: 'flex',
              gap: '10px',
              justifyContent: 'flex-end'
            }}>
              <button
                onClick={() => setSelectedAgent(null)}
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

export default AgentConsole
