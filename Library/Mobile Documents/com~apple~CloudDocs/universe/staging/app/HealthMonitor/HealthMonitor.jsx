import React, { useState, useEffect } from 'react'

const HealthMonitor = () => {
  const [healthData, setHealthData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [lastUpdate, setLastUpdate] = useState(null)

  useEffect(() => {
    loadHealthData()
    const interval = setInterval(loadHealthData, 30000) // Update every 30 seconds
    return () => clearInterval(interval)
  }, [])

  const loadHealthData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('/api/health/status', {
        headers: {
          'X-Session-ID': 'session_123' // Mock session
        }
      })
      
      const data = await response.json()
      
      if (data.success) {
        setHealthData(data.data)
        setLastUpdate(new Date().toISOString())
      } else {
        setError(data.error || 'Failed to load health data')
      }
    } catch (err) {
      setError('Network error: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'healthy': return '#10b981'
      case 'degraded': return '#f59e0b'
      case 'unhealthy': return '#ef4444'
      default: return '#6b7280'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'healthy': return '✅'
      case 'degraded': return '⚠️'
      case 'unhealthy': return '❌'
      default: return '❓'
    }
  }

  if (loading && !healthData) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '400px',
        fontSize: '1.1rem',
        color: '#666'
      }}>
        Loading system health...
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
        <div>❌ Error loading health data</div>
        <div style={{ fontSize: '0.9rem', color: '#666' }}>{error}</div>
        <button
          onClick={loadHealthData}
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
          System Health Monitor
        </h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '0.9rem', color: '#6b7280' }}>
            Last updated: {lastUpdate ? new Date(lastUpdate).toLocaleTimeString() : 'Never'}
          </span>
          <button
            onClick={loadHealthData}
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

      {/* Overall Status */}
      <div style={{
        background: 'white',
        border: '1px solid #e5e7eb',
        borderRadius: '12px',
        padding: '20px',
        marginBottom: '30px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
      }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '15px', color: '#1f2937' }}>
          Overall System Status
        </h2>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '15px',
          marginBottom: '20px'
        }}>
          <span style={{ fontSize: '2rem' }}>
            {getStatusIcon(healthData?.overallStatus || 'unknown')}
          </span>
          <div>
            <div style={{
              fontSize: '1.2rem',
              fontWeight: '600',
              color: getStatusColor(healthData?.overallStatus || 'unknown')
            }}>
              {healthData?.overallStatus?.toUpperCase() || 'UNKNOWN'}
            </div>
            <div style={{ fontSize: '0.9rem', color: '#6b7280' }}>
              System operational status
            </div>
          </div>
        </div>
        
        {healthData?.uptime && (
          <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap' }}>
            <div>
              <strong>Uptime:</strong> {Math.floor(healthData.uptime / 3600)}h {Math.floor((healthData.uptime % 3600) / 60)}m
            </div>
            <div>
              <strong>Memory Usage:</strong> {healthData.memoryUsage ? Math.round(healthData.memoryUsage.used / 1024 / 1024) : 'N/A'}MB
            </div>
            <div>
              <strong>Last Check:</strong> {healthData.lastCheck ? new Date(healthData.lastCheck).toLocaleString() : 'N/A'}
            </div>
          </div>
        )}
      </div>

      {/* Component Status */}
      <div style={{
        background: 'white',
        border: '1px solid #e5e7eb',
        borderRadius: '12px',
        padding: '20px',
        marginBottom: '30px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
      }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '20px', color: '#1f2937' }}>
          Component Status
        </h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '15px'
        }}>
          {healthData?.components && Object.entries(healthData.components).map(([component, status]) => (
            <div
              key={component}
              style={{
                padding: '15px',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                background: '#f9fafb'
              }}
            >
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '8px'
              }}>
                <span style={{ fontWeight: '600', textTransform: 'capitalize' }}>
                  {component.replace(/([A-Z])/g, ' $1').trim()}
                </span>
                <span style={{ fontSize: '1.2rem' }}>
                  {getStatusIcon(status)}
                </span>
              </div>
              <div style={{
                fontSize: '0.9rem',
                color: getStatusColor(status),
                fontWeight: '500'
              }}>
                {status.toUpperCase()}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Performance Metrics */}
      <div style={{
        background: 'white',
        border: '1px solid #e5e7eb',
        borderRadius: '12px',
        padding: '20px',
        marginBottom: '30px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
      }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '20px', color: '#1f2937' }}>
          Performance Metrics
        </h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '20px'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: '700', color: '#3b82f6' }}>
              {healthData?.metrics?.responseTime || 'N/A'}ms
            </div>
            <div style={{ fontSize: '0.9rem', color: '#6b7280' }}>Avg Response Time</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: '700', color: '#10b981' }}>
              {healthData?.metrics?.throughput || 'N/A'}
            </div>
            <div style={{ fontSize: '0.9rem', color: '#6b7280' }}>Requests/sec</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: '700', color: '#f59e0b' }}>
              {healthData?.metrics?.errorRate || 'N/A'}%
            </div>
            <div style={{ fontSize: '0.9rem', color: '#6b7280' }}>Error Rate</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: '700', color: '#8b5cf6' }}>
              {healthData?.metrics?.activeConnections || 'N/A'}
            </div>
            <div style={{ fontSize: '0.9rem', color: '#6b7280' }}>Active Connections</div>
          </div>
        </div>
      </div>

      {/* Issues and Alerts */}
      {healthData?.issues && healthData.issues.length > 0 && (
        <div style={{
          background: 'white',
          border: '1px solid #e5e7eb',
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '30px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
        }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '20px', color: '#1f2937' }}>
            Active Issues
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {healthData.issues.map((issue, index) => (
              <div
                key={index}
                style={{
                  padding: '12px',
                  background: '#fef2f2',
                  border: '1px solid #fecaca',
                  borderRadius: '8px',
                  color: '#dc2626'
                }}
              >
                <div style={{ fontWeight: '600', marginBottom: '4px' }}>
                  {issue.severity?.toUpperCase() || 'UNKNOWN'} - {issue.component}
                </div>
                <div style={{ fontSize: '0.9rem' }}>{issue.message}</div>
                {issue.timestamp && (
                  <div style={{ fontSize: '0.8rem', color: '#9ca3af', marginTop: '4px' }}>
                    {new Date(issue.timestamp).toLocaleString()}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* System Information */}
      <div style={{
        background: 'white',
        border: '1px solid #e5e7eb',
        borderRadius: '12px',
        padding: '20px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
      }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '20px', color: '#1f2937' }}>
          System Information
        </h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '15px'
        }}>
          <div>
            <strong>Environment:</strong> {healthData?.environment || 'N/A'}
          </div>
          <div>
            <strong>Version:</strong> {healthData?.version || 'N/A'}
          </div>
          <div>
            <strong>Node Version:</strong> {healthData?.nodeVersion || 'N/A'}
          </div>
          <div>
            <strong>Platform:</strong> {healthData?.platform || 'N/A'}
          </div>
          <div>
            <strong>Architecture:</strong> {healthData?.arch || 'N/A'}
          </div>
          <div>
            <strong>CPU Usage:</strong> {healthData?.cpuUsage || 'N/A'}%
          </div>
        </div>
      </div>
    </div>
  )
}

export default HealthMonitor