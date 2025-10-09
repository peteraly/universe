import React from 'react'

const EnhancedDashboard = ({ metrics, onAction }) => {
  const metricCards = [
    {
      title: 'Total Events',
      value: metrics?.totalEvents || 0,
      change: '+12%',
      trend: 'up',
      icon: '📊',
      color: 'blue'
    },
    {
      title: 'Active Venues',
      value: metrics?.activeVenues || 0,
      change: '+3',
      trend: 'up',
      icon: '🏢',
      color: 'green'
    },
    {
      title: 'System Health',
      value: `${metrics?.systemHealth || 98}%`,
      change: '-2%',
      trend: 'down',
      icon: '💚',
      color: 'green'
    },
    {
      title: 'Pipeline Status',
      value: metrics?.pipelineStatus || 'Running',
      change: '2h ago',
      trend: 'stable',
      icon: '🔄',
      color: 'blue'
    }
  ]

  const quickActions = [
    {
      title: 'Add Event',
      description: 'Create a new event',
      icon: '➕',
      action: () => onAction('addEvent'),
      color: 'blue'
    },
    {
      title: 'Run Pipeline',
      description: 'Trigger manual data sync',
      icon: '🔄',
      action: () => onAction('runPipeline'),
      color: 'green'
    },
    {
      title: 'System Check',
      description: 'Run health diagnostics',
      icon: '🔍',
      action: () => onAction('systemCheck'),
      color: 'purple'
    },
    {
      title: 'View Reports',
      description: 'Access analytics',
      icon: '📈',
      action: () => onAction('viewReports'),
      color: 'orange'
    }
  ]

  const recentActivity = [
    {
      id: 1,
      type: 'event',
      message: 'New event "Summer Concert" added',
      time: '2 minutes ago',
      icon: '🎵'
    },
    {
      id: 2,
      type: 'pipeline',
      message: 'Data pipeline completed successfully',
      time: '15 minutes ago',
      icon: '✅'
    },
    {
      id: 3,
      type: 'system',
      message: 'System health check passed',
      time: '1 hour ago',
      icon: '💚'
    },
    {
      id: 4,
      type: 'user',
      message: 'User role updated to Curator',
      time: '2 hours ago',
      icon: '👤'
    }
  ]

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">Welcome to Mission Control</h1>
            <p className="text-blue-100">
              Monitor and manage your Discovery Dial ecosystem with real-time insights and controls.
            </p>
          </div>
          <div className="hidden md:block">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
              <span className="text-2xl">🚀</span>
            </div>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metricCards.map((card, index) => (
          <div
            key={index}
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-xl ${
                card.color === 'blue' ? 'bg-blue-100 text-blue-600' :
                card.color === 'green' ? 'bg-green-100 text-green-600' :
                card.color === 'purple' ? 'bg-purple-100 text-purple-600' :
                'bg-orange-100 text-orange-600'
              }`}>
                {card.icon}
              </div>
              <div className={`text-sm font-medium ${
                card.trend === 'up' ? 'text-green-600' :
                card.trend === 'down' ? 'text-red-600' :
                'text-gray-600'
              }`}>
                {card.change}
              </div>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-600 mb-1">{card.title}</h3>
              <p className="text-2xl font-bold text-gray-900">{card.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action, index) => (
            <button
              key={index}
              onClick={action.action}
              className="flex items-center space-x-3 p-4 rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all duration-200 text-left group"
            >
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg ${
                action.color === 'blue' ? 'bg-blue-100 text-blue-600 group-hover:bg-blue-200' :
                action.color === 'green' ? 'bg-green-100 text-green-600 group-hover:bg-green-200' :
                action.color === 'purple' ? 'bg-purple-100 text-purple-600 group-hover:bg-purple-200' :
                'bg-orange-100 text-orange-600 group-hover:bg-orange-200'
              } transition-colors duration-200`}>
                {action.icon}
              </div>
              <div>
                <h3 className="font-medium text-gray-900">{action.title}</h3>
                <p className="text-sm text-gray-500">{action.description}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
          <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
            View All
          </button>
        </div>
        <div className="space-y-4">
          {recentActivity.map((activity) => (
            <div key={activity.id} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200">
              <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-sm">
                {activity.icon}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">{activity.message}</p>
                <p className="text-xs text-gray-500">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* System Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pipeline Status */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Data Pipeline</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Status</span>
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                Running
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Last Run</span>
              <span className="text-sm font-medium text-gray-900">2 hours ago</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Next Run</span>
              <span className="text-sm font-medium text-gray-900">10 hours</span>
            </div>
            <div className="pt-3">
              <button
                onClick={() => onAction('viewPipeline')}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors duration-200 text-sm font-medium"
              >
                View Pipeline Details
              </button>
            </div>
          </div>
        </div>

        {/* System Health */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">System Health</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Overall Health</span>
              <span className="text-lg font-bold text-green-600">98%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-green-500 h-2 rounded-full" style={{ width: '98%' }}></div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">API Response</span>
                <span className="text-green-600 font-medium">✓ Healthy</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Database</span>
                <span className="text-green-600 font-medium">✓ Healthy</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Storage</span>
                <span className="text-yellow-600 font-medium">⚠ Warning</span>
              </div>
            </div>
            <div className="pt-3">
              <button
                onClick={() => onAction('viewHealth')}
                className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors duration-200 text-sm font-medium"
              >
                View Health Details
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EnhancedDashboard
