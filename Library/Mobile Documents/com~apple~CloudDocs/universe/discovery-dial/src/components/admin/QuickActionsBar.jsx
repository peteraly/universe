import React from 'react'

const QuickActionsBar = ({ onBulkApprove, onExport, onFreeze, onUnfreeze, isFrozen = false }) => {
  return (
    <div className="bg-white border-b border-gray-200 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
          {isFrozen && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
              System Frozen
            </span>
          )}
        </div>
        
        <div className="flex items-center space-x-3">
          <button 
            onClick={onBulkApprove}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            Approve All P0
          </button>
          <button 
            onClick={onExport}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
          >
            Export to Sheets
          </button>
          {isFrozen ? (
            <button 
              onClick={onUnfreeze}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
            >
              Unfreeze System
            </button>
          ) : (
            <button 
              onClick={onFreeze}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
            >
              Freeze System
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default QuickActionsBar
