// RBAC Module - V12.0 Role-Based Access Control
class RBAC {
  constructor() {
    this.roles = {
      'super_admin': {
        permissions: ['*'],
        description: 'Full system access'
      },
      'admin': {
        permissions: [
          'events:read', 'events:write', 'events:delete',
          'agents:read', 'agents:write',
          'curation:approve', 'curation:reject',
          'health:read', 'config:read'
        ],
        description: 'Administrative access'
      },
      'curator': {
        permissions: [
          'events:read', 'events:write',
          'curation:approve', 'curation:reject',
          'health:read'
        ],
        description: 'Event curation access'
      },
      'agent': {
        permissions: [
          'events:read', 'events:write',
          'health:read'
        ],
        description: 'Agent system access'
      },
      'viewer': {
        permissions: [
          'events:read',
          'health:read'
        ],
        description: 'Read-only access'
      }
    }
    
    this.permissions = {
      'events:read': 'Read events',
      'events:write': 'Create/update events',
      'events:delete': 'Delete events',
      'agents:read': 'Read agent status',
      'agents:write': 'Configure agents',
      'curation:approve': 'Approve events',
      'curation:reject': 'Reject events',
      'health:read': 'View system health',
      'config:read': 'Read configuration',
      'config:write': 'Modify configuration'
    }
    
    this.sessions = new Map()
  }

  /**
   * Create user session with role
   * @param {string} userId - User ID
   * @param {string} role - User role
   * @param {Object} metadata - Session metadata
   * @returns {Object} - Session result
   */
  createSession(userId, role, metadata = {}) {
    if (!this.roles[role]) {
      return {
        success: false,
        error: `Invalid role: ${role}`
      }
    }

    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const session = {
      id: sessionId,
      userId,
      role,
      permissions: this.roles[role].permissions,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
      metadata
    }

    this.sessions.set(sessionId, session)
    
    return {
      success: true,
      sessionId,
      session
    }
  }

  /**
   * Validate session and check permissions
   * @param {string} sessionId - Session ID
   * @param {string} permission - Required permission
   * @returns {Object} - Validation result
   */
  checkPermission(sessionId, permission) {
    const session = this.sessions.get(sessionId)
    
    if (!session) {
      return {
        success: false,
        error: 'Invalid session'
      }
    }

    // Check if session expired
    if (new Date() > new Date(session.expiresAt)) {
      this.sessions.delete(sessionId)
      return {
        success: false,
        error: 'Session expired'
      }
    }

    // Check if user has permission
    const hasPermission = session.permissions.includes('*') || session.permissions.includes(permission)
    
    if (!hasPermission) {
      return {
        success: false,
        error: `Insufficient permissions. Required: ${permission}`,
        userRole: session.role,
        userPermissions: session.permissions
      }
    }

    return {
      success: true,
      session,
      permission
    }
  }

  /**
   * Get user permissions
   * @param {string} sessionId - Session ID
   * @returns {Object} - Permissions result
   */
  getUserPermissions(sessionId) {
    const session = this.sessions.get(sessionId)
    
    if (!session) {
      return {
        success: false,
        error: 'Invalid session'
      }
    }

    return {
      success: true,
      permissions: session.permissions,
      role: session.role
    }
  }

  /**
   * Revoke session
   * @param {string} sessionId - Session ID
   * @returns {Object} - Revocation result
   */
  revokeSession(sessionId) {
    const session = this.sessions.get(sessionId)
    
    if (!session) {
      return {
        success: false,
        error: 'Session not found'
      }
    }

    this.sessions.delete(sessionId)
    
    return {
      success: true,
      message: 'Session revoked'
    }
  }

  /**
   * Get all roles
   * @returns {Object} - Roles result
   */
  getRoles() {
    return {
      success: true,
      roles: Object.keys(this.roles).map(role => ({
        role,
        ...this.roles[role]
      }))
    }
  }

  /**
   * Get all permissions
   * @returns {Object} - Permissions result
   */
  getPermissions() {
    return {
      success: true,
      permissions: this.permissions
    }
  }

  /**
   * Check if role exists
   * @param {string} role - Role to check
   * @returns {boolean} - Role exists
   */
  roleExists(role) {
    return !!this.roles[role]
  }

  /**
   * Get role permissions
   * @param {string} role - Role name
   * @returns {Object} - Role permissions
   */
  getRolePermissions(role) {
    if (!this.roles[role]) {
      return {
        success: false,
        error: `Role not found: ${role}`
      }
    }

    return {
      success: true,
      role,
      permissions: this.roles[role].permissions,
      description: this.roles[role].description
    }
  }

  /**
   * Clean expired sessions
   * @returns {Object} - Cleanup result
   */
  cleanExpiredSessions() {
    const now = new Date()
    let cleaned = 0

    for (const [sessionId, session] of this.sessions.entries()) {
      if (now > new Date(session.expiresAt)) {
        this.sessions.delete(sessionId)
        cleaned++
      }
    }

    return {
      success: true,
      cleaned,
      activeSessions: this.sessions.size
    }
  }
}

module.exports = RBAC
