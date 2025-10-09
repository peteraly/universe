import React from 'react'

const EnhancedActionButton = ({ 
  variant = 'primary', 
  size = 'medium', 
  loading = false,
  disabled = false,
  icon,
  children,
  onClick,
  className = '',
  ...props 
}) => {
  const baseClasses = 'btn font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2'
  
  const variants = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 shadow-sm hover:shadow-md',
    secondary: 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500 shadow-sm hover:shadow-md',
    tertiary: 'bg-gray-100 text-gray-700 hover:bg-gray-200 focus:ring-gray-500 border border-gray-300',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 shadow-sm hover:shadow-md',
    ghost: 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:ring-gray-500'
  }
  
  const sizes = {
    small: 'px-3 py-2 text-sm',
    medium: 'px-4 py-2 text-sm',
    large: 'px-6 py-3 text-base'
  }
  
  const LoadingSpinner = () => (
    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
  )
  
  return (
    <button
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${
        disabled || loading ? 'opacity-50 cursor-not-allowed' : ''
      } ${className}`}
      disabled={disabled || loading}
      onClick={onClick}
      {...props}
    >
      {loading ? (
        <div className="flex items-center space-x-2">
          <LoadingSpinner />
          <span>Loading...</span>
        </div>
      ) : (
        <div className="flex items-center space-x-2">
          {icon && <span>{icon}</span>}
          <span>{children}</span>
        </div>
      )}
    </button>
  )
}

// Specialized button components
export const PrimaryButton = (props) => <EnhancedActionButton variant="primary" {...props} />
export const SecondaryButton = (props) => <EnhancedActionButton variant="secondary" {...props} />
export const TertiaryButton = (props) => <EnhancedActionButton variant="tertiary" {...props} />
export const DangerButton = (props) => <EnhancedActionButton variant="danger" {...props} />
export const GhostButton = (props) => <EnhancedActionButton variant="ghost" {...props} />

export default EnhancedActionButton
