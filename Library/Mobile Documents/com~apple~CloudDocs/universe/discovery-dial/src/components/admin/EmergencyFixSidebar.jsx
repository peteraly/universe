import React from 'react'

const EmergencyFixSidebar = ({ currentLayer, onNavigate }) => {
  const navigationItems = [
    { 
      id: 'Layer1', 
      label: 'Event Curation', 
      icon: '🎯', 
      description: 'Parse & Manage Events',
      isActive: currentLayer === 'Layer1'
    },
    { 
      id: 'Layer2', 
      label: 'System Health', 
      icon: '💚', 
      description: 'Monitoring & Status',
      isActive: currentLayer === 'Layer2'
    },
    { 
      id: 'Layer3', 
      label: 'Configuration', 
      icon: '⚙️', 
      description: 'Settings & Controls',
      isActive: currentLayer === 'Layer3'
    },
    { 
      id: 'Layer4', 
      label: 'Intelligence', 
      icon: '🧠', 
      description: 'AI & Recommendations',
      isActive: currentLayer === 'Layer4'
    }
  ]

  return (
    <nav className="w-64 bg-gray-800 h-full flex flex-col fixed left-0 top-0 z-50">
      {/* Minimal Header */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-white rounded flex items-center justify-center">
            <span className="text-gray-800 font-bold text-sm">DD</span>
          </div>
          <div>
            <h1 className="text-sm font-medium text-white">Discovery Dial</h1>
            <p className="text-xs text-gray-400">Mission Control</p>
          </div>
        </div>
      </div>

      {/* Clean Navigation */}
      <div className="flex-1 p-2">
        <div className="space-y-1">
          {navigationItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded text-left transition-all duration-200 ${
                item.isActive
                  ? 'bg-gray-700 text-white'
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
            >
              <span className="text-sm">{item.icon}</span>
              <div>
                <div className="text-sm font-medium">{item.label}</div>
                <div className="text-xs text-gray-400">
                  {item.description}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Minimal Footer */}
      <div className="p-4 border-t border-gray-700">
        <div className="flex items-center space-x-2 text-xs text-gray-400">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span>System Online</span>
        </div>
        <a 
          href="/" 
          className="block mt-2 text-xs text-gray-400 hover:text-white transition-colors"
        >
          ← Back to Discovery Dial
        </a>
      </div>
    </nav>
  )
}

export default EmergencyFixSidebar


