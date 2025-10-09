// Scheduler - V12.0 Automated Pipeline Scheduling System
/**
 * Manages 12-hour automated pipeline execution
 * Handles scheduling, monitoring, and error recovery
 */

class Scheduler {
  constructor() {
    this.isRunning = false
    this.currentInterval = null
    this.nextExecution = null
    this.executionHistory = []
    this.maxHistorySize = 100
    
    this.scheduleConfig = {
      interval: 12 * 60 * 60 * 1000, // 12 hours in milliseconds
      maxRetries: 3,
      retryDelay: 5 * 60 * 1000, // 5 minutes
      timeout: 30 * 60 * 1000, // 30 minutes
      healthCheckInterval: 60 * 1000 // 1 minute
    }
    
    this.metrics = {
      totalExecutions: 0,
      successfulExecutions: 0,
      failedExecutions: 0,
      averageExecutionTime: 0,
      lastExecution: null,
      nextExecution: null,
      uptime: 0
    }
    
    this.startTime = null
  }

  /**
   * Start the scheduler
   * @param {number} interval - Execution interval in milliseconds
   * @param {Function} callback - Function to execute
   */
  start(interval, callback) {
    if (this.isRunning) {
      console.log('⚠️ Scheduler is already running')
      return
    }
    
    console.log('🚀 Starting pipeline scheduler...')
    
    this.isRunning = true
    this.startTime = Date.now()
    this.scheduleConfig.interval = interval || this.scheduleConfig.interval
    
    // Schedule the first execution
    this.scheduleNextExecution(callback)
    
    // Start health monitoring
    this.startHealthMonitoring()
    
    console.log(`✅ Scheduler started`)
    console.log(`⏰ Next execution: ${this.nextExecution}`)
    console.log(`🔄 Interval: ${this.scheduleConfig.interval / (60 * 60 * 1000)} hours`)
  }

  /**
   * Stop the scheduler
   */
  stop() {
    if (!this.isRunning) {
      console.log('⚠️ Scheduler is not running')
      return
    }
    
    console.log('🛑 Stopping pipeline scheduler...')
    
    this.isRunning = false
    
    if (this.currentInterval) {
      clearInterval(this.currentInterval)
      this.currentInterval = null
    }
    
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval)
      this.healthCheckInterval = null
    }
    
    this.updateMetrics()
    
    console.log('✅ Scheduler stopped')
  }

  /**
   * Schedule the next execution
   * @param {Function} callback - Function to execute
   */
  scheduleNextExecution(callback) {
    if (!this.isRunning) {
      return
    }
    
    const now = Date.now()
    this.nextExecution = new Date(now + this.scheduleConfig.interval)
    this.metrics.nextExecution = this.nextExecution
    
    console.log(`📅 Next execution scheduled for: ${this.nextExecution.toISOString()}`)
    
    // Set timeout for next execution
    this.currentInterval = setTimeout(async () => {
      await this.executeWithRetry(callback)
      this.scheduleNextExecution(callback) // Schedule next execution
    }, this.scheduleConfig.interval)
  }

  /**
   * Execute with retry logic
   * @param {Function} callback - Function to execute
   */
  async executeWithRetry(callback) {
    let attempts = 0
    let lastError = null
    
    while (attempts < this.scheduleConfig.maxRetries) {
      attempts++
      
      try {
        console.log(`🔄 Pipeline execution attempt ${attempts}/${this.scheduleConfig.maxRetries}`)
        
        const startTime = Date.now()
        await this.executeWithTimeout(callback)
        const executionTime = Date.now() - startTime
        
        // Record successful execution
        this.recordExecution({
          success: true,
          attempts: attempts,
          executionTime: executionTime,
          timestamp: new Date().toISOString()
        })
        
        this.metrics.successfulExecutions++
        this.metrics.lastExecution = new Date().toISOString()
        
        console.log(`✅ Pipeline execution completed successfully in ${executionTime}ms`)
        return
        
      } catch (error) {
        lastError = error
        console.error(`❌ Pipeline execution attempt ${attempts} failed:`, error.message)
        
        if (attempts < this.scheduleConfig.maxRetries) {
          console.log(`⏳ Retrying in ${this.scheduleConfig.retryDelay / 1000} seconds...`)
          await this.delay(this.scheduleConfig.retryDelay)
        }
      }
    }
    
    // All retries failed
    this.recordExecution({
      success: false,
      attempts: attempts,
      error: lastError.message,
      timestamp: new Date().toISOString()
    })
    
    this.metrics.failedExecutions++
    this.metrics.lastExecution = new Date().toISOString()
    
    console.error(`❌ Pipeline execution failed after ${attempts} attempts`)
  }

  /**
   * Execute with timeout
   * @param {Function} callback - Function to execute
   */
  async executeWithTimeout(callback) {
    return new Promise(async (resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error(`Pipeline execution timed out after ${this.scheduleConfig.timeout}ms`))
      }, this.scheduleConfig.timeout)
      
      try {
        await callback()
        clearTimeout(timeout)
        resolve()
      } catch (error) {
        clearTimeout(timeout)
        reject(error)
      }
    })
  }

  /**
   * Record execution in history
   * @param {Object} execution - Execution record
   */
  recordExecution(execution) {
    this.executionHistory.push(execution)
    this.metrics.totalExecutions++
    
    // Maintain history size limit
    if (this.executionHistory.length > this.maxHistorySize) {
      this.executionHistory.shift()
    }
    
    // Update average execution time
    this.updateAverageExecutionTime()
  }

  /**
   * Update average execution time
   */
  updateAverageExecutionTime() {
    const successfulExecutions = this.executionHistory.filter(exec => exec.success && exec.executionTime)
    
    if (successfulExecutions.length > 0) {
      const totalTime = successfulExecutions.reduce((sum, exec) => sum + exec.executionTime, 0)
      this.metrics.averageExecutionTime = totalTime / successfulExecutions.length
    }
  }

  /**
   * Start health monitoring
   */
  startHealthMonitoring() {
    this.healthCheckInterval = setInterval(() => {
      this.performHealthCheck()
    }, this.scheduleConfig.healthCheckInterval)
  }

  /**
   * Perform health check
   */
  performHealthCheck() {
    if (!this.isRunning) {
      return
    }
    
    // Check if scheduler is still running
    if (!this.currentInterval) {
      console.log('⚠️ Health check: Scheduler interval is null')
      return
    }
    
    // Check if next execution is still scheduled
    if (!this.nextExecution) {
      console.log('⚠️ Health check: Next execution is not scheduled')
      return
    }
    
    // Check if next execution is overdue
    const now = new Date()
    if (now > this.nextExecution) {
      console.log('⚠️ Health check: Next execution is overdue')
    }
    
    // Update uptime
    this.updateMetrics()
  }

  /**
   * Update scheduler metrics
   */
  updateMetrics() {
    if (this.startTime) {
      this.metrics.uptime = Date.now() - this.startTime
    }
  }

  /**
   * Get scheduler status
   * @returns {Object} Scheduler status
   */
  getStatus() {
    this.updateMetrics()
    
    return {
      isRunning: this.isRunning,
      nextExecution: this.nextExecution,
      lastExecution: this.metrics.lastExecution,
      uptime: this.metrics.uptime,
      metrics: this.metrics,
      recentExecutions: this.executionHistory.slice(-10) // Last 10 executions
    }
  }

  /**
   * Get execution history
   * @param {number} limit - Number of recent executions to return
   * @returns {Array} Execution history
   */
  getExecutionHistory(limit = 50) {
    return this.executionHistory.slice(-limit)
  }

  /**
   * Get scheduler statistics
   * @returns {Object} Scheduler statistics
   */
  getStatistics() {
    this.updateMetrics()
    
    const recentExecutions = this.executionHistory.slice(-30) // Last 30 executions
    const successRate = recentExecutions.length > 0 
      ? recentExecutions.filter(exec => exec.success).length / recentExecutions.length 
      : 0
    
    return {
      ...this.metrics,
      successRate: successRate,
      totalHistorySize: this.executionHistory.length,
      isHealthy: this.isRunning && this.nextExecution && this.nextExecution > new Date(),
      lastHealthCheck: new Date().toISOString()
    }
  }

  /**
   * Manually trigger execution
   * @param {Function} callback - Function to execute
   */
  async triggerManualExecution(callback) {
    console.log('🔧 Manual execution triggered')
    
    try {
      const startTime = Date.now()
      await this.executeWithTimeout(callback)
      const executionTime = Date.now() - startTime
      
      this.recordExecution({
        success: true,
        attempts: 1,
        executionTime: executionTime,
        timestamp: new Date().toISOString(),
        manual: true
      })
      
      console.log(`✅ Manual execution completed successfully in ${executionTime}ms`)
      
    } catch (error) {
      this.recordExecution({
        success: false,
        attempts: 1,
        error: error.message,
        timestamp: new Date().toISOString(),
        manual: true
      })
      
      console.error(`❌ Manual execution failed:`, error.message)
      throw error
    }
  }

  /**
   * Update schedule configuration
   * @param {Object} config - New configuration
   */
  updateConfig(config) {
    console.log('🔧 Updating scheduler configuration...')
    
    this.scheduleConfig = {
      ...this.scheduleConfig,
      ...config
    }
    
    console.log('✅ Scheduler configuration updated')
  }

  /**
   * Delay utility
   * @param {number} ms - Milliseconds to delay
   * @returns {Promise} Promise that resolves after delay
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  /**
   * Get next execution time
   * @returns {Date|null} Next execution time
   */
  getNextExecution() {
    return this.nextExecution
  }

  /**
   * Check if execution is overdue
   * @returns {boolean} Is overdue
   */
  isOverdue() {
    if (!this.nextExecution) {
      return false
    }
    
    return new Date() > this.nextExecution
  }

  /**
   * Get time until next execution
   * @returns {number} Milliseconds until next execution
   */
  getTimeUntilNextExecution() {
    if (!this.nextExecution) {
      return null
    }
    
    return this.nextExecution.getTime() - Date.now()
  }
}

module.exports = Scheduler
