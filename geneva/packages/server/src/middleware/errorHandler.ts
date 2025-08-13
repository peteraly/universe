import { Request, Response, NextFunction } from 'express'
import { logger } from '../utils/logger'
import { errorTracker } from '../utils/errorTracker'

export interface AppError extends Error {
  statusCode?: number
  isOperational?: boolean
}

export const errorHandler = (
  error: AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const statusCode = error.statusCode || 500
  const message = error.message || 'Internal Server Error'

  // Track error with context
  const errorId = errorTracker.trackError(error, {
    severity: statusCode >= 500 ? 'high' : 'medium',
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    statusCode
  })

  // Log error
  logger.error({
    errorId,
    message: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  })

  // Don't leak error details in production
  const errorResponse = {
    success: false,
    error: statusCode === 500 ? 'Internal Server Error' : message,
    errorId: process.env.NODE_ENV === 'development' ? errorId : undefined,
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  }

  res.status(statusCode).json(errorResponse)
}

export const createError = (message: string, statusCode: number = 500): AppError => {
  const error = new Error(message) as AppError
  error.statusCode = statusCode
  error.isOperational = true
  return error
}

export const notFound = (req: Request, res: Response, next: NextFunction) => {
  const error = createError(`Route ${req.originalUrl} not found`, 404)
  next(error)
}
