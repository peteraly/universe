import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
import duration from 'dayjs/plugin/duration'

dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.extend(duration)

export type TemporalStatus = 'UPCOMING' | 'LOCKED' | 'IN_PROGRESS' | 'PASSED' | 'CANCELLED'

export interface EventTime {
  startAt: string          // ISO 8601 string, stored as UTC
  endAt?: string          // ISO 8601 string, stored as UTC
  durationMinutes?: number // Used if endAt is absent
  cutoffMinutes?: number  // Join lock window before startAt
  cancelled?: boolean     // Manual cancellation flag
  tz?: string            // IANA zone like "America/New_York" (display only)
}

export interface TemporalStatusInfo {
  status: TemporalStatus
  isJoinable: boolean
  isLeavable: boolean
  reason?: string
  timeUntilStart?: number  // Minutes until start
  timeUntilEnd?: number    // Minutes until end
  displayTime: string      // Formatted time in event timezone
}

const DEFAULT_DURATION_MINUTES = 120  // 2 hours
const DEFAULT_CUTOFF_MINUTES = 30     // 30 minutes before start

/**
 * Derive temporal status for an event
 * This is the single source of truth for time-based event state
 */
export function deriveTemporalStatus(
  event: EventTime, 
  nowIso?: string
): TemporalStatus {
  // Manual cancellation overrides all temporal logic
  if (event.cancelled) return 'CANCELLED'
  
  const now = nowIso ? dayjs.utc(nowIso) : dayjs.utc()
  const start = dayjs.utc(event.startAt)
  
  // Calculate end time
  const end = event.endAt
    ? dayjs.utc(event.endAt)
    : start.add(event.durationMinutes ?? DEFAULT_DURATION_MINUTES, 'minute')
  
  // Calculate cutoff (join lock) time
  const cutoffMin = event.cutoffMinutes ?? DEFAULT_CUTOFF_MINUTES
  const lockStart = start.subtract(cutoffMin, 'minute')
  
  // Temporal state machine
  if (now.isBefore(lockStart)) return 'UPCOMING'
  if (now.isBefore(start))     return 'LOCKED'
  if (now.isBefore(end))       return 'IN_PROGRESS'
  return 'PASSED'
}

/**
 * Get comprehensive temporal status info for UI
 */
export function getTemporalStatusInfo(
  event: EventTime,
  nowIso?: string
): TemporalStatusInfo {
  const status = deriveTemporalStatus(event, nowIso)
  const now = nowIso ? dayjs.utc(nowIso) : dayjs.utc()
  const start = dayjs.utc(event.startAt)
  const end = event.endAt
    ? dayjs.utc(event.endAt)
    : start.add(event.durationMinutes ?? DEFAULT_DURATION_MINUTES, 'minute')
  
  const timeUntilStart = Math.max(0, start.diff(now, 'minute'))
  const timeUntilEnd = Math.max(0, end.diff(now, 'minute'))
  
  // Format display time in event timezone
  const eventTz = event.tz || 'UTC'
  const displayTime = start.tz(eventTz).format('ddd, MMM D [at] h:mm A')
  
  // Determine joinability and leavability
  const getJoinLockReason = (): string => {
    const cutoffMin = event.cutoffMinutes ?? DEFAULT_CUTOFF_MINUTES
    switch (status) {
      case 'LOCKED':
        return `Joins locked ${cutoffMin} min before start`
      case 'IN_PROGRESS':
        return 'Event is currently in progress'
      case 'PASSED':
        return 'Event has ended'
      case 'CANCELLED':
        return 'Event has been cancelled'
      default:
        return ''
    }
  }
  
  return {
    status,
    isJoinable: status === 'UPCOMING',
    isLeavable: status === 'UPCOMING' || status === 'LOCKED',
    reason: status !== 'UPCOMING' ? getJoinLockReason() : undefined,
    timeUntilStart,
    timeUntilEnd,
    displayTime
  }
}

/**
 * Check if event is starting soon (within 60 minutes)
 */
export function isStartingSoon(event: EventTime, nowIso?: string): boolean {
  const now = nowIso ? dayjs.utc(nowIso) : dayjs.utc()
  const start = dayjs.utc(event.startAt)
  const minutesUntilStart = start.diff(now, 'minute')
  
  return minutesUntilStart > 0 && minutesUntilStart <= 60
}

/**
 * Check if event should be auto-archived (24h after end)
 */
export function shouldAutoArchive(event: EventTime, nowIso?: string): boolean {
  const now = nowIso ? dayjs.utc(nowIso) : dayjs.utc()
  const end = event.endAt
    ? dayjs.utc(event.endAt)
    : dayjs.utc(event.startAt).add(event.durationMinutes ?? DEFAULT_DURATION_MINUTES, 'minute')
  
  const hoursAfterEnd = now.diff(end, 'hour')
  return hoursAfterEnd >= 24
}

/**
 * Format time remaining until event start
 */
export function formatTimeUntilStart(event: EventTime, nowIso?: string): string {
  const now = nowIso ? dayjs.utc(nowIso) : dayjs.utc()
  const start = dayjs.utc(event.startAt)
  const diff = start.diff(now)
  
  if (diff <= 0) return ''
  
  const duration = dayjs.duration(diff)
  const days = duration.days()
  const hours = duration.hours()
  const minutes = duration.minutes()
  
  if (days > 0) {
    return `${days}d ${hours}h`
  } else if (hours > 0) {
    return `${hours}h ${minutes}m`
  } else {
    return `${minutes}m`
  }
}

/**
 * Get CTA (Call to Action) mapping based on temporal status
 */
export function getTemporalCTA(status: TemporalStatus): {
  primaryCTA: string
  disabled: boolean
  reason?: string
} {
  switch (status) {
    case 'UPCOMING':
      return {
        primaryCTA: 'Join',
        disabled: false
      }
    
    case 'LOCKED':
      return {
        primaryCTA: 'Locked',
        disabled: true,
        reason: 'Joins locked before start'
      }
    
    case 'IN_PROGRESS':
      return {
        primaryCTA: 'In Progress',
        disabled: true,
        reason: 'Event is currently running'
      }
    
    case 'PASSED':
      return {
        primaryCTA: 'Ended',
        disabled: true,
        reason: 'Event has ended'
      }
    
    case 'CANCELLED':
      return {
        primaryCTA: 'Cancelled',
        disabled: true,
        reason: 'Event was cancelled'
      }
    
    default:
      return {
        primaryCTA: 'Unknown',
        disabled: true,
        reason: 'Unknown event status'
      }
  }
}

/**
 * Edge case helper: Get grace period end (10 min buffer for events that run long)
 */
export function getGracePeriodEnd(event: EventTime): dayjs.Dayjs {
  const start = dayjs.utc(event.startAt)
  const end = event.endAt
    ? dayjs.utc(event.endAt)
    : start.add(event.durationMinutes ?? DEFAULT_DURATION_MINUTES, 'minute')
  
  // Add 10-minute grace period
  return end.add(10, 'minute')
}

/**
 * Validation helpers for event time fields
 */
export function validateEventTime(event: Partial<EventTime>): {
  valid: boolean
  errors: string[]
} {
  const errors: string[] = []
  
  if (!event.startAt) {
    errors.push('startAt is required')
  } else if (!dayjs(event.startAt).isValid()) {
    errors.push('startAt must be a valid ISO 8601 date')
  }
  
  if (event.endAt && !dayjs(event.endAt).isValid()) {
    errors.push('endAt must be a valid ISO 8601 date')
  }
  
  if (event.endAt && event.startAt) {
    const start = dayjs(event.startAt)
    const end = dayjs(event.endAt)
    if (end.isBefore(start)) {
      errors.push('endAt must be after startAt')
    }
  }
  
  if (event.durationMinutes !== undefined && event.durationMinutes <= 0) {
    errors.push('durationMinutes must be positive')
  }
  
  if (event.cutoffMinutes !== undefined && event.cutoffMinutes < 0) {
    errors.push('cutoffMinutes cannot be negative')
  }
  
  return {
    valid: errors.length === 0,
    errors
  }
}
