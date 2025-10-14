import { getAllEvents, getEventsByCategory, getEventsBySubcategory, searchEvents } from '../lib/wordpress';

/**
 * Format event time from date and time strings
 * @param {string} date - Event date
 * @param {string} time - Event time
 * @returns {string} Formatted time string
 */
function formatEventTime(date, time) {
  if (!date && !time) return 'TBD';
  
  try {
    const eventDate = new Date(date);
    const timeStr = time || '12:00';
    
    return eventDate.toLocaleDateString() + ' at ' + timeStr;
  } catch (error) {
    console.error('Error formatting event time:', error);
    return 'TBD';
  }
}

/**
 * Get all WordPress events formatted for the Discovery Dial
 * @returns {Promise<Array>} Array of formatted events
 */
export async function getWordPressEvents() {
  try {
    const events = await getAllEvents();
    return events.map(event => ({
      id: event.id,
      name: event.title,
      description: event.excerpt,
      address: event.eventAddress || event.eventLocation,
      time: formatEventTime(event.eventDate, event.eventTime),
      distance: event.eventDistance ? `${event.eventDistance} mi` : null,
      category: event.eventCategory,
      subcategory: event.eventSubcategory,
      tags: event.eventTags ? event.eventTags.split(',').map(tag => tag.trim()) : [],
      image: event.image,
      imageAlt: event.imageAlt,
      slug: event.slug,
      date: event.date,
      source: 'wordpress'
    }));
  } catch (error) {
    console.error('Error fetching WordPress events:', error);
    return [];
  }
}

/**
 * Get WordPress events by category
 * @param {string} category - Event category
 * @returns {Promise<Array>} Array of formatted events
 */
export async function getWordPressEventsByCategory(category) {
  try {
    const events = await getEventsByCategory(category);
    return events.map(event => ({
      id: event.id,
      name: event.title,
      description: event.excerpt,
      address: event.eventAddress || event.eventLocation,
      time: formatEventTime(event.eventDate, event.eventTime),
      distance: event.eventDistance ? `${event.eventDistance} mi` : null,
      category: event.eventCategory,
      subcategory: event.eventSubcategory,
      tags: event.eventTags ? event.eventTags.split(',').map(tag => tag.trim()) : [],
      image: event.image,
      imageAlt: event.imageAlt,
      slug: event.slug,
      date: event.date,
      source: 'wordpress'
    }));
  } catch (error) {
    console.error(`Error fetching WordPress events for category ${category}:`, error);
    return [];
  }
}

/**
 * Get WordPress events by subcategory
 * @param {string} subcategory - Event subcategory
 * @returns {Promise<Array>} Array of formatted events
 */
export async function getWordPressEventsBySubcategory(subcategory) {
  try {
    const events = await getEventsBySubcategory(subcategory);
    return events.map(event => ({
      id: event.id,
      name: event.title,
      description: event.excerpt,
      address: event.eventAddress || event.eventLocation,
      time: formatEventTime(event.eventDate, event.eventTime),
      distance: event.eventDistance ? `${event.eventDistance} mi` : null,
      category: event.eventCategory,
      subcategory: event.eventSubcategory,
      tags: event.eventTags ? event.eventTags.split(',').map(tag => tag.trim()) : [],
      image: event.image,
      imageAlt: event.imageAlt,
      slug: event.slug,
      date: event.date,
      source: 'wordpress'
    }));
  } catch (error) {
    console.error(`Error fetching WordPress events for subcategory ${subcategory}:`, error);
    return [];
  }
}

/**
 * Search WordPress events
 * @param {string} keyword - Search keyword
 * @returns {Promise<Array>} Array of formatted events
 */
export async function searchWordPressEvents(keyword) {
  try {
    const events = await searchEvents(keyword);
    return events.map(event => ({
      id: event.id,
      name: event.title,
      description: event.excerpt,
      address: event.eventAddress || event.eventLocation,
      time: formatEventTime(event.eventDate, event.eventTime),
      distance: event.eventDistance ? `${event.eventDistance} mi` : null,
      category: event.eventCategory,
      subcategory: event.eventSubcategory,
      tags: event.eventTags ? event.eventTags.split(',').map(tag => tag.trim()) : [],
      image: event.image,
      imageAlt: event.imageAlt,
      slug: event.slug,
      date: event.date,
      source: 'wordpress'
    }));
  } catch (error) {
    console.error(`Error searching WordPress events for "${keyword}":`, error);
    return [];
  }
}

/**
 * Get WordPress events with fallback to local data
 * @param {Array} localEvents - Local events as fallback
 * @returns {Promise<Array>} Combined events array
 */
export async function getWordPressEventsWithFallback(localEvents = []) {
  try {
    const wordPressEvents = await getWordPressEvents();
    
    // Combine WordPress events with local events
    const combinedEvents = [...wordPressEvents, ...localEvents];
    
    // Remove duplicates based on name and time
    const uniqueEvents = combinedEvents.filter((event, index, self) => 
      index === self.findIndex(e => e.name === event.name && e.time === event.time)
    );
    
    return uniqueEvents;
  } catch (error) {
    console.error('Error fetching WordPress events with fallback:', error);
    return localEvents;
  }
}

/**
 * Get WordPress events by category with fallback
 * @param {string} category - Event category
 * @param {Array} localEvents - Local events as fallback
 * @returns {Promise<Array>} Combined events array
 */
export async function getWordPressEventsByCategoryWithFallback(category, localEvents = []) {
  try {
    const wordPressEvents = await getWordPressEventsByCategory(category);
    
    // Filter local events by category
    const filteredLocalEvents = localEvents.filter(event => 
      event.category === category || event.category === category.toLowerCase()
    );
    
    // Combine WordPress events with filtered local events
    const combinedEvents = [...wordPressEvents, ...filteredLocalEvents];
    
    // Remove duplicates
    const uniqueEvents = combinedEvents.filter((event, index, self) => 
      index === self.findIndex(e => e.name === event.name && e.time === event.time)
    );
    
    return uniqueEvents;
  } catch (error) {
    console.error(`Error fetching WordPress events for category ${category} with fallback:`, error);
    return localEvents.filter(event => 
      event.category === category || event.category === category.toLowerCase()
    );
  }
}
