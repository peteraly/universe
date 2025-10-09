// CTO Mission Control - Role-Based Access Control System
// Enterprise-grade authentication and authorization

export const ROLES = {
  CTO: 'cto',
  ADMIN: 'admin', 
  CURATOR: 'curator',
  VIEWER: 'viewer'
};

export const PERMISSIONS = {
  // Event Management
  CREATE_EVENTS: 'create_events',
  EDIT_EVENTS: 'edit_events',
  DELETE_EVENTS: 'delete_events',
  VIEW_EVENTS: 'view_events',
  
  // System Management
  VIEW_SYSTEM_HEALTH: 'view_system_health',
  INITIATE_ROLLBACK: 'initiate_rollback',
  MANAGE_CONFIG: 'manage_config',
  
  // User Management
  MANAGE_USERS: 'manage_users',
  MANAGE_RBAC: 'manage_rbac',
  
  // Intelligence & Analytics
  VIEW_ANALYTICS: 'view_analytics',
  MANAGE_AI_THRESHOLDS: 'manage_ai_thresholds',
  VIEW_INCIDENTS: 'view_incidents'
};

export const ROLE_PERMISSIONS = {
  [ROLES.CTO]: [
    PERMISSIONS.VIEW_EVENTS,
    PERMISSIONS.VIEW_SYSTEM_HEALTH,
    PERMISSIONS.VIEW_ANALYTICS,
    PERMISSIONS.VIEW_INCIDENTS,
    PERMISSIONS.MANAGE_CONFIG,
    PERMISSIONS.MANAGE_USERS,
    PERMISSIONS.MANAGE_RBAC,
    PERMISSIONS.MANAGE_AI_THRESHOLDS
    // Note: CTO role does NOT have INITIATE_ROLLBACK or DELETE_EVENTS for safety
  ],
  [ROLES.ADMIN]: [
    PERMISSIONS.CREATE_EVENTS,
    PERMISSIONS.EDIT_EVENTS,
    PERMISSIONS.VIEW_EVENTS,
    PERMISSIONS.VIEW_SYSTEM_HEALTH,
    PERMISSIONS.INITIATE_ROLLBACK,
    PERMISSIONS.MANAGE_CONFIG,
    PERMISSIONS.VIEW_ANALYTICS,
    PERMISSIONS.VIEW_INCIDENTS
  ],
  [ROLES.CURATOR]: [
    PERMISSIONS.CREATE_EVENTS,
    PERMISSIONS.EDIT_EVENTS,
    PERMISSIONS.VIEW_EVENTS,
    PERMISSIONS.VIEW_ANALYTICS
  ],
  [ROLES.VIEWER]: [
    PERMISSIONS.VIEW_EVENTS,
    PERMISSIONS.VIEW_ANALYTICS
  ]
};

// Mock user database
export const USERS = {
  'cto@discoverydial.com': {
    id: 'cto-001',
    email: 'cto@discoverydial.com',
    name: 'CTO User',
    role: ROLES.CTO,
    lastLogin: new Date().toISOString(),
    permissions: ROLE_PERMISSIONS[ROLES.CTO]
  },
  'admin@discoverydial.com': {
    id: 'admin-001', 
    email: 'admin@discoverydial.com',
    name: 'Admin User',
    role: ROLES.ADMIN,
    lastLogin: new Date().toISOString(),
    permissions: ROLE_PERMISSIONS[ROLES.ADMIN]
  },
  'curator@discoverydial.com': {
    id: 'curator-001',
    email: 'curator@discoverydial.com', 
    name: 'Curator User',
    role: ROLES.CURATOR,
    lastLogin: new Date().toISOString(),
    permissions: ROLE_PERMISSIONS[ROLES.CURATOR]
  }
};

// Authentication state management
class AuthManager {
  constructor() {
    this.currentUser = null;
    this.isAuthenticated = false;
  }

  login(email, password) {
    // Mock authentication - in production, this would call an API
    const user = USERS[email];
    if (user && password === 'password123') {
      this.currentUser = user;
      this.isAuthenticated = true;
      localStorage.setItem('cto-mission-control-auth', JSON.stringify(user));
      return { success: true, user };
    }
    return { success: false, error: 'Invalid credentials' };
  }

  logout() {
    this.currentUser = null;
    this.isAuthenticated = false;
    localStorage.removeItem('cto-mission-control-auth');
  }

  getCurrentUser() {
    if (!this.currentUser) {
      const stored = localStorage.getItem('cto-mission-control-auth');
      if (stored) {
        this.currentUser = JSON.parse(stored);
        this.isAuthenticated = true;
      }
    }
    return this.currentUser;
  }

  hasPermission(permission) {
    const user = this.getCurrentUser();
    return user && user.permissions.includes(permission);
  }

  hasRole(role) {
    const user = this.getCurrentUser();
    return user && user.role === role;
  }

  isAuthenticated() {
    return this.isAuthenticated || !!this.getCurrentUser();
  }
}

export const authManager = new AuthManager();

// Permission checking utilities
export const can = (permission) => authManager.hasPermission(permission);
export const isRole = (role) => authManager.hasRole(role);
export const getCurrentUser = () => authManager.getCurrentUser();
export const isAuthenticated = () => authManager.isAuthenticated();
