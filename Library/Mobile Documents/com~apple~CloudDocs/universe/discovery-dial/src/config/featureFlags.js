/**
 * Feature Flags for Event Compass
 * Simple boolean constants to enable/disable features.
 * 
 * Usage:
 * - Set to true/false to enable/disable features
 * - No external flag library required
 * - Compile-time flags (not runtime)
 * - Safe to modify for testing/deployment
 * 
 * @example
 * import { ENABLE_HAPTICS } from './config/featureFlags';
 * if (ENABLE_HAPTICS) {
 *   tick('soft');
 * }
 */

/**
 * Enable haptic feedback (vibrations) on gestures.
 * Affects: Primary category change, subcategory snap, event navigation
 * 
 * @type {boolean}
 */
export const ENABLE_HAPTICS = true;

/**
 * Enable inertia/momentum after fast flick gestures.
 * When enabled, a fast flick will continue spinning briefly after release.
 * 
 * @type {boolean}
 */
export const ENABLE_INERTIA = true;

/**
 * Show distance from user location in event details.
 * When disabled, only shows time and venue information.
 * 
 * @type {boolean}
 */
export const SHOW_DISTANCE = true;

/**
 * Show debug info overlay (render counts, indices, etc.).
 * Only affects development mode.
 * 
 * @type {boolean}
 */
export const SHOW_DEBUG_INFO = false;

/**
 * Enable keyboard shortcuts for navigation.
 * When disabled, only touch/mouse gestures work.
 * 
 * @type {boolean}
 */
export const ENABLE_KEYBOARD_SHORTCUTS = true;

/**
 * Enable animations and transitions.
 * When disabled (or prefers-reduced-motion), all animations are instant.
 * 
 * @type {boolean}
 */
export const ENABLE_ANIMATIONS = true;

/**
 * Enable console logging for gesture detection.
 * Logs gesture type, deltas, and actions for debugging.
 * Useful for troubleshooting rotation vs swipe conflicts.
 * 
 * @type {boolean}
 */
export const DEBUG_GESTURES = true;

/**
 * Feature flag configuration object.
 * Useful for passing all flags at once.
 */
export const FEATURE_FLAGS = {
  ENABLE_HAPTICS,
  ENABLE_INERTIA,
  SHOW_DISTANCE,
  SHOW_DEBUG_INFO,
  ENABLE_KEYBOARD_SHORTCUTS,
  ENABLE_ANIMATIONS,
  DEBUG_GESTURES
};

/**
 * Check if a feature is enabled.
 * Helper function for dynamic flag checking.
 * 
 * @param {string} flagName - Name of the flag to check
 * @returns {boolean} Whether the feature is enabled
 * 
 * @example
 * if (isFeatureEnabled('ENABLE_HAPTICS')) {
 *   tick('soft');
 * }
 */
export function isFeatureEnabled(flagName) {
  return FEATURE_FLAGS[flagName] === true;
}

/**
 * Get all enabled features.
 * Useful for debugging or logging.
 * 
 * @returns {string[]} Array of enabled feature names
 */
export function getEnabledFeatures() {
  return Object.entries(FEATURE_FLAGS)
    .filter(([_, enabled]) => enabled)
    .map(([name]) => name);
}

/**
 * Get all disabled features.
 * Useful for debugging or logging.
 * 
 * @returns {string[]} Array of disabled feature names
 */
export function getDisabledFeatures() {
  return Object.entries(FEATURE_FLAGS)
    .filter(([_, enabled]) => !enabled)
    .map(([name]) => name);
}

