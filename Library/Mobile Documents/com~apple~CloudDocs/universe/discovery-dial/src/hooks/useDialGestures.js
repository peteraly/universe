import { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import { throttleRAF } from '../utils/performance';
import { getGestureConfig } from '../config/compassConfig';
import { ENABLE_INERTIA, DEBUG_GESTURES } from '../config/featureFlags';
import { getTouchZone, getDialGeometry, ZONES } from '../utils/gestureZones';
import { primarySwipeHaptic, subcategoryRotationHaptic, zoneEntryHaptic } from '../utils/haptics';

/**
 * Gesture detection engine for Event Compass dial.
 * Converts touch/mouse input into navigation actions.
 * 
 * Handles three gesture types:
 * 1. Primary category swipe (N/E/S/W directional)
 * 2. Subcategory rotation (horizontal arc drag with optional inertia)
 * 3. Event browsing (quick horizontal swipe in lower area)
 * 
 * @param {Object} actions - State actions from useEventCompassState
 * @param {Object} options - Configuration options (overrides default config)
 * @returns {Object} Gesture binding props and state
 * 
 * @example
 * const { bindDialAreaProps, bindLowerAreaProps, hoverSubIndex } = useDialGestures(actions);
 * <div {...bindDialAreaProps} />
 * <div {...bindLowerAreaProps} />
 */
export default function useDialGestures(actions, options = {}) {
  // ========================================
  // CONFIGURATION (from centralized config)
  // ========================================
  
  const config = useMemo(() => getGestureConfig(options), [options]);
  
  /** Inertia animation frame ID for cleanup */
  const inertiaRAF = useRef(null);

  // ========================================
  // STATE
  // ========================================
  
  /** Transient hover index during subcategory rotation */
  const [hoverSubIndex, setHoverSubIndex] = useState(null);
  
  /** REAL-TIME ROTATION: Current drag distance for visual feedback */
  const [dragDeltaX, setDragDeltaX] = useState(0);
  
  /** ZONE-AWARE: Current touch zone (CENTER | PERIMETER | null) */
  const [activeZone, setActiveZone] = useState(null);
  
  /** GESTURE FEEDBACK: Current active gesture type for visual hints */
  const [activeGestureType, setActiveGestureType] = useState(null);
  
  /** GESTURE FEEDBACK: Direction for primary swipe feedback */
  const [gestureDirection, setGestureDirection] = useState(null);
  
  /** Ref to dial element for zone calculations */
  const dialRef = useRef(null);
  
  /** Throttled setter for hover index (~60fps) to prevent render storms */
  const setHoverSubIndexThrottled = useMemo(
    () => throttleRAF(setHoverSubIndex),
    []
  );
  
  /** Throttled setter for drag delta (~60fps) for smooth rotation */
  const setDragDeltaXThrottled = useMemo(
    () => throttleRAF(setDragDeltaX),
    []
  );
  
  /** Gesture tracking refs */
  const gestureRef = useRef({
    isActive: false,
    startX: 0,
    startY: 0,
    startTime: 0,
    currentX: 0,
    currentY: 0,
    totalDeltaX: 0,
    gestureType: null, // 'swipe' | 'rotate' | 'event'
    area: null, // 'dial' | 'lower'
    zone: null // 'CENTER' | 'PERIMETER' | null (touch zone on dial)
  });

  // ========================================
  // GESTURE DETECTION UTILITIES
  // ========================================

  /**
   * Calculate swipe direction from start/end coordinates.
   * Returns dominant direction: 'north', 'east', 'south', 'west', or null.
   * 
   * @param {number} deltaX - Horizontal delta
   * @param {number} deltaY - Vertical delta
   * @param {number} distance - Total distance
   * @returns {string|null} Direction or null if threshold not met
   */
  const getSwipeDirection = useCallback((deltaX, deltaY, distance) => {
    if (distance < config.minSwipeDistance) return null;
    
    const absDeltaX = Math.abs(deltaX);
    const absDeltaY = Math.abs(deltaY);
    
    // Determine dominant axis and direction
    if (absDeltaY > absDeltaX) {
      // Vertical swipe
      return deltaY < 0 ? 'north' : 'south';
    } else {
      // Horizontal swipe
      return deltaX > 0 ? 'east' : 'west';
    }
  }, [config.minSwipeDistance]);

  /**
   * Calculate gesture velocity (pixels per millisecond).
   * 
   * @param {number} distance - Total distance traveled
   * @param {number} duration - Time duration in milliseconds
   * @returns {number} Velocity in px/ms
   */
  const calculateVelocity = useCallback((distance, duration) => {
    if (duration === 0) return 0;
    return distance / duration;
  }, []);

  /**
   * Determine if gesture is a rotation (horizontal drag) vs directional swipe.
   * Rotation is primarily horizontal with less vertical movement.
   * 
   * @param {number} deltaX - Horizontal delta
   * @param {number} deltaY - Vertical delta
   * @returns {boolean} True if gesture should be treated as rotation
   */
  const isRotationGesture = useCallback((deltaX, deltaY) => {
    const absDeltaX = Math.abs(deltaX);
    const absDeltaY = Math.abs(deltaY);
    
    // Rotation is primarily horizontal (1.1:1 ratio - very lenient)
    // This allows for natural circular drag with more vertical variance
    return absDeltaX > absDeltaY * 1.1;
  }, []);

  // ========================================
  // INERTIA HELPER (defined early for use in handlers)
  // ========================================
  
  /**
   * Apply inertia/momentum after a fast flick.
   * Continues spinning briefly with decay.
   * 
   * @param {number} velocity - Initial velocity magnitude
   * @param {number} direction - Direction: 1 (right) or -1 (left)
   */
  const applyInertia = useCallback((velocity, direction) => {
    // Cancel any existing inertia animation
    if (inertiaRAF.current) {
      cancelAnimationFrame(inertiaRAF.current);
      inertiaRAF.current = null;
    }
    
    let currentVelocity = velocity;
    const decay = 0.92; // Decay factor per frame (~60fps)
    const minVelocity = 0.5; // Stop when velocity drops below this
    
    function animate() {
      // Decay velocity
      currentVelocity *= decay;
      
      // Stop if velocity is too low
      if (currentVelocity < minVelocity) {
        inertiaRAF.current = null;
        return;
      }
      
      // Calculate steps for this frame
      const deltaThisFrame = currentVelocity * direction * (16 / 1000); // Assume 16ms per frame
      const stepsThisFrame = Math.round(deltaThisFrame / config.dialSensitivity);
      
      // Apply rotation if non-zero
      if (stepsThisFrame !== 0 && actions.rotateSub) {
        actions.rotateSub(stepsThisFrame);
      }
      
      // Continue animation
      inertiaRAF.current = requestAnimationFrame(animate);
    }
    
    inertiaRAF.current = requestAnimationFrame(animate);
  }, [actions, config.dialSensitivity]);

  // ========================================
  // DIAL AREA GESTURE HANDLERS
  // ========================================

  /**
   * Handle pointer down on dial area.
   * Initializes gesture tracking and detects touch zone.
   */
  const handleDialPointerDown = useCallback((e) => {
    const g = gestureRef.current;
    
    // TIME PICKER EXCLUSION: Don't start dial gesture if touch is in time picker zone (right 60px)
    const timePickerZoneStart = typeof window !== 'undefined' ? window.innerWidth - 60 : 0;
    if (e.clientX > timePickerZoneStart) {
      return; // Let time picker handle this touch
    }
    
    // ZONE DETECTION: Determine if touch is in CENTER or PERIMETER
    let touchZone = null;
    if (dialRef.current) {
      const { center, radius } = getDialGeometry(dialRef.current);
      touchZone = getTouchZone(e.clientX, e.clientY, center, radius);
      
      // Ignore touches outside dial
      if (touchZone === ZONES.OUTSIDE) {
        return;
      }
      
      // Set active zone for visual hints
      setActiveZone(touchZone);
      
      // Zone entry haptic feedback
      zoneEntryHaptic(touchZone);
      
      if (DEBUG_GESTURES) {
        console.log('🔵 Touch down in zone:', touchZone);
      }
    }
    
    g.isActive = true;
    g.startX = e.clientX;
    g.startY = e.clientY;
    g.currentX = e.clientX;
    g.currentY = e.clientY;
    g.startTime = Date.now();
    g.totalDeltaX = 0;
    g.gestureType = null;
    g.area = 'dial';
    g.zone = touchZone; // Store zone for gesture processing
    
    setHoverSubIndex(null);
    setActiveGestureType(null);
    setGestureDirection(null);
  }, []);

  /**
   * Handle pointer move on dial area.
   * Determines gesture type based on zone and provides live feedback.
   */
  const handleDialPointerMove = useCallback((e) => {
    const g = gestureRef.current;
    if (!g.isActive || g.area !== 'dial') return;
    
    const deltaX = e.clientX - g.startX;
    const deltaY = e.clientY - g.startY;
    
    g.currentX = e.clientX;
    g.currentY = e.clientY;
    
    // ZONE-AWARE: Determine gesture type based on touch zone and movement
    if (!g.gestureType && (Math.abs(deltaX) > 10 || Math.abs(deltaY) > 10)) {
      
      if (g.zone === ZONES.CENTER) {
        // CENTER ZONE: Only allow directional swipes (primary category)
        g.gestureType = 'swipe';
        setActiveGestureType('primarySwipe');
        
        if (DEBUG_GESTURES) {
          console.log('🔵 CENTER ZONE → PRIMARY SWIPE', {
            deltaX: deltaX.toFixed(1),
            deltaY: deltaY.toFixed(1)
          });
        }
        
      } else if (g.zone === ZONES.PERIMETER) {
        // PERIMETER ZONE: Only allow rotation (subcategory)
        // Still check if movement is primarily horizontal for natural feel
        if (isRotationGesture(deltaX, deltaY)) {
          g.gestureType = 'rotate';
          setActiveGestureType('subcategoryRotation');
          
          if (DEBUG_GESTURES) {
            console.log('🔵 PERIMETER ZONE → SUBCATEGORY ROTATION', {
              deltaX: deltaX.toFixed(1),
              deltaY: deltaY.toFixed(1),
              ratio: (Math.abs(deltaX) / Math.abs(deltaY)).toFixed(2)
            });
          }
        }
      }
    }
    
    // Handle rotation gesture - provide live feedback (throttled to ~60fps)
    if (g.gestureType === 'rotate') {
      g.totalDeltaX = deltaX;
      
      // REAL-TIME ROTATION: Update drag distance for visual feedback
      setDragDeltaXThrottled(deltaX);
      
      // Calculate hover index (tentative subcategory)
      const steps = Math.round(g.totalDeltaX / config.dialSensitivity);
      
      // Only show hover if steps is non-zero (throttled update)
      if (steps !== 0) {
        setHoverSubIndexThrottled(steps);
      } else {
        setHoverSubIndexThrottled(null);
      }
    }
    
    // Handle swipe gesture - track direction for visual feedback
    if (g.gestureType === 'swipe') {
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      if (distance > config.minSwipeDistance) {
        const direction = getSwipeDirection(deltaX, deltaY, distance);
        if (direction) {
          setGestureDirection(direction);
        }
      }
    }
  }, [config.dialSensitivity, config.minSwipeDistance, isRotationGesture, getSwipeDirection]);

  /**
   * Handle pointer up on dial area.
   * Commits the gesture and triggers appropriate action with enhanced haptics.
   */
  const handleDialPointerUp = useCallback((e) => {
    const g = gestureRef.current;
    if (!g.isActive || g.area !== 'dial') return;
    
    const deltaX = g.currentX - g.startX;
    const deltaY = g.currentY - g.startY;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    const duration = Date.now() - g.startTime;
    const velocity = calculateVelocity(distance, duration);
    
    // Process based on gesture type
    if (g.gestureType === 'swipe') {
      // Directional swipe for primary category
      if (velocity >= config.minSwipeVelocity) {
        const direction = getSwipeDirection(deltaX, deltaY, distance);
        if (direction && actions.setPrimaryByDirection) {
          if (DEBUG_GESTURES) {
            console.log('✅ PRIMARY SWIPE:', direction, {
              velocity: velocity.toFixed(2),
              distance: distance.toFixed(1),
              zone: g.zone
            });
          }
          
          // Enhanced haptic feedback for primary swipe
          primarySwipeHaptic();
          
          actions.setPrimaryByDirection(direction);
        }
      }
    } else if (g.gestureType === 'rotate') {
      // Rotation for subcategory
      const steps = Math.round(g.totalDeltaX / config.dialSensitivity);
      if (steps !== 0 && actions.rotateSub) {
        if (DEBUG_GESTURES) {
          console.log('✅ SUBCATEGORY ROTATION:', steps, 'steps', {
            totalDeltaX: g.totalDeltaX.toFixed(1),
            sensitivity: config.dialSensitivity,
            zone: g.zone
          });
        }
        
        // Enhanced haptic feedback for subcategory rotation
        subcategoryRotationHaptic();
        
        actions.rotateSub(steps);
      }
      
      // Apply inertia if enabled and velocity is high
      if (ENABLE_INERTIA) {
        const velocity = calculateVelocity(g.totalDeltaX, 0);
        const velocityMagnitude = Math.abs(velocity);
        
        // If flick is fast enough (> 1.5 px/ms), apply inertia
        if (velocityMagnitude > 1.5) {
          applyInertia(velocityMagnitude, Math.sign(velocity));
        }
      }
    }
    
    // Reset state
    g.isActive = false;
    g.gestureType = null;
    g.area = null;
    g.zone = null;
    setHoverSubIndex(null);
    setDragDeltaX(0);  // REAL-TIME ROTATION: Reset visual feedback
    setActiveZone(null); // Clear zone visual hints
    setActiveGestureType(null); // Clear gesture feedback
    setGestureDirection(null); // Clear direction feedback
  }, [
    actions,
    config.minSwipeVelocity,
    config.dialSensitivity,
    calculateVelocity,
    getSwipeDirection,
    applyInertia
  ]);
  
  /**
   * Handle pointer cancel (e.g., gesture interrupted).
   */
  const handleDialPointerCancel = useCallback(() => {
    const g = gestureRef.current;
    g.isActive = false;
    g.gestureType = null;
    g.area = null;
    g.zone = null;
    setHoverSubIndex(null);
    setDragDeltaX(0);  // REAL-TIME ROTATION: Reset visual feedback
    setActiveZone(null); // Clear zone visual hints
    setActiveGestureType(null); // Clear gesture feedback
    setGestureDirection(null); // Clear direction feedback
    
    // Cancel inertia on gesture interrupt
    if (inertiaRAF.current) {
      cancelAnimationFrame(inertiaRAF.current);
      inertiaRAF.current = null;
    }
  }, []);

  // ========================================
  // LOWER AREA GESTURE HANDLERS (Event Swipe)
  // ========================================

  /**
   * Handle pointer down on lower area (event readout).
   */
  const handleLowerPointerDown = useCallback((e) => {
    const g = gestureRef.current;
    g.isActive = true;
    g.startX = e.clientX;
    g.startY = e.clientY;
    g.currentX = e.clientX;
    g.currentY = e.clientY;
    g.startTime = Date.now();
    g.gestureType = 'event';
    g.area = 'lower';
  }, []);

  /**
   * Handle pointer move on lower area.
   */
  const handleLowerPointerMove = useCallback((e) => {
    const g = gestureRef.current;
    if (!g.isActive || g.area !== 'lower') return;
    
    g.currentX = e.clientX;
    g.currentY = e.clientY;
  }, []);

  /**
   * Handle pointer up on lower area.
   * Detects quick horizontal swipes for event navigation.
   */
  const handleLowerPointerUp = useCallback((e) => {
    const g = gestureRef.current;
    if (!g.isActive || g.area !== 'lower') return;
    
    const deltaX = g.currentX - g.startX;
    const deltaY = g.currentY - g.startY;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    const duration = Date.now() - g.startTime;
    
    // Quick horizontal swipe for event navigation
    const isQuickSwipe = duration < config.eventSwipeDuration;
    const isHorizontal = Math.abs(deltaX) > Math.abs(deltaY) * 2;
    const meetsDistance = distance >= config.eventSwipeDistance;
    
    if (isQuickSwipe && isHorizontal && meetsDistance) {
      if (deltaX > 0 && actions.prevEvent) {
        // Swipe right -> previous event
        actions.prevEvent();
      } else if (deltaX < 0 && actions.nextEvent) {
        // Swipe left -> next event
        actions.nextEvent();
      }
    }
    
    // Reset state
    g.isActive = false;
    g.gestureType = null;
    g.area = null;
  }, [
    actions,
    config.eventSwipeDistance,
    config.eventSwipeDuration
  ]);

  /**
   * Handle pointer cancel on lower area.
   */
  const handleLowerPointerCancel = useCallback(() => {
    const g = gestureRef.current;
    g.isActive = false;
    g.gestureType = null;
    g.area = null;
  }, []);

  // ========================================
  // CLEANUP
  // ========================================
  
  /**
   * Cleanup inertia animation on unmount.
   */
  useEffect(() => {
    return () => {
      if (inertiaRAF.current) {
        cancelAnimationFrame(inertiaRAF.current);
        inertiaRAF.current = null;
      }
    };
  }, []);
  
  // ========================================
  // PUBLIC API
  // ========================================

  return {
    /**
     * Props to spread onto dial container element.
     * Handles primary category swipe and subcategory rotation.
     */
    bindDialAreaProps: {
      onPointerDown: handleDialPointerDown,
      onPointerMove: handleDialPointerMove,
      onPointerUp: handleDialPointerUp,
      onPointerCancel: handleDialPointerCancel,
      style: {
        touchAction: 'none', // Prevent browser touch defaults
        userSelect: 'none'   // Prevent text selection
      }
    },

    /**
     * Props to spread onto lower event readout area.
     * Handles quick event navigation swipes.
     */
    bindLowerAreaProps: {
      onPointerDown: handleLowerPointerDown,
      onPointerMove: handleLowerPointerMove,
      onPointerUp: handleLowerPointerUp,
      onPointerCancel: handleLowerPointerCancel,
      style: {
        touchAction: 'none',
        userSelect: 'none'
      }
    },

    /**
     * Current hover subcategory index during rotation.
     * Null when not actively rotating.
     * Use for visual feedback (soft highlight).
     * 
     * @type {number|null}
     */
    hoverSubIndex,

    /**
     * REAL-TIME ROTATION: Current horizontal drag distance in pixels.
     * Updates continuously during rotation gesture for visual feedback.
     * Use to calculate real-time label rotation offset.
     * 
     * @type {number}
     */
    dragDeltaX,

    /**
     * ZONE-AWARE: Current touch zone (CENTER | PERIMETER | null).
     * Used for showing zone-specific visual hints.
     * 
     * @type {string|null}
     */
    activeZone,

    /**
     * GESTURE FEEDBACK: Current active gesture type ('primarySwipe' | 'subcategoryRotation' | null).
     * Used for showing gesture-specific visual feedback.
     * 
     * @type {string|null}
     */
    activeGestureType,

    /**
     * GESTURE FEEDBACK: Direction of primary swipe ('north' | 'east' | 'south' | 'west' | null).
     * Used for showing directional arrows during swipe.
     * 
     * @type {string|null}
     */
    gestureDirection,

    /**
     * ZONE DETECTION: Ref to dial element for zone calculations.
     * Must be attached to the dial container element.
     * 
     * @type {React.RefObject}
     */
    dialRef
  };
}

