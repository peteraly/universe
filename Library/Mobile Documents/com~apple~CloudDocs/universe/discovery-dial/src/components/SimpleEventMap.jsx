import React, { useState, useCallback } from 'react';

/**
 * Simple Event Map Component
 * Fallback map that shows events as a grid when Mapbox is unavailable
 */
const SimpleEventMap = ({ 
  events = [], 
  selectedCategory, 
  selectedSubcategory, 
  onEventSelect 
}) => {
  const [hoveredEvent, setHoveredEvent] = useState(null);

  // Filter events based on selections
  const filteredEvents = events.filter(event => {
    if (selectedCategory && event.categoryPrimary !== selectedCategory.name) {
      return false;
    }
    if (selectedSubcategory && event.categorySecondary !== selectedSubcategory.label) {
      return false;
    }
    return true;
  });

  // Get category color
  const getCategoryColor = (category) => {
    const colors = {
      'Music': '#e63946',
      'Food': '#f77f00',
      'Sports': '#2a9d8f',
      'Art': '#7209b7',
      'Tech': '#3a86ff',
      'Outdoor': '#06d6a0',
      'Nightlife': '#f72585',
      'Family': '#ffbe0b'
    };
    return colors[category] || '#6c757d';
  };

  // Get event size based on attendees
  const getEventSize = (attendees) => {
    const count = parseInt(attendees.replace(/\D/g, ''));
    if (count > 1000) return 'large';
    if (count > 100) return 'medium';
    return 'small';
  };

  const handleEventClick = useCallback((event) => {
    console.log('🎯 Event selected:', event);
    onEventSelect?.(event);
  }, [onEventSelect]);

  return (
    <div className="simple-event-map">
      <div className="map-header">
        <h3>Events in San Francisco</h3>
        <p>{filteredEvents.length} events found</p>
      </div>
      
      <div className="events-grid">
        {filteredEvents.map((event) => {
          const size = getEventSize(event.attendees);
          const color = getCategoryColor(event.categoryPrimary);
          
          return (
            <div
              key={event.id}
              className={`event-card ${size} ${hoveredEvent === event.id ? 'hovered' : ''}`}
              style={{ 
                borderColor: color,
                backgroundColor: `${color}15`
              }}
              onClick={() => handleEventClick(event)}
              onMouseEnter={() => setHoveredEvent(event.id)}
              onMouseLeave={() => setHoveredEvent(null)}
            >
              <div className="event-card-header">
                <h4>{event.name}</h4>
                <span className="event-category" style={{ color }}>
                  {event.categoryPrimary}
                </span>
              </div>
              
              <div className="event-card-body">
                <p className="event-venue">📍 {event.venue}</p>
                <p className="event-time">⏰ {event.time} on {event.day}</p>
                <p className="event-price">💰 {event.price}</p>
                <p className="event-attendees">👥 {event.attendees}</p>
              </div>
              
              <div className="event-card-footer">
                <p className="event-description">{event.description}</p>
              </div>
            </div>
          );
        })}
      </div>
      
      {filteredEvents.length === 0 && (
        <div className="no-events">
          <p>No events found for the selected criteria.</p>
          <p>Try adjusting your category or subcategory selection.</p>
        </div>
      )}
    </div>
  );
};

export default SimpleEventMap;
