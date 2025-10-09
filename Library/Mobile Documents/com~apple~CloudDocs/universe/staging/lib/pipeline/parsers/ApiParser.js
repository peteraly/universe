// API Parser - P1 Standard Library Implementation
/**
 * RESTful API event extraction using standard fetch
 * Handles JSON responses and pagination
 */

class ApiParser {
  constructor() {
    this.name = 'API Parser'
    this.priority = 'P1'
    this.description = 'RESTful API endpoints using standard fetch'
    
    this.commonEndpoints = [
      '/api/events',
      '/api/calendar',
      '/events',
      '/calendar',
      '/api/v1/events',
      '/api/v2/events'
    ]
    
    this.paginationPatterns = {
      parameter: ['page', 'offset', 'start', 'limit', 'count'],
      cursor: ['cursor', 'after', 'since', 'before'],
      header: ['Link', 'X-Total-Count', 'X-Page-Count']
    }
  }

  /**
   * Initialize the API parser
   */
  async initialize() {
    console.log('🔧 Initializing API Parser...')
    console.log('✅ API Parser ready')
  }

  /**
   * Extract events from API endpoint
   * @param {string} url - Base URL
   * @param {Object} options - Extraction options
   * @returns {Array} Extracted events
   */
  async extract(url, options = {}) {
    console.log(`🌐 Extracting from API: ${url}`)
    
    try {
      // Try common API endpoints
      const apiUrls = this.generateApiUrls(url)
      
      for (const apiUrl of apiUrls) {
        try {
          const events = await this.fetchFromApi(apiUrl, options)
          if (events && events.length > 0) {
            console.log(`✅ Found ${events.length} events via API`)
            return events
          }
        } catch (error) {
          console.log(`⚠️ API endpoint failed: ${apiUrl} - ${error.message}`)
          continue
        }
      }
      
      throw new Error('No working API endpoints found')
      
    } catch (error) {
      console.error(`❌ API extraction failed:`, error.message)
      throw error
    }
  }

  /**
   * Generate potential API URLs
   * @param {string} baseUrl - Base URL
   * @returns {Array} Array of potential API URLs
   */
  generateApiUrls(baseUrl) {
    const urls = []
    const base = baseUrl.replace(/\/$/, '') // Remove trailing slash
    
    // Add the base URL itself
    urls.push(base)
    
    // Add common API endpoints
    this.commonEndpoints.forEach(endpoint => {
      urls.push(`${base}${endpoint}`)
    })
    
    return urls
  }

  /**
   * Fetch events from a specific API URL
   * @param {string} apiUrl - API URL
   * @param {Object} options - Fetch options
   * @returns {Array} Events array
   */
  async fetchFromApi(apiUrl, options) {
    console.log(`📡 Fetching from: ${apiUrl}`)
    
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (compatible; DiscoveryDialBot/1.0)',
        'Content-Type': 'application/json'
      },
      timeout: 10000
    })
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
    
    const data = await response.json()
    
    // Handle different response formats
    let events = []
    
    if (Array.isArray(data)) {
      events = data
    } else if (data.events && Array.isArray(data.events)) {
      events = data.events
    } else if (data.data && Array.isArray(data.data)) {
      events = data.data
    } else if (data.results && Array.isArray(data.results)) {
      events = data.results
    } else {
      console.log('⚠️ Unexpected API response format')
      return []
    }
    
    // Transform API events to standard format
    return events.map(event => this.transformApiEvent(event))
  }

  /**
   * Transform API event to standard format
   * @param {Object} apiEvent - Raw API event
   * @returns {Object} Standardized event
   */
  transformApiEvent(apiEvent) {
    return {
      title: this.extractField(apiEvent, ['title', 'name', 'event_name', 'event_title']),
      date: this.extractField(apiEvent, ['date', 'start_date', 'datetime', 'start_datetime', 'event_date']),
      endDate: this.extractField(apiEvent, ['end_date', 'end_datetime', 'end_time']),
      location: this.extractField(apiEvent, ['location', 'venue', 'address', 'place', 'event_location']),
      description: this.extractField(apiEvent, ['description', 'summary', 'details', 'content', 'event_description']),
      url: this.extractField(apiEvent, ['url', 'link', 'event_url', 'ticket_url']),
      price: this.extractField(apiEvent, ['price', 'cost', 'ticket_price', 'fee']),
      category: this.extractField(apiEvent, ['category', 'type', 'event_type', 'genre']),
      image: this.extractField(apiEvent, ['image', 'image_url', 'photo', 'thumbnail']),
      raw: apiEvent // Keep original for debugging
    }
  }

  /**
   * Extract field value from object using multiple possible keys
   * @param {Object} obj - Source object
   * @param {Array} keys - Possible keys to try
   * @returns {string|null} Extracted value
   */
  extractField(obj, keys) {
    for (const key of keys) {
      if (obj[key] !== undefined && obj[key] !== null && obj[key] !== '') {
        return String(obj[key]).trim()
      }
    }
    return null
  }

  /**
   * Handle pagination for API endpoints
   * @param {string} baseUrl - Base API URL
   * @param {Object} options - Pagination options
   * @returns {Array} All events from all pages
   */
  async handlePagination(baseUrl, options = {}) {
    console.log(`📄 Handling pagination for: ${baseUrl}`)
    
    const allEvents = []
    let page = 1
    let hasMore = true
    const maxPages = options.maxPages || 10
    
    while (hasMore && page <= maxPages) {
      try {
        const pageUrl = this.addPaginationParams(baseUrl, page)
        const pageEvents = await this.fetchFromApi(pageUrl, options)
        
        if (pageEvents.length === 0) {
          hasMore = false
        } else {
          allEvents.push(...pageEvents)
          page++
        }
        
        // Add delay between requests to be respectful
        await new Promise(resolve => setTimeout(resolve, 1000))
        
      } catch (error) {
        console.log(`⚠️ Pagination failed at page ${page}: ${error.message}`)
        hasMore = false
      }
    }
    
    console.log(`📊 Pagination complete: ${allEvents.length} total events from ${page - 1} pages`)
    return allEvents
  }

  /**
   * Add pagination parameters to URL
   * @param {string} url - Base URL
   * @param {number} page - Page number
   * @returns {string} URL with pagination parameters
   */
  addPaginationParams(url, page) {
    const separator = url.includes('?') ? '&' : '?'
    return `${url}${separator}page=${page}&limit=50`
  }

  /**
   * Get parser statistics
   * @returns {Object} Parser statistics
   */
  getStatistics() {
    return {
      name: this.name,
      priority: this.priority,
      totalRequests: 0, // Would be tracked in real implementation
      successfulRequests: 0,
      failedRequests: 0,
      averageResponseTime: 0,
      lastUsed: new Date().toISOString()
    }
  }
}

module.exports = ApiParser
