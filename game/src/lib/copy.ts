// Copy Constants for consistent messaging across the app
// This ensures all CTAs and toasts use the same language

export const CTAS = {
  // Primary Actions
  JOIN: 'Join',
  JOIN_WAITLIST: 'Join Waitlist',
  LEAVE: 'Leave',
  LEAVE_WAITLIST: 'Leave Waitlist',
  REQUEST_TO_JOIN: 'Request to Join',
  MANAGE_EVENT: 'Manage Event',
  
  // Secondary Actions
  SHARE: 'Share',
  VIEW_DETAILS: 'View Details',
  CANCEL_REQUEST: 'Cancel Request',
  
  // Disabled States
  LOCKED: 'Locked',
  INVITE_REQUIRED: 'Invite Required',
  REQUESTED: 'Requested',
  CANCELLED: 'Cancelled',
  ENDED: 'Ended',
  IN_PROGRESS: 'In Progress',
  
  // Form Actions
  CREATE_EVENT: 'Create Event',
  SAVE_CHANGES: 'Save Changes',
  CANCEL: 'Cancel',
  DELETE: 'Delete',
  
  // Navigation
  BACK_TO_EXPLORE: 'Back to Explore',
  BACK_TO_DASHBOARD: 'Back to Dashboard',
} as const

export const TOAST_MESSAGES = {
  // Join Actions - Gold Standard
  JOINING: 'Joining...',
  JOINED_SUCCESS: 'You\'re in. Undo?',
  JOINED_WAITLIST: 'Event full — joined waitlist. Undo?',
  JOINED_WAITLIST_WITH_POSITION: 'Event full — joined waitlist (#{position}). Undo?',
  
  // Leave Actions - Gold Standard
  LEAVING: 'Leaving...',
  LEFT_SUCCESS: 'Left. Undo?',
  LEFT_WAITLIST: 'Removed from waitlist. Undo?',
  
  // Request Actions
  REQUESTING: 'Sending request...',
  REQUEST_SENT: 'Request sent to host',
  REQUEST_CANCELLED: 'Request cancelled',
  
  // Blocked States
  JOINS_LOCKED: 'Joins locked {minutes} min before start',
  INVITE_REQUIRED: 'You need an invite to join this event',
  EVENT_CLOSED: 'Event is no longer accepting joins',
  EVENT_CANCELLED: 'Event has been cancelled',
  
  // Errors
  ERROR_JOINING: 'Failed to join. Try again.',
  ERROR_LEAVING: 'Failed to leave. Try again.',
  ERROR_REQUESTING: 'Failed to send request. Try again.',
  NETWORK_ERROR: 'Network error. Check your connection.',
  
  // Promotions - Gold Standard
  PROMOTED_FROM_WAITLIST: 'You\'re in! Promoted from waitlist. Undo?',
  SOMEONE_PROMOTED: 'A waitlisted player was promoted',
  
  // General
  CHANGES_SAVED: 'Changes saved',
  EVENT_CREATED: 'Event created successfully',
  EVENT_UPDATED: 'Event updated successfully',
  EVENT_DELETED: 'Event deleted',
} as const

export const STATUS_MESSAGES = {
  // Event Status
  PENDING: 'Pending',
  CONFIRMED: 'Confirmed',
  CANCELLED: 'Cancelled',
  LOCKED: 'Joins locked',
  ENDED: 'Ended',
  IN_PROGRESS: 'In Progress',
  
  // User Status
  ATTENDING: 'You\'re attending',
  WAITLISTED: 'You\'re on the waitlist',
  REQUESTED: 'Request pending',
  NOT_ATTENDING: 'Not attending',
  HOST: 'You\'re hosting',
  
  // Visibility
  PUBLIC: 'Public',
  INVITE_ONLY_AUTO: 'Invite-only (Auto)',
  INVITE_ONLY_MANUAL: 'Invite-only (Manual)',
} as const

export const ARIA_LABELS = {
  // Bubble Bar
  BUBBLE_OPEN: 'Seat {index} of {total} — open',
  BUBBLE_TAKEN: 'Seat {index} of {total} — taken',
  BUBBLE_YOURS: 'Seat {index} of {total} — your seat',
  BUBBLE_OVERFLOW: '{count} additional seats',
  BUBBLE_WAITLIST: 'Waitlist — {count} people waiting',
  
  // Buttons
  JOIN_BUTTON: 'Join this event',
  LEAVE_BUTTON: 'Leave this event',
  JOIN_WAITLIST_BUTTON: 'Join waitlist for this event',
  LEAVE_WAITLIST_BUTTON: 'Leave waitlist for this event',
  REQUEST_BUTTON: 'Request to join this event',
  SHARE_BUTTON: 'Share this event',
  
  // Navigation
  BACK_BUTTON: 'Go back',
  NEXT_BUTTON: 'Go to next event',
  PREV_BUTTON: 'Go to previous event',
  
  // Forms
  EVENT_TITLE_INPUT: 'Event title',
  EVENT_DESCRIPTION_INPUT: 'Event description',
  EVENT_LOCATION_INPUT: 'Event location',
  EVENT_DATE_INPUT: 'Event date',
  EVENT_TIME_INPUT: 'Event time',
  MAX_SLOTS_INPUT: 'Maximum number of participants',
} as const

export const TIME_FORMATS = {
  // Display formats
  EVENT_TIME: 'ddd, MMM D [at] h:mm A',
  EVENT_TIME_WITH_TZ: 'ddd, MMM D [at] h:mm A {tz}',
  EVENT_DATE: 'dddd, MMMM D, YYYY',
  EVENT_DATE_SHORT: 'MMM D',
  EVENT_TIME_ONLY: 'h:mm A',
  
  // Relative time
  TIME_UNTIL: '{time} until start',
  STARTING_SOON: 'Starting soon',
  LIVE_NOW: 'Live now',
  ENDED: 'Event has ended',
} as const

// Configuration
export const CONFIG = {
  UNDO_TOAST_MS: 5000, // 5 seconds default
  UNDO_TOAST_MIN: 3500, // Minimum 3.5 seconds
  UNDO_TOAST_MAX: 7000, // Maximum 7 seconds
  
  // A/B Testing flags
  AB_FLAGS: {
    BUBBLE_TAP_ONLY: false,
    JOIN_BUTTON_ONLY: false,
    YOUR_SEAT_RING: true,
    YOUR_SEAT_CHECK: false,
  },
  
  // Animation durations
  ANIMATION_DURATION: {
    BUBBLE_FILL: 170,
    BUBBLE_OUTLINE: 170,
    PULSE_SUCCESS: 120,
    PULSE_WARN: 120,
    TRANSITION: 200,
  },
} as const

// Helper functions
export function formatToastMessage(template: string, variables: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, key) => {
    return variables[key]?.toString() || match
  })
}

export function getAriaLabel(template: string, variables: Record<string, string | number>): string {
  return formatToastMessage(template, variables)
}

// Type exports
export type CTAKey = keyof typeof CTAS
export type ToastKey = keyof typeof TOAST_MESSAGES
export type StatusKey = keyof typeof STATUS_MESSAGES
export type AriaLabelKey = keyof typeof ARIA_LABELS
