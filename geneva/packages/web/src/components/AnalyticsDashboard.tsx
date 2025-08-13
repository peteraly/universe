import React, { useState, useEffect } from 'react'
import { BarChart3, TrendingUp, AlertTriangle, Users, Clock, CheckCircle, XCircle } from 'lucide-react'
import api from '../services/api'

interface AnalyticsData {
  overview: {
    totalJobs: number
    successRate: string
    averageRenderTime: string
    activeSessions: number
    errorRate: number
  }
  performance: {
    recentJobs: number
    averageMemoryUsage: number
    averageCpuUsage: number
    trends: Array<{
      date: string
      jobs: number
      averageDuration: number
    }>
  }
  quality: {
    topErrors: Array<{
      error: string
      count: number
    }>
    topCourses: Array<{
      course: string
      count: number
    }>
    userSatisfaction: number
  }
  system: {
    resourceUtilization: {
      cpu: number
      memory: number
      disk: number
      network: number
    }
    apiPerformance: {
      geocoding: number
      elevation: number
      satellite: number
      weather: number
    }
  }
}

const AnalyticsDashboard: React.FC = () => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchAnalyticsData()
    const interval = setInterval(fetchAnalyticsData, 30000) // Refresh every 30 seconds
    return () => clearInterval(interval)
  }, [])

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true)
      const response = await api.get('/api/analytics/dashboard')
      setAnalyticsData(response.data.data)
      setError(null)
    } catch (err) {
      setError('Failed to load analytics data')
      console.error('Analytics fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error || !analyticsData) {
    return (
      <div className="text-center py-8">
        <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <p className="text-red-600">{error || 'No analytics data available'}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <BarChart3 className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Jobs</p>
              <p className="text-2xl font-bold text-gray-900">{analyticsData.overview.totalJobs}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Success Rate</p>
              <p className="text-2xl font-bold text-gray-900">{analyticsData.overview.successRate}%</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Clock className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Avg Render Time</p>
              <p className="text-2xl font-bold text-gray-900">{analyticsData.overview.averageRenderTime}s</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Users className="h-6 w-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Sessions</p>
              <p className="text-2xl font-bold text-gray-900">{analyticsData.overview.activeSessions}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Trends */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Trends (Last 7 Days)</h3>
        <div className="grid grid-cols-7 gap-4">
          {analyticsData.performance.trends.map((trend, index) => (
            <div key={index} className="text-center">
              <div className="text-sm text-gray-600 mb-2">{trend.date}</div>
              <div className="text-lg font-bold text-gray-900">{trend.jobs}</div>
              <div className="text-xs text-gray-500">{trend.averageDuration.toFixed(1)}s avg</div>
            </div>
          ))}
        </div>
      </div>

      {/* System Health */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Resource Utilization</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>CPU</span>
                <span>{analyticsData.system.resourceUtilization.cpu.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full" 
                  style={{ width: `${analyticsData.system.resourceUtilization.cpu}%` }}
                ></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Memory</span>
                <span>{analyticsData.system.resourceUtilization.memory.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-600 h-2 rounded-full" 
                  style={{ width: `${analyticsData.system.resourceUtilization.memory}%` }}
                ></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Disk</span>
                <span>{analyticsData.system.resourceUtilization.disk.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-purple-600 h-2 rounded-full" 
                  style={{ width: `${analyticsData.system.resourceUtilization.disk}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">API Performance</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Geocoding</span>
              <span className="text-sm font-medium">{analyticsData.system.apiPerformance.geocoding.toFixed(0)}ms</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Elevation</span>
              <span className="text-sm font-medium">{analyticsData.system.apiPerformance.elevation.toFixed(0)}ms</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Satellite</span>
              <span className="text-sm font-medium">{analyticsData.system.apiPerformance.satellite.toFixed(0)}ms</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Weather</span>
              <span className="text-sm font-medium">{analyticsData.system.apiPerformance.weather.toFixed(0)}ms</span>
            </div>
          </div>
        </div>
      </div>

      {/* Top Errors and Courses */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Errors</h3>
          <div className="space-y-3">
            {analyticsData.quality.topErrors.slice(0, 5).map((error, index) => (
              <div key={index} className="flex justify-between items-center">
                <span className="text-sm text-gray-600 truncate flex-1">{error.error}</span>
                <span className="text-sm font-medium bg-red-100 text-red-800 px-2 py-1 rounded">
                  {error.count}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Courses</h3>
          <div className="space-y-3">
            {analyticsData.quality.topCourses.slice(0, 5).map((course, index) => (
              <div key={index} className="flex justify-between items-center">
                <span className="text-sm text-gray-600 truncate flex-1">{course.course}</span>
                <span className="text-sm font-medium bg-blue-100 text-blue-800 px-2 py-1 rounded">
                  {course.count}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* User Satisfaction */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">User Satisfaction</h3>
        <div className="flex items-center space-x-4">
          <div className="text-3xl font-bold text-gray-900">
            {analyticsData.quality.userSatisfaction.toFixed(1)}/5.0
          </div>
          <div className="flex space-x-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star 
                key={star}
                className={`h-6 w-6 ${
                  star <= analyticsData.quality.userSatisfaction 
                    ? 'text-yellow-400 fill-current' 
                    : 'text-gray-300'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AnalyticsDashboard
