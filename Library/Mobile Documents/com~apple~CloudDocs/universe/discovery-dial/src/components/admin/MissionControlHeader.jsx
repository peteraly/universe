import React, { useState } from 'react'

const MissionControlHeader = ({ userRole, onRoleChange, onNavigate, currentTab }) => {
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  // Simplified navigation as specified
  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊', path: '/admin' },
    { id: 'events', label: 'Event Duration', icon: '⏱️', path: '/admin/events' },
    { id: 'health', label: 'System Health', icon: '💚', path: '/admin/health' },
    { id: 'config', label: 'Configuration', icon: '⚙️', path: '/admin/config' },
    { id: 'intelligence', label: 'Intelligence', icon: '🧠', path: '/admin/intelligence' },
    { id: 'pipeline', label: 'Data Pipeline', icon: '🔄', path: '/admin/pipeline' }
  ]

  const handleSearch = (e) => {
    e.preventDefault()
    console.log('Searching for:', searchQuery)
  }

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Branding - Discovery Dial prominently displayed */}
          <div className="flex items-center space-x-4">
            <button
              onClick={() => onNavigate('/admin')}
              className="flex items-center space-x-3 hover:opacity-80 transition-opacity"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">DD</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Discovery Dial</h1>
                <p className="text-xs text-gray-500">Mission Control</p>
              </div>
            </button>
          </div>

          {/* Simplified Navigation - Single row, no dropdowns */}
          <nav className="hidden lg:flex items-center space-x-1">
            {navigationItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onNavigate(item.path)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  currentTab === item.id
                    ? 'bg-blue-100 text-blue-700 border border-blue-200'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <span className="text-base">{item.icon}</span>
                <span>{item.label}</span>
              </button>
            ))}
          </nav>

          {/* Search and User Actions */}
          <div className="flex items-center space-x-3">
            {/* Global Search */}
            <div className="relative">
              {isSearchOpen ? (
                <form onSubmit={handleSearch} className="flex items-center">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search events, venues, users..."
                    className="w-64 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setIsSearchOpen(false)}
                    className="ml-2 p-2 text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </form>
              ) : (
                <button
                  onClick={() => setIsSearchOpen(true)}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  🔍
                </button>
              )}
            </div>

            {/* Notifications */}
            <div className="relative">
              <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors relative">
                🔔
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
                  3
                </span>
              </button>
            </div>

            {/* User Profile and Role */}
            <div className="flex items-center space-x-3 pl-3 border-l border-gray-200">
              <div className="text-right">
                <div className="text-sm font-medium text-gray-900">
                  {userRole.toUpperCase()}
                </div>
                <div className="text-xs text-gray-500">Administrator</div>
              </div>
              
              <select
                value={userRole}
                onChange={(e) => onRoleChange(e.target.value)}
                className="text-sm border border-gray-300 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="cto">CTO</option>
                <option value="admin">Admin</option>
                <option value="curator">Curator</option>
                <option value="agent">Agent</option>
                <option value="viewer">Viewer</option>
              </select>

              <button
                onClick={() => onNavigate('/')}
                className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                <span>←</span>
                <span>Back to App</span>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation - Hamburger Menu */}
        <div className="lg:hidden border-t border-gray-200 py-3">
          <div className="grid grid-cols-3 gap-2">
            {navigationItems.slice(0, 6).map((item) => (
              <button
                key={item.id}
                onClick={() => onNavigate(item.path)}
                className={`flex flex-col items-center space-y-1 p-2 rounded-lg text-xs font-medium transition-all duration-200 ${
                  currentTab === item.id
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                <span className="text-center">{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </header>
  )
}

export default MissionControlHeader
