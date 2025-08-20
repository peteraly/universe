import dayjs from 'dayjs'
import { EventWithAttendees, User, EventMembership } from '../types'
import { deriveTemporalStatus, deriveMyStatus } from './status'

export interface FeedContext {
  currentUser: User
  userLocation?: { lat: number; lng: number }
  userConnections: string[]
  currentTime: Date
}

export interface EventFeatures {
  availability: number
  affinity: number
  social: number
  timeUrgency: number
  hostReputation: number
  freshness: number
  distanceInverse: number
  lockPenalty: number
  waitlistPenalty: number
}

export interface FeedSection {
  title: string
  events: EventWithAttendees[]
  type: 'my-schedule' | 'for-you' | 'spots-opened' | 'from-hosts' | 'new-today' | 'past'
}

export interface FeedPolicy {
  mySchedule: EventWithAttendees[]
  forYou: EventWithAttendees[]
  optionalSections: FeedSection[]
  pastEvents: EventWithAttendees[]
}

// Eligibility filters
export function isEligibleForMainFeed(event: EventWithAttendees, user: User): boolean {
  const now = dayjs()
  const startTime = dayjs(event.startAt)
  const endTime = dayjs(event.endAt)
  
  // Basic eligibility
  const isConfirmed = event.status === 'confirmed'
  const isUpcoming = startTime.isAfter(now.subtract(10, 'minute')) && startTime.isBefore(now.add(30, 'days'))
  
  // Check if user is already a member (using currentUserMembership)
  const isNotJoined = !event.currentUserMembership || 
                     (event.currentUserMembership.status !== 'attending' && 
                      event.currentUserMembership.status !== 'waitlisted')
  
  const isNotEnded = !endTime.isBefore(now)
  const isNotCancelled = !event.cancelled
  
  return isConfirmed && isUpcoming && isNotJoined && isNotEnded && isNotCancelled
}

export function isEligibleForMySchedule(event: EventWithAttendees, user: User): boolean {
  // Check if user is a member with attending or waitlisted status
  return event.currentUserMembership && 
         (event.currentUserMembership.status === 'attending' || 
          event.currentUserMembership.status === 'waitlisted')
}

export function isEligibleForPastEvents(event: EventWithAttendees): boolean {
  const now = dayjs()
  const endTime = dayjs(event.endAt)
  return endTime.isBefore(now) || event.cancelled
}

// Feature computation
export function computeEventFeatures(event: EventWithAttendees, context: FeedContext): EventFeatures {
  const now = dayjs(context.currentTime)
  const startTime = dayjs(event.startAt)
  const endTime = dayjs(event.endAt)
  
  // Availability (0-1)
  const availability = computeAvailability(event)
  
  // Affinity (0-1)
  const affinity = computeAffinity(event, context.currentUser)
  
  // Social (0-1)
  const social = computeSocial(event, context)
  
  // Time urgency (0-1) - bell curve around 24h
  const timeUrgency = computeTimeUrgency(startTime, now)
  
  // Host reputation (0-1)
  const hostReputation = computeHostReputation(event, context)
  
  // Freshness (0-1)
  const freshness = computeFreshness(event, now)
  
  // Distance inverse (0-1)
  const distanceInverse = computeDistanceInverse(event, context)
  
  // Penalties
  const lockPenalty = computeLockPenalty(event, context)
  const waitlistPenalty = computeWaitlistPenalty(event)
  
  return {
    availability,
    affinity,
    social,
    timeUrgency,
    hostReputation,
    freshness,
    distanceInverse,
    lockPenalty,
    waitlistPenalty
  }
}

function computeAvailability(event: EventWithAttendees): number {
  if (event.attendeeCount < event.maxSlots) {
    return 1.0 // Open seats
  }
  
  // Waitlist penalty
  const waitlistSize = event.waitlistCount
  if (waitlistSize === 0) return 0.0
  
  // Small boost if waitlist is short (likely to clear)
  if (waitlistSize <= 3) return 0.1
  
  return Math.max(0, 0.4 - 0.05 * (waitlistSize - 1))
}

function computeAffinity(event: EventWithAttendees, user: User): number {
  const userAffinity = user.sportsAffinity?.[event.sport]
  return userAffinity || 0.3 // Default affinity for unknown sports
}

function computeSocial(event: EventWithAttendees, context: FeedContext): number {
  const { currentUser, userConnections } = context
  
  // Friends attending
  const friendsAttending = event.attendees.filter(attendee => 
    userConnections.includes(attendee.userId)
  ).length
  
  // Is host a friend?
  const isHostFriend = userConnections.includes(event.hostId)
  
  // Group overlap (users with similar interests)
  const groupOverlap = event.attendees.filter(attendee => 
    attendee.user?.sportsAffinity?.[event.sport] && 
    attendee.user?.sportsAffinity[event.sport] > 0.7
  ).length
  
  return Math.min(1, 0.15 * friendsAttending + 0.3 * (isHostFriend ? 1 : 0) + 0.1 * groupOverlap)
}

function computeTimeUrgency(startTime: dayjs.Dayjs, now: dayjs.Dayjs): number {
  const hoursUntilStart = startTime.diff(now, 'hour', true)
  
  // Bell curve around 24 hours - peak urgency at 6-48h out
  const peakHour = 24
  const sigma = 800 // Controls curve width
  
  if (hoursUntilStart < 0) return 0 // Past events
  
  // Exponential decay: exp(-((hours-24)^2)/σ)
  const urgency = Math.exp(-Math.pow(hoursUntilStart - peakHour, 2) / sigma)
  
  // Boost for very soon events (< 6 hours)
  if (hoursUntilStart <= 6) {
    return Math.min(1, urgency + 0.3)
  }
  
  return urgency
}

function computeHostReputation(event: EventWithAttendees, context: FeedContext): number {
  const host = event.attendees.find(a => a.userId === event.hostId)?.user
  
  if (!host) return 0.5
  
  let reputation = 0.5 // Base reputation
  
  // Super host boost
  if (host.superHost) reputation += 0.3
  
  // Reliability boost
  if (host.reliability) reputation += host.reliability * 0.2
  
  // Activity level boost
  if (host.activityLevel === 'high') reputation += 0.1
  else if (host.activityLevel === 'medium') reputation += 0.05
  
  return Math.min(1, reputation)
}

function computeFreshness(event: EventWithAttendees, now: dayjs.Dayjs): number {
  const createdAt = dayjs(event.createdAt)
  const hoursSinceCreation = now.diff(createdAt, 'hour', true)
  
  if (hoursSinceCreation <= 24) {
    return 1.0 // New today
  }
  
  if (hoursSinceCreation <= 168) { // 7 days
    // Linear decay from 1 to 0 over 7 days
    return Math.max(0, 1 - (hoursSinceCreation - 24) / (168 - 24))
  }
  
  return 0.0
}

function computeDistanceInverse(event: EventWithAttendees, context: FeedContext): number {
  // Simplified distance calculation - in real app, use actual coordinates
  const userLocation = context.userLocation
  if (!userLocation) return 0.5 // Default if no location
  
  // For now, assume events in same neighborhood are closer
  const userNeighborhood = context.currentUser.location
  const eventNeighborhood = event.neighborhood
  
  if (userNeighborhood === eventNeighborhood) return 1.0
  if (userNeighborhood && eventNeighborhood && 
      userNeighborhood.includes(eventNeighborhood) || 
      eventNeighborhood.includes(userNeighborhood)) {
    return 0.8
  }
  
  return 0.3 // Different area
}

function computeLockPenalty(event: EventWithAttendees, context: FeedContext): number {
  const now = dayjs(context.currentTime)
  const startTime = dayjs(event.startAt)
  const cutoffTime = startTime.subtract(30, 'minute')
  
  // If event locks soon and user is not nearby
  if (now.isAfter(cutoffTime.subtract(30, 'minute')) && now.isBefore(cutoffTime)) {
    const distanceInverse = computeDistanceInverse(event, context)
    if (distanceInverse < 0.7) {
      return 0.05 // Penalty for events locking soon when user is far
    }
  }
  
  return 0
}

function computeWaitlistPenalty(event: EventWithAttendees): number {
  if (event.waitlistCount === 0) return 0
  
  // Small penalty for waitlisted events
  return 0.03
}

// Scoring and ranking
export function computeEventScore(event: EventWithAttendees, context: FeedContext): number {
  const features = computeEventFeatures(event, context)
  
  const score = 
    0.25 * features.availability +
    0.20 * features.affinity +
    0.18 * features.social +
    0.15 * features.timeUrgency +
    0.08 * features.hostReputation +
    0.07 * features.freshness +
    0.05 * features.distanceInverse -
    features.lockPenalty -
    features.waitlistPenalty
  
  return Math.max(0, score) // Ensure non-negative
}

export function rankEvents(events: EventWithAttendees[], context: FeedContext): EventWithAttendees[] {
  return events
    .map(event => ({
      ...event,
      _score: computeEventScore(event, context)
    }))
    .sort((a, b) => {
      // Primary: score (descending)
      if (Math.abs(b._score - a._score) > 0.001) {
        return b._score - a._score
      }
      
      // Secondary: start time (ascending)
      const aStart = dayjs(a.startAt).valueOf()
      const bStart = dayjs(b.startAt).valueOf()
      if (aStart !== bStart) {
        return aStart - bStart
      }
      
      // Tertiary: creation time (descending - newer first)
      const aCreated = dayjs(a.createdAt).valueOf()
      const bCreated = dayjs(b.createdAt).valueOf()
      return bCreated - aCreated
    })
    .map(({ _score, ...event }) => event) // Remove score from output
}

// Feed policy implementation
export function buildFeedPolicy(events: EventWithAttendees[], context: FeedContext): FeedPolicy {
  const now = dayjs(context.currentTime)
  
  // Separate events by category
  const mySchedule = events
    .filter(event => isEligibleForMySchedule(event, context.currentUser))
    .sort((a, b) => dayjs(a.startAt).valueOf() - dayjs(b.startAt).valueOf())
    .slice(0, 6) // Top 6 upcoming joined events
  
  const forYouCandidates = events.filter(event => 
    isEligibleForMainFeed(event, context.currentUser)
  )
  
  const forYou = rankEvents(forYouCandidates, context)
  
  const pastEvents = events
    .filter(isEligibleForPastEvents)
    .sort((a, b) => dayjs(b.startAt).valueOf() - dayjs(a.startAt).valueOf())
  
  // Optional sections
  const optionalSections: FeedSection[] = []
  
  // "Spots just opened" - events that had waitlist but now have open seats
  const spotsOpened = forYou.filter(event => {
    // In real app, track capacity changes over time
    // For now, show events that are nearly full but not quite
    return event.attendeeCount >= event.maxSlots * 0.8 && event.attendeeCount < event.maxSlots
  }).slice(0, 3)
  
  if (spotsOpened.length > 0) {
    optionalSections.push({
      title: "Spots just opened",
      events: spotsOpened,
      type: 'spots-opened'
    })
  }
  
  // "From your hosts" - events by super hosts or close friends
  const fromHosts = forYou.filter(event => {
    const host = event.attendees.find(a => a.userId === event.hostId)?.user
    return host?.superHost || context.userConnections.includes(event.hostId)
  }).slice(0, 3)
  
  if (fromHosts.length > 0) {
    optionalSections.push({
      title: "From your hosts",
      events: fromHosts,
      type: 'from-hosts'
    })
  }
  
  // "New today" - events created in last 24h
  const newToday = forYou.filter(event => {
    const createdAt = dayjs(event.createdAt)
    return now.diff(createdAt, 'hour') <= 24
  }).slice(0, 3)
  
  if (newToday.length > 0) {
    optionalSections.push({
      title: "New today",
      events: newToday,
      type: 'new-today'
    })
  }
  
  return {
    mySchedule,
    forYou,
    optionalSections,
    pastEvents
  }
}

// Progressive filter relaxation for sparse feeds
export function relaxFilters(events: EventWithAttendees[], context: FeedContext): EventWithAttendees[] {
  const baseEligible = events.filter(event => 
    isEligibleForMainFeed(event, context.currentUser)
  )
  
  if (baseEligible.length >= 10) {
    return baseEligible // Sufficient content
  }
  
  // Relax time filter (include events 30-45 days out)
  const relaxedTime = events.filter(event => {
    const now = dayjs(context.currentTime)
    const startTime = dayjs(event.startAt)
    return event.status === 'confirmed' && 
           !event.currentUserAttendee && 
           !event.currentUserWaitlist &&
           !event.cancelled &&
           startTime.isAfter(now.subtract(10, 'minute')) && 
           startTime.isBefore(now.add(45, 'days'))
  })
  
  if (relaxedTime.length >= 10) {
    return relaxedTime
  }
  
  // Include waitlisted events
  const withWaitlist = events.filter(event => {
    const now = dayjs(context.currentTime)
    const startTime = dayjs(event.startAt)
    return event.status === 'confirmed' && 
           !event.currentUserAttendee && 
           !event.currentUserWaitlist &&
           !event.cancelled &&
           startTime.isAfter(now.subtract(10, 'minute')) && 
           startTime.isBefore(now.add(45, 'days'))
  })
  
  return withWaitlist
}

// Helper functions for UI
export function getEventReason(event: EventWithAttendees, context: FeedContext): string {
  const reasons: string[] = []
  
  // Friends attending
  const friendsCount = event.attendees.filter(attendee => 
    context.userConnections.includes(attendee.userId)
  ).length
  
  if (friendsCount > 0) {
    reasons.push(`${friendsCount} friend${friendsCount > 1 ? 's' : ''} are in`)
  }
  
  // Time
  const startTime = dayjs(event.startAt)
  const now = dayjs(context.currentTime)
  const daysUntil = startTime.diff(now, 'day')
  
  if (daysUntil === 0) {
    reasons.push(`Today ${startTime.format('h:mm a')}`)
  } else if (daysUntil === 1) {
    reasons.push(`Tomorrow ${startTime.format('h:mm a')}`)
  } else {
    reasons.push(startTime.format('ddd h:mm a'))
  }
  
  // Availability
  if (event.attendeeCount < event.maxSlots) {
    reasons.push('Seats open')
  } else if (event.waitlistCount > 0) {
    reasons.push('Waitlist available')
  }
  
  // Distance
  const distanceInverse = computeDistanceInverse(event, context)
  if (distanceInverse > 0.8) {
    reasons.push('Near you')
  }
  
  return reasons.slice(0, 2).join(' • ')
}

export function isNewEvent(event: EventWithAttendees, context: FeedContext): boolean {
  const createdAt = dayjs(event.createdAt)
  const now = dayjs(context.currentTime)
  return now.diff(createdAt, 'hour') <= 24
}

export function hasSpotsOpened(event: EventWithAttendees): boolean {
  // In real app, track capacity changes over time
  // For now, return false - implement with real-time updates
  return false
}
