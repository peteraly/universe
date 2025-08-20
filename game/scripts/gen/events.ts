// Events Generator - Creates realistic events with temporal distribution

import { 
  SPORTS_CONFIG, 
  EVENT_TITLE_TEMPLATES, 
  TIME_DISTRIBUTIONS,
  SeedScale, 
  GenerationParams,
  SportConfig 
} from '../seed.config'
import { GeneratedUser, SeededRandom } from './users'
import { 
  EventCore, 
  MembershipCore, 
  EventVisibility, 
  EventStatus,
  TemporalStatus,
  deriveEventStatus, 
  deriveTemporalStatus,
  generateEventId,
  generateMembershipId,
  calculateWaitlistPosition,
  canUserJoinEvent,
  EventTime
} from '../../src/lib/status'

export interface GeneratedEvent extends EventCore {
  description: string
  equipment: string[]
  skillLevel: 'beginner' | 'casual' | 'competitive'
  isRecurring: boolean
}

export interface GeneratedMembership extends MembershipCore {
  userName: string
  eventTitle: string
}

export interface GeneratedInvite {
  id: string
  eventId: string
  userId: string
  invitedBy: string
  createdAt: string
  status: 'pending' | 'accepted' | 'declined'
}

export interface GeneratedRequest {
  id: string
  eventId: string
  userId: string
  requestedAt: string
  status: 'pending' | 'accepted' | 'rejected'
  reviewedBy?: string
  reviewedAt?: string
}

export class EventGenerator {
  private rng: SeededRandom
  private scale: SeedScale
  private params: GenerationParams
  private users: GeneratedUser[]
  private currentTime: Date

  constructor(seed: number, scale: SeedScale, params: GenerationParams, users: GeneratedUser[]) {
    this.rng = new SeededRandom(seed + 1000) // Offset seed for events
    this.scale = scale
    this.params = params
    this.users = users
    this.currentTime = new Date()
  }

  // Generate all events with memberships
  generateEventsAndMemberships(): {
    events: GeneratedEvent[]
    memberships: GeneratedMembership[]
    invites: GeneratedInvite[]
    requests: GeneratedRequest[]
  } {
    console.log(`Generating ${this.scale.events} events...`)
    
    const events: GeneratedEvent[] = []
    const memberships: GeneratedMembership[] = []
    const invites: GeneratedInvite[] = []
    const requests: GeneratedRequest[] = []
    
    // Generate host distribution (super-hosts create more events)
    const hostDistribution = this.generateHostDistribution()
    
    let eventCount = 0
    for (const [hostId, numEvents] of hostDistribution) {
      const host = this.users.find(u => u.id === hostId)!
      
      for (let i = 0; i < numEvents; i++) {
        if (eventCount >= this.scale.events) break
        
        const event = this.generateEvent(host, eventCount)
        events.push(event)
        
        // Generate memberships for this event
        const eventMemberships = this.generateEventMemberships(event, host)
        memberships.push(...eventMemberships)
        
        // Generate invites for invite_auto events
        if (event.visibility === EventVisibility.INVITE_AUTO) {
          const eventInvites = this.generateEventInvites(event, host)
          invites.push(...eventInvites)
        }
        
        // Generate requests for invite_manual events
        if (event.visibility === EventVisibility.INVITE_MANUAL) {
          const eventRequests = this.generateEventRequests(event, host)
          requests.push(...eventRequests)
        }
        
        eventCount++
        
        if (eventCount % 100 === 0) {
          console.log(`Generated ${eventCount}/${this.scale.events} events`)
        }
      }
      
      if (eventCount >= this.scale.events) break
    }
    
    console.log(`✓ Generated ${events.length} events, ${memberships.length} memberships`)
    console.log(`✓ Generated ${invites.length} invites, ${requests.length} requests`)
    
    return { events, memberships, invites, requests }
  }

  // Generate host distribution based on super-host logic
  private generateHostDistribution(): Map<string, number> {
    const distribution = new Map<string, number>()
    const totalEvents = this.scale.events
    
    // Separate super-hosts from regular hosts
    const superHosts = this.users.filter(u => u.isSuperHost)
    const regularHosts = this.users.filter(u => !u.isSuperHost)
    
    // Calculate events per super-host
    const superHostEvents = Math.floor(
      totalEvents * 0.6 / superHosts.length // Super-hosts create 60% of events
    )
    
    // Calculate events per regular host
    const remainingEvents = totalEvents - (superHosts.length * superHostEvents)
    const regularHostEvents = Math.max(1, Math.floor(
      remainingEvents / (regularHosts.length * 0.4) // 40% of regular users host
    ))
    
    // Assign events to super-hosts
    for (const host of superHosts) {
      const variance = this.rng.nextInt(-2, 3) // ±2 variance
      distribution.set(host.id, Math.max(1, superHostEvents + variance))
    }
    
    // Assign events to some regular hosts (weighted by reliability and friends)
    const hostCandidates = regularHosts
      .map(user => ({
        user,
        weight: user.reliability * 0.7 + (user.friends.length / 20) * 0.3
      }))
      .sort((a, b) => b.weight - a.weight)
    
    const numRegularHosts = Math.floor(regularHosts.length * 0.4)
    for (let i = 0; i < numRegularHosts && i < hostCandidates.length; i++) {
      const candidate = hostCandidates[i]
      const variance = this.rng.nextInt(0, 2) // 0-2 variance
      distribution.set(candidate.user.id, Math.max(1, regularHostEvents + variance))
    }
    
    return distribution
  }

  // Generate single event
  private generateEvent(host: GeneratedUser, index: number): GeneratedEvent {
    const timestamp = this.currentTime.getTime() + index
    
    // Choose sport based on host's affinity
    const sport = this.chooseEventSport(host)
    const sportConfig = SPORTS_CONFIG.find(s => s.name === sport)!
    
    // Generate event ID
    const id = generateEventId(host.id, timestamp, sport)
    
    // Generate title
    const titleTemplate = this.rng.choice(EVENT_TITLE_TEMPLATES)
    const title = titleTemplate.replace('{sport}', sport)
    
    // Generate time (past or future based on ratio)
    const isPastEvent = this.rng.next() < this.params.pastEventDays / (this.params.pastEventDays + this.params.futureEventDays)
    const eventTime = this.generateEventTime(isPastEvent, sportConfig)
    
    // Generate capacity
    const capacityVariation = 1 + (this.rng.next() - 0.5) * this.params.capacityVariation
    const maxSlots = Math.max(2, Math.floor(sportConfig.avgCapacity * capacityVariation))
    
    // Generate visibility
    const visibility = this.generateVisibility()
    
    // Generate location
    const location = this.generateEventLocation(host, sportConfig)
    
    // Generate other attributes
    const description = this.generateDescription(sport, sportConfig)
    const equipment = [...sportConfig.equipment]
    const skillLevel = this.rng.choice(['beginner', 'casual', 'competitive'] as const)
    const isRecurring = this.rng.next() < 0.2 // 20% recurring events
    
    return {
      id,
      title,
      hostId: host.id,
      sport,
      maxSlots,
      attendeeCount: 0, // Will be set when generating memberships
      waitlistCount: 0, // Will be set when generating memberships
      visibility,
      status: EventStatus.PENDING, // Will be derived later
      createdAt: this.generateCreatedAt(eventTime.startAt),
      location,
      time: eventTime,
      description,
      equipment,
      skillLevel,
      isRecurring
    }
  }

  // Choose sport based on host's affinity
  private chooseEventSport(host: GeneratedUser): string {
    const sportsWithAffinity = Object.entries(host.sportsAffinity)
      .filter(([, affinity]) => affinity > 0.3) // Only sports with decent affinity
      .sort(([, a], [, b]) => b - a) // Sort by affinity
    
    if (sportsWithAffinity.length === 0) {
      // Fallback to popular sports
      const weights = SPORTS_CONFIG.map(s => s.popularity)
      return this.rng.weighted(SPORTS_CONFIG, weights).name
    }
    
    // 80% chance of choosing from top 2 affinities, 20% from others
    if (this.rng.next() < 0.8 && sportsWithAffinity.length >= 2) {
      return this.rng.choice(sportsWithAffinity.slice(0, 2))[0]
    } else {
      return this.rng.choice(sportsWithAffinity)[0]
    }
  }

  // Generate event time with realistic distribution
  private generateEventTime(isPast: boolean, sportConfig: SportConfig): EventTime {
    let eventDate: Date
    
    if (isPast) {
      const daysAgo = this.rng.nextInt(1, this.params.pastEventDays)
      eventDate = new Date(this.currentTime)
      eventDate.setDate(eventDate.getDate() - daysAgo)
    } else {
      const daysFromNow = this.rng.nextInt(1, this.params.futureEventDays)
      eventDate = new Date(this.currentTime)
      eventDate.setDate(eventDate.getDate() + daysFromNow)
    }
    
    // Choose hour based on time distribution
    const timeWeights = TIME_DISTRIBUTIONS.map(td => {
      const dayOfWeek = eventDate.getDay()
      return td.weight * td.dayWeights[dayOfWeek]
    })
    const timeSlot = this.rng.weighted(TIME_DISTRIBUTIONS, timeWeights)
    
    eventDate.setHours(timeSlot.hour, 0, 0, 0)
    
    // Calculate end time
    const endDate = new Date(eventDate)
    endDate.setMinutes(endDate.getMinutes() + sportConfig.avgDuration)
    
    return {
      startAt: eventDate.toISOString(),
      tz: 'America/New_York',
      endAt: endDate.toISOString(),
      durationMinutes: sportConfig.avgDuration,
      cutoffMinutes: 30
    }
  }

  // Generate event visibility
  private generateVisibility(): EventVisibility {
    const rand = this.rng.next()
    
    if (rand < this.params.publicEventRate) {
      return EventVisibility.PUBLIC
    } else if (rand < this.params.publicEventRate + this.params.inviteAutoRate) {
      return EventVisibility.INVITE_AUTO
    } else {
      return EventVisibility.INVITE_MANUAL
    }
  }

  // Generate event location near host
  private generateEventLocation(host: GeneratedUser, sportConfig: SportConfig): string {
    const venue = this.rng.choice(sportConfig.venues)
    const area = host.location.cluster
    return `${venue}, ${area}`
  }

  // Generate event description
  private generateDescription(sport: string, sportConfig: SportConfig): string {
    const templates = [
      `Join us for a fun ${sport.toLowerCase()} session! All skill levels welcome.`,
      `Looking for players for ${sport.toLowerCase()}. Come ready to play!`,
      `Weekly ${sport.toLowerCase()} meetup. Bring your ${sportConfig.equipment[0] || 'gear'}!`,
      `Casual ${sport.toLowerCase()} game. Great way to meet new people and stay active.`,
      `${sport} practice session. Perfect for improving your skills!`
    ]
    
    return this.rng.choice(templates)
  }

  // Generate created at timestamp
  private generateCreatedAt(startAt: string): string {
    const startDate = new Date(startAt)
    const createdDate = new Date(startDate)
    
    // Created 1-14 days before event
    const daysBeforeEvent = this.rng.nextInt(1, 14)
    createdDate.setDate(createdDate.getDate() - daysBeforeEvent)
    
    return createdDate.toISOString()
  }

  // Generate memberships for an event
  private generateEventMemberships(event: GeneratedEvent, host: GeneratedUser): GeneratedMembership[] {
    const memberships: GeneratedMembership[] = []
    
    // Host is always attending
    const hostMembership: GeneratedMembership = {
      userId: host.id,
      eventId: event.id,
      status: 'attending',
      joinedAt: event.createdAt,
      userName: host.name,
      eventTitle: event.title
    }
    memberships.push(hostMembership)
    
    // Determine if event should be filled
    const shouldFill = this.rng.next() < this.params.attendanceRate
    
    if (!shouldFill) {
      // Low attendance event
      const attendeeCount = this.rng.nextInt(1, Math.max(1, Math.floor(event.maxSlots * 0.4)))
      this.addEventAttendees(event, host, attendeeCount - 1, memberships) // -1 for host
    } else {
      // Well-attended event
      const attendeeCount = this.rng.nextInt(
        Math.max(1, Math.floor(event.maxSlots * 0.7)),
        event.maxSlots
      )
      this.addEventAttendees(event, host, attendeeCount - 1, memberships) // -1 for host
      
      // Add waitlist if full and allowed
      if (attendeeCount >= event.maxSlots && this.rng.next() < this.params.waitlistRate) {
        const waitlistCount = this.rng.nextInt(1, 5)
        this.addEventWaitlist(event, host, waitlistCount, memberships)
      }
    }
    
    // Update event counts
    event.attendeeCount = memberships.filter(m => m.status === 'attending').length
    event.waitlistCount = memberships.filter(m => m.status === 'waitlisted').length
    
    // Derive final event status
    const temporalStatus = deriveTemporalStatus(event.time, this.currentTime)
    event.status = deriveEventStatus(event.attendeeCount, event.maxSlots, false, temporalStatus)
    
    return memberships
  }

  // Add attendees to event
  private addEventAttendees(
    event: GeneratedEvent, 
    host: GeneratedUser, 
    count: number, 
    memberships: GeneratedMembership[]
  ): void {
    const candidates = this.getEventCandidates(event, host)
    const attendees = candidates.slice(0, Math.min(count, candidates.length))
    
    for (const candidate of attendees) {
      const joinedAt = this.generateJoinTime(event.createdAt, event.time.startAt)
      
      memberships.push({
        userId: candidate.id,
        eventId: event.id,
        status: 'attending',
        joinedAt,
        userName: candidate.name,
        eventTitle: event.title
      })
    }
  }

  // Add waitlist to event
  private addEventWaitlist(
    event: GeneratedEvent, 
    host: GeneratedUser, 
    count: number, 
    memberships: GeneratedMembership[]
  ): void {
    const existingUserIds = new Set(memberships.map(m => m.userId))
    const candidates = this.getEventCandidates(event, host)
      .filter(u => !existingUserIds.has(u.id))
    
    const waitlistUsers = candidates.slice(0, Math.min(count, candidates.length))
    
    for (let i = 0; i < waitlistUsers.length; i++) {
      const user = waitlistUsers[i]
      const joinedAt = this.generateJoinTime(event.createdAt, event.time.startAt)
      
      memberships.push({
        userId: user.id,
        eventId: event.id,
        status: 'waitlisted',
        joinedAt,
        waitlistPosition: i + 1,
        userName: user.name,
        eventTitle: event.title
      })
    }
  }

  // Get potential attendees for an event
  private getEventCandidates(event: GeneratedEvent, host: GeneratedUser): GeneratedUser[] {
    let candidates = this.users.filter(u => u.id !== host.id)
    
    // Filter by sport affinity and location proximity
    candidates = candidates
      .map(user => ({
        user,
        score: this.calculateUserEventScore(user, event, host)
      }))
      .filter(({ score }) => score > 0.1) // Minimum interest threshold
      .sort((a, b) => b.score - a.score)
      .map(({ user }) => user)
    
    return candidates
  }

  // Calculate how likely a user is to join an event
  private calculateUserEventScore(user: GeneratedUser, event: GeneratedEvent, host: GeneratedUser): number {
    let score = 0
    
    // Sport affinity (40%)
    const sportAffinity = user.sportsAffinity[event.sport] || 0
    score += sportAffinity * 0.4
    
    // Friend connection (30%)
    const isFriend = user.friends.includes(host.id)
    if (isFriend) {
      score += 0.3
    } else {
      // Mutual friends bonus
      const mutualFriends = user.friends.filter(f => host.friends.includes(f)).length
      score += Math.min(0.15, mutualFriends * 0.05)
    }
    
    // Location proximity (20%)
    const sameCluster = user.location.cluster === host.location.cluster
    score += sameCluster ? 0.2 : 0.05
    
    // Reliability (10%)
    score += user.reliability * 0.1
    
    return Math.min(1, score)
  }

  // Generate join time between event creation and start
  private generateJoinTime(createdAt: string, startAt: string): string {
    const createdDate = new Date(createdAt)
    const startDate = new Date(startAt)
    
    const timeDiff = startDate.getTime() - createdDate.getTime()
    const randomOffset = this.rng.next() * timeDiff
    
    const joinDate = new Date(createdDate.getTime() + randomOffset)
    return joinDate.toISOString()
  }

  // Generate invites for invite_auto events
  private generateEventInvites(event: GeneratedEvent, host: GeneratedUser): GeneratedInvite[] {
    const invites: GeneratedInvite[] = []
    
    // Invite host's friends and some others
    const inviteeCandidates = [
      ...host.friends.map(friendId => this.users.find(u => u.id === friendId)!),
      ...this.users
        .filter(u => u.id !== host.id && !host.friends.includes(u.id))
        .sort(() => this.rng.next() - 0.5)
        .slice(0, 10) // Random selection of non-friends
    ]
    
    const numInvites = Math.min(
      this.rng.nextInt(5, 20),
      inviteeCandidates.length
    )
    
    for (let i = 0; i < numInvites; i++) {
      const invitee = inviteeCandidates[i]
      if (!invitee) continue
      
      const inviteId = `inv_${event.id}_${invitee.id}`
      const status = this.rng.next() < 0.8 ? 'accepted' : 'pending'
      
      invites.push({
        id: inviteId,
        eventId: event.id,
        userId: invitee.id,
        invitedBy: host.id,
        createdAt: this.generateJoinTime(event.createdAt, event.time.startAt),
        status
      })
    }
    
    return invites
  }

  // Generate requests for invite_manual events
  private generateEventRequests(event: GeneratedEvent, host: GeneratedUser): GeneratedRequest[] {
    const requests: GeneratedRequest[] = []
    
    // Generate requests from interested users
    const requestCandidates = this.getEventCandidates(event, host)
      .slice(0, this.rng.nextInt(3, 12)) // 3-12 requests
    
    for (const candidate of requestCandidates) {
      if (this.rng.next() < this.params.requestRate) {
        const requestId = `req_${event.id}_${candidate.id}`
        const requestedAt = this.generateJoinTime(event.createdAt, event.time.startAt)
        
        // 70% chance request is reviewed
        let status: 'pending' | 'accepted' | 'rejected' = 'pending'
        let reviewedBy: string | undefined
        let reviewedAt: string | undefined
        
        if (this.rng.next() < 0.7) {
          status = this.rng.next() < 0.6 ? 'accepted' : 'rejected'
          reviewedBy = host.id
          reviewedAt = this.generateJoinTime(requestedAt, event.time.startAt)
        }
        
        requests.push({
          id: requestId,
          eventId: event.id,
          userId: candidate.id,
          requestedAt,
          status,
          reviewedBy,
          reviewedAt
        })
      }
    }
    
    return requests
  }
}
