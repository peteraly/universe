/**
 * Gesture and Filter Performance Optimization Utilities
 * Provides debouncing, throttling, and performance optimizations
 */

import { isDocumentAvailable, isWindowAvailable } from './safeDOM';

// ========================================
// DEBOUNCE AND THROTTLE UTILITIES
// ========================================

/**
 * Debounce function to limit rapid calls
 */
export const debounce = (func, wait, immediate = false) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      timeout = null;
      if (!immediate) func.apply(this, args);
    };
    const callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func.apply(this, args);
  };
};

/**
 * Throttle function to limit call frequency
 */
export const throttle = (func, limit) => {
  let inThrottle;
  return function executedFunction(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

/**
 * Request animation frame throttle
 */
export const rafThrottle = (func) => {
  let rafId;
  return function executedFunction(...args) {
    if (rafId) return;
    rafId = requestAnimationFrame(() => {
      func.apply(this, args);
      rafId = null;
    });
  };
};

// ========================================
// GESTURE OPTIMIZATION HOOKS
// ========================================

/**
 * Enhanced gesture handling with performance optimization
 */
export const useOptimizedGestureHandling = () => {
  // Debounced gesture processing
  const debouncedGesture = debounce((gestureData) => {
    processGesture(gestureData);
  }, 100);

  // Throttled rotation updates (60fps)
  const throttledRotation = throttle((rotationData) => {
    updateRotation(rotationData);
  }, 16);

  // RAF throttled touch handling
  const rafThrottledTouch = rafThrottle((touchData) => {
    handleTouch(touchData);
  });

  return {
    debouncedGesture,
    throttledRotation,
    rafThrottledTouch
  };
};

/**
 * Process gesture with optimization
 */
const processGesture = (gestureData) => {
  if (!isDocumentAvailable()) return;
  
  const { type, direction, intensity, timestamp } = gestureData;
  
  // Gesture confidence scoring
  const confidence = calculateGestureConfidence(gestureData);
  
  if (confidence < 0.7) {
    console.log(`Gesture confidence too low: ${confidence}`);
    return;
  }
  
  // Process high-confidence gesture
  switch (type) {
    case 'swipe':
      processSwipeGesture(direction, intensity);
      break;
    case 'rotation':
      processRotationGesture(direction, intensity);
      break;
    case 'tap':
      processTapGesture(gestureData);
      break;
    default:
      console.warn(`Unknown gesture type: ${type}`);
  }
};

/**
 * Calculate gesture confidence score
 */
const calculateGestureConfidence = (gestureData) => {
  const { velocity, distance, duration, pressure } = gestureData;
  
  // Base confidence from velocity and distance
  let confidence = Math.min(velocity / 1000, 1) * 0.4; // 40% from velocity
  confidence += Math.min(distance / 100, 1) * 0.3; // 30% from distance
  
  // Duration factor (optimal duration range)
  const optimalDuration = 200; // ms
  const durationFactor = 1 - Math.abs(duration - optimalDuration) / optimalDuration;
  confidence += Math.max(0, durationFactor) * 0.2; // 20% from duration
  
  // Pressure factor (if available)
  if (pressure !== undefined) {
    const pressureFactor = Math.min(pressure / 0.5, 1); // Normalize pressure
    confidence += pressureFactor * 0.1; // 10% from pressure
  }
  
  return Math.min(confidence, 1);
};

/**
 * Process swipe gesture
 */
const processSwipeGesture = (direction, intensity) => {
  console.log(`Processing swipe: ${direction} (intensity: ${intensity})`);
  
  // Find target category
  const category = findCategoryByDirection(direction);
  if (category) {
    selectCategory(category);
    triggerHapticFeedback('light');
  }
};

/**
 * Process rotation gesture
 */
const processRotationGesture = (direction, intensity) => {
  console.log(`Processing rotation: ${direction} (intensity: ${intensity})`);
  
  // Calculate rotation amount
  const rotationAmount = intensity * 30; // degrees
  
  // Apply rotation
  rotateSubcategoryDial(direction, rotationAmount);
  triggerHapticFeedback('medium');
};

/**
 * Process tap gesture
 */
const processTapGesture = (gestureData) => {
  const { x, y } = gestureData;
  console.log(`Processing tap at (${x}, ${y})`);
  
  // Find element at tap location
  const element = document.elementFromPoint(x, y);
  if (element) {
    // Check if it's a clickable element
    if (element.classList.contains('subcategory-label') || 
        element.classList.contains('primary-category')) {
      element.click();
      triggerHapticFeedback('light');
    }
  }
};

// ========================================
// FILTER OPTIMIZATION HOOKS
// ========================================

/**
 * Enhanced filter state management with optimization
 */
export const useOptimizedFilterState = (initialFilters = {}) => {
  const [filterState, setFilterState] = useState(initialFilters);
  const [isUpdating, setIsUpdating] = useState(false);
  
  // Debounced filter updates (150ms delay)
  const debouncedFilterUpdate = useCallback(
    debounce((newFilters) => {
      updateMapMarkers(newFilters);
      updateEventList(newFilters);
      setIsUpdating(false);
    }, 150),
    []
  );
  
  // Optimized filter change handler
  const handleFilterChange = useCallback((filterType, value) => {
    setIsUpdating(true);
    
    const newFilters = { ...filterState, [filterType]: value };
    setFilterState(newFilters);
    
    // Immediate UI update
    updateFilterUI(filterType, value);
    
    // Debounced data update
    debouncedFilterUpdate(newFilters);
  }, [filterState, debouncedFilterUpdate]);
  
  // Batch filter updates
  const handleBatchFilterChange = useCallback((updates) => {
    setIsUpdating(true);
    
    const newFilters = { ...filterState, ...updates };
    setFilterState(newFilters);
    
    // Immediate UI update
    Object.entries(updates).forEach(([type, value]) => {
      updateFilterUI(type, value);
    });
    
    // Debounced data update
    debouncedFilterUpdate(newFilters);
  }, [filterState, debouncedFilterUpdate]);
  
  return {
    filterState,
    isUpdating,
    handleFilterChange,
    handleBatchFilterChange
  };
};

/**
 * Update filter UI immediately
 */
const updateFilterUI = (filterType, value) => {
  if (!isDocumentAvailable()) return;
  
  // Update filter pills
  const activePill = document.querySelector(`.filter-pill.active[data-${filterType}]`);
  const newPill = document.querySelector(`.filter-pill[data-${filterType}="${value}"]`);
  
  if (activePill) activePill.classList.remove('active');
  if (newPill) newPill.classList.add('active');
  
  // Update filter display
  const filterDisplay = document.querySelector(`.filter-display[data-${filterType}]`);
  if (filterDisplay) {
    filterDisplay.textContent = value;
  }
};

/**
 * Update map markers with optimization
 */
const updateMapMarkers = (filters) => {
  if (!isDocumentAvailable()) return;
  
  console.log('Updating map markers with filters:', filters);
  
  // Get all events
  const events = getAllEvents();
  
  // Filter events
  const filteredEvents = filterEvents(events, filters);
  
  // Batch update markers
  batchUpdateMarkers(filteredEvents);
};

/**
 * Update event list with optimization
 */
const updateEventList = (filters) => {
  if (!isDocumentAvailable()) return;
  
  console.log('Updating event list with filters:', filters);
  
  // Get all events
  const events = getAllEvents();
  
  // Filter events
  const filteredEvents = filterEvents(events, filters);
  
  // Update event list
  updateEventListUI(filteredEvents);
};

/**
 * Batch update markers for performance
 */
const batchUpdateMarkers = (events) => {
  if (!isDocumentAvailable()) return;
  
  const batchSize = 10;
  const batches = [];
  
  // Create batches
  for (let i = 0; i < events.length; i += batchSize) {
    batches.push(events.slice(i, i + batchSize));
  }
  
  // Process batches with delay
  batches.forEach((batch, index) => {
    setTimeout(() => {
      updateMarkersBatch(batch);
    }, index * 50); // 50ms delay between batches
  });
};

/**
 * Update a batch of markers
 */
const updateMarkersBatch = (events) => {
  if (!isDocumentAvailable()) return;
  
  events.forEach(event => {
    const marker = document.querySelector(`[data-event-id="${event.id}"]`);
    if (marker) {
      // Show/hide marker based on event visibility
      marker.style.display = event.visible ? 'block' : 'none';
      
      // Update marker appearance
      updateMarkerAppearance(marker, event);
    }
  });
};

// ========================================
// MAP PERFORMANCE OPTIMIZATION
// ========================================

/**
 * Enhanced map performance optimization
 */
export const useOptimizedMapPerformance = () => {
  const [mapInstance, setMapInstance] = useState(null);
  const [markers, setMarkers] = useState([]);
  
  // Optimized marker rendering
  const optimizedMarkerRender = useCallback((events) => {
    if (!mapInstance) return;
    
    // Clear existing markers
    clearAllMarkers();
    
    // Batch update new markers
    batchMarkerUpdates(events);
    
    // Adjust map bounds
    adjustMapBounds(events);
  }, [mapInstance]);
  
  // Debounced map updates
  const debouncedMapUpdate = useCallback(
    debounce((events) => {
      optimizedMarkerRender(events);
    }, 200),
    [optimizedMarkerRender]
  );
  
  return {
    mapInstance,
    setMapInstance,
    markers,
    setMarkers,
    optimizedMarkerRender,
    debouncedMapUpdate
  };
};

/**
 * Batch marker updates for performance
 */
const batchMarkerUpdates = (events) => {
  if (!isDocumentAvailable()) return;
  
  const batchSize = 15;
  const batches = [];
  
  // Create batches
  for (let i = 0; i < events.length; i += batchSize) {
    batches.push(events.slice(i, i + batchSize));
  }
  
  // Process batches
  batches.forEach((batch, index) => {
    setTimeout(() => {
      createMarkersBatch(batch);
    }, index * 30); // 30ms delay between batches
  });
};

/**
 * Create a batch of markers
 */
const createMarkersBatch = (events) => {
  if (!isDocumentAvailable()) return;
  
  events.forEach(event => {
    createMarker(event);
  });
};

/**
 * Create individual marker
 */
const createMarker = (event) => {
  if (!isDocumentAvailable()) return;
  
  // Create marker element
  const marker = document.createElement('div');
  marker.className = 'mapboxgl-marker';
  marker.setAttribute('data-event-id', event.id);
  
  // Set marker position
  marker.style.left = `${event.longitude}px`;
  marker.style.top = `${event.latitude}px`;
  
  // Add marker to map
  const mapContainer = document.querySelector('.mapboxgl-map');
  if (mapContainer) {
    mapContainer.appendChild(marker);
  }
};

/**
 * Clear all markers
 */
const clearAllMarkers = () => {
  if (!isDocumentAvailable()) return;
  
  const markers = document.querySelectorAll('.mapboxgl-marker');
  markers.forEach(marker => marker.remove());
};

/**
 * Adjust map bounds to fit events
 */
const adjustMapBounds = (events) => {
  if (!isDocumentAvailable() || events.length === 0) return;
  
  // Calculate bounds
  const bounds = calculateEventBounds(events);
  
  // Apply bounds to map
  if (bounds) {
    // This would integrate with Mapbox GL JS
    console.log('Adjusting map bounds:', bounds);
  }
};

/**
 * Calculate bounds for events
 */
const calculateEventBounds = (events) => {
  if (events.length === 0) return null;
  
  let minLat = events[0].latitude;
  let maxLat = events[0].latitude;
  let minLng = events[0].longitude;
  let maxLng = events[0].longitude;
  
  events.forEach(event => {
    minLat = Math.min(minLat, event.latitude);
    maxLat = Math.max(maxLat, event.latitude);
    minLng = Math.min(minLng, event.longitude);
    maxLng = Math.max(maxLng, event.longitude);
  });
  
  return {
    north: maxLat,
    south: minLat,
    east: maxLng,
    west: minLng
  };
};

// ========================================
// TOUCH OPTIMIZATION
// ========================================

/**
 * Enhanced touch handling with optimization
 */
export const useOptimizedTouchHandling = () => {
  const [touchState, setTouchState] = useState({
    isTouching: false,
    startTime: 0,
    startPosition: { x: 0, y: 0 },
    currentPosition: { x: 0, y: 0 },
    velocity: { x: 0, y: 0 },
    pressure: 0
  });
  
  // Optimized touch start handler
  const handleTouchStart = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const touch = e.touches[0];
    const startTime = performance.now();
    
    setTouchState({
      isTouching: true,
      startTime,
      startPosition: { x: touch.clientX, y: touch.clientY },
      currentPosition: { x: touch.clientX, y: touch.clientY },
      velocity: { x: 0, y: 0 },
      pressure: touch.force || 0
    });
    
    // Trigger haptic feedback
    triggerHapticFeedback('light');
  }, []);
  
  // Throttled touch move handler
  const handleTouchMove = useCallback(
    throttle((e) => {
      e.preventDefault();
      e.stopPropagation();
      
      const touch = e.touches[0];
      const currentTime = performance.now();
      
      setTouchState(prevState => {
        const deltaTime = currentTime - prevState.startTime;
        const deltaX = touch.clientX - prevState.currentPosition.x;
        const deltaY = touch.clientY - prevState.currentPosition.y;
        
        const velocity = {
          x: deltaTime > 0 ? deltaX / deltaTime : 0,
          y: deltaTime > 0 ? deltaY / deltaTime : 0
        };
        
        return {
          ...prevState,
          currentPosition: { x: touch.clientX, y: touch.clientY },
          velocity,
          pressure: touch.force || 0
        };
      });
    }, 16), // 60fps
    []
  );
  
  // Optimized touch end handler
  const handleTouchEnd = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const endTime = performance.now();
    const duration = endTime - touchState.startTime;
    
    // Calculate gesture
    const gesture = calculateGesture(touchState, duration);
    
    if (gesture) {
      processGesture(gesture);
    }
    
    setTouchState({
      isTouching: false,
      startTime: 0,
      startPosition: { x: 0, y: 0 },
      currentPosition: { x: 0, y: 0 },
      velocity: { x: 0, y: 0 },
      pressure: 0
    });
  }, [touchState]);
  
  return {
    touchState,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd
  };
};

/**
 * Calculate gesture from touch data
 */
const calculateGesture = (touchState, duration) => {
  const { startPosition, currentPosition, velocity } = touchState;
  
  const deltaX = currentPosition.x - startPosition.x;
  const deltaY = currentPosition.y - startPosition.y;
  const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
  const speed = Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y);
  
  // Determine gesture type
  if (distance < 10) {
    return {
      type: 'tap',
      x: currentPosition.x,
      y: currentPosition.y,
      duration,
      pressure: touchState.pressure
    };
  } else if (speed > 500) {
    // Determine swipe direction
    const angle = Math.atan2(deltaY, deltaX) * 180 / Math.PI;
    const direction = getSwipeDirection(angle);
    
    return {
      type: 'swipe',
      direction,
      distance,
      velocity: speed,
      duration,
      pressure: touchState.pressure
    };
  } else if (distance > 50) {
    // Rotation gesture
    const angle = Math.atan2(deltaY, deltaX) * 180 / Math.PI;
    const direction = angle > 0 ? 'clockwise' : 'counter-clockwise';
    
    return {
      type: 'rotation',
      direction,
      angle: Math.abs(angle),
      distance,
      duration,
      pressure: touchState.pressure
    };
  }
  
  return null;
};

/**
 * Get swipe direction from angle
 */
const getSwipeDirection = (angle) => {
  if (angle >= -45 && angle < 45) return 'east';
  if (angle >= 45 && angle < 135) return 'south';
  if (angle >= 135 || angle < -135) return 'west';
  if (angle >= -135 && angle < -45) return 'north';
  return 'unknown';
};

// ========================================
// HAPTIC FEEDBACK
// ========================================

/**
 * Trigger haptic feedback
 */
const triggerHapticFeedback = (type = 'light') => {
  if (!isWindowAvailable() || !('vibrate' in navigator)) return;
  
  const patterns = {
    light: [50],
    medium: [100],
    heavy: [200],
    success: [100, 50, 100],
    error: [200, 100, 200]
  };
  
  const pattern = patterns[type] || patterns.light;
  
  try {
    navigator.vibrate(pattern);
  } catch (error) {
    console.warn('Haptic feedback failed:', error);
  }
};

// ========================================
// UTILITY FUNCTIONS
// ========================================

/**
 * Find category by direction
 */
const findCategoryByDirection = (direction) => {
  const directionMap = {
    north: 'Social',
    east: 'Education',
    south: 'Recreation',
    west: 'Professional'
  };
  
  return directionMap[direction];
};

/**
 * Select category
 */
const selectCategory = (category) => {
  if (!isDocumentAvailable()) return;
  
  const categoryElement = document.querySelector(`[data-category="${category}"]`);
  if (categoryElement) {
    categoryElement.click();
  }
};

/**
 * Rotate subcategory dial
 */
const rotateSubcategoryDial = (direction, amount) => {
  if (!isDocumentAvailable()) return;
  
  const dial = document.querySelector('.subcategory-dial');
  if (dial) {
    const currentRotation = dial.style.transform.match(/rotate\(([^)]+)\)/);
    const currentAngle = currentRotation ? parseFloat(currentRotation[1]) : 0;
    const newAngle = direction === 'clockwise' ? 
      currentAngle + amount : currentAngle - amount;
    
    dial.style.transform = `rotate(${newAngle}deg)`;
  }
};

/**
 * Get all events
 */
const getAllEvents = () => {
  // This would integrate with your event data source
  return [];
};

/**
 * Filter events
 */
const filterEvents = (events, filters) => {
  return events.filter(event => {
    if (filters.time && filters.time !== 'All' && event.time !== filters.time) {
      return false;
    }
    if (filters.day && filters.day !== 'All' && event.day !== filters.day) {
      return false;
    }
    if (filters.category && filters.category !== 'All' && event.category !== filters.category) {
      return false;
    }
    return true;
  });
};

/**
 * Update event list UI
 */
const updateEventListUI = (events) => {
  if (!isDocumentAvailable()) return;
  
  const eventList = document.querySelector('.event-list');
  if (eventList) {
    // Update event list with filtered events
    eventList.innerHTML = events.map(event => `
      <div class="event-card" data-event-id="${event.id}">
        <h3>${event.name}</h3>
        <p>${event.description}</p>
      </div>
    `).join('');
  }
};

/**
 * Update marker appearance
 */
const updateMarkerAppearance = (marker, event) => {
  // Update marker color based on category
  const categoryColors = {
    Social: '#ff6b6b',
    Education: '#4ecdc4',
    Recreation: '#45b7d1',
    Professional: '#96ceb4'
  };
  
  const color = categoryColors[event.category] || '#666';
  marker.style.backgroundColor = color;
  
  // Update marker size based on event importance
  const size = event.important ? '20px' : '15px';
  marker.style.width = size;
  marker.style.height = size;
};

// ========================================
// EXPORT
// ========================================

export {
  useOptimizedGestureHandling,
  useOptimizedFilterState,
  useOptimizedMapPerformance,
  useOptimizedTouchHandling,
  triggerHapticFeedback
};
