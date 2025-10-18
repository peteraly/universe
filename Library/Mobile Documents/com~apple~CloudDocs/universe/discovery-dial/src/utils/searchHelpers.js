/**
 * Universal search function that searches through all event properties
 * @param {Array} events - Array of event objects
 * @param {string} searchTerm - Search query string
 * @returns {Array} - Filtered array of events
 */
export const searchEvents = (events, searchTerm) => {
  // If no search term, return all events
  if (!searchTerm || searchTerm.trim() === '') {
    return events;
  }

  // Normalize search term (lowercase, trim whitespace)
  const normalizedSearch = searchTerm.toLowerCase().trim();

  // Split search term into individual words for multi-word matching
  const searchWords = normalizedSearch.split(/\s+/);

  return events.filter(event => {
    // Create searchable string from all event properties
    const searchableContent = [
      event.name,
      event.description,
      event.venue,
      event.address,
      event.categoryPrimary,
      event.categorySecondary,
      event.time,
      event.day,
      event.organizer,
      event.price,
      // Join tags array into string
      ...(event.tags || []),
      // Include date in readable format
      event.date,
      // Include start/end times
      event.startTime,
      event.endTime,
      // Include any other custom fields
      event.source,
    ]
      .filter(Boolean) // Remove null/undefined values
      .join(' ') // Combine all into one string
      .toLowerCase(); // Normalize to lowercase

    // Check if ALL search words are found in the searchable content
    // This allows for "jazz washington" to match events with both words
    return searchWords.every(word => searchableContent.includes(word));
  });
};

/**
 * Debounce utility for search input
 * @param {Function} func - Function to debounce
 * @param {number} wait - Delay in milliseconds
 * @returns {Function} - Debounced function
 */
export const debounce = (func, wait = 300) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

