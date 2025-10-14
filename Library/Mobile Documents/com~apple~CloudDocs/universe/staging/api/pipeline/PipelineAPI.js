// Pipeline API - V12.0 Data Pipeline Integration
/**
 * RESTful API endpoints for the automated data pipeline
 * Integrates with V12.0 Mission Control architecture
 */

const DataPipeline = require('../../lib/pipeline/DataPipeline')
const RBACMiddleware = require('../../lib/auth/middleware')

class PipelineAPI {
  constructor() {
    this.middleware = new RBACMiddleware()
    this.pipeline = new DataPipeline()
    this.isInitialized = false
  }

  /**
   * Initialize the pipeline API
   */
  async initialize() {
    if (this.isInitialized) {
      return
    }

    console.log('🔧 Initializing Pipeline API...')
    
    try {
      await this.pipeline.initialize()
      this.isInitialized = true
      console.log('✅ Pipeline API initialized')
    } catch (error) {
      console.error('❌ Pipeline API initialization failed:', error.message)
      throw error
    }
  }

  /**
   * Get all pipeline endpoints
   * @returns {Object} API routes configuration
   */
  getRoutes() {
    return {
      // Pipeline Management
      'GET /api/pipeline/status': this.getPipelineStatus.bind(this),
      'POST /api/pipeline/start': this.startPipeline.bind(this),
      'POST /api/pipeline/stop': this.stopPipeline.bind(this),
      'POST /api/pipeline/trigger': this.triggerManualRun.bind(this),
      
      // Configuration
      'GET /api/pipeline/config': this.getPipelineConfig.bind(this),
      'PUT /api/pipeline/config': this.updatePipelineConfig.bind(this),
      
      // Data Sources
      'GET /api/pipeline/sources': this.getDataSources.bind(this),
      'POST /api/pipeline/sources': this.addDataSource.bind(this),
      'PUT /api/pipeline/sources/:id': this.updateDataSource.bind(this),
      'DELETE /api/pipeline/sources/:id': this.removeDataSource.bind(this),
      
      // Execution History
      'GET /api/pipeline/history': this.getExecutionHistory.bind(this),
      'GET /api/pipeline/history/:id': this.getExecutionDetails.bind(this),
      
      // Quality Metrics
      'GET /api/pipeline/quality': this.getQualityMetrics.bind(this),
      'GET /api/pipeline/quality/report': this.getQualityReport.bind(this),
      
      // Self-Healing
      'GET /api/pipeline/healing': this.getSelfHealingStatus.bind(this),
      'GET /api/pipeline/recommendations': this.getRecommendations.bind(this),
      'POST /api/pipeline/recommendations/:id/approve': this.approveRecommendation.bind(this),
      
      // Statistics
      'GET /api/pipeline/stats': this.getPipelineStatistics.bind(this)
    }
  }

  /**
   * Get pipeline status
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async getPipelineStatus(req, res) {
    try {
      await this.initialize()
      
      const status = this.pipeline.getStatus()
      
      res.json({
        success: true,
        data: status,
        timestamp: new Date().toISOString()
      })
      
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      })
    }
  }

  /**
   * Start the pipeline
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async startPipeline(req, res) {
    try {
      await this.initialize()
      
      // Check permissions
      if (!this.middleware.hasPermission(req, 'pipeline.manage')) {
        return res.status(403).json({
          success: false,
          error: 'Insufficient permissions to start pipeline'
        })
      }
      
      await this.pipeline.start()
      
      res.json({
        success: true,
        message: 'Pipeline started successfully',
        data: this.pipeline.getStatus(),
        timestamp: new Date().toISOString()
      })
      
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      })
    }
  }

  /**
   * Stop the pipeline
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async stopPipeline(req, res) {
    try {
      await this.initialize()
      
      // Check permissions
      if (!this.middleware.hasPermission(req, 'pipeline.manage')) {
        return res.status(403).json({
          success: false,
          error: 'Insufficient permissions to stop pipeline'
        })
      }
      
      await this.pipeline.stop()
      
      res.json({
        success: true,
        message: 'Pipeline stopped successfully',
        data: this.pipeline.getStatus(),
        timestamp: new Date().toISOString()
      })
      
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      })
    }
  }

  /**
   * Trigger manual pipeline run
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async triggerManualRun(req, res) {
    try {
      await this.initialize()
      
      // Check permissions
      if (!this.middleware.hasPermission(req, 'pipeline.execute')) {
        return res.status(403).json({
          success: false,
          error: 'Insufficient permissions to trigger pipeline'
        })
      }
      
      await this.pipeline.triggerManualRun()
      
      res.json({
        success: true,
        message: 'Manual pipeline run triggered successfully',
        data: this.pipeline.getStatus(),
        timestamp: new Date().toISOString()
      })
      
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      })
    }
  }

  /**
   * Get pipeline configuration
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async getPipelineConfig(req, res) {
    try {
      await this.initialize()
      
      const config = {
        runInterval: this.pipeline.config.runInterval,
        maxConcurrentVenues: this.pipeline.config.maxConcurrentVenues,
        timeoutPerVenue: this.pipeline.config.timeoutPerVenue,
        retryAttempts: this.pipeline.config.retryAttempts,
        qaTargets: this.pipeline.config.qaTargets
      }
      
      res.json({
        success: true,
        data: config,
        timestamp: new Date().toISOString()
      })
      
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      })
    }
  }

  /**
   * Update pipeline configuration
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async updatePipelineConfig(req, res) {
    try {
      await this.initialize()
      
      // Check permissions
      if (!this.middleware.hasPermission(req, 'pipeline.configure')) {
        return res.status(403).json({
          success: false,
          error: 'Insufficient permissions to update pipeline configuration'
        })
      }
      
      const newConfig = req.body
      
      // Validate configuration
      this.validateConfig(newConfig)
      
      // Update configuration
      Object.assign(this.pipeline.config, newConfig)
      
      res.json({
        success: true,
        message: 'Pipeline configuration updated successfully',
        data: this.pipeline.config,
        timestamp: new Date().toISOString()
      })
      
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      })
    }
  }

  /**
   * Get data sources
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async getDataSources(req, res) {
    try {
      await this.initialize()
      
      const sources = this.pipeline.dataSources
      
      res.json({
        success: true,
        data: sources,
        count: sources.length,
        timestamp: new Date().toISOString()
      })
      
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      })
    }
  }

  /**
   * Add data source
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async addDataSource(req, res) {
    try {
      await this.initialize()
      
      // Check permissions
      if (!this.middleware.hasPermission(req, 'pipeline.configure')) {
        return res.status(403).json({
          success: false,
          error: 'Insufficient permissions to add data sources'
        })
      }
      
      const newSource = req.body
      
      // Validate data source
      this.validateDataSource(newSource)
      
      // Add data source
      this.pipeline.dataSources.push(newSource)
      
      res.json({
        success: true,
        message: 'Data source added successfully',
        data: newSource,
        timestamp: new Date().toISOString()
      })
      
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      })
    }
  }

  /**
   * Update data source
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async updateDataSource(req, res) {
    try {
      await this.initialize()
      
      // Check permissions
      if (!this.middleware.hasPermission(req, 'pipeline.configure')) {
        return res.status(403).json({
          success: false,
          error: 'Insufficient permissions to update data sources'
        })
      }
      
      const sourceId = req.params.id
      const updates = req.body
      
      // Find and update data source
      const sourceIndex = this.pipeline.dataSources.findIndex(s => s.id === sourceId)
      
      if (sourceIndex === -1) {
        return res.status(404).json({
          success: false,
          error: 'Data source not found'
        })
      }
      
      // Validate updates
      this.validateDataSource(updates)
      
      // Update data source
      Object.assign(this.pipeline.dataSources[sourceIndex], updates)
      
      res.json({
        success: true,
        message: 'Data source updated successfully',
        data: this.pipeline.dataSources[sourceIndex],
        timestamp: new Date().toISOString()
      })
      
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      })
    }
  }

  /**
   * Remove data source
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async removeDataSource(req, res) {
    try {
      await this.initialize()
      
      // Check permissions
      if (!this.middleware.hasPermission(req, 'pipeline.configure')) {
        return res.status(403).json({
          success: false,
          error: 'Insufficient permissions to remove data sources'
        })
      }
      
      const sourceId = req.params.id
      
      // Find and remove data source
      const sourceIndex = this.pipeline.dataSources.findIndex(s => s.id === sourceId)
      
      if (sourceIndex === -1) {
        return res.status(404).json({
          success: false,
          error: 'Data source not found'
        })
      }
      
      const removedSource = this.pipeline.dataSources.splice(sourceIndex, 1)[0]
      
      res.json({
        success: true,
        message: 'Data source removed successfully',
        data: removedSource,
        timestamp: new Date().toISOString()
      })
      
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      })
    }
  }

  /**
   * Get execution history
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async getExecutionHistory(req, res) {
    try {
      await this.initialize()
      
      const limit = parseInt(req.query.limit) || 50
      const history = this.pipeline.scheduler.getExecutionHistory(limit)
      
      res.json({
        success: true,
        data: history,
        count: history.length,
        timestamp: new Date().toISOString()
      })
      
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      })
    }
  }

  /**
   * Get execution details
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async getExecutionDetails(req, res) {
    try {
      await this.initialize()
      
      const executionId = req.params.id
      const history = this.pipeline.scheduler.getExecutionHistory()
      const execution = history.find(exec => exec.id === executionId)
      
      if (!execution) {
        return res.status(404).json({
          success: false,
          error: 'Execution not found'
        })
      }
      
      res.json({
        success: true,
        data: execution,
        timestamp: new Date().toISOString()
      })
      
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      })
    }
  }

  /**
   * Get quality metrics
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async getQualityMetrics(req, res) {
    try {
      await this.initialize()
      
      const metrics = this.pipeline.qualityAssurance.getStatistics()
      
      res.json({
        success: true,
        data: metrics,
        timestamp: new Date().toISOString()
      })
      
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      })
    }
  }

  /**
   * Get quality report
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async getQualityReport(req, res) {
    try {
      await this.initialize()
      
      // This would generate a comprehensive quality report
      const report = {
        summary: {
          totalEvents: 0,
          validEvents: 0,
          invalidEvents: 0,
          overallScore: 0
        },
        metrics: this.pipeline.qualityAssurance.getStatistics(),
        recommendations: [],
        timestamp: new Date().toISOString()
      }
      
      res.json({
        success: true,
        data: report,
        timestamp: new Date().toISOString()
      })
      
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      })
    }
  }

  /**
   * Get self-healing status
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async getSelfHealingStatus(req, res) {
    try {
      await this.initialize()
      
      const status = {
        autoFixHistory: this.pipeline.selfHealingEngine.getAutoFixHistory(),
        recommendationQueue: this.pipeline.selfHealingEngine.getRecommendationQueue(),
        statistics: this.pipeline.selfHealingEngine.getStatistics()
      }
      
      res.json({
        success: true,
        data: status,
        timestamp: new Date().toISOString()
      })
      
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      })
    }
  }

  /**
   * Get recommendations
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async getRecommendations(req, res) {
    try {
      await this.initialize()
      
      const recommendations = this.pipeline.selfHealingEngine.getRecommendationQueue()
      
      res.json({
        success: true,
        data: recommendations,
        count: recommendations.length,
        timestamp: new Date().toISOString()
      })
      
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      })
    }
  }

  /**
   * Approve recommendation
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async approveRecommendation(req, res) {
    try {
      await this.initialize()
      
      // Check permissions
      if (!this.middleware.hasPermission(req, 'pipeline.manage')) {
        return res.status(403).json({
          success: false,
          error: 'Insufficient permissions to approve recommendations'
        })
      }
      
      const recommendationId = req.params.id
      const recommendations = this.pipeline.selfHealingEngine.getRecommendationQueue()
      const recommendation = recommendations.find(rec => rec.id === recommendationId)
      
      if (!recommendation) {
        return res.status(404).json({
          success: false,
          error: 'Recommendation not found'
        })
      }
      
      // Mark recommendation as approved
      recommendation.status = 'approved'
      recommendation.approvedAt = new Date().toISOString()
      recommendation.approvedBy = req.user?.id || 'system'
      
      res.json({
        success: true,
        message: 'Recommendation approved successfully',
        data: recommendation,
        timestamp: new Date().toISOString()
      })
      
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      })
    }
  }

  /**
   * Get pipeline statistics
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async getPipelineStatistics(req, res) {
    try {
      await this.initialize()
      
      const stats = {
        pipeline: this.pipeline.pipelineMetrics,
        scheduler: this.pipeline.scheduler.getStatistics(),
        quality: this.pipeline.qualityAssurance.getStatistics(),
        selfHealing: this.pipeline.selfHealingEngine.getStatistics()
      }
      
      res.json({
        success: true,
        data: stats,
        timestamp: new Date().toISOString()
      })
      
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      })
    }
  }

  /**
   * Validate configuration
   * @param {Object} config - Configuration to validate
   */
  validateConfig(config) {
    if (config.runInterval && (config.runInterval < 3600000 || config.runInterval > 86400000)) {
      throw new Error('Run interval must be between 1 hour and 24 hours')
    }
    
    if (config.maxConcurrentVenues && (config.maxConcurrentVenues < 1 || config.maxConcurrentVenues > 20)) {
      throw new Error('Max concurrent venues must be between 1 and 20')
    }
    
    if (config.timeoutPerVenue && (config.timeoutPerVenue < 5000 || config.timeoutPerVenue > 120000)) {
      throw new Error('Timeout per venue must be between 5 seconds and 2 minutes')
    }
  }

  /**
   * Validate data source
   * @param {Object} source - Data source to validate
   */
  validateDataSource(source) {
    if (!source.id || !source.name || !source.url) {
      throw new Error('Data source must have id, name, and url')
    }
    
    if (!source.strategy || !['api_priority', 'rss_priority', 'static_priority'].includes(source.strategy)) {
      throw new Error('Data source must have a valid strategy')
    }
    
    try {
      new URL(source.url)
    } catch {
      throw new Error('Data source URL must be valid')
    }
  }
}

module.exports = PipelineAPI

