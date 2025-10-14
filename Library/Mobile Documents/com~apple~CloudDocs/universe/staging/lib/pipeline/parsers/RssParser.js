// RSS Parser - P1 Standard Library Implementation
/**
 * RSS/XML feed parsing using standard xml2js library
 * Handles RSS, Atom, and XML sitemap formats
 */

class RssParser {
  constructor() {
    this.name = 'RSS Parser'
    this.priority = 'P1'
    this.description = 'RSS/XML feeds using standard xml2js'
    
    this.feedTypes = {
      rss: {
        name: 'RSS 2.0',
        selectors: {
          items: 'rss.channel.item',
          title: 'title',
          description: 'description',
          link: 'link',
          date: 'pubDate',
          category: 'category'
        }
      },
      
      atom: {
        name: 'Atom',
        selectors: {
          items: 'feed.entry',
          title: 'title',
          description: 'summary',
          link: 'link.href',
          date: 'published',
          category: 'category.term'
        }
      },
      
      sitemap: {
        name: 'XML Sitemap',
        selectors: {
          items: 'urlset.url',
          title: 'loc',
          description: null,
          link: 'loc',
          date: 'lastmod',
          category: null
        }
      }
    }
    
    this.commonFeedPaths = [
      '/feed',
      '/rss',
      '/atom',
      '/feeds',
      '/rss.xml',
      '/atom.xml',
      '/feed.xml',
      '/sitemap.xml',
      '/sitemap_index.xml',
      '/robots.txt'
    ]
  }

  /**
   * Initialize the RSS parser
   */
  async initialize() {
    console.log('🔧 Initializing RSS Parser...')
    console.log('✅ RSS Parser ready')
  }

  /**
   * Extract events from RSS/XML feeds
   * @param {string} url - Base URL
   * @param {Object} options - Extraction options
   * @returns {Array} Extracted events
   */
  async extract(url, options = {}) {
    console.log(`📡 Extracting from RSS feeds: ${url}`)
    
    try {
      // Try common RSS feed paths
      const feedUrls = this.generateFeedUrls(url)
      
      for (const feedUrl of feedUrls) {
        try {
          const events = await this.fetchFromFeed(feedUrl, options)
          if (events && events.length > 0) {
            console.log(`✅ Found ${events.length} events via RSS`)
            return events
          }
        } catch (error) {
          console.log(`⚠️ RSS feed failed: ${feedUrl} - ${error.message}`)
          continue
        }
      }
      
      throw new Error('No working RSS feeds found')
      
    } catch (error) {
      console.error(`❌ RSS extraction failed:`, error.message)
      throw error
    }
  }

  /**
   * Generate potential RSS feed URLs
   * @param {string} baseUrl - Base URL
   * @returns {Array} Array of potential feed URLs
   */
  generateFeedUrls(baseUrl) {
    const urls = []
    const base = baseUrl.replace(/\/$/, '') // Remove trailing slash
    
    // Add common feed paths
    this.commonFeedPaths.forEach(path => {
      urls.push(`${base}${path}`)
    })
    
    return urls
  }

  /**
   * Fetch and parse RSS feed
   * @param {string} feedUrl - Feed URL
   * @param {Object} options - Fetch options
   * @returns {Array} Events array
   */
  async fetchFromFeed(feedUrl, options) {
    console.log(`📡 Fetching RSS feed: ${feedUrl}`)
    
    const response = await fetch(feedUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/rss+xml, application/atom+xml, application/xml, text/xml',
        'User-Agent': 'Mozilla/5.0 (compatible; DiscoveryDialBot/1.0)'
      },
      timeout: 10000
    })
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
    
    const xmlContent = await response.text()
    
    // Parse XML content
    const parsedData = await this.parseXml(xmlContent)
    
    // Determine feed type and extract events
    const feedType = this.detectFeedType(parsedData)
    const events = this.extractEventsFromFeed(parsedData, feedType)
    
    return events
  }

  /**
   * Parse XML content (simplified - in real implementation would use xml2js)
   * @param {string} xmlContent - XML content
   * @returns {Object} Parsed XML data
   */
  async parseXml(xmlContent) {
    // This is a simplified parser - in real implementation would use xml2js
    console.log('🔍 Parsing XML content...')
    
    // Basic XML parsing simulation
    const data = {
      type: 'unknown',
      items: []
    }
    
    // Detect feed type
    if (xmlContent.includes('<rss')) {
      data.type = 'rss'
    } else if (xmlContent.includes('<feed')) {
      data.type = 'atom'
    } else if (xmlContent.includes('<urlset')) {
      data.type = 'sitemap'
    }
    
    // Extract basic items (simplified)
    const itemMatches = xmlContent.match(/<item[^>]*>[\s\S]*?<\/item>/gi) ||
                       xmlContent.match(/<entry[^>]*>[\s\S]*?<\/entry>/gi) ||
                       xmlContent.match(/<url[^>]*>[\s\S]*?<\/url>/gi)
    
    if (itemMatches) {
      data.items = itemMatches.map(item => this.parseXmlItem(item))
    }
    
    return data
  }

  /**
   * Parse individual XML item
   * @param {string} itemXml - XML item content
   * @returns {Object} Parsed item
   */
  parseXmlItem(itemXml) {
    const item = {}
    
    // Extract title
    const titleMatch = itemXml.match(/<title[^>]*>([^<]*)<\/title>/i)
    if (titleMatch) {
      item.title = titleMatch[1].trim()
    }
    
    // Extract description
    const descMatch = itemXml.match(/<(?:description|summary)[^>]*>([^<]*)<\/(?:description|summary)>/i)
    if (descMatch) {
      item.description = descMatch[1].trim()
    }
    
    // Extract link
    const linkMatch = itemXml.match(/<link[^>]*>([^<]*)<\/link>/i) ||
                     itemXml.match(/<link[^>]*href="([^"]*)"[^>]*\/?>/i)
    if (linkMatch) {
      item.link = linkMatch[1].trim()
    }
    
    // Extract date
    const dateMatch = itemXml.match(/<(?:pubDate|published|lastmod)[^>]*>([^<]*)<\/(?:pubDate|published|lastmod)>/i)
    if (dateMatch) {
      item.date = dateMatch[1].trim()
    }
    
    // Extract category
    const categoryMatch = itemXml.match(/<category[^>]*>([^<]*)<\/category>/i)
    if (categoryMatch) {
      item.category = categoryMatch[1].trim()
    }
    
    return item
  }

  /**
   * Detect feed type from parsed data
   * @param {Object} parsedData - Parsed XML data
   * @returns {string} Feed type
   */
  detectFeedType(parsedData) {
    if (parsedData.type === 'rss') {
      return 'rss'
    } else if (parsedData.type === 'atom') {
      return 'atom'
    } else if (parsedData.type === 'sitemap') {
      return 'sitemap'
    }
    
    return 'unknown'
  }

  /**
   * Extract events from parsed feed data
   * @param {Object} parsedData - Parsed feed data
   * @param {string} feedType - Feed type
   * @returns {Array} Events array
   */
  extractEventsFromFeed(parsedData, feedType) {
    const feedConfig = this.feedTypes[feedType]
    
    if (!feedConfig) {
      console.log('⚠️ Unknown feed type, using default extraction')
      return this.extractEventsDefault(parsedData)
    }
    
    return parsedData.items.map(item => this.transformFeedItem(item, feedConfig))
  }

  /**
   * Transform feed item to standard event format
   * @param {Object} item - Feed item
   * @param {Object} feedConfig - Feed configuration
   * @returns {Object} Standardized event
   */
  transformFeedItem(item, feedConfig) {
    return {
      title: item.title || 'Untitled Event',
      date: this.parseDate(item.date),
      endDate: null, // RSS feeds typically don't have end dates
      location: this.extractLocation(item.description),
      description: item.description || '',
      url: item.link || '',
      price: this.extractPrice(item.description),
      category: item.category || 'General',
      image: this.extractImage(item.description),
      raw: item // Keep original for debugging
    }
  }

  /**
   * Parse date string to ISO format
   * @param {string} dateString - Date string
   * @returns {string|null} ISO date string
   */
  parseDate(dateString) {
    if (!dateString) return null
    
    try {
      const date = new Date(dateString)
      return date.toISOString()
    } catch (error) {
      console.log(`⚠️ Failed to parse date: ${dateString}`)
      return null
    }
  }

  /**
   * Extract location from description
   * @param {string} description - Event description
   * @returns {string|null} Extracted location
   */
  extractLocation(description) {
    if (!description) return null
    
    // Simple location extraction patterns
    const locationPatterns = [
      /at\s+([^,]+)/i,
      /@\s+([^,]+)/i,
      /location:\s*([^\n]+)/i,
      /venue:\s*([^\n]+)/i
    ]
    
    for (const pattern of locationPatterns) {
      const match = description.match(pattern)
      if (match) {
        return match[1].trim()
      }
    }
    
    return null
  }

  /**
   * Extract price from description
   * @param {string} description - Event description
   * @returns {string|null} Extracted price
   */
  extractPrice(description) {
    if (!description) return null
    
    const pricePatterns = [
      /\$(\d+(?:\.\d{2})?)/,
      /(\d+(?:\.\d{2})?)\s*dollars?/i,
      /price:\s*([^\n]+)/i,
      /cost:\s*([^\n]+)/i
    ]
    
    for (const pattern of pricePatterns) {
      const match = description.match(pattern)
      if (match) {
        return match[1].trim()
      }
    }
    
    return null
  }

  /**
   * Extract image URL from description
   * @param {string} description - Event description
   * @returns {string|null} Extracted image URL
   */
  extractImage(description) {
    if (!description) return null
    
    const imageMatch = description.match(/<img[^>]*src="([^"]*)"[^>]*>/i)
    if (imageMatch) {
      return imageMatch[1]
    }
    
    return null
  }

  /**
   * Default event extraction for unknown feed types
   * @param {Object} parsedData - Parsed data
   * @returns {Array} Events array
   */
  extractEventsDefault(parsedData) {
    return parsedData.items.map(item => ({
      title: item.title || 'Untitled Event',
      date: this.parseDate(item.date),
      endDate: null,
      location: null,
      description: item.description || '',
      url: item.link || '',
      price: null,
      category: 'General',
      image: null,
      raw: item
    }))
  }

  /**
   * Get parser statistics
   * @returns {Object} Parser statistics
   */
  getStatistics() {
    return {
      name: this.name,
      priority: this.priority,
      totalFeeds: 0, // Would be tracked in real implementation
      successfulFeeds: 0,
      failedFeeds: 0,
      averageItemsPerFeed: 0,
      lastUsed: new Date().toISOString()
    }
  }
}

module.exports = RssParser

