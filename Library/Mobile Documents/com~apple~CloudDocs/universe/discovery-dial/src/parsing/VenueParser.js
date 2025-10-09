import JsonLdParser from './methods/JsonLdParser.js';
import RssParser from './methods/RssParser.js';
import HtmlParser from './methods/HtmlParser.js';
import ApiParser from './methods/ApiParser.js';

class VenueParser {
  constructor() {
    this.methods = [
      new JsonLdParser(),
      new RssParser(),
      new HtmlParser(),
      new ApiParser()
    ];
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
  }

  async parseVenue(url) {
    // Check cache first
    const cacheKey = `venue:${url}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) {
      return cached;
    }

    // Parse with all methods
    const results = await Promise.allSettled(
      this.methods.map(method => method.parse(url))
    );

    // Consolidate results
    const consolidated = this.consolidateResults(results);
    
    // Cache result
    this.setCache(cacheKey, consolidated);
    
    return consolidated;
  }

  consolidateResults(results) {
    const validResults = results
      .filter(r => r.status === 'fulfilled' && r.value.events?.length > 0)
      .map(r => r.value);

    if (validResults.length === 0) {
      return { events: [], confidence: 0, method: 'none', error: 'No valid parsing methods' };
    }

    // Use highest confidence result
    const bestResult = validResults.sort((a, b) => b.confidence - a.confidence)[0];
    return bestResult;
  }

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
}

export default VenueParser;
