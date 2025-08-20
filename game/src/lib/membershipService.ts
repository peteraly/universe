import { Event, User, EventMembership, MembershipStatus } from '../types'
import { getTemporalStatusInfo, EventTime } from './temporalStatus'
import dayjs from 'dayjs'

// Rate limiting map (in production, use Redis)
const rateLimitMap = new Map<string, number>()

// Mock membership storage (in production, use Firestore)
const membershipStore = new Map<string, EventMembership>()

export interface MembershipResponse {
  state: MembershipStatus
  message: string
  confirmed?: boolean
  waitlistPosition?: number
  promotedUser?: string
}

export interface IdempotentResponse {
  success: boolean
  state: MembershipStatus
  message: string
  confirmed?: boolean
  waitlistPosition?: number
  promotedUser?: string
}

export class MembershipService {
  /**
   * Get or create membership for user
   */
  private static getMembership(eventId: string, userId: string): EventMembership {
    const key = `${eventId}_${userId}`
    if (!membershipStore.has(key)) {
      membershipStore.set(key, {
        id: key,
        eventId,
        userId,
        status: 'none'
      })
    }
    return membershipStore.get(key)!
  }

  /**
   * Update membership (always overwrites)
   */
  private static setMembership(membership: EventMembership): void {
    const key = `${membership.eventId}_${membership.userId}`
    membershipStore.set(key, membership)
  }

  /**
   * Rate limiting check
   */
  private static checkRateLimit(userId: string, eventId: string, action: string): boolean {
    const key = `${userId}-${eventId}-${action}`
    const lastAttempt = rateLimitMap.get(key)
    const now = dayjs().valueOf()
    
    if (lastAttempt && now - lastAttempt < 3000) { // 3 second throttle
      return false
    }
    
    rateLimitMap.set(key, now)
    return true
  }

  /**
   * Validate event is open for operations using temporal status
   */
  private static validateEventOpen(event: Event): { valid: boolean; reason?: string } {
    // Convert Event to EventTime format for temporal validation
    const eventTime: EventTime = {
      startAt: event.startAt || event.startTime, // Use new field or fallback
      endAt: event.endAt,
      durationMinutes: event.durationMinutes,
      cutoffMinutes: event.cutoffMinutes,
      cancelled: event.cancelled,
      tz: event.tz
    }

    const temporalInfo = getTemporalStatusInfo(eventTime)
    
    // Only UPCOMING events allow joins/operations
    if (temporalInfo.status === 'UPCOMING') {
      return { valid: true }
    }

    return { 
      valid: false, 
      reason: temporalInfo.reason || `Event is ${temporalInfo.status.toLowerCase()}` 
    }
  }

  /**
   * Validate visibility requirements
   */
  private static validateVisibility(event: Event, _user: User, isInvited: boolean = false): { valid: boolean; reason?: string } {
    if (event.visibility === 'invite_auto' && !isInvited) {
      return { valid: false, reason: 'Event is invite-only' }
    }

    return { valid: true }
  }

  /**
   * Get waitlist position
   */
  private static getWaitlistPosition(eventId: string, userId: string): number {
    const memberships = Array.from(membershipStore.values())
      .filter(m => m.eventId === eventId && m.status === 'waitlisted')
      .sort((a, b) => (a.waitlistOrder || 0) - (b.waitlistOrder || 0))
    
    const userIndex = memberships.findIndex(m => m.userId === userId)
    return userIndex >= 0 ? userIndex + 1 : 0
  }

  /**
   * Get next waitlist order number
   */
  private static getNextWaitlistOrder(eventId: string): number {
    const memberships = Array.from(membershipStore.values())
      .filter(m => m.eventId === eventId && m.status === 'waitlisted')
    
    return memberships.length + 1
  }

  /**
   * Promote next person from waitlist (respects temporal boundaries)
   */
  private static async promoteNextWaitlisted(event: Event): Promise<{ promoted: boolean; promotedUser?: string }> {
    // Check if event is still open for promotions
    const eventValidation = this.validateEventOpen(event)
    if (!eventValidation.valid) {
      return { promoted: false } // No promotions after cutoff/end
    }

    const waitlistedMembers = Array.from(membershipStore.values())
      .filter(m => m.eventId === event.id && m.status === 'waitlisted')
      .sort((a, b) => (a.waitlistOrder || 0) - (b.waitlistOrder || 0))

    if (waitlistedMembers.length === 0 || event.attendeeCount >= event.maxSlots) {
      return { promoted: false }
    }

    const nextMember = waitlistedMembers[0]
    const updatedMembership: EventMembership = {
      ...nextMember,
      status: 'attending',
      joinedAt: new Date(),
      waitlistedAt: undefined,
      waitlistOrder: undefined
    }

    this.setMembership(updatedMembership)
    
    return { 
      promoted: true, 
      promotedUser: nextMember.userId 
    }
  }

  /**
   * IDEMPOTENT: Claim seat (join or waitlist)
   * For public and invite_auto events
   */
  static async claimSeat(event: Event, user: User, isInvited: boolean = false): Promise<IdempotentResponse> {
    // Rate limiting
    if (!this.checkRateLimit(user.id, event.id, 'claimSeat')) {
      return {
        success: false,
        state: 'none',
        message: 'Please wait a moment before trying again'
      }
    }

    // Validate event is open
    const eventValidation = this.validateEventOpen(event)
    if (!eventValidation.valid) {
      return {
        success: false,
        state: 'none',
        message: eventValidation.reason!
      }
    }

    // Validate visibility
    const visibilityValidation = this.validateVisibility(event, user, isInvited)
    if (!visibilityValidation.valid) {
      return {
        success: false,
        state: 'none',
        message: visibilityValidation.reason!
      }
    }

    // Get current membership
    const membership = this.getMembership(event.id, user.id)

    // IDEMPOTENCY: Return current state if already in target state
    if (membership.status === 'attending') {
      return {
        success: true,
        state: 'attending',
        message: 'You are already attending this event',
        confirmed: event.status === 'confirmed'
      }
    }

    if (membership.status === 'waitlisted') {
      const position = this.getWaitlistPosition(event.id, user.id)
      return {
        success: true,
        state: 'waitlisted',
        message: `You are already on the waitlist (position ${position})`,
        waitlistPosition: position
      }
    }

    if (membership.status === 'requested') {
      return {
        success: true,
        state: 'requested',
        message: 'You have already requested to join this event'
      }
    }

    if (membership.status === 'blocked') {
      return {
        success: false,
        state: 'blocked',
        message: 'You are blocked from this event'
      }
    }

    // Simulate server transaction
    await new Promise(resolve => setTimeout(resolve, 500))

    // Determine new state based on availability
    if (event.attendeeCount < event.maxSlots) {
      // Join directly
      const updatedMembership: EventMembership = {
        ...membership,
        status: 'attending',
        joinedAt: new Date()
      }
      this.setMembership(updatedMembership)

      const confirmed = event.attendeeCount + 1 === event.maxSlots
      return {
        success: true,
        state: 'attending',
        message: confirmed ? 'Event confirmed! You\'re in!' : 'Successfully joined!',
        confirmed
      }
    } else {
      // Join waitlist
      const updatedMembership: EventMembership = {
        ...membership,
        status: 'waitlisted',
        waitlistedAt: new Date(),
        waitlistOrder: this.getNextWaitlistOrder(event.id)
      }
      this.setMembership(updatedMembership)

      const position = this.getWaitlistPosition(event.id, user.id)
      return {
        success: true,
        state: 'waitlisted',
        message: `Event full — you're #${position} on waitlist`,
        waitlistPosition: position
      }
    }
  }

  /**
   * IDEMPOTENT: Leave seat with auto-promotion
   */
  static async leaveSeat(event: Event, user: User): Promise<IdempotentResponse> {
    // Rate limiting
    if (!this.checkRateLimit(user.id, event.id, 'leaveSeat')) {
      return {
        success: false,
        state: 'none',
        message: 'Please wait a moment before trying again'
      }
    }

    const membership = this.getMembership(event.id, user.id)

    // IDEMPOTENCY: Return current state if not attending
    if (membership.status !== 'attending') {
      return {
        success: true,
        state: membership.status,
        message: membership.status === 'none' 
          ? 'You are not attending this event' 
          : `You are ${membership.status} (not attending)`
      }
    }

    // Simulate server transaction
    await new Promise(resolve => setTimeout(resolve, 500))

    // Remove from attending
    const updatedMembership: EventMembership = {
      ...membership,
      status: 'none',
      joinedAt: undefined
    }
    this.setMembership(updatedMembership)

    // Auto-promote from waitlist (if not past cutoff)
    const eventValidation = this.validateEventOpen(event)
    const promotionResult = eventValidation.valid 
      ? await this.promoteNextWaitlisted(event)
      : { promoted: false }

    return {
      success: true,
      state: 'none',
      message: promotionResult.promoted 
        ? 'Left event. A waitlisted player was promoted!' 
        : 'Successfully left event.',
      promotedUser: promotionResult.promotedUser
    }
  }

  /**
   * IDEMPOTENT: Leave waitlist
   */
  static async leaveWaitlist(event: Event, user: User): Promise<IdempotentResponse> {
    // Rate limiting
    if (!this.checkRateLimit(user.id, event.id, 'leaveWaitlist')) {
      return {
        success: false,
        state: 'none',
        message: 'Please wait a moment before trying again'
      }
    }

    const membership = this.getMembership(event.id, user.id)

    // IDEMPOTENCY: Return current state if not waitlisted
    if (membership.status !== 'waitlisted') {
      return {
        success: true,
        state: membership.status,
        message: membership.status === 'none' 
          ? 'You are not on the waitlist' 
          : `You are ${membership.status} (not waitlisted)`
      }
    }

    // Simulate server transaction
    await new Promise(resolve => setTimeout(resolve, 500))

    // Remove from waitlist
    const updatedMembership: EventMembership = {
      ...membership,
      status: 'none',
      waitlistedAt: undefined,
      waitlistOrder: undefined
    }
    this.setMembership(updatedMembership)

    return {
      success: true,
      state: 'none',
      message: 'Successfully left waitlist'
    }
  }

  /**
   * IDEMPOTENT: Request to join (for invite_manual events)
   */
  static async requestToJoin(event: Event, user: User): Promise<IdempotentResponse> {
    // Rate limiting
    if (!this.checkRateLimit(user.id, event.id, 'requestToJoin')) {
      return {
        success: false,
        state: 'none',
        message: 'Please wait a moment before trying again'
      }
    }

    // Validate event is manual mode
    if (event.visibility !== 'invite_manual') {
      return {
        success: false,
        state: 'none',
        message: 'This event does not require requests'
      }
    }

    // Validate event is open
    const eventValidation = this.validateEventOpen(event)
    if (!eventValidation.valid) {
      return {
        success: false,
        state: 'none',
        message: eventValidation.reason!
      }
    }

    const membership = this.getMembership(event.id, user.id)

    // IDEMPOTENCY: Return current state if already requested
    if (membership.status === 'requested') {
      return {
        success: true,
        state: 'requested',
        message: 'You have already requested to join this event'
      }
    }

    if (membership.status === 'attending') {
      return {
        success: true,
        state: 'attending',
        message: 'You are already attending this event'
      }
    }

    if (membership.status === 'waitlisted') {
      return {
        success: true,
        state: 'waitlisted',
        message: 'You are already on the waitlist'
      }
    }

    // Simulate server transaction
    await new Promise(resolve => setTimeout(resolve, 500))

    // Create request
    const updatedMembership: EventMembership = {
      ...membership,
      status: 'requested',
      requestedAt: new Date()
    }
    this.setMembership(updatedMembership)

    return {
      success: true,
      state: 'requested',
      message: 'Request submitted successfully'
    }
  }

  /**
   * IDEMPOTENT: Accept request (host action)
   */
  static async acceptRequest(event: Event, userId: string): Promise<IdempotentResponse> {
    const membership = this.getMembership(event.id, userId)

    // Validate request exists
    if (membership.status !== 'requested') {
      return {
        success: false,
        state: membership.status,
        message: 'User has not requested to join this event'
      }
    }

    // Simulate server transaction
    await new Promise(resolve => setTimeout(resolve, 500))

    // Determine new state based on availability
    if (event.attendeeCount < event.maxSlots) {
      // Join directly
      const updatedMembership: EventMembership = {
        ...membership,
        status: 'attending',
        joinedAt: new Date(),
        requestedAt: undefined
      }
      this.setMembership(updatedMembership)

      const confirmed = event.attendeeCount + 1 === event.maxSlots
      return {
        success: true,
        state: 'attending',
        message: 'User joined successfully',
        confirmed
      }
    } else {
      // Join waitlist (manual overflow case)
      const updatedMembership: EventMembership = {
        ...membership,
        status: 'waitlisted',
        waitlistedAt: new Date(),
        waitlistOrder: this.getNextWaitlistOrder(event.id),
        requestedAt: undefined
      }
      this.setMembership(updatedMembership)

      const position = this.getWaitlistPosition(event.id, userId)
      return {
        success: true,
        state: 'waitlisted',
        message: 'User added to waitlist (accepted while full)',
        waitlistPosition: position
      }
    }
  }

  /**
   * Get current membership status
   */
  static getMembershipStatus(event: Event, user: User, isInvited: boolean = false): MembershipStatus {
    const membership = this.getMembership(event.id, user.id)
    
    // Check if user is blocked by visibility
    if (event.visibility === 'invite_auto' && !isInvited) {
      return 'blocked'
    }

    return membership.status
  }

  /**
   * Clear all memberships (for testing)
   */
  static clearAll(): void {
    membershipStore.clear()
    rateLimitMap.clear()
  }
}
