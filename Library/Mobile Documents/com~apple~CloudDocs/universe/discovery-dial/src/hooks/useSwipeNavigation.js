import { useState, useCallback, useRef, useEffect } from 'react';

const useSwipeNavigation = (events = [], onEventChange) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [prefetchedEvents, setPrefetchedEvents] = useState([]);
  const [isSwipeActive, setIsSwipeActive] = useState(false);
  const [swipeDirection, setSwipeDirection] = useState(null);
  
  const startX = useRef(0);
  const startY = useRef(0);
  const startTime = useRef(0);
  const threshold = 24; // 24-32px horizontal movement
  const velocityThreshold = 200; // 200px/s minimum velocity

  // Prefetch events around current index - FIXED: Remove events dependency to prevent infinite loop
  const prefetchAroundIndex = useCallback((index, eventsArray) => {
    const start = Math.max(0, index - 3);
    const end = Math.min(eventsArray.length, index + 4);
    setPrefetchedEvents(eventsArray.slice(start, end));
  }, []); // FIXED: Empty dependency array

  // Update current event and prefetch - FIXED: Remove dependencies to prevent infinite loop
  const updateCurrentIndex = useCallback((newIndex) => {
    if (newIndex >= 0 && newIndex < events.length && newIndex !== currentIndex) {
      setCurrentIndex(newIndex);
      prefetchAroundIndex(newIndex, events);
      onEventChange?.(events[newIndex], newIndex);
      return true;
    }
    return false;
  }, [currentIndex, events, prefetchAroundIndex, onEventChange]); // Keep minimal dependencies

  // Handle swipe navigation
  const handleSwipe = useCallback((direction) => {
    const newIndex = direction === 'left' 
      ? Math.min(currentIndex + 1, events.length - 1)
      : Math.max(currentIndex - 1, 0);
    
    return updateCurrentIndex(newIndex);
  }, [currentIndex, events.length, updateCurrentIndex]);

  // Touch event handlers
  const handleTouchStart = useCallback((e) => {
    const touch = e.touches[0];
    startX.current = touch.clientX;
    startY.current = touch.clientY;
    startTime.current = Date.now();
    setIsSwipeActive(true);
  }, []);

  const handleTouchMove = useCallback((e) => {
    if (!isSwipeActive) return;
    
    const touch = e.touches[0];
    const deltaX = touch.clientX - startX.current;
    const deltaY = touch.clientY - startY.current;
    
    // Determine swipe direction
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      setSwipeDirection(deltaX > 0 ? 'right' : 'left');
    }
  }, [isSwipeActive]);

  const handleTouchEnd = useCallback((e) => {
    if (!isSwipeActive) return;
    
    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - startX.current;
    const deltaY = touch.clientY - startY.current;
    const deltaTime = Date.now() - startTime.current;
    
    const velocity = Math.abs(deltaX) / deltaTime * 1000; // px/s
    
    // Check if swipe meets threshold requirements
    if (Math.abs(deltaX) > threshold && 
        Math.abs(deltaX) > Math.abs(deltaY) && 
        velocity > velocityThreshold) {
      
      const direction = deltaX > 0 ? 'right' : 'left';
      const success = handleSwipe(direction);
      
      if (success) {
        // Haptic feedback
        if (navigator.vibrate) {
          navigator.vibrate(10);
        }
      }
    }
    
    setIsSwipeActive(false);
    setSwipeDirection(null);
  }, [isSwipeActive, threshold, velocityThreshold, handleSwipe]);

  // Reset index when events change
  useEffect(() => {
    if (events.length > 0) {
      setCurrentIndex(0);
      prefetchAroundIndex(0);
    }
  }, [events, prefetchAroundIndex]);

  // Get current event
  const currentEvent = events[currentIndex] || null;

  return {
    currentIndex,
    currentEvent,
    totalEvents: events.length,
    prefetchedEvents,
    isSwipeActive,
    swipeDirection,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    handleSwipe,
    updateCurrentIndex,
    canSwipeLeft: currentIndex < events.length - 1,
    canSwipeRight: currentIndex > 0
  };
};

export default useSwipeNavigation;
