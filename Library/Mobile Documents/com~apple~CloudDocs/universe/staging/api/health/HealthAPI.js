// Health API - System Health Endpoints
class HealthAPI {
  constructor() {
    this.routes = {
      'GET /api/health': this.getHealth.bind(this),
      'GET /api/health/metrics': this.getMetrics.bind(this)
    }
  }

  async getHealth(req, res) {
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString()
    })
  }

  async getMetrics(req, res) {
    res.json({
      metrics: {
        uptime: process.uptime(),
        memory: process.memoryUsage()
      }
    })
  }
}

module.exports = HealthAPI

