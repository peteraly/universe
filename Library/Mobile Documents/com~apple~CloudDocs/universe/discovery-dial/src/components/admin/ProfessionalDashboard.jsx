import React, { useState, useEffect, useCallback, useMemo } from 'react'
import ProfessionalSidebar from './ProfessionalSidebar'
import ProfessionalKPI from './ProfessionalKPI'
import RecommendationQueue from './RecommendationQueue'
import ProfessionalDataGrid from './ProfessionalDataGrid'
import ProfessionalSkeleton from './ProfessionalSkeleton'

const ProfessionalDashboard = () => {
  const [currentTab, setCurrentTab] = useState('dashboard')
  const [loading, setLoading] = useState(true)
  const [toasts, setToasts] = useState([])

  // Mock data - in real app, this would come from Discovery Dial APIs
  const [kpiData, setKpiData] = useState({
    totalEvents: { current: 2247, target: 2500, trend: 'up', sparkline: [2100, 2150, 2200, 2180, 2220, 2240, 2247] },
    activeVenues: { current: 3, target: 5, trend: 'stable', sparkline: [3, 3, 3, 3, 3, 3, 3] },
    discoveryRatio: { current: 1.5, target: 2.0, trend: 'up', sparkline: [1.2, 1.3, 1.4, 1.3, 1.4, 1.5, 1.5] },
    systemHealth: { current: 98, target: 95, trend: 'stable', sparkline: [96, 97, 98, 97, 98, 98, 98] }
  })

  const [recommendations, setRecommendations] = useState([
    {
      id: 1,
      priority: 'P0',
      title: 'Critical: Data Pipeline Failure',
      description: 'The normalization engine is failing on 15% of incoming events. Immediate attention required.',
      agentId: 'NORM-001',
      timestamp: '2 minutes ago',
      category: 'Data Quality'
    },
    {
      id: 2,
      priority: 'P1',
      title: 'Performance: API Response Time',
      description: 'API response times have increased by 200ms over the last hour. Consider scaling resources.',
      agentId: 'PERF-002',
      timestamp: '15 minutes ago',
      category: 'Performance'
    },
    {
      id: 3,
      priority: 'P2',
      title: 'Enhancement: User Experience',
      description: 'Consider adding keyboard shortcuts for power users to improve efficiency.',
      agentId: 'UX-003',
      timestamp: '1 hour ago',
      category: 'Enhancement'
    }
  ])

  const [events, setEvents] = useState([
    { id: 1, name: 'Summer Concert Series', category: 'Music', venue: 'Central Park', date: '2024-07-15', status: 'active' },
    { id: 2, name: 'Tech Workshop', category: 'Technology', venue: 'Innovation Hub', date: '2024-07-20', status: 'pending' },
    { id: 3, name: 'Art Exhibition', category: 'Art', venue: 'Gallery One', date: '2024-07-25', status: 'active' },
    { id: 4, name: 'Food Festival', category: 'Food', venue: 'Downtown Plaza', date: '2024-08-01', status: 'inactive' }
  ])

  const eventColumns = [
    { key: 'name', label: 'Event Name', type: 'text' },
    { key: 'category', label: 'Category', type: 'text' },
    { key: 'venue', label: 'Venue', type: 'text' },
    { key: 'date', label: 'Date', type: 'date' },
    { key: 'status', label: 'Status', type: 'status' }
  ]

  // Toast management
  const showToast = useCallback((type, title, message) => {
    const id = Date.now()
    setToasts(prev => [...prev, { id, type, title, message }])
  }, [])

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }, [])

  // Action handlers
  const handleRecommendationAction = useCallback((recommendation) => {
    showToast('info', 'Action Taken', `Processing recommendation: ${recommendation.title}`)
    // In real app, this would trigger the actual action
  }, [showToast])

  const handleRecommendationReview = useCallback((recommendation) => {
    showToast('info', 'Review Started', `Reviewing recommendation: ${recommendation.title}`)
    // In real app, this would open a review interface
  }, [showToast])

  const handleEventEdit = useCallback((event) => {
    showToast('info', 'Edit Event', `Editing event: ${event.name}`)
    // In real app, this would open an edit form
  }, [showToast])

  const handleEventDelete = useCallback((event) => {
    showToast('warning', 'Delete Event', `Deleting event: ${event.name}`)
    // In real app, this would show a confirmation dialog
  }, [showToast])

  const handleAddEvent = useCallback(() => {
    showToast('info', 'Add Event', 'Opening event creation form')
    // In real app, this would open an add form
  }, [showToast])

  // Simulate loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false)
    }, 1500)
    return () => clearTimeout(timer)
  }, [])

  // Memoized components for performance
  const MemoizedKPIs = useMemo(() => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <ProfessionalKPI
        title="Total Events"
        current={kpiData.totalEvents.current}
        target={kpiData.totalEvents.target}
        trend={kpiData.totalEvents.trend}
        sparklineData={kpiData.totalEvents.sparkline}
        format="number"
      />
      <ProfessionalKPI
        title="Active Venues"
        current={kpiData.activeVenues.current}
        target={kpiData.activeVenues.target}
        trend={kpiData.activeVenues.trend}
        sparklineData={kpiData.activeVenues.sparkline}
        format="number"
      />
      <ProfessionalKPI
        title="Discovery Ratio"
        current={kpiData.discoveryRatio.current}
        target={kpiData.discoveryRatio.target}
        trend={kpiData.discoveryRatio.trend}
        sparklineData={kpiData.discoveryRatio.sparkline}
        format="number"
      />
      <ProfessionalKPI
        title="System Health"
        current={kpiData.systemHealth.current}
        target={kpiData.systemHealth.target}
        trend={kpiData.systemHealth.trend}
        sparklineData={kpiData.systemHealth.sparkline}
        format="percentage"
      />
    </div>
  ), [kpiData])

  const renderContent = () => {
    if (loading) {
      return (
        <div className="space-y-6">
          <ProfessionalSkeleton type="kpi" count={4} />
          <ProfessionalSkeleton type="recommendation" count={3} />
        </div>
      )
    }

    switch (currentTab) {
      case 'dashboard':
        return (
          <div className="space-y-8">
            {/* KPIs Section */}
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">Key Performance Indicators</h2>
              {MemoizedKPIs}
            </div>

            {/* Recommendations Section */}
            <div>
              <RecommendationQueue
                recommendations={recommendations}
                onAction={handleRecommendationAction}
                onReview={handleRecommendationReview}
              />
            </div>
          </div>
        )

      case 'events':
        return (
          <div className="space-y-6">
            <ProfessionalDataGrid
              data={events}
              columns={eventColumns}
              onEdit={handleEventEdit}
              onDelete={handleEventDelete}
              onAdd={handleAddEvent}
              title="Event Management"
              searchable={true}
              sortable={true}
              selectable={true}
            />
          </div>
        )

      case 'health':
        return (
          <div className="space-y-6">
            <div className="card">
              <div className="card-body">
                <h2 className="text-2xl font-semibold text-gray-900 mb-6">System Health Monitor</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600 mb-2">98%</div>
                    <div className="text-sm text-gray-600">Overall Health</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600 mb-2">45ms</div>
                    <div className="text-sm text-gray-600">API Response</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-yellow-600 mb-2">78%</div>
                    <div className="text-sm text-gray-600">Storage Usage</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )

      case 'config':
        return (
          <div className="space-y-6">
            <div className="card">
              <div className="card-body">
                <h2 className="text-2xl font-semibold text-gray-900 mb-6">Configuration Settings</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">AI Confidence Threshold</h3>
                      <p className="text-sm text-gray-500">Minimum confidence score for auto-publishing</p>
                    </div>
                    <div className="w-32">
                      <input type="range" min="0" max="100" defaultValue="85" className="w-full" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">Auto-Sync Interval</h3>
                      <p className="text-sm text-gray-500">How often to sync with external sources</p>
                    </div>
                    <select className="form-input w-32">
                      <option>5 minutes</option>
                      <option>15 minutes</option>
                      <option>30 minutes</option>
                      <option>1 hour</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )

      case 'intelligence':
        return (
          <div className="space-y-6">
            <RecommendationQueue
              recommendations={recommendations}
              onAction={handleRecommendationAction}
              onReview={handleRecommendationReview}
            />
          </div>
        )

      default:
        return (
          <div className="text-center py-12">
            <div className="text-gray-400 text-4xl mb-4">🚀</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Welcome to Mission Control</h3>
            <p className="text-gray-500">Select a section from the sidebar to get started.</p>
          </div>
        )
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Import professional design system */}
      <style>{`
        @import url('../styles/professional-design-system.css');
      `}</style>

      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <a href="/" className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">DD</span>
                </div>
                <div>
                  <h1 className="text-xl font-semibold text-gray-900">Discovery Dial</h1>
                  <p className="text-xs text-gray-500">Mission Control</p>
                </div>
              </a>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>System Online</span>
              </div>
              <button className="btn btn-primary btn-md">
                Back to App
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <ProfessionalSidebar 
          currentTab={currentTab}
          onNavigate={setCurrentTab}
        />

        {/* Main Content */}
        <main className="flex-1 p-8">
          {renderContent()}
        </main>
      </div>

      {/* Toast Notifications */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className="bg-white border border-gray-200 rounded-lg shadow-lg p-4 max-w-sm"
          >
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <span className="text-lg">
                  {toast.type === 'success' ? '✅' : 
                   toast.type === 'warning' ? '⚠️' : 
                   toast.type === 'error' ? '❌' : 'ℹ️'}
                </span>
              </div>
              <div className="ml-3 flex-1">
                <h4 className="text-sm font-medium text-gray-900">{toast.title}</h4>
                <p className="text-sm text-gray-500 mt-1">{toast.message}</p>
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="ml-4 text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default ProfessionalDashboard
