import React, { useState } from 'react'

const EnhancedFormField = ({ 
  label, 
  error, 
  help, 
  required, 
  children,
  className = ''
}) => {
  return (
    <div className={`form-field ${className}`}>
      <label className="form-label">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {children}
      {error && (
        <div className="form-error">
          <span>⚠️</span>
          <span>{error}</span>
        </div>
      )}
      {help && !error && (
        <div className="form-help">{help}</div>
      )}
    </div>
  )
}

const EnhancedInput = ({ 
  type = 'text',
  placeholder,
  value,
  onChange,
  onBlur,
  onFocus,
  disabled = false,
  error = false,
  className = '',
  ...props 
}) => {
  const [isFocused, setIsFocused] = useState(false)
  
  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      onBlur={(e) => {
        setIsFocused(false)
        onBlur?.(e)
      }}
      onFocus={(e) => {
        setIsFocused(true)
        onFocus?.(e)
      }}
      disabled={disabled}
      className={`form-input ${error ? 'error' : ''} ${className}`}
      {...props}
    />
  )
}

const EnhancedTextarea = ({ 
  placeholder,
  value,
  onChange,
  onBlur,
  onFocus,
  disabled = false,
  error = false,
  rows = 3,
  className = '',
  ...props 
}) => {
  const [isFocused, setIsFocused] = useState(false)
  
  return (
    <textarea
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      onBlur={(e) => {
        setIsFocused(false)
        onBlur?.(e)
      }}
      onFocus={(e) => {
        setIsFocused(true)
        onFocus?.(e)
      }}
      disabled={disabled}
      rows={rows}
      className={`form-input ${error ? 'error' : ''} ${className}`}
      {...props}
    />
  )
}

const EnhancedSelect = ({ 
  options = [],
  value,
  onChange,
  onBlur,
  onFocus,
  disabled = false,
  error = false,
  placeholder = 'Select an option',
  className = '',
  ...props 
}) => {
  const [isFocused, setIsFocused] = useState(false)
  
  return (
    <select
      value={value}
      onChange={onChange}
      onBlur={(e) => {
        setIsFocused(false)
        onBlur?.(e)
      }}
      onFocus={(e) => {
        setIsFocused(true)
        onFocus?.(e)
      }}
      disabled={disabled}
      className={`form-input ${error ? 'error' : ''} ${className}`}
      {...props}
    >
      <option value="">{placeholder}</option>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  )
}

const EnhancedCheckbox = ({ 
  label,
  checked,
  onChange,
  disabled = false,
  error = false,
  className = '',
  ...props 
}) => {
  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        className={`w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 ${
          error ? 'border-red-300' : ''
        }`}
        {...props}
      />
      {label && (
        <label className="text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
    </div>
  )
}

const EnhancedRadio = ({ 
  label,
  value,
  checked,
  onChange,
  disabled = false,
  error = false,
  className = '',
  ...props 
}) => {
  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <input
        type="radio"
        value={value}
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        className={`w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500 ${
          error ? 'border-red-300' : ''
        }`}
        {...props}
      />
      {label && (
        <label className="text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
    </div>
  )
}

const EnhancedSwitch = ({ 
  label,
  checked,
  onChange,
  disabled = false,
  error = false,
  className = '',
  ...props 
}) => {
  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      <button
        type="button"
        onClick={() => !disabled && onChange(!checked)}
        disabled={disabled}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
          checked ? 'bg-blue-600' : 'bg-gray-200'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        {...props}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            checked ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
      {label && (
        <label className="text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
    </div>
  )
}

const FormFieldGroup = ({ 
  label,
  children,
  className = ''
}) => {
  return (
    <div className={`space-y-3 ${className}`}>
      {label && (
        <h4 className="text-sm font-medium text-gray-900">{label}</h4>
      )}
      <div className="space-y-3">
        {children}
      </div>
    </div>
  )
}

export {
  EnhancedFormField,
  EnhancedInput,
  EnhancedTextarea,
  EnhancedSelect,
  EnhancedCheckbox,
  EnhancedRadio,
  EnhancedSwitch,
  FormFieldGroup
}

export default EnhancedFormField
