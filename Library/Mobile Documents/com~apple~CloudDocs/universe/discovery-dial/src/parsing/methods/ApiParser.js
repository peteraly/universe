import BaseParser from './BaseParser.js';

class ApiParser extends BaseParser {
  constructor() {
    super();
    this.name = 'api';
    this.confidence = 0.95;
  }

  async parse(url) {
    const apiEndpoints = [
      `${url}/api/events`,
      `${url}/api/calendar`,
      `${url}/events.json`,
      `${url}/calendar.json`,
      `${url}/api/v1/events`
    ];

    for (const apiUrl of apiEndpoints) {
      try {
        const response = await fetch(apiUrl);
        if (response.ok) {
          const data = await response.json();
          const events = this.extractEventsFromApi(data);
          if (events.length > 0) {
            return {
              events: events.map(event => this.normalizeEvent(event)),
              confidence: this.confidence,
              method: this.name,
              endpoint: apiUrl
            };
          }
        }
      } catch (error) {
        continue;
      }
    }

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
