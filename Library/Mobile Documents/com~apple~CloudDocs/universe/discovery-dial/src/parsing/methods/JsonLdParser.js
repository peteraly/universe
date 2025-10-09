import BaseParser from './BaseParser.js';
import CORSProxyService from '../../lib/parsing/CORSProxyService.js';

class JsonLdParser extends BaseParser {
  constructor() {
    super();
    this.name = 'json_ld';
    this.confidence = 0.95;
    this.corsProxy = new CORSProxyService();
  }

  async parse(url) {
    try {
      console.log(`[JsonLdParser] Attempting to parse JSON-LD from ${url}`);
      
      // Use CORS proxy to fetch the page
      const html = await this.corsProxy.fetchText(url);
      const events = this.extractJsonLdEvents(html);
      
      return {
        events: events.map(event => this.normalizeEvent(event)),
        confidence: events.length > 0 ? this.confidence : 0,
        method: this.name,
        source: url,
        totalEvents: events.length
      };
    } catch (error) {
      console.warn(`[JsonLdParser] Failed to parse ${url}:`, error.message);
      return { events: [], confidence: 0, method: this.name, error: error.message };
    }
  }

  extractJsonLdEvents(html) {
    const events = [];
    const jsonLdMatches = html.match(/<script[^>]*type="application\/ld\+json"[^>]*>(.*?)<\/script>/gs);
    
    if (!jsonLdMatches) {
      return events;
    }

    jsonLdMatches.forEach(match => {
      const jsonStr = match.replace(/<script[^>]*>|<\/script>/g, '');
      try {
        const data = JSON.parse(jsonStr);
        if (data['@type'] === 'Event') {
          events.push(data);
        } else if (Array.isArray(data)) {
          events.push(...data.filter(item => item['@type'] === 'Event'));
        }
      } catch (e) {
        // Skip invalid JSON
      }
    });

    return events;
  }
}

export default JsonLdParser;
