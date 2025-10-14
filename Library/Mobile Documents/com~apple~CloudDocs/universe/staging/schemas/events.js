// Events Schema - V12.0 Data Model
const eventsSchema = {
  // Core event fields
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
    description: 'Event venue name'
  },
  address: {
    type: 'string',
    required: true,
    minLength: 10,
    maxLength: 500,
    description: 'Event address'
  },
  
  // Classification fields
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
      }
    },
    description: 'Event tags with confidence scores'
  },
  
  // Quality and curation fields
  qualityScore: {
    type: 'number',
    minimum: 0,
    maximum: 1,
    description: 'Overall quality score (0-1)'
  },
  status: {
    type: 'string',
    required: true,
    enum: ['pending_curation', 'approved', 'rejected', 'draft', 'archived'],
    description: 'Event curation status'
  },
  curationHistory: {
    type: 'array',
    items: {
      type: 'object',
      properties: {
        action: { type: 'string', enum: ['approved', 'rejected', 'edited'] },
        curatorId: { type: 'string' },
        reason: { type: 'string' },
        timestamp: { type: 'string', format: 'date-time' }
      }
    },
    description: 'Curation action history'
  },
  
  // Metadata fields
  createdAt: {
    type: 'string',
    required: true,
    format: 'date-time',
    description: 'Event creation timestamp'
  },
  updatedAt: {
    type: 'string',
    format: 'date-time',
    description: 'Last update timestamp'
  },
  createdBy: {
    type: 'string',
    description: 'User who created the event'
  },
  
  // Optional fields
  price: {
    type: 'string',
    description: 'Event price information'
  },
  organizer: {
    type: 'string',
    description: 'Event organizer name'
  },
  contact: {
    type: 'string',
    description: 'Contact information'
  },
  capacity: {
    type: 'number',
    minimum: 1,
    description: 'Event capacity'
  },
  registrationUrl: {
    type: 'string',
    format: 'uri',
    description: 'Registration URL'
  }
}

// Validation function
function validateEvent(event) {
  const errors = []
  
  // Required field validation
  const requiredFields = ['id', 'name', 'description', 'date', 'time', 'venue', 'address', 'primaryCategory', 'status', 'createdAt']
  requiredFields.forEach(field => {
    if (!event[field]) {
      errors.push(`Missing required field: ${field}`)
    }
  })
  
  // Type validation
  if (event.qualityScore && (typeof event.qualityScore !== 'number' || event.qualityScore < 0 || event.qualityScore > 1)) {
    errors.push('qualityScore must be a number between 0 and 1')
  }
  
  // Date format validation
  if (event.date && !/^\d{4}-\d{2}-\d{2}$/.test(event.date)) {
    errors.push('date must be in YYYY-MM-DD format')
  }
  
  // Time format validation
  if (event.time && !/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(event.time)) {
    errors.push('time must be in HH:MM format')
  }
  
  // Category validation
  const validCategories = ['Professional', 'Arts/Culture', 'Social/Fun', 'Education']
  if (event.primaryCategory && !validCategories.includes(event.primaryCategory)) {
    errors.push(`primaryCategory must be one of: ${validCategories.join(', ')}`)
  }
  
  // Status validation
  const validStatuses = ['pending_curation', 'approved', 'rejected', 'draft', 'archived']
  if (event.status && !validStatuses.includes(event.status)) {
    errors.push(`status must be one of: ${validStatuses.join(', ')}`)
  }
  
  return {
    valid: errors.length === 0,
    errors
  }
}

module.exports = {
  eventsSchema,
  validateEvent
}

