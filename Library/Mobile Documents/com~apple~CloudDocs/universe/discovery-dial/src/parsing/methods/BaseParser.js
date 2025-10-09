class BaseParser {
  constructor() {
    this.name = 'base';
    this.confidence = 0;
  }

  async parse(url) {
    throw new Error('parse method must be implemented');
  }

  normalizeEvent(event) {
    return {
      title: event.title || event.name || event.event_title,
      description: event.description || event.summary,
      date: event.date || event.start_date || event.event_date,
      time: event.time || event.start_time || event.event_time,
      location: event.location || event.venue || event.address,
      price: event.price || event.cost || event.ticket_price,
      url: event.url || event.link || event.event_url,
      image: event.image || event.image_url,
      source: this.name
    };
  }
}

export default BaseParser;
