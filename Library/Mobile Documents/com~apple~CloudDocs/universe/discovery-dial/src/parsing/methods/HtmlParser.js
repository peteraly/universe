import BaseParser from './BaseParser.js';
import CORSProxyService from '../../lib/parsing/CORSProxyService.js';

class HtmlParser extends BaseParser {
  constructor() {
    super();
    this.name = 'html';
    this.confidence = 0.7;
    this.corsProxy = new CORSProxyService();
  }

  async parse(url) {
    try {
      console.log(`[HtmlParser] Attempting to parse HTML from ${url}`);
      
      // Use CORS proxy to fetch the page
      const html = await this.corsProxy.fetchText(url);
      const events = this.extractEventsFromHtml(html, url);
      
      return {
        events: events.map(event => this.normalizeEvent(event)),
        confidence: events.length > 0 ? this.confidence : 0,
        method: this.name,
        source: url,
        totalEvents: events.length
      };
    } catch (error) {
      console.warn(`[HtmlParser] Failed to parse ${url}:`, error.message);
      return { events: [], confidence: 0, method: this.name, error: error.message };
    }
  }

  extractEventsFromHtml(html) {
    const events = [];
    
    // Look for common event patterns
    const eventPatterns = [
      /<div[^>]*class="[^"]*event[^"]*"[^>]*>(.*?)<\/div>/gs,
      /<article[^>]*class="[^"]*event[^"]*"[^>]*>(.*?)<\/article>/gs,
      /<li[^>]*class="[^"]*event[^"]*"[^>]*>(.*?)<\/li>/gs
    ];
    
    eventPatterns.forEach(pattern => {
      const matches = html.match(pattern);
      if (matches) {
        matches.forEach(match => {
          const event = this.extractEventFromHtml(match);
          if (event.title) {
            events.push(event);
          }
        });
      }
    });
    
    return events;
  }

  extractEventFromHtml(html) {
    const title = this.extractText(html, ['h1', 'h2', 'h3', '.title', '.event-title']);
    const date = this.extractText(html, ['.date', '.event-date', '.start-date']);
    const time = this.extractText(html, ['.time', '.event-time', '.start-time']);
    const location = this.extractText(html, ['.location', '.venue', '.event-location']);
    const price = this.extractText(html, ['.price', '.cost', '.ticket-price']);
    
    return {
      title: title,
      date: date,
      time: time,
      location: location,
      price: price
    };
  }

  extractText(html, selectors) {
    for (const selector of selectors) {
      const regex = new RegExp(`<[^>]*class="[^"]*${selector.replace('.', '')}[^"]*"[^>]*>(.*?)<\/[^>]*>`, 's');
      const match = html.match(regex);
      if (match) {
        return match[1].replace(/<[^>]*>/g, '').trim();
      }
    }
    return null;
  }
}

export default HtmlParser;
