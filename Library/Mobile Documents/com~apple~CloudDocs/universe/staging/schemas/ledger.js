// Ledger Schema - V12.0 Data Model
const ledgerSchema = {
  // Core ledger fields
  id: {
    type: 'string',
    required: true,
    format: 'uuid',
    description: 'Unique ledger entry identifier'
  },
  transactionId: {
    type: 'string',
    required: true,
    description: 'Transaction identifier'
  },
  type: {
    type: 'string',
    required: true,
    enum: ['event_created', 'event_approved', 'event_rejected', 'event_updated', 'event_deleted', 'agent_action', 'system_change', 'user_action'],
    description: 'Ledger entry type'
  },
  action: {
    type: 'string',
    required: true,
    minLength: 1,
    maxLength: 100,
    description: 'Action performed'
  },
  
  // Entity references
  entityType: {
    type: 'string',
    required: true,
    enum: ['event', 'agent', 'user', 'system', 'configuration'],
    description: 'Type of entity affected'
  },
  entityId: {
    type: 'string',
    required: true,
    description: 'ID of affected entity'
  },
  
  // Change tracking
  changes: {
    type: 'object',
    properties: {
      before: { type: 'object' },
      after: { type: 'object' },
      fields: { type: 'array', items: { type: 'string' } }
    },
    description: 'Changes made to the entity'
  },
  
  // Metadata
  timestamp: {
    type: 'string',
    required: true,
    format: 'date-time',
    description: 'Transaction timestamp'
  },
  userId: {
    type: 'string',
    description: 'User who performed the action'
  },
  agentId: {
    type: 'string',
    description: 'Agent that performed the action'
  },
  sessionId: {
    type: 'string',
    description: 'Session identifier'
  },
  
  // Audit fields
  ipAddress: {
    type: 'string',
    pattern: '^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$|^[0-9a-fA-F:]+$',
    description: 'IP address of the requester'
  },
  userAgent: {
    type: 'string',
    description: 'User agent string'
  },
  
  // Status and result
  status: {
    type: 'string',
    required: true,
    enum: ['success', 'failure', 'pending', 'cancelled'],
    description: 'Transaction status'
  },
  result: {
    type: 'object',
    properties: {
      success: { type: 'boolean' },
      message: { type: 'string' },
      data: { type: 'object' },
      error: { type: 'string' }
    },
    description: 'Transaction result'
  },
  
  // Optional fields
  reason: {
    type: 'string',
    maxLength: 500,
    description: 'Reason for the action'
  },
  tags: {
    type: 'array',
    items: { type: 'string' },
    description: 'Transaction tags'
  },
  priority: {
    type: 'string',
    enum: ['low', 'medium', 'high', 'critical'],
    description: 'Transaction priority'
  }
}

// Validation function
function validateLedgerEntry(entry) {
  const errors = []
  
  // Required field validation
  const requiredFields = ['id', 'transactionId', 'type', 'action', 'entityType', 'entityId', 'timestamp', 'status']
  requiredFields.forEach(field => {
    if (!entry[field]) {
      errors.push(`Missing required field: ${field}`)
    }
  })
  
  // Type validation
  const validTypes = ['event_created', 'event_approved', 'event_rejected', 'event_updated', 'event_deleted', 'agent_action', 'system_change', 'user_action']
  if (entry.type && !validTypes.includes(entry.type)) {
    errors.push(`type must be one of: ${validTypes.join(', ')}`)
  }
  
  // Entity type validation
  const validEntityTypes = ['event', 'agent', 'user', 'system', 'configuration']
  if (entry.entityType && !validEntityTypes.includes(entry.entityType)) {
    errors.push(`entityType must be one of: ${validEntityTypes.join(', ')}`)
  }
  
  // Status validation
  const validStatuses = ['success', 'failure', 'pending', 'cancelled']
  if (entry.status && !validStatuses.includes(entry.status)) {
    errors.push(`status must be one of: ${validStatuses.join(', ')}`)
  }
  
  // Priority validation
  if (entry.priority) {
    const validPriorities = ['low', 'medium', 'high', 'critical']
    if (!validPriorities.includes(entry.priority)) {
      errors.push(`priority must be one of: ${validPriorities.join(', ')}`)
    }
  }
  
  // IP address validation
  if (entry.ipAddress) {
    const ipv4Regex = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/
    const ipv6Regex = /^[0-9a-fA-F:]+$/
    if (!ipv4Regex.test(entry.ipAddress) && !ipv6Regex.test(entry.ipAddress)) {
      errors.push('ipAddress must be a valid IPv4 or IPv6 address')
    }
  }
  
  return {
    valid: errors.length === 0,
    errors
  }
}

// Query functions
function createLedgerEntry(data) {
  return {
    id: data.id || `ledger_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    transactionId: data.transactionId || `txn_${Date.now()}`,
    type: data.type,
    action: data.action,
    entityType: data.entityType,
    entityId: data.entityId,
    changes: data.changes || {},
    timestamp: data.timestamp || new Date().toISOString(),
    userId: data.userId,
    agentId: data.agentId,
    sessionId: data.sessionId,
    ipAddress: data.ipAddress,
    userAgent: data.userAgent,
    status: data.status || 'success',
    result: data.result || { success: true },
    reason: data.reason,
    tags: data.tags || [],
    priority: data.priority || 'medium'
  }
}

module.exports = {
  ledgerSchema,
  validateLedgerEntry,
  createLedgerEntry
}
