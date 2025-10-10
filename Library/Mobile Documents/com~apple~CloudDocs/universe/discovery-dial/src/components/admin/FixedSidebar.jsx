import React from 'react'

const FixedSidebar = ({ currentLayer, onNavigate }) => {
  const navigationItems = [
    { 
      id: 'Layer4', 
      label: 'Intelligence', 
      icon: '🧠', 
      description: 'Actionable To-Do List',
      isDefault: true
    },
    { 
      id: 'Layer2', 
      label: 'Health', 
      icon: '💚', 
      description: 'System Status',
      isDefault: false
    },
    { 
      id: 'Layer3', 
      label: 'Config', 
      icon: '⚙️', 
      description: 'Settings & Controls',
      isDefault: false
    },
    { 
      id: 'Layer1', 
      label: 'Curation', 
      icon: '🎯', 
      description: 'Event Management',
      isDefault: false
    }
  ]

  return (
    <nav className="w-64 bg-white border-r border-gray-200 h-full flex flex-col fixed left-0 top-0 z-50">
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

      {/* Navigation - Never Changes */}
      <div className="flex-1 p-4">
        <div className="space-y-1">
          {navigationItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center space-x-3 px-3 py-3 rounded-lg text-left transition-all duration-200 ${
                currentLayer === item.id
                  ? 'bg-gray-900 text-white shadow-sm'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              <div>
                <div className="font-medium text-sm">{item.label}</div>
                <div className={`text-xs ${
                  currentLayer === item.id ? 'text-gray-300' : 'text-gray-500'
                }`}>
                  {item.description}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Footer - System Status */}
      <div className="p-4 border-t border-gray-200">
        <div className="space-y-3">
          {/* System Status */}
          <div className="flex items-center space-x-2 text-sm">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-gray-600">System Online</span>
          </div>
          
          {/* Quick Navigation */}
          <div className="space-y-2">
            <a 
              href="/" 
              className="w-full btn btn-primary btn-sm text-center block"
            >
              Back to App
            </a>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default FixedSidebar
