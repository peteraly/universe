/**
 * Event Compass Configuration
 * Centralized config for quick tuning of gesture and animation parameters.
 */

export const COMPASS_CONFIG = {
  /**
   * Gesture sensitivity settings
   */
  gestures: {
    // Primary category swipe thresholds
    minSwipeDistance: 40,      // Minimum pixels for swipe detection
    minSwipeVelocity: 0.3,     // Minimum velocity (px/ms)
    
    // Subcategory rotation sensitivity
    dialSensitivity: 140,      // Pixels per rotation step (lower = more sensitive)
    
    // Event navigation thresholds
    eventSwipeDistance: 24,    // Minimum pixels for event swipe
    eventSwipeDuration: 250    // Maximum duration for quick swipe (ms)
  },

  /**
   * Animation timing
   */
  animation: {
    // Drag follow (during gesture)
    dragStiffness: 180,
    dragDamping: 20,
    
    // Snap (on gesture end)
    snapStiffness: 260,
    snapDamping: 18,
    
    // Text transitions
    textDuration: 0.15,        // 150ms
    
    // Throttle rate for hover updates
    hoverThrottle: 16          // ~60fps (1000ms / 60fps ≈ 16ms)
  },

  /**
   * Haptic feedback durations
   */
  haptics: {
    soft: 5,                   // Soft tick (ms)
    hard: 12                   // Hard tick (ms)
  },

  /**
   * Visual settings
   */
  visual: {
    dialRadius: 45,            // Subcategory ring radius (% of container)
    primaryRadius: 160,        // Primary category label distance (px)
    tickLengthActive: 8,       // Active tick height (px)
    tickLengthInactive: 6      // Inactive tick height (px)
  }
};

/**
 * Get gesture config with optional overrides.
 * Useful for testing or user preferences.
 * 
 * @param {Object} overrides - Optional config overrides
 * @returns {Object} Merged configuration
 */
export function getGestureConfig(overrides = {}) {
  return {
    ...COMPASS_CONFIG.gestures,
    ...overrides
  };
}

/**
 * Get animation config with optional overrides.
 * 
 * @param {Object} overrides - Optional config overrides
 * @returns {Object} Merged configuration
 */
export function getAnimationConfig(overrides = {}) {
  return {
    ...COMPASS_CONFIG.animation,
    ...overrides
  };
}

