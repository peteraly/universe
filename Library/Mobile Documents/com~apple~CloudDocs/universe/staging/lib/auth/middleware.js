// RBAC Middleware - V12.0 Authentication Middleware
const RBAC = require('./rbac')

class RBACMiddleware {
  constructor() {
    this.rbac = new RBAC()
  }

  /**
   * Authentication middleware
   * @param {string} requiredPermission - Required permission
   * @returns {Function} - Middleware function
   */
  requirePermission(requiredPermission) {
    return (req, res, next) => {
      const sessionId = req.headers['x-session-id'] || req.query.sessionId
      
      if (!sessionId) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required',
          message: 'Session ID missing'
        })
      }

      const permissionCheck = this.rbac.checkPermission(sessionId, requiredPermission)
      
      if (!permissionCheck.success) {
        return res.status(403).json({
          success: false,
          error: permissionCheck.error,
          requiredPermission,
          ...permissionCheck
        })
      }

      // Add session info to request
      req.session = permissionCheck.session
      req.userId = permissionCheck.session.userId
      req.userRole = permissionCheck.session.role
      
      next()
    }
  }

  /**
   * Role-based middleware
   * @param {string|Array} requiredRoles - Required role(s)
   * @returns {Function} - Middleware function
   */
  requireRole(requiredRoles) {
    const roles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles]
    
    return (req, res, next) => {
      const sessionId = req.headers['x-session-id'] || req.query.sessionId
      
      if (!sessionId) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required'
        })
      }

      const session = this.rbac.sessions.get(sessionId)
      
      if (!session) {
        return res.status(401).json({
          success: false,
          error: 'Invalid session'
        })
      }

      if (!roles.includes(session.role)) {
        return res.status(403).json({
          success: false,
          error: `Insufficient role. Required: ${roles.join(' or ')}, Current: ${session.role}`
        })
      }

      req.session = session
      req.userId = session.userId
      req.userRole = session.role
      
      next()
    }
  }

  /**
   * Admin-only middleware
   * @returns {Function} - Middleware function
   */
  requireAdmin() {
    return this.requireRole(['super_admin', 'admin'])
  }

  /**
   * Curator-only middleware
   * @returns {Function} - Middleware function
   */
  requireCurator() {
    return this.requireRole(['super_admin', 'admin', 'curator'])
  }

  /**
   * Agent-only middleware
   * @returns {Function} - Middleware function
   */
  requireAgent() {
    return this.requireRole(['super_admin', 'admin', 'agent'])
  }

  /**
   * Optional authentication middleware
   * @returns {Function} - Middleware function
   */
  optionalAuth() {
    return (req, res, next) => {
      const sessionId = req.headers['x-session-id'] || req.query.sessionId
      
      if (sessionId) {
        const session = this.rbac.sessions.get(sessionId)
        if (session) {
          req.session = session
          req.userId = session.userId
          req.userRole = session.role
        }
      }
      
      next()
    }
  }

  /**
   * Create session endpoint
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async createSession(req, res) {
    try {
      const { userId, role, metadata } = req.body
      
      if (!userId || !role) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields: userId, role'
        })
      }

      const result = this.rbac.createSession(userId, role, metadata)
      res.json(result)
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      })
    }
  }

  /**
   * Revoke session endpoint
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async revokeSession(req, res) {
    try {
      const { sessionId } = req.body
      
      if (!sessionId) {
        return res.status(400).json({
          success: false,
          error: 'Missing required field: sessionId'
        })
      }

      const result = this.rbac.revokeSession(sessionId)
      res.json(result)
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      })
    }
  }

  /**
   * Get user permissions endpoint
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async getUserPermissions(req, res) {
    try {
      const sessionId = req.headers['x-session-id'] || req.query.sessionId
      
      if (!sessionId) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required'
        })
      }

      const result = this.rbac.getUserPermissions(sessionId)
      res.json(result)
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      })
    }
  }

  /**
   * Get roles endpoint
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async getRoles(req, res) {
    try {
      const result = this.rbac.getRoles()
      res.json(result)
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      })
    }
  }

  /**
   * Get permissions endpoint
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async getPermissions(req, res) {
    try {
      const result = this.rbac.getPermissions()
      res.json(result)
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      })
    }
  }
}

module.exports = RBACMiddleware
