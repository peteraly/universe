import React, { useState, useEffect } from 'react'

const PipelineDashboard = () => {
  const [pipelineStatus, setPipelineStatus] = useState(null)
  const [dataSources, setDataSources] = useState([])
  const [executionHistory, setExecutionHistory] = useState([])
  const [qualityMetrics, setQualityMetrics] = useState(null)
  const [selfHealingStatus, setSelfHealingStatus] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadPipelineData()
    const interval = setInterval(loadPipelineData, 30000) // Update every 30 seconds
    return () => clearInterval(interval)
  }, [])

  const loadPipelineData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Load all pipeline data in parallel
      const [
        statusResponse,
        sourcesResponse,
        historyResponse,
        qualityResponse,
        healingResponse
      ] = await Promise.all([
        fetch('/api/pipeline/status'),
        fetch('/api/pipeline/sources'),
        fetch('/api/pipeline/history?limit=10'),
        fetch('/api/pipeline/quality'),
        fetch('/api/pipeline/healing')
      ])

      const [status, sources, history, quality, healing] = await Promise.all([
        statusResponse.json(),
        sourcesResponse.json(),
        historyResponse.json(),
        qualityResponse.json(),
        healingResponse.json()
      ])

      if (status.success) setPipelineStatus(status.data)
      if (sources.success) setDataSources(sources.data)
      if (history.success) setExecutionHistory(history.data)
      if (quality.success) setQualityMetrics(quality.data)
      if (healing.success) setSelfHealingStatus(healing.data)

    } catch (err) {
      setError('Failed to load pipeline data: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleStartPipeline = async () => {
    try {
      const response = await fetch('/api/pipeline/start', { method: 'POST' })
      const result = await response.json()
      
      if (result.success) {
        await loadPipelineData()
      } else {
        setError(result.error)
      }
    } catch (err) {
      setError('Failed to start pipeline: ' + err.message)
    }
  }

  const handleStopPipeline = async () => {
    try {
      const response = await fetch('/api/pipeline/stop', { method: 'POST' })
      const result = await response.json()
      
      if (result.success) {
        await loadPipelineData()
      } else {
        setError(result.error)
      }
    } catch (err) {
      setError('Failed to stop pipeline: ' + err.message)
    }
  }

  const handleTriggerManualRun = async () => {
    try {
      const response = await fetch('/api/pipeline/trigger', { method: 'POST' })
      const result = await response.json()
      
      if (result.success) {
        await loadPipelineData()
      } else {
        setError(result.error)
      }
    } catch (err) {
      setError('Failed to trigger manual run: ' + err.message)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading pipeline data...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error</h3>
            <div className="mt-2 text-sm text-red-700">{error}</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Data Pipeline Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500">
            Automated data ingestion system with self-healing capabilities
          </p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={handleTriggerManualRun}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Trigger Manual Run
          </button>
          {pipelineStatus?.isRunning ? (
            <button
              onClick={handleStopPipeline}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              Stop Pipeline
            </button>
          ) : (
            <button
              onClick={handleStartPipeline}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              Start Pipeline
            </button>
          )}
        </div>
      </div>

      {/* Pipeline Status */}
      {pipelineStatus && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Pipeline Status</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className={`text-2xl font-bold ${pipelineStatus.isRunning ? 'text-green-600' : 'text-red-600'}`}>
                {pipelineStatus.isRunning ? 'Running' : 'Stopped'}
              </div>
              <div className="text-sm text-gray-500">Status</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {pipelineStatus.activeVenues}
              </div>
              <div className="text-sm text-gray-500">Active Venues</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {pipelineStatus.metrics?.totalRuns || 0}
              </div>
              <div className="text-sm text-gray-500">Total Runs</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {pipelineStatus.metrics?.totalEventsProcessed || 0}
              </div>
              <div className="text-sm text-gray-500">Events Processed</div>
            </div>
          </div>
          
          {pipelineStatus.nextRun && (
            <div className="mt-4 text-sm text-gray-600">
              <strong>Next Run:</strong> {new Date(pipelineStatus.nextRun).toLocaleString()}
            </div>
          )}
        </div>
      )}

      {/* Data Sources */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Data Sources</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  URL
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Strategy
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Run
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {dataSources.map((source) => (
                <tr key={source.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {source.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <a href={source.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">
                      {source.url}
                    </a>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {source.strategy}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      source.status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {source.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {source.lastRun ? new Date(source.lastRun).toLocaleString() : 'Never'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quality Metrics */}
      {qualityMetrics && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Quality Metrics</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {qualityMetrics.validEvents || 0}
              </div>
              <div className="text-sm text-gray-500">Valid Events</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {qualityMetrics.invalidEvents || 0}
              </div>
              <div className="text-sm text-gray-500">Invalid Events</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {((qualityMetrics.successRate || 0) * 100).toFixed(1)}%
              </div>
              <div className="text-sm text-gray-500">Success Rate</div>
            </div>
          </div>
        </div>
      )}

      {/* Self-Healing Status */}
      {selfHealingStatus && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Self-Healing Status</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {selfHealingStatus.statistics?.successfulAutoFixes || 0}
              </div>
              <div className="text-sm text-gray-500">Successful Auto-Fixes</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {selfHealingStatus.recommendationQueue?.length || 0}
              </div>
              <div className="text-sm text-gray-500">Pending Recommendations</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {selfHealingStatus.statistics?.totalAutoFixes || 0}
              </div>
              <div className="text-sm text-gray-500">Total Auto-Fixes</div>
            </div>
          </div>
        </div>
      )}

      {/* Execution History */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Recent Executions</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Timestamp
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Duration
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Attempts
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {executionHistory.map((execution, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(execution.timestamp).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      execution.success 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {execution.success ? 'Success' : 'Failed'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {execution.executionTime ? `${execution.executionTime}ms` : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {execution.attempts || 1}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default PipelineDashboard

