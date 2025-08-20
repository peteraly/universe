import { EventWithAttendees } from '../types'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
import isBetween from 'dayjs/plugin/isBetween'

dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.extend(isBetween)

// Filter types based on the blueprint
export interface QuickFilters {
  openSeats: boolean
  nearMe: boolean
  tonight: boolean
  thisWeekend: boolean
  friendsAttending: boolean
  mySports: boolean
  waitlistOnly: boolean
}

export interface AdvancedFilters {
  sports: string[]
  visibility: ('public' | 'invite_auto' | 'invite_manual')[]
  skillLevel: ('beginner' | 'casual' | 'competitive')[]
  indoorOutdoor: ('indoor' | 'outdoor')[]
  equipment: string[]
  ageRange: [number, number] | null
  maxDistance: number | null
  timeWindow: {
    startDate?: Date
    endDate?: Date
    timeOfDay?: [number, number] // 24-hour format [start, end]
  }
}

export interface FilterState {
  quick: QuickFilters
  advanced: AdvancedFilters
}

export const DEFAULT_QUICK_FILTERS: QuickFilters = {
  openSeats: true, // ON by default
  nearMe: false,
  tonight: false,
  thisWeekend: false,
  friendsAttending: false,
  mySports: false,
  waitlistOnly: false // OFF by default
}

export const DEFAULT_ADVANCED_FILTERS: AdvancedFilters = {
  sports: [],
  visibility: ['public'],
  skillLevel: [],
  indoorOutdoor: [],
  equipment: [],
  ageRange: null,
  maxDistance: null,
  timeWindow: {}
}

export const DEFAULT_FILTER_STATE: FilterState = {
  quick: DEFAULT_QUICK_FILTERS,
  advanced: DEFAULT_ADVANCED_FILTERS
}

// Sports categories for filtering
export const SPORTS_CATEGORIES = [
  'Basketball',
  'Soccer',
  'Tennis',
  'Running',
  'Cycling',
  'Yoga',
  'Fitness',
  'Swimming',
  'Volleyball',
  'Board Games',
  'Food & Drink',
  'Creative',
  'Education',
  'Music',
  'Photography',
  'Social'
] as const

export const SKILL_LEVELS = [
  'beginner',
  'casual', 
  'competitive'
] as const

// User context for filtering
export interface FilterContext {
  currentUser?: any
  userLocation?: { lat: number; lng: number }
  userSports?: string[]
  userConnections?: string[]
  userTimezone?: string
}

/**
 * Main filtering function - applies all active filters to events
 */
export function filterEvents(
  events: EventWithAttendees[],
  filters: FilterState,
  context: FilterContext = {}
): EventWithAttendees[] {
  let filteredEvents = events

  // Apply quick filters
  filteredEvents = applyQuickFilters(filteredEvents, filters.quick, context)
  
  // Apply advanced filters
  filteredEvents = applyAdvancedFilters(filteredEvents, filters.advanced, context)

  return filteredEvents
}

/**
 * Apply quick filters (MVP chips)
 */
function applyQuickFilters(
  events: EventWithAttendees[],
  filters: QuickFilters,
  context: FilterContext
): EventWithAttendees[] {
  return events.filter(event => {
    // Open seats filter (default ON)
    if (filters.openSeats && !hasOpenSeats(event)) {
      return false
    }

    // Waitlist only filter (OFF by default)
    if (filters.waitlistOnly && hasOpenSeats(event)) {
      return false // Only show full events when waitlist filter is on
    }

    // Near me filter (geo proximity)
    if (filters.nearMe && !isNearUser(event, context)) {
      return false
    }

    // Tonight filter
    if (filters.tonight && !isTonight(event, context.userTimezone)) {
      return false
    }

    // This weekend filter
    if (filters.thisWeekend && !isThisWeekend(event, context.userTimezone)) {
      return false
    }

    // Friends attending filter
    if (filters.friendsAttending && !hasFriendsAttending(event, context)) {
      return false
    }

    // My sports filter
    if (filters.mySports && !isUserSport(event, context)) {
      return false
    }

    return true
  })
}

/**
 * Apply advanced filters (bottom sheet)
 */
function applyAdvancedFilters(
  events: EventWithAttendees[],
  filters: AdvancedFilters,
  context: FilterContext
): EventWithAttendees[] {
  return events.filter(event => {
    // Sports filter (OR within facet)
    if (filters.sports.length > 0 && !filters.sports.includes(getEventSport(event))) {
      return false
    }

    // Visibility filter
    if (filters.visibility.length > 0 && !filters.visibility.includes(event.visibility)) {
      return false
    }

    // Distance filter
    if (filters.maxDistance !== null && !isWithinDistance(event, context, filters.maxDistance)) {
      return false
    }

    // Time window filter
    if (!isWithinTimeWindow(event, filters.timeWindow, context.userTimezone)) {
      return false
    }

    return true
  })
}

/**
 * Helper functions for filter logic
 */

function hasOpenSeats(event: EventWithAttendees): boolean {
  return event.attendeeCount < event.maxSlots
}

function isNearUser(event: EventWithAttendees, context: FilterContext): boolean {
  if (!context.userLocation) return false
  
  // Mock implementation - in real app, use geolocation/geohashing
  
  // For demo, consider events in same "area" as nearby
  // Real implementation would use lat/lng distance calculation
  const eventLocation = event.location.toLowerCase()
  const nearbyLocations = ['central park', 'manhattan', 'brooklyn', 'queens']
  
  return nearbyLocations.some(location => eventLocation.includes(location))
}

function isTonight(event: EventWithAttendees, userTimezone = 'America/New_York'): boolean {
  const now = dayjs().tz(userTimezone)
  const eventStart = dayjs(event.startAt || event.startTime).tz(userTimezone)
  
  // Tonight = 17:00–24:00 in user TZ today
  const tonightStart = now.hour(17).minute(0).second(0)
  const tonightEnd = now.hour(23).minute(59).second(59)
  
  return eventStart.isBetween(tonightStart, tonightEnd, null, '[]')
}

function isThisWeekend(event: EventWithAttendees, userTimezone = 'America/New_York'): boolean {
  const now = dayjs().tz(userTimezone)
  const eventStart = dayjs(event.startAt || event.startTime).tz(userTimezone)
  
  // This weekend = Sat 00:00 → Sun 23:59
  const saturdayStart = now.day(6).hour(0).minute(0).second(0) // Saturday
  const sundayEnd = now.day(7).hour(23).minute(59).second(59) // Sunday
  
  return eventStart.isBetween(saturdayStart, sundayEnd, null, '[]')
}

function hasFriendsAttending(event: EventWithAttendees, context: FilterContext): boolean {
  if (!context.userConnections || !context.currentUser) return false
  
  return event.attendees.some(attendee => 
    attendee.userId !== context.currentUser.id && 
    context.userConnections!.includes(attendee.userId)
  )
}

function isUserSport(event: EventWithAttendees, context: FilterContext): boolean {
  if (!context.userSports) return false
  
  const eventSport = getEventSport(event)
  return context.userSports.includes(eventSport)
}

function getEventSport(event: EventWithAttendees): string {
  // Map event category to standardized sport
  const categoryMap: Record<string, string> = {
    'Games': 'Board Games',
    'Fitness': 'Fitness',
    'Food & Drink': 'Food & Drink',
    'Creative': 'Creative',
    'Education': 'Education',
    'Music': 'Music',
    'Social': 'Social'
  }
  
  return categoryMap[(event as any).category] || 'Social'
}

function isWithinDistance(
  _event: EventWithAttendees, 
  context: FilterContext, 
  maxDistanceKm: number
): boolean {
  if (!context.userLocation) return true
  
  // Mock implementation - in real app, calculate actual distance
  // For demo, always return true within reasonable distance
  return maxDistanceKm >= 5 // Assume all demo events are within 5km
}

function isWithinTimeWindow(
  event: EventWithAttendees,
  timeWindow: AdvancedFilters['timeWindow'],
  userTimezone = 'America/New_York'
): boolean {
  const eventStart = dayjs(event.startAt || event.startTime).tz(userTimezone)
  
  // Date range filter
  if (timeWindow.startDate && eventStart.isBefore(dayjs(timeWindow.startDate))) {
    return false
  }
  
  if (timeWindow.endDate && eventStart.isAfter(dayjs(timeWindow.endDate))) {
    return false
  }
  
  // Time of day filter
  if (timeWindow.timeOfDay) {
    const [startHour, endHour] = timeWindow.timeOfDay
    const eventHour = eventStart.hour()
    
    if (eventHour < startHour || eventHour > endHour) {
      return false
    }
  }
  
  return true
}

/**
 * Sort events with smart ranking (starts soon → closer → friends attending)
 */
export function sortEvents(
  events: EventWithAttendees[],
  context: FilterContext = {}
): EventWithAttendees[] {
  return events.sort((a, b) => {
    const now = dayjs()
    
    // 1. Priority: Starts soon (within 2 hours gets boost)
    const aStartsIn = dayjs(a.startAt || a.startTime).diff(now, 'hour')
    const bStartsIn = dayjs(b.startAt || b.startTime).diff(now, 'hour')
    
    const aStartsSoon = aStartsIn <= 2 && aStartsIn >= 0
    const bStartsSoon = bStartsIn <= 2 && bStartsIn >= 0
    
    if (aStartsSoon && !bStartsSoon) return -1
    if (!aStartsSoon && bStartsSoon) return 1
    
    // 2. Priority: Friends attending
    const aHasFriends = hasFriendsAttending(a, context)
    const bHasFriends = hasFriendsAttending(b, context)
    
    if (aHasFriends && !bHasFriends) return -1
    if (!aHasFriends && bHasFriends) return 1
    
    // 3. Priority: Closer to user (mock implementation)
    const aIsNear = isNearUser(a, context)
    const bIsNear = isNearUser(b, context)
    
    if (aIsNear && !bIsNear) return -1
    if (!aIsNear && bIsNear) return 1
    
    // 4. Finally: Sort by start time (earliest first)
    return dayjs(a.startAt || a.startTime).diff(dayjs(b.startAt || b.startTime))
  })
}

/**
 * Get active filter count for UI badge
 */
export function getActiveFilterCount(filters: FilterState): number {
  let count = 0
  
  // Count quick filters (exclude openSeats since it's default ON)
  Object.entries(filters.quick).forEach(([key, value]) => {
    if (key !== 'openSeats' && value) count++
  })
  
  // If openSeats is OFF (non-default), count it
  if (!filters.quick.openSeats) count++
  
  // Count advanced filters
  if (filters.advanced.sports.length > 0) count++
  if (filters.advanced.visibility.length > 1) count++ // More than just public
  if (filters.advanced.maxDistance !== null) count++
  if (filters.advanced.timeWindow.startDate || filters.advanced.timeWindow.endDate) count++
  if (filters.advanced.timeWindow.timeOfDay) count++
  
  return count
}

/**
 * Clear all filters to defaults
 */
export function clearAllFilters(): FilterState {
  return {
    quick: { ...DEFAULT_QUICK_FILTERS },
    advanced: { ...DEFAULT_ADVANCED_FILTERS }
  }
}

/**
 * URL params for shareable filters
 */
export function filtersToURLParams(filters: FilterState): URLSearchParams {
  const params = new URLSearchParams()
  
  // Quick filters
  Object.entries(filters.quick).forEach(([key, value]) => {
    if (value && key !== 'openSeats') {
      params.append('quick', key)
    }
  })
  
  if (!filters.quick.openSeats) {
    params.append('waitlist', '1')
  }
  
  // Advanced filters
  if (filters.advanced.sports.length > 0) {
    params.append('sports', filters.advanced.sports.join(','))
  }
  
  if (filters.advanced.maxDistance) {
    params.append('distance', filters.advanced.maxDistance.toString())
  }
  
  return params
}

export function urlParamsToFilters(params: URLSearchParams): FilterState {
  const filters = clearAllFilters()
  
  // Parse quick filters
  const quickParams = params.getAll('quick')
  quickParams.forEach(param => {
    if (param in filters.quick) {
      ;(filters.quick as any)[param] = true
    }
  })
  
  // Parse waitlist (inverse of openSeats)
  if (params.get('waitlist') === '1') {
    filters.quick.openSeats = false
    filters.quick.waitlistOnly = true
  }
  
  // Parse sports
  const sportsParam = params.get('sports')
  if (sportsParam) {
    filters.advanced.sports = sportsParam.split(',')
  }
  
  // Parse distance
  const distanceParam = params.get('distance')
  if (distanceParam) {
    filters.advanced.maxDistance = parseInt(distanceParam, 10)
  }
  
  return filters
}
