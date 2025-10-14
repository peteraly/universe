// Quality Assurance - V12.0 Data Quality Validation System
/**
 * Measures Normalization QA Target (>=95%) before writing
 * Validates data completeness, schema compliance, and quality metrics
 */

class QualityAssurance {
  constructor(targets = {}) {
    this.targets = {
      normalizationAccuracy: 0.95,
      dataCompleteness: 0.90,
      schemaCompliance: 1.00,
      duplicateRate: 0.02,
      processingTime: 30000,
      ...targets
    }
    
    this.schema = {
      required: ['id', 'title', 'date'],
      optional: ['endDate', 'location', 'description', 'url', 'price', 'category', 'image'],
      types: {
        id: 'string',
        title: 'string',
        date: 'string',
        endDate: 'string',
        location: 'object',
        description: 'string',
        url: 'string',
        price: 'object',
        category: 'string',
        image: 'string'
      },
      constraints: {
        title: { minLength: 1, maxLength: 200 },
        description: { maxLength: 2000 },
        date: { format: 'ISO 8601' }
      }
    }
    
    this.qualityMetrics = {
      totalEvents: 0,
      validEvents: 0,
      invalidEvents: 0,
      duplicateEvents: 0,
      incompleteEvents: 0,
      schemaViolations: 0
    }
  }

  /**
   * Initialize the quality assurance system
   */
  async initialize() {
    console.log('🔧 Initializing Quality Assurance...')
    console.log('✅ Quality Assurance initialized')
  }

  /**
   * Validate events and calculate quality scores
   * @param {Array} events - Events to validate
   * @returns {Object} Quality validation results
   */
  async validateEvents(events) {
    console.log(`🔍 Validating ${events.length} events for quality...`)
    
    const results = {
      events: events,
      validEvents: [],
      invalidEvents: [],
      duplicateEvents: [],
      qualityScores: {},
      overallScore: 0,
      meetsTargets: false
    }
    
    // Reset metrics
    this.qualityMetrics.totalEvents = events.length
    this.qualityMetrics.validEvents = 0
    this.qualityMetrics.invalidEvents = 0
    this.qualityMetrics.duplicateEvents = 0
    this.qualityMetrics.incompleteEvents = 0
    this.qualityMetrics.schemaViolations = 0
    
    // Validate each event
    for (const event of events) {
      const validation = await this.validateEvent(event)
      
      if (validation.isValid) {
        results.validEvents.push(event)
        this.qualityMetrics.validEvents++
      } else {
        results.invalidEvents.push({
          event: event,
          errors: validation.errors
        })
        this.qualityMetrics.invalidEvents++
      }
      
      // Check for duplicates
      if (this.isDuplicate(event, results.validEvents)) {
        results.duplicateEvents.push(event)
        this.qualityMetrics.duplicateEvents++
      }
    }
    
    // Calculate quality scores
    results.qualityScores = this.calculateQualityScores(results)
    results.overallScore = this.calculateOverallScore(results.qualityScores)
    results.meetsTargets = this.checkTargets(results.qualityScores)
    
    console.log(`📊 Quality Validation Results:`)
    console.log(`   Valid Events: ${results.validEvents.length}`)
    console.log(`   Invalid Events: ${results.invalidEvents.length}`)
    console.log(`   Duplicate Events: ${results.duplicateEvents.length}`)
    console.log(`   Overall Score: ${(results.overallScore * 100).toFixed(1)}%`)
    console.log(`   Meets Targets: ${results.meetsTargets ? '✅' : '❌'}`)
    
    return results
  }

  /**
   * Validate individual event
   * @param {Object} event - Event to validate
   * @returns {Object} Validation result
   */
  async validateEvent(event) {
    const errors = []
    
    // Required fields validation
    for (const field of this.schema.required) {
      if (!event[field] || (typeof event[field] === 'string' && event[field].trim().length === 0)) {
        errors.push(`Missing required field: ${field}`)
        this.qualityMetrics.schemaViolations++
      }
    }
    
    // Type validation
    for (const [field, expectedType] of Object.entries(this.schema.types)) {
      if (event[field] !== undefined && !this.validateType(event[field], expectedType)) {
        errors.push(`Invalid type for ${field}: expected ${expectedType}`)
        this.qualityMetrics.schemaViolations++
      }
    }
    
    // Constraint validation
    for (const [field, constraints] of Object.entries(this.schema.constraints)) {
      if (event[field] && !this.validateConstraints(event[field], constraints)) {
        errors.push(`Constraint violation for ${field}`)
        this.qualityMetrics.schemaViolations++
      }
    }
    
    // Date format validation
    if (event.date && !this.isValidISODate(event.date)) {
      errors.push('Invalid date format')
      this.qualityMetrics.schemaViolations++
    }
    
    // URL validation
    if (event.url && !this.isValidURL(event.url)) {
      errors.push('Invalid URL format')
      this.qualityMetrics.schemaViolations++
    }
    
    return {
      isValid: errors.length === 0,
      errors: errors
    }
  }

  /**
   * Validate field type
   * @param {*} value - Value to validate
   * @param {string} expectedType - Expected type
   * @returns {boolean} Is valid type
   */
  validateType(value, expectedType) {
    switch (expectedType) {
      case 'string':
        return typeof value === 'string'
      case 'object':
        return typeof value === 'object' && value !== null
      case 'number':
        return typeof value === 'number'
      case 'boolean':
        return typeof value === 'boolean'
      default:
        return true
    }
  }

  /**
   * Validate field constraints
   * @param {*} value - Value to validate
   * @param {Object} constraints - Constraints to check
   * @returns {boolean} Meets constraints
   */
  validateConstraints(value, constraints) {
    if (typeof value === 'string') {
      if (constraints.minLength && value.length < constraints.minLength) {
        return false
      }
      if (constraints.maxLength && value.length > constraints.maxLength) {
        return false
      }
    }
    
    if (constraints.format === 'ISO 8601' && !this.isValidISODate(value)) {
      return false
    }
    
    return true
  }

  /**
   * Check if date is valid ISO format
   * @param {string} dateString - Date string
   * @returns {boolean} Is valid ISO date
   */
  isValidISODate(dateString) {
    const date = new Date(dateString)
    return date instanceof Date && !isNaN(date.getTime())
  }

  /**
   * Check if URL is valid
   * @param {string} url - URL string
   * @returns {boolean} Is valid URL
   */
  isValidURL(url) {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }

  /**
   * Check if event is duplicate
   * @param {Object} event - Event to check
   * @param {Array} existingEvents - Existing events
   * @returns {boolean} Is duplicate
   */
  isDuplicate(event, existingEvents) {
    return existingEvents.some(existing => 
      existing.title === event.title && 
      existing.date === event.date &&
      existing.location?.venue === event.location?.venue
    )
  }

  /**
   * Calculate quality scores
   * @param {Object} results - Validation results
   * @returns {Object} Quality scores
   */
  calculateQualityScores(results) {
    const total = results.events.length
    const valid = results.validEvents.length
    const duplicates = results.duplicateEvents.length
    
    return {
      dataCompleteness: valid / total,
      schemaCompliance: (valid - results.invalidEvents.length) / total,
      duplicateRate: duplicates / total,
      normalizationAccuracy: this.calculateNormalizationAccuracy(results)
    }
  }

  /**
   * Calculate normalization accuracy
   * @param {Object} results - Validation results
   * @returns {number} Normalization accuracy score
   */
  calculateNormalizationAccuracy(results) {
    let accuracyScore = 0
    let totalFields = 0
    
    for (const event of results.validEvents) {
      const fields = Object.keys(event)
      totalFields += fields.length
      
      for (const field of fields) {
        if (event[field] && this.isWellFormatted(event[field], field)) {
          accuracyScore++
        }
      }
    }
    
    return totalFields > 0 ? accuracyScore / totalFields : 0
  }

  /**
   * Check if field value is well formatted
   * @param {*} value - Field value
   * @param {string} field - Field name
   * @returns {boolean} Is well formatted
   */
  isWellFormatted(value, field) {
    switch (field) {
      case 'title':
        return typeof value === 'string' && value.trim().length > 0
      case 'date':
        return this.isValidISODate(value)
      case 'location':
        return typeof value === 'object' && value.venue
      case 'price':
        return typeof value === 'object' && (value.amount !== undefined || value.type)
      case 'url':
        return this.isValidURL(value)
      default:
        return value !== null && value !== undefined
    }
  }

  /**
   * Calculate overall quality score
   * @param {Object} scores - Individual quality scores
   * @returns {number} Overall score (0-1)
   */
  calculateOverallScore(scores) {
    const weights = {
      dataCompleteness: 0.3,
      schemaCompliance: 0.3,
      normalizationAccuracy: 0.3,
      duplicateRate: 0.1
    }
    
    let weightedSum = 0
    let totalWeight = 0
    
    for (const [metric, score] of Object.entries(scores)) {
      if (weights[metric]) {
        // For duplicate rate, lower is better
        const adjustedScore = metric === 'duplicateRate' ? 1 - score : score
        weightedSum += adjustedScore * weights[metric]
        totalWeight += weights[metric]
      }
    }
    
    return totalWeight > 0 ? weightedSum / totalWeight : 0
  }

  /**
   * Check if quality scores meet targets
   * @param {Object} scores - Quality scores
   * @returns {boolean} Meets all targets
   */
  checkTargets(scores) {
    return (
      scores.dataCompleteness >= this.targets.dataCompleteness &&
      scores.schemaCompliance >= this.targets.schemaCompliance &&
      scores.normalizationAccuracy >= this.targets.normalizationAccuracy &&
      scores.duplicateRate <= this.targets.duplicateRate
    )
  }

  /**
   * Generate quality report
   * @param {Object} results - Validation results
   * @returns {Object} Quality report
   */
  generateQualityReport(results) {
    return {
      timestamp: new Date().toISOString(),
      summary: {
        totalEvents: results.events.length,
        validEvents: results.validEvents.length,
        invalidEvents: results.invalidEvents.length,
        duplicateEvents: results.duplicateEvents.length,
        overallScore: results.overallScore,
        meetsTargets: results.meetsTargets
      },
      qualityScores: results.qualityScores,
      targets: this.targets,
      recommendations: this.generateRecommendations(results),
      metrics: this.qualityMetrics
    }
  }

  /**
   * Generate quality improvement recommendations
   * @param {Object} results - Validation results
   * @returns {Array} Recommendations
   */
  generateRecommendations(results) {
    const recommendations = []
    
    if (results.qualityScores.dataCompleteness < this.targets.dataCompleteness) {
      recommendations.push({
        type: 'data_completeness',
        priority: 'high',
        message: 'Data completeness below target. Review extraction patterns.',
        score: results.qualityScores.dataCompleteness,
        target: this.targets.dataCompleteness
      })
    }
    
    if (results.qualityScores.schemaCompliance < this.targets.schemaCompliance) {
      recommendations.push({
        type: 'schema_compliance',
        priority: 'high',
        message: 'Schema compliance below target. Review validation rules.',
        score: results.qualityScores.schemaCompliance,
        target: this.targets.schemaCompliance
      })
    }
    
    if (results.qualityScores.normalizationAccuracy < this.targets.normalizationAccuracy) {
      recommendations.push({
        type: 'normalization_accuracy',
        priority: 'medium',
        message: 'Normalization accuracy below target. Review transformation rules.',
        score: results.qualityScores.normalizationAccuracy,
        target: this.targets.normalizationAccuracy
      })
    }
    
    if (results.qualityScores.duplicateRate > this.targets.duplicateRate) {
      recommendations.push({
        type: 'duplicate_rate',
        priority: 'medium',
        message: 'Duplicate rate above target. Improve deduplication logic.',
        score: results.qualityScores.duplicateRate,
        target: this.targets.duplicateRate
      })
    }
    
    return recommendations
  }

  /**
   * Get quality assurance statistics
   * @returns {Object} QA statistics
   */
  getStatistics() {
    return {
      totalEventsValidated: this.qualityMetrics.totalEvents,
      validEvents: this.qualityMetrics.validEvents,
      invalidEvents: this.qualityMetrics.invalidEvents,
      duplicateEvents: this.qualityMetrics.duplicateEvents,
      schemaViolations: this.qualityMetrics.schemaViolations,
      successRate: this.qualityMetrics.totalEvents > 0 
        ? this.qualityMetrics.validEvents / this.qualityMetrics.totalEvents 
        : 0,
      lastUpdated: new Date().toISOString()
    }
  }
}

module.exports = QualityAssurance

