/**
 * Search Suggestions Generator
 * Extracts and filters suggestions from event data
 */

/**
 * Extract unique suggestions from events
 * @param {Array} events - Array of event objects
 * @returns {Object} - Object with categorized suggestions
 */
export const extractSuggestions = (events) => {
  if (!events || events.length === 0) {
    return {
      eventNames: [],
      venues: [],
      tags: [],
      categories: [],
      all: []
    };
  }

  // Extract unique values
  const eventNames = [...new Set(events.map(e => e.name).filter(Boolean))];
  const venues = [...new Set(events.map(e => e.venue).filter(Boolean))];
  const tags = [...new Set(events.flatMap(e => e.tags || []))];
  const categories = [
    ...new Set([
      ...events.map(e => e.categoryPrimary).filter(Boolean),
      ...events.map(e => e.categorySecondary).filter(Boolean)
    ])
  ];

  // Combine all for comprehensive search
  const all = [
    ...eventNames,
    ...venues,
    ...tags,
    ...categories
  ].filter(Boolean);

  return {
    eventNames,
    venues,
    tags,
    categories,
    all: [...new Set(all)] // Remove duplicates
  };
};

/**
 * Filter suggestions based on search term
 * @param {Array} suggestions - Array of suggestion strings
 * @param {string} searchTerm - Current search input
 * @param {number} limit - Maximum number of suggestions to return
 * @returns {Array} - Filtered and sorted suggestions
 */
export const filterSuggestions = (suggestions, searchTerm, limit = 10) => {
  if (!searchTerm || searchTerm.trim() === '') {
    return [];
  }

  const normalizedSearch = searchTerm.toLowerCase().trim();
  const words = normalizedSearch.split(/\s+/);

  // Score each suggestion
  const scored = suggestions.map(suggestion => {
    const normalizedSuggestion = suggestion.toLowerCase();
    let score = 0;

    // Exact match (highest priority)
    if (normalizedSuggestion === normalizedSearch) {
      score += 1000;
    }

    // Starts with search term
    if (normalizedSuggestion.startsWith(normalizedSearch)) {
      score += 100;
    }

    // Contains all words
    const containsAllWords = words.every(word => 
      normalizedSuggestion.includes(word)
    );
    if (containsAllWords) {
      score += 50;
    }

    // Contains search term
    if (normalizedSuggestion.includes(normalizedSearch)) {
      score += 25;
    }

    // Partial word matches
    words.forEach(word => {
      if (normalizedSuggestion.includes(word)) {
        score += 10;
      }
    });

    return {
      text: suggestion,
      score,
      normalizedText: normalizedSuggestion
    };
  });

  // Filter out zero scores and sort by score
  return scored
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(item => item.text);
};

/**
 * Get smart suggestions with categorization
 * @param {Array} events - Array of event objects
 * @param {string} searchTerm - Current search input
 * @param {number} limit - Maximum suggestions per category
 * @returns {Array} - Array of suggestion objects with categories
 */
export const getSmartSuggestions = (events, searchTerm, limit = 8) => {
  if (!searchTerm || searchTerm.trim() === '') {
    return [];
  }

  const extracted = extractSuggestions(events);
  const allSuggestions = [];

  // Get top matches from each category
  const eventMatches = filterSuggestions(extracted.eventNames, searchTerm, 3);
  const venueMatches = filterSuggestions(extracted.venues, searchTerm, 2);
  const tagMatches = filterSuggestions(extracted.tags, searchTerm, 2);
  const categoryMatches = filterSuggestions(extracted.categories, searchTerm, 1);

  // Format with categories
  eventMatches.forEach(text => {
    allSuggestions.push({ text, category: 'event', icon: '🎪' });
  });

  venueMatches.forEach(text => {
    allSuggestions.push({ text, category: 'venue', icon: '📍' });
  });

  tagMatches.forEach(text => {
    allSuggestions.push({ text, category: 'tag', icon: '🏷️' });
  });

  categoryMatches.forEach(text => {
    allSuggestions.push({ text, category: 'category', icon: '📂' });
  });

  return allSuggestions.slice(0, limit);
};

/**
 * Highlight matching text in suggestion
 * @param {string} text - Original text
 * @param {string} searchTerm - Search term to highlight
 * @returns {Object} - Object with parts array for rendering
 */
export const highlightMatch = (text, searchTerm) => {
  if (!searchTerm || searchTerm.trim() === '') {
    return { parts: [{ text, highlight: false }] };
  }

  const normalizedSearch = searchTerm.toLowerCase().trim();
  const normalizedText = text.toLowerCase();
  const index = normalizedText.indexOf(normalizedSearch);

  if (index === -1) {
    return { parts: [{ text, highlight: false }] };
  }

  const before = text.substring(0, index);
  const match = text.substring(index, index + searchTerm.length);
  const after = text.substring(index + searchTerm.length);

  const parts = [];
  if (before) parts.push({ text: before, highlight: false });
  if (match) parts.push({ text: match, highlight: true });
  if (after) parts.push({ text: after, highlight: false });

  return { parts };
};

