import React from 'react'

const Layer4Intelligence = ({ recommendations = [] }) => {
  const defaultRecommendations = [
    {
      id: 1,
      priority: 'P0',
      title: 'Critical: Data Pipeline Failure',
      description: 'The normalization engine is failing on 15% of incoming events. Immediate attention required.',
      agentId: 'NORM-001',
      timestamp: '2 minutes ago',
      category: 'Data Quality'
    },
    {
      id: 2,
      priority: 'P1',
      title: 'Performance: API Response Time',
      description: 'API response times have increased by 200ms over the last hour. Consider scaling resources.',
      agentId: 'PERF-002',
      timestamp: '15 minutes ago',
      category: 'Performance'
    },
    {
      id: 3,
      priority: 'P2',
      title: 'Enhancement: User Experience',
      description: 'Consider adding keyboard shortcuts for power users to improve efficiency.',
      agentId: 'UX-003',
      timestamp: '1 hour ago',
      category: 'Enhancement'
    }
  ]

  const displayRecommendations = recommendations.length > 0 ? recommendations : defaultRecommendations

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'P0': return 'bg-red-100 text-red-800 border-red-200'
      case 'P1': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'P2': return 'bg-blue-100 text-blue-800 border-blue-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'P0': return 'bg-red-100 text-red-800'
      case 'P1': return 'bg-yellow-100 text-yellow-800'
      case 'P2': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Intelligence & AI Recommendations</h2>
          <p className="text-gray-600">Actionable insights and system recommendations</p>
        </div>

        {/* Recommendations List */}
        <div className="space-y-4">
          {displayRecommendations.map((recommendation) => (
            <div
              key={recommendation.id}
              className={`p-4 rounded-lg border ${getPriorityColor(recommendation.priority)}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPriorityBadge(recommendation.priority)}`}>
                      {recommendation.priority}
                    </span>
                    <span className="text-sm text-gray-500">{recommendation.timestamp}</span>
                  </div>
                  
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {recommendation.title}
                  </h3>
                  
                  <p className="text-gray-700 mb-3">
                    {recommendation.description}
                  </p>
                  
                  <div className="text-xs text-gray-500">
                    Agent: {recommendation.agentId} • Category: {recommendation.category}
                  </div>
                </div>
                
                <div className="flex flex-col space-y-2 ml-4">
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
                    Review
                  </button>
                  <button className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium">
                    Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {displayRecommendations.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <div className="text-gray-400 text-6xl mb-4">✅</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">All Clear!</h3>
            <p className="text-gray-500">No actionable recommendations at this time.</p>
          </div>
        )}

        {/* Summary Stats */}
        <div className="mt-8 bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recommendation Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600 mb-2">
                {displayRecommendations.filter(r => r.priority === 'P0').length}
              </div>
              <div className="text-sm text-gray-600">Critical Issues</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600 mb-2">
                {displayRecommendations.filter(r => r.priority === 'P1').length}
              </div>
              <div className="text-sm text-gray-600">Required Actions</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 mb-2">
                {displayRecommendations.filter(r => r.priority === 'P2').length}
              </div>
              <div className="text-sm text-gray-600">Optional Enhancements</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Layer4Intelligence


