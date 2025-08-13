import { Job, JobStatus } from '../types'
import { logger } from '../utils/logger'
import { analyticsService } from './analytics'
import { videoGeneratorService } from './videoGenerator'
import { v4 as uuidv4 } from 'uuid'

class JobProcessorService {
  private jobs: Map<string, Job> = new Map()
  private processingQueue: string[] = []
  private isProcessing = false

  async createJob(courseName: string, coordinates?: [number, number], seed?: number): Promise<Job> {
    const jobData: Partial<Job> = {
      id: uuidv4(),
      courseName,
      status: 'pending',
      progress: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    // Only add coordinates if provided
    if (coordinates) {
      jobData.coordinates = coordinates
    }

    // Only add seed if provided
    if (seed !== undefined) {
      jobData.seed = seed
    }

    const job = jobData as Job
    this.jobs.set(job.id, job)
    this.processingQueue.push(job.id)

    // Track job creation
    await analyticsService.trackJobAnalytics(job.id, {
      courseName,
      createdAt: job.createdAt,
      status: job.status
    })

    logger.info(`Created job ${job.id} for course: ${courseName}`)

    // Start processing if not already running
    if (!this.isProcessing) {
      this.processQueue()
    }

    return job
  }

  async getJob(jobId: string): Promise<Job | null> {
    return this.jobs.get(jobId) || null
  }

  async getAllJobs(): Promise<Job[]> {
    return Array.from(this.jobs.values()).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
  }

  private async processQueue() {
    if (this.isProcessing || this.processingQueue.length === 0) {
      return
    }

    this.isProcessing = true

    while (this.processingQueue.length > 0) {
      const jobId = this.processingQueue.shift()!
      const job = this.jobs.get(jobId)

      if (!job) {
        continue
      }

      try {
        await this.processJob(job)
      } catch (error) {
        logger.error(`Failed to process job ${jobId}:`, error)
        
        // Update job status to failed
        job.status = 'failed'
        job.updatedAt = new Date().toISOString()
        job.errors = [(error as Error).message]

        // Track job failure
        await analyticsService.trackError(jobId, 'job_processing', (error as Error).message, 'error', { courseName: job.courseName })
      }
    }

    this.isProcessing = false
  }

  private async processJob(job: Job) {
    const startTime = Date.now()
    logger.info(`Processing job ${job.id}: ${job.courseName}`)

    try {
      // Step 1: Geocoding (if coordinates not provided)
      await this.updateJobStatus(job, 'geocoding')
      if (!job.coordinates) {
        job.coordinates = await this.geocodeCourse(job.courseName)
      }
      await this.simulateStep('geocoding', 1000)

      // Step 2: Fetching Data
      await this.updateJobStatus(job, 'fetching_data')
      await this.fetchCourseData(job)
      await this.simulateStep('fetching_data', 2000)

      // Step 3: Building Model
      await this.updateJobStatus(job, 'building_model')
      await this.buildCourseModel(job)
      await this.simulateStep('building_model', 3000)

      // Step 4: Rendering
      await this.updateJobStatus(job, 'rendering')
      await this.renderVideo(job)
      await this.simulateStep('rendering', 5000)

      // Step 5: Post-Production
      await this.updateJobStatus(job, 'post_production')
      await this.postProcessVideo(job)
      await this.simulateStep('post_production', 2000)

      // Step 6: Deliver
      await this.updateJobStatus(job, 'deliver')
      await this.deliverVideo(job)

      // Mark job as completed
      job.status = 'completed'
      job.progress = 100 // Set to 100% when completed
      job.completedAt = new Date().toISOString()
      job.updatedAt = new Date().toISOString()

      const totalDuration = Date.now() - startTime

      // Track successful completion
      await analyticsService.trackJobAnalytics(job.id, {
        courseName: job.courseName,
        coordinates: job.coordinates,
        createdAt: job.createdAt,
        completedAt: job.completedAt,
        status: job.status,
        duration: totalDuration
      })

      logger.info(`Job ${job.id} completed successfully in ${totalDuration}ms`)

    } catch (error) {
      throw error
    }
  }

  private async updateJobStatus(job: Job, status: JobStatus) {
    job.status = status
    job.updatedAt = new Date().toISOString()

    // Calculate progress based on step
    const stepProgress: Record<JobStatus, number> = {
      'pending': 0,
      'geocoding': 10,
      'fetching_data': 25,
      'building_model': 40,
      'rendering': 70,
      'post_production': 85,
      'deliver': 95,
      'completed': 100,
      'failed': 0,
      'cancelled': 0
    }
    
    job.progress = stepProgress[status]

    // Track status update
    await analyticsService.trackPerformance(job.id, status, 0, true)

    logger.info(`Job ${job.id} status: ${status}, progress: ${job.progress}%`)
  }

  private async geocodeCourse(courseName: string): Promise<[number, number]> {
    // Simulate geocoding API call
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // Return mock coordinates for the course
    const mockCoordinates: { [key: string]: [number, number] } = {
      'Bacon Park Golf Course': [32.0748, -81.0943],
      'Augusta National Golf Club': [33.5021, -82.0228],
      'Pebble Beach Golf Links': [36.5683, -121.9497],
      'St. Andrews Old Course': [56.3398, -2.7967],
      'Pinehurst No. 2': [35.1894, -79.4697]
    }

    return mockCoordinates[courseName] || [40.7128, -74.0060] // Default to NYC
  }

  private async fetchCourseData(job: Job) {
    // Simulate fetching course data from various APIs
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Track API calls
    await analyticsService.trackPerformance(job.id, 'api_calls', 1000, true)

  }

  private async buildCourseModel(job: Job) {
    // Simulate 3D model building
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Track model building performance
    await analyticsService.trackPerformance(job.id, 'model_building', 2000, true)

  }

  private async renderVideo(job: Job) {
    // Use real video generation service
    try {
      const output = await videoGeneratorService.generateVideo(job)
      job.output = output

      // Track successful video generation
      await analyticsService.trackPerformance(job.id, 'video_generation', 5000, true)

    } catch (error) {
      // Track video generation error
      await analyticsService.trackError(job.id, 'video_generation', (error as Error).message, 'error')
      throw error
    }
  }

  private async postProcessVideo(job: Job) {
    // Simulate post-processing (color grading, audio mixing, etc.)
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    // Track post-processing
    await analyticsService.trackPerformance(job.id, 'post_processing', 1500, true)

  }

  private async deliverVideo(job: Job) {
    // Simulate final delivery preparation
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // Track delivery
    await analyticsService.trackPerformance(job.id, 'delivery', 500, true)

    // Cleanup temporary files
    await videoGeneratorService.cleanupTempFiles(job.id)
  }

  private async simulateStep(step: string, duration: number) {
    await new Promise(resolve => setTimeout(resolve, duration))
  }

  // WebSocket event emitter for real-time updates
  emitJobUpdate(job: Job) {
    // This would emit to connected WebSocket clients
    // For now, we'll just log the update
    logger.info(`Job update: ${job.id} - ${job.status}`)
  }

  // Service management methods
  startProcessing() {
    logger.info('Job processor service started')
    this.processQueue()
  }

  getActiveJobCount(): number {
    return Array.from(this.jobs.values()).filter(job => 
      job.status === 'geocoding' || job.status === 'fetching_data' || 
      job.status === 'building_model' || job.status === 'rendering' || 
      job.status === 'post_production'
    ).length
  }

  getCompletedJobCount(): number {
    return Array.from(this.jobs.values()).filter(job => job.status === 'completed').length
  }

  getFailedJobCount(): number {
    return Array.from(this.jobs.values()).filter(job => job.status === 'failed').length
  }

  getQueueLength(): number {
    return this.processingQueue.length
  }
}

export const jobProcessorService = new JobProcessorService()
