import React, { useState, useEffect } from 'react'
import VenueTaxonomyEditor from '../components/VenueTaxonomyEditor'
import RBACManager from '../components/RBACManager'

const GlobalConfig = ({ userRole }) => {
  const [activeSection, setActiveSection] = useState('venue')
  const [configData, setConfigData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadConfigData()
  }, [])

  const loadConfigData = async () => {
    // Simulate API call
    const mockConfigData = {
      aiThresholds: {
        confidence: 75,
        accuracy: 90,
        processingTime: 200,
        queueSize: 100
      },
      systemSettings: {
        maxEventsPerPage: 50,
        autoRefreshInterval: 30,
        notificationEnabled: true,
        auditLogging: true
      },
      venueTaxonomy: {
        categories: ['Restaurant', 'Bar', 'Club', 'Theater', 'Museum', 'Park', 'Stadium', 'Convention Center'],
        subcategories: {
          'Restaurant': ['Fine Dining', 'Casual', 'Fast Food', 'Cafe', 'Food Truck'],
          'Bar': ['Sports Bar', 'Cocktail Lounge', 'Pub', 'Wine Bar', 'Brewery'],
          'Club': ['Nightclub', 'Dance Club', 'Private Club', 'Social Club'],
          'Theater': ['Movie Theater', 'Live Theater', 'Concert Hall', 'Comedy Club'],
          'Museum': ['Art Museum', 'History Museum', 'Science Museum', 'Children\'s Museum'],
          'Park': ['City Park', 'National Park', 'Amusement Park', 'Water Park'],
          'Stadium': ['Sports Stadium', 'Arena', 'Concert Venue', 'Racetrack'],
          'Convention Center': ['Conference Center', 'Exhibition Hall', 'Convention Hall']
        }
      },
      rbac: {
        roles: ['super_admin', 'admin', 'curator', 'agent', 'viewer'],
        permissions: {
          'super_admin': ['*'],
          'admin': ['events:read', 'events:write', 'events:delete', 'config:read', 'config:write', 'health:read'],
          'curator': ['events:read', 'events:write', 'config:read'],
          'agent': ['events:read', 'health:read'],
          'viewer': ['events:read']
        }
      }
    }
    
    setTimeout(() => {
      setConfigData(mockConfigData)
      setIsLoading(false)
    }, 500)
  }

  const handleConfigUpdate = (section, data) => {
    setConfigData(prev => ({
      ...prev,
      [section]: data
    }))
    // Simulate API call to save config
    console.log(`Updating ${section} config:`, data)
  }

  const canEditConfig = ['admin', 'super_admin'].includes(userRole)

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading configuration data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Global Configuration & Control</h2>
          <p className="text-gray-600">Governance hub for system settings and access control</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-500">
            <span className="font-medium">Role:</span> 
            <span className="ml-1 text-blue-600">{userRole.toUpperCase()}</span>
          </div>
          {canEditConfig && (
            <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
              Save Changes
            </button>
          )}
        </div>
      </div>

      {/* Section Navigation */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'venue', label: 'Venue Taxonomy Editor', icon: '🏢' },
              { id: 'rbac', label: 'RBAC Manager', icon: '👥' },
              { id: 'thresholds', label: 'AI Confidence Thresholds', icon: '🎯' },
              { id: 'system', label: 'System Settings', icon: '⚙️' }
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
          {activeSection === 'venue' && (
            <VenueTaxonomyEditor
              data={configData?.venueTaxonomy}
              onUpdate={(data) => handleConfigUpdate('venueTaxonomy', data)}
              canEdit={canEditConfig}
            />
          )}

          {activeSection === 'rbac' && (
            <RBACManager
              data={configData?.rbac}
              onUpdate={(data) => handleConfigUpdate('rbac', data)}
              canEdit={canEditConfig}
            />
          )}

          {activeSection === 'thresholds' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">AI Confidence Thresholds</h3>
                <p className="text-sm text-gray-600 mb-6">
                  Configure AI system confidence thresholds. Changes are version-controlled and include safety tooltips.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Object.entries(configData?.aiThresholds || {}).map(([key, value]) => (
                  <div key={key} className="bg-gray-50 rounded-lg p-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2 capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </label>
                    <input
                      type="number"
                      value={value}
                      onChange={(e) => {
                        const newThresholds = { ...configData.aiThresholds, [key]: parseInt(e.target.value) }
                        handleConfigUpdate('aiThresholds', newThresholds)
                      }}
                      disabled={!canEditConfig}
                      className={`w-full border border-gray-300 rounded px-3 py-2 ${
                        canEditConfig ? '' : 'bg-gray-100 cursor-not-allowed'
                      }`}
                    />
                    <div className="mt-2 text-xs text-gray-500">
                      {key === 'confidence' && 'Minimum confidence score for event approval (0-100)'}
                      {key === 'accuracy' && 'Target accuracy for AI classification (0-100)'}
                      {key === 'processingTime' && 'Maximum processing time in milliseconds'}
                      {key === 'queueSize' && 'Maximum queue size before throttling'}
                    </div>
                  </div>
                ))}
              </div>

              {!canEditConfig && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex">
                    <svg className="w-5 h-5 text-yellow-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <h4 className="text-sm font-medium text-yellow-800">Read-Only Access</h4>
                      <p className="text-sm text-yellow-700">You don't have permission to modify AI confidence thresholds.</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeSection === 'system' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">System Settings</h3>
                <p className="text-sm text-gray-600 mb-6">
                  Configure general system behavior and performance settings.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Object.entries(configData?.systemSettings || {}).map(([key, value]) => (
                  <div key={key} className="bg-gray-50 rounded-lg p-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2 capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </label>
                    {typeof value === 'boolean' ? (
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={value}
                          onChange={(e) => {
                            const newSettings = { ...configData.systemSettings, [key]: e.target.checked }
                            handleConfigUpdate('systemSettings', newSettings)
                          }}
                          disabled={!canEditConfig}
                          className="rounded border-gray-300"
                        />
                        <span className="ml-2 text-sm text-gray-600">
                          {value ? 'Enabled' : 'Disabled'}
                        </span>
                      </label>
                    ) : (
                      <input
                        type="number"
                        value={value}
                        onChange={(e) => {
                          const newSettings = { ...configData.systemSettings, [key]: parseInt(e.target.value) }
                          handleConfigUpdate('systemSettings', newSettings)
                        }}
                        disabled={!canEditConfig}
                        className={`w-full border border-gray-300 rounded px-3 py-2 ${
                          canEditConfig ? '' : 'bg-gray-100 cursor-not-allowed'
                        }`}
                      />
                    )}
                    <div className="mt-2 text-xs text-gray-500">
                      {key === 'maxEventsPerPage' && 'Maximum number of events to display per page'}
                      {key === 'autoRefreshInterval' && 'Auto-refresh interval in seconds'}
                      {key === 'notificationEnabled' && 'Enable system notifications'}
                      {key === 'auditLogging' && 'Enable audit logging for all actions'}
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

export default GlobalConfig
