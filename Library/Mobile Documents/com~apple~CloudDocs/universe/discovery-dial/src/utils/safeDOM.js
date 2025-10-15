/**
 * Safe DOM manipulation utilities
 * Prevents crashes from undefined DOM elements
 */

/**
 * Safely set a CSS style property on an element
 * @param {HTMLElement|null} element - The DOM element
 * @param {string} property - The CSS property name
 * @param {string} value - The CSS property value
 * @returns {boolean} - True if successful, false if element is undefined
 */
export const safeSetStyle = (element, property, value) => {
  try {
    if (element && element.style && typeof element.style[property] !== 'undefined') {
      element.style[property] = value;
      return true;
    }
    return false;
  } catch (error) {
    console.warn('Safe DOM: Failed to set style', { element, property, value, error });
    return false;
  }
};

/**
 * Safely get a DOM element by selector
 * @param {string} selector - CSS selector
 * @returns {HTMLElement|null} - The element or null if not found
 */
export const safeGetElement = (selector) => {
  try {
    if (typeof document !== 'undefined') {
      return document.querySelector(selector);
    }
    return null;
  } catch (error) {
    console.warn('Safe DOM: Failed to get element', { selector, error });
    return null;
  }
};

/**
 * Safely get document.body
 * @returns {HTMLElement|null} - document.body or null if not available
 */
export const safeDocumentBody = () => {
  try {
    if (typeof document !== 'undefined' && document.body) {
      return document.body;
    }
    return null;
  } catch (error) {
    console.warn('Safe DOM: Failed to get document.body', { error });
    return null;
  }
};

/**
 * Safely get document.documentElement
 * @returns {HTMLElement|null} - document.documentElement or null if not available
 */
export const safeDocumentElement = () => {
  try {
    if (typeof document !== 'undefined' && document.documentElement) {
      return document.documentElement;
    }
    return null;
  } catch (error) {
    console.warn('Safe DOM: Failed to get document.documentElement', { error });
    return null;
  }
};

/**
 * Safely check if window is available
 * @returns {boolean} - True if window is available
 */
export const isWindowAvailable = () => {
  try {
    return typeof window !== 'undefined';
  } catch (error) {
    console.warn('Safe DOM: Failed to check window availability', { error });
    return false;
  }
};

/**
 * Safely check if document is available
 * @returns {boolean} - True if document is available
 */
export const isDocumentAvailable = () => {
  try {
    return typeof document !== 'undefined';
  } catch (error) {
    console.warn('Safe DOM: Failed to check document availability', { error });
    return false;
  }
};

/**
 * Safely add event listener to an element
 * @param {HTMLElement|null} element - The DOM element
 * @param {string} event - The event name
 * @param {Function} handler - The event handler
 * @param {Object} options - Event listener options
 * @returns {boolean} - True if successful
 */
export const safeAddEventListener = (element, event, handler, options = {}) => {
  try {
    if (element && typeof element.addEventListener === 'function') {
      element.addEventListener(event, handler, options);
      return true;
    }
    return false;
  } catch (error) {
    console.warn('Safe DOM: Failed to add event listener', { element, event, error });
    return false;
  }
};

/**
 * Safely remove event listener from an element
 * @param {HTMLElement|null} element - The DOM element
 * @param {string} event - The event name
 * @param {Function} handler - The event handler
 * @param {Object} options - Event listener options
 * @returns {boolean} - True if successful
 */
export const safeRemoveEventListener = (element, event, handler, options = {}) => {
  try {
    if (element && typeof element.removeEventListener === 'function') {
      element.removeEventListener(event, handler, options);
      return true;
    }
    return false;
  } catch (error) {
    console.warn('Safe DOM: Failed to remove event listener', { element, event, error });
    return false;
  }
};

/**
 * Safely set multiple styles on an element
 * @param {HTMLElement|null} element - The DOM element
 * @param {Object} styles - Object of CSS properties and values
 * @returns {boolean} - True if all styles were set successfully
 */
export const safeSetStyles = (element, styles) => {
  try {
    if (!element || !element.style) {
      return false;
    }

    let success = true;
    Object.entries(styles).forEach(([property, value]) => {
      if (!safeSetStyle(element, property, value)) {
        success = false;
      }
    });

    return success;
  } catch (error) {
    console.warn('Safe DOM: Failed to set multiple styles', { element, styles, error });
    return false;
  }
};

/**
 * Safely get computed style of an element
 * @param {HTMLElement|null} element - The DOM element
 * @param {string} property - The CSS property name
 * @returns {string|null} - The computed style value or null
 */
export const safeGetComputedStyle = (element, property) => {
  try {
    if (element && typeof window !== 'undefined' && window.getComputedStyle) {
      const computedStyle = window.getComputedStyle(element);
      return computedStyle.getPropertyValue(property);
    }
    return null;
  } catch (error) {
    console.warn('Safe DOM: Failed to get computed style', { element, property, error });
    return null;
  }
};

/**
 * Safely check if an element exists and is mounted
 * @param {HTMLElement|null} element - The DOM element
 * @returns {boolean} - True if element exists and is mounted
 */
export const isElementMounted = (element) => {
  try {
    return element && element.parentNode && document.contains(element);
  } catch (error) {
    console.warn('Safe DOM: Failed to check if element is mounted', { element, error });
    return false;
  }
};

/**
 * Safely wait for DOM to be ready
 * @param {Function} callback - Function to call when DOM is ready
 * @returns {boolean} - True if callback was called immediately
 */
export const safeWaitForDOM = (callback) => {
  try {
    if (isDocumentAvailable() && document.readyState === 'complete') {
      callback();
      return true;
    } else if (isDocumentAvailable()) {
      document.addEventListener('DOMContentLoaded', callback);
      return false;
    } else {
      // Fallback for SSR environments
      setTimeout(callback, 0);
      return false;
    }
  } catch (error) {
    console.warn('Safe DOM: Failed to wait for DOM', { error });
    // Fallback
    setTimeout(callback, 0);
    return false;
  }
};

export default {
  safeSetStyle,
  safeGetElement,
  safeDocumentBody,
  safeDocumentElement,
  isWindowAvailable,
  isDocumentAvailable,
  safeAddEventListener,
  safeRemoveEventListener,
  safeSetStyles,
  safeGetComputedStyle,
  isElementMounted,
  safeWaitForDOM
};
