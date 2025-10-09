import React, { useState } from 'react'

const AlertsFeed = ({ alerts }) => {
  const [filterSeverity, setFilterSeverity] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'P0': return 'text-red-600 bg-red-100 border-red-200'
      case 'P1': return 'text-orange-600 bg-orange-100 border-orange-200'
      case 'P2': return 'text-yellow-600 bg-yellow-100 border-yellow-200'
      default: return 'text-gray-600 bg-gray-100 border-gray-200'
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'text-red-600 bg-red-100'
      case 'acknowledged': return 'text-yellow-600 bg-yellow-100'
      case 'resolved': return 'text-green-600 bg-green-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'P0': return '🚨'
      case 'P1': return '⚠️'
      case 'P2': return 'ℹ️'
      default: return '📋'
    }
  }

  const filteredAlerts = alerts.filter(alert => {
    const severityMatch = filterSeverity === 'all' || alert.severity === filterSeverity
    const statusMatch = filterStatus === 'all' || alert.status === filterStatus
    return severityMatch && statusMatch
  })

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now - date
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    
    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    return date.toLocaleDateString()
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-medium text-gray-900">P0/P1 Alerts Feed</h3>
            <p className="text-sm text-gray-600">Real-time incident notifications</p>
          </div>
          <div className="flex items-center space-x-2">
            <select
              value={filterSeverity}
              onChange={(e) => setFilterSeverity(e.target.value)}
              className="border border-gray-300 rounded px-2 py-1 text-sm"
            >
              <option value="all">All Severity</option>
              <option value="P0">P0 - Critical</option>
              <option value="P1">P1 - High</option>
              <option value="P2">P2 - Low</option>
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="border border-gray-300 rounded px-2 py-1 text-sm"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="acknowledged">Acknowledged</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>
        </div>
      </div>

      <div className="max-h-96 overflow-y-auto">
        {filteredAlerts.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p>No alerts match the current filters</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredAlerts.map((alert) => (
              <div key={alert.id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start space-x-3">
                  <div className={`p-2 rounded-full ${getSeverityColor(alert.severity)}`}>
                    <span className="text-lg">{getSeverityIcon(alert.severity)}</span>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSeverityColor(alert.severity)}`}>
                          {alert.severity}
                        </span>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(alert.status)}`}>
                          {alert.status}
                        </span>
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                          {alert.component}
                        </span>
                      </div>
                      <span className="text-xs text-gray-500">
                        {formatTimestamp(alert.timestamp)}
                      </span>
                    </div>
                    
                    <h4 className="text-sm font-medium text-gray-900 mt-2">
                      {alert.title}
                    </h4>
                    
                    <p className="text-sm text-gray-600 mt-1">
                      {alert.description}
                    </p>
                    
                    <div className="flex items-center space-x-4 mt-3">
                      <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                        View Details
                      </button>
                      <button className="text-green-600 hover:text-green-800 text-sm font-medium">
                        Acknowledge
                      </button>
                      <button className="text-gray-600 hover:text-gray-800 text-sm font-medium">
                        Resolve
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Alert Summary */}
      <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-4">
            <span className="text-gray-600">
              <span className="font-medium text-red-600">
                {alerts.filter(a => a.severity === 'P0').length}
              </span> P0
            </span>
            <span className="text-gray-600">
              <span className="font-medium text-orange-600">
                {alerts.filter(a => a.severity === 'P1').length}
              </span> P1
            </span>
            <span className="text-gray-600">
              <span className="font-medium text-yellow-600">
                {alerts.filter(a => a.severity === 'P2').length}
              </span> P2
            </span>
          </div>
          <div className="text-gray-500">
            Total: {alerts.length} alerts
          </div>
        </div>
      </div>
    </div>
  )
}

export default AlertsFeed
