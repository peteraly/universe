# TIME FILTER EVENT CORRELATION - Implementation Mandate
## Ensure Time Picker Actively Filters Events by Category + Time

---

## 🎯 OBJECTIVE
Implement **active time-based filtering** that works in conjunction with the Discovery Dial's category selection. Events must be filtered by BOTH time (from picker) AND category (from dial) using logical AND, with smart defaults for first-time users.

---

## 📋 CURRENT STATE

### What Works:
✅ Time picker UI is functional (scrubbing, markers, bubble)  
✅ Dial category selection works (N/E/S/W, subcategories)  
✅ Touch exclusion prevents gesture conflicts  

### What's Missing:
❌ Time picker selection doesn't filter events yet  
❌ Events don't have `startTime` field for filtering  
❌ No default time behavior on app load  
❌ Time + Category filtering not connected  

---

## 🔧 IMPLEMENTATION REQUIREMENTS

### A. Event Data Structure Enhancement

#### Current Event Format:
```json
{
  "id": "e1",
  "name": "Policy Summit",
  "tags": ["Panel"],
  "address": "100 Main St",
  "time": "Today 2–4 PM",  // ← Display-only, not filterable
  "distance": "1.2 mi"
}
```

#### Required Enhancement:
```json
{
  "id": "e1",
  "name": "Policy Summit",
  "tags": ["Panel"],
  "address": "100 Main St",
  "time": "Today 2–4 PM",      // Display string (unchanged)
  "startTime": "2:00 PM",       // NEW: Filterable time
  "date": "2025-10-13",         // NEW: ISO date for "today/this week" logic
  "distance": "1.2 mi",
  "primaryCategory": "Professional",  // NEW: For category filtering
  "subcategory": "Talks"              // NEW: For subcategory filtering
}
```

**Why These Fields:**
- `startTime`: Parseable time string for filtering ("2:00 PM", "7:30 PM")
- `date`: ISO date for determining "today", "this week", etc.
- `primaryCategory`: Links event to dial's N/E/S/W categories
- `subcategory`: Links event to dial's rotation subcategories

---

### B. Default Behavior (No Time Selected)

#### User Story:
> "When I open the app, I want to see events happening **today and this week**, not just events starting right now."

#### Recommended Default Logic:

**Option 1: "Today + This Week" (Recommended)**
```javascript
// Default: Show all events from now through end of week
const defaultFilter = {
  startDate: new Date(), // Today
  endDate: getEndOfWeek(new Date()), // Sunday 11:59 PM
  minTime: getCurrentTime() // But only events starting now or later today
};

// Logic:
// - Today's events: Show if startTime >= currentTime
// - Future days this week: Show all events
```

**Option 2: "Next 24 Hours"**
```javascript
// Show events in the next 24 hours
const defaultFilter = {
  startDateTime: new Date(),
  endDateTime: new Date(Date.now() + 24 * 60 * 60 * 1000)
};
```

**Option 3: "Today Only"**
```javascript
// Show only today's events starting now or later
const defaultFilter = {
  date: getTodayDate(),
  minTime: getCurrentTime()
};
```

**Recommendation**: **Option 1** (Today + This Week)
- **Why**: Provides discovery beyond just today
- **Why**: Users can plan ahead (see tomorrow, this weekend)
- **Why**: More events = better discovery experience
- **Why**: Aligns with "Discovery" mindset (explore what's coming)

---

### C. Time Picker Behavior (Time Selected)

#### User Story:
> "When I select 7:00 PM on the time picker, I want to see events starting at or after 7:00 PM **across all days this week**."

#### Filtering Logic:
```javascript
function filterEventsByTime(events, selectedTime, dialState) {
  return events.filter(event => {
    // 1. TIME FILTER: Event starts at or after selected time
    const eventTime = parseEventTime(event.startTime); // "7:30 PM" → { hours: 19, minutes: 30 }
    const timeMatch = isAtOrAfter(eventTime, selectedTime);
    
    // 2. DATE FILTER: Event is today or this week
    const eventDate = new Date(event.date);
    const today = new Date();
    const endOfWeek = getEndOfWeek(today);
    const dateMatch = eventDate >= today && eventDate <= endOfWeek;
    
    // 3. CATEGORY FILTER: Matches active primary category
    const categoryMatch = event.primaryCategory === dialState.activePrimary?.label;
    
    // 4. SUBCATEGORY FILTER: Matches active subcategory
    const subcategoryMatch = event.subcategory === dialState.activeSub?.label;
    
    // LOGICAL AND: All must be true
    return timeMatch && dateMatch && categoryMatch && subcategoryMatch;
  });
}
```

**Example Scenarios:**

| User Action | Time Picker | Dial Category | Result |
|-------------|-------------|---------------|--------|
| App loads | (default: current time) | Social | All Social events today + this week, starting now or later |
| Selects 7PM | 7:00 PM | Social | All Social events at/after 7PM, today + this week |
| Swipes to Educational | 7:00 PM | Educational | All Educational events at/after 7PM, today + this week |
| Rotates to Workshops | 7:00 PM | Educational → Workshops | All Workshop events at/after 7PM, today + this week |
| Selects 12AM | 12:00 AM | Workshops | All Workshop events, any time, today + this week |

---

### D. Smart Time Defaults

#### Recommendation: Context-Aware Defaults

```javascript
function getSmartDefaultTime() {
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinutes = now.getMinutes();
  
  // Late night (11 PM - 5 AM): Default to 6 PM (evening discovery for next day)
  if (currentHour >= 23 || currentHour < 5) {
    return { hours: 18, minutes: 0 }; // 6:00 PM
  }
  
  // Early morning (5 AM - 9 AM): Default to current time (morning events)
  if (currentHour >= 5 && currentHour < 9) {
    return { hours: currentHour, minutes: currentMinutes };
  }
  
  // Daytime (9 AM - 5 PM): Default to current time (ongoing/upcoming events)
  if (currentHour >= 9 && currentHour < 17) {
    return { hours: currentHour, minutes: currentMinutes };
  }
  
  // Evening (5 PM - 11 PM): Default to current time (tonight's events)
  return { hours: currentHour, minutes: currentMinutes };
}
```

**Rationale:**
- **Late night**: People planning for tomorrow evening
- **Morning/Daytime**: Show what's happening now/soon
- **Evening**: Show tonight's remaining events

---

### E. Visual Feedback for Filtering

#### Show Filter Status:
```jsx
{/* Optional: Show active filters */}
<div style={{
  position: 'fixed',
  bottom: '20px',
  left: '50%',
  transform: 'translateX(-50%)',
  background: 'rgba(0, 0, 0, 0.8)',
  color: 'white',
  padding: '8px 16px',
  borderRadius: '20px',
  fontSize: '12px',
  opacity: 0.7,
  pointerEvents: 'none'
}}>
  {formatTime(selectedTime.hours, selectedTime.minutes)} • {activePrimary.label} • {activeSub.label}
</div>
```

#### Show Event Count:
```jsx
{/* Show how many events match */}
<div style={{ fontSize: '11px', opacity: 0.5, marginTop: '4px' }}>
  {filteredEvents.length} events found
</div>
```

---

## 🛠️ IMPLEMENTATION STEPS

### Step 1: Enhance Event Data (categories.json)

**File**: `src/data/categories.json`

**Add fields to each event:**
```json
{
  "id": "e1",
  "name": "Policy Summit",
  "tags": ["Panel"],
  "address": "100 Main St",
  "time": "Today 2–4 PM",
  "startTime": "2:00 PM",           // ADD THIS
  "date": "2025-10-13",             // ADD THIS (ISO format)
  "distance": "1.2 mi",
  "primaryCategory": "Professional", // ADD THIS
  "subcategory": "Talks"            // ADD THIS
}
```

**Script to auto-generate (if needed):**
```javascript
// Helper to add missing fields based on event structure
function enhanceEvents(categories) {
  return categories.map(category => ({
    ...category,
    subcategories: category.subcategories.map(sub => ({
      ...sub,
      events: sub.events.map(event => ({
        ...event,
        // Extract startTime from display time
        startTime: extractStartTime(event.time), // "Today 2–4 PM" → "2:00 PM"
        // Set date based on "Today", "Tomorrow", etc.
        date: extractDate(event.time), // "Today" → "2025-10-13"
        // Add category links
        primaryCategory: category.label,
        subcategory: sub.label
      }))
    }))
  }));
}
```

---

### Step 2: Update useTimeFilter Hook

**File**: `src/hooks/useTimeFilter.js`

**Current** (doesn't filter by time):
```javascript
const filteredEvents = useMemo(() => {
  // Only filters by category, not time
  return events.filter(event => {
    const categoryMatch = event.primaryCategory === dialState.activePrimary?.label;
    return categoryMatch;
  });
}, [events, dialState]);
```

**Enhanced** (filters by time + date + category):
```javascript
const filteredEvents = useMemo(() => {
  if (!events || events.length === 0) return [];
  if (!dialState || !dialState.activePrimary) return events;

  const today = new Date();
  const endOfWeek = getEndOfWeek(today);

  return events.filter(event => {
    // 1. DATE FILTER: Today or this week
    const eventDate = new Date(event.date);
    const dateMatch = eventDate >= today && eventDate <= endOfWeek;
    if (!dateMatch) return false;

    // 2. TIME FILTER: At or after selected time (for today only)
    const eventTime = parseEventTime(event.startTime);
    const isToday = isSameDay(eventDate, today);
    const timeMatch = isToday 
      ? isAtOrAfter(eventTime, selectedTime)
      : true; // Future days: show all times

    // 3. CATEGORY FILTER
    const categoryMatch = event.primaryCategory === dialState.activePrimary?.label;

    // 4. SUBCATEGORY FILTER
    const subcategoryMatch = dialState.activeSub
      ? event.subcategory === dialState.activeSub?.label
      : true;

    return dateMatch && timeMatch && categoryMatch && subcategoryMatch;
  });
}, [events, selectedTime, dialState]);
```

---

### Step 3: Add Date Helper Functions

**File**: `src/utils/timeHelpers.js`

**Add these functions:**
```javascript
/**
 * Get end of current week (Sunday 11:59 PM)
 */
export function getEndOfWeek(date = new Date()) {
  const end = new Date(date);
  const day = end.getDay();
  const diff = 6 - day; // Days until Sunday
  end.setDate(end.getDate() + diff);
  end.setHours(23, 59, 59, 999);
  return end;
}

/**
 * Check if two dates are the same day
 */
export function isSameDay(date1, date2) {
  return date1.getFullYear() === date2.getFullYear() &&
         date1.getMonth() === date2.getMonth() &&
         date1.getDate() === date2.getDate();
}

/**
 * Extract start time from display string
 * "Today 2–4 PM" → "2:00 PM"
 * "Tonight 7 PM" → "7:00 PM"
 */
export function extractStartTime(timeString) {
  // Match patterns like "2–4 PM", "7 PM", "2:30 PM"
  const match = timeString.match(/(\d{1,2}):?(\d{2})?\s*(AM|PM)/i);
  if (!match) return "12:00 PM"; // Default fallback
  
  const hours = match[1];
  const minutes = match[2] || "00";
  const period = match[3];
  
  return `${hours}:${minutes} ${period}`;
}

/**
 * Extract date from display string
 * "Today" → current date
 * "Tomorrow" → current date + 1
 * "Tonight" → current date
 */
export function extractDate(timeString) {
  const today = new Date();
  
  if (timeString.includes("Tomorrow")) {
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  }
  
  // "Today", "Tonight", or specific date
  return today.toISOString().split('T')[0];
}
```

---

### Step 4: Update Default Time Logic

**File**: `src/components/EventCompassFinal.jsx`

**Current**:
```javascript
const [selectedTime, setSelectedTime] = useState(() => {
  const now = getCurrentTime();
  if (now.hours >= 23) {
    return { hours: 18, minutes: 0 };
  }
  return now;
});
```

**Enhanced** (smart defaults):
```javascript
const [selectedTime, setSelectedTime] = useState(() => {
  const now = new Date();
  const currentHour = now.getHours();
  
  // Late night: Default to 6 PM for next day discovery
  if (currentHour >= 23 || currentHour < 5) {
    return { hours: 18, minutes: 0 };
  }
  
  // Daytime: Use current time
  return { hours: currentHour, minutes: now.getMinutes() };
});
```

---

### Step 5: Show Filter Feedback (Optional)

**File**: `src/components/EventCompassFinal.jsx`

**Add below event readout:**
```jsx
{/* Filter status indicator */}
{filteredEvents.length > 0 && (
  <div style={{
    marginTop: '8px',
    fontSize: '11px',
    opacity: 0.5,
    color: 'white',
    textAlign: 'center'
  }}>
    {filteredEvents.length} event{filteredEvents.length !== 1 ? 's' : ''} • 
    {formatTime(selectedTime.hours, selectedTime.minutes)}+
  </div>
)}

{/* No events message */}
{filteredEvents.length === 0 && (
  <div style={{
    marginTop: '20px',
    fontSize: '14px',
    opacity: 0.6,
    color: 'white',
    textAlign: 'center'
  }}>
    No events found<br/>
    <span style={{ fontSize: '12px' }}>
      Try a different time or category
    </span>
  </div>
)}
```

---

## 🧪 TESTING PROTOCOL

### Test 1: Default Behavior (No Time Selected)
1. Open app fresh (clear cache)
2. **Verify**: Time picker shows current time (or 6PM if late night)
3. **Verify**: Events shown are from today + this week
4. **Verify**: Only events matching default category are shown

### Test 2: Time Selection Filters Events
1. Select "Social" category on dial
2. Scrub time picker to "7:00 PM"
3. **Verify**: Only Social events at/after 7PM are shown
4. **Verify**: Events from today and rest of week are included
5. Scrub to "12:00 AM"
6. **Verify**: All Social events (any time) are shown

### Test 3: Category + Time Filtering (Logical AND)
1. Set time to "6:00 PM"
2. Swipe to "Educational" category
3. **Verify**: Only Educational events at/after 6PM
4. Rotate to "Workshops" subcategory
5. **Verify**: Only Workshop events at/after 6PM
6. Change time to "2:00 PM"
7. **Verify**: Workshop events at/after 2PM (more events shown)

### Test 4: Edge Cases
1. Select time "11:00 PM" (late)
2. **Verify**: Shows late-night events today + all events tomorrow/this week
3. Select "12:00 AM" (midnight)
4. **Verify**: Shows all events for the week (no time restriction)
5. No events match filters
6. **Verify**: "No events found" message appears

### Test 5: Real-Time Updates
1. Select time "7:00 PM"
2. Swipe to different category
3. **Verify**: Events update immediately (no delay)
4. Rotate to different subcategory
5. **Verify**: Events update immediately
6. Change time while keeping category
7. **Verify**: Events update immediately

---

## 📊 EXPECTED BEHAVIOR MATRIX

| Time Selected | Category | Date Range | Events Shown |
|---------------|----------|------------|--------------|
| Current time | Any | Today + This Week | Events starting now or later (today), all events (future days) |
| 7:00 PM | Social | Today + This Week | Social events at/after 7PM (today), all Social events (future days) |
| 12:00 AM | Professional | Today + This Week | All Professional events, any time, today + this week |
| 6:00 PM | Educational → Workshops | Today + This Week | Workshop events at/after 6PM (today), all Workshops (future days) |

---

## 🎯 SUCCESS CRITERIA

| Criterion | Status | Measurement |
|-----------|--------|-------------|
| Time picker filters events | ⏳ | Events update when time changes |
| Category + Time work together | ⏳ | Logical AND filtering active |
| Default shows today + week | ⏳ | Fresh load shows relevant events |
| Smart time defaults | ⏳ | Context-aware initial time |
| No events = clear message | ⏳ | "No events found" displays |
| Real-time updates | ⏳ | < 50ms filter response |
| Event count visible | ⏳ | User sees # of matches |

---

## 💡 RECOMMENDATIONS

### 1. **Date Range Selector (Future Enhancement)**
Add ability to filter by date range:
- "Today"
- "Tomorrow"  
- "This Week"
- "This Weekend"
- "Next Week"

Could be a small dropdown or horizontal pill selector.

### 2. **"Happening Now" Quick Filter**
Add a button to instantly show events happening right now:
```jsx
<button onClick={() => setSelectedTime(getCurrentTime())}>
  Happening Now
</button>
```

### 3. **Save Time Preference**
Remember user's last selected time:
```javascript
localStorage.setItem('lastSelectedTime', JSON.stringify(selectedTime));
```

### 4. **Event Density Indicator**
Show which time slots have the most events:
```jsx
{/* Dots on time picker showing event density */}
<div style={{
  position: 'absolute',
  right: '-8px',
  top: `${getPositionFromTime(hours, 0) * 100}%`,
  width: '4px',
  height: '4px',
  background: 'rgba(100, 150, 255, 0.6)',
  borderRadius: '50%'
}} />
```

### 5. **"No Events" Suggestions**
When no events match, suggest alternatives:
```jsx
{filteredEvents.length === 0 && (
  <div>
    No events found
    <button onClick={() => setSelectedTime({ hours: 18, minutes: 0 })}>
      Try 6:00 PM
    </button>
    <button onClick={() => dialActions.setPrimaryByDirection('east')}>
      Try Educational
    </button>
  </div>
)}
```

---

## 🚀 ROLLOUT PLAN

### Phase 1: Data Enhancement (2-3 hours)
- [ ] Add `startTime`, `date`, `primaryCategory`, `subcategory` to all events
- [ ] Write helper script to auto-generate from existing data
- [ ] Validate all events have required fields

### Phase 2: Filter Logic (1-2 hours)
- [ ] Update `useTimeFilter.js` with time + date + category filtering
- [ ] Add date helper functions to `timeHelpers.js`
- [ ] Test logical AND filtering

### Phase 3: Smart Defaults (30 minutes)
- [ ] Implement context-aware default time
- [ ] Test default behavior on fresh load

### Phase 4: Visual Feedback (1 hour)
- [ ] Add event count display
- [ ] Add "No events found" message
- [ ] Add filter status indicator (optional)

### Phase 5: Testing & Deployment (1 hour)
- [ ] Run full testing protocol
- [ ] Fix any edge cases
- [ ] Deploy to production

**Total Time**: ~6-8 hours

---

## 📝 FINAL CHECKLIST

Before marking complete:
- [ ] All events have `startTime`, `date`, `primaryCategory`, `subcategory` fields
- [ ] Time picker selection actively filters events
- [ ] Category selection actively filters events
- [ ] Logical AND: Time + Date + Category + Subcategory all work together
- [ ] Default behavior shows today + this week events
- [ ] Smart time defaults based on current time
- [ ] Event count displays correctly
- [ ] "No events found" message appears when appropriate
- [ ] Real-time updates (< 50ms response)
- [ ] Works on mobile (320px to 768px screens)
- [ ] No performance degradation (60fps maintained)

---

**PRIORITY**: P0 (Critical - Time picker is non-functional without this)  
**IMPACT**: High (Enables core temporal filtering feature)  
**EFFORT**: Medium (~6-8 hours)  
**RISK**: Low (Data enhancement + filter logic updates)  

**LET'S MAKE THE TIME PICKER ACTUALLY FILTER EVENTS! ⏰🔍**


