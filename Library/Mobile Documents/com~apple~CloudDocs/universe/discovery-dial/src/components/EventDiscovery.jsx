import React, { useState, useMemo } from 'react';
import EventDiscoveryFilters from './EventDiscoveryFilters';
import EventDiscoveryMap from './EventDiscoveryMap';
import EventDiscoveryList from './EventDiscoveryList';
import { MOCK_EVENTS, DEFAULT_FILTERS, filterEvents } from '../data/mockEvents';

const EventDiscovery = () => {
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [selectedEvent, setSelectedEvent] = useState(null);

  // Filter events based on current filters
  const filteredEvents = useMemo(() => {
    return filterEvents(MOCK_EVENTS, filters);
  }, [filters]);

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
    
    // Clear selected event when filters change
    setSelectedEvent(null);
    
    console.log(`🔍 Filter changed: ${filterType} = ${value}`);
  };

  const handleEventSelect = (event) => {
    setSelectedEvent(event);
    console.log('🎯 Event selected:', event.name);
  };

  const clearFilters = () => {
    setFilters(DEFAULT_FILTERS);
    setSelectedEvent(null);
    console.log('🔄 Filters cleared');
  };

  return (
    <div className="event-discovery">
      <div className="discovery-header">
        <div className="header-content">
          <h2 className="discovery-title">
            🗺️ Event Discovery
          </h2>
          <p className="discovery-subtitle">
            Find events happening around you
          </p>
        </div>
        
        <div className="header-actions">
          <button 
            className="clear-filters-btn"
            onClick={clearFilters}
            title="Clear all filters"
          >
            🔄 Clear Filters
          </button>
        </div>
      </div>
      
      <EventDiscoveryFilters
        filters={filters}
        onFilterChange={handleFilterChange}
      />
      
      <div className="discovery-content">
        <div className="map-section">
          <div className="section-header">
            <h3 className="section-title">📍 Map View</h3>
            <span className="section-count">{filteredEvents.length} events</span>
          </div>
          <EventDiscoveryMap
            events={filteredEvents}
            onEventSelect={handleEventSelect}
          />
        </div>
        
        <div className="list-section">
          <div className="section-header">
            <h3 className="section-title">📋 Event List</h3>
            <span className="section-count">{filteredEvents.length} events</span>
          </div>
          <EventDiscoveryList
            events={filteredEvents}
            onEventSelect={handleEventSelect}
          />
        </div>
      </div>
      
      {selectedEvent && (
        <div className="selected-event-overlay">
          <div className="selected-event-card">
            <div className="selected-event-header">
              <h3 className="selected-event-title">{selectedEvent.name}</h3>
              <button 
                className="close-selected-btn"
                onClick={() => setSelectedEvent(null)}
                aria-label="Close event details"
              >
                ✕
              </button>
            </div>
            
            <div className="selected-event-details">
              <div className="selected-event-meta">
                <span className="selected-event-category">
                  {selectedEvent.categoryPrimary}
                </span>
                <span className="selected-event-time">
                  {selectedEvent.time} • {selectedEvent.day}
                </span>
              </div>
              
              <p className="selected-event-venue">📍 {selectedEvent.venue}</p>
              <p className="selected-event-description">{selectedEvent.description}</p>
              
              <div className="selected-event-footer">
                <span className="selected-event-price">💰 {selectedEvent.price}</span>
                <span className="selected-event-attendees">👥 {selectedEvent.attendees} attending</span>
                <span className="selected-event-organizer">by {selectedEvent.organizer}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventDiscovery;
