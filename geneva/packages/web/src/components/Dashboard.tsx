import React, { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { toast } from 'react-hot-toast'
import JobForm from './JobForm'
import StatusTimeline from './StatusTimeline'
import ResultsPane from './ResultsPane'
import { Job, JobCreateRequest } from '../types'
import { createJob, getJobs } from '../services/api'

const Dashboard: React.FC = () => {
  const [activeJob, setActiveJob] = useState<Job | null>(null)
  const queryClient = useQueryClient()

  // Fetch jobs
  const { data: jobs = [], isLoading } = useQuery<Job[]>({
    queryKey: ['jobs'],
    queryFn: getJobs,
    refetchInterval: 5000, // Poll every 5 seconds
  })

  // Update active job with latest data from jobs array
  useEffect(() => {
    if (activeJob && jobs.length > 0) {
      const latestJob = jobs.find(job => job.id === activeJob.id)
      if (latestJob && (latestJob.status !== activeJob.status || latestJob.progress !== activeJob.progress)) {
        setActiveJob(latestJob)
        
        // Show completion toast when job completes
        if (latestJob.status === 'completed' && activeJob.status !== 'completed') {
          toast.success('Video generation complete!')
        }
      }
    }
  }, [jobs, activeJob])

  // Create job mutation
  const createJobMutation = useMutation({
    mutationFn: createJob,
    onSuccess: (newJob: Job) => {
      setActiveJob(newJob)
      queryClient.invalidateQueries(['jobs'])
      toast.success('Job created successfully!')
    },
    onError: (error: Error) => {
      toast.error(`Failed to create job: ${error.message}`)
    },
  })

  const handleCreateJob = (jobData: JobCreateRequest) => {
    createJobMutation.mutate(jobData)
  }

  const handleJobComplete = (job: Job) => {
    setActiveJob(job)
    toast.success('Video generation complete!')
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Golf Course Video Generator
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Create stunning marketing videos for any golf course using open data and AI.
          No filming required.
        </p>
      </div>

      {/* Job Creation Form */}
      <div className="card p-6">
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">
          Create New Video
        </h2>
        <JobForm onSubmit={handleCreateJob} isLoading={createJobMutation.isLoading} />
      </div>

      {/* Active Job Status */}
      {activeJob && (
        <div className="card p-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">
            Current Job: {activeJob.courseName}
          </h2>
          <StatusTimeline 
            job={activeJob} 
            currentStep={activeJob.status} 
            progress={activeJob.progress || 0} 
          />
        </div>
      )}

      {/* Results */}
      {activeJob?.output && (
        <div className="card p-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">
            Your Video
          </h2>
          <ResultsPane job={activeJob} />
        </div>
      )}

      {/* Recent Jobs */}
      {jobs.length > 0 && (
        <div className="card p-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">
            Recent Jobs
          </h2>
          <div className="space-y-4">
            {jobs.slice(0, 5).map((job) => (
              <div
                key={job.id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div>
                  <h3 className="font-medium text-gray-900">{job.courseName}</h3>
                  <p className="text-sm text-gray-500">
                    {new Date(job.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    job.status === 'completed' ? 'bg-green-100 text-green-800' :
                    job.status === 'failed' ? 'bg-red-100 text-red-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {job.status}
                  </span>
                  {job.status === 'completed' && (
                    <button
                      onClick={() => setActiveJob(job)}
                      className="btn btn-sm btn-primary"
                    >
                      View
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
          <p className="text-gray-600 mt-2">Loading jobs...</p>
        </div>
      )}
    </div>
  )
}

export default Dashboard
