/**
 * Time Helpers for Discovery Dial Time Picker
 * Utilities for parsing, formatting, and comparing times
 */

/**
 * Parse a time string like "7:30 PM" into { hours, minutes }
 * 
 * @param {string} timeString - Time in format "H:MM AM/PM" or "HH:MM AM/PM"
 * @returns {{ hours: number, minutes: number }} 24-hour format time
 * 
 * @example
 * parseEventTime("7:30 PM") → { hours: 19, minutes: 30 }
 * parseEventTime("12:00 AM") → { hours: 0, minutes: 0 }
 * parseEventTime("12:00 PM") → { hours: 12, minutes: 0 }
 */
export function parseEventTime(timeString) {
  if (!timeString || typeof timeString !== 'string') {
    return { hours: 0, minutes: 0 };
  }

  const match = timeString.match(/(\d+):(\d+)\s*(AM|PM)/i);
  if (!match) {
    return { hours: 0, minutes: 0 };
  }

  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const period = match[3].toUpperCase();

  // Convert to 24-hour format
  if (period === 'PM' && hours !== 12) {
    hours += 12;
  }
  if (period === 'AM' && hours === 12) {
    hours = 0;
  }

  return { hours, minutes };
}

/**
 * Format time object to display string like "7:30 PM"
 * 
 * @param {number} hours - Hours in 24-hour format (0-23)
 * @param {number} minutes - Minutes (0-59)
 * @returns {string} Formatted time string
 * 
 * @example
 * formatTime(19, 30) → "7:30 PM"
 * formatTime(0, 0) → "12:00 AM"
 * formatTime(12, 0) → "12:00 PM"
 */
export function formatTime(hours, minutes) {
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  const displayMinutes = minutes.toString().padStart(2, '0');
  return `${displayHours}:${displayMinutes} ${period}`;
}

/**
 * Format time object to compact display like "7PM" or "7:30PM"
 * 
 * @param {number} hours - Hours in 24-hour format (0-23)
 * @param {number} minutes - Minutes (0-59)
 * @returns {string} Compact time string
 */
export function formatTimeCompact(hours, minutes) {
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  
  if (minutes === 0) {
    return `${displayHours}${period}`;
  }
  
  return `${displayHours}:${minutes.toString().padStart(2, '0')}${period}`;
}

/**
 * Check if time A is at or after time B
 * 
 * @param {{ hours: number, minutes: number }} timeA
 * @param {{ hours: number, minutes: number }} timeB
 * @returns {boolean} True if timeA >= timeB
 * 
 * @example
 * isAtOrAfter({ hours: 19, minutes: 30 }, { hours: 18, minutes: 0 }) → true
 * isAtOrAfter({ hours: 7, minutes: 0 }, { hours: 19, minutes: 0 }) → false
 */
export function isAtOrAfter(timeA, timeB) {
  const totalMinutesA = timeA.hours * 60 + timeA.minutes;
  const totalMinutesB = timeB.hours * 60 + timeB.minutes;
  return totalMinutesA >= totalMinutesB;
}

/**
 * Get current time as { hours, minutes }
 * 
 * @returns {{ hours: number, minutes: number }}
 */
export function getCurrentTime() {
  const now = new Date();
  return {
    hours: now.getHours(),
    minutes: now.getMinutes()
  };
}

/**
 * Calculate time from vertical position in scrubber
 * 
 * @param {number} clientY - Current pointer Y position
 * @param {number} scrubberTop - Top of scrubber element
 * @param {number} scrubberHeight - Height of scrubber element
 * @returns {{ hours: number, minutes: number, slotIndex: number }}
 */
export function getTimeFromPosition(clientY, scrubberTop, scrubberHeight) {
  const normalizedY = (clientY - scrubberTop) / scrubberHeight;
  const clampedY = Math.max(0, Math.min(1, normalizedY));
  
  // Map to 48 half-hour slots (0 = 12:00 AM, 47 = 11:30 PM)
  const slotIndex = Math.round(clampedY * 47);
  
  const hours = Math.floor(slotIndex / 2);
  const minutes = (slotIndex % 2) * 30;
  
  return { hours, minutes, slotIndex };
}

/**
 * Get vertical position (0-1) from time
 * 
 * @param {number} hours - Hours (0-23)
 * @param {number} minutes - Minutes (0-59)
 * @returns {number} Position from 0 (top) to 1 (bottom)
 */
export function getPositionFromTime(hours, minutes) {
  const totalMinutes = hours * 60 + minutes;
  const maxMinutes = 24 * 60;
  return totalMinutes / maxMinutes;
}

/**
 * Time markers for display (5 key times covering the day)
 */
export const TIME_MARKERS = [
  { label: '12AM', hours: 0, minutes: 0 },
  { label: '6AM', hours: 6, minutes: 0 },
  { label: '12PM', hours: 12, minutes: 0 },
  { label: '6PM', hours: 18, minutes: 0 },
  { label: '11PM', hours: 23, minutes: 0 }
];

