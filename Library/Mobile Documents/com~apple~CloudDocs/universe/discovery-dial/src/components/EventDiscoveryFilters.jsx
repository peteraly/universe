import React from 'react';
import { FILTER_OPTIONS } from '../data/mockEvents';

const EventDiscoveryFilters = ({ filters, onFilterChange, compact = false }) => {
  const handleFilterChange = (filterType, value) => {
    onFilterChange(filterType, value);
  };

  // Compact overlay version
  if (compact) {
    return (
      <div className="compact-filters-overlay">
        <div className="filter-pills">
          {FILTER_OPTIONS.time.slice(0, 4).map(option => (
            <button
              key={option}
              className={`filter-pill ${filters.time === option ? 'active' : ''}`}
              onClick={() => handleFilterChange('time', option)}
              aria-pressed={filters.time === option}
            >
              {option}
            </button>
          ))}
        </div>
        <div className="filter-pills">
          {FILTER_OPTIONS.day.slice(0, 3).map(option => (
            <button
              key={option}
              className={`filter-pill ${filters.day === option ? 'active' : ''}`}
              onClick={() => handleFilterChange('day', option)}
              aria-pressed={filters.day === option}
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
