// Agent Schema - V12.0 Data Model
const agentSchema = {
  id: {
    type: 'string',
    required: true,
    format: 'uuid',
    description: 'Unique agent identifier'
  },
  name: {
    type: 'string',
    required: true,
    minLength: 1,
    maxLength: 100,
    description: 'Agent name'
  },
  type: {
    type: 'string',
    required: true,
    enum: ['CURATOR', 'ADMIN', 'SYSTEM', 'AI_ASSISTANT'],
    description: 'Agent type'
  },
  role: {
    type: 'string',
    required: true,
    enum: ['EVENT_CURATOR', 'SYSTEM_ADMIN', 'HEALTH_MONITOR', 'CONFIG_MANAGER', 'AI_DECISION_MAKER'],
    description: 'Agent role'
  },
  permissions: {
    type: 'array',
    items: {
      type: 'string',
      enum: ['READ_EVENTS', 'WRITE_EVENTS', 'APPROVE_EVENTS', 'REJECT_EVENTS', 'MANAGE_CONFIG', 'VIEW_HEALTH', 'MANAGE_AGENTS']
    },
    description: 'Agent permissions'
  },
  status: {
    type: 'string',
    required: true,
    enum: ['ACTIVE', 'INACTIVE', 'SUSPENDED', 'PENDING_APPROVAL'],
    default: 'PENDING_APPROVAL',
    description: 'Agent status'
  },
  capabilities: {
    type: 'object',
    properties: {
      maxEventsPerDay: { type: 'number', minimum: 1, maximum: 1000 },
      canApproveEvents: { type: 'boolean' },
      canRejectEvents: { type: 'boolean' },
      canManageConfig: { type: 'boolean' },
      canViewHealth: { type: 'boolean' },
      canManageAgents: { type: 'boolean' }
    },
    description: 'Agent capabilities'
  },
  performance: {
    type: 'object',
    properties: {
      eventsProcessed: { type: 'number', minimum: 0 },
      approvalRate: { type: 'number', minimum: 0, maximum: 1 },
      averageProcessingTime: { type: 'number', minimum: 0 },
      lastActivity: { type: 'string', format: 'date-time' }
    },
    description: 'Agent performance metrics'
  },
  credentials: {
    type: 'object',
    properties: {
      username: { type: 'string', minLength: 3, maxLength: 50 },
      email: { type: 'string', format: 'email' },
      lastLogin: { type: 'string', format: 'date-time' },
      loginCount: { type: 'number', minimum: 0 }
    },
    description: 'Agent credentials and login info'
  },
  createdAt: {
    type: 'string',
    required: true,
    format: 'date-time',
    description: 'Agent creation timestamp'
  },
  updatedAt: {
    type: 'string',
    format: 'date-time',
    description: 'Agent last update timestamp'
  }
}

// Agent validation function
function validateAgent(agent) {
  const errors = []
  
  // Required fields check
  const requiredFields = ['id', 'name', 'type', 'role', 'status', 'createdAt']
  requiredFields.forEach(field => {
    if (!agent[field]) {
      errors.push(`Missing required field: ${field}`)
    }
  })
  
  // Type validation
  if (agent.name && typeof agent.name !== 'string') {
    errors.push('name must be a string')
  }
  
  if (agent.type && !['CURATOR', 'ADMIN', 'SYSTEM', 'AI_ASSISTANT'].includes(agent.type)) {
    errors.push('type must be one of: CURATOR, ADMIN, SYSTEM, AI_ASSISTANT')
  }
  
  if (agent.role && !['EVENT_CURATOR', 'SYSTEM_ADMIN', 'HEALTH_MONITOR', 'CONFIG_MANAGER', 'AI_DECISION_MAKER'].includes(agent.role)) {
    errors.push('role must be one of: EVENT_CURATOR, SYSTEM_ADMIN, HEALTH_MONITOR, CONFIG_MANAGER, AI_DECISION_MAKER')
  }
  
  if (agent.status && !['ACTIVE', 'INACTIVE', 'SUSPENDED', 'PENDING_APPROVAL'].includes(agent.status)) {
    errors.push('status must be one of: ACTIVE, INACTIVE, SUSPENDED, PENDING_APPROVAL')
  }
  
  if (agent.permissions && Array.isArray(agent.permissions)) {
    const validPermissions = ['READ_EVENTS', 'WRITE_EVENTS', 'APPROVE_EVENTS', 'REJECT_EVENTS', 'MANAGE_CONFIG', 'VIEW_HEALTH', 'MANAGE_AGENTS']
    agent.permissions.forEach(permission => {
      if (!validPermissions.includes(permission)) {
        errors.push(`Invalid permission: ${permission}`)
      }
    })
  }
  
  if (agent.performance && agent.performance.approvalRate && (agent.performance.approvalRate < 0 || agent.performance.approvalRate > 1)) {
    errors.push('approvalRate must be between 0 and 1')
  }
  
  return {
    valid: errors.length === 0,
    errors
  }
}

module.exports = {
  agentSchema,
  validateAgent
}
