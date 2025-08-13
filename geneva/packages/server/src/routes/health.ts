import { Router } from 'express'
import { logger } from '../utils/logger'
import { jobQueue } from '../services/queue'

const router = Router()

// Basic health check
router.get('/', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    version: process.env.npm_package_version || '1.0.0'
  })
})

// Detailed health check
router.get('/detailed', async (req, res) => {
  try {
    const queueInfo = await jobQueue.getJobCounts()
    const redisConnected = jobQueue.client.status === 'ready'

    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      version: process.env.npm_package_version || '1.0.0',
      services: {
        redis: {
          status: redisConnected ? 'connected' : 'disconnected',
          queue: queueInfo
        },
        workers: {
          data: 'active', // This would check actual worker status
          model: 'active',
          post: 'active'
        }
      }
    })
  } catch (error) {
    logger.error('Health check failed:', error)
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

// Readiness check
router.get('/ready', async (req, res) => {
  try {
    const redisConnected = jobQueue.client.status === 'ready'
    
    if (!redisConnected) {
      return res.status(503).json({
        status: 'not ready',
        timestamp: new Date().toISOString(),
        reason: 'Redis not connected'
      })
    }

    res.json({
      status: 'ready',
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    logger.error('Readiness check failed:', error)
    res.status(503).json({
      status: 'not ready',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

// Liveness check
router.get('/live', (req, res) => {
  res.json({
    status: 'alive',
    timestamp: new Date().toISOString(),
    pid: process.pid
  })
})

export default router
