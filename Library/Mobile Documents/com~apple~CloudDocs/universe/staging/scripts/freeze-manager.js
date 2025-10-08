// Context: V12.0 CI/CD Framework - Freeze Flag Manager
// This script provides freeze flag management capabilities for the Discovery Dial
// Mission Control system, allowing system administrators to freeze deployments.

const fs = require('fs')
const path = require('path')

class FreezeManager {
  constructor() {
    this.freezeFile = path.join(__dirname, '../.freeze')
    this.freezeLogFile = path.join(__dirname, '../logs/freeze.log')
    this.ensureLogDirectory()
  }

  /**
   * Ensures the logs directory exists.
   */
  ensureLogDirectory() {
    const logDir = path.dirname(this.freezeLogFile)
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true })
    }
  }

  /**
   * Checks if the system is currently frozen.
   * @returns {boolean} True if system is frozen, false otherwise.
   */
  isFrozen() {
    return fs.existsSync(this.freezeFile)
  }

  /**
   * Gets freeze information if system is frozen.
   * @returns {object|null} Freeze information or null if not frozen.
   */
  getFreezeInfo() {
    if (!this.isFrozen()) {
      return null
    }

    try {
      const freezeData = fs.readFileSync(this.freezeFile, 'utf8')
      return JSON.parse(freezeData)
    } catch (error) {
      return {
        frozen: true,
        frozenAt: new Date().toISOString(),
        frozenBy: 'unknown',
        reason: 'Freeze flag exists but data is corrupted'
      }
    }
  }

  /**
   * Freezes the system.
   * @param {string} frozenBy - Who is freezing the system.
   * @param {string} reason - Reason for freezing.
   * @returns {object} Freeze result.
   */
  freezeSystem(frozenBy = 'system', reason = 'Manual freeze') {
    if (this.isFrozen()) {
      return {
        success: false,
        message: 'System is already frozen',
        freezeInfo: this.getFreezeInfo()
      }
    }

    const freezeData = {
      frozen: true,
      frozenAt: new Date().toISOString(),
      frozenBy: frozenBy,
      reason: reason,
      expiresAt: null // No expiration by default
    }

    try {
      fs.writeFileSync(this.freezeFile, JSON.stringify(freezeData, null, 2))
      this.logFreezeAction('FREEZE', frozenBy, reason)
      
      console.log('🧊 System frozen successfully')
      console.log(`   Frozen by: ${frozenBy}`)
      console.log(`   Reason: ${reason}`)
      console.log(`   Frozen at: ${freezeData.frozenAt}`)
      
      return {
        success: true,
        message: 'System frozen successfully',
        freezeInfo: freezeData
      }
    } catch (error) {
      return {
        success: false,
        message: `Failed to freeze system: ${error.message}`,
        error: error.message
      }
    }
  }

  /**
   * Unfreezes the system.
   * @param {string} unfrozenBy - Who is unfreezing the system.
   * @param {string} reason - Reason for unfreezing.
   * @returns {object} Unfreeze result.
   */
  unfreezeSystem(unfrozenBy = 'system', reason = 'Manual unfreeze') {
    if (!this.isFrozen()) {
      return {
        success: false,
        message: 'System is not frozen',
        freezeInfo: null
      }
    }

    const freezeInfo = this.getFreezeInfo()
    
    try {
      fs.unlinkSync(this.freezeFile)
      this.logFreezeAction('UNFREEZE', unfrozenBy, reason)
      
      console.log('🔥 System unfrozen successfully')
      console.log(`   Unfrozen by: ${unfrozenBy}`)
      console.log(`   Reason: ${reason}`)
      console.log(`   Unfrozen at: ${new Date().toISOString()}`)
      
      return {
        success: true,
        message: 'System unfrozen successfully',
        previousFreezeInfo: freezeInfo
      }
    } catch (error) {
      return {
        success: false,
        message: `Failed to unfreeze system: ${error.message}`,
        error: error.message
      }
    }
  }

  /**
   * Sets a temporary freeze with expiration.
   * @param {string} frozenBy - Who is freezing the system.
   * @param {string} reason - Reason for freezing.
   * @param {number} durationMinutes - Duration in minutes.
   * @returns {object} Freeze result.
   */
  setTemporaryFreeze(frozenBy = 'system', reason = 'Temporary freeze', durationMinutes = 60) {
    if (this.isFrozen()) {
      return {
        success: false,
        message: 'System is already frozen',
        freezeInfo: this.getFreezeInfo()
      }
    }

    const expiresAt = new Date(Date.now() + durationMinutes * 60000).toISOString()
    
    const freezeData = {
      frozen: true,
      frozenAt: new Date().toISOString(),
      frozenBy: frozenBy,
      reason: reason,
      expiresAt: expiresAt,
      durationMinutes: durationMinutes
    }

    try {
      fs.writeFileSync(this.freezeFile, JSON.stringify(freezeData, null, 2))
      this.logFreezeAction('TEMPORARY_FREEZE', frozenBy, reason, durationMinutes)
      
      console.log('🧊 System frozen temporarily')
      console.log(`   Frozen by: ${frozenBy}`)
      console.log(`   Reason: ${reason}`)
      console.log(`   Duration: ${durationMinutes} minutes`)
      console.log(`   Expires at: ${expiresAt}`)
      
      return {
        success: true,
        message: 'System frozen temporarily',
        freezeInfo: freezeData
      }
    } catch (error) {
      return {
        success: false,
        message: `Failed to set temporary freeze: ${error.message}`,
        error: error.message
      }
    }
  }

  /**
   * Checks if a freeze has expired.
   * @returns {boolean} True if freeze has expired, false otherwise.
   */
  isFreezeExpired() {
    const freezeInfo = this.getFreezeInfo()
    if (!freezeInfo || !freezeInfo.expiresAt) {
      return false
    }

    const now = new Date()
    const expiresAt = new Date(freezeInfo.expiresAt)
    
    return now > expiresAt
  }

  /**
   * Auto-unfreezes the system if freeze has expired.
   * @returns {object} Auto-unfreeze result.
   */
  autoUnfreezeIfExpired() {
    if (!this.isFrozen()) {
      return {
        success: false,
        message: 'System is not frozen',
        autoUnfrozen: false
      }
    }

    if (this.isFreezeExpired()) {
      const freezeInfo = this.getFreezeInfo()
      const result = this.unfreezeSystem('system', 'Automatic unfreeze - freeze expired')
      
      return {
        success: true,
        message: 'System auto-unfrozen due to expiration',
        autoUnfrozen: true,
        previousFreezeInfo: freezeInfo
      }
    }

    return {
      success: false,
      message: 'Freeze has not expired',
      autoUnfrozen: false
    }
  }

  /**
   * Logs freeze actions to the freeze log.
   * @param {string} action - The action taken.
   * @param {string} user - Who performed the action.
   * @param {string} reason - Reason for the action.
   * @param {number} duration - Duration in minutes (for temporary freezes).
   */
  logFreezeAction(action, user, reason, duration = null) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      action: action,
      user: user,
      reason: reason,
      duration: duration
    }

    const logLine = JSON.stringify(logEntry) + '\n'
    
    try {
      fs.appendFileSync(this.freezeLogFile, logLine)
    } catch (error) {
      console.error('Failed to log freeze action:', error.message)
    }
  }

  /**
   * Gets freeze log history.
   * @param {number} limit - Maximum number of log entries to return.
   * @returns {Array<object>} Array of log entries.
   */
  getFreezeLogHistory(limit = 50) {
    if (!fs.existsSync(this.freezeLogFile)) {
      return []
    }

    try {
      const logContent = fs.readFileSync(this.freezeLogFile, 'utf8')
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
      console.error('Failed to read freeze log:', error.message)
      return []
    }
  }

  /**
   * Gets system freeze status.
   * @returns {object} System freeze status.
   */
  getSystemStatus() {
    const isFrozen = this.isFrozen()
    const freezeInfo = this.getFreezeInfo()
    const isExpired = this.isFreezeExpired()
    
    return {
      isFrozen: isFrozen,
      isExpired: isExpired,
      freezeInfo: freezeInfo,
      status: isFrozen ? (isExpired ? 'EXPIRED' : 'FROZEN') : 'UNFROZEN',
      canDeploy: !isFrozen || isExpired
    }
  }

  /**
   * Cleans up expired freeze flags.
   * @returns {object} Cleanup result.
   */
  cleanupExpiredFreezes() {
    if (!this.isFrozen()) {
      return {
        success: false,
        message: 'System is not frozen',
        cleaned: false
      }
    }

    if (this.isFreezeExpired()) {
      const result = this.autoUnfreezeIfExpired()
      return {
        success: true,
        message: 'Expired freeze flag cleaned up',
        cleaned: true,
        result: result
      }
    }

    return {
      success: false,
      message: 'Freeze flag has not expired',
      cleaned: false
    }
  }
}

// Export for use in other scripts
module.exports = { FreezeManager }

// CLI interface if this script is executed directly
if (require.main === module) {
  const freezeManager = new FreezeManager()
  const args = process.argv.slice(2)
  const command = args[0]
  
  switch (command) {
    case 'status':
      const status = freezeManager.getSystemStatus()
      console.log('🧊 Freeze Status:', status.status)
      console.log('📊 Can Deploy:', status.canDeploy)
      if (status.freezeInfo) {
        console.log('📋 Freeze Info:', JSON.stringify(status.freezeInfo, null, 2))
      }
      break
      
    case 'freeze':
      const frozenBy = args[1] || 'cli'
      const reason = args[2] || 'Manual freeze via CLI'
      const result = freezeManager.freezeSystem(frozenBy, reason)
      console.log(result.message)
      break
      
    case 'unfreeze':
      const unfrozenBy = args[1] || 'cli'
      const unfreezeReason = args[2] || 'Manual unfreeze via CLI'
      const unfreezeResult = freezeManager.unfreezeSystem(unfrozenBy, unfreezeReason)
      console.log(unfreezeResult.message)
      break
      
    case 'temp-freeze':
      const tempFrozenBy = args[1] || 'cli'
      const tempReason = args[2] || 'Temporary freeze via CLI'
      const duration = parseInt(args[3]) || 60
      const tempResult = freezeManager.setTemporaryFreeze(tempFrozenBy, tempReason, duration)
      console.log(tempResult.message)
      break
      
    case 'cleanup':
      const cleanupResult = freezeManager.cleanupExpiredFreezes()
      console.log(cleanupResult.message)
      break
      
    case 'log':
      const limit = parseInt(args[1]) || 10
      const logHistory = freezeManager.getFreezeLogHistory(limit)
      console.log('📋 Freeze Log History:')
      logHistory.forEach(entry => {
        console.log(`   ${entry.timestamp} - ${entry.action} by ${entry.user}: ${entry.reason}`)
      })
      break
      
    default:
      console.log('Usage: node freeze-manager.js <command> [args]')
      console.log('Commands:')
      console.log('  status                    - Show freeze status')
      console.log('  freeze [user] [reason]     - Freeze system')
      console.log('  unfreeze [user] [reason]   - Unfreeze system')
      console.log('  temp-freeze [user] [reason] [duration] - Set temporary freeze')
      console.log('  cleanup                   - Clean up expired freezes')
      console.log('  log [limit]               - Show freeze log history')
      break
  }
}
