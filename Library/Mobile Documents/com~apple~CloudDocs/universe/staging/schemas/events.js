// Event Schema - V12.0 Data Model
const eventSchema = {
  id: {
    type: 'string',
    required: true,
    format: 'uuid',
    description: 'Unique event identifier'
  },
  name: {
    type: 'string',
    required: true,
    minLength: 1,
    maxLength: 200,
    description: 'Event name'
  },
  description: {
    type: 'string',
    required: true,
    minLength: 10,
    maxLength: 1000,
    description: 'Event description'
  },
  date: {
    type: 'string',
    required: true,
    format: 'date',
    description: 'Event date (YYYY-MM-DD)'
  },
  time: {
    type: 'string',
    required: true,
    pattern: '^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$',
    description: 'Event time (HH:MM)'
  },
  venue: {
    type: 'string',
    required: true,
    minLength: 1,
    maxLength: 200,
    description: 'Event venue'
  },
  address: {
    type: 'string',
    required: true,
    minLength: 1,
    maxLength: 500,
    description: 'Event address'
  },
  primaryCategory: {
    type: 'string',
    required: true,
    enum: ['Professional', 'Arts/Culture', 'Social/Fun', 'Education'],
    description: 'Primary event category'
  },
  secondaryCategories: {
    type: 'array',
    items: {
      type: 'string',
      enum: ['Professional', 'Arts/Culture', 'Social/Fun', 'Education']
    },
    maxItems: 3,
    description: 'Secondary event categories'
  },
  tags: {
    type: 'array',
    items: {
      type: 'object',
      properties: {
        tag: { type: 'string' },
        confidence: { type: 'number', minimum: 0, maximum: 1 },
        category: { type: 'string' }
      },
      required: ['tag', 'confidence']
    },
    maxItems: 10,
    description: 'Event tags with confidence scores'
  },
  organizer: {
    type: 'string',
    maxLength: 200,
    description: 'Event organizer'
  },
  price: {
    type: 'string',
    default: 'Free',
    description: 'Event price'
  },
  status: {
    type: 'string',
    required: true,
    enum: ['DRAFT', 'PENDING_CURATION', 'APPROVED', 'REJECTED', 'LIVE', 'ARCHIVED'],
    default: 'DRAFT',
    description: 'Event status'
  },
  qualityScore: {
    type: 'number',
    minimum: 0,
    maximum: 1,
    description: 'Event quality score'
  },
  curationHistory: {
    type: 'array',
    items: {
      type: 'object',
      properties: {
        action: { type: 'string', enum: ['approved', 'rejected', 'modified'] },
        curatorId: { type: 'string' },
        timestamp: { type: 'string', format: 'date-time' },
        reason: { type: 'string' }
      },
      required: ['action', 'curatorId', 'timestamp']
    },
    description: 'Event curation history'
  },
  createdAt: {
    type: 'string',
    required: true,
    format: 'date-time',
    description: 'Event creation timestamp'
  },
  updatedAt: {
    type: 'string',
    format: 'date-time',
    description: 'Event last update timestamp'
  }
}

// Event validation function
function validateEvent(event) {
  const errors = []
  
  // Required fields check
  const requiredFields = ['id', 'name', 'description', 'date', 'time', 'venue', 'address', 'primaryCategory', 'status', 'createdAt']
  requiredFields.forEach(field => {
    if (!event[field]) {
      errors.push(`Missing required field: ${field}`)
    }
  })
  
  // Type validation
  if (event.name && typeof event.name !== 'string') {
    errors.push('name must be a string')
  }
  
  if (event.description && typeof event.description !== 'string') {
    errors.push('description must be a string')
  }
  
  if (event.date && !/^\d{4}-\d{2}-\d{2}$/.test(event.date)) {
    errors.push('date must be in YYYY-MM-DD format')
  }
  
  if (event.time && !/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(event.time)) {
    errors.push('time must be in HH:MM format')
  }
  
  if (event.primaryCategory && !['Professional', 'Arts/Culture', 'Social/Fun', 'Education'].includes(event.primaryCategory)) {
    errors.push('primaryCategory must be one of: Professional, Arts/Culture, Social/Fun, Education')
  }
  
  if (event.status && !['DRAFT', 'PENDING_CURATION', 'APPROVED', 'REJECTED', 'LIVE', 'ARCHIVED'].includes(event.status)) {
    errors.push('status must be one of: DRAFT, PENDING_CURATION, APPROVED, REJECTED, LIVE, ARCHIVED')
  }
  
  if (event.qualityScore && (typeof event.qualityScore !== 'number' || event.qualityScore < 0 || event.qualityScore > 1)) {
    errors.push('qualityScore must be a number between 0 and 1')
  }
  
  return {
    valid: errors.length === 0,
    errors
  }
}

module.exports = {
  eventSchema,
  validateEvent
}
