import { useCallback, useRef } from 'react';

const useDirectionalSwipeDetection = (onSwipe) => {
  const startX = useRef(0);
  const startY = useRef(0);
  const startTime = useRef(0);
  const threshold = 50; // Minimum distance for swipe
  const velocityThreshold = 0.3; // Minimum velocity for swipe

  const handleTouchStart = useCallback((e) => {
    const touch = e.touches[0];
    startX.current = touch.clientX;
    startY.current = touch.clientY;
    startTime.current = Date.now();
  }, []);

  const handleTouchEnd = useCallback((e) => {
    const touch = e.changedTouches[0];
    const endX = touch.clientX;
    const endY = touch.clientY;
    const endTime = Date.now();

    const deltaX = endX - startX.current;
    const deltaY = endY - startY.current;
    const deltaTime = endTime - startTime.current;

    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    const velocity = distance / deltaTime;

    // Check if swipe meets threshold requirements
    if (distance > threshold && velocity > velocityThreshold) {
      const absDeltaX = Math.abs(deltaX);
      const absDeltaY = Math.abs(deltaY);

      // Determine primary direction
      if (absDeltaY > absDeltaX) {
        // Vertical swipe
        if (deltaY < 0) {
          onSwipe('up'); // NORTH - Social
        } else {
          onSwipe('down'); // SOUTH - Recreational
        }
      } else {
        // Horizontal swipe
        if (deltaX > 0) {
          onSwipe('right'); // EAST - Educational
        } else {
          onSwipe('left'); // WEST - Professional
        }
      }
    }
  }, [onSwipe, threshold, velocityThreshold]);

  return {
    handleTouchStart,
    handleTouchEnd
  };
};

export default useDirectionalSwipeDetection;
