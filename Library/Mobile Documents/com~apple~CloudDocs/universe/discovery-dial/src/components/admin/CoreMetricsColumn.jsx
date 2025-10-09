import React from 'react'

const CoreMetricsColumn = ({ metrics }) => {
  const coreMetrics = [
    {
      title: 'Total Events',
      value: metrics?.totalEvents || '2,247',
      change: '+27',
      trend: 'up',
      tooltip: 'Events added in last 24 hours',
      icon: '📊',
      color: 'blue'
    },
    {
      title: 'Active Venues',
      value: `${metrics?.activeVenues || 3}/${metrics?.maxVenues || 5}`,
      percentage: metrics?.venueCapacity || 60,
      tooltip: 'Venue capacity utilization',
      icon: '🏢',
      color: 'green',
      chart: 'donut'
    },
    {
      title: 'Discovery Success Ratio',
      value: metrics?.discoveryRatio || '1.5',
      tooltip: 'Average spins before event is saved/clicked',
      icon: '🎯',
      color: 'purple'
    },
    {
      title: 'Active Events',
      value: metrics?.activeEvents || '847',
      tooltip: 'Events currently live and visible on dial',
      icon: '⚡',
      color: 'orange'
    }
  ]

  const DonutChart = ({ percentage, color }) => {
    const radius = 20
    const circumference = 2 * Math.PI * radius
    const strokeDasharray = circumference
    const strokeDashoffset = circumference - (percentage / 100) * circumference

    const colorClasses = {
      green: 'stroke-green-500',
      blue: 'stroke-blue-500',
      purple: 'stroke-purple-500',
      orange: 'stroke-orange-500'
    }

    return (
      <div className="relative w-12 h-12">
        <svg className="w-12 h-12 transform -rotate-90" viewBox="0 0 50 50">
          {/* Background circle */}
          <circle
            cx="25"
            cy="25"
            r={radius}
            stroke="currentColor"
            strokeWidth="4"
            fill="transparent"
            className="text-gray-200"
          />
          {/* Progress circle */}
          <circle
            cx="25"
            cy="25"
            r={radius}
            stroke="currentColor"
            strokeWidth="4"
            fill="transparent"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            className={colorClasses[color]}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xs font-semibold text-gray-700">{percentage}%</span>
        </div>
      </div>
    )
  }

  const MetricCard = ({ metric }) => {
    const colorClasses = {
      blue: 'bg-blue-100 text-blue-600',
      green: 'bg-green-100 text-green-600',
      purple: 'bg-purple-100 text-purple-600',
      orange: 'bg-orange-100 text-orange-600'
    }

    const trendColors = {
      up: 'text-green-600',
      down: 'text-red-600',
      stable: 'text-gray-600'
    }

    return (
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200">
        <div className="flex items-center justify-between mb-4">
          <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-xl ${colorClasses[metric.color]}`}>
            {metric.icon}
          </div>
          {metric.change && (
            <div className={`text-sm font-medium flex items-center space-x-1 ${trendColors[metric.trend]}`}>
              <span>{metric.trend === 'up' ? '↗' : metric.trend === 'down' ? '↘' : '→'}</span>
              <span>{metric.change}</span>
            </div>
          )}
        </div>
        
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-600">{metric.title}</h3>
          <div className="flex items-center space-x-3">
            <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
            {metric.chart === 'donut' && (
              <DonutChart percentage={metric.percentage} color={metric.color} />
            )}
          </div>
          {metric.tooltip && (
            <p className="text-xs text-gray-500" title={metric.tooltip}>
              {metric.tooltip}
            </p>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Column Header */}
      <div className="flex items-center space-x-2">
        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
        <h2 className="text-lg font-semibold text-gray-900">MISSION CONTROL - HEALTH AT GLANCE</h2>
      </div>

      {/* Metrics Grid */}
      <div className="space-y-4">
        {coreMetrics.map((metric, index) => (
          <MetricCard key={index} metric={metric} />
        ))}
      </div>

      {/* Quick Action */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <button className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors duration-200 text-sm font-medium flex items-center justify-center space-x-2">
          <span>📊</span>
          <span>View All Reports</span>
        </button>
      </div>
    </div>
  )
}

export default CoreMetricsColumn
