// Secure Ledger Access Control - V12.0 L5 Knowledge Layer
class SecureLedgerAccess {
  constructor() {
    this.accessLevels = {
      'llm': 'read',
      'admin': 'write',
      'system': 'write',
      'user': 'read'
    }
    
    this.ledgerEntries = []
    this.accessLog = []
    this.nextEntryId = 1
  }

  /**
   * Write to ledger with access control
   * @param {string} entityId - Entity making the request
   * @param {string} entityType - Type of entity (llm, admin, system, user)
   * @param {Object} entry - Ledger entry data
   * @returns {Object} - Result object
   */
  writeToLedger(entityId, entityType, entry) {
    // Check access level
    const accessLevel = this.accessLevels[entityType]
    if (!accessLevel) {
      return {
        success: false,
        error: 'Invalid entity type',
        accessDenied: true
      }
    }

    if (accessLevel !== 'write') {
      return {
        success: false,
        error: 'Write access denied',
        accessDenied: true,
        allowedLevel: accessLevel
      }
    }

    // Validate entry data
    if (!entry.action || !entry.timestamp) {
      return {
        success: false,
        error: 'Invalid entry data: action and timestamp required'
      }
    }

    // Create ledger entry
    const ledgerEntry = {
      id: `ledger_${this.nextEntryId++}`,
      entityId,
      entityType,
      action: entry.action,
      data: entry.data || {},
      timestamp: entry.timestamp,
      metadata: {
        ...entry.metadata,
        accessLevel,
        createdAt: new Date().toISOString()
      }
    }

    // Add to ledger
    this.ledgerEntries.push(ledgerEntry)
    
    // Log access
    this.logAccess(entityId, entityType, 'write', entry.action, true)
    
    console.log(`Ledger entry written by ${entityType}:${entityId} - ${entry.action}`)
    
    return {
      success: true,
      entryId: ledgerEntry.id,
      message: 'Ledger entry written successfully'
    }
  }

  /**
   * Read from ledger with access control
   * @param {string} entityId - Entity making the request
   * @param {string} entityType - Type of entity (llm, admin, system, user)
   * @param {Object} filters - Filter criteria
   * @returns {Object} - Result object
   */
  readFromLedger(entityId, entityType, filters = {}) {
    // Check access level
    const accessLevel = this.accessLevels[entityType]
    if (!accessLevel) {
      return {
        success: false,
        error: 'Invalid entity type',
        accessDenied: true
      }
    }

    // Filter entries based on access level
    let filteredEntries = [...this.ledgerEntries]
    
    // LLM can only read non-sensitive entries
    if (entityType === 'llm') {
      filteredEntries = filteredEntries.filter(entry => 
        !entry.metadata.sensitive && 
        !entry.metadata.restricted
      )
    }

    // Apply additional filters
    if (filters.action) {
      filteredEntries = filteredEntries.filter(entry => entry.action === filters.action)
    }
    
    if (filters.entityType) {
      filteredEntries = filteredEntries.filter(entry => entry.entityType === filters.entityType)
    }
    
    if (filters.startDate) {
      filteredEntries = filteredEntries.filter(entry => 
        new Date(entry.timestamp) >= new Date(filters.startDate)
      )
    }
    
    if (filters.endDate) {
      filteredEntries = filteredEntries.filter(entry => 
        new Date(entry.timestamp) <= new Date(filters.endDate)
      )
    }

    // Sort by timestamp (newest first)
    filteredEntries.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    
    // Apply pagination
    const limit = filters.limit || 100
    const offset = filters.offset || 0
    const paginatedEntries = filteredEntries.slice(offset, offset + limit)
    
    // Log access
    this.logAccess(entityId, entityType, 'read', 'ledger_query', true)
    
    return {
      success: true,
      entries: paginatedEntries,
      total: filteredEntries.length,
      limit,
      offset,
      accessLevel
    }
  }

  /**
   * Get ledger statistics
   * @param {string} entityId - Entity making the request
   * @param {string} entityType - Type of entity
   * @returns {Object} - Statistics result
   */
  getLedgerStatistics(entityId, entityType) {
    // Check access level
    const accessLevel = this.accessLevels[entityType]
    if (!accessLevel) {
      return {
        success: false,
        error: 'Invalid entity type',
        accessDenied: true
      }
    }

    // Calculate statistics
    const stats = {
      totalEntries: this.ledgerEntries.length,
      entriesByType: {},
      entriesByEntity: {},
      recentActivity: [],
      accessLevel
    }

    // Group by entity type
    this.ledgerEntries.forEach(entry => {
      stats.entriesByType[entry.entityType] = (stats.entriesByType[entry.entityType] || 0) + 1
      stats.entriesByEntity[entry.entityId] = (stats.entriesByEntity[entry.entityId] || 0) + 1
    })

    // Recent activity (last 10 entries)
    stats.recentActivity = this.ledgerEntries
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 10)
      .map(entry => ({
        id: entry.id,
        action: entry.action,
        entityType: entry.entityType,
        timestamp: entry.timestamp
      }))

    // Log access
    this.logAccess(entityId, entityType, 'read', 'statistics', true)
    
    return {
      success: true,
      statistics: stats
    }
  }

  /**
   * Update access levels
   * @param {string} adminId - Admin entity ID
   * @param {Object} newAccessLevels - New access level configuration
   * @returns {Object} - Result object
   */
  updateAccessLevels(adminId, newAccessLevels) {
    // Only admin can update access levels
    if (this.accessLevels[adminId] !== 'write') {
      return {
        success: false,
        error: 'Insufficient permissions to update access levels',
        accessDenied: true
      }
    }

    // Validate new access levels
    const validLevels = ['read', 'write']
    for (const [entityType, level] of Object.entries(newAccessLevels)) {
      if (!validLevels.includes(level)) {
        return {
          success: false,
          error: `Invalid access level '${level}' for entity type '${entityType}'`
        }
      }
    }

    // Update access levels
    this.accessLevels = { ...this.accessLevels, ...newAccessLevels }
    
    // Log the change
    this.logAccess(adminId, 'admin', 'write', 'access_levels_updated', true)
    
    console.log(`Access levels updated by admin:${adminId}`)
    
    return {
      success: true,
      message: 'Access levels updated successfully',
      newAccessLevels: this.accessLevels
    }
  }

  /**
   * Get access log
   * @param {string} entityId - Entity making the request
   * @param {string} entityType - Type of entity
   * @returns {Object} - Access log result
   */
  getAccessLog(entityId, entityType) {
    // Only admin can view access log
    if (entityType !== 'admin') {
      return {
        success: false,
        error: 'Access log restricted to admin users',
        accessDenied: true
      }
    }

    // Log access
    this.logAccess(entityId, entityType, 'read', 'access_log', true)
    
    return {
      success: true,
      accessLog: this.accessLog,
      total: this.accessLog.length
    }
  }

  /**
   * Log access attempt
   * @param {string} entityId - Entity ID
   * @param {string} entityType - Entity type
   * @param {string} operation - Operation performed
   * @param {string} action - Action attempted
   * @param {boolean} success - Success status
   */
  logAccess(entityId, entityType, operation, action, success) {
    const logEntry = {
      id: `access_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      entityId,
      entityType,
      operation,
      action,
      success,
      timestamp: new Date().toISOString(),
      ip: '127.0.0.1', // Simulated IP
      userAgent: 'L5-Knowledge-System'
    }
    
    this.accessLog.push(logEntry)
    
    // Keep only last 1000 access log entries
    if (this.accessLog.length > 1000) {
      this.accessLog = this.accessLog.slice(-1000)
    }
  }

  /**
   * Validate entity access
   * @param {string} entityId - Entity ID
   * @param {string} entityType - Entity type
   * @param {string} operation - Operation to validate
   * @returns {Object} - Validation result
   */
  validateAccess(entityId, entityType, operation) {
    const accessLevel = this.accessLevels[entityType]
    
    if (!accessLevel) {
      return {
        valid: false,
        error: 'Invalid entity type',
        accessDenied: true
      }
    }

    if (operation === 'write' && accessLevel !== 'write') {
      return {
        valid: false,
        error: 'Write access denied',
        accessDenied: true,
        allowedLevel: accessLevel
      }
    }

    return {
      valid: true,
      accessLevel,
      entityId,
      entityType
    }
  }

  /**
   * Get current access levels
   * @returns {Object} - Current access levels
   */
  getAccessLevels() {
    return { ...this.accessLevels }
  }

  /**
   * Clear all data
   */
  clear() {
    this.ledgerEntries = []
    this.accessLog = []
    this.nextEntryId = 1
    console.log('Secure ledger access cleared')
  }

  /**
   * Get ledger summary
   * @returns {Object} - Ledger summary
   */
  getSummary() {
    return {
      totalEntries: this.ledgerEntries.length,
      totalAccessLogs: this.accessLog.length,
      accessLevels: this.getAccessLevels(),
      lastActivity: this.ledgerEntries.length > 0 
        ? Math.max(...this.ledgerEntries.map(entry => new Date(entry.timestamp).getTime()))
        : null
    }
  }
}

module.exports = SecureLedgerAccess
