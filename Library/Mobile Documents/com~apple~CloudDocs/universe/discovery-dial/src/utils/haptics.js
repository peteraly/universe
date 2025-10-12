import { ENABLE_HAPTICS } from '../config/featureFlags';

/**
 * Haptic feedback utilities for Event Compass.
 * Provides tactile feedback for gesture interactions.
 * 
 * Note: Haptic feedback is only available on devices with vibration support.
 * Falls back to noop on unsupported devices/browsers or if disabled via feature flag.
 */

/**
 * Trigger a haptic feedback tick.
 * Uses native vibration API if available and enabled, otherwise noops.
 * 
 * Intensity levels:
 * - 'soft': Light tick (5ms) - for subcategory snaps, event navigation
 * - 'hard': Strong tick (12ms) - for primary category changes
 * 
 * @param {string} kind - Haptic intensity: 'soft' | 'hard'
 * 
 * @example
 * // On primary category change
 * tick('hard');
 * 
 * // On subcategory snap
 * tick('soft');
 * 
 * // On event next/prev
 * tick('soft');
 */
export function tick(kind = 'soft') {
  // Check feature flag first
  if (!ENABLE_HAPTICS) return;
  
  // Check if vibration API is available
  if (typeof navigator !== 'undefined' && navigator.vibrate) {
    const duration = kind === 'hard' ? 12 : 5;
    navigator.vibrate(duration);
  }
  // Noop on web/unsupported devices
}

/**
 * Trigger a soft haptic tick.
 * Shorthand for tick('soft').
 * Respects ENABLE_HAPTICS flag.
 * 
 * @example
 * softTick(); // 5ms vibration (if enabled)
 */
export function softTick() {
  if (!ENABLE_HAPTICS) return;
  tick('soft');
}

/**
 * Trigger a hard haptic tick.
 * Shorthand for tick('hard').
 * Respects ENABLE_HAPTICS flag.
 * 
 * @example
 * hardTick(); // 12ms vibration (if enabled)
 */
export function hardTick() {
  if (!ENABLE_HAPTICS) return;
  tick('hard');
}

/**
 * Check if haptic feedback is supported on current device.
 * 
 * @returns {boolean} True if vibration API is available
 * 
 * @example
 * if (isHapticSupported()) {
 *   tick('soft');
 * }
 */
export function isHapticSupported() {
  return typeof navigator !== 'undefined' && 
         typeof navigator.vibrate === 'function';
}

/**
 * Trigger a custom vibration pattern.
 * For advanced haptic sequences (optional, not used in core gestures).
 * 
 * @param {number[]} pattern - Array of vibration/pause durations in ms
 * 
 * @example
 * // Vibrate-pause-vibrate pattern
 * customPattern([10, 50, 10]);
 */
export function customPattern(pattern) {
  if (typeof navigator !== 'undefined' && navigator.vibrate) {
    navigator.vibrate(pattern);
  }
}

