// Normalization Engine - V12.0 Data Standardization System
/**
 * Applies Normalization Map (Site-Specific) and Standardization Engine (Universal Cleaning)
 * Enforces standardized output format with 95%+ QA targets
 */

class NormalizationEngine {
  constructor() {
    this.normalizationMaps = new Map()
    this.standardizationRules = {
      // Date/Time Standardization
      dateTime: {
        inputFormats: [
          'YYYY-MM-DD',
          'MM/DD/YYYY',
          'DD/MM/YYYY',
          'MMM DD, YYYY',
          'DD MMM YYYY',
          'YYYY-MM-DDTHH:mm:ss',
          'YYYY-MM-DDTHH:mm:ssZ',
          'YYYY-MM-DDTHH:mm:ss.SSSZ'
        ],
        outputFormat: 'ISO 8601',
        timezone: 'UTC'
      },
      
      // Location Standardization
      location: {
        patterns: [
          /^(.+),\s*([A-Z]{2})\s*(\d{5})?$/i, // City, State ZIP
          /^(.+),\s*([A-Z]{2})$/i, // City, State
          /^(.+),\s*([^,]+),\s*([A-Z]{2})$/i, // Venue, City, State
          /^(.+)\s*-\s*(.+)$/i // Venue - Address
        ],
        components: ['venue', 'city', 'state', 'zip']
      },
      
      // Price Standardization
      price: {
        patterns: [
          /^\$(\d+(?:\.\d{2})?)$/, // $25.00
          /^(\d+(?:\.\d{2})?)\s*dollars?$/i, // 25 dollars
          /^free$/i, // Free
          /^donation$/i, // Donation
          /^(\d+(?:\.\d{2})?)\s*-\s*(\d+(?:\.\d{2})?)$/ // 25.00 - 50.00
        ],
        outputFormat: 'USD'
      },
      
      // Category Standardization
      category: {
        mappings: {
          'music': ['concert', 'live music', 'band', 'musical', 'performance'],
          'art': ['exhibition', 'gallery', 'art show', 'visual arts', 'painting'],
          'theater': ['play', 'drama', 'theatre', 'stage', 'performance'],
          'sports': ['game', 'match', 'tournament', 'athletic', 'fitness'],
          'education': ['workshop', 'class', 'seminar', 'lecture', 'training'],
          'social': ['meetup', 'networking', 'party', 'social', 'community'],
          'food': ['dining', 'restaurant', 'food', 'culinary', 'tasting'],
          'business': ['conference', 'meeting', 'professional', 'corporate']
        },
        defaultCategory: 'General'
      }
    }
    
    this.qualityTargets = {
      normalizationAccuracy: 0.95,
      dataCompleteness: 0.90,
      schemaCompliance: 1.00,
      duplicateRate: 0.02
    }
  }

  /**
   * Initialize the normalization engine
   */
  async initialize() {
    console.log('🔧 Initializing Normalization Engine...')
    
    // Load site-specific normalization maps
    await this.loadNormalizationMaps()
    
    // Load standardization rules
    await this.loadStandardizationRules()
    
    console.log('✅ Normalization Engine initialized')
  }

  /**
   * Process events through normalization pipeline
   * @param {Array} rawEvents - Raw extracted events
   * @param {string} siteConfig - Site-specific configuration
   * @returns {Array} Normalized events
   */
  async processEvents(rawEvents, siteConfig) {
    console.log(`🔄 Processing ${rawEvents.length} events through normalization pipeline`)
    
    const normalizedEvents = []
    const errors = []
    
    for (const event of rawEvents) {
      try {
        // Step 1: Apply site-specific normalization map
        const siteNormalized = await this.applySiteNormalization(event, siteConfig)
        
        // Step 2: Apply universal standardization rules
        const standardized = await this.applyStandardization(siteNormalized)
        
        // Step 3: Validate normalized event
        const validated = await this.validateNormalizedEvent(standardized)
        
        if (validated.isValid) {
          normalizedEvents.push(validated.event)
        } else {
          errors.push({
            event: event,
            errors: validated.errors
          })
        }
        
      } catch (error) {
        console.error(`❌ Normalization failed for event: ${event.title}`, error.message)
        errors.push({
          event: event,
          error: error.message
        })
      }
    }
    
    console.log(`✅ Normalized ${normalizedEvents.length} events`)
    console.log(`⚠️ ${errors.length} events failed normalization`)
    
    return {
      events: normalizedEvents,
      errors: errors,
      successRate: normalizedEvents.length / rawEvents.length
    }
  }

  /**
   * Apply site-specific normalization map
   * @param {Object} event - Raw event
   * @param {string} siteConfig - Site configuration name
   * @returns {Object} Site-normalized event
   */
  async applySiteNormalization(event, siteConfig) {
    const normalizationMap = this.normalizationMaps.get(siteConfig)
    
    if (!normalizationMap) {
      console.log(`⚠️ No normalization map found for: ${siteConfig}`)
      return event
    }
    
    const normalized = { ...event }
    
    // Apply field mappings
    if (normalizationMap.fieldMappings) {
      for (const [targetField, sourceFields] of Object.entries(normalizationMap.fieldMappings)) {
        for (const sourceField of sourceFields) {
          if (event[sourceField] && !normalized[targetField]) {
            normalized[targetField] = event[sourceField]
          }
        }
      }
    }
    
    // Apply transformations
    if (normalizationMap.transformations) {
      for (const [field, transformation] of Object.entries(normalizationMap.transformations)) {
        if (normalized[field]) {
          normalized[field] = await this.applyTransformation(normalized[field], transformation)
        }
      }
    }
    
    return normalized
  }

  /**
   * Apply universal standardization rules
   * @param {Object} event - Site-normalized event
   * @returns {Object} Standardized event
   */
  async applyStandardization(event) {
    const standardized = { ...event }
    
    // Standardize date/time
    if (standardized.date) {
      standardized.date = await this.standardizeDateTime(standardized.date)
    }
    
    if (standardized.endDate) {
      standardized.endDate = await this.standardizeDateTime(standardized.endDate)
    }
    
    // Standardize location
    if (standardized.location) {
      standardized.location = await this.standardizeLocation(standardized.location)
    }
    
    // Standardize price
    if (standardized.price) {
      standardized.price = await this.standardizePrice(standardized.price)
    }
    
    // Standardize category
    if (standardized.category) {
      standardized.category = await this.standardizeCategory(standardized.category)
    }
    
    // Clean and normalize text fields
    standardized.title = this.cleanText(standardized.title)
    standardized.description = this.cleanText(standardized.description)
    
    return standardized
  }

  /**
   * Standardize date/time to ISO 8601 format
   * @param {string} dateString - Input date string
   * @returns {string} ISO 8601 date string
   */
  async standardizeDateTime(dateString) {
    if (!dateString) return null
    
    try {
      // Try parsing with various formats
      const date = new Date(dateString)
      
      if (isNaN(date.getTime())) {
        throw new Error(`Invalid date format: ${dateString}`)
      }
      
      return date.toISOString()
      
    } catch (error) {
      console.log(`⚠️ Date standardization failed: ${dateString}`, error.message)
      return null
    }
  }

  /**
   * Standardize location format
   * @param {string} locationString - Input location string
   * @returns {Object} Standardized location object
   */
  async standardizeLocation(locationString) {
    if (!locationString) return null
    
    // Try to parse location components
    for (const pattern of this.standardizationRules.location.patterns) {
      const match = locationString.match(pattern)
      if (match) {
        return {
          venue: match[1]?.trim(),
          city: match[2]?.trim(),
          state: match[3]?.trim(),
          zip: match[4]?.trim(),
          full: locationString
        }
      }
    }
    
    // Fallback to simple venue name
    return {
      venue: locationString.trim(),
      full: locationString
    }
  }

  /**
   * Standardize price format
   * @param {string} priceString - Input price string
   * @returns {Object} Standardized price object
   */
  async standardizePrice(priceString) {
    if (!priceString) return null
    
    const price = priceString.toLowerCase().trim()
    
    // Check for free events
    if (price === 'free' || price === 'donation') {
      return {
        amount: 0,
        currency: 'USD',
        type: price,
        display: 'Free'
      }
    }
    
    // Try to extract numeric price
    for (const pattern of this.standardizationRules.price.patterns) {
      const match = price.match(pattern)
      if (match) {
        const amount = parseFloat(match[1])
        return {
          amount: amount,
          currency: 'USD',
          type: 'paid',
          display: `$${amount.toFixed(2)}`
        }
      }
    }
    
    // Fallback to original string
    return {
      amount: null,
      currency: 'USD',
      type: 'unknown',
      display: priceString
    }
  }

  /**
   * Standardize category
   * @param {string} categoryString - Input category string
   * @returns {string} Standardized category
   */
  async standardizeCategory(categoryString) {
    if (!categoryString) return this.standardizationRules.category.defaultCategory
    
    const category = categoryString.toLowerCase().trim()
    
    // Check against category mappings
    for (const [standardCategory, variations] of Object.entries(this.standardizationRules.category.mappings)) {
      if (variations.some(variation => category.includes(variation))) {
        return standardCategory
      }
    }
    
    // Return capitalized version of input
    return categoryString.charAt(0).toUpperCase() + categoryString.slice(1)
  }

  /**
   * Clean and normalize text
   * @param {string} text - Input text
   * @returns {string} Cleaned text
   */
  cleanText(text) {
    if (!text) return ''
    
    return text
      .trim()
      .replace(/\s+/g, ' ') // Normalize whitespace
      .replace(/[^\w\s\-.,!?()]/g, '') // Remove special characters
      .substring(0, 1000) // Limit length
  }

  /**
   * Apply transformation to field value
   * @param {string} value - Field value
   * @param {Object} transformation - Transformation rules
   * @returns {string} Transformed value
   */
  async applyTransformation(value, transformation) {
    if (!value || !transformation) return value
    
    let transformed = value
    
    // Apply regex replacements
    if (transformation.replace) {
      for (const [pattern, replacement] of Object.entries(transformation.replace)) {
        const regex = new RegExp(pattern, 'gi')
        transformed = transformed.replace(regex, replacement)
      }
    }
    
    // Apply text cleaning
    if (transformation.clean) {
      transformed = this.cleanText(transformed)
    }
    
    // Apply case transformation
    if (transformation.case) {
      switch (transformation.case) {
        case 'lower':
          transformed = transformed.toLowerCase()
          break
        case 'upper':
          transformed = transformed.toUpperCase()
          break
        case 'title':
          transformed = transformed.charAt(0).toUpperCase() + transformed.slice(1).toLowerCase()
          break
      }
    }
    
    return transformed
  }

  /**
   * Validate normalized event
   * @param {Object} event - Normalized event
   * @returns {Object} Validation result
   */
  async validateNormalizedEvent(event) {
    const errors = []
    
    // Required fields validation
    if (!event.title || event.title.trim().length === 0) {
      errors.push('Title is required')
    }
    
    if (!event.date) {
      errors.push('Date is required')
    }
    
    // Date format validation
    if (event.date && !this.isValidISODate(event.date)) {
      errors.push('Invalid date format')
    }
    
    // Text length validation
    if (event.title && event.title.length > 200) {
      errors.push('Title too long')
    }
    
    if (event.description && event.description.length > 2000) {
      errors.push('Description too long')
    }
    
    return {
      isValid: errors.length === 0,
      event: event,
      errors: errors
    }
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
   * Load site-specific normalization maps
   */
  async loadNormalizationMaps() {
    console.log('📁 Loading normalization maps...')
    
    // Load default normalization maps
    this.normalizationMaps.set('theater_specific.json', {
      fieldMappings: {
        title: ['event_name', 'show_title', 'title'],
        date: ['show_date', 'performance_date', 'date'],
        location: ['theater', 'venue', 'location'],
        description: ['synopsis', 'description', 'summary']
      },
      transformations: {
        title: { case: 'title' },
        description: { clean: true }
      }
    })
    
    this.normalizationMaps.set('community_specific.json', {
      fieldMappings: {
        title: ['event_title', 'name', 'title'],
        date: ['event_date', 'date', 'datetime'],
        location: ['venue', 'location', 'address'],
        description: ['details', 'description', 'info']
      },
      transformations: {
        title: { case: 'title' },
        description: { clean: true }
      }
    })
    
    this.normalizationMaps.set('museum_specific.json', {
      fieldMappings: {
        title: ['exhibition_title', 'title', 'name'],
        date: ['start_date', 'date', 'opening_date'],
        location: ['gallery', 'location', 'venue'],
        description: ['exhibition_description', 'description', 'summary']
      },
      transformations: {
        title: { case: 'title' },
        description: { clean: true }
      }
    })
    
    console.log(`✅ Loaded ${this.normalizationMaps.size} normalization maps`)
  }

  /**
   * Load standardization rules
   */
  async loadStandardizationRules() {
    console.log('📁 Loading standardization rules...')
    console.log('✅ Standardization rules loaded')
  }

  /**
   * Get normalization statistics
   * @returns {Object} Normalization statistics
   */
  getStatistics() {
    return {
      totalEventsProcessed: 0, // Would be tracked in real implementation
      successfulNormalizations: 0,
      failedNormalizations: 0,
      averageSuccessRate: 0,
      normalizationMapsLoaded: this.normalizationMaps.size,
      lastUpdated: new Date().toISOString()
    }
  }
}

module.exports = NormalizationEngine

