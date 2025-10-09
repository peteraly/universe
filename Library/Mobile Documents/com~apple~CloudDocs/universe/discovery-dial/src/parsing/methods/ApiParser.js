import BaseParser from './BaseParser.js';
import CORSProxyService from '../../lib/parsing/CORSProxyService.js';

class ApiParser extends BaseParser {
  constructor() {
    super();
    this.name = 'api';
    this.confidence = 0.95;
    this.corsProxy = new CORSProxyService();
  }

  async parse(url) {
    console.log(`[ApiParser] Attempting to parse API from ${url}`);
    
    const apiEndpoints = [
      `${url}/api/events`,
      `${url}/api/calendar`,
      `${url}/events.json`,
      `${url}/calendar.json`,
      `${url}/api/v1/events`
    ];

    for (const apiUrl of apiEndpoints) {
      try {
        console.log(`[ApiParser] Trying API endpoint: ${apiUrl}`);
        
        // Use CORS proxy to fetch API endpoint
        const data = await this.corsProxy.fetchJSON(apiUrl);
        const events = this.extractEventsFromApi(data);
        
        if (events.length > 0) {
          console.log(`[ApiParser] Found ${events.length} events in API`);
          return {
            events: events.map(event => this.normalizeEvent(event)),
            confidence: this.confidence,
            method: this.name,
            endpoint: apiUrl,
            source: url,
            totalEvents: events.length
          };
        }
      } catch (error) {
        console.warn(`[ApiParser] Failed to parse ${apiUrl}:`, error.message);
        continue;
      }
    }

    console.log(`[ApiParser] No API endpoints found for ${url}`);
    return { events: [], confidence: 0, method: this.name };
  }

  extractEventsFromApi(data) {
    const events = [];
    
    // Handle different API response formats
    if (Array.isArray(data)) {
      events.push(...data);
    } else if (data.events && Array.isArray(data.events)) {
      events.push(...data.events);
    } else if (data.data && Array.isArray(data.data)) {
      events.push(...data.data);
    }
    
    return events;
  }
}

export default ApiParser;
