import React from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery } from 'react-query'
import { ArrowLeft, Clock, MapPin, Hash } from 'lucide-react'
import { getJob } from '../services/api'
import StatusTimeline from './StatusTimeline'
import ResultsPane from './ResultsPane'

const JobDetails: React.FC = () => {
  const { jobId } = useParams<{ jobId: string }>()

  const { data: job, isLoading, error } = useQuery({
    queryKey: ['job', jobId],
    queryFn: () => getJob(jobId!),
    enabled: !!jobId,
  })

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
        <p className="text-gray-600 mt-2">Loading job details...</p>
      </div>
    )
  }

  if (error || !job) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">Failed to load job details.</p>
        <Link to="/" className="btn btn-primary mt-4">
          Back to Dashboard
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link to="/" className="btn btn-outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{job.courseName}</h1>
            <p className="text-gray-600">Job ID: {job.id}</p>
          </div>
        </div>
        <div className="text-right">
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <Clock className="h-4 w-4" />
            <span>Created: {new Date(job.createdAt).toLocaleString()}</span>
          </div>
          {job.completedAt && (
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <Clock className="h-4 w-4" />
              <span>Completed: {new Date(job.completedAt).toLocaleString()}</span>
            </div>
          )}
        </div>
      </div>

      {/* Job Information */}
      <div className="card p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Job Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="flex items-center space-x-2">
            <MapPin className="h-5 w-5 text-gray-400" />
            <div>
              <p className="text-sm font-medium text-gray-700">Course</p>
              <p className="text-lg font-semibold text-gray-900">{job.courseName}</p>
            </div>
          </div>
          
          {job.coordinates && (
            <div className="flex items-center space-x-2">
              <MapPin className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-700">Coordinates</p>
                <p className="text-lg font-semibold text-gray-900">
                  {job.coordinates[0].toFixed(4)}, {job.coordinates[1].toFixed(4)}
                </p>
              </div>
            </div>
          )}
          
          {job.seed && (
            <div className="flex items-center space-x-2">
              <Hash className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-700">Seed</p>
                <p className="text-lg font-semibold text-gray-900">{job.seed}</p>
              </div>
            </div>
          )}
          
          <div className="flex items-center space-x-2">
            <Clock className="h-5 w-5 text-gray-400" />
            <div>
              <p className="text-sm font-medium text-gray-700">Status</p>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                job.status === 'completed' ? 'bg-green-100 text-green-800' :
                job.status === 'failed' ? 'bg-red-100 text-red-800' :
                'bg-blue-100 text-blue-800'
              }`}>
                {job.status}
              </span>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Clock className="h-5 w-5 text-gray-400" />
            <div>
              <p className="text-sm font-medium text-gray-700">Progress</p>
              <p className="text-lg font-semibold text-gray-900">{job.progress}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Status Timeline */}
      {job.status !== 'completed' && (
        <div className="card p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Progress</h2>
          <StatusTimeline 
            job={job} 
            currentStep={job.status} 
            progress={job.progress || 0} 
          />
        </div>
      )}

      {/* Results */}
      {job.output && (
        <div className="card p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Results</h2>
          <ResultsPane job={job} onClose={() => {}} />
        </div>
      )}

      {/* Errors */}
      {job.errors && job.errors.length > 0 && (
        <div className="card p-6 border-red-200 bg-red-50">
          <h2 className="text-xl font-semibold text-red-800 mb-4">Errors</h2>
          <div className="space-y-2">
            {job.errors.map((error, index) => (
              <div key={index} className="p-3 bg-red-100 rounded-md">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Fallbacks */}
      {job.fallbacks && job.fallbacks.length > 0 && (
        <div className="card p-6 border-yellow-200 bg-yellow-50">
          <h2 className="text-xl font-semibold text-yellow-800 mb-4">Fallbacks Used</h2>
          <div className="space-y-2">
            {job.fallbacks.map((fallback, index) => (
              <div key={index} className="p-3 bg-yellow-100 rounded-md">
                <p className="text-sm font-medium text-yellow-800">
                  {fallback.step}: {fallback.fallback}
                </p>
                <p className="text-xs text-yellow-700 mt-1">
                  Reason: {fallback.reason}
                </p>
                <p className="text-xs text-yellow-700">
                  Time: {new Date(fallback.timestamp).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default JobDetails
