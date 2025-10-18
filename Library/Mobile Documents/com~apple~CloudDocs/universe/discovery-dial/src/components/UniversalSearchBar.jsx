import React, { useState, useCallback, useEffect, useRef } from 'react';
import { getSmartSuggestions, highlightMatch } from '../utils/searchSuggestions';
import './UniversalSearchBar.css';

const UniversalSearchBar = ({ onSearch, totalEvents, filteredCount, events }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);

  // DEBUG: Log when component renders
  console.log('🔍 UniversalSearchBar RENDERED', { totalEvents, filteredCount, hasEvents: !!events });

  // Generate suggestions when search term changes
  useEffect(() => {
    if (searchTerm.trim().length > 0 && events && events.length > 0) {
      const smartSuggestions = getSmartSuggestions(events, searchTerm, 8);
      setSuggestions(smartSuggestions);
      setShowDropdown(smartSuggestions.length > 0);
      setSelectedIndex(-1);
    } else {
      setSuggestions([]);
      setShowDropdown(false);
      setSelectedIndex(-1);
    }
  }, [searchTerm, events]);

  // Debounce search for performance (300ms delay)
  useEffect(() => {
    const timer = setTimeout(() => {
      onSearch(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm, onSearch]);

  // Handle input change
  const handleInputChange = useCallback((e) => {
    setSearchTerm(e.target.value);
  }, []);

  // Handle suggestion selection
  const handleSelectSuggestion = useCallback((suggestionText) => {
    setSearchTerm(suggestionText);
    setShowDropdown(false);
    setSelectedIndex(-1);
    onSearch(suggestionText);
    inputRef.current?.focus();
  }, [onSearch]);

  // Handle clear
  const handleClear = useCallback(() => {
    setSearchTerm('');
    setShowDropdown(false);
    setSelectedIndex(-1);
    inputRef.current?.focus();
  }, []);

  // Handle keyboard navigation
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape') {
      handleClear();
      setShowDropdown(false);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (showDropdown && suggestions.length > 0) {
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (showDropdown && suggestions.length > 0) {
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
      }
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
        handleSelectSuggestion(suggestions[selectedIndex].text);
      } else if (searchTerm.trim()) {
        setShowDropdown(false);
        onSearch(searchTerm);
      }
    }
  }, [handleClear, showDropdown, suggestions, selectedIndex, handleSelectSuggestion, searchTerm, onSearch]);

  // Scroll selected item into view
  useEffect(() => {
    if (selectedIndex >= 0 && dropdownRef.current) {
      const selectedElement = dropdownRef.current.children[selectedIndex];
      if (selectedElement) {
        selectedElement.scrollIntoView({
          block: 'nearest',
          behavior: 'smooth'
        });
      }
    }
  }, [selectedIndex]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        !inputRef.current?.contains(event.target)
      ) {
        setShowDropdown(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
          placeholder="Search events, venues, tags..."
          value={searchTerm}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (suggestions.length > 0) {
              setShowDropdown(true);
            }
          }}
          aria-label="Search events"
          aria-autocomplete="list"
          aria-controls="search-suggestions"
          aria-expanded={showDropdown}
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

      {/* Autocomplete Dropdown */}
      {showDropdown && suggestions.length > 0 && (
        <div
          ref={dropdownRef}
          className="search-dropdown"
          id="search-suggestions"
          role="listbox"
        >
          {suggestions.map((suggestion, index) => {
            const highlighted = highlightMatch(suggestion.text, searchTerm);
            const isSelected = index === selectedIndex;

            return (
              <div
                key={`${suggestion.category}-${suggestion.text}-${index}`}
                className={`search-suggestion-item ${isSelected ? 'selected' : ''}`}
                role="option"
                aria-selected={isSelected}
                onClick={() => handleSelectSuggestion(suggestion.text)}
                onMouseEnter={() => setSelectedIndex(index)}
              >
                <span className="suggestion-icon">{suggestion.icon}</span>
                <span className="suggestion-text">
                  {highlighted.parts.map((part, i) => (
                    <span
                      key={i}
                      className={part.highlight ? 'highlight' : ''}
                    >
                      {part.text}
                    </span>
                  ))}
                </span>
                <span className="suggestion-category">{suggestion.category}</span>
              </div>
            );
          })}
        </div>
      )}

      {/* Result Count */}
      {searchTerm && !showDropdown && (
        <div className="search-result-count">
          {filteredCount === 0 ? (
            <span className="no-results">No events found</span>
          ) : (
            <span className="results-found">
              {filteredCount} of {totalEvents} events
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default UniversalSearchBar;
