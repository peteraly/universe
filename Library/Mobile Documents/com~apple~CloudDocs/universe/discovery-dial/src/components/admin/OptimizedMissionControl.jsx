import React, { useState, useEffect, useCallback, useMemo } from 'react'
import MissionControlHeader from './MissionControlHeader'
import CoreMetricsColumn from './CoreMetricsColumn'
import DataPipelineColumn from './DataPipelineColumn'
import SystemHealthColumn from './SystemHealthColumn'
import BreadcrumbNavigation, { useBreadcrumbs, breadcrumbConfigs } from './BreadcrumbNavigation'
import KeyboardShortcuts, { useKeyboardHelp } from './KeyboardShortcuts'
import { Toast } from './LoadingStates'

const OptimizedMissionControl = () => {
  const [currentTab, setCurrentTab] = useState('dashboard')
  const [userRole, setUserRole] = useState('cto')
  const [toasts, setToasts] = useState([])
  const [isLoading, setIsLoading] = useState(false)

  // Breadcrumb management
  const { items: breadcrumbs, setBreadcrumbs } = useBreadcrumbs()
  
  // Keyboard shortcuts and help
  const { showHelp, toggleHelp, shortcuts } = useKeyboardHelp()

  // Memoized metrics data to prevent unnecessary re-renders
  const [metrics, setMetrics] = useState({
    totalEvents: 2247,
    activeVenues: 3,
    maxVenues: 5,
    venueCapacity: 60,
    discoveryRatio: 1.5,
    activeEvents: 847
  })

  const [pipelineData, setPipelineData] = useState({
    lastRun: '45 minutes ago',
    nextRun: '15 minutes',
    eventsProcessed: 2247,
    status: 'complete'
  })

  const [systemData, setSystemData] = useState({
    dbResponse: '45ms',
    storageUsage: 90,
    apiUptime: '99.9%'
  })

  // Debounced search hook
  const useDebounce = (value, delay) => {
    const [debouncedValue, setDebouncedValue] = useState(value)
    
    useEffect(() => {
      const handler = setTimeout(() => {
        setDebouncedValue(value)
      }, delay)
      
      return () => clearTimeout(handler)
    }, [value, delay])
    
    return debouncedValue
  }

  // Toast management
  const showToast = useCallback((type, title, message) => {
    const id = Date.now()
    setToasts(prev => [...prev, { id, type, title, message }])
  }, [])

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }, [])

  // Optimized action handler with memoization
  const handleAction = useCallback((action) => {
    switch (action) {
      case 'addEvent':
        showToast('info', 'Add Event', 'Opening event creation form...')
        break
      case 'viewReports':
        showToast('info', 'Reports', 'Loading comprehensive reports...')
        break
      case 'syncComplete':
        showToast('success', 'Sync Complete', 'Manual sync completed successfully!')
        break
      case 'viewPipelineDetails':
        showToast('info', 'Pipeline Details', 'Opening detailed pipeline view...')
        break
      case 'viewHealthDetails':
        showToast('info', 'Health Details', 'Loading detailed health metrics...')
        break
      default:
        console.log('Action:', action)
    }
  }, [showToast])

  // Optimized navigation handler
  const handleNavigate = useCallback((path) => {
    const tab = path.split('/').pop() || 'dashboard'
    setCurrentTab(tab)
    
    // Update breadcrumbs based on current tab
    const breadcrumbConfig = breadcrumbConfigs[tab] || breadcrumbConfigs.dashboard
    setBreadcrumbs(breadcrumbConfig)
    
    // In a real app, you'd use React Router here
    window.history.pushState({}, '', path)
  }, [setBreadcrumbs])

  // Optimized role change handler
  const handleRoleChange = useCallback((newRole) => {
    setUserRole(newRole)
    showToast('info', 'Role Changed', `Switched to ${newRole.toUpperCase()} role`)
  }, [showToast])

  // Simulate real-time updates with performance optimization
  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prev => ({
        ...prev,
        totalEvents: prev.totalEvents + Math.floor(Math.random() * 3),
        activeEvents: Math.max(0, prev.activeEvents + Math.floor(Math.random() * 2) - 1)
      }))

      setPipelineData(prev => ({
        ...prev,
        eventsProcessed: prev.eventsProcessed + Math.floor(Math.random() * 5)
      }))
    }, 30000) // Update every 30 seconds

    return () => clearInterval(interval)
  }, [])

  // Initialize breadcrumbs on mount
  useEffect(() => {
    const breadcrumbConfig = breadcrumbConfigs[currentTab] || breadcrumbConfigs.dashboard
    setBreadcrumbs(breadcrumbConfig)
  }, [currentTab, setBreadcrumbs])

  // Memoized components to prevent unnecessary re-renders
  const MemoizedCoreMetrics = useMemo(() => (
    <CoreMetricsColumn metrics={metrics} />
  ), [metrics])

  const MemoizedDataPipeline = useMemo(() => (
    <DataPipelineColumn 
      pipelineData={pipelineData} 
      onAction={handleAction}
    />
  ), [pipelineData, handleAction])

  const MemoizedSystemHealth = useMemo(() => (
    <SystemHealthColumn 
      systemData={systemData} 
      onAction={handleAction}
    />
  ), [systemData, handleAction])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Import enhanced design system */}
      <style>{`
        @import url('../styles/enhanced-design-system.css');
      `}</style>

      {/* Keyboard Shortcuts */}
      <KeyboardShortcuts 
        shortcuts={shortcuts}
        showHelp={showHelp}
        onToggleHelp={toggleHelp}
      />

      {/* Mission Control Header */}
      <MissionControlHeader
        userRole={userRole}
        onRoleChange={handleRoleChange}
        onNavigate={handleNavigate}
        currentTab={currentTab}
      />

      {/* Breadcrumb Navigation */}
      <div className="container mx-auto px-4 py-3">
        <BreadcrumbNavigation 
          items={breadcrumbs}
          onNavigate={handleNavigate}
        />
      </div>

      {/* Main Content - 3 Column Grid */}
      <main className="container mx-auto px-4 pb-6">
        <div className="dashboard-grid grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Column 1: Core Metrics */}
          <div className="lg:col-span-1">
            {MemoizedCoreMetrics}
          </div>

          {/* Column 2: Data Pipeline & Content */}
          <div className="lg:col-span-1">
            {MemoizedDataPipeline}
          </div>

          {/* Column 3: System Health & Activity */}
          <div className="lg:col-span-1">
            {MemoizedSystemHealth}
          </div>
        </div>
      </main>

      {/* Toast Notifications */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {toasts.map(toast => (
          <Toast
            key={toast.id}
            type={toast.type}
            title={toast.title}
            message={toast.message}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </div>

      {/* Enhanced CSS for responsive grid and performance */}
      <style jsx>{`
        .dashboard-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 24px;
        }

        @media (min-width: 768px) {
          .dashboard-grid {
            grid-template-columns: 1fr 1fr;
            gap: 20px;
          }
        }

        @media (min-width: 1024px) {
          .dashboard-grid {
            grid-template-columns: 1fr 1fr 1fr;
            gap: 24px;
          }
        }

        /* Ensure equal height columns */
        .dashboard-grid > div {
          display: flex;
          flex-direction: column;
        }

        .dashboard-grid > div > div {
          flex: 1;
        }

        /* Performance optimizations */
        .dashboard-grid > div {
          contain: layout style paint;
        }

        /* Smooth scrolling */
        html {
          scroll-behavior: smooth;
        }

        /* Focus management */
        .focus-visible {
          outline: 2px solid var(--color-primary);
          outline-offset: 2px;
        }

        /* Reduced motion support */
        @media (prefers-reduced-motion: reduce) {
          * {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>
    </div>
  )
}

export default OptimizedMissionControl
