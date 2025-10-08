// Ledger Schema - V12.0 Data Model
const ledgerSchema = {
  id: {
    type: 'string',
    required: true,
    format: 'uuid',
    description: 'Unique ledger entry identifier'
  },
  transactionType: {
    type: 'string',
    required: true,
    enum: ['EVENT_CREATED', 'EVENT_APPROVED', 'EVENT_REJECTED', 'EVENT_MODIFIED', 'AGENT_ACTION', 'SYSTEM_EVENT', 'CONFIG_CHANGE', 'HEALTH_ALERT'],
    description: 'Type of transaction'
  },
  entityType: {
    type: 'string',
    required: true,
    enum: ['EVENT', 'AGENT', 'SYSTEM', 'CONFIG', 'HEALTH'],
    description: 'Type of entity affected'
  },
  entityId: {
    type: 'string',
    required: true,
    description: 'ID of the affected entity'
  },
  agentId: {
    type: 'string',
    description: 'ID of the agent who performed the action'
  },
  action: {
    type: 'string',
    required: true,
    description: 'Description of the action performed'
  },
  details: {
    type: 'object',
    description: 'Additional transaction details'
  },
  severity: {
    type: 'string',
    required: true,
    enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
    default: 'LOW',
    description: 'Transaction severity level'
  },
  status: {
    type: 'string',
    required: true,
    enum: ['SUCCESS', 'FAILED', 'PENDING', 'ROLLED_BACK'],
    default: 'SUCCESS',
    description: 'Transaction status'
  },
  timestamp: {
    type: 'string',
    required: true,
    format: 'date-time',
    description: 'Transaction timestamp'
  },
  metadata: {
    type: 'object',
    properties: {
      ipAddress: { type: 'string' },
      userAgent: { type: 'string' },
      sessionId: { type: 'string' },
      requestId: { type: 'string' }
    },
    description: 'Additional metadata'
  },
  auditTrail: {
    type: 'array',
    items: {
      type: 'object',
      properties: {
        action: { type: 'string' },
        timestamp: { type: 'string', format: 'date-time' },
        agentId: { type: 'string' },
        details: { type: 'object' }
      },
      required: ['action', 'timestamp']
    },
    description: 'Audit trail for the transaction'
  }
}

// Ledger validation function
function validateLedgerEntry(entry) {
  const errors = []
  
  // Required fields check
  const requiredFields = ['id', 'transactionType', 'entityType', 'entityId', 'action', 'severity', 'status', 'timestamp']
  requiredFields.forEach(field => {
    if (!entry[field]) {
      errors.push(`Missing required field: ${field}`)
    }
  })
  
  // Type validation
  if (entry.transactionType && !['EVENT_CREATED', 'EVENT_APPROVED', 'EVENT_REJECTED', 'EVENT_MODIFIED', 'AGENT_ACTION', 'SYSTEM_EVENT', 'CONFIG_CHANGE', 'HEALTH_ALERT'].includes(entry.transactionType)) {
    errors.push('transactionType must be one of: EVENT_CREATED, EVENT_APPROVED, EVENT_REJECTED, EVENT_MODIFIED, AGENT_ACTION, SYSTEM_EVENT, CONFIG_CHANGE, HEALTH_ALERT')
  }
  
  if (entry.entityType && !['EVENT', 'AGENT', 'SYSTEM', 'CONFIG', 'HEALTH'].includes(entry.entityType)) {
    errors.push('entityType must be one of: EVENT, AGENT, SYSTEM, CONFIG, HEALTH')
  }
  
  if (entry.severity && !['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].includes(entry.severity)) {
    errors.push('severity must be one of: LOW, MEDIUM, HIGH, CRITICAL')
  }
  
  if (entry.status && !['SUCCESS', 'FAILED', 'PENDING', 'ROLLED_BACK'].includes(entry.status)) {
    errors.push('status must be one of: SUCCESS, FAILED, PENDING, ROLLED_BACK')
  }
  
  if (entry.timestamp && !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(entry.timestamp)) {
    errors.push('timestamp must be in ISO 8601 format')
  }
  
  return {
    valid: errors.length === 0,
    errors
  }
}

// Ledger query functions
function createLedgerEntry(transactionType, entityType, entityId, action, agentId = null, details = {}) {
  return {
    id: `ledger_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    transactionType,
    entityType,
    entityId,
    agentId,
    action,
    details,
    severity: 'LOW',
    status: 'SUCCESS',
    timestamp: new Date().toISOString(),
    metadata: {},
    auditTrail: []
  }
}

function addAuditTrail(entry, action, agentId = null, details = {}) {
  if (!entry.auditTrail) {
    entry.auditTrail = []
  }
  
  entry.auditTrail.push({
    action,
    timestamp: new Date().toISOString(),
    agentId,
    details
  })
  
  return entry
}

module.exports = {
  ledgerSchema,
  validateLedgerEntry,
  createLedgerEntry,
  addAuditTrail
}
