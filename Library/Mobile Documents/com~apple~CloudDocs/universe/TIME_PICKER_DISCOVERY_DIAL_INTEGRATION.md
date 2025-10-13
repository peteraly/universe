# TIME PICKER INTEGRATION FOR DISCOVERY DIAL
## Minimalist 24-Hour Event Filtering - Tailored Implementation

---

## 🎯 OBJECTIVE
Integrate a minimalist, gesture-driven 24-hour time picker that works **harmoniously** with the existing Discovery Dial compass interface. The time picker and dial must function as complementary filters, providing precise temporal and categorical event discovery without visual or gestural conflicts.

---

## 📋 DISCOVERY DIAL CONTEXT

### Current State:
- **Primary Gestures**: N/E/S/W swipes for category selection (Social, Educational, Recreational, Professional)
- **Secondary Gestures**: Circular drag for subcategory rotation (Concerts, Festivals, etc.)
- **Tertiary Gestures**: Horizontal swipe on event readout for event navigation
- **Visual Design**: Dark, minimalist, compass-inspired with sparse typography
- **Screen Real Estate**: Dial occupies ~70-80% of viewport, event details below

### Integration Requirements:
1. **Non-Interference**: Time picker must NOT conflict with dial gestures
2. **Visual Harmony**: Must match minimalist black/white aesthetic
3. **Spatial Placement**: Must fit within remaining screen space
4. **Logical AND Filtering**: Time + Category = Filtered Event List
5. **Real-Time Updates**: Time changes update event list instantly

---

## 🎨 DESIGN SPECIFICATION (TAILORED)

### A. Visual Design (Minimalist Discovery Dial Style)

#### Layout & Placement:
```
┌─────────────────────────────────┐
│                                 │
│    [Discovery Dial - 70%]       │
│                                 │
│  ┌─────────────────────┐        │
│  │    EVENT DETAILS    │  │ 12AM│ ← Time Picker
│  │                     │  │ 6AM │   (RIGHT EDGE)
│  └─────────────────────┘  │12PM │
│                            │ 6PM │
│                            │11PM │
└─────────────────────────────────┘
```

**Positioning:**
- **Anchor**: Fixed to far-right edge, vertically centered
- **Z-Index**: 50 (above event readout, below dial indicators)
- **Safe Area**: Account for mobile notches/home indicators
- **Width**: 40-50px (minimal footprint)

**Visual Style:**
```css
.time-picker-index {
  position: fixed;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  
  /* Minimalist Discovery Dial aesthetic */
  background: transparent;
  color: rgba(255, 255, 255, 0.5); /* Faded white, like inactive categories */
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 0.3px;
  text-transform: uppercase;
  
  /* No borders, no scrollbars */
  border: none;
  user-select: none;
  pointer-events: auto;
  
  /* Touch-friendly spacing */
  padding: 12px 8px;
  display: flex;
  flex-direction: column;
  gap: 20px; /* Adequate spacing between markers */
  
  z-index: 50;
}

.time-marker {
  opacity: 0.5;
  transition: opacity 0.2s, font-size 0.2s;
}

.time-marker--active {
  opacity: 1;
  font-size: 13px;
  font-weight: 700;
  color: rgba(100, 150, 255, 0.8); /* Blue accent (matches primary swipe) */
}
```

#### Visible Markers (Minimalist):
Show **only 5 key markers** to avoid clutter:
```
12AM  (Midnight - Day Start)
 6AM  (Morning)
12PM  (Noon - Midday)
 6PM  (Evening)
11PM  (Night - Day End)
```

**Rationale**: 
- 5 markers = adequate touch targets (20px+ spacing)
- Covers all major time periods (night, morning, afternoon, evening)
- Maintains minimal visual weight
- Gesture interpolates between markers for precision

---

### B. Interaction Logic (Full 24-Hour Precision)

#### Internal Time Mapping:
Even though only 5 markers are visible, the scrubber must map to **48 half-hour slots** (00:00, 00:30, 01:00... 23:30):

```javascript
// Scrubber area height
const scrubberHeight = 200; // px (adjustable)

// Calculate time from vertical position
function getTimeFromPosition(y, scrubberTop, scrubberHeight) {
  const normalizedY = (y - scrubberTop) / scrubberHeight; // 0 to 1
  const clampedY = Math.max(0, Math.min(1, normalizedY));
  
  // Map to 48 half-hour slots (0 = 12:00 AM, 47 = 11:30 PM)
  const slotIndex = Math.round(clampedY * 47);
  
  const hours = Math.floor(slotIndex / 2);
  const minutes = (slotIndex % 2) * 30;
  
  return { hours, minutes, slotIndex };
}

// Example: User drags to 40% down the scrubber
// normalizedY = 0.4
// slotIndex = round(0.4 * 47) = 19
// hours = floor(19 / 2) = 9
// minutes = (19 % 2) * 30 = 30
// Result: 9:30 AM
```

#### Gesture A: Vertical Scrubbing (Primary)
**Action**: User drags finger vertically along the time picker

**Response**:
1. Calculate exact time from vertical position (see formula above)
2. Update visual indicator (highlight active marker, show floating time bubble)
3. Filter events: `events.filter(e => e.startTime >= calculatedTime && e.category === dialCategory)`
4. Update Event Card with first matching event
5. Haptic feedback: Soft tick every 30 minutes crossed

**Visual Feedback**:
```jsx
{isDragging && (
  <motion.div
    className="time-bubble"
    style={{
      position: 'absolute',
      left: '-60px', // Left of picker, near finger
      top: dragY,
      transform: 'translateY(-50%)',
      background: 'rgba(0, 0, 0, 0.9)',
      color: 'white',
      padding: '6px 12px',
      borderRadius: '20px',
      fontSize: '14px',
      fontWeight: '700',
      whiteSpace: 'nowrap',
      pointerEvents: 'none',
      boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
    }}
  >
    {formatTime(selectedHours, selectedMinutes)}
  </motion.div>
)}
```

#### Gesture B: Tap on Marker (Secondary)
**Action**: User taps one of the 5 visible markers (e.g., "6PM")

**Response**:
1. Instantly set time filter to that exact hour (e.g., 18:00)
2. Update Event Card immediately
3. Haptic feedback: Single soft tick
4. Brief glow on tapped marker

---

### C. Integration with Discovery Dial

#### Filtering Logic (Logical AND):
```javascript
// Combined filter: Time AND Category
const filteredEvents = allEvents.filter(event => {
  // Time filter (from picker)
  const eventStartTime = parseTime(event.startTime); // e.g., "7:30 PM" → { hours: 19, minutes: 30 }
  const selectedTime = { hours: selectedHours, minutes: selectedMinutes };
  const timeMatch = isAfterOrEqual(eventStartTime, selectedTime);
  
  // Category filter (from dial)
  const categoryMatch = event.primaryCategory === activePrimary.label && 
                        event.subcategory === activeSub.label;
  
  // Logical AND
  return timeMatch && categoryMatch;
});

// Update active event
const activeEvent = filteredEvents[0] || null;
```

#### State Management:
```javascript
// New state hook for time picker
const [selectedTime, setSelectedTime] = useState({ hours: 0, minutes: 0 }); // Default: 12:00 AM

// Existing dial state
const { state: dialState, actions: dialActions } = useEventCompassState(categories);

// Combined derived state
const filteredEvents = useMemo(() => {
  return allEvents.filter(event => 
    matchesTime(event, selectedTime) && 
    matchesCategory(event, dialState.activePrimary, dialState.activeSub)
  );
}, [allEvents, selectedTime, dialState.activePrimary, dialState.activeSub]);
```

#### Update Flow:
```
User changes TIME → setSelectedTime() → filteredEvents updates → Event Card re-renders
User changes CATEGORY → dialActions.setPrimaryByDirection() → filteredEvents updates → Event Card re-renders
```

---

### D. Gesture Conflict Prevention

#### Problem: Time Picker vs Dial Gestures
- **Dial**: Swipe gestures (N/E/S/W, circular rotation) detect anywhere on dial area
- **Time Picker**: Vertical scrub on right edge
- **Risk**: User trying to scrub time might accidentally trigger dial rotation

#### Solution: Spatial Separation
```javascript
// In useDialGestures.js
const handleDialPointerDown = useCallback((e) => {
  const g = gestureRef.current;
  
  // GESTURE CONFLICT PREVENTION: Check if touch is in time picker zone
  const isInTimePickerZone = e.clientX > window.innerWidth - 60; // Right 60px reserved
  
  if (isInTimePickerZone) {
    return; // Don't initiate dial gesture, let time picker handle it
  }
  
  // ... existing dial gesture logic
}, []);
```

**Alternative**: Use `pointer-events` CSS:
```css
.time-picker-index {
  pointer-events: auto; /* Captures events */
}

.dial-container {
  pointer-events: auto;
  /* But check touch position in handler before processing */
}
```

---

## 🛠️ IMPLEMENTATION PLAN

### Phase 1: Time Picker Component (Core)
**File**: `src/components/TimePickerIndex.jsx`

```jsx
import { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { softTick } from '../utils/haptics';

const TIME_MARKERS = [
  { label: '12AM', hours: 0, minutes: 0 },
  { label: '6AM', hours: 6, minutes: 0 },
  { label: '12PM', hours: 12, minutes: 0 },
  { label: '6PM', hours: 18, minutes: 0 },
  { label: '11PM', hours: 23, minutes: 0 }
];

export default function TimePickerIndex({ selectedTime, onTimeChange }) {
  const [isDragging, setIsDragging] = useState(false);
  const [dragY, setDragY] = useState(0);
  const containerRef = useRef(null);
  const prevSlotRef = useRef(0);
  
  const handlePointerDown = useCallback((e) => {
    setIsDragging(true);
    updateTimeFromPosition(e.clientY);
  }, []);
  
  const handlePointerMove = useCallback((e) => {
    if (!isDragging) return;
    updateTimeFromPosition(e.clientY);
  }, [isDragging]);
  
  const handlePointerUp = useCallback(() => {
    setIsDragging(false);
  }, []);
  
  const updateTimeFromPosition = useCallback((clientY) => {
    if (!containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const normalizedY = (clientY - rect.top) / rect.height;
    const clampedY = Math.max(0, Math.min(1, normalizedY));
    
    // Map to 48 half-hour slots
    const slotIndex = Math.round(clampedY * 47);
    const hours = Math.floor(slotIndex / 2);
    const minutes = (slotIndex % 2) * 30;
    
    // Haptic feedback on slot change
    if (slotIndex !== prevSlotRef.current) {
      softTick();
      prevSlotRef.current = slotIndex;
    }
    
    setDragY(clientY);
    onTimeChange({ hours, minutes });
  }, [onTimeChange]);
  
  const handleMarkerTap = useCallback((marker) => {
    onTimeChange({ hours: marker.hours, minutes: marker.minutes });
    softTick();
  }, [onTimeChange]);
  
  return (
    <div
      ref={containerRef}
      className="time-picker-index"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      style={{
        position: 'fixed',
        right: '8px',
        top: '50%',
        transform: 'translateY(-50%)',
        height: '200px',
        width: '40px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        zIndex: 50,
        touchAction: 'none'
      }}
    >
      {TIME_MARKERS.map((marker) => {
        const isActive = selectedTime.hours === marker.hours;
        
        return (
          <div
            key={marker.label}
            onClick={() => handleMarkerTap(marker)}
            style={{
              fontSize: isActive ? '13px' : '11px',
              fontWeight: isActive ? '700' : '500',
              color: isActive ? 'rgba(100, 150, 255, 0.8)' : 'rgba(255, 255, 255, 0.5)',
              opacity: isActive ? 1 : 0.5,
              transition: 'all 0.2s',
              cursor: 'pointer',
              textAlign: 'center',
              letterSpacing: '0.3px',
              textTransform: 'uppercase'
            }}
          >
            {marker.label}
          </div>
        );
      })}
      
      {/* Floating time bubble during drag */}
      <AnimatePresence>
        {isDragging && (
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            style={{
              position: 'absolute',
              left: '-70px',
              top: `${((selectedTime.hours * 60 + selectedTime.minutes) / (24 * 60)) * 100}%`,
              transform: 'translateY(-50%)',
              background: 'rgba(0, 0, 0, 0.9)',
              color: 'white',
              padding: '6px 12px',
              borderRadius: '20px',
              fontSize: '14px',
              fontWeight: '700',
              whiteSpace: 'nowrap',
              pointerEvents: 'none',
              boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
            }}
          >
            {formatTime(selectedTime.hours, selectedTime.minutes)}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function formatTime(hours, minutes) {
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  const displayMinutes = minutes.toString().padStart(2, '0');
  return `${displayHours}:${displayMinutes} ${period}`;
}
```

---

### Phase 2: Integration Hook
**File**: `src/hooks/useTimeFilter.js`

```javascript
import { useState, useCallback, useMemo } from 'react';

export default function useTimeFilter(events, dialState) {
  const [selectedTime, setSelectedTime] = useState({ hours: 0, minutes: 0 });
  
  const filteredEvents = useMemo(() => {
    if (!events || events.length === 0) return [];
    
    return events.filter(event => {
      // Time filter
      const eventTime = parseEventTime(event.startTime);
      const timeMatch = (eventTime.hours > selectedTime.hours) || 
                        (eventTime.hours === selectedTime.hours && eventTime.minutes >= selectedTime.minutes);
      
      // Category filter (from dial)
      const categoryMatch = event.primaryCategory === dialState.activePrimary?.label &&
                           event.subcategory === dialState.activeSub?.label;
      
      return timeMatch && categoryMatch;
    });
  }, [events, selectedTime, dialState.activePrimary, dialState.activeSub]);
  
  const handleTimeChange = useCallback((newTime) => {
    setSelectedTime(newTime);
  }, []);
  
  return {
    selectedTime,
    filteredEvents,
    onTimeChange: handleTimeChange
  };
}

function parseEventTime(timeString) {
  // Parse "7:30 PM" → { hours: 19, minutes: 30 }
  const match = timeString.match(/(\d+):(\d+)\s*(AM|PM)/i);
  if (!match) return { hours: 0, minutes: 0 };
  
  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const period = match[3].toUpperCase();
  
  if (period === 'PM' && hours !== 12) hours += 12;
  if (period === 'AM' && hours === 12) hours = 0;
  
  return { hours, minutes };
}
```

---

### Phase 3: Update EventCompassFinal.jsx

```javascript
import TimePickerIndex from './TimePickerIndex';
import useTimeFilter from '../hooks/useTimeFilter';

export default function EventCompassFinal({ categories = [], events = [] }) {
  const { state, actions } = useEventCompassState(categories);
  const { selectedTime, filteredEvents, onTimeChange } = useTimeFilter(events, state);
  
  // Use filteredEvents instead of state.activeEvent
  const activeEvent = filteredEvents[0] || null;
  
  return (
    <div className="compass-container">
      {/* Existing dial */}
      <div {...bindDialAreaProps}>
        {/* ... dial components ... */}
      </div>
      
      {/* NEW: Time Picker */}
      <TimePickerIndex 
        selectedTime={selectedTime} 
        onTimeChange={onTimeChange} 
      />
      
      {/* Event Readout (now uses filtered events) */}
      <EventReadout activeEvent={activeEvent} />
    </div>
  );
}
```

---

## 🧪 TESTING PROTOCOL

### Test 1: Time Filtering Works
1. Select a category on dial (e.g., "Social")
2. Scrub time picker to "6PM"
3. **Verify**: Event shown is first Social event at or after 6PM
4. Scrub to "12AM"
5. **Verify**: Event shown is first Social event of the day

### Test 2: Combined Filtering (Logical AND)
1. Set time to "7PM"
2. Swipe to "Educational" category
3. **Verify**: Event shown is first Educational event at or after 7PM
4. Change subcategory via rotation
5. **Verify**: Event updates to match new subcategory + time

### Test 3: No Gesture Conflicts
1. Touch time picker area (right edge)
2. Drag vertically
3. **Verify**: Time changes, dial does NOT rotate
4. Touch dial area (center/left)
5. Drag horizontally
6. **Verify**: Subcategories rotate, time does NOT change

### Test 4: Visual Feedback
1. Drag time picker slowly
2. **Verify**: Floating bubble shows current time
3. **Verify**: Markers update opacity (active = bright)
4. **Verify**: Soft tick every 30min crossed

### Test 5: Edge Cases
1. Scrub to 11:59 PM
2. **Verify**: Shows last event of day
3. No events match time + category
4. **Verify**: Event readout shows "No events found"
5. Tap marker then immediately scrub
6. **Verify**: Smooth transition, no conflicts

---

## 📊 SUCCESS METRICS

| Metric | Target | Measurement |
|--------|--------|-------------|
| Gesture accuracy | 95%+ | Time selection matches intent |
| No conflicts | 100% | Time picker never triggers dial |
| Visual harmony | Subjective | Matches minimalist aesthetic |
| Performance | 60fps | No lag during scrubbing |
| Filtering speed | < 50ms | Event updates instantly |

---

## 🎯 RECOMMENDATIONS

### 1. **Start Time vs Event Time**
**Consider**: Should time filter be "events starting at or after" or "events happening at"?
- **"At or after"**: Shows next upcoming events (better for discovery)
- **"Happening at"**: Shows concurrent events (better for "what's on now")

**Recommendation**: **"At or after"** for discovery use case.

### 2. **Default Time**
**Options**:
- Current time (real-time default)
- 12:00 AM (day start)
- 6:00 PM (evening peak)

**Recommendation**: **Current time** (most relevant), fallback to 6PM if after 11PM.

### 3. **Time Persistence**
**Question**: Should selected time persist across category changes?
- **Yes**: User sets time once, explores categories at that time
- **No**: Each category resets to "next available"

**Recommendation**: **Yes, persist time** (user intent is temporal filtering).

### 4. **Visual Enhancements (Optional)**
- **Progress indicator**: Thin line showing current time position
- **Next event preview**: Show time of next event while scrubbing
- **Category-aware markers**: Dim markers if no events at that time for current category

### 5. **Accessibility**
- **Keyboard support**: Up/Down arrows to increment/decrement time
- **Screen reader**: Announce time and matching event count
- **High contrast**: Ensure 4.5:1 contrast ratio for markers

---

## 🚀 ROLLOUT PLAN

### Week 1: Foundation (20 hours)
- [x] Create TimePickerIndex component
- [x] Implement vertical scrubbing gesture
- [x] Add floating time bubble
- [x] Test gesture isolation (no dial conflicts)

### Week 2: Integration (16 hours)
- [ ] Create useTimeFilter hook
- [ ] Integrate with EventCompassFinal
- [ ] Implement logical AND filtering
- [ ] Test combined category + time filtering

### Week 3: Polish (12 hours)
- [ ] Add tap-on-marker shortcut
- [ ] Implement haptic feedback (ticks)
- [ ] Visual refinements (opacity, sizing)
- [ ] Performance optimization

### Week 4: Testing & Deployment (8 hours)
- [ ] User testing (5-10 participants)
- [ ] Bug fixes and edge cases
- [ ] Documentation updates
- [ ] Production deployment

**Total**: ~56 hours (7 days of work)

---

## 📝 FINAL CHECKLIST

Before marking complete:
- [ ] Time picker visually matches Discovery Dial aesthetic (minimal, transparent)
- [ ] Vertical scrubbing maps to full 48 half-hour slots
- [ ] Logical AND filtering works (time + category + subcategory)
- [ ] No gesture conflicts (time picker vs dial gestures)
- [ ] Floating time bubble appears during scrub
- [ ] Tap-on-marker works for quick jumps
- [ ] Haptic feedback on time changes
- [ ] Performance: 60fps during scrubbing
- [ ] Works on mobile (320px to 768px screens)
- [ ] Accessibility: keyboard navigation, screen reader support
- [ ] Event data includes startTime in parseable format
- [ ] Documentation updated

---

**PRIORITY**: P1 (High Value Feature)  
**IMPACT**: Major (Adds temporal dimension to discovery)  
**EFFORT**: Medium (~7 days)  
**RISK**: Low (Spatial separation prevents conflicts)  

**LET'S ADD PRECISE TIME FILTERING TO THE DISCOVERY DIAL! ⏰🧭**

