import React, { useState, useEffect } from 'react'
import OutcomesDashboard from '../components/OutcomesDashboard'
import IncidentPlayback from '../components/IncidentPlayback'

const IntelligenceCenter = ({ userRole }) => {
  const [activeSection, setActiveSection] = useState('outcomes')
  const [intelligenceData, setIntelligenceData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadIntelligenceData()
  }, [])

  const loadIntelligenceData = async () => {
    // Simulate API call
    const mockIntelligenceData = {
      outcomes: {
        rejectionRate: 12.5,
        intentRate: 87.5,
        accuracy: 94.2,
        processingTime: 145,
        totalEvents: 15420,
        approvedEvents: 13490,
        rejectedEvents: 1930
      },
      incidents: [
        {
          id: 1,
          type: 'AI Classification Error',
          severity: 'P1',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          description: 'AI incorrectly classified 15 events as high-confidence when they should have been flagged for review',
          status: 'resolved',
          resolution: 'Retrained model with additional training data',
          affectedEvents: 15,
          resolutionTime: 45
        },
        {
          id: 2,
          type: 'Data Ingestion Failure',
          severity: 'P0',
          timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
          description: 'Data ingestion pipeline failed due to API rate limiting',
          status: 'resolved',
          resolution: 'Implemented exponential backoff and increased rate limits',
          affectedEvents: 0,
          resolutionTime: 120
        },
        {
          id: 3,
          type: 'Performance Degradation',
          severity: 'P2',
          timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
          description: 'System response time increased by 200% during peak hours',
          status: 'investigating',
          resolution: null,
          affectedEvents: 0,
          resolutionTime: null
        }
      ],
      adminFixes: [
        {
          id: 1,
          type: 'Manual Event Approval',
          timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          description: 'Manually approved 5 events that were incorrectly flagged as low-confidence',
          admin: 'admin@discoverydial.com',
          eventsAffected: 5,
          impact: 'positive'
        },
        {
          id: 2,
          type: 'Category Reclassification',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          description: 'Bulk reclassified 25 events from "Social/Fun" to "Professional"',
          admin: 'curator@discoverydial.com',
          eventsAffected: 25,
          impact: 'neutral'
        },
        {
          id: 3,
          type: 'Venue Correction',
          timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
          description: 'Corrected venue information for 12 events',
          admin: 'admin@discoverydial.com',
          eventsAffected: 12,
          impact: 'positive'
        }
      ]
    }
    
    setTimeout(() => {
      setIntelligenceData(mockIntelligenceData)
      setIsLoading(false)
    }, 500)
  }

  const canAccessIntelligence = ['admin', 'curator', 'cto'].includes(userRole)

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading intelligence data...</p>
        </div>
      </div>
    )
  }

  if (!canAccessIntelligence) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <div className="text-red-600 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Access Denied</h3>
          <p className="text-gray-600">You don't have permission to access the Intelligence Center.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Intelligence & Bug Resolution Center</h2>
          <p className="text-gray-600">Active management and incident resolution</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-500">
            <span className="font-medium">Last Update:</span> 
            <span className="ml-1">{new Date().toLocaleTimeString()}</span>
          </div>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
            Refresh Data
          </button>
        </div>
      </div>

      {/* Section Navigation */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'outcomes', label: 'Outcomes Dashboard', icon: '📊' },
              { id: 'incidents', label: 'Incident Playback', icon: '🔍' },
              { id: 'admin-fixes', label: 'Admin-Assisted Fixes', icon: '🛠️' }
            ].map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeSection === section.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="mr-2">{section.icon}</span>
                {section.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {activeSection === 'outcomes' && (
            <OutcomesDashboard data={intelligenceData?.outcomes} />
          )}

          {activeSection === 'incidents' && (
            <IncidentPlayback incidents={intelligenceData?.incidents} />
          )}

          {activeSection === 'admin-fixes' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Admin-Assisted Fixes</h3>
                <p className="text-sm text-gray-600">
                  Recent manual interventions and corrections by administrators
                </p>
              </div>

              <div className="space-y-4">
                {intelligenceData?.adminFixes.map((fix) => (
                  <div key={fix.id} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h4 className="text-sm font-medium text-gray-900">{fix.type}</h4>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            fix.impact === 'positive' ? 'bg-green-100 text-green-800' :
                            fix.impact === 'negative' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {fix.impact}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{fix.description}</p>
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <span>Admin: {fix.admin}</span>
                          <span>Events: {fix.eventsAffected}</span>
                          <span>Time: {new Date(fix.timestamp).toLocaleString()}</span>
                        </div>
                      </div>
                      <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                        View Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default IntelligenceCenter


