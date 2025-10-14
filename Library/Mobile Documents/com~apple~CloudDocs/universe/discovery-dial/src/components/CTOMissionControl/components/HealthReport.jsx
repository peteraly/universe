import React from 'react'

const HealthReport = ({ healthData }) => {
  if (!healthData) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-center text-gray-500">
          <p>No health data available</p>
        </div>
      </div>
    )
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'healthy': return 'text-green-600 bg-green-100'
      case 'warning': return 'text-yellow-600 bg-yellow-100'
      case 'critical': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'healthy': return '✓'
      case 'warning': return '⚠'
      case 'critical': return '✗'
      default: return '?'
    }
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">Ingestion Health Report</h3>
        <p className="text-sm text-gray-600">Real-time system performance metrics</p>
      </div>
      
      <div className="p-6 space-y-6">
        {/* Ingestion Metrics */}
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-3">Data Ingestion</h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Throughput</p>
                  <p className="text-2xl font-bold text-gray-900">{healthData.ingestion.throughput}</p>
                  <p className="text-xs text-gray-500">events/min</p>
                </div>
                <div className={`p-2 rounded-full ${getStatusColor(healthData.ingestion.status)}`}>
                  <span className="text-lg">{getStatusIcon(healthData.ingestion.status)}</span>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Latency</p>
                  <p className="text-2xl font-bold text-gray-900">{healthData.ingestion.latency}ms</p>
                  <p className="text-xs text-gray-500">avg response</p>
                </div>
                <div className={`p-2 rounded-full ${getStatusColor(healthData.ingestion.status)}`}>
                  <span className="text-lg">{getStatusIcon(healthData.ingestion.status)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* AI Processing Metrics */}
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-3">AI Processing</h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Processing Time</p>
                  <p className="text-2xl font-bold text-gray-900">{healthData.ai.processingTime}ms</p>
                  <p className="text-xs text-gray-500">avg per event</p>
                </div>
                <div className={`p-2 rounded-full ${getStatusColor(healthData.ai.status)}`}>
                  <span className="text-lg">{getStatusIcon(healthData.ai.status)}</span>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Accuracy</p>
                  <p className="text-2xl font-bold text-gray-900">{healthData.ai.accuracy}%</p>
                  <p className="text-xs text-gray-500">classification</p>
                </div>
                <div className={`p-2 rounded-full ${getStatusColor(healthData.ai.status)}`}>
                  <span className="text-lg">{getStatusIcon(healthData.ai.status)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Database Metrics */}
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-3">Database</h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Connections</p>
                  <p className="text-2xl font-bold text-gray-900">{healthData.database.connections}</p>
                  <p className="text-xs text-gray-500">active</p>
                </div>
                <div className={`p-2 rounded-full ${getStatusColor(healthData.database.status)}`}>
                  <span className="text-lg">{getStatusIcon(healthData.database.status)}</span>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Query Time</p>
                  <p className="text-2xl font-bold text-gray-900">{healthData.database.queryTime}ms</p>
                  <p className="text-xs text-gray-500">avg</p>
                </div>
                <div className={`p-2 rounded-full ${getStatusColor(healthData.database.status)}`}>
                  <span className="text-lg">{getStatusIcon(healthData.database.status)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* API Metrics */}
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-3">API Performance</h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Response Time</p>
                  <p className="text-2xl font-bold text-gray-900">{healthData.api.responseTime}ms</p>
                  <p className="text-xs text-gray-500">avg</p>
                </div>
                <div className={`p-2 rounded-full ${getStatusColor(healthData.api.status)}`}>
                  <span className="text-lg">{getStatusIcon(healthData.api.status)}</span>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Uptime</p>
                  <p className="text-2xl font-bold text-gray-900">{healthData.api.uptime}%</p>
                  <p className="text-xs text-gray-500">availability</p>
                </div>
                <div className={`p-2 rounded-full ${getStatusColor(healthData.api.status)}`}>
                  <span className="text-lg">{getStatusIcon(healthData.api.status)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Error Rate */}
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-3">Error Rate</h4>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Current Error Rate</p>
                <p className="text-2xl font-bold text-gray-900">{(healthData.ingestion.errorRate * 100).toFixed(2)}%</p>
                <p className="text-xs text-gray-500">last 5 minutes</p>
              </div>
              <div className={`p-2 rounded-full ${
                healthData.ingestion.errorRate < 0.01 ? 'text-green-600 bg-green-100' :
                healthData.ingestion.errorRate < 0.05 ? 'text-yellow-600 bg-yellow-100' :
                'text-red-600 bg-red-100'
              }`}>
                <span className="text-lg">
                  {healthData.ingestion.errorRate < 0.01 ? '✓' :
                   healthData.ingestion.errorRate < 0.05 ? '⚠' : '✗'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HealthReport

