// GameOn Enhanced AI-First Ranking System
// Implements sophisticated scoring with friends, day/time rhythm, and activity affinity

import { Event, User } from '../types'
import { EventScore } from './aiRanking'
import dayjs from 'dayjs'

// Enhanced Ranking Configuration
export interface EnhancedRankingConfig {
  // Friends scoring
  friendsSaturationK: number // k in 1 - exp(-k * F), default 0.9
  friendsWeight: number // 0.45 in linear combination
  
  // Day/Time rhythm
  timeBinSize: number // hours per bin (1 or 4)
  emaAlpha: number // 0.2 for exponential moving average
  decayBeta: number // 0.05 for weekly decay
  dayTimeWeight: number // 0.25 in linear combination
  
  // Activity affinity
  activityWeight: number // 0.15 in linear combination
  explorationWeight: number // 0.05 for discovery
  
  // Distance and urgency
  distanceWeight: number // 0.10 in linear combination
  urgencyWeight: number // 0.05 in linear combination
  urgencyThreshold: number // Only apply to 1-2 seats left
}

export const DEFAULT_ENHANCED_CONFIG: EnhancedRankingConfig = {
  friendsSaturationK: 0.9,
  friendsWeight: 0.45,
  timeBinSize: 4, // 4-hour bins
  emaAlpha: 0.2,
  decayBeta: 0.05,
  dayTimeWeight: 0.25,
  activityWeight: 0.15,
  explorationWeight: 0.05,
  distanceWeight: 0.10,
  urgencyWeight: 0.05,
  urgencyThreshold: 2
}

// User Profile Data
export interface UserProfile {
  userId: string
  // Day/Time rhythm: 7 days × 6 bins (4-hour each)
  dayTimeProfile: number[][] // [dow][bin] ∈ [0,1]
  // Activity affinity: sport → normalized score
  activityAffinity: Record<string, number>
  // Distance tolerance (learned median)
  medianDistance: number
  // Last update timestamp
  lastUpdated: Date
}

// Friend Closeness Data
export interface FriendCloseness {
  userId: string
  friendId: string
  closeness: number // 1.0 (close), 0.5 (medium), 0.25 (weak)
  lastInteraction: Date
}

// Enhanced Ranking Context
export interface EnhancedRankingContext {
  userProfile: UserProfile
  friendCloseness: FriendCloseness[]
  userConnections: string[]
  userLocation?: { lat: number; lng: number }
  currentTime: Date
}

// Core Enhanced Ranking Function
export function enhancedRankEvents(
  events: Event[],
  user: User,
  context: EnhancedRankingContext,
  config: EnhancedRankingConfig = DEFAULT_ENHANCED_CONFIG
): EventScore[] {
  return events
    .map(event => {
      const scores = calculateEnhancedScores(event, user, context, config)
      const totalScore = combineScores(scores, config)
      const reasons = generateEnhancedReasons(scores, event, context, config)
      
      return {
        eventId: event.id,
        score: totalScore,
        reasons,
        confidence: calculateConfidence(scores, context)
      }
    })
    .sort((a, b) => b.score - a.score)
}

// Enhanced Scoring Components
interface EnhancedScores {
  friends: number
  dayTime: number
  activity: number
  distance: number
  urgency: number
}

function calculateEnhancedScores(
  event: Event,
  _user: User,
  context: EnhancedRankingContext,
  config: EnhancedRankingConfig
): EnhancedScores {
  return {
    friends: calculateFriendsScore(event, context, config),
    dayTime: calculateDayTimeScore(event, context, config),
    activity: calculateActivityScore(event, context, config),
    distance: calculateDistanceScore(event, context, config),
    urgency: calculateUrgencyScore(event, config)
  }
}

// 1. Friends Score (with diminishing returns)
function calculateFriendsScore(
  event: Event,
  context: EnhancedRankingContext,
  config: EnhancedRankingConfig
): number {
  const friendsAttending = event.attendees?.filter(a => 
    context.userConnections.includes(a.userId)
  ) || []
  
  if (friendsAttending.length === 0) return 0
  
  // Calculate weighted friend sum with closeness
  let weightedSum = 0
  for (const attendee of friendsAttending) {
    const closeness = context.friendCloseness.find(fc => 
      fc.friendId === attendee.userId
    )?.closeness || 0.5 // Default to medium closeness
    
    weightedSum += closeness
  }
  
  // Apply saturating transform: 1 - exp(-k * F)
  return 1 - Math.exp(-config.friendsSaturationK * weightedSum)
}

// 2. Day/Time Rhythm Score
function calculateDayTimeScore(
  event: Event,
  context: EnhancedRankingContext,
  config: EnhancedRankingConfig
): number {
  const eventTime = dayjs(event.startAt || event.startTime)
  const dow = eventTime.day() // 0 = Sunday
  const hour = eventTime.hour()
  const bin = Math.floor(hour / config.timeBinSize) // 4-hour bins
  
  const profile = context.userProfile.dayTimeProfile[dow] || []
  if (profile.length === 0) return 0.5 // Neutral if no profile
  
  // Apply Gaussian smoothing kernel to neighbors
  let smoothedScore = 0
  let kernelSum = 0
  
  for (let delta = -1; delta <= 1; delta++) {
    const neighborBin = bin + delta
    if (neighborBin >= 0 && neighborBin < profile.length) {
      const kernelWeight = delta === 0 ? 0.5 : 0.25 // [0.25, 0.5, 0.25]
      smoothedScore += kernelWeight * profile[neighborBin]
      kernelSum += kernelWeight
    }
  }
  
  return kernelSum > 0 ? smoothedScore / kernelSum : 0.5
}

// 3. Activity Affinity Score
function calculateActivityScore(
  event: Event,
  context: EnhancedRankingContext,
  config: EnhancedRankingConfig
): number {
  const eventCategory = (event as any).category || 'general'
  const affinity = context.userProfile.activityAffinity[eventCategory] || 0.3
  
  // Add small exploration weight to avoid filter bubbles
  const explorationBonus = Math.random() * config.explorationWeight
  
  return Math.min(1, affinity + explorationBonus)
}

// 4. Distance Score
function calculateDistanceScore(
  _event: Event,
  context: EnhancedRankingContext,
  _config: EnhancedRankingConfig
): number {
  if (!context.userLocation || !context.userProfile.medianDistance) {
    return 0.5 // Neutral if no location data
  }
  
  // Mock distance calculation (replace with real geolocation)
  const eventDistance = Math.random() * 20 // km
  
  const medianDistance = context.userProfile.medianDistance
  const maxDistance = medianDistance * 2
  
  if (eventDistance <= medianDistance) return 1.0
  if (eventDistance >= maxDistance) return 0.0
  
  // Linear decay from median to 2× median
  return 1 - ((eventDistance - medianDistance) / medianDistance)
}

// 5. Urgency Score
function calculateUrgencyScore(
  event: Event,
  config: EnhancedRankingConfig
): number {
  const openSeats = event.maxSlots - (event.attendeeCount || 0)
  
  // Only apply urgency bonus for genuine scarcity
  if (openSeats > 0 && openSeats <= config.urgencyThreshold) {
    return 0.05 // Small nudge for 1-2 seats left
  }
  
  return 0
}

// Combine scores with learned weights
function combineScores(scores: EnhancedScores, config: EnhancedRankingConfig): number {
  return (
    config.friendsWeight * scores.friends +
    config.dayTimeWeight * scores.dayTime +
    config.activityWeight * scores.activity +
    config.distanceWeight * scores.distance +
    config.urgencyWeight * scores.urgency
  )
}

// Generate enhanced explanations
function generateEnhancedReasons(
  scores: EnhancedScores,
  event: Event,
  context: EnhancedRankingContext,
  config: EnhancedRankingConfig
): string[] {
  const reasons: string[] = []
  
  // Sort scores to find top contributors
  const scoreEntries = Object.entries(scores)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 2) // Top 2 contributors
  
  for (const [component, score] of scoreEntries) {
    if (score < 0.1) continue // Don't show weak signals
    
    switch (component) {
      case 'friends':
        const friendsCount = event.attendees?.filter(a => 
          context.userConnections.includes(a.userId)
        ).length || 0
        if (friendsCount > 0) {
          reasons.push(`${friendsCount} friend${friendsCount > 1 ? 's' : ''} are in`)
        }
        break
        
      case 'dayTime':
        const eventTime = dayjs(event.startAt || event.startTime)
        const dayName = eventTime.format('ddd')
        const timeStr = eventTime.format('h:mm A')
        reasons.push(`${dayName} ${timeStr}`)
        break
        
      case 'activity':
        const eventCategory = (event as any).category || 'general'
        const affinity = context.userProfile.activityAffinity[eventCategory] || 0.3
        if (affinity > 0.6) {
          reasons.push(`${Math.round(affinity * 100)}% match for ${eventCategory}`)
        }
        break
        
      case 'distance':
        if (score > 0.8) reasons.push('close by')
        break
        
      case 'urgency':
        const openSeats = event.maxSlots - (event.attendeeCount || 0)
        if (openSeats <= config.urgencyThreshold && openSeats > 0) {
          reasons.push(`${openSeats} seat${openSeats !== 1 ? 's' : ''} left`)
        }
        break
    }
  }
  
  return reasons.slice(0, 2) // Max 2 reasons
}

// Calculate confidence based on data availability
function calculateConfidence(_scores: EnhancedScores, context: EnhancedRankingContext): number {
  let confidence = 0
  let factors = 0
  
  // Friends confidence
  if (context.userConnections.length > 0) {
    confidence += 0.3
    factors++
  }
  
  // Day/Time confidence
  if (context.userProfile.dayTimeProfile.some(day => day.some(score => score > 0))) {
    confidence += 0.3
    factors++
  }
  
  // Activity confidence
  if (Object.keys(context.userProfile.activityAffinity).length > 0) {
    confidence += 0.2
    factors++
  }
  
  // Distance confidence
  if (context.userLocation && context.userProfile.medianDistance) {
    confidence += 0.2
    factors++
  }
  
  return factors > 0 ? confidence / factors : 0.5
}

// Profile Update Functions
export function updateUserProfile(
  profile: UserProfile,
  event: Event,
  action: 'join' | 'leave',
  config: EnhancedRankingConfig = DEFAULT_ENHANCED_CONFIG
): UserProfile {
  const updatedProfile = { ...profile }
  
  if (action === 'join') {
    // Update day/time profile with EMA
    const eventTime = dayjs(event.startAt || event.startTime)
    const dow = eventTime.day()
    const hour = eventTime.hour()
    const bin = Math.floor(hour / config.timeBinSize)
    
    if (!updatedProfile.dayTimeProfile[dow]) {
      updatedProfile.dayTimeProfile[dow] = new Array(6).fill(0)
    }
    
    // EMA update: P[dow][bin] ← (1 - α) * P[dow][bin] + α * 1
    updatedProfile.dayTimeProfile[dow][bin] = 
      (1 - config.emaAlpha) * updatedProfile.dayTimeProfile[dow][bin] + config.emaAlpha
    
    // Update activity affinity
    const eventCategory = (event as any).category || 'general'
    const currentAffinity = updatedProfile.activityAffinity[eventCategory] || 0
    updatedProfile.activityAffinity[eventCategory] = 
      (1 - config.emaAlpha) * currentAffinity + config.emaAlpha
    
    // Normalize activity affinities (softmax-like)
    const totalAffinity = Object.values(updatedProfile.activityAffinity).reduce((sum, val) => sum + val, 0)
    if (totalAffinity > 0) {
      Object.keys(updatedProfile.activityAffinity).forEach(sport => {
        updatedProfile.activityAffinity[sport] /= totalAffinity
      })
    }
  }
  
  updatedProfile.lastUpdated = new Date()
  return updatedProfile
}

// Weekly decay function
export function applyWeeklyDecay(
  profile: UserProfile,
  config: EnhancedRankingConfig = DEFAULT_ENHANCED_CONFIG
): UserProfile {
  const updatedProfile = { ...profile }
  
  // Apply decay to day/time profile: P ← (1 - β) * P
  updatedProfile.dayTimeProfile = updatedProfile.dayTimeProfile.map(day =>
    day.map(score => (1 - config.decayBeta) * score)
  )
  
  // Apply decay to activity affinity
  Object.keys(updatedProfile.activityAffinity).forEach(sport => {
    updatedProfile.activityAffinity[sport] *= (1 - config.decayBeta)
  })
  
  return updatedProfile
}

// Friend closeness calculation
export function calculateFriendCloseness(
  userConnections: string[],
  coAttendanceHistory: Array<{ userId: string; friendId: string; eventId: string; timestamp: Date }>,
  dmHistory: Array<{ userId: string; friendId: string; timestamp: Date }>
): FriendCloseness[] {
  const closeness: FriendCloseness[] = []
  
  for (const friendId of userConnections) {
    // Calculate co-attendance frequency
    const coAttendanceCount = coAttendanceHistory.filter(h => 
      h.friendId === friendId
    ).length
    
    // Calculate DM frequency
    const dmCount = dmHistory.filter(h => 
      h.friendId === friendId
    ).length
    
    // Simple closeness calculation (can be enhanced)
    let closenessScore = 0.25 // Base weak connection
    
    if (coAttendanceCount >= 3) closenessScore = 1.0 // Close friend
    else if (coAttendanceCount >= 1 || dmCount >= 5) closenessScore = 0.5 // Medium friend
    
    closeness.push({
      userId: userConnections[0], // Current user
      friendId,
      closeness: closenessScore,
      lastInteraction: new Date() // Would be actual last interaction
    })
  }
  
  return closeness
}

// Default user profile for cold start
export function getDefaultUserProfile(userId: string): UserProfile {
  return {
    userId,
    dayTimeProfile: Array(7).fill(null).map(() => Array(6).fill(0.3)), // Neutral profile
    activityAffinity: {
      'basketball': 0.3,
      'soccer': 0.2,
      'running': 0.2,
      'tennis': 0.1,
      'general': 0.2
    },
    medianDistance: 5, // 5km default
    lastUpdated: new Date()
  }
}
