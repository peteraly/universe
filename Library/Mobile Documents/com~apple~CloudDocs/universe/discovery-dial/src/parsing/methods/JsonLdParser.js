import BaseParser from './BaseParser.js';

class JsonLdParser extends BaseParser {
  constructor() {
    super();
    this.name = 'json_ld';
    this.confidence = 0.95;
  }

  async parse(url) {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        return { events: [], confidence: 0, method: this.name, error: 'Failed to fetch URL' };
      }

      const html = await response.text();
      const events = this.extractJsonLdEvents(html);
      
      return {
        events: events.map(event => this.normalizeEvent(event)),
        confidence: events.length > 0 ? this.confidence : 0,
        method: this.name
      };
    } catch (error) {
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
