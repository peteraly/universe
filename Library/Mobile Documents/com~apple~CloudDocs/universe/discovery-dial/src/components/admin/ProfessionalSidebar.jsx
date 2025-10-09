import React from 'react'

const ProfessionalSidebar = ({ currentTab, onNavigate }) => {
  const navigationItems = [
    { 
      id: 'dashboard', 
      label: 'Dashboard', 
      icon: '📊', 
      description: 'Overview & KPIs',
      badge: null
    },
    { 
      id: 'events', 
      label: 'Event Curation', 
      icon: '🎯', 
      description: 'Content Management',
      badge: null
    },
    { 
      id: 'health', 
      label: 'System Health', 
      icon: '💚', 
      description: 'Monitoring & SLIs',
      badge: 'HEALTHY'
    },
    { 
      id: 'config', 
      label: 'Configuration', 
      icon: '⚙️', 
      description: 'Settings & Controls',
      badge: null
    },
    { 
      id: 'intelligence', 
      label: 'Intelligence', 
      icon: '🧠', 
      description: 'AI & Recommendations',
      badge: '3'
    }
  ]

  const getBadgeColor = (badge) => {
    if (badge === 'HEALTHY') return 'badge-success'
    if (badge === 'WARNING') return 'badge-warning'
    if (badge === 'CRITICAL') return 'badge-error'
    return 'bg-gray-100 text-gray-600'
  }

  return (
    <nav className="w-64 bg-white border-r border-gray-200 h-full flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gray-900 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">DD</span>
          </div>
          <div>
            <h1 className="text-lg font-semibold text-gray-900">Discovery Dial</h1>
            <p className="text-xs text-gray-500">Mission Control</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 p-4">
        <div className="space-y-1">
          {navigationItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center justify-between px-3 py-3 rounded-lg text-left transition-all duration-200 ${
                currentTab === item.id
                  ? 'bg-gray-900 text-white shadow-sm'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <div className="flex items-center space-x-3">
                <span className="text-lg">{item.icon}</span>
                <div>
                  <div className="font-medium text-sm">{item.label}</div>
                  <div className={`text-xs ${
                    currentTab === item.id ? 'text-gray-300' : 'text-gray-500'
                  }`}>
                    {item.description}
                  </div>
                </div>
              </div>
              {item.badge && (
                <span className={`badge ${getBadgeColor(item.badge)} text-xs`}>
                  {item.badge}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        <div className="space-y-3">
          {/* System Status */}
          <div className="flex items-center space-x-2 text-sm">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-gray-600">System Online</span>
          </div>
          
          {/* Quick Actions */}
          <div className="space-y-2">
            <button className="w-full btn btn-primary btn-sm">
              Back to App
            </button>
            <button className="w-full btn btn-secondary btn-sm">
              Settings
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default ProfessionalSidebar
