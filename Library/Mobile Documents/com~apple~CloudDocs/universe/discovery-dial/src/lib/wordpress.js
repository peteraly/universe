const WORDPRESS_API_URL = process.env.WORDPRESS_API_URL;

// Cache configuration
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const cache = new Map();

/**
 * Fetch data from WordPress GraphQL API
 * @param {string} query - GraphQL query string
 * @param {object} options - Options including variables
 * @returns {Promise<object>} GraphQL response data
 */
export async function fetchAPI(query, { variables } = {}) {
  // Check cache first
  const cacheKey = JSON.stringify({ query, variables });
  const cached = cache.get(cacheKey);
  
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }

  const headers = { 'Content-Type': 'application/json' };

  // Add authentication if available
  if (process.env.WORDPRESS_PREVIEW_SECRET) {
    headers['Authorization'] = `Bearer ${process.env.WORDPRESS_PREVIEW_SECRET}`;
  }

  // Add basic auth if available
  if (process.env.WORDPRESS_USERNAME && process.env.WORDPRESS_PASSWORD) {
    const credentials = btoa(`${process.env.WORDPRESS_USERNAME}:${process.env.WORDPRESS_PASSWORD}`);
    headers['Authorization'] = `Basic ${credentials}`;
  }

  try {
    const res = await fetch(WORDPRESS_API_URL, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        query,
        variables,
      }),
    });

    const json = await res.json();
    
    if (json.errors) {
      console.error('GraphQL errors:', json.errors);
      throw new Error('Failed to fetch API');
    }

    // Cache the result
    cache.set(cacheKey, {
      data: json.data,
      timestamp: Date.now()
    });

    return json.data;
  } catch (error) {
    console.error('WordPress API fetch error:', error);
    throw error;
  }
}

/**
 * Get all events from WordPress
 * @param {boolean} preview - Whether to fetch preview content
 * @returns {Promise<Array>} Array of events
 */
export async function getAllEvents(preview = false) {
  const data = await fetchAPI(`
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
  `);

  return data.events?.edges?.map(edge => ({
    id: edge.node.id,
    title: edge.node.title,
    excerpt: edge.node.excerpt,
    slug: edge.node.slug,
    date: edge.node.date,
    image: edge.node.featuredImage?.node?.sourceUrl,
    imageAlt: edge.node.featuredImage?.node?.altText,
    ...edge.node.eventDetails
  })) || [];
}

/**
 * Get a single event by slug
 * @param {string} slug - Event slug
 * @param {boolean} preview - Whether to fetch preview content
 * @returns {Promise<object>} Event data
 */
export async function getEventBySlug(slug, preview = false) {
  const data = await fetchAPI(`
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
  `, {
    variables: { slug },
  });

  return data.event;
}

/**
 * Get events by category
 * @param {string} category - Event category
 * @param {boolean} preview - Whether to fetch preview content
 * @returns {Promise<Array>} Array of events
 */
export async function getEventsByCategory(category, preview = false) {
  const data = await fetchAPI(`
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
  `, {
    variables: { category },
  });

  return data.events?.edges?.map(edge => ({
    id: edge.node.id,
    title: edge.node.title,
    excerpt: edge.node.excerpt,
    slug: edge.node.slug,
    date: edge.node.date,
    image: edge.node.featuredImage?.node?.sourceUrl,
    imageAlt: edge.node.featuredImage?.node?.altText,
    ...edge.node.eventDetails
  })) || [];
}

/**
 * Get events by subcategory
 * @param {string} subcategory - Event subcategory
 * @param {boolean} preview - Whether to fetch preview content
 * @returns {Promise<Array>} Array of events
 */
export async function getEventsBySubcategory(subcategory, preview = false) {
  const data = await fetchAPI(`
    query GetEventsBySubcategory($subcategory: String!) {
      events(first: 50, where: { metaQuery: { key: "_event_subcategory", value: $subcategory } }) {
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
  `, {
    variables: { subcategory },
  });

  return data.events?.edges?.map(edge => ({
    id: edge.node.id,
    title: edge.node.title,
    excerpt: edge.node.excerpt,
    slug: edge.node.slug,
    date: edge.node.date,
    image: edge.node.featuredImage?.node?.sourceUrl,
    imageAlt: edge.node.featuredImage?.node?.altText,
    ...edge.node.eventDetails
  })) || [];
}

/**
 * Search events by keyword
 * @param {string} keyword - Search keyword
 * @param {boolean} preview - Whether to fetch preview content
 * @returns {Promise<Array>} Array of events
 */
export async function searchEvents(keyword, preview = false) {
  const data = await fetchAPI(`
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
  `, {
    variables: { keyword },
  });

  return data.events?.edges?.map(edge => ({
    id: edge.node.id,
    title: edge.node.title,
    excerpt: edge.node.excerpt,
    slug: edge.node.slug,
    date: edge.node.date,
    image: edge.node.featuredImage?.node?.sourceUrl,
    imageAlt: edge.node.featuredImage?.node?.altText,
    ...edge.node.eventDetails
  })) || [];
}

/**
 * Clear the cache
 */
export function clearCache() {
  cache.clear();
}

/**
 * Get cache statistics
 * @returns {object} Cache statistics
 */
export function getCacheStats() {
  return {
    size: cache.size,
    entries: Array.from(cache.keys())
  };
}
