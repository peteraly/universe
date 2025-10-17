/**
 * WordPress configuration
 * This file contains configuration settings for WordPress integration
 */

export const WORDPRESS_CONFIG = {
  // API endpoints
  API_URL: import.meta.env.VITE_WORDPRESS_API_URL || 'https://hyyper.co/graphql',
  REST_API_URL: import.meta.env.VITE_WORDPRESS_REST_API_URL || 
    (import.meta.env.DEV ? '/wp-json/wp/v2' : 'https://hyyper.co/wp-json/wp/v2'),
  
  // Authentication
  PREVIEW_SECRET: import.meta.env.VITE_WORDPRESS_PREVIEW_SECRET,
  USERNAME: import.meta.env.VITE_WORDPRESS_USERNAME,
  PASSWORD: import.meta.env.VITE_WORDPRESS_PASSWORD,
  
  // Cache settings
  CACHE_DURATION: 5 * 60 * 1000, // 5 minutes
  AUTO_REFRESH_INTERVAL: 5 * 60 * 1000, // 5 minutes
  
  // Query limits
  MAX_EVENTS_PER_QUERY: 100,
  MAX_EVENTS_PER_CATEGORY: 50,
  MAX_SEARCH_RESULTS: 50,
  
  // Fallback settings
  ENABLE_FALLBACK: true,
  FALLBACK_TIMEOUT: 10000, // 10 seconds
  
  // Error handling
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000, // 1 second
  
  // Event categories mapping
  CATEGORY_MAPPING: {
    'social': 'Social',
    'educational': 'Educational', 
    'recreational': 'Recreational',
    'professional': 'Professional'
  },
  
  // Default event data
  DEFAULT_EVENT: {
    name: 'No Event Selected',
    description: 'Select an event from the dial',
    address: 'TBD',
    time: 'TBD',
    distance: null,
    category: 'social',
    subcategory: 'general',
    tags: [],
    image: null,
    imageAlt: null,
    slug: null,
    source: 'wordpress'
  }
};

/**
 * WordPress GraphQL queries
 */
export const WORDPRESS_QUERIES = {
  // Get all events
  ALL_EVENTS: `
    query AllEvents {
      events(first: 100, where: { orderby: { field: DATE, order: DESC } }) {
        edges {
          node {
            id
            title
            excerpt
            slug
            date
            featuredImage {
              node {
                sourceUrl
                altText
              }
            }
            eventDetails {
              eventDate
              eventTime
              eventLocation
              eventAddress
              eventCategory
              eventSubcategory
              eventDistance
              eventTags
            }
          }
        }
      }
    }
  `,
  
  // Get event by slug
  EVENT_BY_SLUG: `
    query GetEventBySlug($slug: ID!) {
      event(id: $slug, idType: SLUG) {
        id
        title
        content
        excerpt
        slug
        date
        featuredImage {
          node {
            sourceUrl
            altText
          }
        }
        eventDetails {
          eventDate
          eventTime
          eventLocation
          eventAddress
          eventCategory
          eventSubcategory
          eventDistance
          eventTags
        }
      }
    }
  `,
  
  // Get events by category
  EVENTS_BY_CATEGORY: `
    query GetEventsByCategory($category: String!) {
      events(first: 50, where: { metaQuery: { key: "_event_category", value: $category } }) {
        edges {
          node {
            id
            title
            excerpt
            slug
            date
            featuredImage {
              node {
                sourceUrl
                altText
              }
            }
            eventDetails {
              eventDate
              eventTime
              eventLocation
              eventAddress
              eventCategory
              eventSubcategory
              eventDistance
              eventTags
            }
          }
        }
      }
    }
  `,
  
  // Search events
  SEARCH_EVENTS: `
    query SearchEvents($keyword: String!) {
      events(first: 50, where: { search: $keyword }) {
        edges {
          node {
            id
            title
            excerpt
            slug
            date
            featuredImage {
              node {
                sourceUrl
                altText
              }
            }
            eventDetails {
              eventDate
              eventTime
              eventLocation
              eventAddress
              eventCategory
              eventSubcategory
              eventDistance
              eventTags
            }
          }
        }
      }
    }
  `
};

/**
 * WordPress utility functions
 */
export const WORDPRESS_UTILS = {
  /**
   * Check if WordPress is configured
   * @returns {boolean} True if WordPress is configured
   */
  isConfigured: () => {
    return !!WORDPRESS_CONFIG.API_URL && 
           WORDPRESS_CONFIG.API_URL !== 'https://your-wordpress-site.com/graphql';
  },
  
  /**
   * Get WordPress API URL
   * @returns {string} WordPress API URL
   */
  getApiUrl: () => WORDPRESS_CONFIG.API_URL,
  
  /**
   * Get WordPress REST API URL
   * @returns {string} WordPress REST API URL
   */
  getRestApiUrl: () => WORDPRESS_CONFIG.REST_API_URL,
  
  /**
   * Check if authentication is configured
   * @returns {boolean} True if authentication is configured
   */
  hasAuth: () => {
    return !!(WORDPRESS_CONFIG.PREVIEW_SECRET || 
              (WORDPRESS_CONFIG.USERNAME && WORDPRESS_CONFIG.PASSWORD));
  },
  
  /**
   * Get authentication headers
   * @returns {object} Authentication headers
   */
  getAuthHeaders: () => {
    const headers = {};
    
    if (WORDPRESS_CONFIG.PREVIEW_SECRET) {
      headers['Authorization'] = `Bearer ${WORDPRESS_CONFIG.PREVIEW_SECRET}`;
    } else if (WORDPRESS_CONFIG.USERNAME && WORDPRESS_CONFIG.PASSWORD) {
      const credentials = btoa(`${WORDPRESS_CONFIG.USERNAME}:${WORDPRESS_CONFIG.PASSWORD}`);
      headers['Authorization'] = `Basic ${credentials}`;
    }
    
    return headers;
  },
  
  /**
   * Map category name
   * @param {string} category - Category key
   * @returns {string} Mapped category name
   */
  mapCategory: (category) => {
    return WORDPRESS_CONFIG.CATEGORY_MAPPING[category] || category;
  },
  
  /**
   * Format event data from WordPress
   * @param {object} event - WordPress event data
   * @returns {object} Formatted event data
   */
  formatEvent: (event) => {
    return {
      id: event.id,
      name: event.title,
      description: event.excerpt,
      address: event.eventAddress || event.eventLocation,
      time: WORDPRESS_UTILS.formatEventTime(event.eventDate, event.eventTime),
      distance: event.eventDistance ? `${event.eventDistance} mi` : null,
      category: event.eventCategory,
      subcategory: event.eventSubcategory,
      tags: event.eventTags ? event.eventTags.split(',').map(tag => tag.trim()) : [],
      image: event.image,
      imageAlt: event.imageAlt,
      slug: event.slug,
      date: event.date,
      source: 'wordpress'
    };
  },
  
  /**
   * Format event time
   * @param {string} date - Event date
   * @param {string} time - Event time
   * @returns {string} Formatted time string
   */
  formatEventTime: (date, time) => {
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
};
