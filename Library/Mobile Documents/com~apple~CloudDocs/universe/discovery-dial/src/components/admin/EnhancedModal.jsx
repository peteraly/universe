import React, { useEffect, useRef } from 'react'

const EnhancedModal = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  size = 'md',
  showCloseButton = true,
  closeOnBackdrop = true,
  closeOnEscape = true
}) => {
  const modalRef = useRef(null)

  useEffect(() => {
    if (!isOpen) return

    const handleEscape = (e) => {
      if (closeOnEscape && e.key === 'Escape') {
        onClose()
      }
    }

    const handleBackdrop = (e) => {
      if (closeOnBackdrop && e.target === modalRef.current) {
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscape)
    document.addEventListener('click', handleBackdrop)

    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.removeEventListener('click', handleBackdrop)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose, closeOnEscape, closeOnBackdrop])

  if (!isOpen) return null

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-full mx-4'
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        ref={modalRef}
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity duration-300"
        style={{ backdropFilter: 'blur(4px)' }}
      >
        {/* Modal Container */}
        <div className="flex min-h-full items-center justify-center p-4">
          <div className={`relative w-full ${sizeClasses[size]} transform overflow-hidden rounded-xl bg-white shadow-xl transition-all duration-300`}>
            {/* Header */}
            {title && (
              <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
                <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
                {showCloseButton && (
                  <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
                  >
                    <span className="sr-only">Close</span>
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            )}

            {/* Content */}
            <div className="px-6 py-4">
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Enhanced Form Modal Component
export const EnhancedFormModal = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  title, 
  fields, 
  initialData = {},
  loading = false,
  submitText = 'Save',
  cancelText = 'Cancel'
}) => {
  const [formData, setFormData] = React.useState(initialData)
  const [errors, setErrors] = React.useState({})

  useEffect(() => {
    setFormData(initialData)
    setErrors({})
  }, [initialData, isOpen])

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }))
    }
  }

  const validateForm = () => {
    const newErrors = {}
    
    fields.forEach(field => {
      if (field.required && (!formData[field.name] || formData[field.name].toString().trim() === '')) {
        newErrors[field.name] = `${field.label} is required`
      }
      
      if (field.type === 'email' && formData[field.name]) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(formData[field.name])) {
          newErrors[field.name] = 'Please enter a valid email address'
        }
      }
      
      if (field.minLength && formData[field.name] && formData[field.name].length < field.minLength) {
        newErrors[field.name] = `${field.label} must be at least ${field.minLength} characters`
      }
    })
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (validateForm()) {
      onSubmit(formData)
    }
  }

  const renderField = (field) => {
    const hasError = errors[field.name]
    
    return (
      <div key={field.name} className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {field.label}
          {field.required && <span className="text-red-500 ml-1">*</span>}
        </label>
        
        {field.type === 'textarea' ? (
          <textarea
            value={formData[field.name] || ''}
            onChange={(e) => handleInputChange(field.name, e.target.value)}
            placeholder={field.placeholder}
            rows={field.rows || 3}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              hasError ? 'border-red-300' : 'border-gray-300'
            }`}
          />
        ) : field.type === 'select' ? (
          <select
            value={formData[field.name] || ''}
            onChange={(e) => handleInputChange(field.name, e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              hasError ? 'border-red-300' : 'border-gray-300'
            }`}
          >
            <option value="">Select {field.label}</option>
            {field.options?.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        ) : (
          <input
            type={field.type || 'text'}
            value={formData[field.name] || ''}
            onChange={(e) => handleInputChange(field.name, e.target.value)}
            placeholder={field.placeholder}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              hasError ? 'border-red-300' : 'border-gray-300'
            }`}
          />
        )}
        
        {hasError && (
          <p className="mt-1 text-sm text-red-600">{hasError}</p>
        )}
        
        {field.help && (
          <p className="mt-1 text-sm text-gray-500">{field.help}</p>
        )}
      </div>
    )
  }

  return (
    <EnhancedModal isOpen={isOpen} onClose={onClose} title={title} size="md">
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          {fields.map(renderField)}
        </div>
        
        <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200 mt-6">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
          >
            {cancelText}
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            {loading ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Saving...</span>
              </div>
            ) : (
              submitText
            )}
          </button>
        </div>
      </form>
    </EnhancedModal>
  )
}

// Confirmation Modal Component
export const ConfirmationModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = 'Confirm Action',
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'warning',
  loading = false
}) => {
  const typeStyles = {
    warning: {
      icon: '⚠️',
      confirmClass: 'bg-yellow-600 hover:bg-yellow-700',
      iconBg: 'bg-yellow-100'
    },
    danger: {
      icon: '🗑️',
      confirmClass: 'bg-red-600 hover:bg-red-700',
      iconBg: 'bg-red-100'
    },
    info: {
      icon: 'ℹ️',
      confirmClass: 'bg-blue-600 hover:bg-blue-700',
      iconBg: 'bg-blue-100'
    }
  }

  const styles = typeStyles[type]

  return (
    <EnhancedModal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <div className="text-center">
        <div className={`w-12 h-12 ${styles.iconBg} rounded-full flex items-center justify-center mx-auto mb-4`}>
          <span className="text-2xl">{styles.icon}</span>
        </div>
        
        <p className="text-gray-600 mb-6">{message}</p>
        
        <div className="flex items-center justify-center space-x-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 transition-colors duration-200"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`px-4 py-2 text-sm font-medium text-white border border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 ${styles.confirmClass}`}
          >
            {loading ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Processing...</span>
              </div>
            ) : (
              confirmText
            )}
          </button>
        </div>
      </div>
    </EnhancedModal>
  )
}

export default EnhancedModal
