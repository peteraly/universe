import { Job, JobAnalytics, QualityMetrics, SystemMetrics, ErrorLog, PerformanceLog, UserSession } from '../types'
import { logger } from '../utils/logger'
import { v4 as uuidv4 } from 'uuid'

class AnalyticsService {
  private performanceLogs: PerformanceLog[] = []
  private errorLogs: ErrorLog[] = []
  private userSessions: Map<string, UserSession> = new Map()
  private systemMetrics: SystemMetrics[] = []

  // Track job analytics
  trackJobAnalytics(jobId: string, analytics: Partial<JobAnalytics>): void {
    try {
      const jobAnalytics: JobAnalytics = {
        jobId,
        courseName: analytics.courseName || '',
        createdAt: analytics.createdAt || new Date().toISOString(),
        status: analytics.status || 'pending',
        ...(analytics.coordinates && { coordinates: analytics.coordinates }),
        ...(analytics.completedAt && { completedAt: analytics.completedAt }),
        ...(analytics.duration && { duration: analytics.duration }),
        ...(analytics.output && { output: analytics.output })
      }

      logger.info(`Job analytics tracked for ${jobId}`, { jobId, analytics: jobAnalytics })
    } catch (error) {
      logger.error('Error tracking job analytics', { jobId, error })
    }
  }

  // Track quality metrics
  trackQualityMetrics(jobId: string, metrics: Partial<QualityMetrics>): void {
    try {
      const qualityMetrics: QualityMetrics = {
        videoQuality: metrics.videoQuality || {
          resolution: '1920x1080',
          bitrate: 0,
          frameRate: 30,
          compressionRatio: 1,
          fileSize: 0
        },
        contentQuality: metrics.contentQuality || {
          courseAccuracy: 0,
          visualAppeal: 0,
          audioQuality: 0,
          captionAccuracy: 0,
          overallScore: 0
        },
        technicalQuality: metrics.technicalQuality || {
          renderTime: 0,
          memoryUsage: 0,
          cpuUsage: 0,
          errorRate: 0
        },
        ...(metrics.userFeedback && { userFeedback: metrics.userFeedback })
      }

      logger.info(`Quality metrics tracked for ${jobId}`, { jobId, metrics: qualityMetrics })
    } catch (error) {
      logger.error('Error tracking quality metrics', { jobId, error })
    }
  }

  // Track performance logs
  trackPerformance(jobId: string, step: string, duration: number, success: boolean, error?: string): void {
    try {
      const performanceLog: PerformanceLog = {
        id: uuidv4(),
        jobId,
        timestamp: new Date().toISOString(),
        step,
        duration,
        memoryUsage: this.getMemoryUsage(),
        cpuUsage: this.getCpuUsage(),
        success,
        ...(error && { error })
      }

      this.performanceLogs.push(performanceLog)
      logger.info(`Performance tracked for ${jobId} - ${step}`, { 
        jobId, 
        step, 
        duration, 
        success,
        memoryUsage: performanceLog.memoryUsage,
        cpuUsage: performanceLog.cpuUsage
      })
    } catch (error) {
      logger.error('Error tracking performance', { jobId, step, error })
    }
  }

  // Track errors
  trackError(jobId: string, step: string, message: string, level: 'error' | 'warning' | 'info' = 'error', context?: any): void {
    try {
      const errorLog: ErrorLog = {
        id: uuidv4(),
        jobId,
        step,
        message,
        level,
        context: context || {},
        timestamp: new Date().toISOString()
      }

      this.errorLogs.push(errorLog)
      logger.error(`Error tracked for ${jobId} - ${step}`, { 
        jobId, 
        step, 
        message, 
        level,
        context: errorLog.context
      })
    } catch (error) {
      logger.error('Error tracking error log', { jobId, step, error })
    }
  }

  // Track user session
  trackUserSession(sessionId: string, userData: Partial<UserSession>): void {
    try {
      const session: UserSession = {
        id: sessionId,
        ipAddress: userData.ipAddress || '',
        userAgent: userData.userAgent || '',
        startTime: userData.startTime || new Date().toISOString(),
        jobsCreated: userData.jobsCreated || 0,
        jobsCompleted: userData.jobsCompleted || 0,
        jobsFailed: userData.jobsFailed || 0,
        totalRenderTime: userData.totalRenderTime || 0,
        averageJobDuration: userData.averageJobDuration || 0,
        preferredCourses: userData.preferredCourses || [],
        commonErrors: userData.commonErrors || [],
        feedback: userData.feedback || [],
        ...(userData.userId && { userId: userData.userId })
      }

      this.userSessions.set(sessionId, session)
      logger.info(`User session tracked`, { sessionId, session })
    } catch (error) {
      logger.error('Error tracking user session', { sessionId, error })
    }
  }

  // Track system metrics
  trackSystemMetrics(metrics: Partial<SystemMetrics>): void {
    try {
      const systemMetrics: SystemMetrics = {
        timestamp: new Date().toISOString(),
        cpu: metrics.cpu || this.getCpuUsage(),
        memory: metrics.memory || this.getMemoryUsage(),
        disk: metrics.disk || this.getDiskUsage(),
        network: metrics.network || 0,
        activeJobs: metrics.activeJobs || 0,
        queueLength: metrics.queueLength || 0
      }

      this.systemMetrics.push(systemMetrics)
      logger.info(`System metrics tracked`, { metrics: systemMetrics })
    } catch (error) {
      logger.error('Error tracking system metrics', { error })
    }
  }

  // Get analytics dashboard data
  getAnalyticsDashboard(): any {
    try {
      const now = new Date()
      const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000)
      
      const recentJobs = this.performanceLogs.filter(log => 
        new Date(log.timestamp) > last24Hours
      )

      const recentErrors = this.errorLogs.filter(log => 
        new Date(log.timestamp) > last24Hours
      )

      const successRate = recentJobs.length > 0 
        ? (recentJobs.filter(log => log.success).length / recentJobs.length) * 100 
        : 0

      const averageRenderTime = recentJobs.length > 0
        ? recentJobs.reduce((sum, log) => sum + log.duration, 0) / recentJobs.length
        : 0

      const topErrors = this.getTopErrors()
      const topCourses = this.getTopCourses()
      const performanceTrends = this.getPerformanceTrends()

      return {
        overview: {
          totalJobs: this.performanceLogs.length,
          successRate: successRate.toFixed(2),
          averageRenderTime: averageRenderTime.toFixed(2),
          activeSessions: this.userSessions.size,
          errorRate: recentErrors.length
        },
        performance: {
          recentJobs: recentJobs.length,
          averageMemoryUsage: this.getAverageMemoryUsage(),
          averageCpuUsage: this.getAverageCpuUsage(),
          trends: performanceTrends
        },
        quality: {
          topErrors,
          topCourses,
          userSatisfaction: this.getUserSatisfaction()
        },
        system: {
          resourceUtilization: this.getCurrentResourceUtilization(),
          apiPerformance: this.getApiPerformance()
        }
      }
    } catch (error) {
      logger.error('Error getting analytics dashboard', { error })
      return {}
    }
  }

  // Helper methods
  private getMemoryUsage(): number {
    const memUsage = process.memoryUsage()
    return Math.round((memUsage.heapUsed / 1024 / 1024) * 100) / 100 // MB
  }

  private getCpuUsage(): number {
    // Simplified CPU usage - in production, use a proper CPU monitoring library
    return Math.random() * 100 // Placeholder
  }

  private getDiskUsage(): number {
    // Simplified disk usage - in production, use fs.stat
    return Math.random() * 100 // Placeholder
  }

  private getAverageMemoryUsage(): number {
    if (this.performanceLogs.length === 0) return 0
    const total = this.performanceLogs.reduce((sum, log) => sum + log.memoryUsage, 0)
    return Math.round((total / this.performanceLogs.length) * 100) / 100
  }

  private getAverageCpuUsage(): number {
    if (this.performanceLogs.length === 0) return 0
    const total = this.performanceLogs.reduce((sum, log) => sum + log.cpuUsage, 0)
    return Math.round((total / this.performanceLogs.length) * 100) / 100
  }

  private getTopErrors(): any[] {
    const errorCounts = new Map<string, number>()
    this.errorLogs.forEach(log => {
      const key = `${log.step}: ${log.message}`
      errorCounts.set(key, (errorCounts.get(key) || 0) + 1)
    })
    
    return Array.from(errorCounts.entries())
      .map(([error, count]) => ({ error, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)
  }

  private getTopCourses(): any[] {
    const courseCounts = new Map<string, number>()
    this.performanceLogs.forEach(log => {
      // Extract course name from job context (simplified)
      courseCounts.set('Unknown Course', (courseCounts.get('Unknown Course') || 0) + 1)
    })
    
    return Array.from(courseCounts.entries())
      .map(([course, count]) => ({ course, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)
  }

  private getPerformanceTrends(): any[] {
    const now = new Date()
    const trends = []
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
      const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate())
      const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000)
      
      const dayJobs = this.performanceLogs.filter(log => {
        const logDate = new Date(log.timestamp)
        return logDate >= dayStart && logDate < dayEnd
      })
      
      trends.push({
        date: dayStart.toISOString().split('T')[0],
        jobs: dayJobs.length,
        averageDuration: dayJobs.length > 0 
          ? dayJobs.reduce((sum, log) => sum + log.duration, 0) / dayJobs.length 
          : 0
      })
    }
    
    return trends
  }

  private getUserSatisfaction(): number {
    const allFeedback = Array.from(this.userSessions.values())
      .flatMap(session => session.feedback)
    
    if (allFeedback.length === 0) return 0
    
    const totalRating = allFeedback.reduce((sum, feedback) => sum + feedback.rating, 0)
    return Math.round((totalRating / allFeedback.length) * 100) / 100
  }

  private getCurrentResourceUtilization(): any {
    return {
      cpu: this.getCpuUsage(),
      memory: this.getMemoryUsage(),
      disk: this.getDiskUsage(),
      network: 0
    }
  }

  private getApiPerformance(): any {
    return {
      geocoding: Math.random() * 1000, // ms
      elevation: Math.random() * 500,
      satellite: Math.random() * 2000,
      weather: Math.random() * 300
    }
  }
}

export const analyticsService = new AnalyticsService()
