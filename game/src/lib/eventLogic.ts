import { Event, User } from '../types'
import { MembershipService } from './membershipService'
import dayjs from 'dayjs'

// New simplified types for the join flow
export type EventMode = 'public' | 'invite_auto' | 'invite_manual';
export type NextAction = 'JOIN' | 'JOIN_WL' | 'LEAVE' | 'LEAVE_WL' | 'REQUEST' | 'BLOCKED';

// UserStatus enum - single source of truth
export enum UserStatus {
  CANCELLED = 'CANCELLED',           // event cancelled
  BLOCKED = 'BLOCKED',               // (optional) host blocked user / kicked & locked
  HOST = 'HOST',                     // event.createdBy == userId (or co-host)
  JOINS_LOCKED = 'JOINS_LOCKED',     // past cutoff (policy: freeze)
  INVITE_REQUIRED = 'INVITE_REQUIRED', // invite_auto and user lacks invite
  REQUEST_PENDING = 'REQUEST_PENDING', // invite_manual: request pending
  REQUEST_ACCEPTED = 'REQUEST_ACCEPTED', // invite_manual: request accepted but not yet joined
  ATTENDING = 'ATTENDING',           // attendee doc exists
  WAITLISTED = 'WAITLISTED',         // waitlist doc exists (only when full)
  NOT_ATTENDING = 'NOT_ATTENDING'    // default
}

// Waitlist data model
export interface WaitlistEntry {
  userId: string
  joinedAt: Date
  source: 'public' | 'invite'
}

// Server response types for claimSeat
export interface ClaimSeatResponse {
  state: 'attending' | 'waitlisted' | 'locked' | 'invite_required' | 'error'
  message: string
  confirmed?: boolean
  waitlistPosition?: number
  promotedUser?: string
}

// Simplified status derivation for the join flow
export function deriveMyStatus(
  event: Event, 
  user: User, 
  context: { now: number; invited?: boolean }
): UserStatus {
  // Temporal checks first
  if (event.status === 'cancelled') return UserStatus.CANCELLED;
  
  const eventEnd = dayjs(event.startAt || event.startTime).add(event.durationMinutes || 120, 'minute');
  if (context.now >= eventEnd.valueOf()) return UserStatus.JOINS_LOCKED; // Use JOINS_LOCKED for ended events
  
  const cutoffTime = dayjs(event.startAt || event.startTime).subtract(event.cutoffMinutes || 30, 'minute');
  if (context.now >= cutoffTime.valueOf()) return UserStatus.JOINS_LOCKED;

  // Current membership status - check attendees and waitlist
  const isAttending = event.attendees?.some((a: any) => a.userId === user.id);
  const isWaitlisted = (event as any).waitlist?.some((w: any) => w.userId === user.id);
  
  if (isAttending) return UserStatus.ATTENDING;
  if (isWaitlisted) return UserStatus.WAITLISTED;

  // Visibility checks
  if (event.visibility === 'public') return UserStatus.NOT_ATTENDING;
  if (event.visibility === 'invite_auto') return context.invited ? UserStatus.NOT_ATTENDING : UserStatus.INVITE_REQUIRED;
  if (event.visibility === 'invite_manual') return UserStatus.NOT_ATTENDING; // Will become REQUEST_PENDING on tap

  return UserStatus.NOT_ATTENDING;
}

// Single source of truth for next action
export function nextAction(event: Event, myStatus: UserStatus): NextAction {
  if ([UserStatus.CANCELLED, UserStatus.JOINS_LOCKED, UserStatus.INVITE_REQUIRED].includes(myStatus)) {
    return 'BLOCKED';
  }
  
  if (myStatus === UserStatus.ATTENDING) return 'LEAVE';
  if (myStatus === UserStatus.WAITLISTED) return 'LEAVE_WL';
  if (myStatus === UserStatus.REQUEST_PENDING) return 'BLOCKED';
  
  // NOT_ATTENDING - check if event is full
  const isFull = (event.attendeeCount || 0) >= event.maxSlots;
  if (event.visibility === 'invite_manual') return 'REQUEST';
  return isFull ? 'JOIN_WL' : 'JOIN';
}

// CTA label matrix - single source of truth
export function getCTALabel(myStatus: UserStatus, nextAction: NextAction, event: Event): {
  label: string;
  disabled: boolean;
  reason?: string;
} {
  switch (nextAction) {
    case 'JOIN':
      return { label: 'Join', disabled: false };
    case 'JOIN_WL':
      return { label: 'Join waitlist', disabled: false };
    case 'LEAVE':
      return { label: 'Leave', disabled: false };
    case 'LEAVE_WL':
      return { label: 'Leave waitlist', disabled: false };
    case 'REQUEST':
      return { label: 'Request to join', disabled: false };
    case 'BLOCKED':
      switch (myStatus) {
        case UserStatus.CANCELLED:
          return { label: 'Event Cancelled', disabled: true, reason: 'Event has been cancelled' };
        case UserStatus.JOINS_LOCKED:
          const cutoffMinutes = event.cutoffMinutes || 30;
          return { 
            label: `Joins locked ${cutoffMinutes}m`, 
            disabled: true, 
            reason: `Joins locked ${cutoffMinutes} minutes before start` 
          };
        case UserStatus.INVITE_REQUIRED:
          return { label: 'Invite required', disabled: true, reason: 'You need an invite to join this event' };
        case UserStatus.REQUEST_PENDING:
          return { label: 'Requested', disabled: true, reason: 'Request pending host approval' };
        default:
          return { label: 'Join', disabled: true, reason: 'Cannot join at this time' };
      }
    default:
      return { label: 'Join', disabled: true };
  }
}

// Server-authoritative event logic
export class EventLogicService {
  
  /**
   * Derive user status with proper precedence
   */
  static deriveUserStatus(event: Event, user: User, context: {
    blocked?: boolean
    isCoHost?: boolean
    isInvited?: boolean
    attendeeExists?: boolean
    waitlistExists?: boolean
    requestExists?: boolean
    requestStatus?: 'pending' | 'accepted' | 'rejected'
  }): UserStatus {
    if (!event || event.status === 'cancelled') return UserStatus.CANCELLED
    if (context.blocked) return UserStatus.BLOCKED
    if (event.createdBy === user.id || context.isCoHost) return UserStatus.HOST
    
    // Check cutoff time
    const cutoffTime = dayjs(event.startTime).subtract(event.cutoffMinutes || 30, 'minute')
    if (dayjs().isAfter(cutoffTime)) return UserStatus.JOINS_LOCKED
    
    // Check invite requirement for invite_auto
    if (event.visibility === 'invite_auto' && !context.isInvited) return UserStatus.INVITE_REQUIRED
    
    // Check current participation
    if (context.attendeeExists) return UserStatus.ATTENDING
    if (context.waitlistExists) return UserStatus.WAITLISTED
    
    // Check request status for invite_manual
    if (event.visibility === 'invite_manual' && context.requestExists) {
      if (context.requestStatus === 'pending') return UserStatus.REQUEST_PENDING
      if (context.requestStatus === 'accepted') return UserStatus.REQUEST_ACCEPTED
      if (context.requestStatus === 'rejected') return UserStatus.NOT_ATTENDING
    }
    
    return UserStatus.NOT_ATTENDING
  }
  
  /**
   * Get CTA mapping based on user status and event visibility
   */
  static getCTAMapping(status: UserStatus, event: Event): {
    primaryCTA: string
    secondaryCTA?: string
    disabled: boolean
    reason?: string
  } {
    const isFull = event.attendeeCount >= event.maxSlots
    
    switch (status) {
      case UserStatus.CANCELLED:
        return {
          primaryCTA: 'Event Cancelled',
          disabled: true,
          reason: 'Event has been cancelled'
        }
        
      case UserStatus.BLOCKED:
        return {
          primaryCTA: 'Access Denied',
          disabled: true,
          reason: 'You cannot join this event'
        }
        
      case UserStatus.HOST:
        return {
          primaryCTA: 'Manage Event',
          secondaryCTA: 'View Details',
          disabled: false
        }
        
      case UserStatus.JOINS_LOCKED:
        return {
          primaryCTA: 'Joins Locked',
          disabled: true,
          reason: `Joins closed ${event.cutoffMinutes || 30} minutes before start`
        }
        
      case UserStatus.INVITE_REQUIRED:
        return {
          primaryCTA: 'Invite Required',
          disabled: true,
          reason: 'Event is invite-only'
        }
        
      case UserStatus.REQUEST_PENDING:
        return {
          primaryCTA: 'Request Pending',
          disabled: true,
          reason: 'Waiting for host approval'
        }
        
      case UserStatus.REQUEST_ACCEPTED:
        return {
          primaryCTA: 'Join Now',
          disabled: false,
          reason: 'Your request was accepted!'
        }
        
      case UserStatus.ATTENDING:
        return {
          primaryCTA: 'Leave',
          secondaryCTA: 'Share',
          disabled: false
        }
        
      case UserStatus.WAITLISTED:
        return {
          primaryCTA: 'Leave Waitlist',
          disabled: false
        }
        
      case UserStatus.NOT_ATTENDING:
        // Different CTAs based on event visibility
        if (event.visibility === 'public') {
          return {
            primaryCTA: isFull ? 'Join Waitlist' : 'Join',
            disabled: false
          }
        } else if (event.visibility === 'invite_auto') {
          return {
            primaryCTA: isFull ? 'Join Waitlist' : 'Join',
            disabled: false
          }
        } else if (event.visibility === 'invite_manual') {
          return {
            primaryCTA: 'Request to Join',
            disabled: false
          }
        }
        
        return {
          primaryCTA: 'Join',
          disabled: false
        }
        
      default:
        return {
          primaryCTA: 'Join',
          disabled: false
        }
    }
  }
  
  /**
   * Check all preconditions before processing any action
   */
  static validatePreconditions(
    event: Event,
    user: User,
    action: 'join' | 'leave' | 'joinWaitlist' | 'leaveWaitlist' | 'request'
  ): { valid: boolean; reason?: string } {
    
    // 1. Auth present
    if (!user) {
      return { valid: false, reason: 'Authentication required' }
    }
    
    // 2. Event exists and not cancelled
    if (!event || event.status === 'cancelled') {
      return { valid: false, reason: 'Event is cancelled or not found' }
    }
    
    // 3. Visibility check
    if (event.visibility === 'invite_auto') {
      // TODO: Check if user has invite - for now, allow all
      // return { valid: false, reason: 'Event is invite-only' }
    }
    
    // 4. Cutoff time check (unless host)
    const isHost = user.id === event.createdBy
    if (!isHost) {
      const cutoffTime = dayjs(event.startTime).subtract(event.cutoffMinutes || 30, 'minute')
      if (dayjs().isAfter(cutoffTime)) {
        return { valid: false, reason: `Joins closed ${event.cutoffMinutes || 30} minutes before start` }
      }
    }
    

    
    // 6. State-specific validations
    const isAttending = event.currentUserAttendee
    const isWaitlisted = event.currentUserWaitlist
    
    switch (action) {
      case 'join':
        if (isAttending) {
          return { valid: false, reason: 'You are already attending' }
        }
        if (isWaitlisted) {
          return { valid: false, reason: 'You are already on the waitlist' }
        }
        break
        
      case 'leave':
        if (!isAttending) {
          return { valid: false, reason: 'You are not attending this event' }
        }
        break
        
      case 'joinWaitlist':
        if (isAttending) {
          return { valid: false, reason: 'You are already attending' }
        }
        if (isWaitlisted) {
          return { valid: false, reason: 'You are already on the waitlist' }
        }
        if (event.attendeeCount < event.maxSlots) {
          return { valid: false, reason: 'Event has available seats' }
        }
        break
        
      case 'leaveWaitlist':
        if (!isWaitlisted) {
          return { valid: false, reason: 'You are not on the waitlist' }
        }
        break
        
      case 'request':
        if (isAttending) {
          return { valid: false, reason: 'You are already attending' }
        }
        if (isWaitlisted) {
          return { valid: false, reason: 'You are already on the waitlist' }
        }
        if (event.visibility !== 'invite_manual') {
          return { valid: false, reason: 'Requests only allowed for manual approval events' }
        }
        break
    }
    
    return { valid: true }
  }
  
  /**
   * Process join attempt with full server logic (claimSeat)
   * Delegates to MembershipService for idempotent operations
   */
  static async processJoin(event: Event, user: User): Promise<ClaimSeatResponse> {
    const result = await MembershipService.claimSeat(event, user, true) // Assume invited for now
    
    return {
      state: result.state === 'attending' ? 'attending' : 
             result.state === 'waitlisted' ? 'waitlisted' : 'error',
      message: result.message,
      confirmed: result.confirmed,
      waitlistPosition: result.waitlistPosition
    }
  }
  
  /**
   * Process leave attempt (leaveSeat) with auto-promotion
   * Delegates to MembershipService for idempotent operations
   */
  static async processLeave(event: Event, user: User): Promise<{
    success: boolean
    newState: 'left' | 'error'
    message: string
    promotedUser?: string
    promoted?: boolean
  }> {
    const result = await MembershipService.leaveSeat(event, user)
    
    return {
      success: result.success,
      newState: result.success ? 'left' : 'error',
      message: result.message,
      promotedUser: result.promotedUser,
      promoted: !!result.promotedUser
    }
  }
  
  /**
   * Process waitlist join
   * Delegates to MembershipService for idempotent operations
   */
  static async processJoinWaitlist(event: Event, user: User): Promise<ClaimSeatResponse> {
    const result = await MembershipService.claimSeat(event, user, true) // Assume invited for now
    
    return {
      state: result.state === 'waitlisted' ? 'waitlisted' : 'error',
      message: result.message,
      waitlistPosition: result.waitlistPosition
    }
  }
  
  /**
   * Process waitlist leave (leaveWaitlist)
   * Delegates to MembershipService for idempotent operations
   */
  static async processLeaveWaitlist(event: Event, user: User): Promise<{
    success: boolean
    newState: 'left-waitlist' | 'error'
    message: string
  }> {
    const result = await MembershipService.leaveWaitlist(event, user)
    
    return {
      success: result.success,
      newState: result.success ? 'left-waitlist' : 'error',
      message: result.message
    }
  }
  
  /**
   * Request to join (for invite_manual events)
   * Delegates to MembershipService for idempotent operations
   */
  static async requestToJoin(event: Event, user: User): Promise<{
    success: boolean
    message: string
  }> {
    const result = await MembershipService.requestToJoin(event, user)
    
    return {
      success: result.success,
      message: result.message
    }
  }
  
  /**
   * Host accepts request (for invite_manual events)
   * Delegates to MembershipService for idempotent operations
   */
  static async acceptRequest(event: Event, userId: string): Promise<{
    success: boolean
    newState: 'attending' | 'waitlisted' | 'error'
    message: string
    confirmed?: boolean
  }> {
    const result = await MembershipService.acceptRequest(event, userId)
    
    return {
      success: result.success,
      newState: result.state === 'attending' ? 'attending' : 
                result.state === 'waitlisted' ? 'waitlisted' : 'error',
      message: result.message,
      confirmed: result.confirmed
    }
  }
  
  /**
   * Auto-promote from waitlist (promoteWaitlist)
   */
  static async autoPromote(event: Event): Promise<{
    promoted: boolean
    promotedUser?: string
    message?: string
  }> {
    if (event.attendeeCount >= event.maxSlots || event.waitlistCount === 0) {
      return { promoted: false }
    }
    
    // Check cutoff policy (Freeze)
    const cutoffTime = dayjs(event.startTime).subtract(event.cutoffMinutes || 30, 'minute')
    if (dayjs().isAfter(cutoffTime)) {
      return { promoted: false }
    }
    
    // Simulate server transaction
    await new Promise(resolve => setTimeout(resolve, 300))
    
    return {
      promoted: true,
      promotedUser: 'waitlisted-user-456',
      message: 'A waitlisted player was automatically promoted!'
    }
  }
  
  /**
   * Get current user state for an event
   */
  static getUserState(event: Event, user: User): {
    status: UserStatus
    canJoin: boolean
    canLeave: boolean
    canJoinWaitlist: boolean
    canLeaveWaitlist: boolean
    message?: string
    cta: {
      primaryCTA: string
      secondaryCTA?: string
      disabled: boolean
      reason?: string
    }
  } {
    const isHost = user.id === event.createdBy
    const isAttending = !!event.currentUserAttendee
    const isWaitlisted = !!event.currentUserWaitlist
    const isFull = event.attendeeCount >= event.maxSlots
    const isPastCutoff = dayjs().isAfter(dayjs(event.startTime).subtract(event.cutoffMinutes || 30, 'minute'))
    
    // Derive status with proper precedence
    const status = this.deriveUserStatus(event, user, {
      attendeeExists: isAttending,
      waitlistExists: isWaitlisted,
      isInvited: true // TODO: Check actual invite status
    })
    
    // Get CTA mapping
    const cta = this.getCTAMapping(status, event)
    
    // Determine interaction capabilities
    const canInteract = !isPastCutoff && !isHost && event.status !== 'cancelled'
    const canJoin = canInteract && !isAttending && !isWaitlisted && !isFull
    const canLeave = canInteract && isAttending
    const canJoinWaitlist = canInteract && !isAttending && !isWaitlisted && isFull
    const canLeaveWaitlist = canInteract && isWaitlisted
    
    return {
      status,
      canJoin,
      canLeave,
      canJoinWaitlist,
      canLeaveWaitlist,
      message: cta.reason,
      cta
    }
  }
}
