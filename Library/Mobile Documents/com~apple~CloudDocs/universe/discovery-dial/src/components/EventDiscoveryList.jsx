import React from 'react';
import { getCategoryColor } from '../data/mockEvents';

const EventDiscoveryList = ({ events, onEventSelect }) => {
  if (events.length === 0) {
    return (
      <div className="no-events">
        <div className="no-events-content">
          <div className="no-events-icon">🔍</div>
          <h3 className="no-events-title">No events found</h3>
          <p className="no-events-message">
            Try adjusting your filters to see more events
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="event-discovery-list">
      <div className="events-header">
        <h3 className="events-count">
          {events.length} Event{events.length !== 1 ? 's' : ''} Found
        </h3>
        <p className="events-subtitle">
          Click on an event to see details
        </p>
      </div>
      
      <div className="events-grid">
        {events.map(event => (
          <div
            key={event.id}
            className="event-card"
            onClick={() => onEventSelect && onEventSelect(event)}
            style={{
              borderLeftColor: getCategoryColor(event.categoryPrimary)
            }}
          >
            <div className="event-header">
              <h4 className="event-title">{event.name}</h4>
              <span 
                className="event-category"
                style={{
                  backgroundColor: getCategoryColor(event.categoryPrimary) + '20',
                  color: getCategoryColor(event.categoryPrimary)
                }}
              >
                {event.categoryPrimary}
              </span>
            </div>
            
            <div className="event-details">
              <div className="event-time-info">
                <span className="event-time">🕒 {event.time}</span>
                <span className="event-day">📅 {event.day}</span>
              </div>
              
              <p className="event-venue">📍 {event.venue}</p>
              
              <p className="event-description">{event.description}</p>
              
              <div className="event-meta">
                <span className="event-price">💰 {event.price}</span>
                <span className="event-attendees">👥 {event.attendees} attending</span>
              </div>
            </div>
            
            <div className="event-footer">
              <span className="event-organizer">by {event.organizer}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EventDiscoveryList;
