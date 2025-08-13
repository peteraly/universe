import { Server, Socket } from 'socket.io'
import { logger } from '../utils/logger'
import { Job, WebSocketMessage } from '../types'

// Store connected clients by job ID
const jobClients = new Map<string, Set<Socket>>()

// Store io instance
let ioInstance: Server

export function setupWebSocket(io: Server) {
  ioInstance = io
  
  io.on('connection', (socket: Socket) => {
    logger.info(`Client connected: ${socket.id}`)

    // Join job room
    socket.on('join-job', (jobId: string) => {
      socket.join(`job-${jobId}`)
      
      // Track client for this job
      if (!jobClients.has(jobId)) {
        jobClients.set(jobId, new Set())
      }
      jobClients.get(jobId)!.add(socket)
      
      logger.info(`Client ${socket.id} joined job ${jobId}`)
    })

    // Leave job room
    socket.on('leave-job', (jobId: string) => {
      socket.leave(`job-${jobId}`)
      
      // Remove client tracking
      const clients = jobClients.get(jobId)
      if (clients) {
        clients.delete(socket)
        if (clients.size === 0) {
          jobClients.delete(jobId)
        }
      }
      
      logger.info(`Client ${socket.id} left job ${jobId}`)
    })

    // Handle disconnection
    socket.on('disconnect', () => {
      logger.info(`Client disconnected: ${socket.id}`)
      
      // Clean up client tracking
      for (const [jobId, clients] of jobClients.entries()) {
        clients.delete(socket)
        if (clients.size === 0) {
          jobClients.delete(jobId)
        }
      }
    })

    // Handle errors
    socket.on('error', (error) => {
      logger.error(`Socket error for ${socket.id}:`, error)
    })
  })

  logger.info('WebSocket server setup completed')
}

// Emit job update to connected clients
export function emitJobUpdate(jobId: string, job: Job) {
  if (!ioInstance) {
    logger.warn('WebSocket not initialized, cannot emit job update')
    return
  }

  const message: WebSocketMessage = {
    type: 'job_update',
    jobId: jobId,
    data: {
      id: job.id,
      status: job.status,
      progress: job.progress,
      output: job.output,
      errors: job.errors,
      fallbacks: job.fallbacks
    },
    timestamp: new Date().toISOString()
  }

  ioInstance.to(`job-${jobId}`).emit('job-update', message)
  logger.debug(`Emitted job update for ${jobId}: ${job.status}`)
}

// Emit job completion
export function emitJobComplete(jobId: string, job: Job) {
  if (!ioInstance) {
    logger.warn('WebSocket not initialized, cannot emit job completion')
    return
  }

  const message: WebSocketMessage = {
    type: 'complete',
    jobId: jobId,
    data: job,
    timestamp: new Date().toISOString()
  }

  ioInstance.to(`job-${jobId}`).emit('job-complete', message)
  logger.info(`Emitted job completion for ${jobId}`)
}

// Emit job error
export function emitJobError(jobId: string, error: string) {
  if (!ioInstance) {
    logger.warn('WebSocket not initialized, cannot emit job error')
    return
  }

  const message: WebSocketMessage = {
    type: 'error',
    jobId: jobId,
    data: { error },
    timestamp: new Date().toISOString()
  }

  ioInstance.to(`job-${jobId}`).emit('job-error', message)
  logger.error(`Emitted job error for ${jobId}: ${error}`)
}

// Emit fallback information
export function emitFallback(jobId: string, step: string, fallback: string, reason: string) {
  if (!ioInstance) {
    logger.warn('WebSocket not initialized, cannot emit fallback')
    return
  }

  const message: WebSocketMessage = {
    type: 'error',
    jobId: jobId,
    data: {
      step,
      fallback,
      reason,
      timestamp: new Date().toISOString()
    },
    timestamp: new Date().toISOString()
  }

  ioInstance.to(`job-${jobId}`).emit('fallback', message)
  logger.warn(`Emitted fallback for ${jobId} at step ${step}: ${fallback}`)
}

// Get connected clients count for a job
export function getJobClientsCount(jobId: string): number {
  return jobClients.get(jobId)?.size || 0
}

// Broadcast to all connected clients
export function broadcastToAll(event: string, data: any) {
  if (!ioInstance) {
    logger.warn('WebSocket not initialized, cannot broadcast')
    return
  }

  ioInstance.emit(event, data)
  logger.debug(`Broadcasted ${event} to all clients`)
}

// Get total connected clients
export function getTotalClients(): number {
  return ioInstance ? ioInstance.engine.clientsCount : 0
}
