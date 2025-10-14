import React, { useState, useEffect } from 'react'

const GovernanceBoard = () => {
  const [governanceData, setGovernanceData] = useState({
    systemHealth: {
      overall: 'healthy',
      uptime: '99.9%',
      lastIncident: null,
      activeAlerts: 0
    },
    decisionHistory: [],
    policyUpdates: [],
    complianceStatus: {
      gdpr: 'compliant',
      ccpa: 'compliant',
      sox: 'compliant',
      hipaa: 'not_applicable'
    },
    auditLog: [],
    stakeholderMetrics: {
      totalUsers: 0,
      activeAgents: 0,
      eventsProcessed: 0,
      systemLoad: 0
    }
  })
  
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedTab, setSelectedTab] = useState('overview')
  const [showPolicyModal, setShowPolicyModal] = useState(false)
  const [newPolicy, setNewPolicy] = useState({
    title: '',
    description: '',
    category: 'security',
    priority: 'medium',
    effectiveDate: ''
  })

  useEffect(() => {
    loadGovernanceData()
    const interval = setInterval(loadGovernanceData, 30000) // Update every 30 seconds
    return () => clearInterval(interval)
  }, [])

  const loadGovernanceData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Simulate API calls
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const mockData = {
        systemHealth: {
          overall: 'healthy',
          uptime: '99.9%',
          lastIncident: null,
          activeAlerts: 0
        },
        decisionHistory: [
          {
            id: 'dec-001',
            title: 'Approved AI Model Update',
            description: 'Updated to GPT-4 for improved event classification',
            decision: 'approved',
            timestamp: new Date(Date.now() - 3600000).toISOString(),
            stakeholders: ['admin', 'curator'],
            impact: 'high'
          },
          {
            id: 'dec-002',
            title: 'Data Retention Policy Change',
            description: 'Extended retention period to 7 years for compliance',
            decision: 'approved',
            timestamp: new Date(Date.now() - 7200000).toISOString(),
            stakeholders: ['admin', 'legal'],
            impact: 'medium'
          }
        ],
        policyUpdates: [
          {
            id: 'pol-001',
            title: 'Security Policy v2.1',
            description: 'Enhanced encryption requirements',
            status: 'active',
            effectiveDate: new Date(Date.now() - 86400000).toISOString(),
            category: 'security'
          },
          {
            id: 'pol-002',
            title: 'Data Privacy Policy v1.3',
            description: 'Updated GDPR compliance measures',
            status: 'active',
            effectiveDate: new Date(Date.now() - 172800000).toISOString(),
            category: 'privacy'
          }
        ],
        complianceStatus: {
          gdpr: 'compliant',
          ccpa: 'compliant',
          sox: 'compliant',
          hipaa: 'not_applicable'
        },
        auditLog: [
          {
            id: 'audit-001',
            action: 'Policy Update',
            user: 'admin',
            timestamp: new Date(Date.now() - 1800000).toISOString(),
            details: 'Updated security policy v2.1',
            ipAddress: '192.168.1.100'
          },
          {
            id: 'audit-002',
            action: 'Access Granted',
            user: 'curator',
            timestamp: new Date(Date.now() - 3600000).toISOString(),
            details: 'Granted access to governance dashboard',
            ipAddress: '192.168.1.101'
          }
        ],
        stakeholderMetrics: {
          totalUsers: 1247,
          activeAgents: 12,
          eventsProcessed: 45678,
          systemLoad: 23
        }
      }
      
      setGovernanceData(mockData)
    } catch (err) {
      setError('Failed to load governance data: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleCreatePolicy = async () => {
    try {
      const policyData = {
        ...newPolicy,
        id: `pol-${Date.now()}`,
        status: 'draft',
        createdAt: new Date().toISOString(),
        createdBy: 'admin'
      }
      
      setGovernanceData(prev => ({
        ...prev,
        policyUpdates: [policyData, ...prev.policyUpdates]
      }))
      
      setShowPolicyModal(false)
      setNewPolicy({
        title: '',
        description: '',
        category: 'security',
        priority: 'medium',
        effectiveDate: ''
      })
    } catch (err) {
      setError('Failed to create policy: ' + err.message)
    }
  }

  const getComplianceColor = (status) => {
    switch (status) {
      case 'compliant': return '#10b981'
      case 'non_compliant': return '#ef4444'
      case 'pending': return '#f59e0b'
      case 'not_applicable': return '#6b7280'
      default: return '#6b7280'
    }
  }

  const getComplianceIcon = (status) => {
    switch (status) {
      case 'compliant': return '✅'
      case 'non_compliant': return '❌'
      case 'pending': return '⏳'
      case 'not_applicable': return '➖'
      default: return '❓'
    }
  }

  const getImpactColor = (impact) => {
    switch (impact) {
      case 'high': return '#ef4444'
      case 'medium': return '#f59e0b'
      case 'low': return '#10b981'
      default: return '#6b7280'
    }
  }

  const getDecisionColor = (decision) => {
    switch (decision) {
      case 'approved': return '#10b981'
      case 'rejected': return '#ef4444'
      case 'pending': return '#f59e0b'
      default: return '#6b7280'
    }
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
        Loading governance dashboard...
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
        <div>❌ Error loading governance dashboard</div>
        <div style={{ fontSize: '0.9rem', color: '#666' }}>{error}</div>
        <button
          onClick={loadGovernanceData}
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
          🏛️ Governance Board
        </h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '0.9rem', color: '#6b7280' }}>
            Last updated: {new Date().toLocaleTimeString()}
          </span>
          <button
            onClick={() => setShowPolicyModal(true)}
            style={{
              padding: '8px 16px',
              background: '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            + New Policy
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div style={{
        display: 'flex',
        gap: '10px',
        marginBottom: '30px',
        borderBottom: '1px solid #e5e7eb'
      }}>
        {[
          { id: 'overview', label: 'Overview', icon: '📊' },
          { id: 'decisions', label: 'Decisions', icon: '⚖️' },
          { id: 'policies', label: 'Policies', icon: '📋' },
          { id: 'compliance', label: 'Compliance', icon: '🛡️' },
          { id: 'audit', label: 'Audit Log', icon: '📝' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setSelectedTab(tab.id)}
            style={{
              padding: '10px 20px',
              background: selectedTab === tab.id ? '#3b82f6' : 'transparent',
              color: selectedTab === tab.id ? 'white' : '#6b7280',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '0.9rem',
              fontWeight: '500'
            }}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {selectedTab === 'overview' && (
        <div>
          {/* System Health Overview */}
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
              <div style={{ fontSize: '2rem', fontWeight: '700', color: '#10b981' }}>
                {governanceData.systemHealth.uptime}
              </div>
              <div style={{ fontSize: '0.9rem', color: '#6b7280' }}>System Uptime</div>
            </div>
            
            <div style={{
              background: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '12px',
              padding: '20px',
              textAlign: 'center',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
            }}>
              <div style={{ fontSize: '2rem', fontWeight: '700', color: '#3b82f6' }}>
                {governanceData.stakeholderMetrics.totalUsers.toLocaleString()}
              </div>
              <div style={{ fontSize: '0.9rem', color: '#6b7280' }}>Total Users</div>
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
                {governanceData.stakeholderMetrics.activeAgents}
              </div>
              <div style={{ fontSize: '0.9rem', color: '#6b7280' }}>Active Agents</div>
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
                {governanceData.stakeholderMetrics.eventsProcessed.toLocaleString()}
              </div>
              <div style={{ fontSize: '0.9rem', color: '#6b7280' }}>Events Processed</div>
            </div>
          </div>

          {/* Recent Decisions */}
          <div style={{
            background: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '12px',
            padding: '20px',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
          }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '20px', color: '#1f2937' }}>
              Recent Decisions
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {governanceData.decisionHistory.slice(0, 3).map(decision => (
                <div
                  key={decision.id}
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
                    alignItems: 'flex-start',
                    marginBottom: '10px'
                  }}>
                    <h3 style={{
                      fontSize: '1.1rem',
                      fontWeight: '600',
                      color: '#1f2937',
                      margin: 0
                    }}>
                      {decision.title}
                    </h3>
                    <span style={{
                      padding: '4px 12px',
                      borderRadius: '20px',
                      fontSize: '0.8rem',
                      fontWeight: '600',
                      background: getDecisionColor(decision.decision),
                      color: 'white'
                    }}>
                      {decision.decision.toUpperCase()}
                    </span>
                  </div>
                  <p style={{ margin: '5px 0', color: '#6b7280', fontSize: '0.9rem' }}>
                    {decision.description}
                  </p>
                  <div style={{
                    display: 'flex',
                    gap: '15px',
                    fontSize: '0.8rem',
                    color: '#9ca3af'
                  }}>
                    <span>Impact: {decision.impact}</span>
                    <span>Stakeholders: {decision.stakeholders.join(', ')}</span>
                    <span>{new Date(decision.timestamp).toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Decisions Tab */}
      {selectedTab === 'decisions' && (
        <div style={{
          background: 'white',
          border: '1px solid #e5e7eb',
          borderRadius: '12px',
          padding: '20px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
        }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '20px', color: '#1f2937' }}>
            Decision History
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {governanceData.decisionHistory.map(decision => (
              <div
                key={decision.id}
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
                  marginBottom: '15px'
                }}>
                  <h3 style={{
                    fontSize: '1.2rem',
                    fontWeight: '600',
                    color: '#1f2937',
                    margin: 0
                  }}>
                    {decision.title}
                  </h3>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <span style={{
                      padding: '4px 12px',
                      borderRadius: '20px',
                      fontSize: '0.8rem',
                      fontWeight: '600',
                      background: getImpactColor(decision.impact),
                      color: 'white'
                    }}>
                      {decision.impact.toUpperCase()}
                    </span>
                    <span style={{
                      padding: '4px 12px',
                      borderRadius: '20px',
                      fontSize: '0.8rem',
                      fontWeight: '600',
                      background: getDecisionColor(decision.decision),
                      color: 'white'
                    }}>
                      {decision.decision.toUpperCase()}
                    </span>
                  </div>
                </div>
                <p style={{ margin: '10px 0', color: '#6b7280' }}>
                  {decision.description}
                </p>
                <div style={{
                  display: 'flex',
                  gap: '20px',
                  fontSize: '0.9rem',
                  color: '#6b7280'
                }}>
                  <span>Stakeholders: {decision.stakeholders.join(', ')}</span>
                  <span>Timestamp: {new Date(decision.timestamp).toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Policies Tab */}
      {selectedTab === 'policies' && (
        <div style={{
          background: 'white',
          border: '1px solid #e5e7eb',
          borderRadius: '12px',
          padding: '20px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
        }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '20px', color: '#1f2937' }}>
            Policy Management
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {governanceData.policyUpdates.map(policy => (
              <div
                key={policy.id}
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
                  marginBottom: '15px'
                }}>
                  <h3 style={{
                    fontSize: '1.2rem',
                    fontWeight: '600',
                    color: '#1f2937',
                    margin: 0
                  }}>
                    {policy.title}
                  </h3>
                  <span style={{
                    padding: '4px 12px',
                    borderRadius: '20px',
                    fontSize: '0.8rem',
                    fontWeight: '600',
                    background: policy.status === 'active' ? '#10b981' : '#f59e0b',
                    color: 'white'
                  }}>
                    {policy.status.toUpperCase()}
                  </span>
                </div>
                <p style={{ margin: '10px 0', color: '#6b7280' }}>
                  {policy.description}
                </p>
                <div style={{
                  display: 'flex',
                  gap: '20px',
                  fontSize: '0.9rem',
                  color: '#6b7280'
                }}>
                  <span>Category: {policy.category}</span>
                  <span>Effective: {new Date(policy.effectiveDate).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Compliance Tab */}
      {selectedTab === 'compliance' && (
        <div style={{
          background: 'white',
          border: '1px solid #e5e7eb',
          borderRadius: '12px',
          padding: '20px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
        }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '20px', color: '#1f2937' }}>
            Compliance Status
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '20px'
          }}>
            {Object.entries(governanceData.complianceStatus).map(([framework, status]) => (
              <div
                key={framework}
                style={{
                  padding: '20px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  background: '#f9fafb',
                  textAlign: 'center'
                }}
              >
                <div style={{ fontSize: '2rem', marginBottom: '10px' }}>
                  {getComplianceIcon(status)}
                </div>
                <h3 style={{
                  fontSize: '1.1rem',
                  fontWeight: '600',
                  color: '#1f2937',
                  margin: '0 0 10px 0'
                }}>
                  {framework.toUpperCase()}
                </h3>
                <div style={{
                  padding: '4px 12px',
                  borderRadius: '20px',
                  fontSize: '0.8rem',
                  fontWeight: '600',
                  background: getComplianceColor(status),
                  color: 'white',
                  display: 'inline-block'
                }}>
                  {status.replace('_', ' ').toUpperCase()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Audit Tab */}
      {selectedTab === 'audit' && (
        <div style={{
          background: 'white',
          border: '1px solid #e5e7eb',
          borderRadius: '12px',
          padding: '20px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
        }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '20px', color: '#1f2937' }}>
            Audit Log
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {governanceData.auditLog.map(entry => (
              <div
                key={entry.id}
                style={{
                  padding: '15px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px',
                  background: '#f9fafb'
                }}
              >
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '5px'
                }}>
                  <span style={{
                    fontSize: '1rem',
                    fontWeight: '600',
                    color: '#1f2937'
                  }}>
                    {entry.action}
                  </span>
                  <span style={{
                    fontSize: '0.8rem',
                    color: '#6b7280'
                  }}>
                    {new Date(entry.timestamp).toLocaleString()}
                  </span>
                </div>
                <div style={{
                  fontSize: '0.9rem',
                  color: '#6b7280',
                  marginBottom: '5px'
                }}>
                  {entry.details}
                </div>
                <div style={{
                  fontSize: '0.8rem',
                  color: '#9ca3af'
                }}>
                  User: {entry.user} | IP: {entry.ipAddress}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Create Policy Modal */}
      {showPolicyModal && (
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
              Create New Policy
            </h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>
                  Title:
                </label>
                <input
                  type="text"
                  value={newPolicy.title}
                  onChange={(e) => setNewPolicy({ ...newPolicy, title: e.target.value })}
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
                  Description:
                </label>
                <textarea
                  value={newPolicy.description}
                  onChange={(e) => setNewPolicy({ ...newPolicy, description: e.target.value })}
                  rows={3}
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
                  Category:
                </label>
                <select
                  value={newPolicy.category}
                  onChange={(e) => setNewPolicy({ ...newPolicy, category: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #d1d5db',
                    borderRadius: '4px'
                  }}
                >
                  <option value="security">Security</option>
                  <option value="privacy">Privacy</option>
                  <option value="compliance">Compliance</option>
                  <option value="operational">Operational</option>
                </select>
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>
                  Priority:
                </label>
                <select
                  value={newPolicy.priority}
                  onChange={(e) => setNewPolicy({ ...newPolicy, priority: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #d1d5db',
                    borderRadius: '4px'
                  }}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>
                  Effective Date:
                </label>
                <input
                  type="date"
                  value={newPolicy.effectiveDate}
                  onChange={(e) => setNewPolicy({ ...newPolicy, effectiveDate: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #d1d5db',
                    borderRadius: '4px'
                  }}
                />
              </div>
            </div>
            
            <div style={{
              display: 'flex',
              gap: '10px',
              justifyContent: 'flex-end',
              marginTop: '20px'
            }}>
              <button
                onClick={() => setShowPolicyModal(false)}
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
                onClick={handleCreatePolicy}
                disabled={!newPolicy.title || !newPolicy.description}
                style={{
                  padding: '8px 16px',
                  background: newPolicy.title && newPolicy.description ? '#10b981' : '#9ca3af',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: newPolicy.title && newPolicy.description ? 'pointer' : 'not-allowed'
                }}
              >
                Create Policy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default GovernanceBoard

