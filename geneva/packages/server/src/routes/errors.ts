import { Router } from 'express'
import { errorTracker } from '../utils/errorTracker'
import { createError } from '../middleware/errorHandler'
import { logger } from '../utils/logger'

const router = Router()

// Get all errors with filters
router.get('/', (req, res, next) => {
  try {
    const filters: any = {
      severity: req.query.severity as string,
      type: req.query.type as string,
      jobId: req.query.jobId as string
    }
    
    if (req.query.resolved !== undefined) {
      filters.resolved = req.query.resolved === 'true'
    }

    const errors = errorTracker.getErrors(filters)

    res.json({
      success: true,
      data: errors,
      message: 'Errors retrieved successfully'
    })
  } catch (error) {
    next(error)
  }
})

// Get error statistics
router.get('/stats', (req, res, next) => {
  try {
    const stats = errorTracker.getErrorStats()

    res.json({
      success: true,
      data: stats,
      message: 'Error statistics retrieved successfully'
    })
  } catch (error) {
    next(error)
  }
})

// Get a specific error
router.get('/:errorId', (req, res, next) => {
  try {
    const { errorId } = req.params
    const errors = errorTracker.getErrors()
    const error = errors.find(e => e.id === errorId)

    if (!error) {
      throw createError('Error not found', 404)
    }

    res.json({
      success: true,
      data: error,
      message: 'Error retrieved successfully'
    })
  } catch (error) {
    next(error)
  }
})

// Resolve an error
router.post('/:errorId/resolve', (req, res, next) => {
  try {
    const { errorId } = req.params
    const { notes } = req.body
    const resolvedBy = req.headers['x-user-id'] as string || 'system'

    errorTracker.resolveError(errorId, resolvedBy, notes)

    logger.info(`Error ${errorId} resolved by ${resolvedBy}`)

    res.json({
      success: true,
      message: 'Error resolved successfully'
    })
  } catch (error) {
    next(error)
  }
})

// Manually track an error
router.post('/track', (req, res, next) => {
  try {
    const { message, severity, context, jobId } = req.body

    if (!message) {
      throw createError('Error message is required', 400)
    }

    const errorId = errorTracker.trackError(message, {
      severity: severity || 'medium',
      jobId,
      ...context
    })

    res.status(201).json({
      success: true,
      data: { errorId },
      message: 'Error tracked successfully'
    })
  } catch (error) {
    next(error)
  }
})

// Track a warning
router.post('/track-warning', (req, res, next) => {
  try {
    const { message, context } = req.body

    if (!message) {
      throw createError('Warning message is required', 400)
    }

    const warningId = errorTracker.trackWarning(message, context)

    res.status(201).json({
      success: true,
      data: { warningId },
      message: 'Warning tracked successfully'
    })
  } catch (error) {
    next(error)
  }
})

// Bulk resolve errors
router.post('/bulk-resolve', (req, res, next) => {
  try {
    const { errorIds, notes } = req.body
    const resolvedBy = req.headers['x-user-id'] as string || 'system'

    if (!Array.isArray(errorIds) || errorIds.length === 0) {
      throw createError('Error IDs array is required', 400)
    }

    let resolvedCount = 0
    for (const errorId of errorIds) {
      try {
        errorTracker.resolveError(errorId, resolvedBy, notes)
        resolvedCount++
      } catch (error) {
        logger.warn(`Failed to resolve error ${errorId}:`, error)
      }
    }

    res.json({
      success: true,
      data: { resolvedCount, totalRequested: errorIds.length },
      message: `${resolvedCount} errors resolved successfully`
    })
  } catch (error) {
    next(error)
  }
})

// Export errors to JSON
router.get('/export/json', (req, res, next) => {
  try {
    const filters: any = {
      severity: req.query.severity as string,
      type: req.query.type as string
    }
    
    if (req.query.resolved !== undefined) {
      filters.resolved = req.query.resolved === 'true'
    }

    const errors = errorTracker.getErrors(filters)
    const stats = errorTracker.getErrorStats()

    const exportData = {
      exportedAt: new Date().toISOString(),
      stats,
      errors
    }

    res.setHeader('Content-Type', 'application/json')
    res.setHeader('Content-Disposition', `attachment; filename="errors-${new Date().toISOString().split('T')[0]}.json"`)
    
    res.json(exportData)
  } catch (error) {
    next(error)
  }
})

// Auto-fix CSS errors
router.post('/auto-fix/css', async (req, res, next) => {
  try {
    const result = await errorTracker.autoFixCSSErrors()
    
    res.json({
      success: true,
      data: result,
      message: `Auto-fixed ${result.fixed} CSS errors`
    })
  } catch (error) {
    next(error)
  }
})

// Check for CSS errors without fixing
router.get('/check/css', async (req, res, next) => {
  try {
    const result = await errorTracker.checkCSSErrors()
    
    res.json({
      success: true,
      data: result,
      message: `Found ${result.errors.length} errors and ${result.warnings.length} warnings`
    })
  } catch (error) {
    next(error)
  }
})

// Auto-fix all common errors
router.post('/auto-fix', async (req, res, next) => {
  try {
    const result = await errorTracker.autoFixErrors()
    
    res.json({
      success: true,
      data: result,
      message: `Auto-fixed ${result.fixed} errors`
    })
  } catch (error) {
    next(error)
  }
})

// Get available CSS fixes
router.get('/css-fixes', (req, res, next) => {
  try {
    // Placeholder for CSS fixes
    const fixes = [
      {
        pattern: 'ring-offset-background',
        replacement: '',
        description: 'Remove invalid ring-offset-background class (not available in Tailwind)',
        severity: 'medium'
      }
    ]
    
    res.json({
      success: true,
      data: fixes,
      message: 'Available CSS fixes retrieved successfully'
    })
  } catch (error) {
    next(error)
  }
})

export default router
