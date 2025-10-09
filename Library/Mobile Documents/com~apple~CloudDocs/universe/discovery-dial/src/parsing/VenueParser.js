import JsonLdParser from './methods/JsonLdParser.js';
import RssParser from './methods/RssParser.js';
import HtmlParser from './methods/HtmlParser.js';
import ApiParser from './methods/ApiParser.js';
import ThingsToDoDCParser from './methods/ThingsToDoDCParser.js';

class VenueParser {
  constructor() {
    this.methods = [
      new ThingsToDoDCParser(), // Specialized parser first
      new JsonLdParser(),
      new RssParser(),
      new HtmlParser(),
      new ApiParser()
    ];
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
  }

  async parseVenue(url) {
    console.log(`[VenueParser] Starting to parse venue: ${url}`);
    
    // Check cache first
    const cacheKey = `venue:${url}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) {
      console.log(`[VenueParser] Cache hit for ${url}`);
      return cached;
    }

    // Try specialized parsers first
    const specializedResult = await this.trySpecializedParsers(url);
    if (specializedResult && specializedResult.events.length > 0) {
      console.log(`[VenueParser] Specialized parser succeeded for ${url}`);
      this.setCache(cacheKey, specializedResult);
      return specializedResult;
    }

    // Fall back to general parsers
    console.log(`[VenueParser] Trying general parsers for ${url}`);
    const results = await Promise.allSettled(
      this.methods.slice(1).map(method => method.parse(url)) // Skip specialized parser
    );

    // Consolidate results
    const consolidated = this.consolidateResults(results);
    
    // Cache result
    this.setCache(cacheKey, consolidated);
    
    return consolidated;
  }

  async trySpecializedParsers(url) {
    const specializedParsers = this.methods.filter(method => 
      method.name === 'things_to_do_dc' || 
      method.name.includes('specialized')
    );

    for (const parser of specializedParsers) {
      try {
        console.log(`[VenueParser] Trying specialized parser: ${parser.name}`);
        const result = await parser.parse(url);
        if (result && result.events && result.events.length > 0) {
          return result;
        }
      } catch (error) {
        console.warn(`[VenueParser] Specialized parser ${parser.name} failed:`, error.message);
      }
    }

    return null;
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
