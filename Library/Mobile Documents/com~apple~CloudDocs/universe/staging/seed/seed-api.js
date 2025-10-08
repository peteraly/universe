// Context: V12.0 Seed Fixtures - Seed API Integration
// This module provides API integration for seed data management,
// allowing the UI to access and display seeded data.

const { SeedManager } = require('./seed-manager')
const seedData = require('./seed-data')

class SeedAPI {
  constructor() {
    this.seedManager = new SeedManager()
  }

  /**
   * Gets events data (seeded or empty).
   * @returns {Array<object>} Array of events.
   */
  getEvents() {
    if (this.seedManager.isSeeded()) {
      return seedData.events
    }
    return []
  }

  /**
   * Gets agents data (seeded or empty).
   * @returns {Array<object>} Array of agents.
   */
  getAgents() {
    if (this.seedManager.isSeeded()) {
      return seedData.agents
    }
    return []
  }

  /**
   * Gets system health data (seeded or default).
   * @returns {object} System health data.
   */
  getSystemHealth() {
    if (this.seedManager.isSeeded()) {
      return seedData.systemHealth
    }
    return {
      overallStatus: 'unknown',
      uptime: 0,
      memoryUsage: { used: 0, total: 0 },
      cpuUsage: 0,
      components: {},
      metrics: {},
      issues: [],
      lastCheck: new Date().toISOString()
    }
  }

  /**
   * Gets governance data (seeded or empty).
   * @returns {object} Governance data.
   */
  getGovernance() {
    if (this.seedManager.isSeeded()) {
      return seedData.governance
    }
    return {
      policies: [],
      decisions: [],
      metrics: {
        totalPolicies: 0,
        activePolicies: 0,
        totalDecisions: 0,
        pendingDecisions: 0
      }
    }
  }

  /**
   * Gets recovery data (seeded or default).
   * @returns {object} Recovery data.
   */
  getRecovery() {
    if (this.seedManager.isSeeded()) {
      return seedData.recovery
    }
    return {
      systemState: {
        current: 'unknown',
        previous: 'unknown',
        lastStableBuild: 'unknown',
        freezeMode: false,
        rollbackInProgress: false
      },
      activeIncidents: 0,
      recoveryMetrics: {
        totalIncidents: 0,
        resolvedIncidents: 0,
        successRate: 0
      }
    }
  }

  /**
   * Gets configuration data (seeded or default).
   * @returns {object} Configuration data.
   */
  getConfiguration() {
    if (this.seedManager.isSeeded()) {
      return seedData.configuration
    }
    return {
      environment: 'development',
      apiBaseUrl: '/api',
      eventRefreshInterval: 60000,
      featureFlags: {
        newAdminUI: false,
        aiCuration: false,
        darkModeBanner: false
      }
    }
  }

  /**
   * Gets seed status.
   * @returns {object} Seed status.
   */
  getSeedStatus() {
    return this.seedManager.getSystemStatus()
  }

  /**
   * Seeds the system.
   * @param {string} seededBy - Who is seeding the system.
   * @param {string} reason - Reason for seeding.
   * @returns {object} Seed result.
   */
  seedSystem(seededBy = 'api', reason = 'API seed request') {
    return this.seedManager.seedSystem(seededBy, reason)
  }

  /**
   * Unseeds the system.
   * @param {string} unseededBy - Who is unseeding the system.
   * @param {string} reason - Reason for unseeding.
   * @returns {object} Unseed result.
   */
  unseedSystem(unseededBy = 'api', reason = 'API unseed request') {
    return this.seedManager.unseedSystem(unseededBy, reason)
  }

  /**
   * Validates seed data.
   * @returns {object} Validation result.
   */
  validateSeedData() {
    return this.seedManager.validateSeedData()
  }

  /**
   * Gets comprehensive system data.
   * @returns {object} Complete system data.
   */
  getSystemData() {
    return {
      seedStatus: this.getSeedStatus(),
      events: this.getEvents(),
      agents: this.getAgents(),
      systemHealth: this.getSystemHealth(),
      governance: this.getGovernance(),
      recovery: this.getRecovery(),
      configuration: this.getConfiguration()
    }
  }
}

// Export for use in other modules
module.exports = { SeedAPI }

// Create singleton instance
const seedAPI = new SeedAPI()
module.exports.seedAPI = seedAPI
