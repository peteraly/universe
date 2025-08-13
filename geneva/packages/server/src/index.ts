import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import compression from 'compression'
import rateLimit from 'express-rate-limit'
import { createServer } from 'http'
import { Server as SocketIOServer } from 'socket.io'
import { config } from 'dotenv'
import * as path from 'path'
import { logger } from './utils/logger'
import { setupWebSocket } from './services/websocket'
import { jobProcessorService } from './services/jobProcessor'
import jobsRouter from './routes/jobs'
import analyticsRouter from './routes/analytics'
import { analyticsService } from './services/analytics'

// Load environment variables
config()

const app = express()
const server = createServer(app)
const io = new SocketIOServer(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3001",
    methods: ["GET", "POST"]
  }
})

// Middleware
app.use(helmet())
app.use(compression())
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3001",
  credentials: true
}))

// Rate limiting
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 1000, // limit each IP to 1000 requests per minute
  message: 'Too many requests from this IP, please try again later.'
})
app.use('/api/', limiter)

app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'golfvision-server',
    version: process.env.npm_package_version || '1.0.0'
  })
})

// API routes
app.use('/api/jobs', jobsRouter)
app.use('/api/analytics', analyticsRouter)

// Serve static files (videos, thumbnails, captions) with CORS headers
app.use('/outputs', (req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Methods', 'GET, OPTIONS')
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept')
  next()
}, express.static(path.join(process.cwd(), 'outputs')))

// API documentation endpoint
app.get('/api', (req, res) => {
  res.json({
    name: 'GolfVision API',
    version: '1.0.0',
    description: 'AI-powered golf course video generation API',
    endpoints: {
      health: 'GET /health',
      jobs: {
        create: 'POST /api/jobs',
        list: 'GET /api/jobs',
        get: 'GET /api/jobs/:id',
        update: 'PATCH /api/jobs/:id',
        cancel: 'POST /api/jobs/:id/cancel',
        delete: 'DELETE /api/jobs/:id',
        searchCourses: 'GET /api/jobs/search-courses'
      },
      analytics: {
        dashboard: 'GET /api/analytics/dashboard',
        performance: 'GET /api/analytics/performance/trends',
        errors: 'GET /api/analytics/errors/top',
        courses: 'GET /api/analytics/courses/top',
        system: 'GET /api/analytics/system/health',
        feedback: 'POST /api/analytics/feedback',
        performanceSubmit: 'POST /api/analytics/performance',
        errorsSubmit: 'POST /api/analytics/errors'
      }
    }
  })
})

// WebSocket setup
setupWebSocket(io)

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error('Unhandled error:', err)
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  })
})

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Not found',
    message: `Route ${req.originalUrl} not found`
  })
})

// Start server
const startServer = async () => {
  try {
    // Initialize job processor service
    jobProcessorService.startProcessing()
    
    const port = process.env.PORT || 4000
    
    server.listen(port, () => {
      logger.info(`🚀 GolfVision server running on port ${port}`)
      logger.info(`📊 Health check: http://localhost:${port}/health`)
      logger.info(`🔗 API docs: http://localhost:${port}/api`)
      
      // Start system metrics tracking
      setInterval(() => {
        analyticsService.trackSystemMetrics({
          timestamp: new Date().toISOString(),
          cpu: 0,
          memory: 0,
          disk: 0,
          network: 0,
          activeJobs: jobProcessorService.getActiveJobCount(),
          queueLength: jobProcessorService.getQueueLength()
        })
      }, 60000) // Track every minute
    })
  } catch (error) {
    logger.error('Failed to start server:', error)
    process.exit(1)
  }
}

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully')
  server.close(() => {
    logger.info('Server closed')
    process.exit(0)
  })
})

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully')
  server.close(() => {
    logger.info('Server closed')
    process.exit(0)
  })
})

startServer()
