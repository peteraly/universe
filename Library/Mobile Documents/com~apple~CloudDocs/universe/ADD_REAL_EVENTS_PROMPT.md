# Add Real Events to Discovery Dial - Implementation Prompt

## 🎯 Objective

Add 77 real events from **ThingsToDoDC.com** and **Kennedy Center** to the event discovery system, properly categorized and geocoded for display on the map and dial interface.

---

## 📋 Event Data to Add

### Source 1: ThingsToDoDC.com Events (E-001 to E-010)
- Embassy visits and cultural events
- Outdoor tours and activities
- Virtual tours
- Halloween-themed events

### Source 2: Kennedy Center Events (E-011 to E-077)
- National Symphony Orchestra performances
- Theater productions (Shear Madness, etc.)
- Opera (Aida by Washington National Opera)
- Ballet (Washington Ballet, BODYTRAFFIC)
- Chamber music concerts
- Film screenings
- Educational workshops

---

## 🗂️ Category Mapping

Map the provided events to existing categories and subcategories:

### **Arts/Culture** (South - Primary Category)

#### Music Subcategory:
- E-012: Glenn Miller Orchestra
- E-015, E-017, E-022, E-023, E-025: NATIONAL SYMPHONY ORCHESTRA: Super Cello!
- E-018: Christylez Bacon and Friends
- E-019, E-023: NATIONAL SYMPHONY ORCHESTRA: An Evening of Beethoven
- E-028: NATIONAL SYMPHONY ORCHESTRA: NSO Presents: Matthias Goerne & Daniil Trifonov
- E-029: Duo Atlantis: Echoes Across the Atlantic
- E-031: Giorgi Mikadze
- E-032: Jack Gruber
- E-034: FORTAS CHAMBER MUSIC CONCERTS: Bridge to Beethoven Pt. 1
- E-036: Andrew Martinez
- E-037, E-045, E-050: NATIONAL SYMPHONY ORCHESTRA: Marvel Studios' Infinity Saga Concert Experience
- E-048: Johann Strauss Quartet
- E-058, E-061: NATIONAL SYMPHONY ORCHESTRA: Halloween Spooktacular
- E-066: Le Vent du Nord
- E-070: Charles Covington Quartet
- E-071, E-075: NATIONAL SYMPHONY ORCHESTRA: Don Juan & Romeo and Juliet | Grimaud plays Gershwin
- E-076: All Poets & Heroes
- E-011: Apoorva Krishna

#### Theater Subcategory:
- E-013, E-020, E-026, E-030, E-032, E-035, E-039, E-051, E-062, E-065, E-069, E-074, E-077: Shear Madness (comedy theater)
- E-040, E-047, E-052, E-056: THE WASHINGTON BALLET PRESENTS: Moving Forces (dance/ballet)
- E-064, E-068, E-073: BODYTRAFFIC performances
- E-038, E-044, E-049, E-055, E-067, E-072: WASHINGTON NATIONAL OPERA: Aida

#### Film Subcategory:
- E-024: MILLENNIUM STAGE FILMS: Extraordinary Cinema: Agatha Christie's Death on the Nile
- E-059: MILLENNIUM STAGE FILMS: Extraordinary Cinema: To Catch a Thief

#### Galleries Subcategory:
- E-016, E-021, E-043, E-053: THE REACH: Moonshot Studio (interactive art space)

#### Festivals/Special Events:
- E-014, E-041: KC Speakeasy (special nightlife event)
- E-057, E-063: THE ROYAL FOUNDATION PRESENT: 2025 World Stage Tour Gala Concert
- E-042, E-046, E-054, E-060: Little Murmur (family performance - could be Family category)

### **Social** (East)

#### Parties Subcategory:
- E-003: Margarita Cruise on the Potomac
- E-010: Halloween Margarita Boo Cruise on the Potomac

#### Networking/Cultural Subcategory:
- E-001: Evening at the Embassy of Saudi Arabia
- E-008: Evening at the Embassy of North Macedonia with the Ambassador
- E-009: Exclusive Tour of the National Islamic Center

### **Recreation** (West or another cardinal direction)

#### Outdoors Subcategory:
- E-002: Hiking the Site of the Blair Witch Project – 30 Year Anniversary

#### Tours Subcategory:
- E-004: Haunted Leesburg Parapsychologist Tour – and you WILL TOUCH A GHOST
- E-005: GHOST TOUR: President Lincoln Assassination Guided Walking Tour

### **Educational/Professional** (North)

#### Virtual/Online:
- E-006: Virtual Dracula's Tour of Transylvania
- E-007: Real Pirates of the Caribbean Virtual Tour

#### Workshops/Classes:
- E-027: SOUND HEALTH NETWORK: Dance for Parkinson's Disease

---

## 📍 Geocoding Requirements

### Kennedy Center Events (E-011 to E-077)
**Address:** 2700 F St NW, Washington, DC 20566  
**Coordinates:** 
- Latitude: `38.8954`
- Longitude: `-77.0555`

### ThingsToDoDC.com Events - Research Needed
Events marked "TBD - Needs Research" require geocoding:

1. **E-001: Embassy of Saudi Arabia**
   - Research actual embassy address in Washington DC
   - Get lat/long coordinates

2. **E-002: Blair Witch Project Site**
   - Location: Burkittsville, MD (near Montgomery County, MD)
   - Research exact hiking trail starting point

3. **E-003, E-010: Potomac River Cruises**
   - Likely departs from Georgetown or Southwest Waterfront
   - Use typical DC cruise departure point (e.g., Georgetown Waterfront, 3100 K St NW)
   - Suggested coordinates: `38.9027, -77.0595`

4. **E-004: Haunted Leesburg**
   - Location: Leesburg, VA
   - Research specific meeting point
   - Approximate: `39.1157, -77.5636`

5. **E-005: Lincoln Assassination Tour**
   - Walking tour likely starts at Ford's Theatre: `511 10th St NW, Washington, DC 20004`
   - Coordinates: `38.8967, -77.0258`

6. **E-008: Embassy of North Macedonia**
   - Research actual embassy address
   - Get lat/long coordinates

7. **E-009: National Islamic Center**
   - Address: `2551 Massachusetts Ave NW, Washington, DC 20008`
   - Coordinates: `38.9189, -77.0546`

### Virtual Events (E-006, E-007)
- No physical location needed
- Use placeholder coordinates or mark as "Virtual/Online"
- Consider adding a "Virtual" category or tag

---

## 🛠️ Implementation Steps

### Step 1: Create New Events Data File
Create: `discovery-dial/src/data/realEvents.js`

```javascript
export const REAL_EVENTS = [
  {
    id: 'kennedy-center-apoorva-krishna',
    name: 'Apoorva Krishna',
    description: 'An evening of classical music performance at the Kennedy Center.',
    categoryPrimary: 'Arts/Culture',
    categorySecondary: 'Music',
    venue: 'Kennedy Center',
    address: '2700 F St NW, Washington, DC 20566',
    latitude: 38.8954,
    longitude: -77.0555,
    time: 'Evening',
    day: 'Today',
    date: '2025-10-17',
    startTime: '18:00',
    endTime: '20:00', // Estimate 2-hour performance
    price: 'Varies',
    attendees: 0,
    maxAttendees: 500,
    organizer: 'Kennedy Center',
    tags: ['music', 'classical', 'concert'],
    website: 'https://www.kennedy-center.org/whats-on/calendar/',
    source: 'kennedy-center'
  },
  // ... continue for all 77 events
];
```

### Step 2: Format Event Properties

For each event, ensure these properties:

#### Required Fields:
- `id`: Unique identifier (e.g., `'kennedy-center-shear-madness-oct17'`)
- `name`: Event name/title
- `description`: Generated description (e.g., "Experience [Event Name] at [Venue]")
- `categoryPrimary`: Primary category ('Arts/Culture', 'Social', 'Recreation', etc.)
- `categorySecondary`: Subcategory ('Music', 'Theater', 'Parties', etc.)
- `venue`: Venue name
- `address`: Full street address
- `latitude`: Decimal coordinates
- `longitude`: Decimal coordinates
- `date`: ISO format date (YYYY-MM-DD)
- `startTime`: 24-hour format (HH:MM)
- `time`: Human-readable time range or period ('Morning', 'Afternoon', 'Evening', 'Night')
- `day`: Relative day ('Today', 'Tomorrow', 'This Week', 'Weekend')

#### Optional Fields:
- `endTime`: 24-hour format (HH:MM)
- `price`: Ticket price or 'Free' or 'Varies'
- `attendees`: Current attendance (0 for new events)
- `maxAttendees`: Venue capacity estimate
- `organizer`: Event organizer/presenter
- `tags`: Array of relevant tags
- `website`: Event URL
- `source`: Data source identifier

### Step 3: Time Categorization

Map start times to time periods:
```javascript
// Morning: 06:00 - 11:59
// Afternoon: 12:00 - 16:59
// Evening: 17:00 - 20:59
// Night: 21:00 - 05:59

const getTimePeriod = (startTime) => {
  const hour = parseInt(startTime.split(':')[0]);
  if (hour >= 6 && hour < 12) return 'Morning';
  if (hour >= 12 && hour < 17) return 'Afternoon';
  if (hour >= 17 && hour < 21) return 'Evening';
  return 'Night';
};
```

### Step 4: Day Categorization

Calculate relative day based on event date:
```javascript
const getRelativeDay = (eventDate) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const event = new Date(eventDate);
  event.setHours(0, 0, 0, 0);
  
  const diffTime = event - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Tomorrow';
  if (diffDays >= 2 && diffDays <= 7) return 'This Week';
  if (diffDays > 7 && diffDays <= 14) return 'Next Week';
  if (event.getDay() === 6 || event.getDay() === 0) return 'Weekend';
  return 'This Week';
};
```

### Step 5: Generate Descriptions

Create engaging descriptions for events without descriptions:
```javascript
const generateDescription = (event) => {
  const templates = {
    'Music': `Experience ${event.name} at ${event.venue}. An unforgettable evening of live music.`,
    'Theater': `Don't miss ${event.name} at ${event.venue}. A must-see theatrical performance.`,
    'Parties': `Join us for ${event.name}! ${event.description || 'A great time awaits!'}`,
    'Tours': `Explore ${event.name}. ${event.description || 'Discover the history and culture.'}`,
    'Film': `Watch ${event.name} at ${event.venue}. ${event.description || 'A cinematic experience.'}`,
  };
  
  return templates[event.categorySecondary] || `Join us for ${event.name} at ${event.venue}.`;
};
```

### Step 6: Integrate with Existing Data

Update: `discovery-dial/src/data/comprehensiveSampleEvents.js`

```javascript
import { REAL_EVENTS } from './realEvents';

// Merge real events with sample events
export const COMPREHENSIVE_SAMPLE_EVENTS = [
  ...EXISTING_SAMPLE_EVENTS, // Keep existing
  ...REAL_EVENTS // Add new real events
];
```

### Step 7: Handle Special Cases

#### Recurring Events (e.g., Shear Madness appears 13 times):
```javascript
// Create unique IDs for each occurrence
{
  id: 'kennedy-center-shear-madness-oct17-2000',
  name: 'Shear Madness',
  // ... other fields
  date: '2025-10-17',
  startTime: '20:00'
},
{
  id: 'kennedy-center-shear-madness-oct18-2000',
  name: 'Shear Madness',
  // ... other fields
  date: '2025-10-18',
  startTime: '20:00'
}
```

#### Canceled Events:
```javascript
{
  id: 'kennedy-center-little-murmur-canceled',
  name: 'Little Murmur (Canceled)',
  // Add tag to indicate cancellation
  tags: ['canceled', 'family', 'performance'],
  // Optionally exclude from active events
  status: 'canceled'
}
```

#### Virtual Events:
```javascript
{
  id: 'thingstodo-dracula-virtual-tour',
  name: 'Virtual Dracula\'s Tour of Transylvania',
  venue: 'Online/Virtual',
  address: 'Virtual Event - Online',
  latitude: 38.9072, // DC coordinates as default
  longitude: -77.0369,
  tags: ['virtual', 'tour', 'halloween', 'online'],
  // Add virtual indicator
  isVirtual: true
}
```

---

## 📊 Expected Output

After implementation, the system should have:

1. **Total Events:** 288 (existing) + 77 (new) = **365 events**
2. **Kennedy Center Events:** 67 music, theater, opera, ballet performances
3. **ThingsToDoDC Events:** 10 tours, embassy visits, cruises
4. **Geographic Coverage:** Primarily Washington DC, some Maryland/Virginia
5. **Date Range:** October 17-31, 2025

---

## ✅ Testing Checklist

After adding events, verify:

- [ ] All events appear in the event list
- [ ] Events are correctly categorized (Arts/Culture, Social, etc.)
- [ ] Map pins appear at correct locations
- [ ] Kennedy Center shows cluster of 67 events
- [ ] Filtering by category shows correct events
- [ ] Filtering by subcategory works (Music, Theater, etc.)
- [ ] Time filtering works (Morning, Afternoon, Evening, Night)
- [ ] Date filtering works (Today, Tomorrow, This Week)
- [ ] Event cards display all information correctly
- [ ] Geocoding is accurate for all venues
- [ ] No duplicate event IDs
- [ ] Virtual events are properly marked
- [ ] Canceled events are handled appropriately

---

## 🎨 UI Enhancements (Optional)

Consider these enhancements for real event display:

1. **Event Source Badge:**
   ```jsx
   {event.source === 'kennedy-center' && (
     <span className="event-source-badge">Kennedy Center</span>
   )}
   ```

2. **Virtual Event Indicator:**
   ```jsx
   {event.isVirtual && (
     <span className="virtual-badge">🌐 Virtual</span>
   )}
   ```

3. **Popular Venue Highlighting:**
   - Highlight Kennedy Center cluster on map
   - Show "67 events at this venue" tooltip

4. **Event Series Grouping:**
   - Group recurring events (e.g., "Shear Madness - Multiple Dates")
   - Allow expanding to see all dates

---

## 📝 Notes

- **Address Research:** Some ThingsToDoDC events need actual addresses researched
- **End Times:** Most events don't have end times - estimate based on event type:
  - Symphony: 2-2.5 hours
  - Theater: 2 hours
  - Tours: 1.5-2 hours
  - Cruises: 2-3 hours
  
- **Pricing:** Many events show "Varies" - consider linking to ticket pages

- **Capacity:** Kennedy Center capacities vary by hall:
  - Concert Hall: 2,465 seats
  - Opera House: 2,347 seats
  - Eisenhower Theater: 1,161 seats
  - Terrace Theater: 513 seats

---

## 🚀 Priority Order

1. **High Priority:** Kennedy Center events (E-011 to E-077) - Complete venue data available
2. **Medium Priority:** DC-based ThingsToDoDC events (E-001, E-005, E-009)
3. **Low Priority:** Events requiring extensive research (E-002, E-004) or virtual events (E-006, E-007)

---

**Implementation Time Estimate:** 2-3 hours for full integration with all 77 events properly formatted, geocoded, and categorized.

