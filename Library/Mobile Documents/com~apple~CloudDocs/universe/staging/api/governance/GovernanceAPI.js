// Governance API - V12.0 L3 Governance Ledger Management
const RBACMiddleware = require('../../lib/auth/middleware')

class GovernanceAPI {
  constructor() {
    this.middleware = new RBACMiddleware()
    this.ledger = []
  }

  /**
   * Get governance ledger entries
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async getLedger(req, res) {
    try {
      const { 
        limit = 50, 
        offset = 0, 
        action, 
        userId, 
        startDate, 
        endDate 
      } = req.query
      
      let filteredEntries = [...this.ledger]
      
      // Filter by action
      if (action) {
        filteredEntries = filteredEntries.filter(entry => entry.action === action)
      }
      
      // Filter by user
      if (userId) {
        filteredEntries = filteredEntries.filter(entry => entry.userId === userId)
      }
      
      // Filter by date range
      if (startDate) {
        filteredEntries = filteredEntries.filter(entry => 
          new Date(entry.timestamp) >= new Date(startDate)
        )
      }
      
      if (endDate) {
        filteredEntries = filteredEntries.filter(entry => 
          new Date(entry.timestamp) <= new Date(endDate)
        )
      }
      
      // Sort by timestamp (newest first)
      filteredEntries.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      
      // Apply pagination
      const entries = filteredEntries.slice(
        parseInt(offset), 
        parseInt(offset) + parseInt(limit)
      )
      
      res.json({
        success: true,
        entries,
        total: filteredEntries.length,
        limit: parseInt(limit),
        offset: parseInt(offset),
        filters: {
          action,
          userId,
          startDate,
          endDate
        },
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
   * Get ledger entry by ID
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async getLedgerEntry(req, res) {
    try {
      const { id } = req.params
      
      const entry = this.ledger.find(e => e.id === id)
      
      if (!entry) {
        return res.status(404).json({
          success: false,
          error: 'Ledger entry not found'
        })
      }

      res.json({
        success: true,
        entry,
        timestamp: new Date().toISOString()
      })
    } catch (error) {
      console.error('Error getting ledger entry:', error)
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      })
    }
  }

  /**
   * Get ledger statistics
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async getLedgerStats(req, res) {
    try {
      const { startDate, endDate } = req.query
      
      let filteredEntries = [...this.ledger]
      
      // Filter by date range
      if (startDate) {
        filteredEntries = filteredEntries.filter(entry => 
          new Date(entry.timestamp) >= new Date(startDate)
        )
      }
      
      if (endDate) {
        filteredEntries = filteredEntries.filter(entry => 
          new Date(entry.timestamp) <= new Date(endDate)
        )
      }
      
      // Calculate statistics
      const stats = {
        totalEntries: filteredEntries.length,
        actions: {},
        users: {},
        timeRange: {
          start: startDate || (filteredEntries.length > 0 ? filteredEntries[filteredEntries.length - 1].timestamp : null),
          end: endDate || (filteredEntries.length > 0 ? filteredEntries[0].timestamp : null)
        }
      }
      
      // Count actions
      filteredEntries.forEach(entry => {
        stats.actions[entry.action] = (stats.actions[entry.action] || 0) + 1
        stats.users[entry.userId] = (stats.users[entry.userId] || 0) + 1
      })
      
      res.json({
        success: true,
        stats,
        timestamp: new Date().toISOString()
      })
    } catch (error) {
      console.error('Error getting ledger stats:', error)
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      })
    }
  }

  /**
   * Add entry to governance ledger
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async addLedgerEntry(req, res) {
    try {
      const { action, key, oldValue, newValue, metadata } = req.body
      const userId = req.userId || 'system'
      
      if (!action) {
        return res.status(400).json({
          success: false,
          error: 'Action is required'
        })
      }

      const entry = {
        id: `ledger_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        action,
        key,
        oldValue,
        newValue,
        userId,
        metadata: metadata || {},
        timestamp: new Date().toISOString(),
        ip: req.ip || 'unknown',
        userAgent: req.headers['user-agent'] || 'unknown'
      }
      
      this.ledger.push(entry)
      
      // Keep only last 1000 entries to prevent memory issues
      if (this.ledger.length > 1000) {
        this.ledger = this.ledger.slice(-1000)
      }
      
      res.status(201).json({
        success: true,
        message: 'Ledger entry added successfully',
        entry,
        timestamp: new Date().toISOString()
      })
    } catch (error) {
      console.error('Error adding ledger entry:', error)
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      })
    }
  }

  /**
   * Export ledger entries
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async exportLedger(req, res) {
    try {
      const { format = 'json', startDate, endDate } = req.query
      
      let filteredEntries = [...this.ledger]
      
      // Filter by date range
      if (startDate) {
        filteredEntries = filteredEntries.filter(entry => 
          new Date(entry.timestamp) >= new Date(startDate)
        )
      }
      
      if (endDate) {
        filteredEntries = filteredEntries.filter(entry => 
          new Date(entry.timestamp) <= new Date(endDate)
        )
      }
      
      if (format === 'csv') {
        // Generate CSV
        const csvHeader = 'ID,Action,Key,Old Value,New Value,User ID,Timestamp,IP,User Agent\n'
        const csvRows = filteredEntries.map(entry => 
          `"${entry.id}","${entry.action}","${entry.key}","${entry.oldValue}","${entry.newValue}","${entry.userId}","${entry.timestamp}","${entry.ip}","${entry.userAgent}"`
        ).join('\n')
        
        res.setHeader('Content-Type', 'text/csv')
        res.setHeader('Content-Disposition', 'attachment; filename="governance-ledger.csv"')
        res.send(csvHeader + csvRows)
      } else {
        // Return JSON
        res.json({
          success: true,
          entries: filteredEntries,
          total: filteredEntries.length,
          exportDate: new Date().toISOString(),
          format: 'json'
        })
      }
    } catch (error) {
      console.error('Error exporting ledger:', error)
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      })
    }
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

module.exports = GovernanceAPI
