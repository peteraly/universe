import BaseParser from './BaseParser.js';

class RssParser extends BaseParser {
  constructor() {
    super();
    this.name = 'rss';
    this.confidence = 0.9;
  }

  async parse(url) {
    const rssUrls = [
      `${url}/feed`,
      `${url}/rss`,
      `${url}/events/feed`,
      `${url}/calendar/feed`,
      `${url}/events.rss`
    ];

    for (const rssUrl of rssUrls) {
      try {
        const response = await fetch(rssUrl);
        if (response.ok) {
          const xml = await response.text();
          const events = this.parseRssXml(xml);
          if (events.length > 0) {
            return {
              events: events.map(event => this.normalizeEvent(event)),
              confidence: this.confidence,
              method: this.name,
              feedUrl: rssUrl
            };
          }
        }
      } catch (error) {
        continue;
      }
    }

    return { events: [], confidence: 0, method: this.name };
  }

  parseRssXml(xml) {
    const events = [];
    const itemMatches = xml.match(/<item>(.*?)<\/item>/gs);
    
    if (itemMatches) {
      itemMatches.forEach(item => {
        const title = this.extractTag(item, 'title');
        const description = this.extractTag(item, 'description');
        const pubDate = this.extractTag(item, 'pubDate');
        const link = this.extractTag(item, 'link');
        
        if (title) {
          events.push({
            title: title,
            description: description,
            date: pubDate,
            url: link
          });
        }
      });
    }
    
    return events;
  }

  extractTag(xml, tagName) {
    const regex = new RegExp(`<${tagName}>(.*?)<\/${tagName}>`, 's');
    const match = xml.match(regex);
    return match ? match[1].trim() : null;
  }
}

export default RssParser;
