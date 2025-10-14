/**
 * Gesture Zones Utility
 * Defines touch zones for primary vs. subcategory gestures
 */

/**
 * Touch zone types
 * CENTER: Inner 40% radius - Primary category swipes (N/E/S/W)
 * PERIMETER: Outer 60% radius - Subcategory rotation
 * OUTSIDE: Beyond dial boundary - No action
 */
export const ZONES = {
  CENTER: 'CENTER',
  PERIMETER: 'PERIMETER',
  OUTSIDE: 'OUTSIDE'
};

/**
 * Zone configuration
 */
export const ZONE_CONFIG = {
  CENTER_RADIUS_PERCENT: 0.40,  // Inner 40% for primary swipes
  DIAL_RADIUS_PERCENT: 0.95,    // Outer boundary at 95%
};

/**
 * Get touch zone based on distance from dial center
 * 
 * @param {number} touchX - Touch X coordinate
 * @param {number} touchY - Touch Y coordinate
 * @param {Object} dialCenter - { x, y } center coordinates
 * @param {number} dialRadius - Radius of dial in pixels
 * @returns {string} - ZONES.CENTER | ZONES.PERIMETER | ZONES.OUTSIDE
 */
export function getTouchZone(touchX, touchY, dialCenter, dialRadius) {
  // Calculate distance from center
  const deltaX = touchX - dialCenter.x;
  const deltaY = touchY - dialCenter.y;
  const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
  
  // Normalize distance (0 = center, 1 = edge)
  const normalizedDistance = distance / dialRadius;
  
  // Determine zone
  if (normalizedDistance <= ZONE_CONFIG.CENTER_RADIUS_PERCENT) {
    return ZONES.CENTER;  // Inner 40% - Primary category swipes
  } else if (normalizedDistance <= ZONE_CONFIG.DIAL_RADIUS_PERCENT) {
    return ZONES.PERIMETER; // Outer 60% - Subcategory rotation
  } else {
    return ZONES.OUTSIDE; // Beyond dial - No action
  }
}

/**
 * Get dial center and radius from dial element
 * 
 * @param {HTMLElement} dialElement - The dial container element
 * @returns {Object} - { center: { x, y }, radius: number }
 */
export function getDialGeometry(dialElement) {
  if (!dialElement) {
    return { center: { x: 0, y: 0 }, radius: 0 };
  }
  
  const rect = dialElement.getBoundingClientRect();
  
  return {
    center: {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2
    },
    radius: rect.width / 2
  };
}

/**
 * Check if touch is within dial bounds
 * 
 * @param {number} touchX - Touch X coordinate
 * @param {number} touchY - Touch Y coordinate
 * @param {Object} dialCenter - { x, y } center coordinates
 * @param {number} dialRadius - Radius of dial in pixels
 * @returns {boolean} - True if touch is within dial
 */
export function isTouchInDial(touchX, touchY, dialCenter, dialRadius) {
  const zone = getTouchZone(touchX, touchY, dialCenter, dialRadius);
  return zone !== ZONES.OUTSIDE;
}


