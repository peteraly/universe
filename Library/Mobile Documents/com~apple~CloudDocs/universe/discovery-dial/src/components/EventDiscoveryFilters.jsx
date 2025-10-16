import React from 'react';
import { FILTER_OPTIONS } from '../data/comprehensiveSampleEvents';

const EventDiscoveryFilters = ({ filters, onFilterChange, compact = false }) => {
  const handleFilterChange = (filterType, value) => {
    onFilterChange(filterType, value);
  };

  // Compact overlay version
  if (compact) {
    return (
      <div 
        className="compact-filters-overlay"
        style={{
          position: 'absolute',
          top: '20px',
          left: '20px',
          right: '20px',
          display: 'flex',
          gap: '10px',
          zIndex: 1000,
          minHeight: '44px'
        }}
      >
        <div className="filter-pills" style={{ display: 'flex', gap: '8px' }}>
          {FILTER_OPTIONS.time.slice(0, 4).map(option => (
            <button
              key={option}
              className={`filter-pill ${filters.time === option ? 'active' : ''}`}
              onClick={() => handleFilterChange('time', option)}
              aria-pressed={filters.time === option}
              style={{
                minWidth: '60px',
                minHeight: '44px',
                padding: '12px 18px',
                backgroundColor: filters.time === option ? '#007bff' : 'rgba(255, 255, 255, 0.2)',
                color: 'white',
                border: 'none',
                borderRadius: '22px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                visibility: 'visible',
                touchAction: 'manipulation',
                userSelect: 'none',
                WebkitTapHighlightColor: 'transparent'
              }}
            >
              {option}
            </button>
          ))}
        </div>
        <div className="filter-pills" style={{ display: 'flex', gap: '8px' }}>
          {FILTER_OPTIONS.day.slice(0, 3).map(option => (
            <button
              key={option}
              className={`filter-pill ${filters.day === option ? 'active' : ''}`}
              onClick={() => handleFilterChange('day', option)}
              aria-pressed={filters.day === option}
              style={{
                minWidth: '60px',
                minHeight: '44px',
                padding: '12px 18px',
                backgroundColor: filters.day === option ? '#007bff' : 'rgba(255, 255, 255, 0.2)',
                color: 'white',
                border: 'none',
                borderRadius: '22px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                visibility: 'visible',
                touchAction: 'manipulation',
                userSelect: 'none',
                WebkitTapHighlightColor: 'transparent'
              }}
            >
              {option}
            </button>
          ))}
        </div>
      </div>
    );
  }

  // Full filter interface
  return (
    <div className="event-discovery-filters">
      {/* Time Filter */}
      <div className="filter-group">
        <label className="filter-label">Time</label>
        <div className="filter-buttons">
          {FILTER_OPTIONS.time.map(option => (
            <button
              key={option}
              className={`filter-btn ${filters.time === option ? 'active' : ''}`}
              onClick={() => handleFilterChange('time', option)}
              aria-pressed={filters.time === option}
            >
              {option}
            </button>
          ))}
        </div>
      </div>
      
      {/* Day Filter */}
      <div className="filter-group">
        <label className="filter-label">Day</label>
        <div className="filter-buttons">
          {FILTER_OPTIONS.day.map(option => (
            <button
              key={option}
              className={`filter-btn ${filters.day === option ? 'active' : ''}`}
              onClick={() => handleFilterChange('day', option)}
              aria-pressed={filters.day === option}
            >
              {option}
            </button>
          ))}
        </div>
      </div>
      
      {/* Category Filter */}
      <div className="filter-group">
        <label className="filter-label">Category</label>
        <div className="filter-buttons">
          {FILTER_OPTIONS.category.map(option => (
            <button
              key={option}
              className={`filter-btn ${filters.category === option ? 'active' : ''}`}
              onClick={() => handleFilterChange('category', option)}
              aria-pressed={filters.category === option}
            >
              {option}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EventDiscoveryFilters;
