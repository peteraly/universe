import React, { useState, useRef, useEffect } from 'react';
import './EventDisplayCard.css';

const EventDisplayCard = ({ 
  event, 
  currentIndex, 
  totalEvents, 
  onSwipeLeft, 
  onSwipeRight,
  onEventSelect,
  isLoading = false 
}) => {
  const [isSwipeActive, setIsSwipeActive] = useState(false);
  const [swipeDirection, setSwipeDirection] = useState(null);
  const [swipeDistance, setSwipeDistance] = useState(0);
  const cardRef = useRef(null);
  const startX = useRef(0);
  const startY = useRef(0);

  // Swipe detection
  const handleTouchStart = (e) => {
    if (isLoading) return;
    
    const touch = e.touches[0];
    startX.current = touch.clientX;
    startY.current = touch.clientY;
    setIsSwipeActive(true);
    setSwipeDirection(null);
    setSwipeDistance(0);
  };

  const handleTouchMove = (e) => {
    if (!isSwipeActive || isLoading) return;
    
    const touch = e.touches[0];
    const deltaX = touch.clientX - startX.current;
    const deltaY = touch.clientY - startY.current;
    
    // Only process horizontal swipes (ignore vertical scrolling)
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      e.preventDefault();
      
      const direction = deltaX > 0 ? 'right' : 'left';
      setSwipeDirection(direction);
      setSwipeDistance(Math.abs(deltaX));
    }
  };

  const handleTouchEnd = (e) => {
    if (!isSwipeActive || isLoading) return;
    
    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - startX.current;
    const deltaY = touch.clientY - startY.current;
    
    // Check if it's a valid horizontal swipe
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
      if (deltaX > 0 && currentIndex > 0) {
        // Swipe right - go to previous event
        onSwipeRight();
      } else if (deltaX < 0 && currentIndex < totalEvents - 1) {
        // Swipe left - go to next event
        onSwipeLeft();
      }
    }
    
    setIsSwipeActive(false);
    setSwipeDirection(null);
    setSwipeDistance(0);
  };

  // Mouse events for desktop
  const handleMouseDown = (e) => {
    if (isLoading) return;
    
    startX.current = e.clientX;
    startY.current = e.clientY;
    setIsSwipeActive(true);
  };

  const handleMouseMove = (e) => {
    if (!isSwipeActive || isLoading) return;
    
    const deltaX = e.clientX - startX.current;
    const deltaY = e.clientY - startY.current;
    
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      e.preventDefault();
      
      const direction = deltaX > 0 ? 'right' : 'left';
      setSwipeDirection(direction);
      setSwipeDistance(Math.abs(deltaX));
    }
  };

  const handleMouseUp = (e) => {
    if (!isSwipeActive || isLoading) return;
    
    const deltaX = e.clientX - startX.current;
    const deltaY = e.clientY - startY.current;
    
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
      if (deltaX > 0 && currentIndex > 0) {
        onSwipeRight();
      } else if (deltaX < 0 && currentIndex < totalEvents - 1) {
        onSwipeLeft();
      }
    }
    
    setIsSwipeActive(false);
    setSwipeDirection(null);
    setSwipeDistance(0);
  };

  // Cleanup mouse events
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      setIsSwipeActive(false);
      setSwipeDirection(null);
      setSwipeDistance(0);
    };

    if (isSwipeActive) {
      document.addEventListener('mouseup', handleGlobalMouseUp);
      document.addEventListener('mousemove', handleMouseMove);
    }

    return () => {
      document.removeEventListener('mouseup', handleGlobalMouseUp);
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, [isSwipeActive]);

  // Format event data
  const formatTime = (timeString) => {
    if (!timeString) return 'Time TBD';
    try {
      const time = new Date(timeString);
      return time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return timeString;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Date TBD';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString([], { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric' 
      });
    } catch {
      return dateString;
    }
  };

  const formatAttendees = (attendees) => {
    if (!attendees) return '0';
    if (typeof attendees === 'string') {
      const match = attendees.match(/\d+/);
      return match ? match[0] : '0';
    }
    return String(attendees);
  };

  if (isLoading) {
    return (
      <div className="event-display-card loading">
        <div className="loading-skeleton">
          <div className="skeleton-header"></div>
          <div className="skeleton-line"></div>
          <div className="skeleton-line short"></div>
          <div className="skeleton-line"></div>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="event-display-card empty">
        <div className="empty-state">
          <div className="empty-icon">📅</div>
          <h3>No Events Found</h3>
          <p>Try adjusting your filters to see more events.</p>
        </div>
      </div>
    );
  }

  const canSwipeLeft = currentIndex < totalEvents - 1;
  const canSwipeRight = currentIndex > 0;

  return (
    <div 
      ref={cardRef}
      className={`event-display-card ${isSwipeActive ? 'swipe-active' : ''} ${swipeDirection ? `swipe-${swipeDirection}` : ''}`}
      style={{
        transform: swipeDirection ? `translateX(${swipeDirection === 'left' ? -swipeDistance * 0.1 : swipeDistance * 0.1}px)` : 'none',
        opacity: swipeDistance > 100 ? 0.7 : 1
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleMouseDown}
      onClick={() => onEventSelect && onEventSelect(event)}
    >
      {/* Navigation Arrows */}
      <div className="event-navigation">
        <button 
          className={`nav-arrow left ${!canSwipeRight ? 'disabled' : ''}`}
          onClick={(e) => {
            e.stopPropagation();
            if (canSwipeRight) onSwipeRight();
          }}
          disabled={!canSwipeRight}
          aria-label="Previous event"
        >
          ←
        </button>
        
        <div className="event-counter">
          {currentIndex + 1} of {totalEvents}
        </div>
        
        <button 
          className={`nav-arrow right ${!canSwipeLeft ? 'disabled' : ''}`}
          onClick={(e) => {
            e.stopPropagation();
            if (canSwipeLeft) onSwipeLeft();
          }}
          disabled={!canSwipeLeft}
          aria-label="Next event"
        >
          →
        </button>
      </div>

      {/* Event Content */}
      <div className="event-content">
        <h2 className="event-title">{event.name || 'Untitled Event'}</h2>
        
        <div className="event-details">
          <div className="event-detail">
            <span className="detail-icon">📅</span>
            <span className="detail-text">
              {formatDate(event.date)} at {formatTime(event.time)}
            </span>
          </div>
          
          {event.location && (
            <div className="event-detail">
              <span className="detail-icon">📍</span>
              <span className="detail-text">{event.location}</span>
            </div>
          )}
          
          <div className="event-detail">
            <span className="detail-icon">👥</span>
            <span className="detail-text">
              {formatAttendees(event.attendees)} attendees
            </span>
          </div>
        </div>

        {event.description && (
          <div className="event-description">
            <p>{event.description}</p>
          </div>
        )}

        <div className="event-meta">
          <span className="event-category">{event.categoryPrimary}</span>
          {event.categorySecondary && (
            <span className="event-subcategory">• {event.categorySecondary}</span>
          )}
        </div>
      </div>

      {/* Swipe Indicators */}
      <div className="swipe-indicators">
        {canSwipeRight && (
          <div className="swipe-hint left">
            <span>← Swipe for previous</span>
          </div>
        )}
        {canSwipeLeft && (
          <div className="swipe-hint right">
            <span>Swipe for next →</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventDisplayCard;
