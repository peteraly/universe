import React from 'react'

const Layer2SystemHealth = ({ healthData = {} }) => {
  const defaultHealthData = {
    overallHealth: 98,
    apiResponse: 45,
    storageUsage: 78,
    uptime: 99.9,
    activeAgents: 3,
    lastCheck: '2 minutes ago'
  }

  const health = { ...defaultHealthData, ...healthData }

  const getStatusColor = (value, thresholds = { good: 95, warning: 90 }) => {
    if (value >= thresholds.good) return 'text-green-600'
    if (value >= thresholds.warning) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getStatusBg = (value, thresholds = { good: 95, warning: 90 }) => {
    if (value >= thresholds.good) return 'bg-green-50 border-green-200'
    if (value >= thresholds.warning) return 'bg-yellow-50 border-yellow-200'
    return 'bg-red-50 border-red-200'
  }

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">System Health & Observability</h2>
          <p className="text-gray-600">Real-time system status and performance metrics</p>
        </div>

        {/* Health Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className={`p-6 rounded-lg border ${getStatusBg(health.overallHealth)}`}>
            <div className="text-center">
              <div className={`text-3xl font-bold mb-2 ${getStatusColor(health.overallHealth)}`}>
                {health.overallHealth}%
              </div>
              <div className="text-sm font-medium text-gray-700">Overall Health</div>
            </div>
          </div>

          <div className={`p-6 rounded-lg border ${getStatusBg(100 - health.apiResponse, { good: 95, warning: 90 })}`}>
            <div className="text-center">
              <div className={`text-3xl font-bold mb-2 ${getStatusColor(100 - health.apiResponse, { good: 95, warning: 90 })}`}>
                {health.apiResponse}ms
              </div>
              <div className="text-sm font-medium text-gray-700">API Response</div>
            </div>
          </div>

          <div className={`p-6 rounded-lg border ${getStatusBg(100 - health.storageUsage, { good: 80, warning: 90 })}`}>
            <div className="text-center">
              <div className={`text-3xl font-bold mb-2 ${getStatusColor(100 - health.storageUsage, { good: 80, warning: 90 })}`}>
                {health.storageUsage}%
              </div>
              <div className="text-sm font-medium text-gray-700">Storage Usage</div>
            </div>
          </div>

          <div className={`p-6 rounded-lg border ${getStatusBg(health.uptime)}`}>
            <div className="text-center">
              <div className={`text-3xl font-bold mb-2 ${getStatusColor(health.uptime)}`}>
                {health.uptime}%
              </div>
              <div className="text-sm font-medium text-gray-700">Uptime</div>
            </div>
          </div>
        </div>

        {/* System Status Overview */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">System Status</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 mb-2">All Systems Operational</div>
              <div className="text-sm text-gray-600">No critical issues detected</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 mb-2">{health.activeAgents} Active Agents</div>
              <div className="text-sm text-gray-600">All agents responding normally</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-600 mb-2">Last Check: {health.lastCheck}</div>
              <div className="text-sm text-gray-600">Automated monitoring active</div>
            </div>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Metrics</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Event Parsing Speed</span>
              <span className="text-sm text-gray-600">2.3 seconds per event</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Database Response Time</span>
              <span className="text-sm text-gray-600">12ms average</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Memory Usage</span>
              <span className="text-sm text-gray-600">45% of allocated</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">CPU Usage</span>
              <span className="text-sm text-gray-600">23% average</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Layer2SystemHealth


