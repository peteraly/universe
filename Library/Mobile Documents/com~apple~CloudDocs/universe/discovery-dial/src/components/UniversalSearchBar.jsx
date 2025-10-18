import React, { useState, useCallback, useEffect, useRef } from 'react';
import './UniversalSearchBar.css';

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

