import React from 'react';

const AlgorithmicPreviewPanel = ({ event, onClose }) => {
  if (!event) return null;

  // Simulate 5-Orb visualization data
  const orbData = [
    { name: 'Relevance', score: 85, color: 'green' },
    { name: 'Quality', score: 72, color: 'blue' },
    { name: 'Engagement', score: 68, color: 'yellow' },
    { name: 'Accuracy', score: 91, color: 'green' },
    { name: 'Completeness', score: 76, color: 'blue' }
  ];

  const getOrbColor = (color) => {
    switch (color) {
      case 'green': return 'bg-green-500';
      case 'blue': return 'bg-blue-500';
      case 'yellow': return 'bg-yellow-500';
      case 'red': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-blue-600';
    if (score >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">Algorithmic Preview Panel</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <span className="sr-only">Close</span>
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="px-6 py-4">
          {/* Event Summary */}
          <div className="mb-6">
            <h4 className="text-md font-semibold text-gray-900 mb-2">Event Summary</h4>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Name</p>
                  <p className="font-medium text-gray-900">{event.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Category</p>
                  <p className="font-medium text-gray-900">{event.category}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Venue</p>
                  <p className="font-medium text-gray-900">{event.venue}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Date & Time</p>
                  <p className="font-medium text-gray-900">{event.date} at {event.time}</p>
                </div>
              </div>
            </div>
          </div>

          {/* 5-Orb Visualization */}
          <div className="mb-6">
            <h4 className="text-md font-semibold text-gray-900 mb-4">AI Analysis - 5-Orb Visualization</h4>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {orbData.map((orb, index) => (
                <div key={index} className="text-center">
                  <div className="relative w-24 h-24 mx-auto mb-2">
                    {/* Orb Circle */}
                    <div className="w-24 h-24 rounded-full border-4 border-gray-200 flex items-center justify-center">
                      <div className={`w-16 h-16 rounded-full ${getOrbColor(orb.color)} flex items-center justify-center`}>
                        <span className="text-white font-bold text-lg">{orb.score}</span>
                      </div>
                    </div>
                    {/* Score Ring */}
                    <svg className="absolute inset-0 w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
                      <circle
                        cx="50"
                        cy="50"
                        r="45"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="8"
                        strokeDasharray={`${2 * Math.PI * 45}`}
                        strokeDashoffset={`${2 * Math.PI * 45 * (1 - orb.score / 100)}`}
                        className={getScoreColor(orb.score)}
                      />
                    </svg>
                  </div>
                  <p className="text-sm font-medium text-gray-900">{orb.name}</p>
                  <p className={`text-xs font-medium ${getScoreColor(orb.score)}`}>
                    {orb.score}%
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Detailed Analysis */}
          <div className="mb-6">
            <h4 className="text-md font-semibold text-gray-900 mb-4">Detailed Analysis</h4>
            <div className="space-y-4">
              {orbData.map((orb, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <h5 className="font-medium text-gray-900">{orb.name}</h5>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      orb.score >= 80 ? 'bg-green-100 text-green-800' :
                      orb.score >= 60 ? 'bg-blue-100 text-blue-800' :
                      orb.score >= 40 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {orb.score}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${getOrbColor(orb.color)}`}
                      style={{ width: `${orb.score}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    {orb.score >= 80 ? 'Excellent' :
                     orb.score >= 60 ? 'Good' :
                     orb.score >= 40 ? 'Fair' : 'Needs Improvement'}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Recommendations */}
          <div className="mb-6">
            <h4 className="text-md font-semibold text-gray-900 mb-4">AI Recommendations</h4>
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="space-y-2">
                {orbData
                  .filter(orb => orb.score < 70)
                  .map((orb, index) => (
                    <div key={index} className="flex items-start space-x-2">
                      <span className="text-blue-600 mt-1">💡</span>
                      <p className="text-sm text-gray-700">
                        Consider improving <strong>{orb.name.toLowerCase()}</strong> - 
                        current score is {orb.score}%. This could help increase overall event quality.
                      </p>
                    </div>
                  ))}
                {orbData.every(orb => orb.score >= 70) && (
                  <div className="flex items-start space-x-2">
                    <span className="text-green-600 mt-1">✅</span>
                    <p className="text-sm text-gray-700">
                      This event meets all quality thresholds and is ready for publication.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Overall Confidence */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex justify-between items-center">
              <div>
                <h5 className="font-medium text-gray-900">Overall AI Confidence</h5>
                <p className="text-sm text-gray-600">
                  Based on comprehensive analysis of all quality metrics
                </p>
              </div>
              <div className="text-right">
                <div className={`text-3xl font-bold ${getScoreColor(event.aiConfidence)}`}>
                  {event.aiConfidence}%
                </div>
                <div className={`text-sm font-medium capitalize ${getScoreColor(event.aiConfidence)}`}>
                  {event.aiConfidenceLevel}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Close Preview
          </button>
        </div>
      </div>
    </div>
  );
};

export default AlgorithmicPreviewPanel;
