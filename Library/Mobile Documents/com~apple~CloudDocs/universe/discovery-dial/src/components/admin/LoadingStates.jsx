import React from 'react'

// Skeleton Loading Components
export const SkeletonCard = ({ className = '' }) => (
  <div className={`bg-white rounded-xl p-6 shadow-sm border border-gray-200 ${className}`}>
    <div className="animate-pulse space-y-4">
      <div className="flex items-center space-x-4">
        <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
      <div className="space-y-2">
        <div className="h-3 bg-gray-200 rounded"></div>
        <div className="h-3 bg-gray-200 rounded w-5/6"></div>
      </div>
    </div>
  </div>
)

export const SkeletonTable = ({ rows = 5, columns = 4 }) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-200">
    <div className="p-6 border-b border-gray-200">
      <div className="animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
        <div className="flex space-x-4">
          <div className="h-8 bg-gray-200 rounded w-64"></div>
          <div className="h-8 bg-gray-200 rounded w-32"></div>
        </div>
      </div>
    </div>
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {[...Array(columns)].map((_, i) => (
              <th key={i} className="px-6 py-3 text-left">
                <div className="h-4 bg-gray-200 rounded w-20"></div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {[...Array(rows)].map((_, i) => (
            <tr key={i}>
              {[...Array(columns)].map((_, j) => (
                <td key={j} className="px-6 py-4">
                  <div className="h-4 bg-gray-200 rounded w-24"></div>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
)

export const SkeletonForm = () => (
  <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
    <div className="animate-pulse space-y-6">
      <div className="space-y-2">
        <div className="h-4 bg-gray-200 rounded w-20"></div>
        <div className="h-10 bg-gray-200 rounded"></div>
      </div>
      <div className="space-y-2">
        <div className="h-4 bg-gray-200 rounded w-24"></div>
        <div className="h-10 bg-gray-200 rounded"></div>
      </div>
      <div className="space-y-2">
        <div className="h-4 bg-gray-200 rounded w-16"></div>
        <div className="h-20 bg-gray-200 rounded"></div>
      </div>
      <div className="flex space-x-3 pt-4">
        <div className="h-10 bg-gray-200 rounded w-20"></div>
        <div className="h-10 bg-gray-200 rounded w-16"></div>
      </div>
    </div>
  </div>
)

// Loading Spinner Components
export const LoadingSpinner = ({ size = 'md', color = 'blue' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12'
  }

  const colorClasses = {
    blue: 'border-blue-600',
    white: 'border-white',
    gray: 'border-gray-600'
  }

  return (
    <div className={`${sizeClasses[size]} ${colorClasses[color]} border-2 border-t-transparent rounded-full animate-spin`}></div>
  )
}

export const LoadingButton = ({ loading, children, ...props }) => (
  <button
    {...props}
    disabled={loading || props.disabled}
    className={`${props.className} ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
  >
    {loading ? (
      <div className="flex items-center space-x-2">
        <LoadingSpinner size="sm" color="white" />
        <span>Loading...</span>
      </div>
    ) : (
      children
    )}
  </button>
)

// Progress Components
export const ProgressBar = ({ progress, label, showPercentage = true, color = 'blue' }) => {
  const colorClasses = {
    blue: 'bg-blue-600',
    green: 'bg-green-600',
    red: 'bg-red-600',
    yellow: 'bg-yellow-600'
  }

  return (
    <div className="w-full">
      {label && (
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">{label}</span>
          {showPercentage && (
            <span className="text-sm text-gray-500">{Math.round(progress)}%</span>
          )}
        </div>
      )}
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-all duration-300 ${colorClasses[color]}`}
          style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
        ></div>
      </div>
    </div>
  )
}

export const LoadingOverlay = ({ loading, children, message = 'Loading...' }) => (
  <div className="relative">
    {children}
    {loading && (
      <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
        <div className="text-center">
          <LoadingSpinner size="lg" color="blue" />
          <p className="mt-2 text-sm text-gray-600">{message}</p>
        </div>
      </div>
    )}
  </div>
)

// Shimmer Effect
export const Shimmer = ({ className = '' }) => (
  <div className={`shimmer ${className}`}></div>
)

// Empty State Components
export const EmptyState = ({ 
  icon = '📊', 
  title = 'No data found', 
  description = 'There are no items to display at this time.',
  action,
  actionText = 'Add Item'
}) => (
  <div className="text-center py-12">
    <div className="text-gray-400 text-4xl mb-4">{icon}</div>
    <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
    <p className="text-gray-500 mb-6">{description}</p>
    {action && (
      <button
        onClick={action}
        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
      >
        {actionText}
      </button>
    )}
  </div>
)

// Error State Components
export const ErrorState = ({ 
  title = 'Something went wrong', 
  description = 'An error occurred while loading the data.',
  onRetry,
  retryText = 'Try Again'
}) => (
  <div className="text-center py-12">
    <div className="text-red-400 text-4xl mb-4">⚠️</div>
    <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
    <p className="text-gray-500 mb-6">{description}</p>
    {onRetry && (
      <button
        onClick={onRetry}
        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors duration-200"
      >
        {retryText}
      </button>
    )}
  </div>
)

// Success State Components
export const SuccessState = ({ 
  title = 'Success!', 
  description = 'The operation completed successfully.',
  action,
  actionText = 'Continue'
}) => (
  <div className="text-center py-12">
    <div className="text-green-400 text-4xl mb-4">✅</div>
    <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
    <p className="text-gray-500 mb-6">{description}</p>
    {action && (
      <button
        onClick={action}
        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors duration-200"
      >
        {actionText}
      </button>
    )}
  </div>
)

// Toast Notification Components
export const Toast = ({ 
  type = 'info', 
  title, 
  message, 
  onClose, 
  duration = 5000 
}) => {
  const [isVisible, setIsVisible] = React.useState(true)

  React.useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false)
        setTimeout(onClose, 300) // Wait for animation to complete
      }, duration)
      return () => clearTimeout(timer)
    }
  }, [duration, onClose])

  const typeStyles = {
    success: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      icon: '✅',
      titleColor: 'text-green-800',
      messageColor: 'text-green-700'
    },
    error: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      icon: '❌',
      titleColor: 'text-red-800',
      messageColor: 'text-red-700'
    },
    warning: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      icon: '⚠️',
      titleColor: 'text-yellow-800',
      messageColor: 'text-yellow-700'
    },
    info: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      icon: 'ℹ️',
      titleColor: 'text-blue-800',
      messageColor: 'text-blue-700'
    }
  }

  const styles = typeStyles[type]

  return (
    <div className={`fixed top-4 right-4 z-50 max-w-sm w-full ${styles.bg} ${styles.border} border rounded-lg shadow-lg transform transition-all duration-300 ${
      isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
    }`}>
      <div className="p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <span className="text-lg">{styles.icon}</span>
          </div>
          <div className="ml-3 flex-1">
            {title && (
              <h4 className={`text-sm font-medium ${styles.titleColor}`}>
                {title}
              </h4>
            )}
            {message && (
              <p className={`text-sm ${styles.messageColor} ${title ? 'mt-1' : ''}`}>
                {message}
              </p>
            )}
          </div>
          {onClose && (
            <button
              onClick={() => {
                setIsVisible(false)
                setTimeout(onClose, 300)
              }}
              className={`ml-4 flex-shrink-0 ${styles.titleColor} hover:opacity-75`}
            >
              <span className="sr-only">Close</span>
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default {
  SkeletonCard,
  SkeletonTable,
  SkeletonForm,
  LoadingSpinner,
  LoadingButton,
  ProgressBar,
  LoadingOverlay,
  Shimmer,
  EmptyState,
  ErrorState,
  SuccessState,
  Toast
}
