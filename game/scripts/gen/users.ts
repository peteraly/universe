// User Generator - Creates realistic user profiles with NYC clustering

import { FIRST_NAMES, LAST_NAMES, NYC_CLUSTERS, SPORTS_CONFIG, SeedScale, GenerationParams } from '../seed.config'

export interface GeneratedUser {
  id: string
  name: string
  email: string
  location: {
    lat: number
    lng: number
    cluster: string
  }
  sportsAffinity: Record<string, number> // sport -> affinity (0-1)
  reliability: number // 0-1, affects show-up rate
  isSuperHost: boolean
  joinedAt: string
  friends: string[] // Will be populated after all users generated
}

export interface SocialConnection {
  userAId: string
  userBId: string
  strength: number // 0-1, affects interaction frequency
  createdAt: string
}

// Seeded random number generator
class SeededRandom {
  private seed: number

  constructor(seed: number) {
    this.seed = seed
  }

  next(): number {
    this.seed = (this.seed * 9301 + 49297) % 233280
    return this.seed / 233280
  }

  nextInt(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min
  }

  nextGaussian(mean: number = 0, stdDev: number = 1): number {
    // Box-Muller transform
    const u1 = this.next()
    const u2 = this.next()
    const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2)
    return z0 * stdDev + mean
  }

  choice<T>(array: T[]): T {
    return array[Math.floor(this.next() * array.length)]
  }

  weighted<T>(items: T[], weights: number[]): T {
    const totalWeight = weights.reduce((sum, weight) => sum + weight, 0)
    let random = this.next() * totalWeight
    
    for (let i = 0; i < items.length; i++) {
      random -= weights[i]
      if (random <= 0) return items[i]
    }
    
    return items[items.length - 1]
  }
}

export class UserGenerator {
  private rng: SeededRandom
  private scale: SeedScale
  private params: GenerationParams

  constructor(seed: number, scale: SeedScale, params: GenerationParams) {
    this.rng = new SeededRandom(seed)
    this.scale = scale
    this.params = params
  }

  // Generate all users
  generateUsers(): GeneratedUser[] {
    const users: GeneratedUser[] = []
    
    console.log(`Generating ${this.scale.users} users...`)
    
    for (let i = 0; i < this.scale.users; i++) {
      const user = this.generateUser(i)
      users.push(user)
      
      if ((i + 1) % 100 === 0) {
        console.log(`Generated ${i + 1}/${this.scale.users} users`)
      }
    }
    
    console.log(`✓ Generated ${users.length} users`)
    return users
  }

  // Generate single user
  private generateUser(index: number): GeneratedUser {
    const id = `user_${String(index + 1).padStart(4, '0')}`
    
    // Generate name
    const firstName = this.rng.choice(FIRST_NAMES)
    const lastName = this.rng.choice(LAST_NAMES)
    const name = `${firstName} ${lastName}`
    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`
    
    // Generate location within NYC cluster
    const location = this.generateLocation()
    
    // Generate sports affinity
    const sportsAffinity = this.generateSportsAffinity()
    
    // Generate reliability (normal distribution)
    const reliability = Math.max(0.1, Math.min(1.0, 
      this.rng.nextGaussian(this.params.reliabilityMean, this.params.reliabilityStdDev)
    ))
    
    // Determine if super host
    const isSuperHost = this.rng.next() < this.scale.superHostPercent
    
    // Generate join date (within last 2 years)
    const joinedAt = this.generateJoinDate()
    
    return {
      id,
      name,
      email,
      location,
      sportsAffinity,
      reliability,
      isSuperHost,
      joinedAt,
      friends: [] // Will be populated later
    }
  }

  // Generate location within NYC clusters
  private generateLocation(): { lat: number; lng: number; cluster: string } {
    const clusterWeights = NYC_CLUSTERS.map(c => c.weight)
    const cluster = this.rng.weighted(NYC_CLUSTERS, clusterWeights)
    
    // Generate point within cluster radius
    const angle = this.rng.next() * 2 * Math.PI
    const distance = this.rng.next() * cluster.radius
    
    // Convert to lat/lng (approximate for NYC area)
    const latOffset = (distance * Math.cos(angle)) / 111 // ~111 km per degree lat
    const lngOffset = (distance * Math.sin(angle)) / (111 * Math.cos(cluster.lat * Math.PI / 180))
    
    return {
      lat: cluster.lat + latOffset,
      lng: cluster.lng + lngOffset,
      cluster: cluster.name
    }
  }

  // Generate sports affinity with realistic distribution
  private generateSportsAffinity(): Record<string, number> {
    const affinity: Record<string, number> = {}
    
    // Choose 1-3 primary sports
    const numPrimarySports = this.rng.nextInt(1, 3)
    const primarySports: string[] = []
    
    for (let i = 0; i < numPrimarySports; i++) {
      const weights = SPORTS_CONFIG.map(s => s.popularity)
      let sport = this.rng.weighted(SPORTS_CONFIG, weights)
      
      // Avoid duplicates
      while (primarySports.includes(sport.name)) {
        sport = this.rng.weighted(SPORTS_CONFIG, weights)
      }
      
      primarySports.push(sport.name)
      affinity[sport.name] = 0.7 + this.rng.next() * 0.3 // 0.7-1.0 for primary sports
    }
    
    // Add secondary interests for other sports
    for (const sport of SPORTS_CONFIG) {
      if (!primarySports.includes(sport.name)) {
        // 30% chance of secondary interest
        if (this.rng.next() < 0.3) {
          affinity[sport.name] = 0.2 + this.rng.next() * 0.4 // 0.2-0.6 for secondary
        } else {
          affinity[sport.name] = 0.05 + this.rng.next() * 0.15 // 0.05-0.2 for minimal
        }
      }
    }
    
    return affinity
  }

  // Generate realistic join date
  private generateJoinDate(): string {
    const daysAgo = this.rng.nextInt(1, 730) // 1 day to 2 years ago
    const joinDate = new Date()
    joinDate.setDate(joinDate.getDate() - daysAgo)
    return joinDate.toISOString()
  }

  // Generate social connections (friend network)
  generateSocialConnections(users: GeneratedUser[]): SocialConnection[] {
    const connections: SocialConnection[] = []
    console.log('Generating social connections...')
    
    // Group users by location cluster
    const clusterGroups = new Map<string, GeneratedUser[]>()
    for (const user of users) {
      const cluster = user.location.cluster
      if (!clusterGroups.has(cluster)) {
        clusterGroups.set(cluster, [])
      }
      clusterGroups.get(cluster)!.push(user)
    }
    
    // Generate within-cluster connections
    for (const [cluster, clusterUsers] of clusterGroups) {
      console.log(`Generating connections in ${cluster} (${clusterUsers.length} users)`)
      this.generateClusterConnections(clusterUsers, connections)
    }
    
    // Generate cross-cluster connections
    console.log('Generating cross-cluster connections...')
    this.generateCrossClusterConnections(users, connections)
    
    // Update user friend lists
    this.updateUserFriendLists(users, connections)
    
    console.log(`✓ Generated ${connections.length} social connections`)
    return connections
  }

  // Generate connections within a cluster
  private generateClusterConnections(users: GeneratedUser[], connections: SocialConnection[]): void {
    for (let i = 0; i < users.length; i++) {
      const user = users[i]
      const targetFriends = Math.min(
        this.params.friendClusterSize + this.rng.nextInt(-2, 2),
        users.length - 1
      )
      
      const friendCandidates = users.filter(u => u.id !== user.id)
      
      // Sort by sports affinity similarity
      friendCandidates.sort((a, b) => {
        const similarityA = this.calculateSportsAffinity(user, a)
        const similarityB = this.calculateSportsAffinity(user, b)
        return similarityB - similarityA
      })
      
      // Add friends with preference for similar interests
      for (let j = 0; j < Math.min(targetFriends, friendCandidates.length); j++) {
        const friend = friendCandidates[j]
        
        // Higher probability for similar users
        const similarity = this.calculateSportsAffinity(user, friend)
        const probability = 0.3 + (similarity * 0.5) // 0.3-0.8 based on similarity
        
        if (this.rng.next() < probability) {
          // Check if connection already exists
          const existingConnection = connections.find(c => 
            (c.userAId === user.id && c.userBId === friend.id) ||
            (c.userAId === friend.id && c.userBId === user.id)
          )
          
          if (!existingConnection) {
            connections.push({
              userAId: user.id,
              userBId: friend.id,
              strength: 0.5 + this.rng.next() * 0.5, // 0.5-1.0
              createdAt: this.generateConnectionDate(user, friend)
            })
          }
        }
      }
    }
  }

  // Generate cross-cluster connections
  private generateCrossClusterConnections(users: GeneratedUser[], connections: SocialConnection[]): void {
    const totalCrossConnections = Math.floor(
      users.length * this.scale.avgFriendsPerUser * this.params.crossClusterRate
    )
    
    for (let i = 0; i < totalCrossConnections; i++) {
      const userA = this.rng.choice(users)
      const userB = this.rng.choice(users.filter(u => 
        u.id !== userA.id && u.location.cluster !== userA.location.cluster
      ))
      
      if (userB) {
        // Check if connection already exists
        const existingConnection = connections.find(c => 
          (c.userAId === userA.id && c.userBId === userB.id) ||
          (c.userAId === userB.id && c.userBId === userA.id)
        )
        
        if (!existingConnection) {
          connections.push({
            userAId: userA.id,
            userBId: userB.id,
            strength: 0.3 + this.rng.next() * 0.4, // 0.3-0.7 (weaker cross-cluster)
            createdAt: this.generateConnectionDate(userA, userB)
          })
        }
      }
    }
  }

  // Calculate sports affinity similarity between two users
  private calculateSportsAffinity(userA: GeneratedUser, userB: GeneratedUser): number {
    const sportsA = Object.keys(userA.sportsAffinity)
    const sportsB = Object.keys(userB.sportsAffinity)
    const allSports = [...new Set([...sportsA, ...sportsB])]
    
    let similarity = 0
    for (const sport of allSports) {
      const affinityA = userA.sportsAffinity[sport] || 0
      const affinityB = userB.sportsAffinity[sport] || 0
      similarity += 1 - Math.abs(affinityA - affinityB)
    }
    
    return similarity / allSports.length
  }

  // Generate connection date
  private generateConnectionDate(userA: GeneratedUser, userB: GeneratedUser): string {
    // Connection date should be after both users joined
    const userAJoined = new Date(userA.joinedAt)
    const userBJoined = new Date(userB.joinedAt)
    const laterJoinDate = userAJoined > userBJoined ? userAJoined : userBJoined
    
    // Connection happens 1-180 days after later join date
    const connectionDate = new Date(laterJoinDate)
    connectionDate.setDate(connectionDate.getDate() + this.rng.nextInt(1, 180))
    
    return connectionDate.toISOString()
  }

  // Update user friend lists based on connections
  private updateUserFriendLists(users: GeneratedUser[], connections: SocialConnection[]): void {
    for (const user of users) {
      user.friends = connections
        .filter(c => c.userAId === user.id || c.userBId === user.id)
        .map(c => c.userAId === user.id ? c.userBId : c.userAId)
    }
  }
}

export { SeededRandom }
