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
  if (!ENABLE_HAPTICS) return;
  if (typeof navigator !== 'undefined' && navigator.vibrate) {
    navigator.vibrate(pattern);
  }
}

/**
 * PRIMARY CATEGORY SWIPE HAPTIC
 * Strong double-pulse: DA-DUM
 * Distinctive feedback for major navigation change
 * 
 * Pattern: [0ms wait, 50ms vibrate, 100ms pause, 50ms vibrate]
 * 
 * @example
 * // On primary category change (Professional → Wellness)
 * primarySwipeHaptic();
 */
export function primarySwipeHaptic() {
  if (!ENABLE_HAPTICS) return;
  if (typeof navigator !== 'undefined' && navigator.vibrate) {
    // Strong double-pulse: DA-DUM
    navigator.vibrate([0, 50, 100, 50]);
  }
}

/**
 * SUBCATEGORY ROTATION HAPTIC
 * Soft triple-tick: tick-tick-tick
 * Continuous feedback for rotation gesture
 * 
 * Pattern: [0ms wait, 10ms vibrate, 20ms pause, 10ms vibrate, 20ms pause, 10ms vibrate]
 * 
 * @example
 * // On subcategory rotation snap
 * subcategoryRotationHaptic();
 */
export function subcategoryRotationHaptic() {
  if (!ENABLE_HAPTICS) return;
  if (typeof navigator !== 'undefined' && navigator.vibrate) {
    // Soft triple-tick: tick-tick-tick
    navigator.vibrate([0, 10, 20, 10, 20, 10]);
  }
}

/**
 * ZONE ENTRY HAPTIC
 * Subtle single tick when entering a gesture zone
 * Provides feedback that touch has been registered in a zone
 * 
 * @param {string} zone - 'CENTER' | 'PERIMETER'
 * 
 * @example
 * // User touches center zone
 * zoneEntryHaptic('CENTER'); // 8ms tick
 * 
 * // User touches perimeter zone
 * zoneEntryHaptic('PERIMETER'); // 12ms tick
 */
export function zoneEntryHaptic(zone) {
  if (!ENABLE_HAPTICS) return;
  if (typeof navigator !== 'undefined' && navigator.vibrate) {
    if (zone === 'CENTER') {
      navigator.vibrate(8);  // Short tick for center
    } else if (zone === 'PERIMETER') {
      navigator.vibrate(12); // Slightly longer for perimeter
    }
  }
}

