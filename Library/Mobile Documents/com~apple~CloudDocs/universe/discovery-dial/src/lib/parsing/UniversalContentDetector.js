/**
 * UniversalContentDetector - Analyzes diverse website structures to determine optimal parsing strategy
 * Handles 1000+ different venue types with intelligent content detection
 */

class UniversalContentDetector {
  constructor() {
    this.cmsPatterns = this.loadCMSPatterns();
    this.eventPatterns = this.loadEventPatterns();
    this.feedPatterns = this.loadFeedPatterns();
    this.apiPatterns = this.loadAPIPatterns();
  }

  async analyzePage(url, html) {
    console.log(`[UniversalContentDetector] Analyzing page structure for ${url}`);
    
    const analysis = {
      url,
      timestamp: new Date().toISOString(),
      structuredData: this.detectStructuredData(html),
      eventPatterns: this.findEventPatterns(html),
      feeds: this.discoverFeeds(html, url),
      apiEndpoints: this.findApiEndpoints(html, url),
      cmsType: this.detectCMS(html),
      contentQuality: this.assessContentQuality(html),
      confidence: 0,
      recommendedParser: null
    };

    // Calculate overall confidence and recommend parser
    analysis.confidence = this.calculateConfidence(analysis);
    analysis.recommendedParser = this.recommendParser(analysis);

    console.log(`[UniversalContentDetector] Analysis complete - Confidence: ${analysis.confidence}, Parser: ${analysis.recommendedParser}`);
    return analysis;
  }

  detectStructuredData(html) {
    const structuredData = {
      jsonLd: [],
      microdata: [],
      rdfa: [],
      openGraph: [],
      twitterCards: []
    };

    // JSON-LD detection
    const jsonLdMatches = html.match(/<script[^>]*type=["']application\/ld\+json["'][^>]*>(.*?)<\/script>/gis);
    if (jsonLdMatches) {
      jsonLdMatches.forEach(match => {
        try {
          const jsonStr = match.replace(/<script[^>]*>|<\/script>/g, '');
          const data = JSON.parse(jsonStr);
          if (Array.isArray(data)) {
            structuredData.jsonLd.push(...data);
          } else {
            structuredData.jsonLd.push(data);
          }
        } catch (e) {
          console.warn('Failed to parse JSON-LD:', e);
        }
      });
    }

    // Microdata detection
    const microdataMatches = html.match(/itemscope[^>]*>/g);
    if (microdataMatches) {
      structuredData.microdata = microdataMatches.length;
    }

    // RDFa detection
    const rdfaMatches = html.match(/typeof[^>]*>/g);
    if (rdfaMatches) {
      structuredData.rdfa = rdfaMatches.length;
    }

    // Open Graph detection
    const ogMatches = html.match(/<meta[^>]*property=["']og:[^"']*["'][^>]*>/g);
    if (ogMatches) {
      structuredData.openGraph = ogMatches.length;
    }

    // Twitter Cards detection
    const twitterMatches = html.match(/<meta[^>]*name=["']twitter:[^"']*["'][^>]*>/g);
    if (twitterMatches) {
      structuredData.twitterCards = twitterMatches.length;
    }

    return structuredData;
  }

  findEventPatterns(html) {
    const patterns = {
      eventClasses: [],
      datePatterns: [],
      timePatterns: [],
      locationPatterns: [],
      pricePatterns: [],
      eventElements: []
    };

    // Common event class patterns
    const eventClassPatterns = [
      /class=["'][^"']*event[^"']*["']/gi,
      /class=["'][^"']*calendar[^"']*["']/gi,
      /class=["'][^"']*schedule[^"']*["']/gi,
      /class=["'][^"']*program[^"']*["']/gi,
      /class=["'][^"']*listing[^"']*["']/gi
    ];

    eventClassPatterns.forEach(pattern => {
      const matches = html.match(pattern);
      if (matches) {
        patterns.eventClasses.push(...matches);
      }
    });

    // Date pattern detection
    const datePatterns = [
      /\b\d{1,2}\/\d{1,2}\/\d{2,4}\b/g,
      /\b\d{4}-\d{2}-\d{2}\b/g,
      /\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{1,2},?\s+\d{4}\b/gi,
      /\b(?:Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)[a-z]*\b/gi
    ];

    datePatterns.forEach(pattern => {
      const matches = html.match(pattern);
      if (matches) {
        patterns.datePatterns.push(...matches);
      }
    });

    // Time pattern detection
    const timePatterns = [
      /\b\d{1,2}:\d{2}\s*(?:AM|PM|am|pm)\b/g,
      /\b\d{1,2}:\d{2}\b/g,
      /\b(?:noon|midnight)\b/gi
    ];

    timePatterns.forEach(pattern => {
      const matches = html.match(pattern);
      if (matches) {
        patterns.timePatterns.push(...matches);
      }
    });

    // Location pattern detection
    const locationPatterns = [
      /class=["'][^"']*location[^"']*["']/gi,
      /class=["'][^"']*venue[^"']*["']/gi,
      /class=["'][^"']*address[^"']*["']/gi,
      /class=["'][^"']*place[^"']*["']/gi
    ];

    locationPatterns.forEach(pattern => {
      const matches = html.match(pattern);
      if (matches) {
        patterns.locationPatterns.push(...matches);
      }
    });

    // Price pattern detection
    const pricePatterns = [
      /\$\d+(?:\.\d{2})?/g,
      /class=["'][^"']*price[^"']*["']/gi,
      /class=["'][^"']*cost[^"']*["']/gi,
      /class=["'][^"']*ticket[^"']*["']/gi
    ];

    pricePatterns.forEach(pattern => {
      const matches = html.match(pattern);
      if (matches) {
        patterns.pricePatterns.push(...matches);
      }
    });

    // Event element detection
    const eventElements = [
      /<div[^>]*class=["'][^"']*event[^"']*["'][^>]*>/gi,
      /<article[^>]*class=["'][^"']*event[^"']*["'][^>]*>/gi,
      /<li[^>]*class=["'][^"']*event[^"']*["'][^>]*>/gi,
      /<section[^>]*class=["'][^"']*event[^"']*["'][^>]*>/gi
    ];

    eventElements.forEach(pattern => {
      const matches = html.match(pattern);
      if (matches) {
        patterns.eventElements.push(...matches);
      }
    });

    return patterns;
  }

  discoverFeeds(html, baseUrl) {
    const feeds = [];

    // RSS/Atom feed detection
    const feedPatterns = [
      /<link[^>]*type=["']application\/rss\+xml["'][^>]*>/gi,
      /<link[^>]*type=["']application\/atom\+xml["'][^>]*>/gi,
      /<link[^>]*rel=["']alternate["'][^>]*type=["']application\/rss\+xml["'][^>]*>/gi
    ];

    feedPatterns.forEach(pattern => {
      const matches = html.match(pattern);
      if (matches) {
        matches.forEach(match => {
          const hrefMatch = match.match(/href=["']([^"']*)["']/);
          if (hrefMatch) {
            const feedUrl = this.resolveUrl(hrefMatch[1], baseUrl);
            feeds.push({
              url: feedUrl,
              type: 'rss',
              confidence: 0.9
            });
          }
        });
      }
    });

    // Common feed URL patterns
    const commonFeedUrls = [
      '/feed',
      '/rss',
      '/events/feed',
      '/calendar/feed',
      '/events.rss',
      '/feed.xml',
      '/rss.xml'
    ];

    commonFeedUrls.forEach(feedPath => {
      const feedUrl = this.resolveUrl(feedPath, baseUrl);
      feeds.push({
        url: feedUrl,
        type: 'potential',
        confidence: 0.5
      });
    });

    return feeds;
  }

  findApiEndpoints(html, baseUrl) {
    const endpoints = [];

    // Common API endpoint patterns
    const apiPatterns = [
      '/api/events',
      '/api/calendar',
      '/events.json',
      '/calendar.json',
      '/api/v1/events',
      '/api/v2/events',
      '/events/api',
      '/calendar/api'
    ];

    apiPatterns.forEach(apiPath => {
      const apiUrl = this.resolveUrl(apiPath, baseUrl);
      endpoints.push({
        url: apiUrl,
        type: 'potential',
        confidence: 0.6
      });
    });

    // Look for API references in JavaScript
    const jsApiMatches = html.match(/fetch\(["']([^"']*\/api\/[^"']*)["']/g);
    if (jsApiMatches) {
      jsApiMatches.forEach(match => {
        const urlMatch = match.match(/fetch\(["']([^"']*)["']/);
        if (urlMatch) {
          const apiUrl = this.resolveUrl(urlMatch[1], baseUrl);
          endpoints.push({
            url: apiUrl,
            type: 'detected',
            confidence: 0.8
          });
        }
      });
    }

    return endpoints;
  }

  detectCMS(html) {
    const cmsIndicators = {
      wordpress: [
        /wp-content/gi,
        /wp-includes/gi,
        /wordpress/gi,
        /wp-json/gi
      ],
      squarespace: [
        /squarespace/gi,
        /sqs/gi,
        /squarespace\.com/gi
      ],
      wix: [
        /wix\.com/gi,
        /wixstatic/gi,
        /wix/gi
      ],
      shopify: [
        /shopify/gi,
        /myshopify\.com/gi,
        /cdn\.shopify\.com/gi
      ],
      drupal: [
        /drupal/gi,
        /sites\/default/gi
      ],
      joomla: [
        /joomla/gi,
        /components\/com_/gi
      ]
    };

    for (const [cms, patterns] of Object.entries(cmsIndicators)) {
      for (const pattern of patterns) {
        if (pattern.test(html)) {
          return {
            type: cms,
            confidence: 0.8
          };
        }
      }
    }

    return {
      type: 'unknown',
      confidence: 0.1
    };
  }

  assessContentQuality(html) {
    const quality = {
      hasStructuredData: false,
      hasEventElements: false,
      hasDateInfo: false,
      hasLocationInfo: false,
      hasPriceInfo: false,
      contentLength: html.length,
      eventDensity: 0
    };

    // Check for structured data
    quality.hasStructuredData = html.includes('application/ld+json') || 
                               html.includes('itemscope') || 
                               html.includes('typeof');

    // Check for event elements
    quality.hasEventElements = /class=["'][^"']*event[^"']*["']/gi.test(html);

    // Check for date information
    quality.hasDateInfo = /\b\d{1,2}\/\d{1,2}\/\d{2,4}\b/.test(html) ||
                         /\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{1,2},?\s+\d{4}\b/gi.test(html);

    // Check for location information
    quality.hasLocationInfo = /class=["'][^"']*location[^"']*["']/gi.test(html) ||
                             /class=["'][^"']*venue[^"']*["']/gi.test(html) ||
                             /class=["'][^"']*address[^"']*["']/gi.test(html);

    // Check for price information
    quality.hasPriceInfo = /\$\d+(?:\.\d{2})?/.test(html) ||
                          /class=["'][^"']*price[^"']*["']/gi.test(html);

    // Calculate event density
    const eventMatches = html.match(/class=["'][^"']*event[^"']*["']/gi);
    quality.eventDensity = eventMatches ? eventMatches.length / (html.length / 1000) : 0;

    return quality;
  }

  calculateConfidence(analysis) {
    let confidence = 0;

    // Structured data bonus
    if (analysis.structuredData.jsonLd.length > 0) confidence += 0.4;
    if (analysis.structuredData.microdata > 0) confidence += 0.3;
    if (analysis.structuredData.rdfa > 0) confidence += 0.2;

    // Event patterns bonus
    if (analysis.eventPatterns.eventClasses.length > 0) confidence += 0.2;
    if (analysis.eventPatterns.datePatterns.length > 0) confidence += 0.15;
    if (analysis.eventPatterns.timePatterns.length > 0) confidence += 0.1;
    if (analysis.eventPatterns.locationPatterns.length > 0) confidence += 0.1;

    // Feed detection bonus
    if (analysis.feeds.length > 0) confidence += 0.2;

    // API endpoint bonus
    if (analysis.apiEndpoints.length > 0) confidence += 0.15;

    // Content quality bonus
    if (analysis.contentQuality.hasStructuredData) confidence += 0.1;
    if (analysis.contentQuality.hasEventElements) confidence += 0.1;
    if (analysis.contentQuality.hasDateInfo) confidence += 0.05;
    if (analysis.contentQuality.hasLocationInfo) confidence += 0.05;

    return Math.min(confidence, 1.0);
  }

  recommendParser(analysis) {
    // High confidence structured data
    if (analysis.structuredData.jsonLd.length > 0) {
      return 'structured_data';
    }

    // Feed available
    if (analysis.feeds.length > 0) {
      return 'feed';
    }

    // API endpoints available
    if (analysis.apiEndpoints.length > 0) {
      return 'api';
    }

    // Good event patterns
    if (analysis.eventPatterns.eventClasses.length > 0 && 
        analysis.eventPatterns.datePatterns.length > 0) {
      return 'html_pattern';
    }

    // Fallback to AI content parser
    return 'ai_content';
  }

  resolveUrl(path, baseUrl) {
    try {
      return new URL(path, baseUrl).href;
    } catch (e) {
      return baseUrl + path;
    }
  }

  loadCMSPatterns() {
    return {
      wordpress: ['wp-content', 'wp-includes', 'wordpress', 'wp-json'],
      squarespace: ['squarespace', 'sqs', 'squarespace.com'],
      wix: ['wix.com', 'wixstatic', 'wix'],
      shopify: ['shopify', 'myshopify.com', 'cdn.shopify.com'],
      drupal: ['drupal', 'sites/default'],
      joomla: ['joomla', 'components/com_']
    };
  }

  loadEventPatterns() {
    return {
      classes: ['event', 'calendar', 'schedule', 'program', 'listing'],
      dates: ['date', 'time', 'datetime', 'start', 'end'],
      locations: ['location', 'venue', 'address', 'place'],
      prices: ['price', 'cost', 'ticket', 'fee']
    };
  }

  loadFeedPatterns() {
    return {
      rss: ['application/rss+xml', 'application/atom+xml'],
      paths: ['/feed', '/rss', '/events/feed', '/calendar/feed', '/events.rss']
    };
  }

  loadAPIPatterns() {
    return {
      endpoints: ['/api/events', '/api/calendar', '/events.json', '/calendar.json'],
      versions: ['/api/v1/events', '/api/v2/events', '/events/api', '/calendar/api']
    };
  }
}

export default UniversalContentDetector;
