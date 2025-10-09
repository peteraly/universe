import React, { useState, useRef, useEffect } from 'react'

const InteractiveDonutChart = ({ 
  percentage, 
  color = 'blue', 
  label, 
  size = 64,
  strokeWidth = 4,
  onHover,
  onClick 
}) => {
  const [isHovered, setIsHovered] = useState(false)
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 })
  const svgRef = useRef(null)
  
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const strokeDasharray = circumference
  const strokeDashoffset = circumference - (percentage / 100) * circumference

  const colorClasses = {
    blue: 'stroke-blue-500',
    green: 'stroke-green-500',
    purple: 'stroke-purple-500',
    orange: 'stroke-orange-500',
    red: 'stroke-red-500'
  }

  const handleMouseMove = (e) => {
    if (svgRef.current) {
      const rect = svgRef.current.getBoundingClientRect()
      setTooltipPosition({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top - 40
      })
    }
  }

  return (
    <div className="relative inline-block">
      <svg 
        ref={svgRef}
        className={`w-${size/4} h-${size/4} transform -rotate-90 transition-transform duration-200 ${
          isHovered ? 'scale-110' : 'scale-100'
        } ${onClick ? 'cursor-pointer' : ''}`}
        viewBox={`0 0 ${size} ${size}`}
        onMouseEnter={() => {
          setIsHovered(true)
          onHover?.(true)
        }}
        onMouseLeave={() => {
          setIsHovered(false)
          onHover?.(false)
        }}
        onMouseMove={handleMouseMove}
        onClick={onClick}
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          className="text-gray-200"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          className={`${colorClasses[color]} transition-all duration-500 ease-out`}
          strokeLinecap="round"
        />
      </svg>
      
      {/* Center percentage */}
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xs font-semibold text-gray-700">{percentage}%</span>
      </div>
      
      {/* Interactive tooltip */}
      {isHovered && label && (
        <div 
          className="absolute z-10 bg-gray-900 text-white px-2 py-1 rounded text-xs whitespace-nowrap pointer-events-none"
          style={{
            left: tooltipPosition.x,
            top: tooltipPosition.y,
            transform: 'translateX(-50%)'
          }}
        >
          {label}: {percentage}%
        </div>
      )}
    </div>
  )
}

const InteractiveBarChart = ({ 
  data, 
  height = 200, 
  color = 'blue',
  onBarHover,
  onBarClick 
}) => {
  const [hoveredBar, setHoveredBar] = useState(null)
  const maxValue = Math.max(...data.map(d => d.value))
  
  const colorClasses = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    purple: 'bg-purple-500',
    orange: 'bg-orange-500',
    red: 'bg-red-500'
  }

  return (
    <div className="w-full">
      <div className="flex items-end justify-between h-48 space-x-2">
        {data.map((item, index) => {
          const barHeight = (item.value / maxValue) * height
          const isHovered = hoveredBar === index
          
          return (
            <div key={index} className="flex-1 flex flex-col items-center">
              <div 
                className={`w-full ${colorClasses[color]} rounded-t transition-all duration-300 cursor-pointer ${
                  isHovered ? 'opacity-80' : 'opacity-100'
                }`}
                style={{ height: `${barHeight}px` }}
                onMouseEnter={() => {
                  setHoveredBar(index)
                  onBarHover?.(item, index)
                }}
                onMouseLeave={() => {
                  setHoveredBar(null)
                  onBarHover?.(null, null)
                }}
                onClick={() => onBarClick?.(item, index)}
              />
              <div className="mt-2 text-xs text-gray-600 text-center">
                <div className="font-medium">{item.label}</div>
                <div className="text-gray-500">{item.value}</div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

const InteractiveLineChart = ({ 
  data, 
  height = 200, 
  color = 'blue',
  showPoints = true,
  onPointHover,
  onPointClick 
}) => {
  const [hoveredPoint, setHoveredPoint] = useState(null)
  const maxValue = Math.max(...data.map(d => d.value))
  const minValue = Math.min(...data.map(d => d.value))
  const range = maxValue - minValue
  
  const colorClasses = {
    blue: 'stroke-blue-500 fill-blue-500',
    green: 'stroke-green-500 fill-green-500',
    purple: 'stroke-purple-500 fill-purple-500',
    orange: 'stroke-orange-500 fill-orange-500',
    red: 'stroke-red-500 fill-red-500'
  }

  const getPathData = () => {
    const points = data.map((item, index) => {
      const x = (index / (data.length - 1)) * 100
      const y = 100 - ((item.value - minValue) / range) * 100
      return `${x},${y}`
    })
    return `M ${points.join(' L ')}`
  }

  const getAreaData = () => {
    const points = data.map((item, index) => {
      const x = (index / (data.length - 1)) * 100
      const y = 100 - ((item.value - minValue) / range) * 100
      return `${x},${y}`
    })
    return `M 0,100 L ${points.join(' L ')} L 100,100 Z`
  }

  return (
    <div className="w-full">
      <svg className="w-full" height={height} viewBox="0 0 100 100" preserveAspectRatio="none">
        {/* Area fill */}
        <path
          d={getAreaData()}
          className={`${colorClasses[color]} opacity-20`}
        />
        
        {/* Line */}
        <path
          d={getPathData()}
          className={`${colorClasses[color]} stroke-2 fill-none`}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        
        {/* Points */}
        {showPoints && data.map((item, index) => {
          const x = (index / (data.length - 1)) * 100
          const y = 100 - ((item.value - minValue) / range) * 100
          const isHovered = hoveredPoint === index
          
          return (
            <circle
              key={index}
              cx={x}
              cy={y}
              r={isHovered ? 4 : 2}
              className={`${colorClasses[color]} cursor-pointer transition-all duration-200`}
              onMouseEnter={() => {
                setHoveredPoint(index)
                onPointHover?.(item, index)
              }}
              onMouseLeave={() => {
                setHoveredPoint(null)
                onPointHover?.(null, null)
              }}
              onClick={() => onPointClick?.(item, index)}
            />
          )
        })}
      </svg>
      
      {/* X-axis labels */}
      <div className="flex justify-between mt-2 text-xs text-gray-600">
        {data.map((item, index) => (
          <div key={index} className="text-center">
            {item.label}
          </div>
        ))}
      </div>
    </div>
  )
}

const ChartTooltip = ({ 
  visible, 
  position, 
  content, 
  title 
}) => {
  if (!visible) return null
  
  return (
    <div 
      className="absolute z-20 bg-gray-900 text-white px-3 py-2 rounded-lg shadow-lg pointer-events-none"
      style={{
        left: position.x,
        top: position.y,
        transform: 'translateX(-50%)'
      }}
    >
      {title && <div className="font-medium text-sm">{title}</div>}
      <div className="text-xs">{content}</div>
    </div>
  )
}

export {
  InteractiveDonutChart,
  InteractiveBarChart,
  InteractiveLineChart,
  ChartTooltip
}

export default InteractiveDonutChart
