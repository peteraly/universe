import React, { useState, useEffect } from 'react'

const ConfigEditor = () => {
  const [configs, setConfigs] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [editingKey, setEditingKey] = useState(null)
  const [editValue, setEditValue] = useState('')
  const [editType, setEditType] = useState('string')
  const [ledgerEntries, setLedgerEntries] = useState([])
  const [lastUpdate, setLastUpdate] = useState(null)

  useEffect(() => {
    loadConfigs()
    loadLedgerEntries()
  }, [])

  const loadConfigs = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('/api/config', {
        headers: {
          'X-Session-ID': 'session_123' // Mock session
        }
      })
      
      const data = await response.json()
      
      if (data.success) {
        setConfigs(data.configs || {})
        setLastUpdate(new Date().toISOString())
      } else {
        setError(data.error || 'Failed to load configurations')
      }
    } catch (err) {
      setError('Network error: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const loadLedgerEntries = async () => {
    try {
      const response = await fetch('/api/governance/ledger', {
        headers: {
          'X-Session-ID': 'session_123' // Mock session
        }
      })
      
      const data = await response.json()
      
      if (data.success) {
        setLedgerEntries(data.entries || [])
      }
    } catch (err) {
      console.error('Failed to load ledger entries:', err)
    }
  }

  const handleEditConfig = (key, currentValue) => {
    setEditingKey(key)
    setEditValue(currentValue)
    setEditType(typeof currentValue)
  }

  const handleSaveConfig = async () => {
    if (!editingKey) return

    try {
      const response = await fetch('/api/config', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Session-ID': 'session_123' // Mock session
        },
        body: JSON.stringify({
          key: editingKey,
          value: editType === 'boolean' ? editValue === 'true' : 
                 editType === 'number' ? parseFloat(editValue) : editValue,
          type: editType
        })
      })
      
      const data = await response.json()
      
      if (data.success) {
        setConfigs(prev => ({
          ...prev,
          [editingKey]: editType === 'boolean' ? editValue === 'true' : 
                       editType === 'number' ? parseFloat(editValue) : editValue
        }))
        setEditingKey(null)
        setEditValue('')
        setEditType('string')
        loadLedgerEntries() // Refresh ledger
      } else {
        setError(data.error || 'Failed to save configuration')
      }
    } catch (err) {
      setError('Network error: ' + err.message)
    }
  }

  const handleCancelEdit = () => {
    setEditingKey(null)
    setEditValue('')
    setEditType('string')
  }

  const handleResetConfig = async (key) => {
    if (!confirm(`Reset ${key} to default value?`)) return

    try {
      const response = await fetch('/api/config/reset', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Session-ID': 'session_123' // Mock session
        },
        body: JSON.stringify({ key })
      })
      
      const data = await response.json()
      
      if (data.success) {
        setConfigs(prev => ({
          ...prev,
          [key]: data.defaultValue
        }))
        loadLedgerEntries() // Refresh ledger
      } else {
        setError(data.error || 'Failed to reset configuration')
      }
    } catch (err) {
      setError('Network error: ' + err.message)
    }
  }

  const getValueDisplay = (value) => {
    if (typeof value === 'boolean') {
      return value ? 'true' : 'false'
    }
    if (typeof value === 'object') {
      return JSON.stringify(value, null, 2)
    }
    return String(value)
  }

  const getInputType = (key, value) => {
    if (key.includes('password') || key.includes('secret')) return 'password'
    if (typeof value === 'number') return 'number'
    if (typeof value === 'boolean') return 'checkbox'
    return 'text'
  }

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
        Loading configuration...
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
        <div>❌ Error loading configuration</div>
        <div style={{ fontSize: '0.9rem', color: '#666' }}>{error}</div>
        <button
          onClick={loadConfigs}
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
          Configuration Editor
        </h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '0.9rem', color: '#6b7280' }}>
            Last updated: {lastUpdate ? new Date(lastUpdate).toLocaleTimeString() : 'Never'}
          </span>
          <button
            onClick={loadConfigs}
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

      {/* Configuration Sections */}
      <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap' }}>
        {/* Main Configuration */}
        <div style={{ flex: 1, minWidth: '500px' }}>
          <div style={{
            background: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '12px',
            padding: '20px',
            marginBottom: '30px',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
          }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '20px', color: '#1f2937' }}>
              System Configuration
            </h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {Object.entries(configs).map(([key, value]) => (
                <div
                  key={key}
                  style={{
                    padding: '15px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    background: '#f9fafb'
                  }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: '10px'
                  }}>
                    <div>
                      <div style={{ fontWeight: '600', marginBottom: '4px' }}>
                        {key}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>
                        Type: {typeof value}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => handleEditConfig(key, value)}
                        style={{
                          padding: '4px 8px',
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
                      <button
                        onClick={() => handleResetConfig(key)}
                        style={{
                          padding: '4px 8px',
                          background: '#f59e0b',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '0.8rem'
                        }}
                      >
                        Reset
                      </button>
                    </div>
                  </div>
                  
                  {editingKey === key ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <div>
                        <label style={{ display: 'block', marginBottom: '4px', fontSize: '0.9rem' }}>
                          New Value:
                        </label>
                        {editType === 'boolean' ? (
                          <select
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            style={{
                              width: '100%',
                              padding: '8px',
                              border: '1px solid #d1d5db',
                              borderRadius: '4px'
                            }}
                          >
                            <option value="true">true</option>
                            <option value="false">false</option>
                          </select>
                        ) : editType === 'object' ? (
                          <textarea
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            rows={4}
                            style={{
                              width: '100%',
                              padding: '8px',
                              border: '1px solid #d1d5db',
                              borderRadius: '4px',
                              fontFamily: 'monospace'
                            }}
                          />
                        ) : (
                          <input
                            type={getInputType(key, value)}
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            style={{
                              width: '100%',
                              padding: '8px',
                              border: '1px solid #d1d5db',
                              borderRadius: '4px'
                            }}
                          />
                        )}
                      </div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          onClick={handleSaveConfig}
                          style={{
                            padding: '6px 12px',
                            background: '#10b981',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer'
                          }}
                        >
                          Save
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          style={{
                            padding: '6px 12px',
                            background: '#6b7280',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer'
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div style={{
                      padding: '8px',
                      background: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '4px',
                      fontFamily: 'monospace',
                      fontSize: '0.9rem',
                      wordBreak: 'break-all'
                    }}>
                      {getValueDisplay(value)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Governance Ledger */}
        <div style={{ flex: 1, minWidth: '400px' }}>
          <div style={{
            background: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '12px',
            padding: '20px',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
          }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '20px', color: '#1f2937' }}>
              Governance Ledger
            </h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {ledgerEntries.length === 0 ? (
                <div style={{
                  textAlign: 'center',
                  padding: '40px',
                  color: '#6b7280',
                  fontStyle: 'italic'
                }}>
                  No ledger entries yet
                </div>
              ) : (
                ledgerEntries.map((entry, index) => (
                  <div
                    key={index}
                    style={{
                      padding: '12px',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      background: '#f9fafb'
                    }}
                  >
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      marginBottom: '8px'
                    }}>
                      <div style={{ fontWeight: '600', fontSize: '0.9rem' }}>
                        {entry.action}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>
                        {new Date(entry.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#6b7280', marginBottom: '4px' }}>
                      Key: {entry.key}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>
                      User: {entry.userId}
                    </div>
                    {entry.oldValue && (
                      <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>
                        Old: {getValueDisplay(entry.oldValue)}
                      </div>
                    )}
                    {entry.newValue && (
                      <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>
                        New: {getValueDisplay(entry.newValue)}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ConfigEditor

