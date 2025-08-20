import { Event, EventMembership } from '../types'
import { deriveTemporalStatus, EventTime } from './temporalStatus'

export type JoinOutcome = 
  | 'ATTEND'           // User can join directly
  | 'WAITLIST'         // Event is full, user goes to waitlist
  | 'REQUEST'          // Manual mode - user requests to join
  | 'BLOCKED_EVENT_CLOSED'     // Event cancelled or passed
  | 'BLOCKED_JOINS_LOCKED'     // After cutoff time
  | 'BLOCKED_INVITE_REQUIRED'  // Invite-only, user not invited
  | 'ALREADY_ATTENDING'        // Idempotent - user already attending
  | 'ALREADY_WAITLISTED'       // Idempotent - user already waitlisted
  | 'ALREADY_REQUESTED'        // Idempotent - user already requested
  | 'BLOCKED'                  // User blocked from this event

export interface JoinContext {
  isInvited: boolean
  now: string // ISO timestamp
  afterCutoff: boolean
  passed: boolean
  cancelled: boolean
}

export interface JoinEligibilityResult {
  outcome: JoinOutcome
  canTap: boolean
  reason?: string
  message?: string
  ctaText?: string
}

/**
 * Determine what happens when a user taps a bubble to join
 * This is the single source of truth for join eligibility
 */
export function deriveJoinOutcome(
  event: Event,
  membership: EventMembership | null,
  context: JoinContext
): JoinEligibilityResult {
  // Convert Event to EventTime for temporal validation
  const eventTime: EventTime = {
    startAt: event.startAt || event.startTime,
    endAt: event.endAt,
    durationMinutes: event.durationMinutes,
    cutoffMinutes: event.cutoffMinutes,
    cancelled: event.cancelled,
    tz: event.tz
  }

  // Check temporal status first
  const temporalStatus = deriveTemporalStatus(eventTime, context.now)
  
  // BLOCKED: Event is closed (cancelled or passed)
  if (temporalStatus === 'CANCELLED') {
    return {
      outcome: 'BLOCKED_EVENT_CLOSED',
      canTap: false,
      reason: 'Event was cancelled',
      message: 'This event has been cancelled',
      ctaText: 'Cancelled'
    }
  }

  if (temporalStatus === 'PASSED') {
    return {
      outcome: 'BLOCKED_EVENT_CLOSED',
      canTap: false,
      reason: 'Event has ended',
      message: 'This event has already ended',
      ctaText: 'Ended'
    }
  }

  // BLOCKED: Joins are locked (after cutoff)
  if (temporalStatus === 'LOCKED') {
    const cutoffMin = event.cutoffMinutes || 30
    return {
      outcome: 'BLOCKED_JOINS_LOCKED',
      canTap: false,
      reason: `Joins locked ${cutoffMin} min before start`,
      message: `Joins are locked ${cutoffMin} minutes before the event starts`,
      ctaText: 'Locked'
    }
  }

  // IDEMPOTENT: User already has a membership status
  if (membership) {
    switch (membership.status) {
      case 'attending':
        return {
          outcome: 'ALREADY_ATTENDING',
          canTap: true, // Can tap to leave
          reason: 'You are already attending',
          message: 'You are already attending this event',
          ctaText: 'Leave'
        }
      
      case 'waitlisted':
        return {
          outcome: 'ALREADY_WAITLISTED',
          canTap: true, // Can tap to leave waitlist
          reason: 'You are on the waitlist',
          message: `You are #${membership.waitlistOrder} on the waitlist`,
          ctaText: 'Leave Waitlist'
        }
      
      case 'requested':
        return {
          outcome: 'ALREADY_REQUESTED',
          canTap: false, // Request is pending
          reason: 'Request pending',
          message: 'Your request to join is pending host approval',
          ctaText: 'Requested'
        }
      
      case 'blocked':
        return {
          outcome: 'BLOCKED',
          canTap: false,
          reason: 'You are blocked from this event',
          message: 'You cannot join this event',
          ctaText: 'Blocked'
        }
    }
  }

  // User has no membership - determine join action based on visibility and capacity
  switch (event.visibility) {
    case 'public':
      // Public events: join directly or waitlist if full
      if (event.attendeeCount < event.maxSlots) {
        return {
          outcome: 'ATTEND',
          canTap: true,
          reason: 'Join this event',
          message: 'Tap to join this event',
          ctaText: 'Join'
        }
      } else {
        return {
          outcome: 'WAITLIST',
          canTap: true,
          reason: 'Event is full - join waitlist',
          message: 'This event is full. Tap to join the waitlist.',
          ctaText: 'Join Waitlist'
        }
      }

    case 'invite_auto':
      // Invite-only auto: must be invited, then join or waitlist
      if (!context.isInvited) {
        return {
          outcome: 'BLOCKED_INVITE_REQUIRED',
          canTap: false,
          reason: 'Invite required',
          message: 'You need an invite to join this event',
          ctaText: 'Invite Required'
        }
      }

      if (event.attendeeCount < event.maxSlots) {
        return {
          outcome: 'ATTEND',
          canTap: true,
          reason: 'Join this event',
          message: 'Tap to join this event',
          ctaText: 'Join'
        }
      } else {
        return {
          outcome: 'WAITLIST',
          canTap: true,
          reason: 'Event is full - join waitlist',
          message: 'This event is full. Tap to join the waitlist.',
          ctaText: 'Join Waitlist'
        }
      }

    case 'invite_manual':
      // Invite-only manual: always request to join
      return {
        outcome: 'REQUEST',
        canTap: true,
        reason: 'Request to join',
        message: 'Request permission to join this event',
        ctaText: 'Request to Join'
      }

    default:
      return {
        outcome: 'BLOCKED',
        canTap: false,
        reason: 'Unknown visibility',
        message: 'Cannot determine join eligibility',
        ctaText: 'Unknown'
      }
  }
}

/**
 * Get user-friendly message for join outcome
 */
export function getJoinOutcomeMessage(outcome: JoinOutcome): string {
  switch (outcome) {
    case 'ATTEND':
      return 'Joining event...'
    case 'WAITLIST':
      return 'Adding to waitlist...'
    case 'REQUEST':
      return 'Sending request...'
    case 'ALREADY_ATTENDING':
      return 'You are already attending'
    case 'ALREADY_WAITLISTED':
      return 'You are already on the waitlist'
    case 'ALREADY_REQUESTED':
      return 'Request already sent'
    case 'BLOCKED_EVENT_CLOSED':
      return 'Event is no longer accepting joins'
    case 'BLOCKED_JOINS_LOCKED':
      return 'Joins are locked'
    case 'BLOCKED_INVITE_REQUIRED':
      return 'Invite required to join'
    case 'BLOCKED':
      return 'Cannot join this event'
    default:
      return 'Unknown status'
  }
}

/**
 * Check if outcome represents a successful join action
 */
export function isJoinAction(outcome: JoinOutcome): boolean {
  return ['ATTEND', 'WAITLIST', 'REQUEST'].includes(outcome)
}

/**
 * Check if outcome represents a blocked state
 */
export function isBlocked(outcome: JoinOutcome): boolean {
  return outcome.startsWith('BLOCKED_')
}

/**
 * Check if outcome represents an idempotent state (user already has status)
 */
export function isIdempotent(outcome: JoinOutcome): boolean {
  return outcome.startsWith('ALREADY_')
}
