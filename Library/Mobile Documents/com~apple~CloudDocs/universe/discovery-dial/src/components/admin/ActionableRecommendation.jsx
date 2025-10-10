import React from 'react'

const ActionableRecommendation = ({ recommendation, onApprove, onReject, onShowDetails }) => {
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'P0': return 'border-red-500 bg-red-50'
      case 'P1': return 'border-yellow-500 bg-yellow-50'
      case 'P2': return 'border-blue-500 bg-blue-50'
      default: return 'border-gray-500 bg-gray-50'
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
    <div className={`p-4 rounded-lg border-l-4 ${getPriorityColor(recommendation.priority)} bg-white shadow-sm`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          {/* Priority Badge */}
          <div className="flex items-center space-x-2 mb-2">
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPriorityBadge(recommendation.priority)}`}>
              {recommendation.priority}
            </span>
            <span className="text-sm text-gray-500">{recommendation.timestamp}</span>
          </div>
          
          {/* Title */}
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {recommendation.title}
          </h3>
          
          {/* Root Cause */}
          <p className="text-gray-700 mb-3">
            {recommendation.rootCause}
          </p>
          
          {/* Agent Info */}
          <div className="text-xs text-gray-500 mb-3">
            Agent: {recommendation.agentId} • Category: {recommendation.category}
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex flex-col space-y-2 ml-4">
          <button 
            onClick={() => onApprove(recommendation)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            Approve
          </button>
          <button 
            onClick={() => onReject(recommendation)}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm font-medium"
          >
            Reject
          </button>
          <button 
            onClick={() => onShowDetails(recommendation)}
            className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
          >
            Details
          </button>
        </div>
      </div>
    </div>
  )
}

export default ActionableRecommendation
