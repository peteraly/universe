# GameOn Seed Data Generator

A comprehensive seed data generator for GameOn that creates realistic, interconnected event data with proper business logic and social relationships.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Generate default dataset (150 users, 200 events)
npm run generate

# Generate different sizes
npm run generate:small    # 50 users, 100 events
npm run generate:medium   # 150 users, 200 events  
npm run generate:large    # 500 users, 1000 events

# Generate for different cities
npm run generate:nyc      # New York City
npm run generate:atl      # Atlanta
npm run generate:la       # Los Angeles
npm run generate:chi      # Chicago
npm run generate:miami    # Miami
```

## 📊 What It Generates

### **Users (150 default)**
- **Realistic profiles** with names, emails, avatars, bios
- **Sports affinities** with weighted preferences (0.3-1.0)
- **Social connections** with average 8 friends per user
- **Activity levels** (low/medium/high) and join frequency
- **Super hosts** (15% of users) with higher event creation rates

### **Events (200 default)**
- **17 different sports/activities** with realistic venues
- **Time distribution**: 15% past week, 10% past month, 60% next month, 10% next quarter, 5% far future
- **Visibility mix**: 70% public, 20% invite-auto, 10% invite-manual
- **Proper status derivation** (pending/confirmed/locked/ended/cancelled)
- **Realistic capacity** based on sport type

### **Relationships**
- **Memberships**: attending/waitlisted with proper ordering
- **Invites**: for invite-auto events with expiration dates
- **Requests**: for invite-manual events with approval/denial status
- **Social graph**: preferential attachment with clustering

## 🎯 Enhanced Features

### **More Sports & Activities**
```javascript
// Team Sports
basketball, soccer, volleyball, ultimate

// Racket Sports  
tennis, pickleball, badminton

// Fitness & Movement
running, cycling, yoga, pilates

// Social & Creative
board_games, photography, painting

// Water Sports
kayaking, paddleboarding

// Winter Sports
ice_skating, sledding
```

### **Realistic Social Graph**
- **Clustered connectivity** for better community formation
- **Preferential attachment** for realistic hub formation
- **Activity-based super hosts** selection
- **Geographic clustering** by neighborhood

### **Enhanced Business Logic**
- **Sport-specific fill rates** (team sports fill faster)
- **Visibility-based participation** rules
- **Proper waitlist ordering** with timestamps
- **Status derivation** based on time and attendance

## 📁 Output Files

Generated in `./seed/` directory:

```
seed/
├── users.jsonl          # User profiles with social data
├── events.jsonl         # Event details with attendees
├── memberships.jsonl    # User-event relationships
├── invites.jsonl        # Invite records for invite-only events
├── requests.jsonl       # Request records for manual approval
└── dataset.json         # Combined JSON for easy import
```

## 🔧 Configuration Options

### **Command Line Arguments**
```bash
# Basic usage
node generateSeed.mjs

# Custom sizes
node generateSeed.mjs --users=300 --events=500

# Different cities
node generateSeed.mjs --city=LA

# Reproducible runs
node generateSeed.mjs --seed=42

# All options
node generateSeed.mjs --users=200 --events=300 --city=CHI --seed=123
```

### **Available Cities**
- `NYC` - New York City (default)
- `ATL` - Atlanta  
- `LA` - Los Angeles
- `CHI` - Chicago
- `MIA` - Miami

## 📈 Data Quality Features

### **Invariant Enforcement**
- ✅ **Capacity consistency**: `attendeeCount === attendees.length`
- ✅ **No overlaps**: Users can't be both attending and waitlisted
- ✅ **Proper ordering**: Waitlist positions are sequential
- ✅ **Status consistency**: Events have proper temporal status

### **Realistic Distributions**
- ✅ **Time buckets**: Realistic past/future event distribution
- ✅ **Fill rates**: Sport and visibility-based participation
- ✅ **Social clustering**: Geographic and interest-based groups
- ✅ **Activity patterns**: High-activity users create more events

### **Business Logic Compliance**
- ✅ **Host attendance**: Event creators always attend their events
- ✅ **Visibility rules**: Proper invite/request workflows
- ✅ **Status derivation**: Events have correct pending/confirmed status
- ✅ **Waitlist logic**: Proper overflow handling

## 🎮 Integration with GameOn

### **Data Structure Compatibility**
The generated data matches GameOn's expected format:

```typescript
interface EventWithAttendees {
  id: string
  title: string
  sport: string
  startAt: string
  endAt: string
  maxSlots: number
  attendeeCount: number
  waitlistCount: number
  status: 'pending' | 'confirmed' | 'cancelled'
  visibility: 'public' | 'invite_auto' | 'invite_manual'
  attendees: Array<{ userId: string; user: User }>
  waitlist: Array<{ userId: string; user: User; position: number }>
  memberships: EventMembership[]
  // ... other fields
}
```

### **Import into GameOn**
```javascript
// Load the generated dataset
import dataset from './seed/dataset.json'

// Use in your GameOn app
const { users, events, memberships, invites, requests } = dataset
```

## 🧪 Testing Scenarios

The seeder creates data perfect for testing:

### **Edge Cases**
- **Full events** with waitlists
- **Empty events** (pending status)
- **Cancelled events** 
- **Locked events** (past cutoff time)
- **Ended events** (past end time)

### **Social Scenarios**
- **High-activity users** with many friends
- **Isolated users** with few connections
- **Super hosts** creating multiple events
- **Geographic clusters** of users

### **Business Workflows**
- **Public events** with open joining
- **Invite-only events** with invitation workflow
- **Manual approval** events with request/response
- **Waitlist promotion** scenarios

## 🚀 Performance

- **Fast generation**: ~2-3 seconds for 150 users, 200 events
- **Memory efficient**: Streams JSONL output
- **Scalable**: Handles up to 1000+ users/events
- **Reproducible**: Seed-based generation for consistent testing

## 📝 Example Output

```bash
🚀 Generating GameOn seed data...
   Users: 150
   Events: 200
   City: NYC

🎉 Seed generated successfully!
📁 Output directory: ./seed/

📊 Summary:
👥 Users: 150
🎯 Events: 200
🔗 Memberships: 1,847
📨 Invites: 2,341
📝 Requests: 1,156

🎯 Event Distribution:
   Visibility: { public: 140, invite_auto: 40, invite_manual: 20 }
   Sports: { basketball: 23, soccer: 18, tennis: 15, ... }

📈 Event Status:
   Full events: 67 (33.5%)
   Confirmed: 156 (78.0%)
   Pending: 44 (22.0%)

👥 Social Graph:
   Average friends per user: 8.2
   Super hosts: 23
```

## 🤝 Contributing

To add new sports, venues, or cities:

1. **Add to SPORTS array** with capacity ranges and venues
2. **Add to CITY_CLUSTERS** with neighborhood names  
3. **Update scoring functions** if needed
4. **Test with different seeds** to ensure quality

## 📄 License

MIT License - feel free to use and modify for your GameOn implementation!
