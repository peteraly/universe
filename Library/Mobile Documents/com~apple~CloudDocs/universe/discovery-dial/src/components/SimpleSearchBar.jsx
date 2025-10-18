import React, { useState, useEffect, useRef } from 'react';

const SimpleSearchBar = ({ onSearch, totalEvents, filteredCount }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const inputRef = useRef(null);

  console.log('🔍 SimpleSearchBar RENDERING');

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
  };

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
          onKeyDown={(e) => {
            if (e.key === 'Escape') handleClear();
          }}
          onClick={() => console.log('🟢 Input clicked!')}
          onFocus={() => console.log('🟢 Input focused!')}
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

      {/* Result Count */}
      {searchTerm && (
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

