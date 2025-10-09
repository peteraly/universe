// CTO Mission Control - Event Data Service
// Simulates server-side pagination and enterprise data management

export const EVENT_STATUS = {
  STAGING: 'staging',
  PUBLISHED: 'published', 
  ARCHIVED: 'archived',
  REJECTED: 'rejected'
};

export const AI_CONFIDENCE_LEVELS = {
  HIGH: 'high',      // 80-100%
  MEDIUM: 'medium',  // 60-79%
  LOW: 'low',        // 40-59%
  CRITICAL: 'critical' // <40%
};

// Mock event database with realistic data
const generateMockEvents = () => {
  const events = [];
  const categories = ['Music', 'Art', 'Food', 'Tech', 'Sports', 'Education', 'Business', 'Health'];
  const venues = ['Downtown Theater', 'City Park', 'Tech Hub', 'Art Gallery', 'Sports Complex', 'University', 'Convention Center', 'Community Center'];
  
  for (let i = 1; i <= 500; i++) {
    const confidence = Math.random() * 100;
    const confidenceLevel = confidence >= 80 ? AI_CONFIDENCE_LEVELS.HIGH :
                           confidence >= 60 ? AI_CONFIDENCE_LEVELS.MEDIUM :
                           confidence >= 40 ? AI_CONFIDENCE_LEVELS.LOW :
                           AI_CONFIDENCE_LEVELS.CRITICAL;
    
    events.push({
      id: `event-${i}`,
      name: `Event ${i}: ${categories[Math.floor(Math.random() * categories.length)]} Experience`,
      description: `Detailed description for event ${i}. This is a comprehensive event description that provides context and details about the event.`,
      category: categories[Math.floor(Math.random() * categories.length)],
      venue: venues[Math.floor(Math.random() * venues.length)],
      date: new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      time: `${Math.floor(Math.random() * 12) + 1}:${Math.floor(Math.random() * 4) * 15} ${Math.random() > 0.5 ? 'AM' : 'PM'}`,
      price: Math.random() > 0.3 ? `$${Math.floor(Math.random() * 100) + 10}` : 'Free',
      status: Math.random() > 0.7 ? EVENT_STATUS.PUBLISHED : EVENT_STATUS.STAGING,
      aiConfidence: Math.round(confidence * 10) / 10,
      aiConfidenceLevel: confidenceLevel,
      tags: categories.slice(0, Math.floor(Math.random() * 3) + 1),
      createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'system',
      lastModifiedBy: 'system',
      // Soft delete flag
      isArchived: false,
      archivedAt: null,
      archivedBy: null
    });
  }
  
  return events.sort((a, b) => a.aiConfidence - b.aiConfidence); // Sort by lowest confidence first
};

class EventService {
  constructor() {
    this.events = generateMockEvents();
    this.lastId = 500;
  }

  // Server-side pagination simulation
  async getEvents(options = {}) {
    const {
      page = 1,
      pageSize = 20,
      sortBy = 'aiConfidence',
      sortOrder = 'asc',
      filters = {},
      search = ''
    } = options;

    let filteredEvents = [...this.events];

    // Apply search filter
    if (search) {
      const searchLower = search.toLowerCase();
      filteredEvents = filteredEvents.filter(event =>
        event.name.toLowerCase().includes(searchLower) ||
        event.description.toLowerCase().includes(searchLower) ||
        event.category.toLowerCase().includes(searchLower) ||
        event.venue.toLowerCase().includes(searchLower)
      );
    }

    // Apply filters
    if (filters.status) {
      filteredEvents = filteredEvents.filter(event => event.status === filters.status);
    }
    if (filters.category) {
      filteredEvents = filteredEvents.filter(event => event.category === filters.category);
    }
    if (filters.confidenceLevel) {
      filteredEvents = filteredEvents.filter(event => event.aiConfidenceLevel === filters.confidenceLevel);
    }
    if (filters.dateFrom) {
      filteredEvents = filteredEvents.filter(event => event.date >= filters.dateFrom);
    }
    if (filters.dateTo) {
      filteredEvents = filteredEvents.filter(event => event.date <= filters.dateTo);
    }

    // Apply sorting
    filteredEvents.sort((a, b) => {
      let aVal = a[sortBy];
      let bVal = b[sortBy];
      
      if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }
      
      if (sortOrder === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });

    // Calculate pagination
    const totalItems = filteredEvents.length;
    const totalPages = Math.ceil(totalItems / pageSize);
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedEvents = filteredEvents.slice(startIndex, endIndex);

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 200));

    return {
      events: paginatedEvents,
      pagination: {
        page,
        pageSize,
        totalItems,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      },
      filters: {
        applied: filters,
        available: {
          categories: [...new Set(this.events.map(e => e.category))],
          statuses: Object.values(EVENT_STATUS),
          confidenceLevels: Object.values(AI_CONFIDENCE_LEVELS)
        }
      }
    };
  }

  // Get single event
  async getEvent(id) {
    const event = this.events.find(e => e.id === id);
    if (!event) {
      throw new Error('Event not found');
    }
    return event;
  }

  // Create new event
  async createEvent(eventData) {
    const newEvent = {
      id: `event-${++this.lastId}`,
      ...eventData,
      status: EVENT_STATUS.STAGING,
      aiConfidence: Math.random() * 100,
      aiConfidenceLevel: AI_CONFIDENCE_LEVELS.MEDIUM,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'current-user',
      lastModifiedBy: 'current-user',
      isArchived: false,
      archivedAt: null,
      archivedBy: null
    };
    
    this.events.unshift(newEvent);
    return newEvent;
  }

  // Update event
  async updateEvent(id, updates) {
    const eventIndex = this.events.findIndex(e => e.id === id);
    if (eventIndex === -1) {
      throw new Error('Event not found');
    }
    
    this.events[eventIndex] = {
      ...this.events[eventIndex],
      ...updates,
      updatedAt: new Date().toISOString(),
      lastModifiedBy: 'current-user'
    };
    
    return this.events[eventIndex];
  }

  // Soft delete event
  async archiveEvent(id, archivedBy) {
    const eventIndex = this.events.findIndex(e => e.id === id);
    if (eventIndex === -1) {
      throw new Error('Event not found');
    }
    
    this.events[eventIndex] = {
      ...this.events[eventIndex],
      isArchived: true,
      archivedAt: new Date().toISOString(),
      archivedBy: archivedBy || 'current-user',
      status: EVENT_STATUS.ARCHIVED
    };
    
    return this.events[eventIndex];
  }

  // Restore archived event
  async restoreEvent(id) {
    const eventIndex = this.events.findIndex(e => e.id === id);
    if (eventIndex === -1) {
      throw new Error('Event not found');
    }
    
    this.events[eventIndex] = {
      ...this.events[eventIndex],
      isArchived: false,
      archivedAt: null,
      archivedBy: null,
      status: EVENT_STATUS.STAGING
    };
    
    return this.events[eventIndex];
  }

  // Get analytics data
  async getAnalytics() {
    const total = this.events.length;
    const byStatus = this.events.reduce((acc, event) => {
      acc[event.status] = (acc[event.status] || 0) + 1;
      return acc;
    }, {});
    
    const byConfidence = this.events.reduce((acc, event) => {
      acc[event.aiConfidenceLevel] = (acc[event.aiConfidenceLevel] || 0) + 1;
      return acc;
    }, {});
    
    const avgConfidence = this.events.reduce((sum, event) => sum + event.aiConfidence, 0) / total;
    
    return {
      total,
      byStatus,
      byConfidence,
      avgConfidence: Math.round(avgConfidence * 10) / 10,
      lowConfidenceCount: this.events.filter(e => e.aiConfidenceLevel === AI_CONFIDENCE_LEVELS.CRITICAL).length
    };
  }
}

export const eventService = new EventService();
