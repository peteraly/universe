/**
 * WordPress.com REST API Integration
 * This file handles integration with WordPress.com (hosted WordPress)
 */

const WORDPRESS_COM_API_URL = process.env.WORDPRESS_API_URL || 'https://hyyper.co/wp-json/wp/v2';

// Cache configuration
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const cache = new Map();

/**
 * Fetch data from WordPress.com REST API
 * @param {string} endpoint - API endpoint
 * @param {object} params - Query parameters
 * @returns {Promise<object>} API response data
 */
export async function fetchWordPressComAPI(endpoint, params = {}) {
  // Check cache first
  const cacheKey = JSON.stringify({ endpoint, params });
  const cached = cache.get(cacheKey);
  
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }

  try {
    const url = new URL(`${WORDPRESS_COM_API_URL}${endpoint}`);
    
    // Add query parameters
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== null) {
        url.searchParams.append(key, params[key]);
      }
    });

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    // Cache the result
    cache.set(cacheKey, {
      data: data,
      timestamp: Date.now()
    });

    return data;
  } catch (error) {
    console.error('WordPress.com API fetch error:', error);
    throw error;
  }
}

/**
 * Get all posts from WordPress.com
 * @param {object} options - Query options
 * @returns {Promise<Array>} Array of posts
 */
export async function getAllWordPressComPosts(options = {}) {
  const defaultOptions = {
    per_page: 100,
    orderby: 'date',
    order: 'desc',
    _embed: true, // Include embedded data (featured images, etc.)
    ...options
  };

  try {
    const posts = await fetchWordPressComAPI('/posts', defaultOptions);
    return posts.map(formatWordPressComPost);
  } catch (error) {
    console.error('Error fetching WordPress.com posts:', error);
    return [];
  }
}

/**
 * Get posts by category from WordPress.com
 * @param {string} categoryId - Category ID
 * @param {object} options - Query options
 * @returns {Promise<Array>} Array of posts
 */
export async function getWordPressComPostsByCategory(categoryId, options = {}) {
  const queryOptions = {
    categories: categoryId,
    per_page: 50,
    orderby: 'date',
    order: 'desc',
    _embed: true,
    ...options
  };

  try {
    const posts = await fetchWordPressComAPI('/posts', queryOptions);
    return posts.map(formatWordPressComPost);
  } catch (error) {
    console.error(`Error fetching WordPress.com posts for category ${categoryId}:`, error);
    return [];
  }
}

/**
 * Get posts by tag from WordPress.com
 * @param {string} tagId - Tag ID
 * @param {object} options - Query options
 * @returns {Promise<Array>} Array of posts
 */
export async function getWordPressComPostsByTag(tagId, options = {}) {
  const queryOptions = {
    tags: tagId,
    per_page: 50,
    orderby: 'date',
    order: 'desc',
    _embed: true,
    ...options
  };

  try {
    const posts = await fetchWordPressComAPI('/posts', queryOptions);
    return posts.map(formatWordPressComPost);
  } catch (error) {
    console.error(`Error fetching WordPress.com posts for tag ${tagId}:`, error);
    return [];
  }
}

/**
 * Search posts in WordPress.com
 * @param {string} keyword - Search keyword
 * @param {object} options - Query options
 * @returns {Promise<Array>} Array of posts
 */
export async function searchWordPressComPosts(keyword, options = {}) {
  const queryOptions = {
    search: keyword,
    per_page: 50,
    orderby: 'relevance',
    _embed: true,
    ...options
  };

  try {
    const posts = await fetchWordPressComAPI('/posts', queryOptions);
    return posts.map(formatWordPressComPost);
  } catch (error) {
    console.error(`Error searching WordPress.com posts for "${keyword}":`, error);
    return [];
  }
}

/**
 * Get categories from WordPress.com
 * @returns {Promise<Array>} Array of categories
 */
export async function getWordPressComCategories() {
  try {
    const categories = await fetchWordPressComAPI('/categories', {
      per_page: 100,
      orderby: 'name',
      order: 'asc'
    });
    return categories;
  } catch (error) {
    console.error('Error fetching WordPress.com categories:', error);
    return [];
  }
}

/**
 * Get tags from WordPress.com
 * @returns {Promise<Array>} Array of tags
 */
export async function getWordPressComTags() {
  try {
    const tags = await fetchWordPressComAPI('/tags', {
      per_page: 100,
      orderby: 'name',
      order: 'asc'
    });
    return tags;
  } catch (error) {
    console.error('Error fetching WordPress.com tags:', error);
    return [];
  }
}

/**
 * Format WordPress.com post data for Discovery Dial
 * @param {object} post - WordPress.com post data
 * @returns {object} Formatted event data
 */
function formatWordPressComPost(post) {
  // Extract featured image
  const featuredImage = post._embedded?.['wp:featuredmedia']?.[0];
  
  // Extract categories
  const categories = post._embedded?.['wp:term']?.[0] || [];
  
  // Extract tags
  const tags = post._embedded?.['wp:term']?.[1] || [];
  
  // Try to extract custom fields from meta or content
  const meta = post.meta || {};
  
  return {
    id: post.id,
    name: post.title.rendered,
    description: post.excerpt.rendered.replace(/<[^>]*>/g, ''), // Strip HTML
    address: meta.event_address || meta.event_location || 'TBD',
    time: formatEventTime(meta.event_date, meta.event_time, post.date),
    distance: meta.event_distance ? `${meta.event_distance} mi` : null,
    category: mapCategoryFromWordPress(meta.event_category, categories),
    subcategory: meta.event_subcategory || 'General',
    tags: tags.map(tag => tag.name),
    image: featuredImage?.source_url,
    imageAlt: featuredImage?.alt_text,
    slug: post.slug,
    date: post.date,
    source: 'wordpress.com',
    categories: categories.map(cat => cat.name),
    content: post.content.rendered
  };
}

/**
 * Format event time from WordPress.com data
 * @param {string} eventDate - Event date
 * @param {string} eventTime - Event time
 * @param {string} postDate - Post date
 * @returns {string} Formatted time string
 */
function formatEventTime(eventDate, eventTime, postDate) {
  if (eventDate && eventTime) {
    try {
      const date = new Date(eventDate);
      return date.toLocaleDateString() + ' at ' + eventTime;
    } catch (error) {
      console.error('Error formatting event time:', error);
    }
  }
  
  if (eventDate) {
    try {
      const date = new Date(eventDate);
      return date.toLocaleDateString();
    } catch (error) {
      console.error('Error formatting event date:', error);
    }
  }
  
  // Fallback to post date
  try {
    const date = new Date(postDate);
    return date.toLocaleDateString();
  } catch (error) {
    return 'TBD';
  }
}

/**
 * Map category from WordPress.com to Discovery Dial categories
 * @param {string} eventCategory - Event category from meta
 * @param {Array} categories - WordPress categories
 * @returns {string} Mapped category
 */
function mapCategoryFromWordPress(eventCategory, categories) {
  if (eventCategory) {
    const categoryMap = {
      'social': 'social',
      'educational': 'educational',
      'recreational': 'recreational',
      'professional': 'professional'
    };
    return categoryMap[eventCategory.toLowerCase()] || 'social';
  }
  
  // Try to map from WordPress categories
  if (categories && categories.length > 0) {
    const categoryName = categories[0].name.toLowerCase();
    if (categoryName.includes('social')) return 'social';
    if (categoryName.includes('education')) return 'educational';
    if (categoryName.includes('recreation')) return 'recreational';
    if (categoryName.includes('professional')) return 'professional';
  }
  
  return 'social'; // Default
}

/**
 * Clear the cache
 */
export function clearWordPressComCache() {
  cache.clear();
}

/**
 * Get cache statistics
 * @returns {object} Cache statistics
 */
export function getWordPressComCacheStats() {
  return {
    size: cache.size,
    entries: Array.from(cache.keys())
  };
}

/**
 * Test WordPress.com API connection
 * @returns {Promise<object>} Test result
 */
export async function testWordPressComConnection() {
  try {
    const response = await fetch(`${WORDPRESS_COM_API_URL}/posts?per_page=1`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return {
      success: true,
      message: 'WordPress.com API connection successful',
      data: data
    };
  } catch (error) {
    return {
      success: false,
      message: 'WordPress.com API connection failed',
      error: error.message
    };
  }
}
