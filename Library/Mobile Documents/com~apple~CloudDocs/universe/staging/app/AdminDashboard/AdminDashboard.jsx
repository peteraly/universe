import React, { useState, useEffect } from 'react'

const AdminDashboard = () => {
  const [recoveryData, setRecoveryData] = useState(null)
  const [recoveryLoading, setRecoveryLoading] = useState(false)

  useEffect(() => {
    loadRecoveryData()
  }, [])

  const loadRecoveryData = async () => {
    try {
      const response = await fetch('/api/recovery/status', {
        headers: {
          'X-Session-ID': 'session_123' // Mock session
        }
      })
      
      const data = await response.json()
      
      if (data.success) {
        setRecoveryData(data.data)
      }
    } catch (err) {
      console.error('Failed to load recovery data:', err)
    }
  }

  const handleRecoveryAction = async (action, params = {}) => {
    setRecoveryLoading(true)
    try {
      const response = await fetch(`/api/recovery/${action}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Session-ID': 'session_123' // Mock session
        },
        body: JSON.stringify(params)
      })
      
      const data = await response.json()
      
      if (data.success) {
        await loadRecoveryData()
        alert(`Recovery action ${action} completed successfully`)
      } else {
        alert(`Recovery action ${action} failed: ${data.message}`)
      }
    } catch (err) {
      alert(`Recovery action ${action} failed: ${err.message}`)
    } finally {
      setRecoveryLoading(false)
    }
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
          🎛️ Admin Mission Control
        </h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '0.9rem', color: '#6b7280' }}>
            V12.0 Mission Control
          </span>
        </div>
      </div>

      {/* System Overview */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
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
            {recoveryData?.systemState?.current?.toUpperCase() || 'UNKNOWN'}
          </div>
          <div style={{ fontSize: '0.9rem', color: '#6b7280' }}>System State</div>
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
            {recoveryData?.activeIncidents || 0}
          </div>
          <div style={{ fontSize: '0.9rem', color: '#6b7280' }}>Active Incidents</div>
        </div>
        
        <div style={{
          background: 'white',
          border: '1px solid #e5e7eb',
          borderRadius: '12px',
          padding: '20px',
          textAlign: 'center',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{ fontSize: '2rem', fontWeight: '700', color: '#f59e0b' }}>
            {recoveryData?.lastStableBuild || 'N/A'}
          </div>
          <div style={{ fontSize: '0.9rem', color: '#6b7280' }}>Last Stable Build</div>
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
            {recoveryData?.systemState?.freezeMode ? '🧊' : '🔥'}
          </div>
          <div style={{ fontSize: '0.9rem', color: '#6b7280' }}>Freeze Mode</div>
        </div>
      </div>

      {/* Recovery Controls */}
      <div style={{
        background: 'white',
        border: '1px solid #e5e7eb',
        borderRadius: '12px',
        padding: '25px',
        marginBottom: '30px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
      }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '20px', color: '#1f2937' }}>
          🚨 Emergency Recovery Controls
        </h2>
        
        {/* Critical Actions */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '15px',
          marginBottom: '20px'
        }}>
          <button
            onClick={() => {
              if (confirm('Are you sure you want to freeze the system? This will suspend all operations.')) {
                handleRecoveryAction('freeze')
              }
            }}
            disabled={recoveryLoading || recoveryData?.systemState?.freezeMode}
            style={{
              padding: '15px 20px',
              background: recoveryData?.systemState?.freezeMode ? '#9ca3af' : '#ef4444',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: recoveryData?.systemState?.freezeMode ? 'not-allowed' : 'pointer',
              fontWeight: '600',
              fontSize: '1rem'
            }}
          >
            🧊 Freeze System
          </button>
          
          <button
            onClick={() => {
              if (confirm('Are you sure you want to unfreeze the system?')) {
                handleRecoveryAction('unfreeze')
              }
            }}
            disabled={recoveryLoading || !recoveryData?.systemState?.freezeMode}
            style={{
              padding: '15px 20px',
              background: !recoveryData?.systemState?.freezeMode ? '#9ca3af' : '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: !recoveryData?.systemState?.freezeMode ? 'not-allowed' : 'pointer',
              fontWeight: '600',
              fontSize: '1rem'
            }}
          >
            🔥 Unfreeze System
          </button>
          
          <button
            onClick={() => {
              if (confirm('Are you sure you want to perform an emergency rollback? This will revert to the last stable build.')) {
                handleRecoveryAction('emergency-rollback')
              }
            }}
            disabled={recoveryLoading || recoveryData?.systemState?.rollbackInProgress}
            style={{
              padding: '15px 20px',
              background: recoveryData?.systemState?.rollbackInProgress ? '#9ca3af' : '#dc2626',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: recoveryData?.systemState?.rollbackInProgress ? 'not-allowed' : 'pointer',
              fontWeight: '600',
              fontSize: '1rem'
            }}
          >
            ⚡ Emergency Rollback
          </button>
          
          <button
            onClick={() => {
              const version = prompt('Enter version to rollback to:', recoveryData?.lastStableBuild || 'v1.2.2')
              if (version && confirm(`Are you sure you want to rollback to ${version}?`)) {
                handleRecoveryAction('rollback', { version })
              }
            }}
            disabled={recoveryLoading || recoveryData?.systemState?.rollbackInProgress}
            style={{
              padding: '15px 20px',
              background: recoveryData?.systemState?.rollbackInProgress ? '#9ca3af' : '#f59e0b',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: recoveryData?.systemState?.rollbackInProgress ? 'not-allowed' : 'pointer',
              fontWeight: '600',
              fontSize: '1rem'
            }}
          >
            🔄 Manual Rollback
          </button>
        </div>

        {/* System Status */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '15px',
          padding: '15px',
          background: '#f9fafb',
          borderRadius: '8px'
        }}>
          <div>
            <strong>System State:</strong> {recoveryData?.systemState?.current?.toUpperCase() || 'UNKNOWN'}
          </div>
          <div>
            <strong>Freeze Mode:</strong> {recoveryData?.systemState?.freezeMode ? 'Yes' : 'No'}
          </div>
          <div>
            <strong>Rollback Progress:</strong> {recoveryData?.systemState?.rollbackInProgress ? 'In Progress' : 'Idle'}
          </div>
          <div>
            <strong>Active Incidents:</strong> {recoveryData?.activeIncidents || 0}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div style={{
        background: 'white',
        border: '1px solid #e5e7eb',
        borderRadius: '12px',
        padding: '25px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
      }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '20px', color: '#1f2937' }}>
          🎯 Quick Actions
        </h2>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '15px'
        }}>
          <button
            onClick={() => window.location.href = '/health'}
            style={{
              padding: '12px 16px',
              background: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '600'
            }}
          >
            📊 Health Monitor
          </button>
          
          <button
            onClick={() => window.location.href = '/agents'}
            style={{
              padding: '12px 16px',
              background: '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '600'
            }}
          >
            🤖 Agent Console
          </button>
          
          <button
            onClick={() => window.location.href = '/governance'}
            style={{
              padding: '12px 16px',
              background: '#8b5cf6',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '600'
            }}
          >
            🏛️ Governance Board
          </button>
          
          <button
            onClick={() => window.location.href = '/curator'}
            style={{
              padding: '12px 16px',
              background: '#f59e0b',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '600'
            }}
          >
            📝 Curator Workbench
          </button>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard
