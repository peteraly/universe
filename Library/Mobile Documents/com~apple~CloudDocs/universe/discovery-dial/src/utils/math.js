/**
 * Mathematical utility functions for Event Compass.
 * Pure functions with no side effects.
 */

/**
 * Clamp a number between minimum and maximum values.
 * 
 * @param {number} n - Number to clamp
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {number} Clamped value
 * 
 * @example
 * clamp(5, 0, 10)   // → 5
 * clamp(-5, 0, 10)  // → 0
 * clamp(15, 0, 10)  // → 10
 */
export function clamp(n, min, max) {
  return Math.min(Math.max(n, min), max);
}

/**
 * Wrap an index within array bounds, supporting negative rotation.
 * Handles circular/modulo wrapping for array indices.
 * 
 * @param {number} n - Index to wrap
 * @param {number} len - Array length
 * @returns {number} Wrapped index in range [0, len-1]
 * 
 * @example
 * wrapIndex(0, 5)   // → 0
 * wrapIndex(5, 5)   // → 0  (wraps to start)
 * wrapIndex(-1, 5)  // → 4  (wraps to end)
 * wrapIndex(-6, 5)  // → 4  (multiple wraps)
 * wrapIndex(7, 5)   // → 2  (multiple wraps forward)
 */
export function wrapIndex(n, len) {
  if (len === 0) return 0;
  return ((n % len) + len) % len;
}

/**
 * Calculate rotation steps from pixel delta and sensitivity.
 * Rounds to nearest integer step.
 * 
 * @param {number} delta - Pixel distance dragged
 * @param {number} sensitivity - Pixels per step
 * @returns {number} Number of steps (rounded)
 * 
 * @example
 * stepFromDelta(140, 140)  // → 1
 * stepFromDelta(70, 140)   // → 1  (rounds 0.5 up)
 * stepFromDelta(210, 140)  // → 2  (rounds 1.5 up)
 * stepFromDelta(-140, 140) // → -1
 * stepFromDelta(30, 140)   // → 0  (rounds 0.21 down)
 */
export function stepFromDelta(delta, sensitivity) {
  if (sensitivity === 0) return 0;
  return Math.round(delta / sensitivity);
}

/**
 * Linear interpolation between two values.
 * 
 * @param {number} a - Start value
 * @param {number} b - End value
 * @param {number} t - Interpolation factor (0..1)
 * @returns {number} Interpolated value
 * 
 * @example
 * lerp(0, 100, 0.5)   // → 50
 * lerp(0, 100, 0)     // → 0
 * lerp(0, 100, 1)     // → 100
 */
export function lerp(a, b, t) {
  return a + (b - a) * t;
}

/**
 * Normalize a value from one range to another.
 * 
 * @param {number} value - Value to normalize
 * @param {number} inMin - Input range minimum
 * @param {number} inMax - Input range maximum
 * @param {number} outMin - Output range minimum
 * @param {number} outMax - Output range maximum
 * @returns {number} Normalized value
 * 
 * @example
 * normalize(5, 0, 10, 0, 100)  // → 50
 * normalize(0, 0, 10, 0, 100)  // → 0
 * normalize(10, 0, 10, 0, 100) // → 100
 */
export function normalize(value, inMin, inMax, outMin, outMax) {
  const t = (value - inMin) / (inMax - inMin);
  return lerp(outMin, outMax, t);
}

/**
 * Calculate angle in degrees from center point to target point.
 * Returns angle in range [0, 360), where 0° is right, 90° is down.
 * 
 * @param {number} centerX - Center X coordinate
 * @param {number} centerY - Center Y coordinate
 * @param {number} targetX - Target X coordinate
 * @param {number} targetY - Target Y coordinate
 * @returns {number} Angle in degrees [0, 360)
 * 
 * @example
 * angleFromCenter(0, 0, 1, 0)    // → 0 (right)
 * angleFromCenter(0, 0, 0, 1)    // → 90 (down)
 * angleFromCenter(0, 0, -1, 0)   // → 180 (left)
 * angleFromCenter(0, 0, 0, -1)   // → 270 (up)
 */
export function angleFromCenter(centerX, centerY, targetX, targetY) {
  const radians = Math.atan2(targetY - centerY, targetX - centerX);
  const degrees = radians * (180 / Math.PI);
  return (degrees + 360) % 360;
}

/**
 * Snap a value to the nearest step.
 * 
 * @param {number} value - Value to snap
 * @param {number} step - Step size
 * @returns {number} Snapped value
 * 
 * @example
 * snapToStep(7, 5)    // → 5
 * snapToStep(8, 5)    // → 10
 * snapToStep(12, 5)   // → 10
 */
export function snapToStep(value, step) {
  if (step === 0) return value;
  return Math.round(value / step) * step;
}

/**
 * Calculate distance between two points.
 * 
 * @param {number} x1 - First point X
 * @param {number} y1 - First point Y
 * @param {number} x2 - Second point X
 * @param {number} y2 - Second point Y
 * @returns {number} Distance
 * 
 * @example
 * distance(0, 0, 3, 4) // → 5
 * distance(0, 0, 0, 0) // → 0
 */
export function distance(x1, y1, x2, y2) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  return Math.sqrt(dx * dx + dy * dy);
}



