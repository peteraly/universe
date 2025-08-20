// GameOn AI-First Resilience Infrastructure
// Handles cold starts, data quality, abuse, drift, and graceful degradation

import { Event, User } from '../types'
import { RankingSignals, EventScore } from './aiRanking'

// Resilience Configuration
export interface ResilienceConfig {
  // Cold start settings
  explorationRate: number // ε-greedy exploration percentage (0.05-0.10)
  coldStartThreshold: number // Minimum signals for personalized ranking
  
  // Data quality thresholds
  minEventQuality: number // Minimum quality score for events
  maxOutlierScore: number // Maximum score before outlier clipping
  
  // Abuse prevention
  maxJoinsPerHour: number // Rate limiting
  maxEventsPerDay: number // Host rate limiting
  
  // Drift monitoring
  driftThreshold: number // PSI threshold for feature drift
  performanceThreshold: number // KPI threshold for auto-rollback
  
  // Fallback settings
  fallbackTimeout: number // ms before falling back to heuristics
  maxRetries: number // Maximum retry attempts
}

// Default resilience configuration
export const DEFAULT_RESILIENCE_CONFIG: ResilienceConfig = {
  explorationRate: 0.08, // 8% exploration for cold start
  coldStartThreshold: 3, // Need 3+ interactions for personalization
  minEventQuality: 0.6, // Minimum event quality score
  maxOutlierScore: 0.95, // Clip scores above 95th percentile
  maxJoinsPerHour: 10, // Rate limiting
  maxEventsPerDay: 5, // Host rate limiting
  driftThreshold: 0.25, // PSI threshold for drift detection
  performanceThreshold: 0.8, // 80% of baseline performance
  fallbackTimeout: 100, // 100ms timeout for ML service
  maxRetries: 2
}

// Resilience State Management
export interface ResilienceState {
  userSignalCount: number
  lastModelUpdate: Date
  currentPerformance: number
  driftDetected: boolean
  fallbackActive: boolean
  abuseFlags: string[]
}

// Core Resilience Service
export class ResilienceService {
  private config: ResilienceConfig
  private state: Map<string, ResilienceState> = new Map()
  
  constructor(config: ResilienceConfig = DEFAULT_RESILIENCE_CONFIG) {
    this.config = config
  }
  
  // Cold Start Detection & Handling
  isColdStart(userId: string): boolean {
    const state = this.getUserState(userId)
    return state.userSignalCount < this.config.coldStartThreshold
  }
  
  // Exploration for cold start users
  shouldExplore(userId: string): boolean {
    if (this.isColdStart(userId)) {
      return Math.random() < this.config.explorationRate
    }
    return Math.random() < (this.config.explorationRate * 0.5) // Reduced exploration for warm users
  }
  
  // Data Quality Assessment
  assessEventQuality(event: Event): { score: number; issues: string[] } {
    const issues: string[] = []
    let score = 1.0
    
    // Check required fields
    if (!event.title || event.title.length < 3) {
      issues.push('Missing or short title')
      score -= 0.3
    }
    
    if (!event.location) {
      issues.push('Missing location')
      score -= 0.2
    }
    
    if (!event.startAt && !event.startTime) {
      issues.push('Missing start time')
      score -= 0.3
    }
    
    // Check for suspicious patterns
    if (event.title && event.title.length > 100) {
      issues.push('Title too long')
      score -= 0.1
    }
    
    if (event.maxSlots > 100) {
      issues.push('Unrealistic capacity')
      score -= 0.2
    }
    
    return { score: Math.max(0, score), issues }
  }
  
  // Outlier Detection & Clipping
  clipOutlierScores(scores: EventScore[]): EventScore[] {
    if (scores.length === 0) return scores
    
    // Calculate score distribution
    const scoreValues = scores.map(s => s.score).sort((a, b) => a - b)
    const q95 = scoreValues[Math.floor(scoreValues.length * 0.95)]
    
    return scores.map(score => ({
      ...score,
      score: Math.min(score.score, q95 * this.config.maxOutlierScore)
    }))
  }
  
  // Abuse Detection
  detectAbuse(userId: string, action: 'join' | 'create' | 'leave'): { isAbuse: boolean; reason?: string } {
    const state = this.getUserState(userId)
    
    // Check rate limits
    const now = Date.now()
    const recentActions = state.abuseFlags.filter(flag => 
      flag.includes(action) && now - parseInt(flag.split(':')[1]) < 3600000 // 1 hour
    )
    
    if (action === 'join' && recentActions.length >= this.config.maxJoinsPerHour) {
      return { isAbuse: true, reason: 'Rate limit exceeded' }
    }
    
    if (action === 'create' && recentActions.length >= this.config.maxEventsPerDay) {
      return { isAbuse: true, reason: 'Host rate limit exceeded' }
    }
    
    // Add action to tracking
    state.abuseFlags.push(`${action}:${now}`)
    
    // Clean old flags (older than 24 hours)
    state.abuseFlags = state.abuseFlags.filter(flag => 
      now - parseInt(flag.split(':')[1]) < 86400000
    )
    
    return { isAbuse: false }
  }
  
  // Drift Detection (simplified for Phase 1)
  detectDrift(currentPerformance: number, baselinePerformance: number): boolean {
    const performanceRatio = currentPerformance / baselinePerformance
    return performanceRatio < this.config.performanceThreshold
  }
  
  // Graceful Fallback System
  async withFallback<T>(
    primaryOperation: () => Promise<T>,
    fallbackOperation: () => Promise<T>,
    timeout: number = this.config.fallbackTimeout
  ): Promise<T> {
    try {
      // Try primary operation with timeout
      const timeoutPromise = new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('Timeout')), timeout)
      )
      
      const result = await Promise.race([primaryOperation(), timeoutPromise])
      return result
    } catch (error) {
      console.warn('Primary operation failed, using fallback:', error)
      
      try {
        return await fallbackOperation()
      } catch (fallbackError) {
        console.error('Fallback operation also failed:', fallbackError)
        throw new Error('Service temporarily unavailable')
      }
    }
  }
  
  // Cold Start Priors (default recommendations)
  getColdStartPriors(): RankingSignals {
    return {
      sportAffinity: {
        'basketball': 0.7, // Popular sports get higher priors
        'soccer': 0.6,
        'running': 0.5,
        'tennis': 0.4,
        'general': 0.3
      },
      distanceTolerance: 8, // More generous for cold start
      activeTimeWindows: [
        { dow: 1, startHour: 18, endHour: 21 }, // Monday evening
        { dow: 3, startHour: 18, endHour: 21 }, // Wednesday evening
        { dow: 6, startHour: 9, endHour: 17 },  // Saturday day
        { dow: 0, startHour: 10, endHour: 16 }  // Sunday day
      ],
      socialWeight: 0.5, // Moderate social weight
      urgencyPreference: 0.4 // Lower urgency for exploration
    }
  }
  
  // Performance Monitoring
  updatePerformance(userId: string, performance: number): void {
    const state = this.getUserState(userId)
    state.currentPerformance = performance
    state.lastModelUpdate = new Date()
    
    // Check for drift
    const baselinePerformance = 0.85 // Target baseline
    state.driftDetected = this.detectDrift(performance, baselinePerformance)
    
    if (state.driftDetected) {
      console.warn(`Drift detected for user ${userId}, performance: ${performance}`)
    }
  }
  
  // Signal Tracking for Cold Start
  incrementSignalCount(userId: string): void {
    const state = this.getUserState(userId)
    state.userSignalCount++
  }
  
  // State Management
  private getUserState(userId: string): ResilienceState {
    if (!this.state.has(userId)) {
      this.state.set(userId, {
        userSignalCount: 0,
        lastModelUpdate: new Date(),
        currentPerformance: 0.85, // Default baseline
        driftDetected: false,
        fallbackActive: false,
        abuseFlags: []
      })
    }
    return this.state.get(userId)!
  }
  
  // Cleanup old user states (prevent memory leaks)
  cleanupOldStates(maxAge: number = 7 * 24 * 60 * 60 * 1000): void { // 7 days
    const now = Date.now()
    for (const [userId, state] of this.state.entries()) {
      if (now - state.lastModelUpdate.getTime() > maxAge) {
        this.state.delete(userId)
      }
    }
  }
}

// Resilience-aware ranking wrapper
export async function resilientRankEvents(
  events: Event[],
  user: User,
  signals: RankingSignals,
  context: any,
  resilienceService: ResilienceService
): Promise<EventScore[]> {
  const userId = user.id
  
  // Check for abuse
  const abuseCheck = resilienceService.detectAbuse(userId, 'join')
  if (abuseCheck.isAbuse) {
    console.warn(`Abuse detected for user ${userId}: ${abuseCheck.reason}`)
    // Return safe, limited recommendations
    return events.slice(0, 3).map(event => ({
      eventId: event.id,
      score: 0.5, // Neutral score
      reasons: ['Limited recommendations due to rate limiting'],
      confidence: 0.3
    }))
  }
  
  // Assess event quality and filter low-quality events
  const qualityEvents = events.filter(event => {
    const quality = resilienceService.assessEventQuality(event)
    return quality.score >= resilienceService['config'].minEventQuality
  })
  
  // Handle cold start
  if (resilienceService.isColdStart(userId)) {
    const coldStartSignals = resilienceService.getColdStartPriors()
    // Use cold start signals with exploration
    if (resilienceService.shouldExplore(userId)) {
      // Add some random events for exploration
      const explorationEvents = events.filter(e => !qualityEvents.includes(e)).slice(0, 2)
      qualityEvents.push(...explorationEvents)
    }
    
    // Use cold start ranking
    return await rankEventsWithFallback(qualityEvents, user, coldStartSignals, context, resilienceService)
  }
  
  // Normal ranking with fallback
  return await rankEventsWithFallback(qualityEvents, user, signals, context, resilienceService)
}

// Fallback-aware ranking function
async function rankEventsWithFallback(
  events: Event[],
  user: User,
  signals: RankingSignals,
  context: any,
  resilienceService: ResilienceService
): Promise<EventScore[]> {
  return resilienceService.withFallback(
    // Primary: AI ranking
    async () => {
      const { rankEventsForUser } = await import('./aiRanking')
      return rankEventsForUser(events, user, signals, context)
    },
    // Fallback: Simple heuristic ranking
    async () => {
      return events.map(event => ({
        eventId: event.id,
        score: Math.random() * 0.5 + 0.3, // Simple random-ish scoring
        reasons: ['Recommended for you'],
        confidence: 0.5
      })).sort((a, b) => b.score - a.score)
    }
  )
}

// Monitoring and Alerting
export interface ResilienceMetrics {
  coldStartUsers: number
  fallbackUsage: number
  abuseDetections: number
  driftDetections: number
  avgResponseTime: number
  errorRate: number
}

export function collectResilienceMetrics(resilienceService: ResilienceService): ResilienceMetrics {
  let coldStartUsers = 0
  let fallbackUsage = 0
  let abuseDetections = 0
  let driftDetections = 0
  
  for (const state of resilienceService['state'].values()) {
    if (state.userSignalCount < resilienceService['config'].coldStartThreshold) {
      coldStartUsers++
    }
    if (state.fallbackActive) {
      fallbackUsage++
    }
    if (state.abuseFlags.length > 0) {
      abuseDetections++
    }
    if (state.driftDetected) {
      driftDetections++
    }
  }
  
  return {
    coldStartUsers,
    fallbackUsage,
    abuseDetections,
    driftDetections,
    avgResponseTime: 0, // Would be calculated from actual metrics
    errorRate: 0 // Would be calculated from actual metrics
  }
}
