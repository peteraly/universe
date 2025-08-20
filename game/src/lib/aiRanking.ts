import { Event, User } from '../types'
import dayjs from 'dayjs'

// AI-First Ranking System for GameOn
// Phase 1: Heuristic ranker that provides immediate value

export interface RankingSignals {
  // User preferences (learned from behavior)
  sportAffinity: Record<string, number> // sport -> affinity score (0-1)
  distanceTolerance: number // km
  activeTimeWindows: Array<{ dow: number; startHour: number; endHour: number }>
  socialWeight: number // how much friends attending matters (0-1)
  urgencyPreference: number // preference for events filling up vs stable events (0-1)
}

export interface EventScore {
  eventId: string
  score: number
  reasons: string[] // "Because..." explanations
  confidence: number
}

export interface RankingContext {
  userLocation?: { lat: number; lng: number }
  currentTime: Date
  userConnections: string[] // friend user IDs
}

// Core AI ranking function - this IS the AI-first value
export function rankEventsForUser(
  events: Event[],
  user: User,
  signals: RankingSignals,
  context: RankingContext
): EventScore[] {
  return events
    .map(event => {
      const score = calculateEventScore(event, user, signals, context)
      const reasons = generateReasons(event, user, signals, context, score)
      
      return {
        eventId: event.id,
        score: score.total,
        reasons,
        confidence: score.confidence
      }
    })
    .sort((a, b) => b.score - a.score)
}

// Heuristic scoring algorithm (Phase 1 - can ship immediately)
function calculateEventScore(
  event: Event,
  _user: User,
  signals: RankingSignals,
  context: RankingContext
): { total: number; confidence: number; components: Record<string, number> } {
  
  const components: Record<string, number> = {}
  
  // 1. Sport Affinity (0-1) - Core personalization
  const eventCategory = (event as any).category || 'general' // Mock events have category
  const sportScore = signals.sportAffinity[eventCategory] || 0.3
  components.sport = sportScore * 0.25
  
  // 2. Distance Score (0-1) - Closer is better
  const distanceScore = calculateDistanceScore(event, context.userLocation, signals.distanceTolerance)
  components.distance = distanceScore * 0.20
  
  // 3. Social Score (0-1) - Friends attending
  const socialScore = calculateSocialScore(event, context.userConnections)
  components.social = socialScore * signals.socialWeight * 0.20
  
  // 4. Timing Score (0-1) - Fits user's active windows
  const timingScore = calculateTimingScore(event, signals.activeTimeWindows, context.currentTime)
  components.timing = timingScore * 0.15
  
  // 5. Urgency Score (0-1) - Event filling up / time pressure
  const urgencyScore = calculateUrgencyScore(event, context.currentTime)
  components.urgency = urgencyScore * signals.urgencyPreference * 0.10
  
  // 6. Recency/Freshness Score (0-1) - Newer events get boost
  const recencyScore = calculateRecencyScore(event, context.currentTime)
  components.recency = recencyScore * 0.10
  
  const total = Object.values(components).reduce((sum, score) => sum + score, 0)
  
  // Confidence based on signal strength
  const confidence = Math.min(1, (
    (signals.sportAffinity[eventCategory] || 0) +
    (context.userLocation ? 1 : 0) +
    (context.userConnections.length > 0 ? 1 : 0)
  ) / 3)
  
  return { total, confidence, components }
}

// Distance scoring with personalization
function calculateDistanceScore(
  _event: Event, 
  userLocation?: { lat: number; lng: number },
  tolerance: number = 5
): number {
  if (!userLocation) return 0.5 // Neutral if no location
  
  // Mock distance calculation (replace with real geolocation)
  const eventDistance = Math.random() * 10 // km
  
  if (eventDistance <= tolerance * 0.5) return 1.0 // Very close
  if (eventDistance <= tolerance) return 0.8 // Close
  if (eventDistance <= tolerance * 1.5) return 0.5 // Moderate
  return 0.2 // Far
}

// Social proof scoring
function calculateSocialScore(event: Event, userConnections: string[]): number {
  if (userConnections.length === 0) return 0
  
  const friendsAttending = event.attendees?.filter(a => 
    userConnections.includes(a.userId)
  ).length || 0
  
  // Diminishing returns for many friends
  return Math.min(1, friendsAttending / Math.max(1, userConnections.length * 0.3))
}

// Time window matching
function calculateTimingScore(
  event: Event,
  activeWindows: Array<{ dow: number; startHour: number; endHour: number }>,
  _currentTime: Date
): number {
  const eventTime = dayjs(event.startAt || event.startTime)
  const eventDow = eventTime.day() // 0 = Sunday
  const eventHour = eventTime.hour()
  
  const matchingWindow = activeWindows.find(window => 
    window.dow === eventDow && 
    eventHour >= window.startHour && 
    eventHour <= window.endHour
  )
  
  return matchingWindow ? 1.0 : 0.3 // High boost for preferred times
}

// Urgency/scarcity scoring
function calculateUrgencyScore(event: Event, currentTime: Date): number {
  const seatsFilled = (event.attendeeCount || 0) / event.maxSlots
  const timeToStart = dayjs(event.startAt || event.startTime).diff(currentTime, 'hours')
  
  // Events that are filling up and starting soon get urgency boost
  let urgencyScore = 0
  
  // Seat urgency (0.7+ filled gets boost)
  if (seatsFilled >= 0.7) urgencyScore += 0.5
  if (seatsFilled >= 0.9) urgencyScore += 0.3
  
  // Time urgency (next 24 hours gets boost)
  if (timeToStart <= 24 && timeToStart > 2) urgencyScore += 0.2
  
  return Math.min(1, urgencyScore)
}

// Recency scoring
function calculateRecencyScore(event: Event, currentTime: Date): number {
  const daysSinceCreated = dayjs(currentTime).diff(event.createdAt, 'days')
  
  if (daysSinceCreated <= 1) return 1.0 // New today
  if (daysSinceCreated <= 3) return 0.8 // This week
  if (daysSinceCreated <= 7) return 0.5 // Last week
  return 0.2 // Older
}

// AI explanation generation - key for trust and transparency
function generateReasons(
  event: Event,
  _user: User,
  signals: RankingSignals,
  context: RankingContext,
  score: { components: Record<string, number> }
): string[] {
  const reasons: string[] = []
  
  // Show top 2-3 reasons, keep it brief
  const sortedComponents = Object.entries(score.components)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
  
  for (const [component, componentScore] of sortedComponents) {
    if (componentScore < 0.1) continue // Don't show weak signals
    
    switch (component) {
      case 'sport':
        if (componentScore > 0.15) {
          const eventCategory = (event as any).category || 'general'
          const affinity = Math.round((signals.sportAffinity[eventCategory] || 0) * 100)
          reasons.push(`${affinity}% match for ${eventCategory}`)
        }
        break
      case 'social':
        const friendsCount = event.attendees?.filter(a => 
          context.userConnections.includes(a.userId)
        ).length || 0
        if (friendsCount > 0) {
          reasons.push(`${friendsCount} friend${friendsCount > 1 ? 's' : ''} attending`)
        }
        break
      case 'distance':
        if (componentScore > 0.6) reasons.push('close by')
        break
      case 'timing':
        if (componentScore > 0.8) reasons.push('your usual time')
        break
      case 'urgency':
        const seatsFilled = (event.attendeeCount || 0) / event.maxSlots
        if (seatsFilled >= 0.8) {
          const remaining = event.maxSlots - (event.attendeeCount || 0)
          reasons.push(`${remaining} seat${remaining !== 1 ? 's' : ''} left`)
        }
        break
      case 'recency':
        if (componentScore > 0.8) reasons.push('new today')
        break
    }
  }
  
  return reasons.slice(0, 2) // Max 2 reasons to keep UI clean
}

// Default user signals (Phase 1 - can be hardcoded or derived from past behavior)
export function getDefaultUserSignals(_user: User): RankingSignals {
  return {
    sportAffinity: {
      'basketball': 0.8,
      'soccer': 0.6,
      'running': 0.7,
      'tennis': 0.4,
      'general': 0.3
    },
    distanceTolerance: 5, // km
    activeTimeWindows: [
      { dow: 1, startHour: 18, endHour: 21 }, // Monday evening
      { dow: 3, startHour: 18, endHour: 21 }, // Wednesday evening  
      { dow: 6, startHour: 9, endHour: 17 },  // Saturday day
      { dow: 0, startHour: 10, endHour: 16 }  // Sunday day
    ],
    socialWeight: 0.7, // Friends matter a lot
    urgencyPreference: 0.6 // Moderate urgency preference
  }
}

// Event signal logging for ML (Phase 2 preparation)
export interface UserEventSignal {
  userId: string
  eventId: string
  action: 'impression' | 'dwell' | 'open' | 'join' | 'leave' | 'waitlist' | 'share'
  timestamp: Date
  actionId?: string // Unique ID to prevent duplicates
  context: {
    position?: number // Position in ranked list
    score?: number
    reasons?: string[]
    sessionId?: string
  }
}

// Track sent signals to prevent duplicates
const sentSignals = new Set<string>()

export function logUserEventSignal(signal: UserEventSignal): void {
  // Generate unique action ID if not provided
  const actionId = signal.actionId || `${signal.userId}-${signal.eventId}-${signal.action}-${Date.now()}`
  
  // Check for duplicates
  if (sentSignals.has(actionId)) {
    console.log('🔄 Duplicate signal ignored:', actionId)
    return
  }
  
  // Track this signal
  sentSignals.add(actionId)
  
  // Clean up old signals (keep last 1000)
  if (sentSignals.size > 1000) {
    const signalsArray = Array.from(sentSignals)
    signalsArray.slice(0, 100).forEach(id => sentSignals.delete(id))
  }
  
  // Phase 1: Console logging for development
  console.log('📊 User Signal:', { ...signal, actionId })
  
  // Phase 2: Send to analytics/ML pipeline
  // Analytics.track('user_event_signal', { ...signal, actionId })
  
  // Phase 3: Stream to real-time feature store
  // EventBus.publish('user_signals', { ...signal, actionId })
}

// KPI tracking for AI-first metrics
export interface AIMetrics {
  tapsPerJoin: number
  joinConversionVsBaseline: number
  avgTimeToJoin: number // seconds
  personalizedCTR: number
  rankingAccuracy: number
}

export function trackAIMetrics(metrics: AIMetrics): void {
  console.log('🎯 AI Metrics:', metrics)
  // Implementation for metrics collection
}
