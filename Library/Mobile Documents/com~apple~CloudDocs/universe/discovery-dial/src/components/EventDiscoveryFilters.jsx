import React from 'react';
import { FILTER_OPTIONS } from '../data/mockEvents';

const EventDiscoveryFilters = ({ filters, onFilterChange }) => {
  const handleFilterChange = (filterType, value) => {
    onFilterChange(filterType, value);
  };

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
