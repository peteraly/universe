import { useState, useCallback, useRef } from 'react';

// Gesture Priority System (Highest to Lowest)
const GESTURE_PRIORITIES = {
  DIAL_VERTICAL_SWIPE: 1,    // Primary category switching
  DIAL_CIRCULAR_DRAG: 2,     // Subcategory switching  
  EVENT_HORIZONTAL_SWIPE: 3  // Event navigation
};

// Performance Configuration
const PERFORMANCE_CONFIG = {
  GESTURE_DEBOUNCE: 16,        // 60fps throttling
  HAPTIC_DEBOUNCE: 100,        // Prevent haptic spam
  ANIMATION_DURATION: 250,     // Smooth but snappy
  VELOCITY_THRESHOLD: 150,     // px/s minimum
  GESTURE_TIMEOUT: 500,        // ms maximum gesture duration
  VERTICAL_THRESHOLD: 50,      // px minimum for vertical swipe
  HORIZONTAL_THRESHOLD: 30,    // px minimum for horizontal swipe
  CIRCULAR_THRESHOLD: 15       // degrees minimum for circular drag
};

// Accessibility Configuration
const ACCESSIBILITY_CONFIG = {
  KEYBOARD_SUPPORT: {
    'ArrowUp': 'DIAL_VERTICAL_SWIPE_UP',
    'ArrowDown': 'DIAL_VERTICAL_SWIPE_DOWN',
    'ArrowLeft': 'EVENT_HORIZONTAL_SWIPE_LEFT',
    'ArrowRight': 'EVENT_HORIZONTAL_SWIPE_RIGHT',
    'Space': 'DIAL_CIRCULAR_DRAG_NEXT'
  }
};

const useGestureDetection = () => {
  const [gestureState, setGestureState] = useState({
    activeGesture: null,
    isProcessing: false,
    lastGestureTime: 0,
    startPos: null,
    startTime: null,
    currentPos: null
  });

  const hapticTimeoutRef = useRef(null);
  const gestureTimeoutRef = useRef(null);

  // Haptic feedback with debouncing
  const triggerHaptic = useCallback((type = 'light') => {
    if (hapticTimeoutRef.current) return;
    
    if (navigator.vibrate) {
      const duration = type === 'light' ? 10 : type === 'medium' ? 20 : 30;
      navigator.vibrate(duration);
      
      hapticTimeoutRef.current = setTimeout(() => {
        hapticTimeoutRef.current = null;
      }, PERFORMANCE_CONFIG.HAPTIC_DEBOUNCE);
    }
  }, []);

  // Check if position is in dial area
  const isInDialArea = useCallback((pos, dialBounds) => {
    if (!dialBounds) return false;
    return (
      pos.x >= dialBounds.left &&
      pos.x <= dialBounds.right &&
      pos.y >= dialBounds.top &&
      pos.y <= dialBounds.bottom
    );
  }, []);

  // Check if position is in event area
  const isInEventArea = useCallback((pos, eventBounds) => {
    if (!eventBounds) return false;
    return (
      pos.x >= eventBounds.left &&
      pos.x <= eventBounds.right &&
      pos.y >= eventBounds.top &&
      pos.y <= eventBounds.bottom
    );
  }, []);

  // Calculate angle between two points
  const calculateAngle = useCallback((startPos, endPos) => {
    const deltaX = endPos.x - startPos.x;
    const deltaY = endPos.y - startPos.y;
    return Math.atan2(deltaY, deltaX) * (180 / Math.PI);
  }, []);

  // Check if motion is circular
  const isCircularMotion = useCallback((startPos, endPos, centerPos) => {
    if (!centerPos) return false;
    
    const startDistance = Math.sqrt(
      Math.pow(startPos.x - centerPos.x, 2) + Math.pow(startPos.y - centerPos.y, 2)
    );
    const endDistance = Math.sqrt(
      Math.pow(endPos.x - centerPos.x, 2) + Math.pow(endPos.y - centerPos.y, 2)
    );
    
    // Check if distance from center is roughly the same (circular motion)
    const distanceRatio = Math.abs(startDistance - endDistance) / startDistance;
    return distanceRatio < 0.3; // Allow 30% variation
  }, []);

  // Main gesture detection function
  const detectGesture = useCallback((startPos, endPos, deltaTime, dialBounds, eventBounds, dialCenter) => {
    if (!startPos || !endPos || deltaTime === 0) return null;

    const deltaX = endPos.x - startPos.x;
    const deltaY = endPos.y - startPos.y;
    const velocity = Math.sqrt(deltaX**2 + deltaY**2) / deltaTime * 1000; // px/s

    // Check velocity threshold
    if (velocity < PERFORMANCE_CONFIG.VELOCITY_THRESHOLD) return null;

    // Priority 1: Dial Vertical Swipe
    if (isInDialArea(startPos, dialBounds) && 
        Math.abs(deltaY) > Math.abs(deltaX) * 1.5 && 
        Math.abs(deltaY) > PERFORMANCE_CONFIG.VERTICAL_THRESHOLD) {
      return { 
        type: 'DIAL_VERTICAL_SWIPE', 
        direction: deltaY > 0 ? 'down' : 'up',
        priority: GESTURE_PRIORITIES.DIAL_VERTICAL_SWIPE,
        velocity,
        deltaY
      };
    }

    // Priority 2: Dial Circular Drag
    if (isInDialArea(startPos, dialBounds) && 
        isCircularMotion(startPos, endPos, dialCenter)) {
      const angle = calculateAngle(startPos, endPos);
      if (Math.abs(angle) > PERFORMANCE_CONFIG.CIRCULAR_THRESHOLD) {
        return { 
          type: 'DIAL_CIRCULAR_DRAG', 
          angle,
          priority: GESTURE_PRIORITIES.DIAL_CIRCULAR_DRAG,
          velocity,
          direction: angle > 0 ? 'clockwise' : 'counterclockwise'
        };
      }
    }

    // Priority 3: Event Horizontal Swipe
    if (isInEventArea(startPos, eventBounds) && 
        Math.abs(deltaX) > Math.abs(deltaY) * 1.5 && 
        Math.abs(deltaX) > PERFORMANCE_CONFIG.HORIZONTAL_THRESHOLD) {
      return { 
        type: 'EVENT_HORIZONTAL_SWIPE', 
        direction: deltaX > 0 ? 'right' : 'left',
        priority: GESTURE_PRIORITIES.EVENT_HORIZONTAL_SWIPE,
        velocity,
        deltaX
      };
    }

    return null;
  }, [isInDialArea, isInEventArea, isCircularMotion, calculateAngle]);

  // Handle touch start
  const handleTouchStart = useCallback((e, dialBounds, eventBounds, dialCenter) => {
    // Prevent default browser behaviors that interfere with dial gestures
    e.preventDefault();
    e.stopPropagation();
    
    const touch = e.touches[0];
    const startPos = { x: touch.clientX, y: touch.clientY };
    const startTime = Date.now();

    setGestureState(prev => ({
      ...prev,
      startPos,
      startTime,
      currentPos: startPos,
      activeGesture: null,
      isProcessing: false
    }));

    // Set gesture timeout
    if (gestureTimeoutRef.current) {
      clearTimeout(gestureTimeoutRef.current);
    }
    gestureTimeoutRef.current = setTimeout(() => {
      setGestureState(prev => ({
        ...prev,
        activeGesture: null,
        isProcessing: false
      }));
    }, PERFORMANCE_CONFIG.GESTURE_TIMEOUT);

  }, []);

  // Handle touch move
  const handleTouchMove = useCallback((e, dialBounds, eventBounds, dialCenter, onGestureDetected) => {
    if (!gestureState.startPos || !gestureState.startTime) return;

    // Prevent default browser behaviors that interfere with dial gestures
    e.preventDefault();
    e.stopPropagation();

    const touch = e.touches[0];
    const currentPos = { x: touch.clientX, y: touch.clientY };
    const deltaTime = Date.now() - gestureState.startTime;

    setGestureState(prev => ({
      ...prev,
      currentPos
    }));

    // Detect gesture
    const gesture = detectGesture(
      gestureState.startPos, 
      currentPos, 
      deltaTime, 
      dialBounds, 
      eventBounds, 
      dialCenter
    );

    if (gesture && gesture.type !== gestureState.activeGesture) {
      setGestureState(prev => ({
        ...prev,
        activeGesture: gesture.type,
        isProcessing: true
      }));

      // Execute gesture callback
      onGestureDetected?.(gesture);
    }
  }, [gestureState, detectGesture]);

  // Handle touch end
  const handleTouchEnd = useCallback((e, onGestureComplete) => {
    // Prevent default browser behaviors that interfere with dial gestures
    e.preventDefault();
    e.stopPropagation();
    
    if (gestureState.activeGesture) {
      onGestureComplete?.(gestureState.activeGesture);
    }

    // Clear timeouts
    if (gestureTimeoutRef.current) {
      clearTimeout(gestureTimeoutRef.current);
      gestureTimeoutRef.current = null;
    }

    // Reset gesture state
    setGestureState(prev => ({
      ...prev,
      activeGesture: null,
      isProcessing: false,
      startPos: null,
      startTime: null,
      currentPos: null
    }));
  }, [gestureState.activeGesture]);

  // Keyboard support
  const handleKeyDown = useCallback((e, onKeyboardGesture) => {
    const gesture = ACCESSIBILITY_CONFIG.KEYBOARD_SUPPORT[e.key];
    if (gesture) {
      e.preventDefault();
      onKeyboardGesture?.(gesture);
    }
  }, []);

  return {
    gestureState,
    triggerHaptic,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    handleKeyDown,
    isInDialArea,
    isInEventArea
  };
};

export default useGestureDetection;

