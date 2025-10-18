# Universal Search Bar Implementation - Minimalist & Reliable

## 🎯 Objective

Create a simple, minimalist search bar that allows users to search events by **anything**: event name, tags, location, venue, description, category, time, organizer, or any text content.

---

## 🎨 Design Requirements

### Visual Design (Minimalist)
- **Single input field** with search icon
- **Clean, minimal styling** - white/light gray background, subtle border
- **Fixed position** at the top of the screen (above map)
- **Full-width** on mobile, **centered with max-width** on desktop
- **Placeholder text**: "Search events by name, location, tag, or keyword..."
- **Search icon**: 🔍 or SVG icon on the left side
- **Clear button**: ✕ appears when text is entered (right side)
- **No dropdown** - instant filter as you type
- **Smooth animations** - fade in/out results

### UX Requirements
- **Real-time search** - filters as user types (debounced)
- **Case-insensitive** matching
- **Partial matching** - "jazz" matches "Jazz Night" or "Classical & Jazz"
- **No "search" button needed** - auto-filters on typing
- **Clear search easily** - X button or ESC key
- **Show result count** - "Showing 12 of 365 events"
- **Highlight search terms** in results (optional)
- **Fast performance** - search through 365 events instantly

---

## 🛠️ Technical Implementation

### Component Structure

Create: `discovery-dial/src/components/UniversalSearchBar.jsx`

```jsx
import React, { useState, useCallback, useEffect, useRef } from 'react';

const UniversalSearchBar = ({ onSearch, totalEvents, filteredCount }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const inputRef = useRef(null);

  // Debounce search for performance (300ms delay)
  useEffect(() => {
    const timer = setTimeout(() => {
      onSearch(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm, onSearch]);

  const handleClear = useCallback(() => {
    setSearchTerm('');
    inputRef.current?.focus();
  }, []);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape') {
      handleClear();
    }
  }, [handleClear]);

  return (
    <div className="universal-search-container">
      <div className="search-bar-wrapper">
        {/* Search Icon */}
        <span className="search-icon" aria-hidden="true">
          🔍
        </span>

        {/* Input Field */}
        <input
          ref={inputRef}
          type="text"
          className="search-input"
          placeholder="Search events by name, location, tag, or keyword..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={handleKeyDown}
          aria-label="Search events"
          autoComplete="off"
          spellCheck="false"
        />

        {/* Clear Button */}
        {searchTerm && (
          <button
            className="search-clear-btn"
            onClick={handleClear}
            aria-label="Clear search"
            type="button"
          >
            ✕
          </button>
        )}
      </div>

      {/* Result Count */}
      {searchTerm && (
        <div className="search-result-count">
          {filteredCount === 0 ? (
            <span className="no-results">No events found</span>
          ) : (
            <span className="results-found">
              Showing {filteredCount} of {totalEvents} events
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default UniversalSearchBar;
```

### Search Logic Function

Create: `discovery-dial/src/utils/searchHelpers.js`

```javascript
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
 * Highlight search terms in text (optional enhancement)
 * @param {string} text - Original text
 * @param {string} searchTerm - Term to highlight
 * @returns {string} - HTML string with highlighted terms
 */
export const highlightSearchTerm = (text, searchTerm) => {
  if (!text || !searchTerm) return text;

  const regex = new RegExp(`(${searchTerm})`, 'gi');
  return text.replace(regex, '<mark>$1</mark>');
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
```

### CSS Styling (Minimalist)

Add to: `discovery-dial/src/components/UniversalSearchBar.css`

```css
/* Universal Search Container */
.universal-search-container {
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  width: 90%;
  max-width: 600px;
  z-index: 1000; /* Above map, below dialogs */
  pointer-events: auto;
}

/* Search Bar Wrapper */
.search-bar-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  padding: 12px 16px;
  border: 1px solid rgba(0, 0, 0, 0.08);
  transition: all 0.2s ease;
}

.search-bar-wrapper:focus-within {
  box-shadow: 0 6px 30px rgba(0, 0, 0, 0.2);
  border-color: rgba(0, 0, 0, 0.12);
}

/* Search Icon */
.search-icon {
  font-size: 18px;
  color: rgba(0, 0, 0, 0.5);
  margin-right: 12px;
  flex-shrink: 0;
}

/* Input Field */
.search-input {
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  font-size: 16px;
  color: #000000;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  padding: 0;
  width: 100%;
}

.search-input::placeholder {
  color: rgba(0, 0, 0, 0.4);
}

.search-input::-webkit-search-cancel-button {
  display: none;
}

/* Clear Button */
.search-clear-btn {
  background: rgba(0, 0, 0, 0.1);
  border: none;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 14px;
  color: rgba(0, 0, 0, 0.6);
  flex-shrink: 0;
  margin-left: 8px;
  transition: all 0.2s ease;
}

.search-clear-btn:hover {
  background: rgba(0, 0, 0, 0.15);
  color: #000000;
}

.search-clear-btn:active {
  transform: scale(0.95);
}

/* Result Count */
.search-result-count {
  margin-top: 8px;
  text-align: center;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.9);
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(10px);
  padding: 6px 16px;
  border-radius: 12px;
  display: inline-block;
  width: auto;
  margin-left: 50%;
  transform: translateX(-50%);
}

.no-results {
  color: #ff6b6b;
}

.results-found {
  color: #ffffff;
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .universal-search-container {
    top: 10px;
    width: 95%;
    max-width: none;
  }

  .search-bar-wrapper {
    padding: 10px 14px;
    border-radius: 20px;
  }

  .search-input {
    font-size: 14px;
  }

  .search-icon {
    font-size: 16px;
    margin-right: 10px;
  }

  .search-result-count {
    font-size: 12px;
    padding: 4px 12px;
  }
}

/* Prevent text selection on search UI */
.search-bar-wrapper,
.search-result-count {
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
}

/* Allow text selection in input */
.search-input {
  -webkit-user-select: text;
  -moz-user-select: text;
  -ms-user-select: text;
  user-select: text;
}

/* Optional: Highlight matched terms in results */
.search-input mark {
  background-color: rgba(255, 235, 59, 0.6);
  color: inherit;
  padding: 0 2px;
  border-radius: 2px;
}
```

---

## 📋 Integration Steps

### Step 1: Add Search Bar to App.jsx

```jsx
import UniversalSearchBar from './components/UniversalSearchBar';
import { searchEvents } from './utils/searchHelpers';

// In App component:
const [searchTerm, setSearchTerm] = useState('');

// Modify filtering logic to include search
const filteredEvents = useMemo(() => {
  let filtered = COMPREHENSIVE_SAMPLE_EVENTS;

  // Apply search first
  if (searchTerm) {
    filtered = searchEvents(filtered, searchTerm);
  }

  // Then apply other filters (category, time, etc.)
  filtered = filterEventsByDialSelection(
    filtered,
    selectedCategory,
    selectedSubcategory,
    activeFilters
  );

  return filtered;
}, [searchTerm, selectedCategory, selectedSubcategory, activeFilters]);

// In return/render:
<UniversalSearchBar
  onSearch={setSearchTerm}
  totalEvents={COMPREHENSIVE_SAMPLE_EVENTS.length}
  filteredCount={filteredEvents.length}
/>
```

### Step 2: Update CSS z-index Hierarchy

Ensure search bar is visible above map but below modals:

```css
/* Updated z-index values */
.map-background-layer { z-index: 0; }
.dial-foreground-layer { z-index: 50; }
.event-info-panel { z-index: 100; }
.universal-search-container { z-index: 1000; }
.modal-overlay { z-index: 10000; }
```

### Step 3: Handle Mobile Layout

On mobile, consider positioning search bar:
- **Option 1**: Fixed at top (current design)
- **Option 2**: Slide down from top when user taps search icon
- **Option 3**: Bottom sheet style (swipe up to reveal)

**Recommended**: Fixed at top for simplicity and reliability.

---

## 🚀 Enhanced Features (Optional)

### Feature 1: Search Suggestions/Autocomplete

```jsx
const [suggestions, setSuggestions] = useState([]);

const generateSuggestions = (term) => {
  if (!term) return [];
  
  // Extract unique tags, venues, categories from all events
  const uniqueSuggestions = new Set();
  
  COMPREHENSIVE_SAMPLE_EVENTS.forEach(event => {
    if (event.name.toLowerCase().includes(term)) {
      uniqueSuggestions.add(event.name);
    }
    event.tags?.forEach(tag => {
      if (tag.toLowerCase().includes(term)) {
        uniqueSuggestions.add(tag);
      }
    });
    if (event.venue.toLowerCase().includes(term)) {
      uniqueSuggestions.add(event.venue);
    }
  });
  
  return Array.from(uniqueSuggestions).slice(0, 5); // Limit to 5 suggestions
};
```

### Feature 2: Recent Searches

```jsx
const [recentSearches, setRecentSearches] = useState([]);

const saveRecentSearch = (term) => {
  if (!term || term.length < 3) return;
  
  const updated = [term, ...recentSearches.filter(s => s !== term)].slice(0, 5);
  setRecentSearches(updated);
  localStorage.setItem('recentSearches', JSON.stringify(updated));
};

// Load on mount
useEffect(() => {
  const saved = localStorage.getItem('recentSearches');
  if (saved) {
    setRecentSearches(JSON.parse(saved));
  }
}, []);
```

### Feature 3: Popular Searches

```jsx
const POPULAR_SEARCHES = [
  'Kennedy Center',
  'Halloween',
  'Symphony',
  'Free events',
  'Today',
  'Virtual',
  'Jazz',
  'Theater'
];
```

### Feature 4: Advanced Search Operators

```javascript
// Support special operators
const parseSearchQuery = (query) => {
  // "exact phrase" - exact match
  // tag:halloween - search only tags
  // venue:"Kennedy Center" - search specific field
  // price:free - search by price
  // date:today - search by date
  
  // Example implementation
  if (query.includes('tag:')) {
    const tag = query.replace('tag:', '').trim();
    return events.filter(e => e.tags?.some(t => t.toLowerCase().includes(tag)));
  }
  
  // ... more operators
};
```

### Feature 5: Fuzzy Search (Typo Tolerance)

```javascript
import Fuse from 'fuse.js';

const fuseOptions = {
  keys: [
    'name',
    'description',
    'venue',
    'tags',
    'categoryPrimary',
    'categorySecondary'
  ],
  threshold: 0.3, // 0 = exact, 1 = match anything
  distance: 100
};

const fuse = new Fuse(events, fuseOptions);
const results = fuse.search(searchTerm);
```

---

## ✅ Testing Checklist

After implementation, test:

- [ ] **Basic search**: Type "jazz" - filters to jazz events
- [ ] **Multi-word**: Type "kennedy center" - shows Kennedy Center events
- [ ] **Tag search**: Type "halloween" - shows all Halloween-tagged events
- [ ] **Location search**: Type "georgetown" - shows Georgetown events
- [ ] **Category search**: Type "theater" - shows theater events
- [ ] **Partial matching**: Type "symph" - shows Symphony events
- [ ] **Case insensitive**: Type "JAZZ" or "Jazz" - same results
- [ ] **Clear button**: Click X - clears search
- [ ] **ESC key**: Press ESC - clears search
- [ ] **Empty search**: Clear input - shows all events
- [ ] **No results**: Type "xyz123" - shows "No events found"
- [ ] **Result count**: Shows correct count
- [ ] **Mobile responsive**: Works on phone screen
- [ ] **Performance**: Searches 365 events instantly (< 50ms)
- [ ] **Debouncing**: Doesn't lag when typing quickly
- [ ] **Focus management**: Can focus input, type, clear easily

---

## 🎯 Search Examples

Users should be able to find events by typing:

### By Event Name
- "Shear Madness" → 13 comedy shows
- "Aida" → 6 opera performances
- "Symphony" → NSO events

### By Venue
- "Kennedy Center" → 67 events
- "Georgetown" → 2 cruises
- "Ford's Theatre" → Lincoln tour

### By Tag
- "halloween" → 8 spooky events
- "free" → 8 free events
- "classical" → 20+ music events
- "virtual" → 2 online tours
- "family" → 10+ family-friendly events

### By Category
- "music" → 40+ music events
- "theater" → 20+ theater events
- "tour" → 5 tour events
- "party" → 2 cruise parties

### By Theme
- "ghost" → 3 ghost tours
- "embassy" → 2 embassy events
- "jazz" → Jazz concerts
- "ballet" → 4 ballet performances

### By Time/Date
- "today" → Today's events
- "weekend" → Weekend events
- "morning" → Morning events
- "october 25" → Events on that date

### By Organizer
- "ThingsToDoDC" → 10 events
- "Kennedy Center" → 67 events
- "Washington National Opera" → 6 events

### Multi-word Searches
- "free music" → Free music events
- "kennedy jazz" → Jazz at Kennedy Center
- "halloween party" → Halloween parties
- "family free" → Free family events

---

## 🚨 Edge Cases to Handle

1. **Empty search**: Return all events
2. **Only spaces**: Treat as empty
3. **Very long search**: Truncate or handle gracefully
4. **Special characters**: Escape regex characters
5. **Numbers**: Handle dates, times, prices
6. **Null/undefined values**: Don't crash on missing properties
7. **Rapid typing**: Debounce properly
8. **Mobile keyboard**: Don't block UI

---

## 📊 Performance Optimization

### Current Performance
- 365 events to search
- ~10-20 properties per event
- Target: < 50ms search time

### Optimization Strategies

1. **Memoization**: Cache search results
```javascript
const searchCache = useMemo(() => new Map(), []);
```

2. **Debouncing**: Wait 300ms before searching
```javascript
const debouncedSearch = useMemo(
  () => debounce(onSearch, 300),
  [onSearch]
);
```

3. **Virtual scrolling**: For large result lists
```javascript
import { FixedSizeList } from 'react-window';
```

4. **Index building**: Pre-build search index
```javascript
const searchIndex = useMemo(() => 
  buildSearchIndex(events),
  [events]
);
```

---

## 🎨 Visual Variations (Choose One)

### Variant 1: Minimal (Recommended)
- White background, subtle shadow
- No border, clean design
- Search icon left, clear button right

### Variant 2: Glass Morphism
- Semi-transparent background
- Heavy blur effect
- Colorful border

### Variant 3: Dark Mode
- Dark background (#1a1a1a)
- White text
- Accent color for focus

### Variant 4: Pill Style
- Very rounded (border-radius: 50px)
- Compact design
- Icon button to expand

---

## 🔧 Accessibility

- ✅ **aria-label** on input and buttons
- ✅ **Keyboard navigation** (Tab, ESC)
- ✅ **Screen reader support**
- ✅ **Focus indicators**
- ✅ **WCAG contrast ratios**
- ✅ **Mobile touch targets** (44x44px minimum)

---

## 📝 Implementation Notes

### Priority: High
- Simple search is more important than perfect search
- Reliability > Features
- Performance > Fancy UI

### Keep It Simple
- No complex filters in search bar
- No multi-select
- No date pickers
- Just: type → see results → done

### User Experience
- Fast feedback (< 300ms)
- Clear results count
- Easy to clear
- Works on mobile

---

## 🚀 Quick Start Code

Minimum viable implementation:

```jsx
// App.jsx
const [search, setSearch] = useState('');
const filtered = useMemo(() => 
  events.filter(e => 
    JSON.stringify(e).toLowerCase().includes(search.toLowerCase())
  ),
  [events, search]
);

// Component
<input 
  value={search}
  onChange={e => setSearch(e.target.value)}
  placeholder="Search..."
/>
```

This is the **absolute minimum** - searches all properties as JSON string. Works in 5 lines of code!

---

**Implementation Time**: 1-2 hours for full featured version, 15 minutes for MVP.

**Priority**: 🔴 High - Search is essential for 365 events

**Complexity**: 🟢 Low - Simple component, straightforward logic

