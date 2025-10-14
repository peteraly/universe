import React, { useState, useEffect } from 'react'
import EventCurationHub from './CTOMissionControl/tabs/EventCurationHub'
import SystemHealth from './CTOMissionControl/tabs/SystemHealth'
import GlobalConfig from './CTOMissionControl/tabs/GlobalConfig'
import IntelligenceCenter from './CTOMissionControl/tabs/IntelligenceCenter'

const CTOMissionControl = () => {
  const [activeTab, setActiveTab] = useState('curation')
  const [userRole, setUserRole] = useState('cto') // cto, admin, curator, agent, viewer
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate loading user role and permissions
    setTimeout(() => {
      setIsLoading(false)
    }, 500)
  }, [])

  const tabs = [
    { id: 'curation', label: 'Event Curation Hub', icon: '📊', layer: 'L1' },
    { id: 'health', label: 'System Health', icon: '🏥', layer: 'L2' },
    { id: 'config', label: 'Global Configuration', icon: '⚙️', layer: 'L3' },
    { id: 'intelligence', label: 'Intelligence Center', icon: '🧠', layer: 'L4' }
  ]

  const renderTabContent = () => {
    switch (activeTab) {
      case 'curation':
        return <EventCurationHub userRole={userRole} />
      case 'health':
        return <SystemHealth userRole={userRole} />
      case 'config':
        return <GlobalConfig userRole={userRole} />
      case 'intelligence':
        return <IntelligenceCenter userRole={userRole} />
      default:
        return <EventCurationHub userRole={userRole} />
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">CTO Mission Control</h2>
          <p className="text-gray-600">Loading enterprise admin portal...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">CTO Mission Control</h1>
              <p className="text-gray-600 mt-1">Enterprise Admin Portal • Role: {userRole.toUpperCase()}</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-500">
                <span className="font-medium">Status:</span> 
                <span className="ml-1 text-green-600">● Operational</span>
              </div>
              <a 
                href="/" 
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Back to Discovery Dial
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
                <span className="ml-2 text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                  {tab.layer}
                </span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderTabContent()}
      </div>
    </div>
  )
}

export default CTOMissionControl

