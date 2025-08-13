import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Flag, Home, History, AlertTriangle } from 'lucide-react'
import ErrorMonitor from './ErrorMonitor'

interface LayoutProps {
  children: React.ReactNode
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [errorMonitorOpen, setErrorMonitorOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <Flag className="h-8 w-8 text-golf-600" />
              <span className="text-xl font-bold text-gray-900">GolfVision</span>
            </Link>

            {/* Navigation */}
            <nav className="flex items-center space-x-8">
              <Link
                to="/"
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <Home className="h-5 w-5" />
                <span>Dashboard</span>
              </Link>
              <Link
                to="/jobs"
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <History className="h-5 w-5" />
                <span>History</span>
              </Link>
              <button
                onClick={() => setErrorMonitorOpen(true)}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <AlertTriangle className="h-5 w-5" />
                <span>Errors</span>
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-500">
              © 2024 GolfVision. Generate stunning golf course videos.
            </p>
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <span>Open Source</span>
              <span>•</span>
              <span>MIT License</span>
            </div>
          </div>
        </div>
      </footer>
      
      <ErrorMonitor 
        isOpen={errorMonitorOpen} 
        onClose={() => setErrorMonitorOpen(false)} 
      />
    </div>
  )
}

export default Layout
