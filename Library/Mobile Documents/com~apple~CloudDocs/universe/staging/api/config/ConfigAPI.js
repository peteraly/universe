// Config API - V12.0 L3 Configuration Management with Governance Ledger
const RBACMiddleware = require('../../lib/auth/middleware')

class ConfigAPI {
  constructor() {
    this.middleware = new RBACMiddleware()
    this.configs = {
      // System Configuration
      'system.environment': 'development',
      'system.debug': true,
      'system.logLevel': 'info',
      'system.timezone': 'UTC',
      
      // API Configuration
      'api.rateLimit': 1000,
      'api.timeout': 30000,
      'api.cors.enabled': true,
      'api.cors.origins': ['http://localhost:3000'],
      
      // Database Configuration
      'database.host': 'localhost',
      'database.port': 5432,
      'database.name': 'discovery_dial',
      'database.ssl': false,
      
      // Security Configuration
      'security.sessionTimeout': 86400,
      'security.passwordMinLength': 8,
      'security.require2FA': false,
      'security.auditLog': true,
      
      // Feature Flags
      'features.aiCuration': true,
      'features.realTimeUpdates': true,
      'features.advancedAnalytics': false,
      'features.betaFeatures': false,
      
      // Performance Configuration
      'performance.cacheTTL': 3600,
      'performance.maxConcurrentRequests': 100,
      'performance.enableCompression': true,
      'performance.enableGzip': true
    }
    
    this.defaultConfigs = { ...this.configs }
    this.governanceLedger = []
  }

  /**
   * Get all configurations
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async getConfigs(req, res) {
    try {
      res.json({
        success: true,
        configs: this.configs,
        timestamp: new Date().toISOString()
      })
    } catch (error) {
      console.error('Error getting configs:', error)
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      })
    }
  }

  /**
   * Get specific configuration
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async getConfig(req, res) {
    try {
      const { key } = req.params
      
      if (!this.configs.hasOwnProperty(key)) {
        return res.status(404).json({
          success: false,
          error: 'Configuration key not found'
        })
      }

      res.json({
        success: true,
        key,
        value: this.configs[key],
        type: typeof this.configs[key],
        timestamp: new Date().toISOString()
      })
    } catch (error) {
      console.error('Error getting config:', error)
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      })
    }
  }

  /**
   * Update configuration with governance logging
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async updateConfig(req, res) {
    try {
      const { key, value, type } = req.body
      const userId = req.userId || 'system'
      
      if (!key) {
        return res.status(400).json({
          success: false,
          error: 'Configuration key is required'
        })
      }

      // Validate key exists
      if (!this.configs.hasOwnProperty(key)) {
        return res.status(404).json({
          success: false,
          error: 'Configuration key not found'
        })
      }

      // Get old value for logging
      const oldValue = this.configs[key]
      
      // Convert value based on type
      let newValue = value
      if (type === 'boolean') {
        newValue = value === 'true' || value === true
      } else if (type === 'number') {
        newValue = parseFloat(value)
        if (isNaN(newValue)) {
          return res.status(400).json({
            success: false,
            error: 'Invalid number value'
          })
        }
      } else if (type === 'object') {
        try {
          newValue = JSON.parse(value)
        } catch (e) {
          return res.status(400).json({
            success: false,
            error: 'Invalid JSON value'
          })
        }
      }

      // Update configuration
      this.configs[key] = newValue
      
      // Log to governance ledger
      this.logToGovernanceLedger({
        action: 'config_update',
        key,
        oldValue,
        newValue,
        userId,
        timestamp: new Date().toISOString(),
        ip: req.ip || 'unknown',
        userAgent: req.headers['user-agent'] || 'unknown'
      })

      res.json({
        success: true,
        message: `Configuration ${key} updated successfully`,
        key,
        oldValue,
        newValue,
        timestamp: new Date().toISOString()
      })
    } catch (error) {
      console.error('Error updating config:', error)
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      })
    }
  }

  /**
   * Reset configuration to default
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async resetConfig(req, res) {
    try {
      const { key } = req.body
      const userId = req.userId || 'system'
      
      if (!key) {
        return res.status(400).json({
          success: false,
          error: 'Configuration key is required'
        })
      }

      // Validate key exists
      if (!this.configs.hasOwnProperty(key)) {
        return res.status(404).json({
          success: false,
          error: 'Configuration key not found'
        })
      }

      // Get old value for logging
      const oldValue = this.configs[key]
      const defaultValue = this.defaultConfigs[key]
      
      // Reset to default
      this.configs[key] = defaultValue
      
      // Log to governance ledger
      this.logToGovernanceLedger({
        action: 'config_reset',
        key,
        oldValue,
        newValue: defaultValue,
        userId,
        timestamp: new Date().toISOString(),
        ip: req.ip || 'unknown',
        userAgent: req.headers['user-agent'] || 'unknown'
      })

      res.json({
        success: true,
        message: `Configuration ${key} reset to default`,
        key,
        oldValue,
        newValue: defaultValue,
        timestamp: new Date().toISOString()
      })
    } catch (error) {
      console.error('Error resetting config:', error)
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      })
    }
  }

  /**
   * Get governance ledger entries
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async getGovernanceLedger(req, res) {
    try {
      const { limit = 50, offset = 0 } = req.query
      
      const entries = this.governanceLedger
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(parseInt(offset), parseInt(offset) + parseInt(limit))
      
      res.json({
        success: true,
        entries,
        total: this.governanceLedger.length,
        limit: parseInt(limit),
        offset: parseInt(offset),
        timestamp: new Date().toISOString()
      })
    } catch (error) {
      console.error('Error getting governance ledger:', error)
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      })
    }
  }

  /**
   * Log entry to governance ledger
   * @param {Object} entry - Ledger entry
   */
  logToGovernanceLedger(entry) {
    this.governanceLedger.push({
      id: `ledger_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...entry
    })
    
    // Keep only last 1000 entries to prevent memory issues
    if (this.governanceLedger.length > 1000) {
      this.governanceLedger = this.governanceLedger.slice(-1000)
    }
    
    console.log(`Governance Ledger: ${entry.action} - ${entry.key} by ${entry.userId}`)
  }

  /**
   * Get configuration schema
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async getConfigSchema(req, res) {
    try {
      const schema = {
        'system.environment': {
          type: 'string',
          description: 'System environment (development, staging, production)',
          allowedValues: ['development', 'staging', 'production'],
          required: true
        },
        'system.debug': {
          type: 'boolean',
          description: 'Enable debug mode',
          required: true
        },
        'system.logLevel': {
          type: 'string',
          description: 'Logging level',
          allowedValues: ['error', 'warn', 'info', 'debug'],
          required: true
        },
        'api.rateLimit': {
          type: 'number',
          description: 'API rate limit (requests per minute)',
          min: 1,
          max: 10000,
          required: true
        },
        'security.sessionTimeout': {
          type: 'number',
          description: 'Session timeout in seconds',
          min: 300,
          max: 86400,
          required: true
        },
        'features.aiCuration': {
          type: 'boolean',
          description: 'Enable AI-powered curation',
          required: false
        }
      }

      res.json({
        success: true,
        schema,
        timestamp: new Date().toISOString()
      })
    } catch (error) {
      console.error('Error getting config schema:', error)
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      })
    }
  }

  /**
   * Validate configuration value
   * @param {string} key - Configuration key
   * @param {*} value - Configuration value
   * @returns {Object} - Validation result
   */
  validateConfigValue(key, value) {
    const schema = {
      'system.environment': {
        type: 'string',
        allowedValues: ['development', 'staging', 'production']
      },
      'system.debug': {
        type: 'boolean'
      },
      'api.rateLimit': {
        type: 'number',
        min: 1,
        max: 10000
      }
    }

    const rule = schema[key]
    if (!rule) {
      return { valid: true }
    }

    if (rule.type === 'string' && typeof value !== 'string') {
      return { valid: false, error: 'Value must be a string' }
    }

    if (rule.type === 'boolean' && typeof value !== 'boolean') {
      return { valid: false, error: 'Value must be a boolean' }
    }

    if (rule.type === 'number' && typeof value !== 'number') {
      return { valid: false, error: 'Value must be a number' }
    }

    if (rule.allowedValues && !rule.allowedValues.includes(value)) {
      return { valid: false, error: `Value must be one of: ${rule.allowedValues.join(', ')}` }
    }

    if (rule.min && value < rule.min) {
      return { valid: false, error: `Value must be at least ${rule.min}` }
    }

    if (rule.max && value > rule.max) {
      return { valid: false, error: `Value must be at most ${rule.max}` }
    }

    return { valid: true }
  }

  /**
   * Get middleware for routes
   * @returns {Object} - Middleware functions
   */
  getMiddleware() {
    return {
      requireAdmin: this.middleware.requireAdmin(),
      requirePermission: this.middleware.requirePermission.bind(this.middleware)
    }
  }
}

module.exports = ConfigAPI