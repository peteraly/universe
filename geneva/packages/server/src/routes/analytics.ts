import { Router } from 'express'
import { analyticsService } from '../services/analytics'
import { createError } from '../middleware/errorHandler'
import { logger } from '../utils/logger'
import { ApiResponse } from '../types'

const router: Router = Router()

// Get analytics dashboard data
router.get('/dashboard', async (req, res, next) => {
  try {
    const dashboardData = analyticsService.getAnalyticsDashboard()
    
    res.json({
      success: true,
      data: dashboardData,
      message: 'Analytics dashboard data retrieved successfully'
    } as ApiResponse<any>)
  } catch (error) {
    next(error)
  }
})

// Get performance trends
router.get('/performance/trends', async (req, res, next) => {
  try {
    const { days = 7 } = req.query
    const trends = analyticsService.getAnalyticsDashboard().performance.trends
    
    res.json({
      success: true,
      data: trends,
      message: `Performance trends for last ${days} days`
    } as ApiResponse<any>)
  } catch (error) {
    next(error)
  }
})

// Get top errors
router.get('/errors/top', async (req, res, next) => {
  try {
    const topErrors = analyticsService.getAnalyticsDashboard().quality.topErrors
    
    res.json({
      success: true,
      data: topErrors,
      message: 'Top errors retrieved successfully'
    } as ApiResponse<any>)
  } catch (error) {
    next(error)
  }
})

// Get top courses
router.get('/courses/top', async (req, res, next) => {
  try {
    const topCourses = analyticsService.getAnalyticsDashboard().quality.topCourses
    
    res.json({
      success: true,
      data: topCourses,
      message: 'Top courses retrieved successfully'
    } as ApiResponse<any>)
  } catch (error) {
    next(error)
  }
})

// Get system health
router.get('/system/health', async (req, res, next) => {
  try {
    const systemData = analyticsService.getAnalyticsDashboard().system
    
    res.json({
      success: true,
      data: systemData,
      message: 'System health data retrieved successfully'
    } as ApiResponse<any>)
  } catch (error) {
    next(error)
  }
})

// Track user feedback
router.post('/feedback', async (req, res, next) => {
  try {
    const { jobId, rating, comments, sessionId } = req.body
    
    if (!jobId || !rating || rating < 1 || rating > 5) {
      throw createError('Invalid feedback data', 400)
    }

    // Track feedback in analytics
    analyticsService.trackQualityMetrics(jobId, {
      userFeedback: {
        rating,
        comments: comments || '',
        timestamp: new Date().toISOString()
      }
    })

    logger.info(`User feedback received for job ${jobId}`, { jobId, rating, comments })
    
    res.json({
      success: true,
      message: 'Feedback recorded successfully'
    } as ApiResponse<null>)
  } catch (error) {
    next(error)
  }
})

// Track job performance
router.post('/performance', async (req, res, next) => {
  try {
    const { jobId, step, duration, success, error } = req.body
    
    if (!jobId || !step || typeof duration !== 'number') {
      throw createError('Invalid performance data', 400)
    }

    analyticsService.trackPerformance(jobId, step, duration, success, error)
    
    res.json({
      success: true,
      message: 'Performance data recorded successfully'
    } as ApiResponse<null>)
  } catch (error) {
    next(error)
  }
})

// Track error
router.post('/errors', async (req, res, next) => {
  try {
    const { jobId, step, message, level, context } = req.body
    
    if (!jobId || !step || !message) {
      throw createError('Invalid error data', 400)
    }

    analyticsService.trackError(jobId, step, message, level, context)
    
    res.json({
      success: true,
      message: 'Error logged successfully'
    } as ApiResponse<null>)
  } catch (error) {
    next(error)
  }
})

export default router
