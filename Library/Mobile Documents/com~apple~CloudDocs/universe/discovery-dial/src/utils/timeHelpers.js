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

// ============================================
// DATE HELPERS (for time filtering)
// ============================================

/**
 * Get today's date in YYYY-MM-DD format
 * 
 * @returns {string} Today's date
 * 
 * @example
 * getTodayDate() → "2025-10-13"
 */
export function getTodayDate() {
  const today = new Date();
  return formatDateToISO(today);
}

/**
 * Format a Date object to YYYY-MM-DD
 * 
 * @param {Date} date - Date object
 * @returns {string} ISO date string
 */
export function formatDateToISO(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Check if a date string is today
 * 
 * @param {string} dateString - Date in YYYY-MM-DD format
 * @returns {boolean} True if date is today
 */
export function isToday(dateString) {
  return dateString === getTodayDate();
}

/**
 * Check if a date string is this week (within next 7 days)
 * 
 * @param {string} dateString - Date in YYYY-MM-DD format
 * @returns {boolean} True if date is within this week
 */
export function isThisWeek(dateString) {
  const eventDate = new Date(dateString);
  const today = new Date();
  const nextWeek = new Date(today);
  nextWeek.setDate(today.getDate() + 7);
  
  return eventDate >= today && eventDate <= nextWeek;
}

/**
 * Compare two date strings
 * 
 * @param {string} dateA - Date in YYYY-MM-DD format
 * @param {string} dateB - Date in YYYY-MM-DD format
 * @returns {number} -1 if dateA < dateB, 0 if equal, 1 if dateA > dateB
 */
export function compareDates(dateA, dateB) {
  if (dateA < dateB) return -1;
  if (dateA > dateB) return 1;
  return 0;
}

/**
 * Check if an event should be shown based on date and time
 * 
 * @param {string} eventDate - Event date in YYYY-MM-DD format
 * @param {{ hours: number, minutes: number }} eventTime - Event start time
 * @param {string} filterDate - Filter date in YYYY-MM-DD format
 * @param {{ hours: number, minutes: number }} filterTime - Filter time
 * @returns {boolean} True if event should be shown
 */
export function shouldShowEvent(eventDate, eventTime, filterDate, filterTime) {
  // If event is on a future date, show it
  if (compareDates(eventDate, filterDate) > 0) {
    return true;
  }
  
  // If event is on the same date, check time
  if (compareDates(eventDate, filterDate) === 0) {
    return isAtOrAfter(eventTime, filterTime);
  }
  
  // Event is in the past
  return false;
}

// ============================================
// DATE RANGE HELPERS (for date range button)
// ============================================

/**
 * Get date range boundaries based on selection
 * 
 * @param {string} range - 'TODAY' | 'TOMORROW' | 'THIS WEEK' | 'THIS MONTH'
 * @returns {{ startDate: string, endDate: string }} ISO date strings (YYYY-MM-DD)
 * 
 * @example
 * getDateRangeBounds('TODAY') → { startDate: '2025-10-13', endDate: '2025-10-13' }
 * getDateRangeBounds('THIS WEEK') → { startDate: '2025-10-13', endDate: '2025-10-20' }
 */
export function getDateRangeBounds(range) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  let startDate, endDate;
  
  switch(range) {
    case 'TODAY':
      startDate = formatDateToISO(today);
      endDate = formatDateToISO(today);
      break;
      
    case 'TOMORROW':
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      startDate = formatDateToISO(tomorrow);
      endDate = formatDateToISO(tomorrow);
      break;
      
    case 'THIS WEEK':
      startDate = formatDateToISO(today);
      const nextWeek = new Date(today);
      nextWeek.setDate(today.getDate() + 7);
      endDate = formatDateToISO(nextWeek);
      break;
      
    case 'THIS MONTH':
      startDate = formatDateToISO(today);
      const nextMonth = new Date(today);
      nextMonth.setDate(today.getDate() + 30);
      endDate = formatDateToISO(nextMonth);
      break;
      
    default:
      startDate = formatDateToISO(today);
      endDate = formatDateToISO(today);
  }
  
  return { startDate, endDate };
}

/**
 * Check if event date falls within range
 * 
 * @param {string} eventDate - Event date in YYYY-MM-DD format
 * @param {string} startDate - Range start date in YYYY-MM-DD format
 * @param {string} endDate - Range end date in YYYY-MM-DD format
 * @returns {boolean} True if event date is within range (inclusive)
 * 
 * @example
 * isDateInRange('2025-10-15', '2025-10-13', '2025-10-20') → true
 * isDateInRange('2025-10-25', '2025-10-13', '2025-10-20') → false
 */
export function isDateInRange(eventDate, startDate, endDate) {
  return eventDate >= startDate && eventDate <= endDate;
}

/**
 * Get display label for date range
 * 
 * @param {string} range - Date range key
 * @returns {string} Display label
 */
export function getDateRangeLabel(range) {
  const labels = {
    'TODAY': 'Today',
    'TOMORROW': 'Tomorrow',
    'THIS WEEK': 'This Week',
    'THIS MONTH': 'This Month'
  };
  return labels[range] || range;
}

