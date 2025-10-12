/**
 * Performance utilities for Event Compass.
 * Throttling and optimization helpers.
 */

/**
 * Throttle function calls to ~60fps using requestAnimationFrame.
 * Ensures updates happen at browser refresh rate for smooth rendering.
 * 
 * @param {Function} callback - Function to throttle
 * @returns {Function} Throttled function
 * 
 * @example
 * const throttledUpdate = throttleRAF((value) => {
 *   setHoverIndex(value);
 * });
 */
export function throttleRAF(callback) {
  let rafId = null;
  let lastArgs = null;

  return function throttled(...args) {
    lastArgs = args;

    if (rafId === null) {
      rafId = requestAnimationFrame(() => {
        callback(...lastArgs);
        rafId = null;
        lastArgs = null;
      });
    }
  };
}

/**
 * Throttle function calls by time interval.
 * 
 * @param {Function} callback - Function to throttle
 * @param {number} delay - Delay in milliseconds
 * @returns {Function} Throttled function
 * 
 * @example
 * const throttledUpdate = throttle((value) => {
 *   setHoverIndex(value);
 * }, 16); // ~60fps
 */
export function throttle(callback, delay) {
  let lastCall = 0;
  let timeoutId = null;

  return function throttled(...args) {
    const now = Date.now();
    const timeSinceLastCall = now - lastCall;

    if (timeSinceLastCall >= delay) {
      lastCall = now;
      callback(...args);
    } else {
      // Schedule for later if not called
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        lastCall = Date.now();
        callback(...args);
        timeoutId = null;
      }, delay - timeSinceLastCall);
    }
  };
}

/**
 * Debounce function calls.
 * 
 * @param {Function} callback - Function to debounce
 * @param {number} delay - Delay in milliseconds
 * @returns {Function} Debounced function
 */
export function debounce(callback, delay) {
  let timeoutId = null;

  return function debounced(...args) {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      callback(...args);
      timeoutId = null;
    }, delay);
  };
}

/**
 * Memoize expensive calculations.
 * Simple memoization with single-value cache.
 * 
 * @param {Function} fn - Function to memoize
 * @returns {Function} Memoized function
 */
export function memoize(fn) {
  const cache = new Map();

  return function memoized(...args) {
    const key = JSON.stringify(args);
    
    if (cache.has(key)) {
      return cache.get(key);
    }

    const result = fn(...args);
    cache.set(key, result);
    return result;
  };
}

/**
 * Check if device has reduced performance capabilities.
 * Useful for adaptive quality settings.
 * 
 * @returns {boolean} True if low-end device detected
 */
export function isLowEndDevice() {
  // Check hardware concurrency (CPU cores)
  const cores = navigator.hardwareConcurrency || 4;
  if (cores < 4) return true;

  // Check device memory (if available)
  if (navigator.deviceMemory && navigator.deviceMemory < 4) return true;

  // Check connection speed (if available)
  if (navigator.connection) {
    const effectiveType = navigator.connection.effectiveType;
    if (effectiveType === 'slow-2g' || effectiveType === '2g') return true;
  }

  return false;
}

/**
 * Monitor frame rate and detect performance issues.
 * 
 * @param {Function} callback - Called with FPS value
 * @returns {Function} Cleanup function
 */
export function monitorFPS(callback) {
  let lastTime = performance.now();
  let frames = 0;
  let rafId = null;

  function measure() {
    const now = performance.now();
    frames++;

    if (now >= lastTime + 1000) {
      const fps = Math.round((frames * 1000) / (now - lastTime));
      callback(fps);
      frames = 0;
      lastTime = now;
    }

    rafId = requestAnimationFrame(measure);
  }

  rafId = requestAnimationFrame(measure);

  // Cleanup function
  return () => {
    if (rafId) cancelAnimationFrame(rafId);
  };
}

