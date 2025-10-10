import React from 'react'

const StatusRing = ({ value, label, max = 100, unit = '%' }) => {
  // Determine status color based on value
  const getStatusColor = (val) => {
    if (val >= 95) return 'text-green-500'
    if (val >= 90) return 'text-yellow-500'
    return 'text-red-500'
  }

  const getStatusBg = (val) => {
    if (val >= 95) return 'bg-green-50 border-green-200'
    if (val >= 90) return 'bg-yellow-50 border-yellow-200'
    return 'bg-red-50 border-red-200'
  }

  const percentage = Math.min((value / max) * 100, 100)
  const radius = 40
  const circumference = 2 * Math.PI * radius
  const strokeDasharray = circumference
  const strokeDashoffset = circumference - (percentage / 100) * circumference

  return (
    <div className={`p-6 rounded-lg border ${getStatusBg(value)}`}>
      <div className="text-center">
        {/* Status Ring */}
        <div className="relative inline-block mb-4">
          <svg 
            className="w-20 h-20 transform -rotate-90"
            viewBox="0 0 100 100"
          >
            {/* Background circle */}
            <circle
              cx="50"
              cy="50"
              r={radius}
              stroke="currentColor"
              strokeWidth="8"
              fill="transparent"
              className="text-gray-200"
            />
            {/* Progress circle */}
            <circle
              cx="50"
              cy="50"
              r={radius}
              stroke="currentColor"
              strokeWidth="8"
              fill="transparent"
              strokeDasharray={strokeDasharray}
              strokeDashoffset={strokeDashoffset}
              className={`${getStatusColor(value)} transition-all duration-500 ease-out`}
              strokeLinecap="round"
            />
          </svg>
          
          {/* Center value */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-lg font-bold text-gray-900">
              {value}{unit}
            </span>
          </div>
        </div>
        
        {/* Label */}
        <div className="text-sm font-medium text-gray-700">{label}</div>
      </div>
    </div>
  )
}

export default StatusRing
