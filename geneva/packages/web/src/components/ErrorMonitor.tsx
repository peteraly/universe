import React, { useState, useEffect } from 'react'
import { AlertTriangle, CheckCircle, XCircle, Info, Filter } from 'lucide-react'
import { ErrorReport } from '../../server/src/utils/errorTracker'

interface ErrorMonitorProps {
  isOpen: boolean
  onClose: () => void
}

const ErrorMonitor: React.FC<ErrorMonitorProps> = ({ isOpen, onClose }) => {
  const [errors, setErrors] = useState<ErrorReport[]>([])
  const [stats, setStats] = useState<any>(null)
  const [filters, setFilters] = useState({
    resolved: undefined as boolean | undefined,
    severity: '' as string,
    type: '' as string
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isOpen) {
      fetchErrors()
    }
  }, [isOpen, filters])

  const fetchErrors = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filters.resolved !== undefined) params.append('resolved', filters.resolved.toString())
      if (filters.severity) params.append('severity', filters.severity)
      if (filters.type) params.append('type', filters.type)

      const [errorsRes, statsRes] = await Promise.all([
        fetch(`/api/errors?${params}`),
        fetch('/api/errors/stats')
      ])

      if (errorsRes.ok) {
        const errorsData = await errorsRes.json()
        setErrors(errorsData.data || [])
      }

      if (statsRes.ok) {
        const statsData = await statsRes.json()
        setStats(statsData.data)
      }
    } catch (error) {
      console.error('Failed to fetch errors:', error)
    } finally {
      setLoading(false)
    }
  }

  const resolveError = async (errorId: string, notes?: string) => {
    try {
      const response = await fetch(`/api/errors/${errorId}/resolve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes })
      })

      if (response.ok) {
        fetchErrors() // Refresh the list
      }
    } catch (error) {
      console.error('Failed to resolve error:', error)
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-50 border-red-200'
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200'
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'low': return 'text-blue-600 bg-blue-50 border-blue-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'error': return <XCircle className="h-4 w-4" />
      case 'warning': return <AlertTriangle className="h-4 w-4" />
      case 'info': return <Info className="h-4 w-4" />
      default: return <Info className="h-4 w-4" />
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl h-5/6 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">Error Monitor</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XCircle className="h-6 w-6" />
          </button>
        </div>

        {/* Stats */}
        {stats && (
          <div className="p-6 bg-gray-50 border-b">
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
                <div className="text-sm text-gray-600">Total</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{stats.unresolved}</div>
                <div className="text-sm text-gray-600">Unresolved</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{stats.resolved}</div>
                <div className="text-sm text-gray-600">Resolved</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{stats.bySeverity.critical}</div>
                <div className="text-sm text-gray-600">Critical</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{stats.bySeverity.high}</div>
                <div className="text-sm text-gray-600">High</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">{stats.bySeverity.medium}</div>
                <div className="text-sm text-gray-600">Medium</div>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="p-4 border-b bg-white">
          <div className="flex items-center space-x-4">
            <Filter className="h-5 w-5 text-gray-400" />
            <select
              value={filters.resolved === undefined ? '' : filters.resolved.toString()}
              onChange={(e) => setFilters(prev => ({
                ...prev,
                resolved: e.target.value === '' ? undefined : e.target.value === 'true'
              }))}
              className="border border-gray-300 rounded-md px-3 py-1"
            >
              <option value="">All Status</option>
              <option value="false">Unresolved</option>
              <option value="true">Resolved</option>
            </select>

            <select
              value={filters.severity}
              onChange={(e) => setFilters(prev => ({ ...prev, severity: e.target.value }))}
              className="border border-gray-300 rounded-md px-3 py-1"
            >
              <option value="">All Severities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>

            <select
              value={filters.type}
              onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
              className="border border-gray-300 rounded-md px-3 py-1"
            >
              <option value="">All Types</option>
              <option value="error">Errors</option>
              <option value="warning">Warnings</option>
              <option value="info">Info</option>
            </select>

            <button
              onClick={fetchErrors}
              disabled={loading}
              className="btn btn-sm btn-primary"
            >
              {loading ? 'Loading...' : 'Refresh'}
            </button>
          </div>
        </div>

        {/* Error List */}
        <div className="flex-1 overflow-auto p-6">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
              <p className="text-gray-600 mt-2">Loading errors...</p>
            </div>
          ) : errors.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <p className="text-gray-600">No errors found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {errors.map((error) => (
                <div
                  key={error.id}
                  className={`border rounded-lg p-4 ${error.resolved ? 'bg-gray-50' : 'bg-white'}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        {getTypeIcon(error.type)}
                        <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getSeverityColor(error.severity)}`}>
                          {error.severity}
                        </span>
                        {error.resolved && (
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                            Resolved
                          </span>
                        )}
                        <span className="text-sm text-gray-500">
                          {new Date(error.timestamp).toLocaleString()}
                        </span>
                      </div>
                      
                      <h3 className="font-medium text-gray-900 mb-2">{error.message}</h3>
                      
                      {error.context && Object.keys(error.context).length > 0 && (
                        <div className="text-sm text-gray-600 mb-2">
                          <strong>Context:</strong> {JSON.stringify(error.context)}
                        </div>
                      )}
                      
                      {error.stack && (
                        <details className="text-sm text-gray-600">
                          <summary className="cursor-pointer hover:text-gray-800">Stack Trace</summary>
                          <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-x-auto">
                            {error.stack}
                          </pre>
                        </details>
                      )}
                      
                      {error.resolved && error.notes && (
                        <div className="mt-2 p-2 bg-green-50 rounded text-sm">
                          <strong>Resolution Notes:</strong> {error.notes}
                        </div>
                      )}
                    </div>
                    
                    {!error.resolved && (
                      <button
                        onClick={() => {
                          const notes = prompt('Enter resolution notes:')
                          if (notes !== null) {
                            resolveError(error.id, notes)
                          }
                        }}
                        className="btn btn-sm btn-outline ml-4"
                      >
                        Resolve
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ErrorMonitor
