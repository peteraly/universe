import { useState, useRef, useCallback } from 'react';

/**
 * Custom hook for detecting swipe gestures
 * @param {Object} options - Configuration options
 * @param {number} options.threshold - Minimum distance for a valid swipe (default: 50)
 * @param {number} options.maxVerticalDistance - Maximum vertical distance to consider it horizontal swipe (default: 100)
 * @param {Function} options.onSwipeLeft - Callback for left swipe
 * @param {Function} options.onSwipeRight - Callback for right swipe
 * @param {Function} options.onSwipeUp - Callback for up swipe
 * @param {Function} options.onSwipeDown - Callback for down swipe
 * @returns {Object} Swipe detection state and handlers
 */
const useSwipeDetection = ({
  threshold = 50,
  maxVerticalDistance = 100,
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  enabled = true
} = {}) => {
  const [swipeState, setSwipeState] = useState({
    isActive: false,
    direction: null,
    distance: 0,
    startX: 0,
    startY: 0,
    currentX: 0,
    currentY: 0
  });

  const startPos = useRef({ x: 0, y: 0 });
  const isTracking = useRef(false);

  const handleStart = useCallback((clientX, clientY) => {
    if (!enabled) return;

    startPos.current = { x: clientX, y: clientY };
    isTracking.current = true;

    setSwipeState({
      isActive: true,
      direction: null,
      distance: 0,
      startX: clientX,
      startY: clientY,
      currentX: clientX,
      currentY: clientY
    });
  }, [enabled]);

  const handleMove = useCallback((clientX, clientY) => {
    if (!enabled || !isTracking.current) return;

    const deltaX = clientX - startPos.current.x;
    const deltaY = clientY - startPos.current.y;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    // Determine direction
    let direction = null;
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      // Horizontal swipe
      if (Math.abs(deltaY) < maxVerticalDistance) {
        direction = deltaX > 0 ? 'right' : 'left';
      }
    } else {
      // Vertical swipe
      if (Math.abs(deltaX) < maxVerticalDistance) {
        direction = deltaY > 0 ? 'down' : 'up';
      }
    }

    setSwipeState(prev => ({
      ...prev,
      direction,
      distance,
      currentX: clientX,
      currentY: clientY
    }));
  }, [enabled, maxVerticalDistance]);

  const handleEnd = useCallback((clientX, clientY) => {
    if (!enabled || !isTracking.current) return;

    const deltaX = clientX - startPos.current.x;
    const deltaY = clientY - startPos.current.y;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    // Check if it's a valid swipe
    if (distance >= threshold) {
      let direction = null;
      
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        // Horizontal swipe
        if (Math.abs(deltaY) < maxVerticalDistance) {
          direction = deltaX > 0 ? 'right' : 'left';
        }
      } else {
        // Vertical swipe
        if (Math.abs(deltaX) < maxVerticalDistance) {
          direction = deltaY > 0 ? 'down' : 'up';
        }
      }

      // Trigger appropriate callback
      if (direction) {
        switch (direction) {
          case 'left':
            onSwipeLeft && onSwipeLeft({ distance, deltaX, deltaY });
            break;
          case 'right':
            onSwipeRight && onSwipeRight({ distance, deltaX, deltaY });
            break;
          case 'up':
            onSwipeUp && onSwipeUp({ distance, deltaX, deltaY });
            break;
          case 'down':
            onSwipeDown && onSwipeDown({ distance, deltaX, deltaY });
            break;
        }
      }
    }

    // Reset state
    isTracking.current = false;
    setSwipeState({
      isActive: false,
      direction: null,
      distance: 0,
      startX: 0,
      startY: 0,
      currentX: 0,
      currentY: 0
    });
  }, [enabled, threshold, maxVerticalDistance, onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown]);

  // Touch event handlers
  const touchHandlers = {
    onTouchStart: (e) => {
      const touch = e.touches[0];
      handleStart(touch.clientX, touch.clientY);
    },
    onTouchMove: (e) => {
      const touch = e.touches[0];
      handleMove(touch.clientX, touch.clientY);
    },
    onTouchEnd: (e) => {
      const touch = e.changedTouches[0];
      handleEnd(touch.clientX, touch.clientY);
    }
  };

  // Mouse event handlers
  const mouseHandlers = {
    onMouseDown: (e) => {
      e.preventDefault();
      handleStart(e.clientX, e.clientY);
    },
    onMouseMove: (e) => {
      if (isTracking.current) {
        e.preventDefault();
        handleMove(e.clientX, e.clientY);
      }
    },
    onMouseUp: (e) => {
      if (isTracking.current) {
        e.preventDefault();
        handleEnd(e.clientX, e.clientY);
      }
    }
  };

  // Combined handlers
  const handlers = {
    ...touchHandlers,
    ...mouseHandlers
  };

  return {
    swipeState,
    handlers,
    isTracking: isTracking.current
  };
};

export default useSwipeDetection;
