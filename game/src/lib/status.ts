// GameOn Status Logic - Centralized for App and Seeder
// Handles event status, membership status, and temporal state derivation

import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
import duration from 'dayjs/plugin/duration'

dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.extend(duration)

// Event Status Enum
export enum EventStatus {
  PENDING = 'pending',      // Not enough attendees
  CONFIRMED = 'confirmed',  // Has minimum attendees
  LOCKED = 'locked',       // Past cutoff time
  CANCELLED = 'cancelled', // Host cancelled
  ENDED = 'ended'          // Past end time
}

// Temporal Status Enum
export enum TemporalStatus {
  UPCOMING = 'upcoming',       // Before cutoff
  LOCKED = 'locked',           // Between cutoff and start
  IN_PROGRESS = 'in_progress', // Between start and end
  PASSED = 'passed',           // After end
  CANCELLED = 'cancelled'      // Cancelled by host
}

// Membership Status Enum
export enum MembershipStatus {
  NONE = 'none',
  ATTENDING = 'attending',
  WAITLISTED = 'waitlisted',
  REQUESTED = 'requested',
  BLOCKED = 'blocked'
}

// Event Visibility Enum
export enum EventVisibility {
  PUBLIC = 'public',
  INVITE_AUTO = 'invite_auto',
  INVITE_MANUAL = 'invite_manual'
}

// Event Time Interface
export interface EventTime {
  startAt: string              // ISO 8601 UTC
  tz: string                   // IANA timezone
  endAt?: string              // ISO 8601 UTC (optional)
  durationMinutes?: number    // Fallback duration
  cutoffMinutes?: number      // Minutes before start
}

// Event Core Interface
export interface EventCore {
  id: string
  title: string
  hostId: string
  sport: string
  maxSlots: number
  attendeeCount: number
  waitlistCount: number
  visibility: EventVisibility
  status: EventStatus
  createdAt: string
  location: string
  time: EventTime
}

// Membership Core Interface
export interface MembershipCore {
  userId: string
  eventId: string
  status: MembershipStatus
  joinedAt: string
  waitlistPosition?: number
}

// Derive Event Status
export function deriveEventStatus(
  attendeeCount: number,
  maxSlots: number,
  isHostCancelled: boolean = false,
  temporalStatus: TemporalStatus
): EventStatus {
  // Host cancelled overrides everything
  if (isHostCancelled) return EventStatus.CANCELLED
  
  // Temporal states override confirmation logic
  if (temporalStatus === TemporalStatus.PASSED) return EventStatus.ENDED
  if (temporalStatus === TemporalStatus.LOCKED || temporalStatus === TemporalStatus.IN_PROGRESS) {
    return EventStatus.LOCKED
  }
  
  // Business rule: Event is confirmed if it has any attendees
  // This encourages joining and avoids last-minute cancellations
  if (attendeeCount > 0) return EventStatus.CONFIRMED
  
  return EventStatus.PENDING
}

// Derive Temporal Status
export function deriveTemporalStatus(
  eventTime: EventTime,
  currentTime: Date = new Date()
): TemporalStatus {
  // Defensive check for invalid eventTime
  if (!eventTime || !eventTime.startAt) {
    console.warn('deriveTemporalStatus: Invalid eventTime provided', eventTime)
    return TemporalStatus.UPCOMING // Default to upcoming for safety
  }
  
  const now = dayjs(currentTime).utc()
  
  // Parse event time
  const startUtc = dayjs(eventTime.startAt).utc()
  
  // Calculate end time
  let endUtc: dayjs.Dayjs
  if (eventTime.endAt) {
    endUtc = dayjs(eventTime.endAt).utc()
  } else {
    const duration = eventTime.durationMinutes || 120 // Default 2 hours
    endUtc = startUtc.add(duration, 'minute')
  }
  
  // Calculate cutoff time
  const cutoffMinutes = eventTime.cutoffMinutes || 30 // Default 30 minutes
  const cutoffUtc = startUtc.subtract(cutoffMinutes, 'minute')
  
  // Determine temporal status
  if (now.isBefore(cutoffUtc)) return TemporalStatus.UPCOMING
  if (now.isBefore(startUtc)) return TemporalStatus.LOCKED
  if (now.isBefore(endUtc)) return TemporalStatus.IN_PROGRESS
  return TemporalStatus.PASSED
}

// Validate Event Data
export function validateEventData(event: EventCore): { isValid: boolean; errors: string[] } {
  const errors: string[] = []
  
  // Basic field validation
  if (!event.id) errors.push('Event ID is required')
  if (!event.title || event.title.length < 3) errors.push('Event title must be at least 3 characters')
  if (!event.hostId) errors.push('Host ID is required')
  if (!event.sport) errors.push('Sport is required')
  if (!event.location) errors.push('Location is required')
  
  // Numeric validation
  if (event.maxSlots < 1) errors.push('Max slots must be at least 1')
  if (event.maxSlots > 100) errors.push('Max slots cannot exceed 100')
  if (event.attendeeCount < 0) errors.push('Attendee count cannot be negative')
  if (event.waitlistCount < 0) errors.push('Waitlist count cannot be negative')
  if (event.attendeeCount > event.maxSlots) errors.push('Attendee count cannot exceed max slots')
  
  // Time validation
  try {
    const startTime = dayjs(event.time.startAt)
    if (!startTime.isValid()) errors.push('Invalid start time')
    
    if (event.time.endAt) {
      const endTime = dayjs(event.time.endAt)
      if (!endTime.isValid()) errors.push('Invalid end time')
      if (endTime.isBefore(startTime)) errors.push('End time must be after start time')
    }
  } catch (error) {
    errors.push('Invalid time format')
  }
  
  // Enum validation
  if (!Object.values(EventVisibility).includes(event.visibility)) {
    errors.push('Invalid event visibility')
  }
  if (!Object.values(EventStatus).includes(event.status)) {
    errors.push('Invalid event status')
  }
  
  return { isValid: errors.length === 0, errors }
}

// Validate Membership Data
export function validateMembershipData(membership: MembershipCore): { isValid: boolean; errors: string[] } {
  const errors: string[] = []
  
  // Basic field validation
  if (!membership.userId) errors.push('User ID is required')
  if (!membership.eventId) errors.push('Event ID is required')
  if (!membership.joinedAt) errors.push('Joined at timestamp is required')
  
  // Status validation
  if (!Object.values(MembershipStatus).includes(membership.status)) {
    errors.push('Invalid membership status')
  }
  
  // Waitlist position validation
  if (membership.status === MembershipStatus.WAITLISTED) {
    if (membership.waitlistPosition === undefined || membership.waitlistPosition < 1) {
      errors.push('Waitlist position is required for waitlisted members')
    }
  }
  
  // Time validation
  try {
    const joinedTime = dayjs(membership.joinedAt)
    if (!joinedTime.isValid()) errors.push('Invalid joined at time')
  } catch (error) {
    errors.push('Invalid joined at time format')
  }
  
  return { isValid: errors.length === 0, errors }
}

// Helper: Generate consistent event ID
export function generateEventId(hostId: string, timestamp: number, sport: string): string {
  return `evt_${hostId}_${timestamp}_${sport.toLowerCase().replace(/\s+/g, '_')}`
}

// Helper: Generate consistent membership ID
export function generateMembershipId(userId: string, eventId: string): string {
  return `mem_${userId}_${eventId}`
}

// Helper: Calculate waitlist position
export function calculateWaitlistPosition(
  memberships: MembershipCore[],
  eventId: string
): number {
  const waitlistedMembers = memberships
    .filter(m => m.eventId === eventId && m.status === MembershipStatus.WAITLISTED)
    .sort((a, b) => dayjs(a.joinedAt).valueOf() - dayjs(b.joinedAt).valueOf())
  
  return waitlistedMembers.length + 1
}

// Helper: Check if user can join event
export function canUserJoinEvent(
  userId: string,
  event: EventCore,
  existingMembership?: MembershipCore,
  isInvited: boolean = false
): { canJoin: boolean; reason?: string } {
  // Already has membership
  if (existingMembership && existingMembership.status !== MembershipStatus.NONE) {
    return { canJoin: false, reason: 'User already has membership for this event' }
  }
  
  // Event is cancelled or ended
  const temporalStatus = deriveTemporalStatus(event.time)
  if (event.status === EventStatus.CANCELLED) {
    return { canJoin: false, reason: 'Event is cancelled' }
  }
  if (temporalStatus === TemporalStatus.PASSED) {
    return { canJoin: false, reason: 'Event has ended' }
  }
  if (temporalStatus === TemporalStatus.LOCKED || temporalStatus === TemporalStatus.IN_PROGRESS) {
    return { canJoin: false, reason: 'Event joins are locked' }
  }
  
  // Visibility checks
  if (event.visibility === EventVisibility.INVITE_AUTO && !isInvited) {
    return { canJoin: false, reason: 'Invite required' }
  }
  
  // Can join (may go to waitlist if full)
  return { canJoin: true }
}

// Client-side status derivation and action logic
export function deriveMyStatus(userId: string, event: EventWithAttendees): MembershipStatus {
  const membership = event.memberships?.find(m => m.userId === userId)
  return membership?.status || MembershipStatus.NONE
}

export interface NextAction {
  label: string
  disabled: boolean
  reason?: string
  action: 'join' | 'leave' | 'joinWaitlist' | 'leaveWaitlist' | 'request' | 'none'
}

export function nextAction(userId: string, event: EventWithAttendees): NextAction {
  // Defensive check for invalid event
  if (!event) {
    console.warn('nextAction: Invalid event provided', event)
    return { label: 'Loading...', disabled: true, action: 'none' }
  }
  
  const myStatus = deriveMyStatus(userId, event)
  
  // Safely construct eventTime object
  const eventTime = {
    startAt: event.startAt || event.startTime,
    tz: event.tz || 'America/New_York',
    endAt: event.endAt,
    durationMinutes: event.durationMinutes,
    cutoffMinutes: event.cutoffMinutes
  }
  
  const temporalStatus = deriveTemporalStatus(eventTime)
  
  // Event is cancelled or ended
  if (event.status === 'cancelled') {
    return { label: 'Cancelled', disabled: true, reason: 'Event is cancelled', action: 'none' }
  }
  
  if (temporalStatus === TemporalStatus.PASSED) {
    return { label: 'Ended', disabled: true, reason: 'Event has ended', action: 'none' }
  }
  
  if (temporalStatus === TemporalStatus.LOCKED || temporalStatus === TemporalStatus.IN_PROGRESS) {
    return { label: 'Locked', disabled: true, reason: 'Joins locked 30 min before start', action: 'none' }
  }
  
  // User is hosting
  if (event.createdBy === userId) {
    return { label: "You're hosting", disabled: true, reason: 'You are hosting this event', action: 'none' }
  }
  
  // Based on current status
  switch (myStatus) {
    case MembershipStatus.ATTENDING:
      return { label: 'Leave', disabled: false, action: 'leave' }
      
    case MembershipStatus.WAITLISTED:
      const membership = event.memberships?.find(m => m.userId === userId)
      const position = membership?.waitlistOrder || 0
      return { 
        label: `Leave waitlist (#${position})`, 
        disabled: false, 
        action: 'leaveWaitlist' 
      }
      
    case MembershipStatus.REQUESTED:
      return { label: 'Requested', disabled: true, reason: 'Request pending', action: 'none' }
      
    case MembershipStatus.BLOCKED:
      return { label: 'Blocked', disabled: true, reason: 'You are blocked', action: 'none' }
      
    default: // NONE status
      // Check visibility requirements
      if (event.visibility === 'invite_manual') {
        return { label: 'Request to join', disabled: false, action: 'request' }
      }
      
      // Check capacity
      if (event.attendeeCount >= event.maxSlots) {
        return { label: 'Join waitlist', disabled: false, action: 'joinWaitlist' }
      }
      
      return { label: 'Join', disabled: false, action: 'join' }
  }
}

// Export all for seeder and app use
