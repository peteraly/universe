import { useState, useEffect, useCallback } from 'react';
import { 
  getWordPressEvents, 
  getWordPressEventsByCategory, 
  getWordPressEventsBySubcategory,
  searchWordPressEvents,
  getWordPressEventsWithFallback,
  getWordPressEventsByCategoryWithFallback
} from '../data/wordpressEvents';

/**
 * Custom hook for managing WordPress events
 * @param {Array} localEvents - Local events as fallback
 * @returns {object} WordPress events state and methods
 */
export const useWordPressEvents = (localEvents = []) => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastFetch, setLastFetch] = useState(null);

  // Load all events
  const loadAllEvents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const wordPressEvents = await getWordPressEventsWithFallback(localEvents);
      setEvents(wordPressEvents);
      setLastFetch(new Date());
    } catch (err) {
      setError(err.message);
      console.error('Failed to load WordPress events:', err);
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
      
      const categoryEvents = await getWordPressEventsByCategoryWithFallback(category, localEvents);
      setEvents(categoryEvents);
      setLastFetch(new Date());
    } catch (err) {
      setError(err.message);
      console.error(`Failed to load WordPress events for category ${category}:`, err);
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
      
      const subcategoryEvents = await getWordPressEventsBySubcategory(subcategory);
      setEvents(subcategoryEvents);
      setLastFetch(new Date());
    } catch (err) {
      setError(err.message);
      console.error(`Failed to load WordPress events for subcategory ${subcategory}:`, err);
      // Fallback to local events filtered by subcategory
      const filteredLocalEvents = localEvents.filter(event => 
        event.subcategory === subcategory || event.subcategory === subcategory.toLowerCase()
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
      
      const searchResults = await searchWordPressEvents(keyword);
      setEvents(searchResults);
      setLastFetch(new Date());
    } catch (err) {
      setError(err.message);
      console.error(`Failed to search WordPress events for "${keyword}":`, err);
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

  // Load events on mount
  useEffect(() => {
    loadAllEvents();
  }, [loadAllEvents]);

  return {
    events,
    loading,
    error,
    lastFetch,
    loadAllEvents,
    loadEventsByCategory,
    loadEventsBySubcategory,
    searchEvents,
    refreshEvents
  };
};

/**
 * Hook for WordPress events with category filtering
 * @param {string} category - Event category
 * @param {Array} localEvents - Local events as fallback
 * @returns {object} WordPress events state and methods
 */
export const useWordPressEventsByCategory = (category, localEvents = []) => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadEvents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const categoryEvents = await getWordPressEventsByCategoryWithFallback(category, localEvents);
      setEvents(categoryEvents);
    } catch (err) {
      setError(err.message);
      console.error(`Failed to load WordPress events for category ${category}:`, err);
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
 * Hook for WordPress events search
 * @param {string} keyword - Search keyword
 * @param {Array} localEvents - Local events as fallback
 * @returns {object} WordPress events state and methods
 */
export const useWordPressEventsSearch = (keyword, localEvents = []) => {
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
      
      const searchResults = await searchWordPressEvents(keyword);
      setEvents(searchResults);
    } catch (err) {
      setError(err.message);
      console.error(`Failed to search WordPress events for "${keyword}":`, err);
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
