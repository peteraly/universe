import { 
  getAllWordPressComPosts, 
  getWordPressComPostsByCategory, 
  getWordPressComPostsByTag,
  searchWordPressComPosts,
  getWordPressComCategories,
  getWordPressComTags
} from '../lib/wordpressCom';

/**
 * Get all WordPress.com posts formatted as events
 * @param {Array} localEvents - Local events as fallback
 * @returns {Promise<Array>} Combined events array
 */
export async function getWordPressComEventsWithFallback(localEvents = []) {
  try {
    const wordPressComPosts = await getAllWordPressComPosts();
    
    // Combine WordPress.com posts with local events
    const combinedEvents = [...wordPressComPosts, ...localEvents];
    
    // Remove duplicates based on name and time
    const uniqueEvents = combinedEvents.filter((event, index, self) => 
      index === self.findIndex(e => e.name === event.name && e.time === event.time)
    );
    
    return uniqueEvents;
  } catch (error) {
    console.error('Error fetching WordPress.com events with fallback:', error);
    return localEvents;
  }
}

/**
 * Get WordPress.com posts by category with fallback
 * @param {string} category - Event category
 * @param {Array} localEvents - Local events as fallback
 * @returns {Promise<Array>} Combined events array
 */
export async function getWordPressComEventsByCategoryWithFallback(category, localEvents = []) {
  try {
    // First, get all categories to find the right one
    const categories = await getWordPressComCategories();
    const categoryObj = categories.find(cat => 
      cat.name.toLowerCase().includes(category.toLowerCase()) ||
      category.toLowerCase().includes(cat.name.toLowerCase())
    );
    
    let wordPressComPosts = [];
    
    if (categoryObj) {
      wordPressComPosts = await getWordPressComPostsByCategory(categoryObj.id);
    } else {
      // Fallback: get all posts and filter by category
      const allPosts = await getAllWordPressComPosts();
      wordPressComPosts = allPosts.filter(post => 
        post.category === category || post.category === category.toLowerCase()
      );
    }
    
    // Filter local events by category
    const filteredLocalEvents = localEvents.filter(event => 
      event.category === category || event.category === category.toLowerCase()
    );
    
    // Combine WordPress.com posts with filtered local events
    const combinedEvents = [...wordPressComPosts, ...filteredLocalEvents];
    
    // Remove duplicates
    const uniqueEvents = combinedEvents.filter((event, index, self) => 
      index === self.findIndex(e => e.name === event.name && e.time === event.time)
    );
    
    return uniqueEvents;
  } catch (error) {
    console.error(`Error fetching WordPress.com events for category ${category} with fallback:`, error);
    return localEvents.filter(event => 
      event.category === category || event.category === category.toLowerCase()
    );
  }
}

/**
 * Get WordPress.com posts by subcategory with fallback
 * @param {string} subcategory - Event subcategory
 * @param {Array} localEvents - Local events as fallback
 * @returns {Promise<Array>} Combined events array
 */
export async function getWordPressComEventsBySubcategoryWithFallback(subcategory, localEvents = []) {
  try {
    // Get all posts and filter by subcategory
    const allPosts = await getAllWordPressComPosts();
    const subcategoryPosts = allPosts.filter(post => 
      post.subcategory === subcategory || 
      post.subcategory === subcategory.toLowerCase() ||
      post.tags.some(tag => tag.toLowerCase().includes(subcategory.toLowerCase()))
    );
    
    // Filter local events by subcategory
    const filteredLocalEvents = localEvents.filter(event => 
      event.subcategory === subcategory || 
      event.subcategory === subcategory.toLowerCase()
    );
    
    // Combine WordPress.com posts with filtered local events
    const combinedEvents = [...subcategoryPosts, ...filteredLocalEvents];
    
    // Remove duplicates
    const uniqueEvents = combinedEvents.filter((event, index, self) => 
      index === self.findIndex(e => e.name === event.name && e.time === event.time)
    );
    
    return uniqueEvents;
  } catch (error) {
    console.error(`Error fetching WordPress.com events for subcategory ${subcategory} with fallback:`, error);
    return localEvents.filter(event => 
      event.subcategory === subcategory || 
      event.subcategory === subcategory.toLowerCase()
    );
  }
}

/**
 * Search WordPress.com posts with fallback
 * @param {string} keyword - Search keyword
 * @param {Array} localEvents - Local events as fallback
 * @returns {Promise<Array>} Combined events array
 */
export async function searchWordPressComEventsWithFallback(keyword, localEvents = []) {
  try {
    const searchResults = await searchWordPressComPosts(keyword);
    
    // Filter local events by keyword
    const filteredLocalEvents = localEvents.filter(event => 
      event.name.toLowerCase().includes(keyword.toLowerCase()) ||
      event.description.toLowerCase().includes(keyword.toLowerCase()) ||
      event.tags.some(tag => tag.toLowerCase().includes(keyword.toLowerCase()))
    );
    
    // Combine search results with filtered local events
    const combinedEvents = [...searchResults, ...filteredLocalEvents];
    
    // Remove duplicates
    const uniqueEvents = combinedEvents.filter((event, index, self) => 
      index === self.findIndex(e => e.name === event.name && e.time === event.time)
    );
    
    return uniqueEvents;
  } catch (error) {
    console.error(`Error searching WordPress.com events for "${keyword}" with fallback:`, error);
    return localEvents.filter(event => 
      event.name.toLowerCase().includes(keyword.toLowerCase()) ||
      event.description.toLowerCase().includes(keyword.toLowerCase()) ||
      event.tags.some(tag => tag.toLowerCase().includes(keyword.toLowerCase()))
    );
  }
}

/**
 * Get WordPress.com categories for Discovery Dial
 * @returns {Promise<Array>} Array of categories
 */
export async function getWordPressComCategoriesForDial() {
  try {
    const categories = await getWordPressComCategories();
    
    // Map WordPress.com categories to Discovery Dial categories
    const dialCategories = [
      { key: 'social', label: 'Social', count: 0 },
      { key: 'educational', label: 'Educational', count: 0 },
      { key: 'recreational', label: 'Recreational', count: 0 },
      { key: 'professional', label: 'Professional', count: 0 }
    ];
    
    // Count posts for each category
    for (const category of dialCategories) {
      try {
        const posts = await getWordPressComPostsByCategory(category.key);
        category.count = posts.length;
      } catch (error) {
        console.error(`Error counting posts for category ${category.key}:`, error);
        category.count = 0;
      }
    }
    
    return dialCategories;
  } catch (error) {
    console.error('Error fetching WordPress.com categories for dial:', error);
    return [
      { key: 'social', label: 'Social', count: 0 },
      { key: 'educational', label: 'Educational', count: 0 },
      { key: 'recreational', label: 'Recreational', count: 0 },
      { key: 'professional', label: 'Professional', count: 0 }
    ];
  }
}

/**
 * Get WordPress.com tags for Discovery Dial
 * @returns {Promise<Array>} Array of tags
 */
export async function getWordPressComTagsForDial() {
  try {
    const tags = await getWordPressComTags();
    return tags.map(tag => ({
      id: tag.id,
      name: tag.name,
      count: tag.count
    }));
  } catch (error) {
    console.error('Error fetching WordPress.com tags for dial:', error);
    return [];
  }
}

/**
 * Get WordPress.com event statistics
 * @returns {Promise<object>} Event statistics
 */
export async function getWordPressComEventStats() {
  try {
    const [allPosts, categories, tags] = await Promise.all([
      getAllWordPressComPosts(),
      getWordPressComCategories(),
      getWordPressComTags()
    ]);
    
    return {
      totalEvents: allPosts.length,
      totalCategories: categories.length,
      totalTags: tags.length,
      categories: categories.map(cat => ({
        name: cat.name,
        count: cat.count
      })),
      tags: tags.map(tag => ({
        name: tag.name,
        count: tag.count
      }))
    };
  } catch (error) {
    console.error('Error fetching WordPress.com event stats:', error);
    return {
      totalEvents: 0,
      totalCategories: 0,
      totalTags: 0,
      categories: [],
      tags: []
    };
  }
}
