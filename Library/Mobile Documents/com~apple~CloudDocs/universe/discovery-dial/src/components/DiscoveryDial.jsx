import React, { useState, useEffect, useRef } from 'react'

const DiscoveryDial = () => {
  const [currentEvent, setCurrentEvent] = useState(null)
  const [events, setEvents] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [toast, setToast] = useState(null)
  const [gestureState, setGestureState] = useState('idle')
  const [swipeDirection, setSwipeDirection] = useState(null)
  const dialRef = useRef(null)
  const touchStartRef = useRef(null)
  const touchEndRef = useRef(null)

  // Load events on component mount
  useEffect(() => {
    loadEvents()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Load events from API
  const loadEvents = async () => {
    try {
      setIsLoading(true)
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Mock events for demo
      const mockEvents = [
        {
          id: 'evt-001',
          name: 'Tech Innovation Summit 2024',
          description: 'A comprehensive summit featuring the latest in AI, blockchain, and emerging technologies.',
          date: '2024-03-15',
          time: '09:00',
          venue: 'San Francisco Convention Center',
          category: 'Tech',
          tags: ['AI', 'blockchain', 'networking']
        },
        {
          id: 'evt-002',
          name: 'Art Gallery Opening: Digital Futures',
          description: 'Experience the intersection of art and technology in this groundbreaking exhibition.',
          date: '2024-03-22',
          time: '18:00',
          venue: 'Modern Art Museum',
          category: 'Art',
          tags: ['digital art', 'technology', 'exhibition']
        }
      ]
      
      setEvents(mockEvents)
      if (mockEvents.length > 0) {
        setCurrentEvent(mockEvents[0])
      }
    } catch (error) {
      showToast('Failed to load events', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  // Show toast notification
  const showToast = (message, type = 'info') => {
    setToast({ message, type, id: Date.now() })
    setTimeout(() => setToast(null), 3000)
  }

  // Handle touch start
  const handleTouchStart = (e) => {
    touchStartRef.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
      time: Date.now()
    }
    setGestureState('touching')
  }

  // Handle touch end
  const handleTouchEnd = (e) => {
    if (!touchStartRef.current) return

    touchEndRef.current = {
      x: e.changedTouches[0].clientX,
      y: e.changedTouches[0].clientY,
      time: Date.now()
    }

    const deltaX = touchEndRef.current.x - touchStartRef.current.x
    const deltaY = touchEndRef.current.y - touchStartRef.current.y
    const deltaTime = touchEndRef.current.time - touchStartRef.current.time

    // Minimum swipe distance and maximum time
    const minSwipeDistance = 50
    const maxSwipeTime = 300

    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > minSwipeDistance && deltaTime < maxSwipeTime) {
      if (deltaX > 0) {
        handleSwipe('right')
      } else {
        handleSwipe('left')
      }
    }

    setGestureState('idle')
    setSwipeDirection(null)
  }

  // Handle swipe gestures
  const handleSwipe = (direction) => {
    setSwipeDirection(direction)
    
    if (events.length === 0) return

    const currentIndex = events.findIndex(event => event.id === currentEvent?.id)
    let newIndex

    if (direction === 'left') {
      newIndex = currentIndex < events.length - 1 ? currentIndex + 1 : 0
    } else {
      newIndex = currentIndex > 0 ? currentIndex - 1 : events.length - 1
    }

    setCurrentEvent(events[newIndex])
    showToast(`Swiped ${direction}`, 'info')
  }

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (events.length === 0) return

    const currentIndex = events.findIndex(event => event.id === currentEvent?.id)
    let newIndex

    switch (e.key) {
      case 'ArrowLeft':
        e.preventDefault()
        newIndex = currentIndex < events.length - 1 ? currentIndex + 1 : 0
        setCurrentEvent(events[newIndex])
        showToast('Next event', 'info')
        break
      case 'ArrowRight':
        e.preventDefault()
        newIndex = currentIndex > 0 ? currentIndex - 1 : events.length - 1
        setCurrentEvent(events[newIndex])
        showToast('Previous event', 'info')
        break
      case 'Enter':
      case ' ':
        e.preventDefault()
        if (currentEvent) {
          showToast(`Selected: ${currentEvent.name}`, 'success')
        }
        break
    }
  }

  // Handle long press for calendar
  const handleLongPress = () => {
    showToast('Calendar feature coming soon', 'info')
  }

  // Handle double tap to save
  const handleDoubleTap = () => {
    if (currentEvent) {
      showToast(`Saved: ${currentEvent.name}`, 'success')
    }
  }

  return (
    <div 
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        fontFamily: 'system-ui, -apple-system, sans-serif'
      }}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="main"
      aria-label="Discovery Dial - Event exploration interface"
    >
      <div 
        ref={dialRef}
        style={{
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          borderRadius: '20px',
          padding: '40px',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          maxWidth: '600px',
          width: '100%',
          color: 'white',
          textAlign: 'center',
          transform: swipeDirection ? `translateX(${swipeDirection === 'left' ? '-10px' : '10px'})` : 'translateX(0)',
          transition: 'transform 0.2s ease-out',
          cursor: gestureState === 'touching' ? 'grabbing' : 'grab'
        }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleTouchStart}
        onMouseUp={handleTouchEnd}
        onContextMenu={(e) => e.preventDefault()}
        role="region"
        aria-label="Event discovery dial"
      >
        <h1 style={{ 
          fontSize: '3rem', 
          marginBottom: '20px',
          fontWeight: '700'
        }}>
          Discovery Dial
        </h1>
        
        <p style={{ 
          fontSize: '1.2rem', 
          marginBottom: '30px',
          opacity: 0.9
        }}>
          Discover events through intuitive gesture navigation
        </p>
        
        {/* Loading State */}
        {isLoading ? (
          <div style={{
            padding: '40px',
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '12px',
            marginBottom: '20px'
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              border: '3px solid rgba(255, 255, 255, 0.3)',
              borderTop: '3px solid white',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 20px'
            }} />
            <h3 style={{ fontSize: '1.5rem', marginBottom: '15px' }}>
              Loading Events...
            </h3>
            <p style={{ opacity: 0.8 }}>
              Discovering amazing events for you
            </p>
          </div>
        ) : events.length === 0 ? (
          <div style={{
            padding: '30px',
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '12px',
            marginBottom: '20px'
          }}>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '15px' }}>
              No events available
            </h3>
            <p style={{ opacity: 0.8, marginBottom: '20px' }}>
              Events will appear here once they're added to the system.
            </p>
            <button
              onClick={() => window.location.href = '/admin'}
              style={{
                padding: '12px 24px',
                background: 'rgba(255, 255, 255, 0.2)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                borderRadius: '8px',
                color: 'white',
                fontSize: '1rem',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = 'rgba(255, 255, 255, 0.3)'
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'rgba(255, 255, 255, 0.2)'
              }}
            >
              Admin Panel
            </button>
          </div>
        ) : (
          <div>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '20px' }}>
              Current Event
            </h3>
            {currentEvent && (
              <div 
                style={{
                  padding: '20px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: '12px',
                  marginBottom: '20px',
                  transform: swipeDirection ? `scale(${swipeDirection === 'left' ? '0.95' : '1.05'})` : 'scale(1)',
                  transition: 'transform 0.2s ease-out'
                }}
                role="article"
                aria-label={`Event: ${currentEvent.name}`}
              >
                <h4 style={{ fontSize: '1.2rem', marginBottom: '10px' }}>
                  {currentEvent.name}
                </h4>
                <p style={{ opacity: 0.8, marginBottom: '15px' }}>
                  {currentEvent.description}
                </p>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  fontSize: '0.9rem',
                  opacity: 0.7
                }}>
                  <span>📅 {currentEvent.date}</span>
                  <span>🕐 {currentEvent.time}</span>
                  <span>📍 {currentEvent.venue}</span>
                </div>
                <div style={{ 
                  marginTop: '10px',
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '5px',
                  justifyContent: 'center'
                }}>
                  {currentEvent.tags.map((tag, index) => (
                    <span 
                      key={index}
                      style={{
                        background: 'rgba(255, 255, 255, 0.2)',
                        padding: '4px 8px',
                        borderRadius: '12px',
                        fontSize: '0.8rem'
                      }}
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {/* Navigation Instructions */}
            <div style={{
              fontSize: '0.9rem',
              opacity: 0.7,
              marginTop: '20px',
              padding: '15px',
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '8px'
            }}>
              <p style={{ marginBottom: '10px' }}>
                <strong>Navigation:</strong>
              </p>
              <p>👆 Swipe left/right or use arrow keys to navigate</p>
              <p>⌨️ Press Enter or Space to select</p>
              <p>👆 Double-tap to save event</p>
              <p>👆 Long-press for calendar (coming soon)</p>
            </div>
          </div>
        )}
        
        <div style={{
          fontSize: '0.9rem',
          opacity: 0.7,
          marginTop: '20px'
        }}>
          V12.0 - Mission Control System
        </div>
      </div>
      
      {/* Toast Notifications */}
      {toast && (
        <div 
          style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            background: toast.type === 'error' ? '#ef4444' : toast.type === 'success' ? '#10b981' : '#3b82f6',
            color: 'white',
            padding: '12px 20px',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
            zIndex: 1000,
            animation: 'slideIn 0.3s ease-out',
            maxWidth: '300px',
            fontSize: '0.9rem'
          }}
          role="alert"
          aria-live="polite"
        >
          {toast.message}
        </div>
      )}
      
      {/* CSS Animations */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        
        .gesture-feedback {
          animation: pulse 0.3s ease-out;
        }
      `}</style>
    </div>
  )
}

export default DiscoveryDial
