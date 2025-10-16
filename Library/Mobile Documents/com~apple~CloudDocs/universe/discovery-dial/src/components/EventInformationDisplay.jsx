import React from 'react';

/**
 * Event Information Display Component
 * Shows event details, category information, or placeholder text
 * Positioned above the dial in the repositioned layout
 */
const EventInformationDisplay = ({ 
  event, 
  selectedCategory, 
  selectedSubcategory 
}) => {
  // Show placeholder when nothing is selected
  if (!event && !selectedCategory) {
    return (
      <div 
        className="event-info-placeholder"
        data-testid="event-display"
        style={{
          display: 'block',
          visibility: 'visible',
          width: '100%',
          height: 'auto',
          minHeight: '100px',
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          color: 'white',
          padding: '20px',
          borderRadius: '8px'
        }}
      >
        <h3 className="info-title">Select a category to discover events</h3>
        <p className="info-subtitle">Rotate the dial to explore different event categories</p>
      </div>
    );
  }

  // Show category information when category is selected but no event
  if (!event && selectedCategory) {
    return (
      <div 
        className="event-info-category"
        data-testid="event-display"
        style={{
          display: 'block',
          visibility: 'visible',
          width: '100%',
          height: 'auto',
          minHeight: '100px',
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          color: 'white',
          padding: '20px',
          borderRadius: '8px'
        }}
      >
        <h3 className="info-title">{selectedCategory.name}</h3>
        {selectedSubcategory && (
          <p className="info-subtitle">{selectedSubcategory.label}</p>
        )}
        <p className="info-description">Select a subcategory to see specific events</p>
      </div>
    );
  }

  // Show detailed event information
  return (
    <div 
      className="event-info-details"
      data-testid="event-display"
      style={{
        display: 'block',
        visibility: 'visible',
        width: '100%',
        height: 'auto',
        minHeight: '100px',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        color: 'white',
        padding: '20px',
        borderRadius: '8px'
      }}
    >
      <div className="event-header">
        <h3 className="event-title">{event.name}</h3>
        <span className="event-category">{event.categoryPrimary}</span>
      </div>
      <div className="event-meta">
        <p className="event-time">🕐 {event.time}</p>
        <p className="event-venue">📍 {event.venue}</p>
        <p className="event-price">💰 {event.price}</p>
        <p className="event-attendees">👥 {event.attendees} attending</p>
      </div>
      <p className="event-description">{event.description}</p>
    </div>
  );
};

export default EventInformationDisplay;