export interface User {
  id: string
  displayName: string
  avatarUrl?: string
  email: string
  createdAt: Date
}

export interface Connection {
  userAId: string
  userBId: string
  createdAt: Date
}

export interface Event {
  id: string
  title: string
  description?: string
  startTime: string         // Keep for backward compatibility
  startAt?: string         // New: ISO 8601 UTC timestamp (primary)
  endAt?: string           // New: ISO 8601 UTC timestamp  
  endTime?: string         // Keep for backward compatibility
  durationMinutes?: number // Used if endAt is absent
  tz?: string             // IANA timezone (e.g., "America/New_York")
  location: string
  maxSlots: number
  attendeeCount: number
  waitlistCount: number
  status: EventStatus
  visibility: EventVisibility
  createdBy: string
  createdAt: Date
  updatedAt: Date
  cutoffMinutes?: number
  cancelled?: boolean      // New: Manual cancellation flag
  attendees: Array<{ userId: string; user?: User }>
  currentUserAttendee?: any
  currentUserWaitlist?: any
}

export type EventStatus = 'pending' | 'confirmed' | 'cancelled'
export type EventVisibility = 'public' | 'invite_auto' | 'invite_manual'

export interface EventAttendee {
  id: string // userId
  userId: string
  eventId: string
  joinedAt: Date
  status: 'confirmed' | 'waitlist'
}

export interface EventWaitlist {
  id: string
  userId: string
  eventId: string
  joinedAt: Date
  position: number
}

export interface Invite {
  id: string
  eventId: string
  invitedUserId?: string
  tokenHash?: string
  expiresAt: Date
  status: 'pending' | 'accepted' | 'declined'
  createdAt: Date
  updatedAt: Date
}

export interface EventRequest {
  id: string
  eventId: string
  userId: string
  requestedAt: Date
  status: 'pending' | 'accepted' | 'rejected'
  acceptedAt?: Date
}

// Unified Membership Model (Production-Ready)
export interface EventMembership {
  id: string
  eventId: string
  userId: string
  status: 'none' | 'requested' | 'attending' | 'waitlisted' | 'blocked'
  requestedAt?: Date
  joinedAt?: Date
  waitlistedAt?: Date
  waitlistOrder?: number
  user?: User
}

export type MembershipStatus = EventMembership['status']

export interface EventWithAttendees extends Event {
  waitlist: EventWaitlist[]
  requests: EventRequest[]
  memberships: EventMembership[] // Unified membership data
  currentUserMembership?: EventMembership // Single source of truth
  currentUserAttendee?: EventAttendee
  currentUserWaitlist?: EventWaitlist
  currentUserRequest?: EventRequest
}

export interface CreateEventData {
  title: string
  description?: string
  datetimeISO: string
  timezone: string
  location: string
  maxSlots: number
  visibility: 'public' | 'invite-only'
  cutoffMinutes?: number
}

export interface UpdateEventData extends Partial<CreateEventData> {
  id: string
}

