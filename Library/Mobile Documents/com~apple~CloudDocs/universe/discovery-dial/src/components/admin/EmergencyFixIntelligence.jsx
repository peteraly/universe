import React from 'react'

const EmergencyFixIntelligence = ({ intelligenceData = {} }) => {
  const defaultIntelligenceData = {
    pendingRecommendations: 3,
    aiInsights: [
      {
        id: 1,
        type: 'optimization',
        title: 'Event Parsing Optimization',
        description: 'Consider implementing caching for frequently accessed venues',
        priority: 'high',
        confidence: 92
      },
      {
        id: 2,
        type: 'quality',
        title: 'Data Quality Alert',
        description: '5 events have low confidence scores and need review',
        priority: 'medium',
        confidence: 87
      },
      {
        id: 3,
        type: 'performance',
        title: 'Performance Recommendation',
        description: 'Database queries could be optimized for faster event loading',
        priority: 'low',
        confidence: 78
      }
    ],
    systemMetrics: {
      totalEvents: 1247,
      newEventsToday: 23,
      averageConfidence: 89,
      topVenues: ['thingstododc.com', 'eventbrite.com', 'meetup.com']
    }
  }

  const intelligence = { ...defaultIntelligenceData, ...intelligenceData }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200'
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'low': return 'text-blue-600 bg-blue-50 border-blue-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getTypeIcon = (type) => {
    switch (type) {
      case 'optimization': return '⚡'
      case 'quality': return '🎯'
      case 'performance': return '📊'
      default: return 'ℹ️'
    }
  }

  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto">
        {/* Minimal Header */}
        <div className="mb-6">
          <h2 className="text-lg font-medium text-gray-900">Intelligence & AI Recommendations</h2>
          <p className="text-sm text-gray-600">Actionable insights and system optimization</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white border border-gray-200 rounded p-4">
            <div className="text-center">
              <div className="text-2xl font-semibold text-gray-900 mb-1">
                {intelligence.pendingRecommendations}
              </div>
              <div className="text-xs font-medium text-gray-700">Pending Actions</div>
            </div>
          </div>
          
          <div className="bg-white border border-gray-200 rounded p-4">
            <div className="text-center">
              <div className="text-2xl font-semibold text-gray-900 mb-1">
                {intelligence.systemMetrics.totalEvents}
              </div>
              <div className="text-xs font-medium text-gray-700">Total Events</div>
            </div>
          </div>
          
          <div className="bg-white border border-gray-200 rounded p-4">
            <div className="text-center">
              <div className="text-2xl font-semibold text-gray-900 mb-1">
                {intelligence.systemMetrics.newEventsToday}
              </div>
              <div className="text-xs font-medium text-gray-700">New Today</div>
            </div>
          </div>
          
          <div className="bg-white border border-gray-200 rounded p-4">
            <div className="text-center">
              <div className="text-2xl font-semibold text-gray-900 mb-1">
                {intelligence.systemMetrics.averageConfidence}%
              </div>
              <div className="text-xs font-medium text-gray-700">Avg Confidence</div>
            </div>
          </div>
        </div>

        {/* Actionable Recommendations */}
        <div className="bg-white border border-gray-200 rounded p-4 mb-6">
          <h3 className="text-sm font-medium text-gray-900 mb-3">Actionable Recommendations</h3>
          <div className="space-y-3">
            {intelligence.aiInsights.map((insight) => (
              <div
                key={insight.id}
                className={`p-3 rounded border ${getPriorityColor(insight.priority)}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-2">
                    <span className="text-sm">{getTypeIcon(insight.type)}</span>
                    <div>
                      <h4 className="text-sm font-medium">{insight.title}</h4>
                      <p className="text-xs text-gray-600 mt-1">{insight.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-500">
                      {insight.confidence}% confidence
                    </span>
                    <button className="text-xs px-2 py-1 bg-white rounded border hover:bg-gray-50 transition-colors">
                      Review
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* System Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Venues */}
          <div className="bg-white border border-gray-200 rounded p-4">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Top Venues</h3>
            <div className="space-y-2">
              {intelligence.systemMetrics.topVenues.map((venue, index) => (
                <div key={venue} className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">{venue}</span>
                  <span className="text-xs text-gray-500">#{index + 1}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white border border-gray-200 rounded p-4">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Recent Activity</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">New events parsed</span>
                <span className="text-xs text-gray-500">2 minutes ago</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">System health check</span>
                <span className="text-xs text-gray-500">5 minutes ago</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Configuration updated</span>
                <span className="text-xs text-gray-500">1 hour ago</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EmergencyFixIntelligence


