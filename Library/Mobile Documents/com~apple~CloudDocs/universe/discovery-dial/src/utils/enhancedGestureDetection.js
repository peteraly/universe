/**
 * Enhanced Gesture Detection System
 * Comprehensive gesture detection for primary and subcategory selection
 */

// Gesture detection thresholds
const GESTURE_THRESHOLDS = {
  VERTICAL_SWIPE_MIN_DISTANCE: 50,    // 50px minimum for vertical swipe
  VERTICAL_SWIPE_MIN_VELOCITY: 200,   // 200px/s minimum velocity
  ROTATION_MIN_ANGLE: 15,             // 15 degrees minimum for rotation
  ROTATION_MIN_VELOCITY: 100,         // 100 degrees/s minimum velocity
  VERTICAL_BIAS: 2,                   // Vertical movement must be 2x horizontal
  HORIZONTAL_BIAS: 2                  // Horizontal movement must be 2x vertical
};

/**
 * Detect primary category swipe (vertical gesture)
 */
export const detectPrimaryCategorySwipe = (startPos, endPos, deltaTime) => {
  if (!startPos || !endPos || deltaTime === 0) return null;

  const deltaY = endPos.y - startPos.y;
  const deltaX = endPos.x - startPos.x;
  const velocity = Math.abs(deltaY) / deltaTime * 1000; // px/s

  // Vertical swipe criteria
  const isVerticalSwipe = Math.abs(deltaY) > Math.abs(deltaX) * GESTURE_THRESHOLDS.VERTICAL_BIAS;
  const hasMinimumDistance = Math.abs(deltaY) > GESTURE_THRESHOLDS.VERTICAL_SWIPE_MIN_DISTANCE;
  const hasMinimumVelocity = velocity > GESTURE_THRESHOLDS.VERTICAL_SWIPE_MIN_VELOCITY;

  if (isVerticalSwipe && hasMinimumDistance && hasMinimumVelocity) {
    return {
      type: 'PRIMARY_CATEGORY_SWIPE',
      direction: deltaY > 0 ? 'down' : 'up',
      strength: Math.abs(deltaY),
      velocity: velocity,
      deltaY: deltaY,
      deltaX: deltaX
    };
  }

  return null;
};

/**
 * Detect subcategory rotation (circular gesture)
 */
export const detectSubcategoryRotation = (startPos, endPos, centerPos, deltaTime) => {
  if (!startPos || !endPos || !centerPos || deltaTime === 0) return null;

  const startAngle = Math.atan2(startPos.y - centerPos.y, startPos.x - centerPos.x);
  const endAngle = Math.atan2(endPos.y - centerPos.y, endPos.x - centerPos.x);
  let angleDelta = endAngle - startAngle;

  // Normalize angle to [-π, π]
  if (angleDelta > Math.PI) angleDelta -= 2 * Math.PI;
  if (angleDelta < -Math.PI) angleDelta += 2 * Math.PI;

  const degrees = angleDelta * (180 / Math.PI);
  const velocity = Math.abs(degrees) / deltaTime * 1000; // degrees/s

  // Rotation criteria
  const hasMinimumRotation = Math.abs(degrees) > GESTURE_THRESHOLDS.ROTATION_MIN_ANGLE;
  const hasMinimumVelocity = velocity > GESTURE_THRESHOLDS.ROTATION_MIN_VELOCITY;

  if (hasMinimumRotation && hasMinimumVelocity) {
    return {
      type: 'SUBCATEGORY_ROTATION',
      direction: degrees > 0 ? 'clockwise' : 'counterclockwise',
      angle: Math.abs(degrees),
      velocity: velocity,
      degrees: degrees
    };
  }

  return null;
};

/**
 * Check if position is within dial area
 */
export const isInDialArea = (pos, dialBounds) => {
  if (!dialBounds || !pos) return false;
  
  return (
    pos.x >= dialBounds.left &&
    pos.x <= dialBounds.right &&
    pos.y >= dialBounds.top &&
    pos.y <= dialBounds.bottom
  );
};

/**
 * Check if position is within subcategory dial area
 */
export const isInSubcategoryArea = (pos, subcategoryBounds) => {
  if (!subcategoryBounds || !pos) return false;
  
  return (
    pos.x >= subcategoryBounds.left &&
    pos.x <= subcategoryBounds.right &&
    pos.y >= subcategoryBounds.top &&
    pos.y <= subcategoryBounds.bottom
  );
};

/**
 * Calculate distance between two points
 */
export const calculateDistance = (pos1, pos2) => {
  const deltaX = pos2.x - pos1.x;
  const deltaY = pos2.y - pos1.y;
  return Math.sqrt(deltaX * deltaX + deltaY * deltaY);
};

/**
 * Check if gesture is circular motion (for rotation detection)
 */
export const isCircularMotion = (startPos, endPos, centerPos) => {
  if (!centerPos) return false;
  
  const startDistance = calculateDistance(startPos, centerPos);
  const endDistance = calculateDistance(endPos, centerPos);
  
  // Check if distance from center is roughly the same (circular motion)
  const distanceRatio = Math.abs(startDistance - endDistance) / startDistance;
  return distanceRatio < 0.3; // Allow 30% variation
};

/**
 * Enhanced gesture detection with multiple gesture types
 */
export const detectGesture = (startPos, endPos, deltaTime, dialBounds, subcategoryBounds, dialCenter) => {
  if (!startPos || !endPos || deltaTime === 0) return null;

  // Priority 1: Primary category swipe (vertical gesture in main dial area)
  if (isInDialArea(startPos, dialBounds)) {
    const primarySwipe = detectPrimaryCategorySwipe(startPos, endPos, deltaTime);
    if (primarySwipe) {
      return {
        ...primarySwipe,
        priority: 1,
        area: 'primary_dial'
      };
    }
  }

  // Priority 2: Subcategory rotation (circular gesture in subcategory area)
  if (isInSubcategoryArea(startPos, subcategoryBounds) && dialCenter) {
    const subcategoryRotation = detectSubcategoryRotation(startPos, endPos, dialCenter, deltaTime);
    if (subcategoryRotation) {
      return {
        ...subcategoryRotation,
        priority: 2,
        area: 'subcategory_dial'
      };
    }
  }

  // Priority 3: Subcategory rotation in main dial area (fallback)
  if (isInDialArea(startPos, dialBounds) && dialCenter && isCircularMotion(startPos, endPos, dialCenter)) {
    const subcategoryRotation = detectSubcategoryRotation(startPos, endPos, dialCenter, deltaTime);
    if (subcategoryRotation) {
      return {
        ...subcategoryRotation,
        priority: 3,
        area: 'main_dial'
      };
    }
  }

  return null;
};

/**
 * Trigger haptic feedback
 */
export const triggerHapticFeedback = (type = 'light') => {
  if (navigator.vibrate) {
    switch (type) {
      case 'light':
        navigator.vibrate(30);
        break;
      case 'medium':
        navigator.vibrate(50);
        break;
      case 'heavy':
        navigator.vibrate(100);
        break;
      default:
        navigator.vibrate(50);
    }
  }
};

/**
 * Log gesture detection for debugging
 */
export const logGestureDetection = (gesture, startPos, endPos, deltaTime) => {
  if (import.meta.env.DEV) {
    console.log('🎯 Gesture Detected:', {
      type: gesture.type,
      direction: gesture.direction,
      area: gesture.area,
      priority: gesture.priority,
      strength: gesture.strength || gesture.angle,
      velocity: gesture.velocity,
      startPos,
      endPos,
      deltaTime: deltaTime + 'ms'
    });
  }
};

/**
 * Enhanced gesture detection hook
 */
export const useEnhancedGestureDetection = () => {
  const [gestureState, setGestureState] = useState({
    startPos: null,
    endPos: null,
    startTime: null,
    currentPos: null,
    isProcessing: false,
    lastGesture: null
  });

  const handleTouchStart = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();

    if (e.touches.length !== 1) return;

    const touch = e.touches[0];
    const startPos = { x: touch.clientX, y: touch.clientY };
    const startTime = Date.now();

    setGestureState(prev => ({
      ...prev,
      startPos,
      startTime,
      currentPos: startPos,
      isProcessing: true,
      lastGesture: null
    }));

    console.log('👆 Touch start:', startPos);
  }, []);

  const handleTouchMove = useCallback((e, dialBounds, subcategoryBounds, dialCenter, onGestureDetected) => {
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();

    if (e.touches.length !== 1 || !gestureState.startPos) return;

    const touch = e.touches[0];
    const currentPos = { x: touch.clientX, y: touch.clientY };

    setGestureState(prev => ({
      ...prev,
      currentPos
    }));

    // Real-time gesture detection
    const deltaTime = Date.now() - gestureState.startTime;
    const gesture = detectGesture(gestureState.startPos, currentPos, deltaTime, dialBounds, subcategoryBounds, dialCenter);

    if (gesture && !gestureState.lastGesture) {
      logGestureDetection(gesture, gestureState.startPos, currentPos, deltaTime);
      triggerHapticFeedback('medium');
      
      setGestureState(prev => ({
        ...prev,
        lastGesture: gesture,
        isProcessing: false
      }));

      onGestureDetected?.(gesture);
    }
  }, [gestureState]);

  const handleTouchEnd = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();

    setGestureState(prev => ({
      ...prev,
      isProcessing: false,
      startPos: null,
      startTime: null,
      currentPos: null,
      lastGesture: null
    }));

    console.log('👆 Touch end');
  }, []);

  return {
    gestureState,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    detectGesture,
    triggerHapticFeedback
  };
};

export default {
  detectPrimaryCategorySwipe,
  detectSubcategoryRotation,
  detectGesture,
  isInDialArea,
  isInSubcategoryArea,
  calculateDistance,
  isCircularMotion,
  triggerHapticFeedback,
  logGestureDetection,
  useEnhancedGestureDetection
};
