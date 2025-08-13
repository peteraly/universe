import { logger } from './logger'
import fs from 'fs'
import path from 'path'

export interface ErrorReport {
  id: string
  timestamp: string
  type: 'error' | 'warning' | 'info'
  severity: 'low' | 'medium' | 'high' | 'critical'
  message: string
  stack?: string
  context?: Record<string, any>
  userAgent?: string
  ip?: string
  url?: string
  method?: string
  userId?: string
  jobId?: string
  resolved: boolean
  resolvedAt?: string
  resolvedBy?: string
  notes?: string
}

class ErrorTracker {
  private errors: Map<string, ErrorReport> = new Map()
  private errorLogPath: string

  constructor() {
    this.errorLogPath = path.join(process.cwd(), 'logs', 'errors.json')
    this.loadErrors()
  }

  private loadErrors() {
    try {
      if (fs.existsSync(this.errorLogPath)) {
        const data = fs.readFileSync(this.errorLogPath, 'utf8')
        const errors = JSON.parse(data)
        this.errors = new Map(Object.entries(errors))
      }
    } catch (error) {
      logger.error('Failed to load error log:', error)
    }
  }

  private saveErrors() {
    try {
      const errors = Object.fromEntries(this.errors)
      fs.writeFileSync(this.errorLogPath, JSON.stringify(errors, null, 2))
    } catch (error) {
      logger.error('Failed to save error log:', error)
    }
  }

  trackError(
    error: Error | string,
    context: {
      severity?: 'low' | 'medium' | 'high' | 'critical'
      userAgent?: string
      ip?: string
      url?: string
      method?: string
      userId?: string
      jobId?: string
      [key: string]: any
    } = {}
  ): string {
    const errorId = this.generateErrorId()
    const timestamp = new Date().toISOString()
    
    const errorReportData: any = {
      id: errorId,
      timestamp,
      type: 'error',
      severity: context.severity || 'medium',
      message: typeof error === 'string' ? error : error.message,
      context: context,
      resolved: false
    }
    
    if (error instanceof Error && error.stack) {
      errorReportData.stack = error.stack
    }
    if (context.userAgent) {
      errorReportData.userAgent = context.userAgent
    }
    if (context.ip) {
      errorReportData.ip = context.ip
    }
    if (context.url) {
      errorReportData.url = context.url
    }
    if (context.method) {
      errorReportData.method = context.method
    }
    if (context.userId) {
      errorReportData.userId = context.userId
    }
    if (context.jobId) {
      errorReportData.jobId = context.jobId
    }
    
    const errorReport: ErrorReport = errorReportData

    this.errors.set(errorId, errorReport)
    this.saveErrors()

    // Log to console and file
    logger.error(`Error ${errorId}: ${errorReport.message}`, {
      errorId,
      severity: errorReport.severity,
      context: errorReport.context
    })

    // Alert for critical errors
    if (errorReport.severity === 'critical') {
      this.alertCriticalError(errorReport)
    }

    return errorId
  }

  trackWarning(
    message: string,
    context: Record<string, any> = {}
  ): string {
    const warningId = this.generateErrorId()
    const timestamp = new Date().toISOString()
    
    const warningReport: ErrorReport = {
      id: warningId,
      timestamp,
      type: 'warning',
      severity: 'low',
      message,
      context,
      resolved: false
    }

    this.errors.set(warningId, warningReport)
    this.saveErrors()

    logger.warn(`Warning ${warningId}: ${message}`, context)
    return warningId
  }

  resolveError(errorId: string, resolvedBy: string, notes?: string) {
    const error = this.errors.get(errorId)
    if (error) {
      error.resolved = true
      error.resolvedAt = new Date().toISOString()
      error.resolvedBy = resolvedBy
      if (notes) {
        error.notes = notes
      }
      this.saveErrors()
      
      logger.info(`Error ${errorId} resolved by ${resolvedBy}`)
    }
  }

  getErrors(filters: {
    resolved?: boolean
    severity?: string
    type?: string
    jobId?: string
  } = {}): ErrorReport[] {
    let errors = Array.from(this.errors.values())

    if (filters.resolved !== undefined) {
      errors = errors.filter(e => e.resolved === filters.resolved)
    }

    if (filters.severity) {
      errors = errors.filter(e => e.severity === filters.severity)
    }

    if (filters.type) {
      errors = errors.filter(e => e.type === filters.type)
    }

    if (filters.jobId) {
      errors = errors.filter(e => e.jobId === filters.jobId)
    }

    return errors.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
  }

  getErrorStats() {
    const errors = Array.from(this.errors.values())
    const total = errors.length
    const resolved = errors.filter(e => e.resolved).length
    const unresolved = total - resolved

    const bySeverity = {
      critical: errors.filter(e => e.severity === 'critical').length,
      high: errors.filter(e => e.severity === 'high').length,
      medium: errors.filter(e => e.severity === 'medium').length,
      low: errors.filter(e => e.severity === 'low').length
    }

    const byType = {
      error: errors.filter(e => e.type === 'error').length,
      warning: errors.filter(e => e.type === 'warning').length,
      info: errors.filter(e => e.type === 'info').length
    }

    return {
      total,
      resolved,
      unresolved,
      bySeverity,
      byType
    }
  }

  private generateErrorId(): string {
    return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private alertCriticalError(error: ErrorReport) {
    // In a production environment, this would send alerts via email, Slack, etc.
    logger.error('🚨 CRITICAL ERROR ALERT 🚨', {
      errorId: error.id,
      message: error.message,
      context: error.context
    })

    // Could integrate with services like:
    // - Sentry
    // - LogRocket
    // - DataDog
    // - PagerDuty
  }

  // Clean up old resolved errors (older than 30 days)
  cleanupOldErrors() {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    let cleaned = 0

    for (const [id, error] of this.errors.entries()) {
      if (error.resolved && new Date(error.resolvedAt!) < thirtyDaysAgo) {
        this.errors.delete(id)
        cleaned++
      }
    }

    if (cleaned > 0) {
      this.saveErrors()
      logger.info(`Cleaned up ${cleaned} old resolved errors`)
    }
  }

  /**
   * Auto-fix common CSS errors
   */
  async autoFixCSSErrors(): Promise<{ fixed: number; errors: string[] }> {
    try {
      // Placeholder for CSS auto-fix functionality
      logger.info('CSS auto-fix functionality will be implemented soon')
      return { fixed: 0, errors: [] }
    } catch (error) {
      logger.error('CSS auto-fix failed:', error)
      return { fixed: 0, errors: [error instanceof Error ? error.message : String(error)] }
    }
  }

  /**
   * Check for CSS errors without fixing them
   */
  async checkCSSErrors(): Promise<{ errors: string[]; warnings: string[] }> {
    try {
      // Placeholder for CSS error checking
      logger.info('CSS error checking functionality will be implemented soon')
      return { errors: [], warnings: [] }
    } catch (error) {
      logger.error('CSS check failed:', error)
      return { errors: [error instanceof Error ? error.message : String(error)], warnings: [] }
    }
  }

  /**
   * Auto-fix common errors based on error patterns
   */
  async autoFixErrors(): Promise<{ fixed: number; errors: string[] }> {
    const results = {
      fixed: 0,
      errors: [] as string[]
    }

    try {
      // Auto-fix CSS errors
      const cssResult = await this.autoFixCSSErrors()
      results.fixed += cssResult.fixed
      results.errors.push(...cssResult.errors)

      // Could add more auto-fix categories here:
      // - TypeScript errors
      // - Dependency issues
      // - Configuration problems
      // - etc.

      if (results.fixed > 0) {
        logger.info(`Auto-fix completed: ${results.fixed} fixes applied`)
      }
    } catch (error) {
      results.errors.push(`Auto-fix failed: ${error}`)
      logger.error('Auto-fix failed:', error)
    }

    return results
  }
}

export const errorTracker = new ErrorTracker()

// Clean up old errors every day
setInterval(() => {
  errorTracker.cleanupOldErrors()
}, 24 * 60 * 60 * 1000)

export default errorTracker
