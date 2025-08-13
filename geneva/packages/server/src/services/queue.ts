import { Queue, Worker, Job } from 'bullmq'
import Redis from 'ioredis'
import { logger } from '../utils/logger'
import { Job as JobType, JobStatus } from '../types'
import { emitJobUpdate, emitJobComplete, emitJobError } from './websocket'

// Redis connection
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
  maxRetriesPerRequest: 3,
  enableReadyCheck: false
})

// In-memory job storage (in production, this would be a database)
const jobs = new Map<string, JobType>()

// Job queue
export const jobQueue = new Queue('golfvision-jobs', {
  connection: redis,
  defaultJobOptions: {
    removeOnComplete: 100,
    removeOnFail: 50,
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000
    }
  }
})

// Worker for processing jobs
export const jobWorker = new Worker('golfvision-jobs', async (job: Job) => {
  const jobData = job.data as JobType
  logger.info(`Processing job ${job.id} for course: ${jobData.courseName}`)

  try {
    // This is where the actual job processing would happen
    // For now, we'll simulate the process with delays
    
    // Step 1: Geocoding
    await updateJobStatus(job.id!, 'geocoding' as JobStatus, 10)
    await simulateWork(2000)
    
    // Step 2: Fetching data
    await updateJobStatus(job.id!, 'fetching_data' as JobStatus, 25)
    await simulateWork(3000)
    
    // Step 3: Building model
    await updateJobStatus(job.id!, 'building_model' as JobStatus, 50)
    await simulateWork(5000)
    
    // Step 4: Rendering
    await updateJobStatus(job.id!, 'rendering' as JobStatus, 75)
    await simulateWork(8000)
    
    // Step 5: Post-processing
    await updateJobStatus(job.id!, 'post_processing' as JobStatus, 90)
    await simulateWork(3000)
    
    // Step 6: Complete
    const output = {
      videoUrl: `http://localhost:4000/outputs/${job.id}/video.mp4`,
      captionsUrl: `http://localhost:4000/outputs/${job.id}/captions.srt`,
      previewUrl: `http://localhost:4000/outputs/${job.id}/preview.jpg`,
      metadata: {
        duration: 75,
        resolution: '1920x1080',
        fileSize: 15728640, // 15MB
        renderTime: 21000
      }
    }
    
    await updateJobStatus(job.id!, 'completed' as JobStatus, 100, output)
    emitJobComplete(job.id!, jobs.get(job.id!)!)

    logger.info(`Job ${job.id} completed successfully`)
    return { success: true }
  } catch (error) {
    logger.error(`Job ${job.id} failed:`, error)
    await updateJobStatus(job.id!, 'failed' as JobStatus, 0, undefined, [error instanceof Error ? error.message : 'Unknown error'])
    emitJobError(job.id!, error instanceof Error ? error.message : 'Unknown error')
    throw error
  }
}, {
  connection: redis,
  concurrency: parseInt(process.env.MAX_CONCURRENT_JOBS || '3')
})

// Worker event handlers
jobWorker.on('completed', (job) => {
  logger.info(`Job ${job.id} completed successfully`)
})

jobWorker.on('failed', (job, err) => {
  logger.error(`Job ${job?.id} failed:`, err)
})

jobWorker.on('error', (err) => {
  logger.error('Worker error:', err)
})

// Setup function
export async function setupJobQueue() {
  try {
    // Test Redis connection
    await redis.ping()
    logger.info('Redis connection established')

    // Clear any stuck jobs on startup
    await jobQueue.clean(0, 1000, 'failed')
    await jobQueue.clean(0, 1000, 'completed')

    logger.info('Job queue setup completed')
  } catch (error) {
    logger.error('Failed to setup job queue:', error)
    throw error
  }
}

// Helper function to simulate work
async function simulateWork(delay: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, delay))
}

// Helper function to update job status
async function updateJobStatus(
  jobId: string, 
  status: JobStatus, 
  progress: number, 
  output?: any, 
  errors?: string[]
): Promise<void> {
  // Get the current job
  const job = jobs.get(jobId)
  if (!job) {
    logger.warn(`Job ${jobId} not found in memory storage`)
    return
  }

  // Update job status
  job.status = status
  job.progress = progress
  if (output) {
    job.output = output
  }
  if (errors) {
    job.errors = errors
  }
  job.updatedAt = new Date().toISOString()
  
  // Set completedAt timestamp when job is completed
  if (status === 'completed') {
    job.completedAt = new Date().toISOString()
  }

  // Store updated job
  jobs.set(jobId, job)

  // Log the update
  logger.info(`Job ${jobId} status: ${status} (${progress}%)`)
  
  // Emit WebSocket update
  emitJobUpdate(jobId, job)
}

// Function to add a job to memory storage
export function addJobToStorage(job: JobType): void {
  jobs.set(job.id, job)
}

// Function to get a job from memory storage
export function getJobFromStorage(jobId: string): JobType | undefined {
  return jobs.get(jobId)
}

// Function to get all jobs from memory storage
export function getAllJobsFromStorage(): JobType[] {
  return Array.from(jobs.values())
}

// Graceful shutdown
export async function shutdownQueue() {
  try {
    await jobWorker.close()
    await jobQueue.close()
    await redis.quit()
    logger.info('Job queue shutdown completed')
  } catch (error) {
    logger.error('Error during queue shutdown:', error)
  }
}

// Handle process termination
process.on('SIGTERM', shutdownQueue)
process.on('SIGINT', shutdownQueue)
