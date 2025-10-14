import React from 'react'

const OutcomesDashboard = ({ data }) => {
  if (!data) {
    return (
      <div className="text-center text-gray-500">
        <p>No outcomes data available</p>
      </div>
    )
  }

  const getRateColor = (rate) => {
    if (rate >= 90) return 'text-green-600'
    if (rate >= 75) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getRateBgColor = (rate) => {
    if (rate >= 90) return 'bg-green-100'
    if (rate >= 75) return 'bg-yellow-100'
    return 'bg-red-100'
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Outcomes Dashboard</h3>
        <p className="text-sm text-gray-600">
          Rejection vs. Intent Rates and system performance metrics
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Rejection Rate</p>
              <p className={`text-2xl font-semibold ${getRateColor(100 - data.rejectionRate)}`}>
                {data.rejectionRate}%
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Intent Rate</p>
              <p className={`text-2xl font-semibold ${getRateColor(data.intentRate)}`}>
                {data.intentRate}%
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Accuracy</p>
              <p className={`text-2xl font-semibold ${getRateColor(data.accuracy)}`}>
                {data.accuracy}%
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Processing Time</p>
              <p className="text-2xl font-semibold text-gray-900">{data.processingTime}ms</p>
            </div>
          </div>
        </div>
      </div>

      {/* Event Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-900 mb-2">{data.totalEvents.toLocaleString()}</div>
            <div className="text-sm text-gray-600">Total Events Processed</div>
            <div className="mt-2 text-xs text-gray-500">Last 30 days</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">{data.approvedEvents.toLocaleString()}</div>
            <div className="text-sm text-gray-600">Approved Events</div>
            <div className="mt-2 text-xs text-gray-500">
              {((data.approvedEvents / data.totalEvents) * 100).toFixed(1)}% of total
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-red-600 mb-2">{data.rejectedEvents.toLocaleString()}</div>
            <div className="text-sm text-gray-600">Rejected Events</div>
            <div className="mt-2 text-xs text-gray-500">
              {((data.rejectedEvents / data.totalEvents) * 100).toFixed(1)}% of total
            </div>
          </div>
        </div>
      </div>

      {/* Performance Trends */}
      <div className="bg-white rounded-lg shadow p-6">
        <h4 className="text-lg font-medium text-gray-900 mb-4">Performance Trends</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h5 className="text-sm font-medium text-gray-700 mb-3">Rejection Rate Trend</h5>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Last 7 days</span>
                <span className={`text-sm font-medium ${getRateColor(100 - data.rejectionRate)}`}>
                  {data.rejectionRate}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${getRateBgColor(100 - data.rejectionRate)}`}
                  style={{ width: `${data.rejectionRate}%` }}
                ></div>
              </div>
            </div>
          </div>

          <div>
            <h5 className="text-sm font-medium text-gray-700 mb-3">Intent Rate Trend</h5>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Last 7 days</span>
                <span className={`text-sm font-medium ${getRateColor(data.intentRate)}`}>
                  {data.intentRate}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${getRateBgColor(data.intentRate)}`}
                  style={{ width: `${data.intentRate}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quality Metrics */}
      <div className="bg-white rounded-lg shadow p-6">
        <h4 className="text-lg font-medium text-gray-900 mb-4">Quality Metrics</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Classification Accuracy</span>
                <span className={`text-sm font-medium ${getRateColor(data.accuracy)}`}>
                  {data.accuracy}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${getRateBgColor(data.accuracy)}`}
                  style={{ width: `${data.accuracy}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Processing Efficiency</span>
                <span className="text-sm font-medium text-gray-900">
                  {data.processingTime < 200 ? 'Excellent' : data.processingTime < 500 ? 'Good' : 'Needs Improvement'}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${
                    data.processingTime < 200 ? 'bg-green-100' : 
                    data.processingTime < 500 ? 'bg-yellow-100' : 'bg-red-100'
                  }`}
                  style={{ width: `${Math.min(100, (1000 - data.processingTime) / 10)}%` }}
                ></div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <h6 className="text-sm font-medium text-gray-900 mb-2">System Health</h6>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-600">Uptime</span>
                  <span className="text-xs font-medium text-green-600">99.9%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-600">Error Rate</span>
                  <span className="text-xs font-medium text-green-600">0.1%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-600">Response Time</span>
                  <span className="text-xs font-medium text-green-600">45ms</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default OutcomesDashboard

