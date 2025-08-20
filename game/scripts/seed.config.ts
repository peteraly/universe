// GameOn Seeder Configuration
// Configurable parameters for realistic data generation

// Scale Presets
export interface SeedScale {
  name: string
  users: number
  events: number
  superHostPercent: number
  avgEventsPerHost: number
  avgFriendsPerUser: number
  pastEventRatio: number // 0.3 = 30% past events
}

export const SCALE_PRESETS: Record<string, SeedScale> = {
  small: {
    name: 'Small Demo',
    users: 50,
    events: 100,
    superHostPercent: 0.15,
    avgEventsPerHost: 2.5,
    avgFriendsPerUser: 8,
    pastEventRatio: 0.3
  },
  medium: {
    name: 'Medium Demo',
    users: 250,
    events: 600,
    superHostPercent: 0.12,
    avgEventsPerHost: 2.8,
    avgFriendsPerUser: 12,
    pastEventRatio: 0.35
  },
  large: {
    name: 'Large Demo',
    users: 1000,
    events: 2500,
    superHostPercent: 0.10,
    avgEventsPerHost: 3.2,
    avgFriendsPerUser: 15,
    pastEventRatio: 0.4
  },
  xl: {
    name: 'Extra Large',
    users: 5000,
    events: 10000,
    superHostPercent: 0.08,
    avgEventsPerHost: 3.5,
    avgFriendsPerUser: 20,
    pastEventRatio: 0.45
  }
}

// NYC Location Clusters
export interface LocationCluster {
  name: string
  lat: number
  lng: number
  radius: number // km
  weight: number // Population weight
}

export const NYC_CLUSTERS: LocationCluster[] = [
  { name: 'Manhattan', lat: 40.7831, lng: -73.9712, radius: 2.5, weight: 0.25 },
  { name: 'Brooklyn', lat: 40.6782, lng: -73.9442, radius: 3.0, weight: 0.30 },
  { name: 'Queens', lat: 40.7282, lng: -73.7949, radius: 4.0, weight: 0.20 },
  { name: 'Bronx', lat: 40.8448, lng: -73.8648, radius: 3.5, weight: 0.15 },
  { name: 'Staten Island', lat: 40.5795, lng: -74.1502, radius: 2.0, weight: 0.10 }
]

// Sports Configuration
export interface SportConfig {
  name: string
  popularity: number // 0-1, affects how often it appears
  avgCapacity: number // Average max slots for events
  avgDuration: number // Minutes
  indoor: boolean
  equipment: string[]
  venues: string[]
}

export const SPORTS_CONFIG: SportConfig[] = [
  {
    name: 'Basketball',
    popularity: 0.8,
    avgCapacity: 10,
    avgDuration: 90,
    indoor: true,
    equipment: ['basketball'],
    venues: ['Community Center', 'School Gym', 'YMCA', 'Recreation Center']
  },
  {
    name: 'Soccer',
    popularity: 0.7,
    avgCapacity: 16,
    avgDuration: 105,
    indoor: false,
    equipment: ['soccer ball', 'cleats'],
    venues: ['Central Park', 'Prospect Park', 'Soccer Field', 'Park']
  },
  {
    name: 'Running',
    popularity: 0.6,
    avgCapacity: 20,
    avgDuration: 60,
    indoor: false,
    equipment: ['running shoes'],
    venues: ['Central Park', 'Brooklyn Bridge', 'Riverside Park', 'High Line']
  },
  {
    name: 'Tennis',
    popularity: 0.5,
    avgCapacity: 4,
    avgDuration: 90,
    indoor: false,
    equipment: ['tennis racket', 'tennis balls'],
    venues: ['Tennis Court', 'Country Club', 'Recreation Center', 'Park Courts']
  },
  {
    name: 'Volleyball',
    popularity: 0.4,
    avgCapacity: 12,
    avgDuration: 75,
    indoor: true,
    equipment: ['volleyball'],
    venues: ['Beach Court', 'Gym', 'Recreation Center', 'Community Center']
  },
  {
    name: 'Board Games',
    popularity: 0.6,
    avgCapacity: 6,
    avgDuration: 120,
    indoor: true,
    equipment: ['board games'],
    venues: ['Coffee Shop', 'Board Game Cafe', 'Community Center', 'Library']
  },
  {
    name: 'Hiking',
    popularity: 0.3,
    avgCapacity: 15,
    avgDuration: 180,
    indoor: false,
    equipment: ['hiking boots', 'backpack'],
    venues: ['Central Park', 'Prospect Park', 'Nature Trail', 'State Park']
  },
  {
    name: 'Fitness',
    popularity: 0.5,
    avgCapacity: 8,
    avgDuration: 60,
    indoor: true,
    equipment: ['workout clothes'],
    venues: ['Gym', 'Fitness Studio', 'Park', 'Community Center']
  }
]

// Time Distribution Configuration
export interface TimeDistribution {
  hour: number
  weight: number
  dayWeights: number[] // [Sun, Mon, Tue, Wed, Thu, Fri, Sat]
}

export const TIME_DISTRIBUTIONS: TimeDistribution[] = [
  { hour: 6, weight: 0.05, dayWeights: [0.1, 0.2, 0.2, 0.2, 0.2, 0.2, 0.1] },  // Early morning
  { hour: 7, weight: 0.08, dayWeights: [0.1, 0.3, 0.3, 0.3, 0.3, 0.3, 0.1] },  // Morning
  { hour: 8, weight: 0.12, dayWeights: [0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.3] },  // Late morning
  { hour: 9, weight: 0.15, dayWeights: [0.3, 0.1, 0.1, 0.1, 0.1, 0.1, 0.4] },  // Weekend morning
  { hour: 10, weight: 0.18, dayWeights: [0.4, 0.1, 0.1, 0.1, 0.1, 0.1, 0.4] }, // Weekend peak
  { hour: 12, weight: 0.10, dayWeights: [0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.3] }, // Lunch
  { hour: 14, weight: 0.12, dayWeights: [0.3, 0.1, 0.1, 0.1, 0.1, 0.1, 0.3] }, // Afternoon
  { hour: 16, weight: 0.08, dayWeights: [0.2, 0.1, 0.1, 0.1, 0.1, 0.2, 0.2] }, // Late afternoon
  { hour: 18, weight: 0.20, dayWeights: [0.2, 0.3, 0.3, 0.3, 0.3, 0.3, 0.2] }, // Evening peak
  { hour: 19, weight: 0.25, dayWeights: [0.2, 0.3, 0.3, 0.3, 0.3, 0.3, 0.2] }, // Prime time
  { hour: 20, weight: 0.15, dayWeights: [0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2] }, // Night
  { hour: 21, weight: 0.08, dayWeights: [0.1, 0.1, 0.1, 0.1, 0.1, 0.2, 0.2] }  // Late night
]

// User Name Components
export const FIRST_NAMES = [
  'Alex', 'Jordan', 'Taylor', 'Casey', 'Morgan', 'Riley', 'Avery', 'Quinn',
  'Cameron', 'Jamie', 'Blake', 'Drew', 'Sage', 'Rowan', 'River', 'Sky',
  'Phoenix', 'Emery', 'Finley', 'Hayden', 'Kendall', 'Logan', 'Peyton', 'Reese'
]

export const LAST_NAMES = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis',
  'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson',
  'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson', 'White'
]

// Event Title Templates
export const EVENT_TITLE_TEMPLATES = [
  '{sport} Night',
  'Weekly {sport}',
  '{sport} Meetup',
  'Casual {sport}',
  'Competitive {sport}',
  'Beginner {sport}',
  'Advanced {sport}',
  '{sport} Club',
  'Morning {sport}',
  'Evening {sport}',
  'Weekend {sport}',
  '{sport} Session',
  'Open {sport}',
  '{sport} Game',
  '{sport} Practice'
]

// Generation Parameters
export interface GenerationParams {
  // User generation
  reliabilityMean: number // 0-1, average user reliability
  reliabilityStdDev: number
  superHostMultiplier: number // Events per super-host vs regular host
  
  // Event generation
  capacityVariation: number // ±% variation from sport average
  futureEventDays: number // How many days in future to generate
  pastEventDays: number // How many days in past to generate
  
  // Membership generation
  attendanceRate: number // 0-1, how often events fill up
  waitlistRate: number // 0-1, chance of waitlist when full
  requestRate: number // 0-1, chance of request for invite_manual
  
  // Visibility distribution
  publicEventRate: number // 0-1
  inviteAutoRate: number // 0-1
  inviteManualRate: number // 0-1 (should sum to 1 with public)
  
  // Social network
  friendClusterSize: number // Average size of friend clusters
  crossClusterRate: number // 0-1, rate of cross-cluster friendships
}

export const DEFAULT_GENERATION_PARAMS: GenerationParams = {
  reliabilityMean: 0.8,
  reliabilityStdDev: 0.15,
  superHostMultiplier: 4.0,
  
  capacityVariation: 0.3,
  futureEventDays: 60,
  pastEventDays: 30,
  
  attendanceRate: 0.7,
  waitlistRate: 0.3,
  requestRate: 0.4,
  
  publicEventRate: 0.6,
  inviteAutoRate: 0.25,
  inviteManualRate: 0.15,
  
  friendClusterSize: 8,
  crossClusterRate: 0.2
}

// Output Configuration
export interface OutputConfig {
  format: 'json' | 'jsonl' | 'firestore' | 'supabase'
  outputDir: string
  chunkSize?: number // For database writes
  compression?: boolean // For large files
}

export const DEFAULT_OUTPUT_CONFIG: OutputConfig = {
  format: 'json',
  outputDir: './data/generated',
  chunkSize: 1000,
  compression: false
}
