import React from 'react'

const CircularGauge = ({ value, target, color = 'success', size = 64 }) => {
  const percentage = Math.min((value / target) * 100, 100)
  const radius = (size - 8) / 2
  const circumference = 2 * Math.PI * radius
  const strokeDasharray = circumference
  const strokeDashoffset = circumference - (percentage / 100) * circumference

  const colorClasses = {
    success: 'stroke-green-500',
    warning: 'stroke-yellow-500',
    error: 'stroke-red-500'
  }

  return (
    <div className="relative inline-block">
      <svg 
        className={`w-${size/4} h-${size/4} transform -rotate-90`}
        viewBox={`0 0 ${size} ${size}`}
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth="4"
          fill="transparent"
          className="text-gray-200"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth="4"
          fill="transparent"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          className={`${colorClasses[color]} transition-all duration-500 ease-out`}
          strokeLinecap="round"
        />
      </svg>
      
      {/* Center percentage */}
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xs font-semibold text-gray-700">{Math.round(percentage)}%</span>
      </div>
    </div>
  )
}

const TrendIndicator = ({ trend }) => {
  const trendConfig = {
    up: { icon: '↗', color: 'text-green-600' },
    down: { icon: '↘', color: 'text-red-600' },
    stable: { icon: '→', color: 'text-gray-600' }
  }
  
  const config = trendConfig[trend] || trendConfig.stable
  
  return (
    <span className={`text-sm font-medium ${config.color}`}>
      {config.icon}
    </span>
  )
}

const SparklineChart = ({ data, color = 'success', height = 32, width = 80 }) => {
  const maxValue = Math.max(...data)
  const minValue = Math.min(...data)
  const range = maxValue - minValue
  
  const colorClasses = {
    success: 'stroke-green-500',
    warning: 'stroke-yellow-500',
    error: 'stroke-red-500'
  }
  
  const getPathData = () => {
    const points = data.map((value, index) => {
      const x = (index / (data.length - 1)) * 100
      const y = 100 - ((value - minValue) / range) * 100
      return `${x},${y}`
    })
    return `M ${points.join(' L ')}`
  }
  
  return (
    <svg className="w-20 h-8" viewBox="0 0 100 100" preserveAspectRatio="none">
      <path
        d={getPathData()}
        className={`${colorClasses[color]} stroke-2 fill-none`}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

const StatusBadge = ({ status, label }) => {
  const statusConfig = {
    success: { 
      color: 'badge-success',
      icon: '✅',
      text: 'HEALTHY'
    },
    warning: { 
      color: 'badge-warning',
      icon: '⚠️',
      text: 'WARNING'
    },
    error: { 
      color: 'badge-error',
      icon: '❌',
      text: 'CRITICAL'
    }
  }
  
  const config = statusConfig[status]
  
  return (
    <span className={`badge ${config.color}`}>
      <span className="mr-1">{config.icon}</span>
      {label || config.text}
    </span>
  )
}

const ProfessionalKPI = ({ 
  title, 
  current, 
  target, 
  trend, 
  status,
  sparklineData,
  format = 'number'
}) => {
  const percentage = (current / target) * 100
  const statusColor = percentage >= 95 ? 'success' : percentage >= 90 ? 'warning' : 'error'
  
  const formatValue = (value) => {
    if (format === 'number') return value.toLocaleString()
    if (format === 'percentage') return `${value}%`
    if (format === 'currency') return `$${value.toLocaleString()}`
    return value.toString()
  }
  
  return (
    <div className="card">
      <div className="card-body">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-gray-700">{title}</h3>
          <StatusBadge status={statusColor} />
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Gauge Visualization */}
          <div className="flex-shrink-0">
            <CircularGauge 
              value={current} 
              target={target} 
              color={statusColor}
              size={64}
            />
          </div>
          
          {/* Metrics Display */}
          <div className="flex-1">
            <div className="text-2xl font-bold text-gray-900">
              {formatValue(current)}
            </div>
            <div className="text-sm text-gray-500">
              Target: {formatValue(target)}
            </div>
            <div className="flex items-center space-x-2 mt-1">
              <TrendIndicator trend={trend} />
              <span className="text-xs text-gray-500">7-day trend</span>
            </div>
          </div>
          
          {/* Sparkline Chart */}
          <div className="flex-shrink-0">
            <SparklineChart 
              data={sparklineData} 
              color={statusColor}
              height={32}
              width={80}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProfessionalKPI
