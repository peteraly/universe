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
      <div className="event-display-card-compact">
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          color: 'rgba(255, 255, 255, 0.5)',
          fontSize: '14px'
        }}>
          {totalEvents === 0 ? 'No events found' : 'Select a category to discover events'}
        </div>
      </div>
    );
  }

  const canSwipeLeft = currentIndex < totalEvents - 1;
  const canSwipeRight = currentIndex > 0;

  // Get category emoji
  const getCategoryEmoji = (category) => {
    switch(category) {
      case 'Arts/Culture': return '🎵';
      case 'Social': return '🎉';
      case 'Wellness': return '🧘';
      case 'Professional': return '💼';
      default: return '📍';
    }
  };

  // COMPACT MODE - Minimal card for map visibility
  return (
    <div 
      ref={cardRef}
      className="event-display-card-compact"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      style={{
        cursor: isSwipeActive ? 'grabbing' : 'grab',
        transform: swipeDirection ? `translateX(${swipeDistance * (swipeDirection === 'left' ? -0.1 : 0.1)}px)` : 'none',
        transition: isSwipeActive ? 'none' : 'transform 0.3s ease'
      }}
    >
      {/* Title Row with Counter */}
      <div className="event-title">
        <span style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '8px',
          overflow: 'hidden',
          flex: 1
        }}>
          {getCategoryEmoji(event.categoryPrimary)}
          <span style={{ 
            overflow: 'hidden', 
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}>
            {event.name}
          </span>
        </span>
        <span className="event-counter">
          {currentIndex + 1}/{totalEvents}
        </span>
      </div>

      {/* Description */}
      {event.description && (
        <div className="event-description" style={{
          fontSize: '13px',
          color: 'rgba(255, 255, 255, 0.8)',
          margin: '4px 0',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          lineHeight: '1.4'
        }}>
          {event.description}
        </div>
      )}

      {/* Time */}
      <div className="event-time">
        🕐 {event.time || 'Time TBD'}{event.endTime ? ` - ${event.endTime}` : ''}
      </div>

      {/* Venue and Full Address */}
      <div className="event-meta">
        📍 {event.venue || 'Venue TBD'}{event.address ? `, ${event.address}` : ''}{!event.address && event.distance ? ` • ${event.distance}` : ''}
      </div>

      {/* Swipe Indicators */}
      {canSwipeRight && (
        <div className="swipe-indicators swipe-left">←</div>
      )}
      {canSwipeLeft && (
        <div className="swipe-indicators swipe-right">→</div>
      )}
    </div>
  );
};

export default EventDisplayCard;
