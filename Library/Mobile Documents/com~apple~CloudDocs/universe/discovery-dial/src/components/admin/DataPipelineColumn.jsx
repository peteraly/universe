import React, { useState } from 'react'

const DataPipelineColumn = ({ pipelineData, onAction }) => {
  const [isRunning, setIsRunning] = useState(false)

  const pipelinePhases = [
    { name: 'Fetch', status: 'complete', icon: '⬇️', description: 'Data collection' },
    { name: 'Process', status: 'complete', icon: '⚙️', description: 'Data transformation' },
    { name: 'Sync', status: 'complete', icon: '🔄', description: 'Database update' }
  ]

  const quickActions = [
    { 
      label: 'Add New Event', 
      type: 'primary', 
      color: 'blue',
      action: () => onAction('addEvent'),
      icon: '➕'
    },
    { 
      label: 'Run Manual Sync', 
      type: 'secondary', 
      color: 'green',
      action: () => handleManualSync(),
      icon: '🔄'
    },
    { 
      label: 'View Reports', 
      type: 'tertiary', 
      color: 'gray',
      action: () => onAction('viewReports'),
      icon: '📊'
    }
  ]

  const handleManualSync = async () => {
    setIsRunning(true)
    // Simulate API call
    setTimeout(() => {
      setIsRunning(false)
      onAction('syncComplete')
    }, 2000)
  }

  const PipelineStatusBar = () => (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700">Pipeline Status</span>
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
          Complete
        </span>
      </div>
      
      <div className="flex items-center justify-between space-x-2">
        {pipelinePhases.map((phase, index) => (
          <div key={index} className="flex-1 text-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm mx-auto mb-2 ${
              phase.status === 'complete' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
            }`}>
              {phase.icon}
            </div>
            <div className="text-xs text-gray-600">{phase.name}</div>
          </div>
        ))}
      </div>
    </div>
  )

  const ActivityLog = () => (
    <div className="space-y-3">
      <h4 className="text-sm font-medium text-gray-700">Pipeline Activity Log</h4>
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Status:</span>
          <span className="text-green-600 font-medium">✓ Complete</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Last Run:</span>
          <span className="font-medium">{pipelineData?.lastRun || '45 minutes ago'}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Next Run:</span>
          <span className="font-medium">{pipelineData?.nextRun || '15 minutes'}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Events Processed:</span>
          <span className="font-medium">{pipelineData?.eventsProcessed || '2,247'}</span>
        </div>
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Column Header */}
      <div className="flex items-center space-x-2">
        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
        <h2 className="text-lg font-semibold text-gray-900">CURATOR'S TOOLKIT</h2>
      </div>

      {/* Content Header */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Content & Data Pipeline</h3>
        
        {/* Pipeline Status */}
        <div className="mb-6">
          <PipelineStatusBar />
        </div>

        {/* Quick Actions */}
        <div className="space-y-3 mb-6">
          <h4 className="text-sm font-medium text-gray-700">Quick Actions</h4>
          <div className="space-y-2">
            {quickActions.map((action, index) => (
              <button
                key={index}
                onClick={action.action}
                disabled={isRunning && action.label === 'Run Manual Sync'}
                className={`w-full py-3 px-4 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center justify-center space-x-2 ${
                  action.type === 'primary' 
                    ? 'bg-blue-600 text-white hover:bg-blue-700' 
                    : action.type === 'secondary'
                    ? 'bg-green-600 text-white hover:bg-green-700'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                } ${isRunning && action.label === 'Run Manual Sync' ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {isRunning && action.label === 'Run Manual Sync' ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Running...</span>
                  </>
                ) : (
                  <>
                    <span>{action.icon}</span>
                    <span>{action.label}</span>
                  </>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Activity Log */}
        <ActivityLog />
      </div>

      {/* Pipeline Details Button */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <button
          onClick={() => onAction('viewPipelineDetails')}
          className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-200 transition-colors duration-200 text-sm font-medium flex items-center justify-center space-x-2"
        >
          <span>🔍</span>
          <span>View Pipeline Details</span>
        </button>
      </div>
    </div>
  )
}

export default DataPipelineColumn
