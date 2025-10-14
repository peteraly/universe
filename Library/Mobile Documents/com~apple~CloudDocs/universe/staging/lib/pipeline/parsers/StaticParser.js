// Static Parser - P1 Standard Library Implementation
/**
 * Static HTML parsing using standard cheerio library
 * Handles DOM-based event extraction and pagination
 */

class StaticParser {
  constructor() {
    this.name = 'Static Parser'
    this.priority = 'P1'
    this.description = 'Static HTML parsing using standard cheerio'
    
    this.commonSelectors = {
      event: [
        '.event',
        '.event-item',
        '.calendar-event',
        '[data-event]',
        '.event-card',
        '.event-listing',
        '.event-container'
      ],
      
      title: [
        '.event-title',
        '.event-name',
        'h1', 'h2', 'h3',
        '.title',
        '[data-title]',
        '.event-heading'
      ],
      
      date: [
        '.event-date',
        '.date',
        '.datetime',
        'time',
        '[data-date]',
        '[data-datetime]',
        '.event-time'
      ],
      
      location: [
        '.event-location',
        '.venue',
        '.location',
        '.address',
        '[data-location]',
        '[data-venue]',
        '.event-venue'
      ],
      
      description: [
        '.event-description',
        '.description',
        '.summary',
        '.content',
        '[data-description]',
        '.event-details'
      ],
      
      link: [
        'a[href]',
        '.event-link',
        '[data-link]',
        '.more-info'
      ]
    }
    
    this.paginationSelectors = [
      '.next',
      '.pagination-next',
      '[data-next]',
      'a[rel="next"]',
      '.page-next',
      '.load-more'
    ]
  }

  /**
   * Initialize the static parser
   */
  async initialize() {
    console.log('🔧 Initializing Static Parser...')
    console.log('✅ Static Parser ready')
  }

  /**
   * Extract events from static HTML
   * @param {string} url - URL to extract events from
   * @param {Object} options - Extraction options
   * @returns {Array} Extracted events
   */
  async extract(url, options = {}) {
    console.log(`🌐 Extracting from static HTML: ${url}`)
    
    try {
      // Fetch the HTML content
      const html = await this.fetchHtml(url)
      
      // Parse HTML (simplified - in real implementation would use cheerio)
      const parsedHtml = await this.parseHtml(html)
      
      // Extract events from the parsed HTML
      const events = await this.extractEventsFromHtml(parsedHtml, options)
      
      console.log(`📥 Extracted ${events.length} events from static HTML`)
      
      // Handle pagination if needed
      if (options.pagination && options.pagination.type === 'next_button') {
        const paginatedEvents = await this.handlePagination(url, parsedHtml, options)
        events.push(...paginatedEvents)
      }
      
      return events
      
    } catch (error) {
      console.error(`❌ Static HTML extraction failed:`, error.message)
      throw error
    }
  }

  /**
   * Fetch HTML content from URL
   * @param {string} url - URL to fetch
   * @returns {string} HTML content
   */
  async fetchHtml(url) {
    console.log(`📡 Fetching HTML from: ${url}`)
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'User-Agent': 'Mozilla/5.0 (compatible; DiscoveryDialBot/1.0)'
      },
      timeout: 10000
    })
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
    
    const html = await response.text()
    console.log(`📄 Fetched ${html.length} characters of HTML`)
    
    return html
  }

  /**
   * Parse HTML content (simplified - in real implementation would use cheerio)
   * @param {string} html - HTML content
   * @returns {Object} Parsed HTML structure
   */
  async parseHtml(html) {
    console.log('🔍 Parsing HTML content...')
    
    // This is a simplified parser - in real implementation would use cheerio
    const parsed = {
      events: [],
      pagination: null,
      metadata: {
        title: this.extractTitle(html),
        description: this.extractDescription(html)
      }
    }
    
    // Extract events using regex patterns (simplified)
    parsed.events = this.extractEventsWithRegex(html)
    
    // Extract pagination links
    parsed.pagination = this.extractPaginationLinks(html)
    
    console.log(`📊 Parsed ${parsed.events.length} events and ${parsed.pagination?.length || 0} pagination links`)
    
    return parsed
  }

  /**
   * Extract page title
   * @param {string} html - HTML content
   * @returns {string} Page title
   */
  extractTitle(html) {
    const titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i)
    return titleMatch ? titleMatch[1].trim() : ''
  }

  /**
   * Extract page description
   * @param {string} html - HTML content
   * @returns {string} Page description
   */
  extractDescription(html) {
    const descMatch = html.match(/<meta[^>]*name="description"[^>]*content="([^"]*)"[^>]*>/i)
    return descMatch ? descMatch[1].trim() : ''
  }

  /**
   * Extract events using regex patterns (simplified)
   * @param {string} html - HTML content
   * @returns {Array} Extracted events
   */
  extractEventsWithRegex(html) {
    const events = []
    
    // Look for common event patterns
    const eventPatterns = [
      /<div[^>]*class="[^"]*event[^"]*"[^>]*>([\s\S]*?)<\/div>/gi,
      /<article[^>]*class="[^"]*event[^"]*"[^>]*>([\s\S]*?)<\/article>/gi,
      /<li[^>]*class="[^"]*event[^"]*"[^>]*>([\s\S]*?)<\/li>/gi
    ]
    
    for (const pattern of eventPatterns) {
      let match
      while ((match = pattern.exec(html)) !== null) {
        const eventHtml = match[1]
        const event = this.parseEventHtml(eventHtml)
        if (event && event.title) {
          events.push(event)
        }
      }
    }
    
    return events
  }

  /**
   * Parse individual event HTML
   * @param {string} eventHtml - Event HTML content
   * @returns {Object} Parsed event
   */
  parseEventHtml(eventHtml) {
    const event = {}
    
    // Extract title
    const titleMatch = eventHtml.match(/<h[1-6][^>]*>([^<]*)<\/h[1-6]>/i) ||
                      eventHtml.match(/<[^>]*class="[^"]*title[^"]*"[^>]*>([^<]*)<\/[^>]*>/i)
    if (titleMatch) {
      event.title = this.cleanText(titleMatch[1])
    }
    
    // Extract date
    const dateMatch = eventHtml.match(/<time[^>]*>([^<]*)<\/time>/i) ||
                     eventHtml.match(/<[^>]*class="[^"]*date[^"]*"[^>]*>([^<]*)<\/[^>]*>/i)
    if (dateMatch) {
      event.date = this.cleanText(dateMatch[1])
    }
    
    // Extract location
    const locationMatch = eventHtml.match(/<[^>]*class="[^"]*location[^"]*"[^>]*>([^<]*)<\/[^>]*>/i) ||
                         eventHtml.match(/<[^>]*class="[^"]*venue[^"]*"[^>]*>([^<]*)<\/[^>]*>/i)
    if (locationMatch) {
      event.location = this.cleanText(locationMatch[1])
    }
    
    // Extract description
    const descMatch = eventHtml.match(/<[^>]*class="[^"]*description[^"]*"[^>]*>([^<]*)<\/[^>]*>/i) ||
                     eventHtml.match(/<p[^>]*>([^<]*)<\/p>/i)
    if (descMatch) {
      event.description = this.cleanText(descMatch[1])
    }
    
    // Extract link
    const linkMatch = eventHtml.match(/<a[^>]*href="([^"]*)"[^>]*>/i)
    if (linkMatch) {
      event.url = linkMatch[1]
    }
    
    return event
  }

  /**
   * Extract pagination links
   * @param {string} html - HTML content
   * @returns {Array} Pagination links
   */
  extractPaginationLinks(html) {
    const links = []
    
    for (const selector of this.paginationSelectors) {
      const pattern = new RegExp(`<a[^>]*class="[^"]*${selector.replace('.', '')}[^"]*"[^>]*href="([^"]*)"[^>]*>`, 'gi')
      let match
      while ((match = pattern.exec(html)) !== null) {
        links.push({
          url: match[1],
          type: 'next'
        })
      }
    }
    
    return links
  }

  /**
   * Extract events from parsed HTML
   * @param {Object} parsedHtml - Parsed HTML structure
   * @param {Object} options - Extraction options
   * @returns {Array} Extracted events
   */
  async extractEventsFromHtml(parsedHtml, options) {
    const events = []
    
    for (const eventData of parsedHtml.events) {
      const event = this.transformStaticEvent(eventData)
      if (event && event.title) {
        events.push(event)
      }
    }
    
    return events
  }

  /**
   * Transform static event to standard format
   * @param {Object} eventData - Raw event data
   * @returns {Object} Standardized event
   */
  transformStaticEvent(eventData) {
    return {
      title: eventData.title || 'Untitled Event',
      date: eventData.date || null,
      endDate: null, // Static HTML typically doesn't have end dates
      location: eventData.location || null,
      description: eventData.description || '',
      url: eventData.url || '',
      price: null, // Would need specific extraction
      category: 'General',
      image: null, // Would need specific extraction
      raw: eventData // Keep original for debugging
    }
  }

  /**
   * Handle pagination
   * @param {string} baseUrl - Base URL
   * @param {Object} parsedHtml - Parsed HTML
   * @param {Object} options - Pagination options
   * @returns {Array} Additional events from pagination
   */
  async handlePagination(baseUrl, parsedHtml, options) {
    console.log('📄 Handling pagination...')
    
    const allEvents = []
    const maxPages = options.maxPages || 5
    
    if (!parsedHtml.pagination || parsedHtml.pagination.length === 0) {
      console.log('⚠️ No pagination links found')
      return allEvents
    }
    
    let currentPage = 1
    let nextUrl = parsedHtml.pagination[0]?.url
    
    while (nextUrl && currentPage <= maxPages) {
      try {
        console.log(`📄 Processing page ${currentPage}: ${nextUrl}`)
        
        const pageHtml = await this.fetchHtml(nextUrl)
        const pageParsed = await this.parseHtml(pageHtml)
        const pageEvents = await this.extractEventsFromHtml(pageParsed, options)
        
        allEvents.push(...pageEvents)
        
        // Find next page link
        nextUrl = pageParsed.pagination?.[0]?.url
        
        currentPage++
        
        // Add delay between requests
        await new Promise(resolve => setTimeout(resolve, 1000))
        
      } catch (error) {
        console.log(`⚠️ Pagination failed at page ${currentPage}: ${error.message}`)
        break
      }
    }
    
    console.log(`📊 Pagination complete: ${allEvents.length} additional events from ${currentPage - 1} pages`)
    return allEvents
  }

  /**
   * Clean text content
   * @param {string} text - Text to clean
   * @returns {string} Cleaned text
   */
  cleanText(text) {
    if (!text) return ''
    
    return text
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/&nbsp;/g, ' ') // Replace non-breaking spaces
      .replace(/&amp;/g, '&') // Replace HTML entities
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .trim()
  }

  /**
   * Get parser statistics
   * @returns {Object} Parser statistics
   */
  getStatistics() {
    return {
      name: this.name,
      priority: this.priority,
      totalPages: 0, // Would be tracked in real implementation
      successfulPages: 0,
      failedPages: 0,
      averageEventsPerPage: 0,
      lastUsed: new Date().toISOString()
    }
  }
}

module.exports = StaticParser

