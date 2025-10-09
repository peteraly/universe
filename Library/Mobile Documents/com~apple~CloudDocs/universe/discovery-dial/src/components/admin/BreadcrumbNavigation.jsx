import React from 'react'

const BreadcrumbNavigation = ({ 
  items = [], 
  separator = '/',
  onNavigate,
  className = ''
}) => {
  if (!items || items.length === 0) return null

  return (
    <nav className={`flex items-center space-x-2 text-sm ${className}`} aria-label="Breadcrumb">
      <ol className="flex items-center space-x-2">
        {items.map((item, index) => {
          const isLast = index === items.length - 1
          const isClickable = item.href && onNavigate && !isLast
          
          return (
            <li key={index} className="flex items-center">
              {index > 0 && (
                <span className="text-gray-400 mx-2" aria-hidden="true">
                  {separator}
                </span>
              )}
              
              {isClickable ? (
                <button
                  onClick={() => onNavigate(item.href)}
                  className="text-blue-600 hover:text-blue-800 hover:underline transition-colors duration-200"
                  aria-label={`Navigate to ${item.label}`}
                >
                  {item.icon && <span className="mr-1">{item.icon}</span>}
                  {item.label}
                </button>
              ) : (
                <span 
                  className={`${
                    isLast 
                      ? 'text-gray-900 font-medium' 
                      : 'text-gray-500'
                  }`}
                  aria-current={isLast ? 'page' : undefined}
                >
                  {item.icon && <span className="mr-1">{item.icon}</span>}
                  {item.label}
                </span>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

// Hook for managing breadcrumb state
export const useBreadcrumbs = (initialItems = []) => {
  const [items, setItems] = React.useState(initialItems)
  
  const addBreadcrumb = (item) => {
    setItems(prev => [...prev, item])
  }
  
  const removeBreadcrumb = (index) => {
    setItems(prev => prev.slice(0, index + 1))
  }
  
  const updateBreadcrumb = (index, item) => {
    setItems(prev => prev.map((breadcrumb, i) => 
      i === index ? { ...breadcrumb, ...item } : breadcrumb
    ))
  }
  
  const clearBreadcrumbs = () => {
    setItems([])
  }
  
  const setBreadcrumbs = (newItems) => {
    setItems(newItems)
  }
  
  return {
    items,
    addBreadcrumb,
    removeBreadcrumb,
    updateBreadcrumb,
    clearBreadcrumbs,
    setBreadcrumbs
  }
}

// Predefined breadcrumb configurations
export const breadcrumbConfigs = {
  dashboard: [
    { label: 'Dashboard', icon: '🏠', href: '/admin' }
  ],
  events: [
    { label: 'Dashboard', icon: '🏠', href: '/admin' },
    { label: 'Event Management', icon: '🎯', href: '/admin/events' }
  ],
  health: [
    { label: 'Dashboard', icon: '🏠', href: '/admin' },
    { label: 'System Health', icon: '💚', href: '/admin/health' }
  ],
  config: [
    { label: 'Dashboard', icon: '🏠', href: '/admin' },
    { label: 'Configuration', icon: '⚙️', href: '/admin/config' }
  ],
  intelligence: [
    { label: 'Dashboard', icon: '🏠', href: '/admin' },
    { label: 'Intelligence', icon: '🧠', href: '/admin/intelligence' }
  ],
  pipeline: [
    { label: 'Dashboard', icon: '🏠', href: '/admin' },
    { label: 'Data Pipeline', icon: '🔄', href: '/admin/pipeline' }
  ]
}

export default BreadcrumbNavigation
