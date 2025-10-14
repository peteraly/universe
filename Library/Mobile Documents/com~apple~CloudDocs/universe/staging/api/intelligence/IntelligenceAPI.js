// Intelligence API - V12.0 L4 Intelligence Center with Drift/Quarantine Logic
const RBACMiddleware = require('../../lib/auth/middleware')

class IntelligenceAPI {
  constructor() {
    this.middleware = new RBACMiddleware()
    this.incidents = []
    this.quarantineMode = false
    this.driftDetection = {
      active: true,
      threshold: 0.15,
      baseline: {
        responseTime: 100,
        errorRate: 0.02,
        throughput: 1000,
        memoryUsage: 0.5
      }
    }
    this.nextIncidentId = 1
    
    // Start drift detection simulation
    this.startDriftDetection()
  }

  /**
   * Start drift detection monitoring
   */
  startDriftDetection() {
    setInterval(() => {
      this.detectDrift()
    }, 10000) // Check every 10 seconds
  }

  /**
   * Detect system drift
   */
  detectDrift() {
    if (!this.driftDetection.active) return

    const currentMetrics = this.simulateCurrentMetrics()
    const drift = this.calculateDrift(currentMetrics)
    
    if (drift > this.driftDetection.threshold) {
      this.createDriftIncident(drift, currentMetrics)
    }
  }

  /**
   * Simulate current system metrics
   */
  simulateCurrentMetrics() {
    return {
      responseTime: this.driftDetection.baseline.responseTime + (Math.random() - 0.5) * 50,
      errorRate: Math.max(0, this.driftDetection.baseline.errorRate + (Math.random() - 0.5) * 0.05),
      throughput: this.driftDetection.baseline.throughput + (Math.random() - 0.5) * 200,
      memoryUsage: Math.max(0, Math.min(1, this.driftDetection.baseline.memoryUsage + (Math.random() - 0.5) * 0.3)),
      timestamp: new Date().toISOString()
    }
  }

  /**
   * Calculate drift from baseline
   */
  calculateDrift(currentMetrics) {
    const baseline = this.driftDetection.baseline
    
    const responseTimeDrift = Math.abs(currentMetrics.responseTime - baseline.responseTime) / baseline.responseTime
    const errorRateDrift = Math.abs(currentMetrics.errorRate - baseline.errorRate) / Math.max(baseline.errorRate, 0.001)
    const throughputDrift = Math.abs(currentMetrics.throughput - baseline.throughput) / baseline.throughput
    const memoryDrift = Math.abs(currentMetrics.memoryUsage - baseline.memoryUsage) / baseline.memoryUsage
    
    // Weighted average drift
    return (responseTimeDrift * 0.3 + errorRateDrift * 0.4 + throughputDrift * 0.2 + memoryDrift * 0.1)
  }

  /**
   * Create drift incident
   */
  createDriftIncident(drift, metrics) {
    const incident = {
      id: `incident_${this.nextIncidentId++}`,
      title: 'System Performance Drift Detected',
      description: `System metrics have drifted ${(drift * 100).toFixed(1)}% from baseline. This may indicate performance degradation or system instability.`,
      type: 'performance_drift',
      severity: drift > 0.3 ? 'high' : drift > 0.2 ? 'medium' : 'low',
      status: 'active',
      component: 'system',
      confidence: Math.min(0.95, drift * 2),
      impact: drift > 0.3 ? 'high' : drift > 0.2 ? 'medium' : 'low',
      detectedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      metrics: metrics,
      drift: drift
    }
    
    this.incidents.push(incident)
    console.log(`Drift incident created: ${incident.id} (drift: ${(drift * 100).toFixed(1)}%)`)
  }

  /**
   * Get all incidents
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async getIncidents(req, res) {
    try {
      const { status, severity, type } = req.query
      
      let filteredIncidents = [...this.incidents]
      
      if (status) {
        filteredIncidents = filteredIncidents.filter(incident => incident.status === status)
      }
      
      if (severity) {
        filteredIncidents = filteredIncidents.filter(incident => incident.severity === severity)
      }
      
      if (type) {
        filteredIncidents = filteredIncidents.filter(incident => incident.type === type)
      }
      
      // Sort by detected time (newest first)
      filteredIncidents.sort((a, b) => new Date(b.detectedAt) - new Date(a.detectedAt))
      
      res.json({
        success: true,
        incidents: filteredIncidents,
        total: filteredIncidents.length,
        timestamp: new Date().toISOString()
      })
    } catch (error) {
      console.error('Error getting incidents:', error)
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      })
    }
  }

  /**
   * Get intelligence status
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async getIntelligenceStatus(req, res) {
    try {
      const activeIncidents = this.incidents.filter(incident => incident.status === 'active')
      const criticalIncidents = activeIncidents.filter(incident => incident.severity === 'critical')
      
      res.json({
        success: true,
        data: {
          quarantineMode: this.quarantineMode,
          driftDetection: this.driftDetection,
          activeIncidents: activeIncidents.length,
          criticalIncidents: criticalIncidents.length,
          totalIncidents: this.incidents.length,
          systemHealth: criticalIncidents.length > 0 ? 'degraded' : 'healthy',
          lastUpdate: new Date().toISOString()
        }
      })
    } catch (error) {
      console.error('Error getting intelligence status:', error)
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      })
    }
  }

  /**
   * Toggle quarantine mode
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async toggleQuarantine(req, res) {
    try {
      const { enabled } = req.body
      const userId = req.userId || 'system'
      
      this.quarantineMode = enabled
      
      // Log quarantine action
      console.log(`Quarantine mode ${enabled ? 'enabled' : 'disabled'} by ${userId}`)
      
      res.json({
        success: true,
        message: `Quarantine mode ${enabled ? 'enabled' : 'disabled'}`,
        quarantineMode: this.quarantineMode,
        timestamp: new Date().toISOString()
      })
    } catch (error) {
      console.error('Error toggling quarantine:', error)
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      })
    }
  }

  /**
   * Update drift detection settings
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async updateDriftDetection(req, res) {
    try {
      const { threshold, active } = req.body
      const userId = req.userId || 'system'
      
      if (threshold !== undefined) {
        this.driftDetection.threshold = Math.max(0.05, Math.min(0.5, threshold))
      }
      
      if (active !== undefined) {
        this.driftDetection.active = active
      }
      
      console.log(`Drift detection updated by ${userId}: threshold=${this.driftDetection.threshold}, active=${this.driftDetection.active}`)
      
      res.json({
        success: true,
        message: 'Drift detection settings updated',
        driftDetection: this.driftDetection,
        timestamp: new Date().toISOString()
      })
    } catch (error) {
      console.error('Error updating drift detection:', error)
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      })
    }
  }

  /**
   * Perform incident action
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async performIncidentAction(req, res) {
    try {
      const { incidentId, action } = req.body
      const userId = req.userId || 'system'
      
      const incident = this.incidents.find(inc => inc.id === incidentId)
      
      if (!incident) {
        return res.status(404).json({
          success: false,
          error: 'Incident not found'
        })
      }
      
      switch (action) {
        case 'investigate':
          incident.status = 'investigating'
          incident.updatedAt = new Date().toISOString()
          break
          
        case 'quarantine':
          incident.status = 'quarantined'
          incident.updatedAt = new Date().toISOString()
          break
          
        case 'resolve':
          incident.status = 'resolved'
          incident.updatedAt = new Date().toISOString()
          break
          
        default:
          return res.status(400).json({
            success: false,
            error: 'Invalid action'
          })
      }
      
      console.log(`Incident ${incidentId} ${action} by ${userId}`)
      
      res.json({
        success: true,
        message: `Incident ${action} successful`,
        incident,
        timestamp: new Date().toISOString()
      })
    } catch (error) {
      console.error('Error performing incident action:', error)
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      })
    }
  }

  /**
   * Get incident by ID
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async getIncidentById(req, res) {
    try {
      const { id } = req.params
      
      const incident = this.incidents.find(inc => inc.id === id)
      
      if (!incident) {
        return res.status(404).json({
          success: false,
          error: 'Incident not found'
        })
      }
      
      res.json({
        success: true,
        incident,
        timestamp: new Date().toISOString()
      })
    } catch (error) {
      console.error('Error getting incident by ID:', error)
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      })
    }
  }

  /**
   * Get drift metrics
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async getDriftMetrics(req, res) {
    try {
      const currentMetrics = this.simulateCurrentMetrics()
      const drift = this.calculateDrift(currentMetrics)
      
      res.json({
        success: true,
        data: {
          current: currentMetrics,
          baseline: this.driftDetection.baseline,
          drift: drift,
          threshold: this.driftDetection.threshold,
          alert: drift > this.driftDetection.threshold,
          timestamp: new Date().toISOString()
        }
      })
    } catch (error) {
      console.error('Error getting drift metrics:', error)
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      })
    }
  }

  /**
   * Simulate incident creation for testing
   */
  simulateIncident() {
    const incidentTypes = [
      { type: 'performance_drift', title: 'Performance Degradation', component: 'api' },
      { type: 'security_alert', title: 'Security Anomaly Detected', component: 'auth' },
      { type: 'data_integrity', title: 'Data Integrity Issue', component: 'database' },
      { type: 'resource_exhaustion', title: 'Resource Exhaustion', component: 'system' }
    ]
    
    const severities = ['low', 'medium', 'high', 'critical']
    const randomType = incidentTypes[Math.floor(Math.random() * incidentTypes.length)]
    const randomSeverity = severities[Math.floor(Math.random() * severities.length)]
    
    const incident = {
      id: `incident_${this.nextIncidentId++}`,
      title: randomType.title,
      description: `Simulated ${randomType.type} incident for testing purposes.`,
      type: randomType.type,
      severity: randomSeverity,
      status: 'active',
      component: randomType.component,
      confidence: Math.random() * 0.5 + 0.5, // 0.5 to 1.0
      impact: randomSeverity === 'critical' ? 'high' : randomSeverity === 'high' ? 'medium' : 'low',
      detectedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    this.incidents.push(incident)
    console.log(`Simulated incident created: ${incident.id}`)
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

module.exports = IntelligenceAPI

