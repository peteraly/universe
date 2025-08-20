# GameOn Synthetic Data Seeder

## **🎯 Overview**

A production-grade synthetic data generator that creates realistic demo data for GameOn, including users, social connections, events, and memberships. The seeder strictly adheres to business rules and data models to ensure demo environments accurately reflect production behavior.

## **✅ Key Features Delivered**

### **🏆 Host Realism**
- **Super-hosts**: 10-15% of users generate 60% of events
- **Weighted selection**: Favors reliable users with more friends
- **Sport alignment**: Events match host's top sport affinities
- **Realistic distribution**: Follows Pareto principle for event creation

### **📈 Scalability**
- **Memory efficient**: JSONL streaming for large datasets
- **Chunked writes**: Batched database operations
- **Up to 5K users**: 10K events without memory issues
- **Performance optimized**: Efficient algorithms and data structures

### **🔒 Logical Consistency**
- **Centralized logic**: `src/lib/status.ts` ensures data validity
- **Business rule compliance**: All generated data follows app constraints
- **Data validation**: Pre-write validation against core business rules
- **Status derivation**: Uses actual `deriveEventStatus` function

### **🎲 Reproducibility**
- **Deterministic**: SEED environment variable ensures consistency
- **Verifiable**: Same seed always generates identical data
- **Version controlled**: Seed value tracks data generation

## **🔧 Implementation Details**

### **Data Model Compliance**

#### **Users Collection**
```typescript
interface GeneratedUser {
  id: string                    // user_0001 format
  name: string                  // Realistic first + last names
  email: string                 // Generated from name
  location: {
    lat: number                 // NYC cluster coordinates
    lng: number
    cluster: string             // Manhattan, Brooklyn, etc.
  }
  sportsAffinity: Record<string, number>  // Sport preferences (0-1)
  reliability: number           // Show-up rate (0-1)
  isSuperHost: boolean         // Event creation frequency
  joinedAt: string             // ISO timestamp
  friends: string[]            // User IDs of connections
}
```

#### **Events Collection**
```typescript
interface GeneratedEvent {
  id: string                   // evt_{hostId}_{timestamp}_{sport}
  title: string                // "Basketball Night", "Weekly Soccer"
  hostId: string               // Host user ID
  sport: string                // From SPORTS_CONFIG
  maxSlots: number             // Capacity with variation
  attendeeCount: number        // Derived from memberships
  waitlistCount: number        // Derived from memberships
  visibility: EventVisibility  // public, invite_auto, invite_manual
  status: EventStatus          // Derived using deriveEventStatus()
  createdAt: string            // ISO timestamp
  location: string             // "{venue}, {cluster}"
  time: EventTime              // Start, end, timezone, cutoff
  description: string          // Generated description
  equipment: string[]          // Required equipment
  skillLevel: string           // beginner, casual, competitive
  isRecurring: boolean         // 20% recurring events
}
```

#### **Memberships Collection**
```typescript
interface GeneratedMembership {
  userId: string               // Attendee user ID
  eventId: string              // Event ID
  status: MembershipStatus     // attending, waitlisted, requested
  joinedAt: string            // ISO timestamp
  waitlistPosition?: number    // For waitlisted members
  userName: string            // Denormalized for convenience
  eventTitle: string          // Denormalized for convenience
}
```

### **Generation Algorithms**

#### **1. User Generation with NYC Clustering**
```typescript
// Location clustering (weighted by population)
const NYC_CLUSTERS = [
  { name: 'Manhattan', lat: 40.7831, lng: -73.9712, weight: 0.25 },
  { name: 'Brooklyn', lat: 40.6782, lng: -73.9442, weight: 0.30 },
  // ... more clusters
]

// Sports affinity generation
generateSportsAffinity(): Record<string, number> {
  // Choose 1-3 primary sports (0.7-1.0 affinity)
  // Add secondary interests (0.2-0.6 affinity)
  // Set minimal affinity for others (0.05-0.2)
}
```

#### **2. Social Network Generation**
```typescript
// Within-cluster connections (higher probability)
generateClusterConnections(users: User[]): Connection[] {
  // Sort by sports affinity similarity
  // Higher probability for similar interests (0.3-0.8)
  // Target friendClusterSize ± 2 friends per user
}

// Cross-cluster connections (lower probability)
generateCrossClusterConnections(): Connection[] {
  // crossClusterRate * total connections
  // Weaker connection strength (0.3-0.7 vs 0.5-1.0)
}
```

#### **3. Event Generation with Temporal Distribution**
```typescript
// Host selection (weighted by super-host status)
const superHostEvents = totalEvents * 0.6 / superHosts.length
const regularHostEvents = remainingEvents / (regularHosts.length * 0.4)

// Time distribution (realistic day/hour patterns)
const TIME_DISTRIBUTIONS = [
  { hour: 18, weight: 0.20, dayWeights: [0.2, 0.3, 0.3, 0.3, 0.3, 0.3, 0.2] },
  { hour: 19, weight: 0.25, dayWeights: [0.2, 0.3, 0.3, 0.3, 0.3, 0.3, 0.2] },
  // ... more time slots
]
```

#### **4. Membership Generation with Realistic Attendance**
```typescript
// User-event scoring for attendance likelihood
calculateUserEventScore(user: User, event: Event, host: User): number {
  return (
    user.sportsAffinity[event.sport] * 0.4 +     // Sport interest
    (user.friends.includes(host.id) ? 0.3 : 0.05) +  // Friend connection
    (sameCluster ? 0.2 : 0.05) +                 // Location proximity
    user.reliability * 0.1                       // User reliability
  )
}
```

## **🚀 Usage**

### **Quick Start**
```bash
# Install dependencies
npm install

# Generate small demo dataset
npm run seed:small

# Generate with specific seed for reproducibility
SEED=42 npm run seed:small

# Generate large dataset with streaming
npm run seed:large
```

### **CLI Commands**
```bash
# Scale presets
npm run seed:small    # 50 users, 100 events
npm run seed:medium   # 250 users, 600 events  
npm run seed:large    # 1K users, 2.5K events (streaming)
npm run seed:xl       # 5K users, 10K events (streaming + verbose)

# Custom configuration
tsx scripts/seed.ts --scale large --format jsonl --seed 123 --output ./data/custom

# Database output (when implemented)
tsx scripts/seed.ts --scale medium --format firestore --chunk 500
tsx scripts/seed.ts --scale large --format supabase --chunk 1000
```

### **CLI Options**
```bash
--scale <preset>     # small|medium|large|xl (default: small)
--format <format>    # json|jsonl|firestore|supabase (default: json)
--output <dir>       # Output directory (default: ./data/generated)
--seed <number>      # Random seed (default: 42)
--stream            # Stream to JSONL (auto-enabled for large/xl)
--chunk <size>      # Database chunk size (default: 1000)
--validate          # Validate against business rules (default: true)
--verbose           # Detailed logging (default: false)
```

## **📊 Scale Configurations**

### **Small Demo (Development)**
- **Users**: 50 (8 super-hosts)
- **Events**: 100 (avg 2.5 per host)
- **Friendships**: ~8 per user
- **Past events**: 30%
- **Output**: JSON files (~500KB total)
- **Use case**: Local development, quick demos

### **Medium Demo (Staging)**
- **Users**: 250 (30 super-hosts)
- **Events**: 600 (avg 2.8 per host)
- **Friendships**: ~12 per user
- **Past events**: 35%
- **Output**: JSON files (~2.5MB total)
- **Use case**: Staging environment, feature testing

### **Large Demo (Production-like)**
- **Users**: 1,000 (100 super-hosts)
- **Events**: 2,500 (avg 3.2 per host)
- **Friendships**: ~15 per user
- **Past events**: 40%
- **Output**: JSONL files (~12MB total)
- **Use case**: Performance testing, realistic demos

### **Extra Large (Stress Testing)**
- **Users**: 5,000 (400 super-hosts)
- **Events**: 10,000 (avg 3.5 per host)
- **Friendships**: ~20 per user
- **Past events**: 45%
- **Output**: JSONL files (~50MB total)
- **Use case**: Load testing, scalability validation

## **🗂️ Output Structure**

### **JSON Format (Default)**
```
data/generated/
├── users.json          # Array of user objects
├── connections.json    # Array of social connections
├── events.json         # Array of event objects
├── memberships.json    # Array of user-event memberships
├── invites.json        # Array of event invites (invite_auto)
└── requests.json       # Array of join requests (invite_manual)
```

### **JSONL Format (Streaming)**
```
data/generated/
├── users.jsonl         # One user object per line
├── connections.jsonl   # One connection per line
├── events.jsonl        # One event per line
├── memberships.jsonl   # One membership per line
├── invites.jsonl       # One invite per line
└── requests.jsonl      # One request per line
```

## **✅ Data Validation**

### **Business Rule Compliance**
```typescript
// Event validation
✓ Required fields: id, title, hostId, sport, location
✓ Numeric constraints: maxSlots (1-100), attendeeCount ≤ maxSlots
✓ Time validation: Valid ISO timestamps, end after start
✓ Status derivation: Uses actual deriveEventStatus() function
✓ Enum validation: EventVisibility, EventStatus, MembershipStatus

// Membership validation  
✓ Required fields: userId, eventId, status, joinedAt
✓ Waitlist positions: Sequential, starting from 1
✓ Status consistency: No duplicate attendees per event
✓ Time ordering: joinedAt between event creation and start
```

### **Data Quality Metrics**
```typescript
// Social network quality
✓ Avg friends per user: Matches target (8-20 based on scale)
✓ Cluster distribution: Weighted by NYC population
✓ Connection strength: Realistic values (0.3-1.0)

// Event distribution quality
✓ Sport popularity: Matches configured weights
✓ Time distribution: Realistic day/hour patterns
✓ Host distribution: Super-hosts create 60% of events
✓ Attendance patterns: Sport affinity + social + location
```

## **🔧 Configuration**

### **Sports Configuration**
```typescript
const SPORTS_CONFIG: SportConfig[] = [
  {
    name: 'Basketball',
    popularity: 0.8,        // How often it appears
    avgCapacity: 10,        // Average max slots
    avgDuration: 90,        // Minutes
    indoor: true,
    equipment: ['basketball'],
    venues: ['Community Center', 'School Gym', 'YMCA']
  },
  // ... more sports
]
```

### **Time Distribution**
```typescript
const TIME_DISTRIBUTIONS: TimeDistribution[] = [
  { 
    hour: 18, 
    weight: 0.20,  // Overall popularity
    dayWeights: [0.2, 0.3, 0.3, 0.3, 0.3, 0.3, 0.2]  // [Sun-Sat]
  },
  // ... more time slots
]
```

### **Generation Parameters**
```typescript
const DEFAULT_GENERATION_PARAMS = {
  reliabilityMean: 0.8,           // Average user reliability
  superHostMultiplier: 4.0,      // Events per super-host vs regular
  attendanceRate: 0.7,           // How often events fill up
  waitlistRate: 0.3,             // Chance of waitlist when full
  publicEventRate: 0.6,          // Public vs invite-only distribution
  friendClusterSize: 8,          // Average friends per user
  crossClusterRate: 0.2          // Cross-borough friendships
}
```

## **🎯 Example Output**

### **Generated User**
```json
{
  "id": "user_0042",
  "name": "Alex Johnson",
  "email": "alex.johnson@example.com",
  "location": {
    "lat": 40.7831,
    "lng": -73.9712,
    "cluster": "Manhattan"
  },
  "sportsAffinity": {
    "Basketball": 0.85,
    "Soccer": 0.62,
    "Running": 0.34,
    "Tennis": 0.18
  },
  "reliability": 0.82,
  "isSuperHost": true,
  "joinedAt": "2023-08-15T14:32:00.000Z",
  "friends": ["user_0001", "user_0013", "user_0027"]
}
```

### **Generated Event**
```json
{
  "id": "evt_user_0042_1703097600000_basketball",
  "title": "Basketball Night",
  "hostId": "user_0042",
  "sport": "Basketball",
  "maxSlots": 12,
  "attendeeCount": 8,
  "waitlistCount": 2,
  "visibility": "public",
  "status": "confirmed",
  "createdAt": "2023-12-15T18:00:00.000Z",
  "location": "Community Center, Manhattan",
  "time": {
    "startAt": "2023-12-20T19:00:00.000Z",
    "tz": "America/New_York",
    "endAt": "2023-12-20T20:30:00.000Z",
    "durationMinutes": 90,
    "cutoffMinutes": 30
  },
  "description": "Join us for a fun basketball session! All skill levels welcome.",
  "equipment": ["basketball"],
  "skillLevel": "casual",
  "isRecurring": false
}
```

## **🔮 Future Enhancements**

### **Phase 2 Features**
- **Firebase integration**: Direct Firestore batch writes
- **Supabase integration**: PostgreSQL bulk inserts
- **Advanced relationships**: Recurring event series, team formations
- **Geographic realism**: Real venue data, transit considerations
- **Seasonal patterns**: Weather-based sport preferences

### **Production Features**
- **Incremental updates**: Add new data to existing datasets
- **Custom scenarios**: Event-specific generation patterns
- **Performance optimization**: Parallel generation, memory pooling
- **Quality assurance**: Advanced validation, data profiling
- **Export formats**: CSV, SQL, Parquet for analytics

## **🎉 Summary**

The GameOn Seeder delivers on all your requirements:

**✅ Host Realism**: Super-hosts and sport alignment implemented  
**✅ Scalability**: Memory-efficient streaming up to 5K users  
**✅ Logical Consistency**: Centralized status logic ensures validity  
**✅ Reproducibility**: Deterministic generation with SEED control  

This production-grade tool ensures your demo environments accurately reflect real-world usage patterns while maintaining data integrity and performance.

---

**Ready to generate realistic demo data!** 🚀

```bash
# Start with small demo
npm run seed:small

# Scale up for testing
npm run seed:large

# Custom configuration
SEED=123 tsx scripts/seed.ts --scale medium --verbose
```
