import React, { useState } from 'react'

const URLParser = ({ onParse, onAutoRefresh, isAutoRefresh, isParsing }) => {
  const [url, setUrl] = useState('')
  const [parsingProgress, setParsingProgress] = useState(0)

  const handleParse = async () => {
    if (!url.trim()) return
    
    setParsingProgress(0)
    await onParse(url.trim())
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleParse()
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
      <div className="flex items-center space-x-4">
        {/* URL Input */}
        <div className="flex-1">
          <input
            type="url"
            placeholder="Enter venue website URL (e.g., https://thingstododc.com/)"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyPress={handleKeyPress}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            disabled={isParsing}
          />
        </div>

        {/* Parse Button */}
        <button
          onClick={handleParse}
          disabled={!url.trim() || isParsing}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
        >
          {isParsing ? 'Parsing...' : 'Parse Events'}
        </button>

        {/* Auto-Refresh Toggle */}
        <button
          onClick={onAutoRefresh}
          className={`px-4 py-3 rounded-lg border transition-colors font-medium ${
            isAutoRefresh
              ? 'bg-green-600 text-white border-green-600'
              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
          }`}
        >
          {isAutoRefresh ? 'Auto-Refresh ON' : 'Auto-Refresh OFF'}
        </button>

        {/* Export Button */}
        <button
          className="px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
        >
          Export CSV
        </button>
      </div>

      {/* Progress Bar */}
      {isParsing && (
        <div className="mt-4">
          <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
            <span>Parsing events...</span>
            <span>{parsingProgress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${parsingProgress}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Quick URL Suggestions */}
      <div className="mt-4">
        <p className="text-sm text-gray-500 mb-2">Quick start:</p>
        <div className="flex flex-wrap gap-2">
          {[
            'https://thingstododc.com/',
            'https://www.eventbrite.com/d/dc--washington/',
            'https://www.meetup.com/find/events/?location=us--dc--washington'
          ].map((suggestion) => (
            <button
              key={suggestion}
              onClick={() => setUrl(suggestion)}
              className="px-3 py-1 bg-gray-100 text-gray-700 rounded text-sm hover:bg-gray-200 transition-colors"
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default URLParser

