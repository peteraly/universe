import rateLimit from 'express-rate-limit'
import { logger } from '../utils/logger'

// General API rate limiter
export const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    success: false,
    error: 'Too many requests from this IP, please try again later.',
    message: 'Rate limit exceeded'
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  handler: (req, res) => {
    logger.warn(`Rate limit exceeded for IP: ${req.ip}`)
    res.status(429).json({
      success: false,
      error: 'Too many requests from this IP, please try again later.',
      message: 'Rate limit exceeded'
    })
  }
})

// Stricter rate limiter for job creation
export const jobCreationLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5, // Limit each IP to 5 job creations per minute
  message: {
    success: false,
    error: 'Too many job creation requests, please try again later.',
    message: 'Job creation rate limit exceeded'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn(`Job creation rate limit exceeded for IP: ${req.ip}`)
    res.status(429).json({
      success: false,
      error: 'Too many job creation requests, please try again later.',
      message: 'Job creation rate limit exceeded'
    })
  }
})

// WebSocket rate limiter (if needed)
export const wsRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 1000, // Limit each IP to 1000 WebSocket connections per minute
  message: {
    success: false,
    error: 'Too many WebSocket connections, please try again later.',
    message: 'WebSocket rate limit exceeded'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn(`WebSocket rate limit exceeded for IP: ${req.ip}`)
    res.status(429).json({
      success: false,
      error: 'Too many WebSocket connections, please try again later.',
      message: 'WebSocket rate limit exceeded'
    })
  }
})
