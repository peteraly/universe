import React from 'react'
import ActionableRecommendation from './ActionableRecommendation'

const ZeroInboxWidget = ({ recommendations = [], onApprove, onReject, onShowDetails }) => {
  // Sort by priority (P0 first, then P1, then P2)
  const sortedRecommendations = [...recommendations].sort((a, b) => {
    const priorityOrder = { P0: 0, P1: 1, P2: 2 }
    return priorityOrder[a.priority] - priorityOrder[b.priority]
  })

  const priorityCounts = recommendations.reduce((acc, rec) => {
    acc[rec.priority] = (acc[rec.priority] || 0) + 1
    return acc
  }, {})

  const totalPending = recommendations.length

  return (
    <div className="space-y-6">
      {/* Header with Count */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Actionable To-Do</h2>
          <p className="text-gray-600">
            {totalPending} pending decisions requiring your attention
          </p>
        </div>
        
        {/* Priority Summary */}
        <div className="flex items-center space-x-3">
          {priorityCounts.P0 > 0 && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
              {priorityCounts.P0} Critical
            </span>
          )}
          {priorityCounts.P1 > 0 && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
              {priorityCounts.P1} Required
            </span>
          )}
          {priorityCounts.P2 > 0 && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
              {priorityCounts.P2} Optional
            </span>
          )}
        </div>
      </div>

      {/* Recommendations List */}
      {sortedRecommendations.length > 0 ? (
        <div className="space-y-4">
          {sortedRecommendations.map((recommendation, index) => (
            <ActionableRecommendation
              key={index}
              recommendation={recommendation}
              onApprove={onApprove}
              onReject={onReject}
              onShowDetails={onShowDetails}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <div className="text-gray-400 text-6xl mb-4">✅</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">All Clear!</h3>
          <p className="text-gray-500">No actionable recommendations at this time.</p>
        </div>
      )}

      {/* Quick Actions */}
      {sortedRecommendations.length > 0 && (
        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <div className="text-sm text-gray-500">
            {sortedRecommendations.length} total recommendations
          </div>
          <div className="flex space-x-3">
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
              Approve All P0
            </button>
            <button className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium">
              Export to Sheets
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default ZeroInboxWidget
