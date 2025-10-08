// Time Format Utility Skeleton
// Time formatting and calculation utilities for TimeIndexThumbPicker
// Part of V12.0 L1 Event Curation Hub implementation

export interface TimeFormat {
  hours: number;
  minutes: number;
  seconds?: number;
}

export interface TimeRange {
  start: string;
  end: string;
}

export interface TimeStep {
  value: number;
  label: string;
}

// TODO: Implement time parsing functions
export const parseTime = (timeString: string): TimeFormat => {
  // TODO: Parse time string (HH:MM or HH:MM:SS) into TimeFormat object
  const [hours, minutes, seconds] = timeString.split(':').map(Number);
  return {
    hours: hours || 0,
    minutes: minutes || 0,
    seconds: seconds || 0
  };
};

// TODO: Implement time formatting functions
export const formatTime = (time: TimeFormat): string => {
  // TODO: Format TimeFormat object into HH:MM string
  const { hours, minutes } = time;
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
};

// TODO: Implement time validation functions
export const isValidTime = (timeString: string): boolean => {
  // TODO: Validate time string format and range
  const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
  return timeRegex.test(timeString);
};

// TODO: Implement time comparison functions
export const compareTimes = (time1: string, time2: string): number => {
  // TODO: Compare two time strings (-1, 0, 1)
  const t1 = parseTime(time1);
  const t2 = parseTime(time2);
  
  if (t1.hours !== t2.hours) {
    return t1.hours - t2.hours;
  }
  return t1.minutes - t2.minutes;
};

// TODO: Implement time arithmetic functions
export const addMinutes = (timeString: string, minutes: number): string => {
  // TODO: Add minutes to time string
  const time = parseTime(timeString);
  const totalMinutes = time.hours * 60 + time.minutes + minutes;
  const newHours = Math.floor(totalMinutes / 60) % 24;
  const newMinutes = totalMinutes % 60;
  
  return formatTime({ hours: newHours, minutes: newMinutes });
};

export const subtractMinutes = (timeString: string, minutes: number): string => {
  // TODO: Subtract minutes from time string
  const time = parseTime(timeString);
  const totalMinutes = time.hours * 60 + time.minutes - minutes;
  const newHours = Math.floor(totalMinutes / 60) % 24;
  const newMinutes = totalMinutes % 60;
  
  return formatTime({ hours: newHours, minutes: newMinutes });
};

// TODO: Implement time range functions
export const isTimeInRange = (time: string, range: TimeRange): boolean => {
  // TODO: Check if time is within range
  return compareTimes(time, range.start) >= 0 && compareTimes(time, range.end) <= 0;
};

export const getTimeRange = (start: string, end: string): TimeRange => {
  // TODO: Create time range object
  return { start, end };
};

// TODO: Implement step calculation functions
export const getTimeSteps = (step: number): TimeStep[] => {
  // TODO: Generate time steps (15min, 30min, 1hr, etc.)
  const steps: TimeStep[] = [];
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += step) {
      const timeString = formatTime({ hours: hour, minutes: minute });
      steps.push({
        value: hour * 60 + minute,
        label: timeString
      });
    }
  }
  return steps;
};

// TODO: Implement position calculation functions
export const timeToPosition = (time: string, minTime: string, maxTime: string): number => {
  // TODO: Convert time to position (0-1) within range
  const timeMinutes = parseTime(time).hours * 60 + parseTime(time).minutes;
  const minMinutes = parseTime(minTime).hours * 60 + parseTime(minTime).minutes;
  const maxMinutes = parseTime(maxTime).hours * 60 + parseTime(maxTime).minutes;
  
  return (timeMinutes - minMinutes) / (maxMinutes - minMinutes);
};

export const positionToTime = (position: number, minTime: string, maxTime: string, step: number): string => {
  // TODO: Convert position (0-1) to time within range
  const minMinutes = parseTime(minTime).hours * 60 + parseTime(minTime).minutes;
  const maxMinutes = parseTime(maxTime).hours * 60 + parseTime(maxTime).minutes;
  const totalMinutes = minMinutes + position * (maxMinutes - minMinutes);
  
  // TODO: Round to nearest step
  const roundedMinutes = Math.round(totalMinutes / step) * step;
  const hours = Math.floor(roundedMinutes / 60) % 24;
  const minutes = roundedMinutes % 60;
  
  return formatTime({ hours, minutes });
};

// TODO: Implement time display functions
export const formatTimeDisplay = (time: string, format: '12h' | '24h' = '24h'): string => {
  // TODO: Format time for display (12h/24h)
  if (format === '12h') {
    const timeObj = parseTime(time);
    const hour12 = timeObj.hours === 0 ? 12 : timeObj.hours > 12 ? timeObj.hours - 12 : timeObj.hours;
    const ampm = timeObj.hours >= 12 ? 'PM' : 'AM';
    return `${hour12}:${timeObj.minutes.toString().padStart(2, '0')} ${ampm}`;
  }
  return time;
};

// TODO: Implement time constants
export const TIME_CONSTANTS = {
  MINUTES_PER_HOUR: 60,
  HOURS_PER_DAY: 24,
  MINUTES_PER_DAY: 1440,
  DEFAULT_STEP: 15,
  COMMON_STEPS: [5, 10, 15, 30, 60]
} as const;

// TODO: Implement time presets
export const TIME_PRESETS = {
  BUSINESS_HOURS: { start: '09:00', end: '17:00' },
  EXTENDED_HOURS: { start: '08:00', end: '20:00' },
  FULL_DAY: { start: '00:00', end: '23:59' },
  MORNING: { start: '06:00', end: '12:00' },
  AFTERNOON: { start: '12:00', end: '18:00' },
  EVENING: { start: '18:00', end: '23:59' }
} as const;

// ============================================================================
// TIME HELPER FUNCTIONS
// ============================================================================

/**
 * Converts hour to display label with format and compact options
 * @param hour - Hour value (0-23)
 * @param format - Display format ('12h' | '24h')
 * @param compact - Whether to use compact format (e.g., "9" vs "09")
 * @returns Formatted hour display string
 */
export const toDisplayLabel = (hour: number, format: '12h' | '24h' = '24h', compact: boolean = false): string => {
  if (format === '12h') {
    const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return compact ? hour12.toString() : hour12.toString().padStart(2, '0');
  }
  return compact ? hour.toString() : hour.toString().padStart(2, '0');
};

/**
 * Creates full time label with hour and minute
 * @param hour - Hour value (0-23)
 * @param minute - Minute value (0-59)
 * @param format - Display format ('12h' | '24h')
 * @returns Full time label string
 */
export const toFullLabel = (hour: number, minute: number, format: '12h' | '24h' = '24h'): string => {
  if (format === '12h') {
    const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    const ampm = hour >= 12 ? 'PM' : 'AM';
    return `${hour12}:${minute.toString().padStart(2, '0')} ${ampm}`;
  }
  return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
};

/**
 * Normalizes time value to hour and minute object
 * @param value - Time value (string "HH:MM" or number of minutes)
 * @returns Object with hour and minute properties
 */
export const normalizeValue = (value: string | number): { hour: number; minute: number } => {
  if (typeof value === 'string') {
    const [hours, minutes] = value.split(':').map(Number);
    return {
      hour: hours || 0,
      minute: minutes || 0
    };
  }
  
  // Handle number of minutes
  const totalMinutes = Math.max(0, Math.min(1439, value)); // Clamp to 0-1439 minutes
  return {
    hour: Math.floor(totalMinutes / 60),
    minute: totalMinutes % 60
  };
};

/**
 * Converts hour and minute to output string with locale preference
 * @param hour - Hour value (0-23)
 * @param minute - Minute value (0-59)
 * @param preferLocal - Whether to prefer local timezone formatting
 * @returns Formatted time string
 */
export const toOutputString = (hour: number, minute: number, preferLocal: boolean = true): string => {
  const normalizedHour = Math.max(0, Math.min(23, hour));
  const normalizedMinute = Math.max(0, Math.min(59, minute));
  
  if (preferLocal) {
    // Use local timezone formatting
    const date = new Date();
    date.setHours(normalizedHour, normalizedMinute, 0, 0);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  }
  
  // Standard HH:MM format
  return `${normalizedHour.toString().padStart(2, '0')}:${normalizedMinute.toString().padStart(2, '0')}`;
};

/**
 * Snaps minute value to specified granularity
 * @param minute - Minute value (0-59)
 * @param granularity - Granularity in minutes (default: 15)
 * @returns Snapped minute value
 */
export const snapMinute = (minute: number, granularity: number = 15): number => {
  const normalizedMinute = Math.max(0, Math.min(59, minute));
  const snapped = Math.round(normalizedMinute / granularity) * granularity;
  return Math.max(0, Math.min(59, snapped));
};
