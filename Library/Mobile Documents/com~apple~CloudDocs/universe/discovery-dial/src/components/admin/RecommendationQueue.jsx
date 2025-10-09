import React from 'react'

const PriorityTag = ({ priority }) => {
  const priorityConfig = {
    P0: { 
      color: 'bg-red-100 text-red-800 border-red-200',
      text: 'P0 CRITICAL'
    },
    P1: { 
      color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      text: 'P1 REQUIRED'
    },
    P2: { 
      color: 'bg-blue-100 text-blue-800 border-blue-200',
      text: 'P2 OPTIONAL'
    }
  }
  
  const config = priorityConfig[priority] || priorityConfig.P2
  
  return (
    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${config.color}`}>
      {config.text}
    </span>
  )
}

const RecommendationCard = ({ recommendation, onAction, onReview }) => {
  const priorityColors = {
    P0: 'bg-red-50 border-red-200',
    P1: 'bg-yellow-50 border-yellow-200',
    P2: 'bg-blue-50 border-blue-200'
  }
  
  return (
    <div className={`p-4 rounded-lg border ${priorityColors[recommendation.priority]}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <PriorityTag priority={recommendation.priority} />
            <span className="text-sm font-medium text-gray-900">{recommendation.title}</span>
          </div>
          <p className="text-sm text-gray-600 mb-3">{recommendation.description}</p>
          <div className="flex items-center space-x-4 text-xs text-gray-500">
            <span>Agent: {recommendation.agentId}</span>
            <span>Created: {recommendation.timestamp}</span>
            {recommendation.category && (
              <span>Category: {recommendation.category}</span>
            )}
          </div>
        </div>
        <div className="flex space-x-2 ml-4">
          <button 
            onClick={() => onReview(recommendation)}
            className="px-3 py-1 bg-white border border-gray-300 rounded text-xs font-medium hover:bg-gray-50 transition-colors"
          >
            Review
          </button>
          <button 
            onClick={() => onAction(recommendation)}
            className="px-3 py-1 bg-gray-900 text-white rounded text-xs font-medium hover:bg-gray-800 transition-colors"
          >
            Action
          </button>
        </div>
      </div>
    </div>
  )
}

const RecommendationQueue = ({ recommendations = [], onAction, onReview }) => {
  // Sort recommendations by priority (P0 first, then P1, then P2)
  const sortedRecommendations = [...recommendations].sort((a, b) => {
    const priorityOrder = { P0: 0, P1: 1, P2: 2 }
    return priorityOrder[a.priority] - priorityOrder[b.priority]
  })

  const priorityCounts = recommendations.reduce((acc, rec) => {
    acc[rec.priority] = (acc[rec.priority] || 0) + 1
    return acc
  }, {})

  return (
    <div className="space-y-6">
      {/* Header with Priority Summary */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Actionable Recommendations</h3>
        <div className="flex items-center space-x-3">
          {priorityCounts.P0 > 0 && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
              {priorityCounts.P0} Critical
            </span>
          )}
          {priorityCounts.P1 > 0 && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
              {priorityCounts.P1} Required
            </span>
          )}
          {priorityCounts.P2 > 0 && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              {priorityCounts.P2} Optional
            </span>
          )}
        </div>
      </div>

      {/* Recommendations List */}
      {sortedRecommendations.length > 0 ? (
        <div className="space-y-4">
          {sortedRecommendations.map((recommendation, index) => (
            <RecommendationCard
              key={index}
              recommendation={recommendation}
              onAction={onAction}
              onReview={onReview}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <div className="text-gray-400 text-4xl mb-4">✅</div>
          <h4 className="text-lg font-medium text-gray-900 mb-2">All Clear!</h4>
          <p className="text-gray-500">No actionable recommendations at this time.</p>
        </div>
      )}

      {/* Quick Actions */}
      {sortedRecommendations.length > 0 && (
        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <div className="text-sm text-gray-500">
            {sortedRecommendations.length} total recommendations
          </div>
          <div className="flex space-x-2">
            <button className="btn btn-secondary btn-sm">
              Mark All Reviewed
            </button>
            <button className="btn btn-primary btn-sm">
              Export Report
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default RecommendationQueue
