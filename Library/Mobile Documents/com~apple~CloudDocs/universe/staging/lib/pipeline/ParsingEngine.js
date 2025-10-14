// Parsing Engine - V12.0 Multi-Method Event Extraction System
/**
 * Implements parsing hierarchy: P1 (API/RSS/Static) → P2 (Cloud) → P3 (Puppeteer)
 * Handles pagination logic and data extraction
 */

class ParsingEngine {
  constructor() {
    this.parsers = {
      // P1: Standard Libraries
      api: require('./parsers/ApiParser'),
      rss: require('./parsers/RssParser'),
      static: require('./parsers/StaticParser'),
      
      // P2: Cloud Services
      cloud: require('./parsers/CloudParser'),
      
      // P3: Specialized Libraries (requires justification)
      puppeteer: require('./parsers/PuppeteerParser')
    }
    
    this.paginationStrategies = {
      'parameter_based': {
        name: 'Parameter-Based Pagination',
        description: 'Uses URL parameters like ?page=1&limit=50',
        examples: ['?page=1', '?offset=0', '?start=0&count=50']
      },
      
      'next_button': {
        name: 'Next Button Pagination',
        description: 'DOM-based pagination with next/previous buttons',
        selectors: ['.next', '.pagination-next', '[data-next]', 'a[rel="next"]']
      },
      
      'api_cursor': {
        name: 'API Cursor Pagination',
        description: 'RESTful API with cursor-based pagination',
        examples: ['?cursor=abc123', '?after=timestamp', '?since=id']
      },
      
      'sitemap_based': {
        name: 'Sitemap-Based Discovery',
        description: 'XML sitemap parsing for comprehensive discovery',
        endpoints: ['/sitemap.xml', '/sitemap_index.xml', '/robots.txt']
      }
    }
    
    this.extractionPatterns = {
      event: {
        selectors: [
          '.event',
          '.event-item',
          '.calendar-event',
          '[data-event]',
          '.event-card',
          '.event-listing'
        ],
        attributes: ['data-event-id', 'data-event', 'id']
      },
      
      title: {
        selectors: [
          '.event-title',
          '.event-name',
          'h1', 'h2', 'h3',
          '.title',
          '[data-title]'
        ],
        attributes: ['data-title', 'title']
      },
      
      date: {
        selectors: [
          '.event-date',
          '.date',
          '.datetime',
          'time',
          '[data-date]',
          '[data-datetime]'
        ],
        attributes: ['data-date', 'data-datetime', 'datetime']
      },
      
      location: {
        selectors: [
          '.event-location',
          '.venue',
          '.location',
          '.address',
          '[data-location]',
          '[data-venue]'
        ],
        attributes: ['data-location', 'data-venue', 'data-address']
      },
      
      description: {
        selectors: [
          '.event-description',
          '.description',
          '.summary',
          '.content',
          '[data-description]'
        ],
        attributes: ['data-description']
      }
    }
  }

  /**
   * Initialize the parsing engine
   */
  async initialize() {
    console.log('🔧 Initializing Parsing Engine...')
    
    // Initialize all parsers
    for (const [name, parser] of Object.entries(this.parsers)) {
      if (parser && typeof parser.initialize === 'function') {
        await parser.initialize()
      }
    }
    
    console.log('✅ Parsing Engine initialized')
  }

  /**
   * Extract events from a URL using the specified strategy
   * @param {string} url - URL to extract events from
   * @param {Object} strategy - Parsing strategy
   * @returns {Array} Array of extracted events
   */
  async extractEvents(url, strategy) {
    console.log(`🔍 Extracting events from: ${url}`)
    console.log(`📋 Using strategy: ${strategy.method} (${strategy.priority})`)
    
    try {
      // Get the appropriate parser
      const parser = this.getParser(strategy.method)
      
      if (!parser) {
        throw new Error(`No parser available for method: ${strategy.method}`)
      }
      
      // Extract events using the parser
      const rawEvents = await parser.extract(url, {
        strategy: strategy,
        pagination: this.detectPaginationStrategy(url),
        patterns: this.extractionPatterns
      })
      
      console.log(`📥 Extracted ${rawEvents.length} raw events`)
      
      // Validate extracted events
      const validatedEvents = this.validateExtractedEvents(rawEvents)
      
      console.log(`✅ Validated ${validatedEvents.length} events`)
      
      return validatedEvents
      
    } catch (error) {
      console.error(`❌ Event extraction failed:`, error.message)
      
      // Try fallback strategy if available
      if (strategy.method !== 'static') {
        console.log('🔄 Attempting fallback to static parsing...')
        return await this.extractEvents(url, { method: 'static', priority: 'P1' })
      }
      
      throw error
    }
  }

  /**
   * Get the appropriate parser for a method
   * @param {string} method - Parsing method
   * @returns {Object} Parser instance
   */
  getParser(method) {
    const parser = this.parsers[method]
    
    if (!parser) {
      throw new Error(`Unknown parsing method: ${method}`)
    }
    
    return parser
  }

  /**
   * Detect pagination strategy for a URL
   * @param {string} url - URL to analyze
   * @returns {Object} Pagination strategy
   */
  detectPaginationStrategy(url) {
    // Check for parameter-based pagination
    if (url.includes('?page=') || url.includes('?offset=') || url.includes('?start=')) {
      return {
        type: 'parameter_based',
        strategy: this.paginationStrategies.parameter_based
      }
    }
    
    // Check for API cursor pagination
    if (url.includes('?cursor=') || url.includes('?after=') || url.includes('?since=')) {
      return {
        type: 'api_cursor',
        strategy: this.paginationStrategies.api_cursor
      }
    }
    
    // Default to next button pagination
    return {
      type: 'next_button',
      strategy: this.paginationStrategies.next_button
    }
  }

  /**
   * Validate extracted events
   * @param {Array} events - Raw extracted events
   * @returns {Array} Validated events
   */
  validateExtractedEvents(events) {
    return events.filter(event => {
      // Basic validation - must have title and date
      return event.title && event.date && event.title.trim().length > 0
    }).map(event => ({
      ...event,
      id: this.generateEventId(event),
      extractedAt: new Date().toISOString(),
      source: 'parsing_engine'
    }))
  }

  /**
   * Generate unique ID for an event
   * @param {Object} event - Event object
   * @returns {string} Unique event ID
   */
  generateEventId(event) {
    const title = event.title || ''
    const date = event.date || ''
    const location = event.location || ''
    
    // Create a hash-like ID from event properties
    const idString = `${title}-${date}-${location}`.toLowerCase()
    return Buffer.from(idString).toString('base64').substring(0, 16)
  }

  /**
   * Get parsing statistics
   * @returns {Object} Parsing statistics
   */
  getStatistics() {
    return {
      totalExtractions: 0, // Would be tracked in real implementation
      successfulExtractions: 0,
      failedExtractions: 0,
      averageEventsPerExtraction: 0,
      methodUsage: {
        api: 0,
        rss: 0,
        static: 0,
        cloud: 0,
        puppeteer: 0
      },
      lastUpdated: new Date().toISOString()
    }
  }
}

module.exports = ParsingEngine

