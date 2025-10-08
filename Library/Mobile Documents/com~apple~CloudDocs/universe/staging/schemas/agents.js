// Agents Schema - V12.0 Data Model
const agentsSchema = {
  // Core agent fields
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
    enum: ['curation', 'classification', 'quality_assurance', 'health_monitoring', 'intelligence'],
    description: 'Agent type'
  },
  status: {
    type: 'string',
    required: true,
    enum: ['active', 'inactive', 'maintenance', 'error'],
    description: 'Agent operational status'
  },
  
  // Configuration fields
  config: {
    type: 'object',
    required: true,
    properties: {
      version: { type: 'string' },
      parameters: { type: 'object' },
      thresholds: { type: 'object' },
      enabled: { type: 'boolean' }
    },
    description: 'Agent configuration'
  },
  
  // Performance metrics
  metrics: {
    type: 'object',
    properties: {
      totalTasks: { type: 'number', minimum: 0 },
      successfulTasks: { type: 'number', minimum: 0 },
      failedTasks: { type: 'number', minimum: 0 },
      averageProcessingTime: { type: 'number', minimum: 0 },
      lastActivity: { type: 'string', format: 'date-time' },
      uptime: { type: 'number', minimum: 0 }
    },
    description: 'Agent performance metrics'
  },
  
  // Health monitoring
  health: {
    type: 'object',
    properties: {
      status: { type: 'string', enum: ['healthy', 'warning', 'critical', 'unknown'] },
      lastCheck: { type: 'string', format: 'date-time' },
      checks: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            status: { type: 'string', enum: ['pass', 'fail', 'warning'] },
            message: { type: 'string' },
            timestamp: { type: 'string', format: 'date-time' }
          }
        }
      }
    },
    description: 'Agent health status'
  },
  
  // Metadata
  createdAt: {
    type: 'string',
    required: true,
    format: 'date-time',
    description: 'Agent creation timestamp'
  },
  updatedAt: {
    type: 'string',
    format: 'date-time',
    description: 'Last update timestamp'
  },
  createdBy: {
    type: 'string',
    description: 'User who created the agent'
  },
  
  // Optional fields
  description: {
    type: 'string',
    maxLength: 500,
    description: 'Agent description'
  },
  tags: {
    type: 'array',
    items: { type: 'string' },
    description: 'Agent tags'
  },
  dependencies: {
    type: 'array',
    items: { type: 'string' },
    description: 'Agent dependencies'
  }
}

// Validation function
function validateAgent(agent) {
  const errors = []
  
  // Required field validation
  const requiredFields = ['id', 'name', 'type', 'status', 'config', 'createdAt']
  requiredFields.forEach(field => {
    if (!agent[field]) {
      errors.push(`Missing required field: ${field}`)
    }
  })
  
  // Type validation
  const validTypes = ['curation', 'classification', 'quality_assurance', 'health_monitoring', 'intelligence']
  if (agent.type && !validTypes.includes(agent.type)) {
    errors.push(`type must be one of: ${validTypes.join(', ')}`)
  }
  
  // Status validation
  const validStatuses = ['active', 'inactive', 'maintenance', 'error']
  if (agent.status && !validStatuses.includes(agent.status)) {
    errors.push(`status must be one of: ${validStatuses.join(', ')}`)
  }
  
  // Config validation
  if (agent.config && typeof agent.config !== 'object') {
    errors.push('config must be an object')
  }
  
  // Metrics validation
  if (agent.metrics) {
    const metricFields = ['totalTasks', 'successfulTasks', 'failedTasks', 'averageProcessingTime', 'uptime']
    metricFields.forEach(field => {
      if (agent.metrics[field] !== undefined && (typeof agent.metrics[field] !== 'number' || agent.metrics[field] < 0)) {
        errors.push(`metrics.${field} must be a non-negative number`)
      }
    })
  }
  
  // Health validation
  if (agent.health) {
    const validHealthStatuses = ['healthy', 'warning', 'critical', 'unknown']
    if (agent.health.status && !validHealthStatuses.includes(agent.health.status)) {
      errors.push(`health.status must be one of: ${validHealthStatuses.join(', ')}`)
    }
  }
  
  return {
    valid: errors.length === 0,
    errors
  }
}

module.exports = {
  agentsSchema,
  validateAgent
}
