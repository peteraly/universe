import React, { useState, useEffect } from 'react'
import HealthReport from '../components/HealthReport'
import AlertsFeed from '../components/AlertsFeed'

const SystemHealth = ({ userRole }) => {
  const [healthData, setHealthData] = useState(null)
  const [alerts, setAlerts] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadHealthData()
    loadAlerts()
    
    // Simulate real-time updates
    const interval = setInterval(() => {
      loadHealthData()
      loadAlerts()
    }, 30000) // Update every 30 seconds

    return () => clearInterval(interval)
  }, [])

  const loadHealthData = async () => {
    // Simulate API call
    const mockHealthData = {
      ingestion: {
        status: 'healthy',
        throughput: 1250,
        latency: 45,
        errorRate: 0.02,
        lastUpdate: new Date().toISOString()
      },
      ai: {
        status: 'healthy',
        processingTime: 120,
        accuracy: 94.5,
        queueSize: 23,
        lastUpdate: new Date().toISOString()
      },
      database: {
        status: 'healthy',
        connections: 45,
        queryTime: 12,
        storage: 78.5,
        lastUpdate: new Date().toISOString()
      },
      api: {
        status: 'healthy',
        responseTime: 89,
        uptime: 99.98,
        requestsPerMinute: 340,
        lastUpdate: new Date().toISOString()
      }
    }
    
    setHealthData(mockHealthData)
  }

  const loadAlerts = async () => {
    // Simulate API call
    const mockAlerts = [
      {
        id: 1,
        severity: 'P0',
        title: 'High Error Rate Detected',
        description: 'API error rate has exceeded 5% threshold',
        timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
        status: 'active',
        component: 'api'
      },
      {
        id: 2,
        severity: 'P1',
        title: 'Database Connection Pool Exhausted',
        description: 'Database connection pool is at 95% capacity',
        timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
        status: 'acknowledged',
        component: 'database'
      },
      {
        id: 3,
        severity: 'P2',
        title: 'AI Processing Queue Backlog',
        description: 'AI processing queue has 150+ pending items',
        timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        status: 'resolved',
        component: 'ai'
      }
    ]
    
    setAlerts(mockAlerts)
    setIsLoading(false)
  }

  const handleRollback = () => {
    // CTO role cannot perform rollbacks - this is read-only
    alert('Rollback functionality is restricted for CTO role. Contact system administrator.')
  }

  const canPerformRollback = ['admin'].includes(userRole)

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading system health data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">System Health & Observability</h2>
          <p className="text-gray-600">Real-time monitoring and incident management</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-500">
            <span className="font-medium">Last Update:</span> 
            <span className="ml-1">{new Date().toLocaleTimeString()}</span>
          </div>
          <button
            onClick={loadHealthData}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* System Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {Object.entries(healthData || {}).map(([component, data]) => (
          <div key={component} className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-900 capitalize">{component}</h3>
                <p className={`text-2xl font-bold ${
                  data.status === 'healthy' ? 'text-green-600' : 
                  data.status === 'warning' ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {data.status === 'healthy' ? '✓' : data.status === 'warning' ? '⚠' : '✗'}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500">Status</p>
                <p className={`text-sm font-medium capitalize ${
                  data.status === 'healthy' ? 'text-green-600' : 
                  data.status === 'warning' ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {data.status}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Health Report */}
        <div>
          <HealthReport healthData={healthData} />
        </div>

        {/* Alerts Feed */}
        <div>
          <AlertsFeed alerts={alerts} />
        </div>
      </div>

      {/* Emergency Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Emergency Actions</h3>
        <div className="flex items-center space-x-4">
          <button
            onClick={handleRollback}
            disabled={!canPerformRollback}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              canPerformRollback
                ? 'bg-red-600 text-white hover:bg-red-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            Initiate Rollback
          </button>
          {!canPerformRollback && (
            <div className="text-sm text-gray-500">
              <span className="font-medium">Note:</span> Rollback functionality is restricted for CTO role
            </div>
          )}
          <button className="bg-yellow-600 text-white px-6 py-3 rounded-lg hover:bg-yellow-700 transition-colors">
            System Freeze
          </button>
          <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
            Emergency Contact
          </button>
        </div>
      </div>
    </div>
  )
}

export default SystemHealth

