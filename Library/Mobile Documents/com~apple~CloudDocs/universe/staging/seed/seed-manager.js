// Context: V12.0 Seed Fixtures - Seed Manager
// This script provides comprehensive seed data management for the Discovery Dial
// Mission Control system, including seeding and unseeding operations.

const fs = require('fs')
const path = require('path')
const seedData = require('./seed-data')

class SeedManager {
  constructor() {
    this.seedFile = path.join(__dirname, '../.seed')
    this.seedLogFile = path.join(__dirname, '../logs/seed.log')
    this.ensureLogDirectory()
  }

  /**
   * Ensures the logs directory exists.
   */
  ensureLogDirectory() {
    const logDir = path.dirname(this.seedLogFile)
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true })
    }
  }

  /**
   * Checks if the system is currently seeded.
   * @returns {boolean} True if system is seeded, false otherwise.
   */
  isSeeded() {
    return fs.existsSync(this.seedFile)
  }

  /**
   * Gets seed information if system is seeded.
   * @returns {object|null} Seed information or null if not seeded.
   */
  getSeedInfo() {
    if (!this.isSeeded()) {
      return null
    }

    try {
      const seedData = fs.readFileSync(this.seedFile, 'utf8')
      return JSON.parse(seedData)
    } catch (error) {
      return {
        seeded: true,
        seededAt: new Date().toISOString(),
        seededBy: 'unknown',
        reason: 'Seed flag exists but data is corrupted'
      }
    }
  }

  /**
   * Seeds the system with demo data.
   * @param {string} seededBy - Who is seeding the system.
   * @param {string} reason - Reason for seeding.
   * @returns {object} Seed result.
   */
  seedSystem(seededBy = 'system', reason = 'Demo seed data') {
    if (this.isSeeded()) {
      return {
        success: false,
        message: 'System is already seeded',
        seedInfo: this.getSeedInfo()
      }
    }

    const seedInfo = {
      seeded: true,
      seededAt: new Date().toISOString(),
      seededBy: seededBy,
      reason: reason,
      dataCounts: {
        events: seedData.events.length,
        agents: seedData.agents.length,
        policies: seedData.governance.policies.length,
        decisions: seedData.governance.decisions.length
      }
    }

    try {
      // Create seed flag
      fs.writeFileSync(this.seedFile, JSON.stringify(seedInfo, null, 2))
      
      // Log seed action
      this.logSeedAction('SEED', seededBy, reason, seedInfo.dataCounts)
      
      console.log('🌱 System seeded successfully')
      console.log(`   Seeded by: ${seededBy}`)
      console.log(`   Reason: ${reason}`)
      console.log(`   Seeded at: ${seedInfo.seededAt}`)
      console.log(`   Events: ${seedInfo.dataCounts.events}`)
      console.log(`   Agents: ${seedInfo.dataCounts.agents}`)
      console.log(`   Policies: ${seedInfo.dataCounts.policies}`)
      console.log(`   Decisions: ${seedInfo.dataCounts.decisions}`)
      
      return {
        success: true,
        message: 'System seeded successfully',
        seedInfo: seedInfo
      }
    } catch (error) {
      return {
        success: false,
        message: `Failed to seed system: ${error.message}`,
        error: error.message
      }
    }
  }

  /**
   * Unseeds the system (removes demo data).
   * @param {string} unseededBy - Who is unseeding the system.
   * @param {string} reason - Reason for unseeding.
   * @returns {object} Unseed result.
   */
  unseedSystem(unseededBy = 'system', reason = 'Clean rollback') {
    if (!this.isSeeded()) {
      return {
        success: false,
        message: 'System is not seeded',
        seedInfo: null
      }
    }

    const seedInfo = this.getSeedInfo()
    
    try {
      // Remove seed flag
      fs.unlinkSync(this.seedFile)
      
      // Log unseed action
      this.logSeedAction('UNSEED', unseededBy, reason)
      
      console.log('🧹 System unseeded successfully')
      console.log(`   Unseeded by: ${unseededBy}`)
      console.log(`   Reason: ${reason}`)
      console.log(`   Unseeded at: ${new Date().toISOString()}`)
      
      return {
        success: true,
        message: 'System unseeded successfully',
        previousSeedInfo: seedInfo
      }
    } catch (error) {
      return {
        success: false,
        message: `Failed to unseed system: ${error.message}`,
        error: error.message
      }
    }
  }

  /**
   * Gets seed data for a specific category.
   * @param {string} category - The data category (events, agents, etc.).
   * @returns {Array|object} The seed data for the category.
   */
  getSeedData(category = null) {
    if (category) {
      return seedData[category] || null
    }
    return seedData
  }

  /**
   * Validates seed data integrity.
   * @returns {object} Validation result.
   */
  validateSeedData() {
    const validation = {
      valid: true,
      errors: [],
      warnings: []
    }

    // Validate events
    if (!seedData.events || !Array.isArray(seedData.events)) {
      validation.valid = false
      validation.errors.push('Events data is missing or invalid')
    } else if (seedData.events.length === 0) {
      validation.warnings.push('No events in seed data')
    }

    // Validate agents
    if (!seedData.agents || !Array.isArray(seedData.agents)) {
      validation.valid = false
      validation.errors.push('Agents data is missing or invalid')
    } else if (seedData.agents.length === 0) {
      validation.warnings.push('No agents in seed data')
    }

    // Validate system health
    if (!seedData.systemHealth) {
      validation.valid = false
      validation.errors.push('System health data is missing')
    }

    // Validate governance
    if (!seedData.governance) {
      validation.valid = false
      validation.errors.push('Governance data is missing')
    }

    return validation
  }

  /**
   * Logs seed actions to the seed log.
   * @param {string} action - The action taken.
   * @param {string} user - Who performed the action.
   * @param {string} reason - Reason for the action.
   * @param {object} dataCounts - Data counts (for seed actions).
   */
  logSeedAction(action, user, reason, dataCounts = null) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      action: action,
      user: user,
      reason: reason,
      dataCounts: dataCounts
    }

    const logLine = JSON.stringify(logEntry) + '\n'
    
    try {
      fs.appendFileSync(this.seedLogFile, logLine)
    } catch (error) {
      console.error('Failed to log seed action:', error.message)
    }
  }

  /**
   * Gets seed log history.
   * @param {number} limit - Maximum number of log entries to return.
   * @returns {Array<object>} Array of log entries.
   */
  getSeedLogHistory(limit = 50) {
    if (!fs.existsSync(this.seedLogFile)) {
      return []
    }

    try {
      const logContent = fs.readFileSync(this.seedLogFile, 'utf8')
      const logLines = logContent.trim().split('\n').filter(line => line.trim())
      
      const logEntries = logLines
        .map(line => {
          try {
            return JSON.parse(line)
          } catch (error) {
            return null
          }
        })
        .filter(entry => entry !== null)
        .slice(-limit)
      
      return logEntries
    } catch (error) {
      console.error('Failed to read seed log:', error.message)
      return []
    }
  }

  /**
   * Gets system seed status.
   * @returns {object} System seed status.
   */
  getSystemStatus() {
    const isSeeded = this.isSeeded()
    const seedInfo = this.getSeedInfo()
    const validation = this.validateSeedData()
    
    return {
      isSeeded: isSeeded,
      seedInfo: seedInfo,
      validation: validation,
      status: isSeeded ? 'SEEDED' : 'UNSEEDED',
      canSeed: !isSeeded,
      canUnseed: isSeeded
    }
  }

  /**
   * Generates a seed report.
   * @returns {object} The seed report.
   */
  generateReport() {
    const status = this.getSystemStatus()
    const validation = this.validateSeedData()
    
    const report = {
      timestamp: new Date().toISOString(),
      systemStatus: status,
      seedData: {
        events: seedData.events.length,
        agents: seedData.agents.length,
        policies: seedData.governance.policies.length,
        decisions: seedData.governance.decisions.length
      },
      validation: validation,
      recommendations: this.generateRecommendations(status, validation)
    }
    
    return report
  }

  /**
   * Generates recommendations based on seed status.
   * @param {object} status - System seed status.
   * @param {object} validation - Seed data validation.
   * @returns {Array<string>} Array of recommendations.
   */
  generateRecommendations(status, validation) {
    const recommendations = []
    
    if (!status.isSeeded) {
      recommendations.push('System is not seeded - consider seeding for demo purposes')
    }
    
    if (!validation.valid) {
      recommendations.push('Seed data validation failed - fix data issues before seeding')
      validation.errors.forEach(error => {
        recommendations.push(`  • ${error}`)
      })
    }
    
    if (validation.warnings.length > 0) {
      recommendations.push('Seed data has warnings - review data quality')
      validation.warnings.forEach(warning => {
        recommendations.push(`  • ${warning}`)
      })
    }
    
    return recommendations
  }
}

// Export for use in other scripts
module.exports = { SeedManager }

// CLI interface if this script is executed directly
if (require.main === module) {
  const seedManager = new SeedManager()
  const args = process.argv.slice(2)
  const command = args[0]
  
  switch (command) {
    case 'status':
      const status = seedManager.getSystemStatus()
      console.log('🌱 Seed Status:', status.status)
      console.log('📊 Can Seed:', status.canSeed)
      console.log('📊 Can Unseed:', status.canUnseed)
      if (status.seedInfo) {
        console.log('📋 Seed Info:', JSON.stringify(status.seedInfo, null, 2))
      }
      break
      
    case 'seed':
      const seededBy = args[1] || 'cli'
      const reason = args[2] || 'Manual seed via CLI'
      const result = seedManager.seedSystem(seededBy, reason)
      console.log(result.message)
      break
      
    case 'unseed':
      const unseededBy = args[1] || 'cli'
      const unseedReason = args[2] || 'Manual unseed via CLI'
      const unseedResult = seedManager.unseedSystem(unseededBy, unseedReason)
      console.log(unseedResult.message)
      break
      
    case 'validate':
      const validation = seedManager.validateSeedData()
      console.log('🔍 Seed Data Validation:')
      console.log(`   Valid: ${validation.valid}`)
      if (validation.errors.length > 0) {
        console.log('   Errors:')
        validation.errors.forEach(error => console.log(`     • ${error}`))
      }
      if (validation.warnings.length > 0) {
        console.log('   Warnings:')
        validation.warnings.forEach(warning => console.log(`     • ${warning}`))
      }
      break
      
    case 'log':
      const limit = parseInt(args[1]) || 10
      const logHistory = seedManager.getSeedLogHistory(limit)
      console.log('📋 Seed Log History:')
      logHistory.forEach(entry => {
        console.log(`   ${entry.timestamp} - ${entry.action} by ${entry.user}: ${entry.reason}`)
      })
      break
      
    default:
      console.log('Usage: node seed-manager.js <command> [args]')
      console.log('Commands:')
      console.log('  status                    - Show seed status')
      console.log('  seed [user] [reason]      - Seed system')
      console.log('  unseed [user] [reason]    - Unseed system')
      console.log('  validate                  - Validate seed data')
      console.log('  log [limit]               - Show seed log history')
      break
  }
}

