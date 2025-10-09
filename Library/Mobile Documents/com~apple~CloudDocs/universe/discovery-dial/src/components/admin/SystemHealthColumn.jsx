import React from 'react'

const SystemHealthColumn = ({ systemData, onAction }) => {
  const healthChecks = [
    { 
      name: 'DB Response', 
      status: 'healthy', 
      color: 'green',
      value: '45ms',
      description: 'Database response time'
    },
    { 
      name: 'Storage', 
      status: 'warning', 
      color: 'yellow',
      value: '90%',
      description: 'Storage utilization',
      usage: 90
    },
    { 
      name: 'API Uptime', 
      status: 'healthy', 
      color: 'green',
      value: '99.9%',
      description: 'API availability'
    }
  ]

  const recentActivity = [
    { 
      time: '10:00 AM', 
      action: 'Pipeline Sync Complete', 
      type: 'pipeline',
      icon: '🔄'
    },
    { 
      time: '09:00 AM', 
      action: 'System Check Passed', 
      type: 'system',
      icon: '✅'
    },
    { 
      time: '08:30 AM', 
      action: 'New Event Added', 
      type: 'event',
      icon: '➕'
    },
    { 
      time: '08:00 AM', 
      action: 'User Role Updated', 
      type: 'admin',
      icon: '👤'
    },
    { 
      time: '07:45 AM', 
      action: 'Health Check Passed', 
      type: 'system',
      icon: '💚'
    }
  ]

  const StatusBadge = ({ status, color }) => {
    const colorClasses = {
      healthy: 'bg-green-100 text-green-800',
      warning: 'bg-yellow-100 text-yellow-800',
      critical: 'bg-red-100 text-red-800'
    }

    const statusText = {
      healthy: 'HEALTHY',
      warning: 'WARNING',
      critical: 'CRITICAL'
    }

    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${colorClasses[color]}`}>
        <span className={`w-2 h-2 rounded-full mr-2 ${
          color === 'green' ? 'bg-green-500' : 
          color === 'yellow' ? 'bg-yellow-500' : 
          'bg-red-500'
        }`}></span>
        {statusText[status]}
      </span>
    )
  }

  const UsageBar = ({ percentage, color }) => {
    const colorClasses = {
      green: 'bg-green-500',
      yellow: 'bg-yellow-500',
      red: 'bg-red-500'
    }

    return (
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-all duration-300 ${colorClasses[color]}`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    )
  }

  const HealthCheckCard = ({ check }) => (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
      <div className="flex-1">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm font-medium text-gray-900">{check.name}</span>
          <StatusBadge status={check.status} color={check.color} />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500">{check.description}</span>
          <span className="text-sm font-medium text-gray-700">{check.value}</span>
        </div>
        {check.usage && (
          <div className="mt-2">
            <UsageBar percentage={check.usage} color={check.color} />
          </div>
        )}
      </div>
    </div>
  )

  const ActivityItem = ({ activity }) => (
    <div className="flex items-start space-x-3 p-2 hover:bg-gray-50 rounded-lg transition-colors duration-200">
      <div className="flex-shrink-0 w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center text-xs">
        {activity.icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900">{activity.action}</p>
        <p className="text-xs text-gray-500">{activity.time}</p>
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Column Header */}
      <div className="flex items-center space-x-2">
        <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
        <h2 className="text-lg font-semibold text-gray-900">INFRASTRUCTURE HEALTH</h2>
      </div>

      {/* System Status */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">System Status</h3>
        
        <div className="space-y-3">
          {healthChecks.map((check, index) => (
            <HealthCheckCard key={index} check={check} />
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
          <span className="text-xs text-gray-500">Last 5 entries</span>
        </div>
        
        <div className="space-y-1">
          {recentActivity.map((activity, index) => (
            <ActivityItem key={index} activity={activity} />
          ))}
        </div>
      </div>

      {/* Health Details Button */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <button
          onClick={() => onAction('viewHealthDetails')}
          className="w-full bg-orange-600 text-white py-3 px-4 rounded-lg hover:bg-orange-700 transition-colors duration-200 text-sm font-medium flex items-center justify-center space-x-2"
        >
          <span>🔍</span>
          <span>View Health Details</span>
        </button>
      </div>
    </div>
  )
}

export default SystemHealthColumn
