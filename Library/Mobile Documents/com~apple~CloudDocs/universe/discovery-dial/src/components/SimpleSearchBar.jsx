import React, { useState, useEffect, useRef } from 'react';
import { getSmartSuggestions } from '../utils/searchSuggestions';

const SimpleSearchBar = ({ onSearch, totalEvents, filteredCount, events = [] }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);

  console.log('🔍 SimpleSearchBar RENDERING', { hasEvents: events.length });

  // Generate suggestions when search term changes
  useEffect(() => {
    if (searchTerm.trim().length > 0 && events && events.length > 0) {
      const smartSuggestions = getSmartSuggestions(events, searchTerm, 8);
      console.log('💡 Generated suggestions:', smartSuggestions.length, 'for term:', searchTerm);
      setSuggestions(smartSuggestions);
      setShowDropdown(smartSuggestions.length > 0);
      setSelectedIndex(-1);
    } else {
      setSuggestions([]);
      setShowDropdown(false);
      setSelectedIndex(-1);
    }
  }, [searchTerm, events]);

  // Test click handler
  const handleContainerClick = () => {
    console.log('🟢 Search bar container clicked!');
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      onSearch(searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm, onSearch]);

  const handleClear = () => {
    setSearchTerm('');
    setShowDropdown(false);
    setSelectedIndex(-1);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  // Handle suggestion selection
  const handleSelectSuggestion = (suggestionText) => {
    console.log('✅ Selected suggestion:', suggestionText);
    setSearchTerm(suggestionText);
    setShowDropdown(false);
    setSelectedIndex(-1);
    onSearch(suggestionText);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
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
  };

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
    <div 
      onClick={handleContainerClick}
      style={{
        position: 'fixed',
        top: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '90%',
        maxWidth: '650px',
        zIndex: 9999999,
        padding: '10px',
        pointerEvents: 'auto',
        isolation: 'isolate'
      }}
    >
      <div style={{
        display: 'flex',
        alignItems: 'center',
        background: 'rgba(255, 255, 255, 0.98)',
        backdropFilter: 'blur(20px)',
        borderRadius: '16px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.25)',
        padding: '16px 20px',
        border: '2px solid rgba(0, 0, 0, 0.15)',
        pointerEvents: 'auto',
        cursor: 'text',
        position: 'relative',
        isolation: 'isolate'
      }}>
        {/* Search Icon */}
        <span style={{ fontSize: '20px', marginRight: '12px' }}>🔍</span>

        {/* Input */}
        <input
          ref={inputRef}
          type="text"
          placeholder="Search events, venues, tags..."
          value={searchTerm}
          onChange={(e) => {
            console.log('🟢 Input change:', e.target.value);
            setSearchTerm(e.target.value);
          }}
          onKeyDown={handleKeyDown}
          onClick={() => console.log('🟢 Input clicked!')}
          onFocus={() => {
            console.log('🟢 Input focused!');
            if (suggestions.length > 0) {
              setShowDropdown(true);
            }
          }}
          autoComplete="off"
          style={{
            flex: 1,
            border: 'none',
            outline: 'none',
            background: 'transparent',
            fontSize: '17px',
            fontWeight: '500',
            color: '#000',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            pointerEvents: 'auto',
            cursor: 'text',
            WebkitUserSelect: 'text',
            userSelect: 'text',
            position: 'relative',
            zIndex: 1
          }}
        />

        {/* Clear Button */}
        {searchTerm && (
          <button
            onClick={handleClear}
            style={{
              background: 'rgba(0, 0, 0, 0.1)',
              border: 'none',
              borderRadius: '50%',
              width: '28px',
              height: '28px',
              cursor: 'pointer',
              fontSize: '16px',
              marginLeft: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            ✕
          </button>
        )}
      </div>

      {/* Autocomplete Dropdown */}
      {showDropdown && suggestions.length > 0 && (
        <div
          ref={dropdownRef}
          style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            left: 0,
            right: 0,
            background: 'rgba(255, 255, 255, 0.98)',
            backdropFilter: 'blur(20px)',
            borderRadius: '12px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.25)',
            border: '2px solid rgba(0, 0, 0, 0.1)',
            maxHeight: '320px',
            overflowY: 'auto',
            zIndex: 999999,
            animation: 'fadeIn 0.2s ease'
          }}
        >
          {suggestions.map((suggestion, index) => {
            const isSelected = index === selectedIndex;
            return (
              <div
                key={`${suggestion.category}-${suggestion.text}-${index}`}
                onClick={() => handleSelectSuggestion(suggestion.text)}
                onMouseEnter={() => setSelectedIndex(index)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '12px 16px',
                  cursor: 'pointer',
                  borderBottom: index < suggestions.length - 1 ? '1px solid rgba(0, 0, 0, 0.05)' : 'none',
                  background: isSelected ? 'rgba(0, 123, 255, 0.1)' : 'transparent',
                  transition: 'background 0.15s ease',
                  minHeight: '48px'
                }}
              >
                <span style={{ fontSize: '18px', marginRight: '12px' }}>
                  {suggestion.icon}
                </span>
                <span style={{
                  flex: 1,
                  fontSize: '15px',
                  color: '#333',
                  fontWeight: '500',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}>
                  {suggestion.text}
                </span>
                <span style={{
                  fontSize: '11px',
                  color: 'rgba(0, 0, 0, 0.45)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  fontWeight: '500',
                  padding: '2px 6px',
                  background: 'rgba(0, 0, 0, 0.05)',
                  borderRadius: '4px'
                }}>
                  {suggestion.category}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* Result Count */}
      {searchTerm && !showDropdown && (
        <div style={{
          marginTop: '8px',
          textAlign: 'center',
          fontSize: '13px',
          color: 'white',
          background: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(10px)',
          padding: '6px 14px',
          borderRadius: '10px',
          display: 'inline-block',
          marginLeft: '50%',
          transform: 'translateX(-50%)'
        }}>
          {filteredCount === 0 ? (
            <span style={{ color: '#ff6b6b', fontWeight: '600' }}>No events found</span>
          ) : (
            <span style={{ fontWeight: '500' }}>
              {filteredCount} of {totalEvents} events
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default SimpleSearchBar;

