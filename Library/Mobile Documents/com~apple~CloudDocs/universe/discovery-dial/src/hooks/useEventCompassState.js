import { useState, useMemo, useCallback } from 'react';

/**
 * Core state machine for Event Compass navigation.
 * Manages selection indices across primary categories (N/E/S/W),
 * subcategories, and individual events.
 * 
 * @param {Array} categories - Array of category objects with structure:
 *   [{ id, label, direction, subcategories: [{ id, label, events: [...] }] }]
 * @returns {Object} State and action methods
 * 
 * @example
 * const { state, actions } = useEventCompassState(categories);
 * actions.setPrimaryByDirection('north');
 * actions.rotateSub(1);
 * actions.nextEvent();
 */
export default function useEventCompassState(categories = []) {
  // ========================================
  // STATE: Pure indices (no angles/pixels)
  // ========================================
  
  /** @type {[number, Function]} Primary category index (0..3) */
  const [primaryIndex, setPrimaryIndex] = useState(0);
  
  /** @type {[number, Function]} Subcategory index within active primary */
  const [subIndex, setSubIndex] = useState(0);
  
  /** @type {[number, Function]} Event index within active subcategory */
  const [eventIndex, setEventIndex] = useState(0);

  // ========================================
  // DERIVED: Active items
  // ========================================
  
  /**
   * Currently active primary category
   * @type {Object|null}
   */
  const activePrimary = useMemo(() => {
    return categories[primaryIndex] || null;
  }, [categories, primaryIndex]);

  /**
   * Currently active subcategory within primary
   * @type {Object|null}
   */
  const activeSub = useMemo(() => {
    if (!activePrimary?.subcategories) return null;
    return activePrimary.subcategories[subIndex] || null;
  }, [activePrimary, subIndex]);

  /**
   * Currently active event within subcategory
   * @type {Object|null}
   */
  const activeEvent = useMemo(() => {
    if (!activeSub?.events) return null;
    return activeSub.events[eventIndex] || null;
  }, [activeSub, eventIndex]);

  // ========================================
  // DERIVED: UI labels for compass positions
  // ========================================
  
  /**
   * Map of compass positions to category labels with active state
   * @type {Object}
   */
  const positionLabels = useMemo(() => {
    const directionMap = {
      north: { position: 'N', index: null },
      east: { position: 'E', index: null },
      south: { position: 'S', index: null },
      west: { position: 'W', index: null }
    };

    // Map categories to their positions
    categories.forEach((cat, idx) => {
      if (directionMap[cat.direction]) {
        directionMap[cat.direction] = {
          position: directionMap[cat.direction].position,
          index: idx,
          label: cat.label,
          isActive: idx === primaryIndex
        };
      }
    });

    return directionMap;
  }, [categories, primaryIndex]);

  // ========================================
  // ACTIONS: Navigation methods
  // ========================================

  /**
   * Set primary category by compass direction.
   * Resets subcategory and event indices to 0.
   * 
   * @param {string} direction - One of: "north", "east", "south", "west"
   */
  const setPrimaryByDirection = useCallback((direction) => {
    const targetIndex = categories.findIndex(
      cat => cat.direction === direction
    );
    
    if (targetIndex !== -1 && targetIndex !== primaryIndex) {
      setPrimaryIndex(targetIndex);
      setSubIndex(0);
      setEventIndex(0);
    }
  }, [categories, primaryIndex]);

  /**
   * Rotate through subcategories by delta steps.
   * Snaps to nearest subcategory and clamps to valid range.
   * 
   * @param {number} deltaSteps - Number of steps to rotate (+/-)
   */
  const rotateSub = useCallback((deltaSteps) => {
    if (!activePrimary?.subcategories) return;
    
    const maxIndex = activePrimary.subcategories.length - 1;
    const newIndex = subIndex + deltaSteps;
    
    // Clamp to valid range [0, maxIndex]
    const clampedIndex = Math.max(0, Math.min(maxIndex, Math.round(newIndex)));
    
    if (clampedIndex !== subIndex) {
      setSubIndex(clampedIndex);
      setEventIndex(0); // Reset event when subcategory changes
    }
  }, [activePrimary, subIndex]);

  /**
   * Navigate to next event in current subcategory.
   * Wraps to first event if at end.
   */
  const nextEvent = useCallback(() => {
    if (!activeSub?.events?.length) return;
    
    const maxIndex = activeSub.events.length - 1;
    const newIndex = eventIndex >= maxIndex ? 0 : eventIndex + 1;
    setEventIndex(newIndex);
  }, [activeSub, eventIndex]);

  /**
   * Navigate to previous event in current subcategory.
   * Wraps to last event if at beginning.
   */
  const prevEvent = useCallback(() => {
    if (!activeSub?.events?.length) return;
    
    const maxIndex = activeSub.events.length - 1;
    const newIndex = eventIndex <= 0 ? maxIndex : eventIndex - 1;
    setEventIndex(newIndex);
  }, [activeSub, eventIndex]);

  /**
   * Directly select event by index within current subcategory.
   * Clamps to valid range.
   * 
   * @param {number} index - Target event index
   */
  const selectEventByIndex = useCallback((index) => {
    if (!activeSub?.events?.length) return;
    
    const maxIndex = activeSub.events.length - 1;
    const clampedIndex = Math.max(0, Math.min(maxIndex, index));
    setEventIndex(clampedIndex);
  }, [activeSub]);

  /**
   * Reset all indices to 0 (return to first of everything)
   */
  const reset = useCallback(() => {
    setPrimaryIndex(0);
    setSubIndex(0);
    setEventIndex(0);
  }, []);

  // ========================================
  // PUBLIC API
  // ========================================

  return {
    /**
     * Current state snapshot
     */
    state: {
      /** Current primary category index (0..3) */
      primaryIndex,
      
      /** Current subcategory index within primary */
      subIndex,
      
      /** Current event index within subcategory */
      eventIndex,
      
      /** Active primary category object */
      activePrimary,
      
      /** Active subcategory object */
      activeSub,
      
      /** Active event object */
      activeEvent,
      
      /** Compass position labels with active states */
      positionLabels,
      
      /** Total count of subcategories in active primary */
      subCount: activePrimary?.subcategories?.length || 0,
      
      /** Total count of events in active subcategory */
      eventCount: activeSub?.events?.length || 0
    },

    /**
     * Navigation actions
     */
    actions: {
      setPrimaryByDirection,
      rotateSub,
      nextEvent,
      prevEvent,
      selectEventByIndex,
      reset
    }
  };
}

