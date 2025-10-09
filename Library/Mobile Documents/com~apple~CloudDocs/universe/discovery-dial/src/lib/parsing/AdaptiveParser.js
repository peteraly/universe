/**
 * AdaptiveParser - Intelligently selects and executes the best parsing strategy
 * Handles diverse venue types with automatic parser selection and fallback
 */

import UniversalContentDetector from './UniversalContentDetector.js';
import CORSProxyService from './CORSProxyService.js';
import JsonLdParser from '../../parsing/methods/JsonLdParser.js';
import RssParser from '../../parsing/methods/RssParser.js';
import HtmlParser from '../../parsing/methods/HtmlParser.js';
import ApiParser from '../../parsing/methods/ApiParser.js';
import ThingsToDoDCParser from '../../parsing/methods/ThingsToDoDCParser.js';

class AdaptiveParser {
  constructor() {
    this.detector = new UniversalContentDetector();
    this.corsProxy = new CORSProxyService();
    this.parsers = this.initializeParsers();
    this.cache = new Map();
    this.cacheTimeout = 10 * 60 * 1000; // 10 minutes
    this.learningData = new Map(); // Store successful parsing patterns
  }

  initializeParsers() {
    return {
      structured_data: new JsonLdParser(),
      feed: new RssParser(),
      api: new ApiParser(),
      html_pattern: new HtmlParser(),
      ai_content: new HtmlParser(), // Enhanced HTML parser for AI content
      things_to_do_dc: new ThingsToDoDCParser()
    };
  }

  async parseVenue(url) {
    console.log(`[AdaptiveParser] Starting adaptive parsing for ${url}`);
    
    // Check cache first
    const cacheKey = `adaptive:${url}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) {
      console.log(`[AdaptiveParser] Cache hit for ${url}`);
      return cached;
    }

    try {
      // Step 1: Analyze the page structure
      const html = await this.corsProxy.fetchText(url);
      const analysis = await this.detector.analyzePage(url, html);
      
      console.log(`[AdaptiveParser] Analysis complete - Confidence: ${analysis.confidence}, Recommended: ${analysis.recommendedParser}`);

      // Step 2: Select and execute optimal parser
      const result = await this.executeOptimalParser(url, analysis, html);
      
      // Step 3: Learn from successful parsing
      if (result.events && result.events.length > 0) {
        this.learnFromSuccess(url, analysis, result);
      }

      // Step 4: Cache and return result
      this.setCache(cacheKey, result);
      return result;

    } catch (error) {
      console.error(`[AdaptiveParser] Failed to parse ${url}:`, error.message);
      return {
        events: [],
        confidence: 0,
        method: 'adaptive',
        error: error.message,
        source: url
      };
    }
  }

  async executeOptimalParser(url, analysis, html) {
    const parserName = analysis.recommendedParser;
    const parser = this.parsers[parserName];

    if (!parser) {
      console.warn(`[AdaptiveParser] Parser ${parserName} not found, falling back to HTML pattern parser`);
      return await this.parsers.html_pattern.parse(url);
    }

    console.log(`[AdaptiveParser] Executing ${parserName} parser for ${url}`);

    try {
      const result = await parser.parse(url);
      
      // Enhance result with analysis data
      result.analysis = analysis;
      result.parserUsed = parserName;
      result.adaptiveConfidence = this.calculateAdaptiveConfidence(analysis, result);
      
      // If result is successful, return it
      if (result.events && result.events.length > 0) {
        console.log(`[AdaptiveParser] ${parserName} parser succeeded with ${result.events.length} events`);
        return result;
      }

      // If primary parser failed, try fallback parsers
      console.log(`[AdaptiveParser] ${parserName} parser failed, trying fallback parsers`);
      return await this.tryFallbackParsers(url, analysis, parserName);

    } catch (error) {
      console.warn(`[AdaptiveParser] ${parserName} parser failed:`, error.message);
      return await this.tryFallbackParsers(url, analysis, parserName);
    }
  }

  async tryFallbackParsers(url, analysis, failedParser) {
    const fallbackOrder = this.getFallbackOrder(analysis, failedParser);
    
    for (const parserName of fallbackOrder) {
      const parser = this.parsers[parserName];
      if (!parser) continue;

      try {
        console.log(`[AdaptiveParser] Trying fallback parser: ${parserName}`);
        const result = await parser.parse(url);
        
        if (result.events && result.events.length > 0) {
          console.log(`[AdaptiveParser] Fallback parser ${parserName} succeeded with ${result.events.length} events`);
          result.analysis = analysis;
          result.parserUsed = parserName;
          result.adaptiveConfidence = this.calculateAdaptiveConfidence(analysis, result);
          result.fallbackUsed = true;
          return result;
        }
      } catch (error) {
        console.warn(`[AdaptiveParser] Fallback parser ${parserName} failed:`, error.message);
      }
    }

    // All parsers failed
    console.log(`[AdaptiveParser] All parsers failed for ${url}`);
    return {
      events: [],
      confidence: 0,
      method: 'adaptive',
      error: 'All parsing methods failed',
      source: url,
      analysis: analysis
    };
  }

  getFallbackOrder(analysis, failedParser) {
    // Create intelligent fallback order based on analysis
    const fallbackOrder = [];

    // If structured data was detected but failed, try HTML patterns
    if (failedParser === 'structured_data' && analysis.structuredData.jsonLd.length === 0) {
      fallbackOrder.push('html_pattern', 'feed', 'api', 'ai_content');
    }
    // If feed was detected but failed, try structured data
    else if (failedParser === 'feed' && analysis.feeds.length > 0) {
      fallbackOrder.push('structured_data', 'html_pattern', 'api', 'ai_content');
    }
    // If API was detected but failed, try feeds
    else if (failedParser === 'api' && analysis.apiEndpoints.length > 0) {
      fallbackOrder.push('feed', 'structured_data', 'html_pattern', 'ai_content');
    }
    // If HTML patterns failed, try structured data
    else if (failedParser === 'html_pattern') {
      fallbackOrder.push('structured_data', 'feed', 'api', 'ai_content');
    }
    // Default fallback order
    else {
      fallbackOrder.push('structured_data', 'feed', 'api', 'html_pattern', 'ai_content');
    }

    // Remove the failed parser from the list
    return fallbackOrder.filter(parser => parser !== failedParser);
  }

  calculateAdaptiveConfidence(analysis, result) {
    let confidence = result.confidence || 0;

    // Boost confidence based on analysis quality
    if (analysis.confidence > 0.8) confidence += 0.1;
    else if (analysis.confidence > 0.6) confidence += 0.05;

    // Boost confidence based on event count
    if (result.events && result.events.length > 0) {
      confidence += Math.min(result.events.length * 0.02, 0.1);
    }

    // Boost confidence based on data completeness
    if (result.events && result.events.length > 0) {
      const completeEvents = result.events.filter(event => 
        event.title && event.date && event.location
      ).length;
      const completenessRatio = completeEvents / result.events.length;
      confidence += completenessRatio * 0.1;
    }

    return Math.min(confidence, 1.0);
  }

  learnFromSuccess(url, analysis, result) {
    const learningKey = this.generateLearningKey(analysis);
    const learningData = {
      url: url,
      analysis: analysis,
      result: result,
      timestamp: new Date().toISOString(),
      success: true
    };

    // Store learning data
    if (!this.learningData.has(learningKey)) {
      this.learningData.set(learningKey, []);
    }
    this.learningData.get(learningKey).push(learningData);

    // Keep only recent learning data (last 100 entries per key)
    const entries = this.learningData.get(learningKey);
    if (entries.length > 100) {
      entries.splice(0, entries.length - 100);
    }

    console.log(`[AdaptiveParser] Learned from successful parsing of ${url}`);
  }

  generateLearningKey(analysis) {
    // Generate a key based on analysis characteristics
    const keyParts = [
      analysis.cmsType.type,
      analysis.structuredData.jsonLd.length > 0 ? 'has_jsonld' : 'no_jsonld',
      analysis.feeds.length > 0 ? 'has_feeds' : 'no_feeds',
      analysis.apiEndpoints.length > 0 ? 'has_api' : 'no_api',
      analysis.eventPatterns.eventClasses.length > 0 ? 'has_event_classes' : 'no_event_classes'
    ];
    
    return keyParts.join('_');
  }

  getLearningStats() {
    const stats = {
      totalLearningEntries: 0,
      learningKeys: [],
      successRates: {}
    };

    for (const [key, entries] of this.learningData.entries()) {
      stats.learningKeys.push(key);
      stats.totalLearningEntries += entries.length;
      
      const successfulEntries = entries.filter(entry => entry.success);
      stats.successRates[key] = successfulEntries.length / entries.length;
    }

    return stats;
  }

  // Enhanced parsing for specific venue types
  async parseWithVenueType(url, venueType) {
    console.log(`[AdaptiveParser] Parsing ${url} with venue type: ${venueType}`);
    
    // Check if we have a specialized parser for this venue type
    if (this.parsers[venueType]) {
      try {
        const result = await this.parsers[venueType].parse(url);
        if (result.events && result.events.length > 0) {
          result.parserUsed = venueType;
          result.adaptiveConfidence = result.confidence;
          return result;
        }
      } catch (error) {
        console.warn(`[AdaptiveParser] Specialized parser ${venueType} failed:`, error.message);
      }
    }

    // Fall back to adaptive parsing
    return await this.parseVenue(url);
  }

  // Batch processing support
  async parseVenueBatch(urls, options = {}) {
    const results = [];
    const batchSize = options.batchSize || 10;
    const delay = options.delay || 1000; // 1 second delay between batches

    console.log(`[AdaptiveParser] Starting batch processing of ${urls.length} URLs`);

    for (let i = 0; i < urls.length; i += batchSize) {
      const batch = urls.slice(i, i + batchSize);
      console.log(`[AdaptiveParser] Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(urls.length / batchSize)}`);

      const batchPromises = batch.map(url => this.parseVenue(url));
      const batchResults = await Promise.allSettled(batchPromises);
      
      results.push(...batchResults.map(result => 
        result.status === 'fulfilled' ? result.value : { error: result.reason.message }
      ));

      // Delay between batches to avoid overwhelming servers
      if (i + batchSize < urls.length) {
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    console.log(`[AdaptiveParser] Batch processing complete. ${results.length} results generated.`);
    return results;
  }

  // Cache management
  getFromCache(key) {
    const item = this.cache.get(key);
    if (!item) return null;
    
    if (Date.now() - item.timestamp > this.cacheTimeout) {
      this.cache.delete(key);
      return null;
    }
    
    return item.data;
  }

  setCache(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  clearCache() {
    this.cache.clear();
    console.log('[AdaptiveParser] Cache cleared');
  }

  getCacheStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}

export default AdaptiveParser;
