import { Worker, Job } from 'bullmq'
import Redis from 'ioredis'
import dotenv from 'dotenv'
import { logger } from './utils/logger'
import { geocodeCourse } from './geocoding/nominatim'
import { fetchDEMData } from './dem/opentopodata'
import { fetchOSMData } from './osm/overpass'
import { JobData, CourseData } from './types'

// Load environment variables
dotenv.config()

// Redis connection
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
  maxRetriesPerRequest: 3,
  retryDelayOnFailover: 100,
  enableReadyCheck: false,
  maxRetriesPerRequest: null
})

// Data worker
const dataWorker = new Worker('data-worker', async (job: Job) => {
  const jobData = job.data as JobData
  logger.info(`Processing data job ${job.id} for course: ${jobData.courseName}`)

  try {
    let coordinates = jobData.coordinates
    let courseData: CourseData

    // Step 1: Geocoding (if coordinates not provided)
    if (!coordinates) {
      logger.info(`Geocoding course: ${jobData.courseName}`)
      coordinates = await geocodeCourse(jobData.courseName)
      
      if (!coordinates) {
        // Use fallback coordinates
        const fallbackCoords = process.env.DEMO_COORDINATES?.split(',').map(Number) as [number, number]
        coordinates = fallbackCoords || [36.5683, -121.9496] // Pebble Beach default
        logger.warn(`Geocoding failed, using fallback coordinates: ${coordinates}`)
      }
    }

    // Step 2: Fetch DEM (elevation) data
    logger.info(`Fetching DEM data for coordinates: ${coordinates}`)
    const demData = await fetchDEMData(coordinates)
    
    if (!demData) {
      logger.warn('DEM data fetch failed, will use flat plane fallback')
    }

    // Step 3: Fetch OSM (course layout) data
    logger.info(`Fetching OSM data for coordinates: ${coordinates}`)
    const osmData = await fetchOSMData(coordinates)
    
    if (!osmData) {
      logger.warn('OSM data fetch failed, will use procedural layout fallback')
    }

    // Compile course data
    courseData = {
      name: jobData.courseName,
      coordinates,
      elevation: demData?.elevation || 0,
      holes: osmData?.holes || generateProceduralHoles(),
      amenities: osmData?.amenities || []
    }

    logger.info(`Data collection completed for ${jobData.courseName}`)
    return courseData

  } catch (error) {
    logger.error(`Data job ${job.id} failed:`, error)
    
    // Return fallback data
    const fallbackData: CourseData = {
      name: jobData.courseName,
      coordinates: jobData.coordinates || [36.5683, -121.9496],
      elevation: 0,
      holes: generateProceduralHoles(),
      amenities: []
    }
    
    return fallbackData
  }
}, {
  connection: redis,
  concurrency: 2
})

// Worker event handlers
dataWorker.on('completed', (job) => {
  logger.info(`Data job ${job.id} completed successfully`)
})

dataWorker.on('failed', (job, err) => {
  logger.error(`Data job ${job?.id} failed:`, err)
})

dataWorker.on('error', (err) => {
  logger.error('Data worker error:', err)
})

// Generate procedural holes when OSM data is unavailable
function generateProceduralHoles() {
  const holes = []
  for (let i = 1; i <= 18; i++) {
    holes.push({
      number: i,
      par: i <= 4 ? 3 : i <= 14 ? 4 : 5,
      distance: 150 + Math.random() * 200,
      coordinates: [0, 0], // Will be calculated based on course layout
      features: ['fairway', 'green']
    })
  }
  return holes
}

// Graceful shutdown
async function shutdown() {
  try {
    await dataWorker.close()
    await redis.quit()
    logger.info('Data worker shutdown completed')
  } catch (error) {
    logger.error('Error during data worker shutdown:', error)
  }
}

// Handle process termination
process.on('SIGTERM', shutdown)
process.on('SIGINT', shutdown)

logger.info('Data worker started')
