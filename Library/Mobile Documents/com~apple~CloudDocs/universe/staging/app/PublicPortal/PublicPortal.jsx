import React, { useState, useEffect } from 'react'

const PublicPortal = () => {
  const [publicMetrics, setPublicMetrics] = useState({
    systemStatus: {
      overall: 'operational',
      uptime: '99.9%',
      lastIncident: null,
      maintenanceWindow: null
    },
    performanceMetrics: {
      averageResponseTime: 150,
      totalRequests: 0,
      successRate: 99.8,
      activeUsers: 0
    },
    serviceHealth: {
      api: 'healthy',
      database: 'healthy',
      cache: 'healthy',
      cdn: 'healthy'
    },
    transparency: {
      dataRetention: '7 years',
      privacyCompliance: 'GDPR, CCPA compliant',
      securityAudits: 'Quarterly',
      lastAudit: '2024-01-15'
    },
    incidentHistory: [],
    maintenanceSchedule: []
  })
  
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedTimeframe, setSelectedTimeframe] = useState('24h')

  useEffect(() => {
    loadPublicMetrics()
    const interval = setInterval(loadPublicMetrics, 60000) // Update every minute
    return () => clearInterval(interval)
  }, [])

  const loadPublicMetrics = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 300))
      
      const mockData = {
        systemStatus: {
          overall: 'operational',
          uptime: '99.9%',
          lastIncident: null,
          maintenanceWindow: null
        },
        performanceMetrics: {
          averageResponseTime: Math.floor(Math.random() * 50) + 120, // 120-170ms
          totalRequests: Math.floor(Math.random() * 10000) + 50000,
          successRate: 99.5 + Math.random() * 0.5,
          activeUsers: Math.floor(Math.random() * 100) + 200
        },
        serviceHealth: {
          api: 'healthy',
          database: 'healthy',
          cache: 'healthy',
          cdn: 'healthy'
        },
        transparency: {
          dataRetention: '7 years',
          privacyCompliance: 'GDPR, CCPA compliant',
          securityAudits: 'Quarterly',
          lastAudit: '2024-01-15'
        },
        incidentHistory: [
          {
            id: 'inc-001',
            title: 'Database Performance Issue',
            severity: 'medium',
            status: 'resolved',
            startTime: new Date(Date.now() - 86400000).toISOString(),
            endTime: new Date(Date.now() - 82800000).toISOString(),
            description: 'Temporary slowdown in database queries due to high load',
            impact: 'Some users experienced slower response times'
          },
          {
            id: 'inc-002',
            title: 'API Rate Limiting Adjustment',
            severity: 'low',
            status: 'resolved',
            startTime: new Date(Date.now() - 172800000).toISOString(),
            endTime: new Date(Date.now() - 165600000).toISOString(),
            description: 'Adjusted rate limiting to improve user experience',
            impact: 'Improved API performance for high-volume users'
          }
        ],
        maintenanceSchedule: [
          {
            id: 'maint-001',
            title: 'Scheduled Database Maintenance',
            scheduledDate: new Date(Date.now() + 86400000).toISOString(),
            duration: '2 hours',
            description: 'Routine database optimization and cleanup',
            impact: 'Service may be temporarily unavailable'
          },
          {
            id: 'maint-002',
            title: 'Security Updates Deployment',
            scheduledDate: new Date(Date.now() + 259200000).toISOString(),
            duration: '30 minutes',
            description: 'Deploy latest security patches and updates',
            impact: 'Brief service interruption expected'
          }
        ]
      }
      
      setPublicMetrics(mockData)
    } catch (err) {
      setError('Failed to load public metrics: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'operational':
      case 'healthy':
        return '#10b981'
      case 'degraded':
        return '#f59e0b'
      case 'outage':
      case 'unhealthy':
        return '#ef4444'
      default:
        return '#6b7280'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'operational':
      case 'healthy':
        return '🟢'
      case 'degraded':
        return '🟡'
      case 'outage':
      case 'unhealthy':
        return '🔴'
      default:
        return '⚪'
    }
  }

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical':
        return '#ef4444'
      case 'high':
        return '#f59e0b'
      case 'medium':
        return '#3b82f6'
      case 'low':
        return '#10b981'
      default:
        return '#6b7280'
    }
  }

  const formatUptime = (uptime) => {
    return uptime
  }

  const formatResponseTime = (time) => {
    return `${time}ms`
  }

  const formatSuccessRate = (rate) => {
    return `${rate.toFixed(1)}%`
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
        Loading public metrics...
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
        <div>❌ Error loading public metrics</div>
        <div style={{ fontSize: '0.9rem', color: '#666' }}>{error}</div>
        <button
          onClick={loadPublicMetrics}
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
        textAlign: 'center',
        marginBottom: '40px',
        paddingBottom: '20px',
        borderBottom: '1px solid #e5e7eb'
      }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: '700', color: '#1f2937', margin: '0 0 10px 0' }}>
          🌐 Discovery Dial Status
        </h1>
        <p style={{ fontSize: '1.1rem', color: '#6b7280', margin: 0 }}>
          Real-time system status and performance metrics
        </p>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '10px',
          marginTop: '15px',
          fontSize: '0.9rem',
          color: '#6b7280'
        }}>
          <span>Last updated: {new Date().toLocaleTimeString()}</span>
          <span>•</span>
          <span>Auto-refresh: 60s</span>
        </div>
      </div>

      {/* System Status Overview */}
      <div style={{
        background: 'white',
        border: '1px solid #e5e7eb',
        borderRadius: '12px',
        padding: '25px',
        marginBottom: '30px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '15px',
          marginBottom: '20px'
        }}>
          <span style={{ fontSize: '2rem' }}>
            {getStatusIcon(publicMetrics.systemStatus.overall)}
          </span>
          <h2 style={{
            fontSize: '1.8rem',
            fontWeight: '600',
            color: '#1f2937',
            margin: 0
          }}>
            {publicMetrics.systemStatus.overall.toUpperCase()}
          </h2>
        </div>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '20px',
          textAlign: 'center'
        }}>
          <div>
            <div style={{ fontSize: '2rem', fontWeight: '700', color: '#10b981' }}>
              {formatUptime(publicMetrics.systemStatus.uptime)}
            </div>
            <div style={{ fontSize: '0.9rem', color: '#6b7280' }}>Uptime</div>
          </div>
          
          <div>
            <div style={{ fontSize: '2rem', fontWeight: '700', color: '#3b82f6' }}>
              {formatResponseTime(publicMetrics.performanceMetrics.averageResponseTime)}
            </div>
            <div style={{ fontSize: '0.9rem', color: '#6b7280' }}>Avg Response Time</div>
          </div>
          
          <div>
            <div style={{ fontSize: '2rem', fontWeight: '700', color: '#8b5cf6' }}>
              {formatSuccessRate(publicMetrics.performanceMetrics.successRate)}
            </div>
            <div style={{ fontSize: '0.9rem', color: '#6b7280' }}>Success Rate</div>
          </div>
          
          <div>
            <div style={{ fontSize: '2rem', fontWeight: '700', color: '#f59e0b' }}>
              {publicMetrics.performanceMetrics.activeUsers}
            </div>
            <div style={{ fontSize: '0.9rem', color: '#6b7280' }}>Active Users</div>
          </div>
        </div>
      </div>

      {/* Service Health */}
      <div style={{
        background: 'white',
        border: '1px solid #e5e7eb',
        borderRadius: '12px',
        padding: '25px',
        marginBottom: '30px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
      }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '20px', color: '#1f2937' }}>
          Service Health
        </h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: '15px'
        }}>
          {Object.entries(publicMetrics.serviceHealth).map(([service, status]) => (
            <div
              key={service}
              style={{
                padding: '15px',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                background: '#f9fafb',
                textAlign: 'center'
              }}
            >
              <div style={{ fontSize: '1.5rem', marginBottom: '8px' }}>
                {getStatusIcon(status)}
              </div>
              <div style={{
                fontSize: '1rem',
                fontWeight: '600',
                color: '#1f2937',
                marginBottom: '5px'
              }}>
                {service.toUpperCase()}
              </div>
              <div style={{
                fontSize: '0.8rem',
                color: getStatusColor(status),
                fontWeight: '600'
              }}>
                {status.toUpperCase()}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Incidents */}
      <div style={{
        background: 'white',
        border: '1px solid #e5e7eb',
        borderRadius: '12px',
        padding: '25px',
        marginBottom: '30px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
      }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '20px', color: '#1f2937' }}>
          Recent Incidents
        </h2>
        {publicMetrics.incidentHistory.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '40px',
            color: '#6b7280',
            fontSize: '1rem'
          }}>
            🎉 No recent incidents
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {publicMetrics.incidentHistory.map(incident => (
              <div
                key={incident.id}
                style={{
                  padding: '20px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  background: '#f9fafb'
                }}
              >
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: '10px'
                }}>
                  <h3 style={{
                    fontSize: '1.1rem',
                    fontWeight: '600',
                    color: '#1f2937',
                    margin: 0
                  }}>
                    {incident.title}
                  </h3>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <span style={{
                      padding: '4px 8px',
                      borderRadius: '12px',
                      fontSize: '0.7rem',
                      fontWeight: '600',
                      background: getSeverityColor(incident.severity),
                      color: 'white'
                    }}>
                      {incident.severity.toUpperCase()}
                    </span>
                    <span style={{
                      padding: '4px 8px',
                      borderRadius: '12px',
                      fontSize: '0.7rem',
                      fontWeight: '600',
                      background: incident.status === 'resolved' ? '#10b981' : '#f59e0b',
                      color: 'white'
                    }}>
                      {incident.status.toUpperCase()}
                    </span>
                  </div>
                </div>
                <p style={{ margin: '5px 0', color: '#6b7280', fontSize: '0.9rem' }}>
                  {incident.description}
                </p>
                <div style={{
                  fontSize: '0.8rem',
                  color: '#9ca3af',
                  marginTop: '10px'
                }}>
                  <div>Impact: {incident.impact}</div>
                  <div>
                    Duration: {new Date(incident.startTime).toLocaleString()} - {new Date(incident.endTime).toLocaleString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Scheduled Maintenance */}
      <div style={{
        background: 'white',
        border: '1px solid #e5e7eb',
        borderRadius: '12px',
        padding: '25px',
        marginBottom: '30px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
      }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '20px', color: '#1f2937' }}>
          Scheduled Maintenance
        </h2>
        {publicMetrics.maintenanceSchedule.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '40px',
            color: '#6b7280',
            fontSize: '1rem'
          }}>
            📅 No scheduled maintenance
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {publicMetrics.maintenanceSchedule.map(maintenance => (
              <div
                key={maintenance.id}
                style={{
                  padding: '20px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  background: '#f9fafb'
                }}
              >
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: '10px'
                }}>
                  <h3 style={{
                    fontSize: '1.1rem',
                    fontWeight: '600',
                    color: '#1f2937',
                    margin: 0
                  }}>
                    {maintenance.title}
                  </h3>
                  <span style={{
                    padding: '4px 8px',
                    borderRadius: '12px',
                    fontSize: '0.7rem',
                    fontWeight: '600',
                    background: '#3b82f6',
                    color: 'white'
                  }}>
                    SCHEDULED
                  </span>
                </div>
                <p style={{ margin: '5px 0', color: '#6b7280', fontSize: '0.9rem' }}>
                  {maintenance.description}
                </p>
                <div style={{
                  fontSize: '0.8rem',
                  color: '#9ca3af',
                  marginTop: '10px'
                }}>
                  <div>Scheduled: {new Date(maintenance.scheduledDate).toLocaleString()}</div>
                  <div>Duration: {maintenance.duration}</div>
                  <div>Impact: {maintenance.impact}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Transparency Information */}
      <div style={{
        background: 'white',
        border: '1px solid #e5e7eb',
        borderRadius: '12px',
        padding: '25px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
      }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '20px', color: '#1f2937' }}>
          Transparency & Compliance
        </h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '20px'
        }}>
          <div style={{
            padding: '15px',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            background: '#f9fafb'
          }}>
            <h3 style={{
              fontSize: '1rem',
              fontWeight: '600',
              color: '#1f2937',
              margin: '0 0 10px 0'
            }}>
              Data Retention
            </h3>
            <p style={{ margin: 0, color: '#6b7280', fontSize: '0.9rem' }}>
              {publicMetrics.transparency.dataRetention}
            </p>
          </div>
          
          <div style={{
            padding: '15px',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            background: '#f9fafb'
          }}>
            <h3 style={{
              fontSize: '1rem',
              fontWeight: '600',
              color: '#1f2937',
              margin: '0 0 10px 0'
            }}>
              Privacy Compliance
            </h3>
            <p style={{ margin: 0, color: '#6b7280', fontSize: '0.9rem' }}>
              {publicMetrics.transparency.privacyCompliance}
            </p>
          </div>
          
          <div style={{
            padding: '15px',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            background: '#f9fafb'
          }}>
            <h3 style={{
              fontSize: '1rem',
              fontWeight: '600',
              color: '#1f2937',
              margin: '0 0 10px 0'
            }}>
              Security Audits
            </h3>
            <p style={{ margin: 0, color: '#6b7280', fontSize: '0.9rem' }}>
              {publicMetrics.transparency.securityAudits}
            </p>
          </div>
          
          <div style={{
            padding: '15px',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            background: '#f9fafb'
          }}>
            <h3 style={{
              fontSize: '1rem',
              fontWeight: '600',
              color: '#1f2937',
              margin: '0 0 10px 0'
            }}>
              Last Audit
            </h3>
            <p style={{ margin: 0, color: '#6b7280', fontSize: '0.9rem' }}>
              {publicMetrics.transparency.lastAudit}
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{
        textAlign: 'center',
        marginTop: '40px',
        padding: '20px',
        borderTop: '1px solid #e5e7eb',
        color: '#6b7280',
        fontSize: '0.9rem'
      }}>
        <p style={{ margin: '0 0 10px 0' }}>
          This status page is updated in real-time and provides transparency into our system performance.
        </p>
        <p style={{ margin: 0 }}>
          For technical support or questions, please contact our team.
        </p>
      </div>
    </div>
  )
}

export default PublicPortal

