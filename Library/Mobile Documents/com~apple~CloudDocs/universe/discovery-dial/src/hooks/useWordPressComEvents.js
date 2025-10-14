import { useState, useEffect, useCallback } from 'react';
import { 
  getWordPressComEventsWithFallback,
  getWordPressComEventsByCategoryWithFallback,
  getWordPressComEventsBySubcategoryWithFallback,
  searchWordPressComEventsWithFallback,
  getWordPressComCategoriesForDial,
  getWordPressComEventStats
} from '../data/wordpressComEvents';

/**
 * Custom hook for managing WordPress.com events
 * @param {Array} localEvents - Local events as fallback
 * @returns {object} WordPress.com events state and methods
 */
export const useWordPressComEvents = (localEvents = []) => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastFetch, setLastFetch] = useState(null);
  const [categories, setCategories] = useState([]);
  const [stats, setStats] = useState(null);

  // Load all events
  const loadAllEvents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const wordPressComEvents = await getWordPressComEventsWithFallback(localEvents);
      setEvents(wordPressComEvents);
      setLastFetch(new Date());
    } catch (err) {
      setError(err.message);
      console.error('Failed to load WordPress.com events:', err);
      // Fallback to local events
      setEvents(localEvents);
    } finally {
      setLoading(false);
    }
  }, [localEvents]);

  // Load events by category
  const loadEventsByCategory = useCallback(async (category) => {
    try {
      setLoading(true);
      setError(null);
      
      const categoryEvents = await getWordPressComEventsByCategoryWithFallback(category, localEvents);
      setEvents(categoryEvents);
      setLastFetch(new Date());
    } catch (err) {
      setError(err.message);
      console.error(`Failed to load WordPress.com events for category ${category}:`, err);
      // Fallback to local events filtered by category
      const filteredLocalEvents = localEvents.filter(event => 
        event.category === category || event.category === category.toLowerCase()
      );
      setEvents(filteredLocalEvents);
    } finally {
      setLoading(false);
    }
  }, [localEvents]);

  // Load events by subcategory
  const loadEventsBySubcategory = useCallback(async (subcategory) => {
    try {
      setLoading(true);
      setError(null);
      
      const subcategoryEvents = await getWordPressComEventsBySubcategoryWithFallback(subcategory, localEvents);
      setEvents(subcategoryEvents);
      setLastFetch(new Date());
    } catch (err) {
      setError(err.message);
      console.error(`Failed to load WordPress.com events for subcategory ${subcategory}:`, err);
      // Fallback to local events filtered by subcategory
      const filteredLocalEvents = localEvents.filter(event => 
        event.subcategory === subcategory || 
        event.subcategory === subcategory.toLowerCase()
      );
      setEvents(filteredLocalEvents);
    } finally {
      setLoading(false);
    }
  }, [localEvents]);

  // Search events
  const searchEvents = useCallback(async (keyword) => {
    try {
      setLoading(true);
      setError(null);
      
      const searchResults = await searchWordPressComEventsWithFallback(keyword, localEvents);
      setEvents(searchResults);
      setLastFetch(new Date());
    } catch (err) {
      setError(err.message);
      console.error(`Failed to search WordPress.com events for "${keyword}":`, err);
      // Fallback to local events filtered by keyword
      const filteredLocalEvents = localEvents.filter(event => 
        event.name.toLowerCase().includes(keyword.toLowerCase()) ||
        event.description.toLowerCase().includes(keyword.toLowerCase()) ||
        event.tags.some(tag => tag.toLowerCase().includes(keyword.toLowerCase()))
      );
      setEvents(filteredLocalEvents);
    } finally {
      setLoading(false);
    }
  }, [localEvents]);

  // Load categories
  const loadCategories = useCallback(async () => {
    try {
      const categoriesData = await getWordPressComCategoriesForDial();
      setCategories(categoriesData);
    } catch (err) {
      console.error('Failed to load WordPress.com categories:', err);
      setCategories([]);
    }
  }, []);

  // Load stats
  const loadStats = useCallback(async () => {
    try {
      const statsData = await getWordPressComEventStats();
      setStats(statsData);
    } catch (err) {
      console.error('Failed to load WordPress.com stats:', err);
      setStats(null);
    }
  }, []);

  // Refresh events
  const refreshEvents = useCallback(async () => {
    await loadAllEvents();
  }, [loadAllEvents]);

  // Auto-refresh events periodically
  useEffect(() => {
    const interval = setInterval(() => {
      if (lastFetch && Date.now() - lastFetch.getTime() > 5 * 60 * 1000) { // 5 minutes
        refreshEvents();
      }
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [lastFetch, refreshEvents]);

  // Load events and categories on mount
  useEffect(() => {
    loadAllEvents();
    loadCategories();
    loadStats();
  }, [loadAllEvents, loadCategories, loadStats]);

  return {
    events,
    loading,
    error,
    lastFetch,
    categories,
    stats,
    loadAllEvents,
    loadEventsByCategory,
    loadEventsBySubcategory,
    searchEvents,
    refreshEvents,
    loadCategories,
    loadStats
  };
};

/**
 * Hook for WordPress.com events with category filtering
 * @param {string} category - Event category
 * @param {Array} localEvents - Local events as fallback
 * @returns {object} WordPress.com events state and methods
 */
export const useWordPressComEventsByCategory = (category, localEvents = []) => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadEvents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const categoryEvents = await getWordPressComEventsByCategoryWithFallback(category, localEvents);
      setEvents(categoryEvents);
    } catch (err) {
      setError(err.message);
      console.error(`Failed to load WordPress.com events for category ${category}:`, err);
      // Fallback to local events filtered by category
      const filteredLocalEvents = localEvents.filter(event => 
        event.category === category || event.category === category.toLowerCase()
      );
      setEvents(filteredLocalEvents);
    } finally {
      setLoading(false);
    }
  }, [category, localEvents]);

  useEffect(() => {
    if (category) {
      loadEvents();
    }
  }, [category, loadEvents]);

  return {
    events,
    loading,
    error,
    loadEvents
  };
};

/**
 * Hook for WordPress.com events search
 * @param {string} keyword - Search keyword
 * @param {Array} localEvents - Local events as fallback
 * @returns {object} WordPress.com events state and methods
 */
export const useWordPressComEventsSearch = (keyword, localEvents = []) => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const search = useCallback(async () => {
    if (!keyword || keyword.trim().length < 2) {
      setEvents([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const searchResults = await searchWordPressComEventsWithFallback(keyword, localEvents);
      setEvents(searchResults);
    } catch (err) {
      setError(err.message);
      console.error(`Failed to search WordPress.com events for "${keyword}":`, err);
      // Fallback to local events filtered by keyword
      const filteredLocalEvents = localEvents.filter(event => 
        event.name.toLowerCase().includes(keyword.toLowerCase()) ||
        event.description.toLowerCase().includes(keyword.toLowerCase()) ||
        event.tags.some(tag => tag.toLowerCase().includes(keyword.toLowerCase()))
      );
      setEvents(filteredLocalEvents);
    } finally {
      setLoading(false);
    }
  }, [keyword, localEvents]);

  useEffect(() => {
    search();
  }, [search]);

  return {
    events,
    loading,
    error,
    search
  };
};
