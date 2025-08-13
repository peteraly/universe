import { Worker, Job } from 'bullmq'
import Redis from 'ioredis'
import dotenv from 'dotenv'
import path from 'path'
import fs from 'fs-extra'
import logger from './utils/logger'
import { BlenderClient } from './blender/blenderClient'
import { ModelJobData, ModelOutput, BlenderConfig } from './types'

dotenv.config()

// Redis connection
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
  maxRetriesPerRequest: 3,
  retryDelayOnFailover: 100,
  enableReadyCheck: false,
  maxRetriesPerRequest: null
})

// Blender configuration
const blenderConfig: BlenderConfig = {
  executable: process.env.BLENDER_EXECUTABLE || 'blender',
  pythonPath: process.env.BLENDER_PYTHON_PATH || '',
  addonPath: process.env.BLENDER_ADDON_PATH || '',
  gpuEnabled: process.env.BLENDER_GPU_ENABLED === 'true',
  maxMemory: parseInt(process.env.BLENDER_MAX_MEMORY || '8192'),
  timeout: parseInt(process.env.BLENDER_TIMEOUT || '300000') // 5 minutes
}

// Initialize Blender client
const blenderClient = new BlenderClient(blenderConfig)

// Create model worker
const modelWorker = new Worker('model-worker', async (job: Job) => {
  const jobData = job.data as ModelJobData
  logger.info(`Processing model job ${job.id} for course: ${jobData.courseName}`)

  try {
    // Check Blender availability
    const blenderAvailable = await blenderClient.checkBlenderAvailability()
    
    if (!blenderAvailable) {
      logger.warn('Blender not available, using storyboard mode', { jobId: job.id })
      return await blenderClient.generateStoryboard(jobData)
    }

    // Check GPU availability if enabled
    if (blenderConfig.gpuEnabled) {
      const gpuAvailable = await blenderClient.checkGPUAvailability()
      if (!gpuAvailable) {
        logger.warn('GPU not available, falling back to CPU rendering', { jobId: job.id })
        blenderConfig.gpuEnabled = false
      }
    }

    // Create output directory
    const outputPath = path.join(process.cwd(), 'outputs', `model_${jobData.jobId}`)
    await fs.ensureDir(outputPath)

    // Generate 3D model
    const modelOutput = await blenderClient.generateModel({
      ...jobData,
      outputPath
    })

    logger.info(`Model generation completed for job ${job.id}`, {
      outputPath: modelOutput.modelPath,
      fallbackUsed: modelOutput.fallbackUsed
    })

    return modelOutput
  } catch (error) {
    logger.error(`Model job ${job.id} failed:`, error)
    
    // Try storyboard mode as fallback
    try {
      logger.info('Attempting storyboard mode fallback', { jobId: job.id })
      const storyboardOutput = await blenderClient.generateStoryboard(jobData)
      storyboardOutput.fallbackReason = `Original error: ${error.message}`
      return storyboardOutput
    } catch (fallbackError) {
      logger.error('Storyboard fallback also failed:', fallbackError)
      throw error
    }
  }
}, { 
  connection: redis, 
  concurrency: parseInt(process.env.MAX_CONCURRENT_MODEL_JOBS || '2') 
})

// Event handlers
modelWorker.on('completed', (job: Job, result: ModelOutput) => {
  logger.info(`Model job ${job.id} completed successfully`, {
    fallbackUsed: result.fallbackUsed,
    modelPath: result.modelPath
  })
})

modelWorker.on('failed', (job: Job, error: Error) => {
  logger.error(`Model job ${job.id} failed:`, error)
})

modelWorker.on('error', (error: Error) => {
  logger.error('Model worker error:', error)
})

// Graceful shutdown
const shutdown = async () => {
  logger.info('Shutting down model worker...')
  await modelWorker.close()
  await redis.quit()
  process.exit(0)
}

process.on('SIGTERM', shutdown)
process.on('SIGINT', shutdown)

logger.info('Model worker started', {
  blenderExecutable: blenderConfig.executable,
  gpuEnabled: blenderConfig.gpuEnabled,
  maxConcurrentJobs: parseInt(process.env.MAX_CONCURRENT_MODEL_JOBS || '2')
})
