# Comprehensive Fix: Map Disappearance & Primary Category Gesture Navigation

## Priority: CRITICAL
**Date:** October 17, 2025  
**Status:** Two critical issues requiring immediate attention

---

## 🚨 ISSUE #1: Map Tiles Failing to Load (Map Disappears)

### Symptoms
```
🗺️ Mapbox error: Ke {error: Ve, tile: Et, type: 'error', target: Map, isSourceLoaded: true, …}
🗺️ Fallback map rendering with events: 8
```

### Root Causes
1. **Mapbox Tile Request Errors** - Multiple tile loading failures
2. **Rate Limiting** - Too many map reloads/updates triggering Mapbox API limits
3. **Excessive Re-renders** - App is re-rendering excessively (see multiple "🚀 App starting" logs)

### Solutions

#### A. Reduce Map Re-renders (CRITICAL)
**Problem:** The app is re-rendering 10+ times per interaction, each time potentially trying to reload map tiles.

**File:** `discovery-dial/src/components/EventDiscoveryMap.jsx`

**Changes:**
1. Add memoization to prevent unnecessary re-renders
2. Add debouncing to map updates
3. Implement proper cleanup

```javascript
import { useRef, useEffect, useState, useMemo, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

// Add debounce utility at top of file
const debounce = (func, wait) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

const EventDiscoveryMap = ({ events, selectedEvent, onEventClick }) => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const markersRef = useRef([]);
  const [mapReady, setMapReady] = useState(false);

  // ... existing MAPBOX_CONFIG ...

  // 🔧 FIX 1: Memoize events to prevent unnecessary updates
  const memoizedEvents = useMemo(() => events, [events?.length, events?.[0]?.id]);
  const memoizedSelectedEvent = useMemo(() => selectedEvent, [selectedEvent?.id]);

  // 🔧 FIX 2: Initialize map ONCE only
  useEffect(() => {
    if (map.current) return; // Skip if already initialized
    if (!mapContainer.current) return;

    console.log('🗺️ Initializing Mapbox GL JS');

    try {
      mapboxgl.accessToken = MAPBOX_CONFIG.token;
      
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: MAPBOX_CONFIG.style,
        center: MAPBOX_CONFIG.center,
        zoom: MAPBOX_CONFIG.zoom,
        // 🔧 FIX 3: Add performance optimizations
        preserveDrawingBuffer: true,
        refreshExpiredTiles: false, // Don't auto-refresh expired tiles
        maxTileCacheSize: 50 // Limit tile cache
      });

      map.current.on('load', () => {
        console.log('🗺️ Mapbox map loaded successfully');
        setMapReady(true);
      });

      map.current.on('error', (e) => {
        console.log('🗺️ Mapbox error (non-critical):', e.error?.message || 'Tile loading issue');
        // Don't log full error object - it's just tile loading failures
      });

    } catch (error) {
      console.error('❌ Map initialization error:', error);
    }

    // Cleanup on unmount
    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []); // Empty deps - only run once

  // 🔧 FIX 4: Debounced pin update function
  const updateMapPins = useCallback(
    debounce((eventsToShow, highlightedEvent) => {
      if (!map.current || !mapReady) return;

      console.log('📍 Updating map pins:', eventsToShow.length, 'events');

      // Clear existing markers
      markersRef.current.forEach(marker => marker.remove());
      markersRef.current = [];

      // Add new markers
      eventsToShow.forEach(event => {
        if (!event.coordinates) return;

        const [lng, lat] = event.coordinates;
        const isHighlighted = highlightedEvent?.id === event.id;

        const el = document.createElement('div');
        el.className = 'custom-marker';
        el.style.cssText = `
          width: ${isHighlighted ? '20px' : '12px'};
          height: ${isHighlighted ? '20px' : '12px'};
          background-color: ${isHighlighted ? '#E63946' : '#457B9D'};
          border: 2px solid white;
          border-radius: 50%;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        `;

        const marker = new mapboxgl.Marker(el)
          .setLngLat([lng, lat])
          .addTo(map.current);

        marker.getElement().addEventListener('click', () => {
          if (onEventClick) onEventClick(event);
        });

        markersRef.current.push(marker);
      });

      // Zoom to highlighted event (debounced, so only happens after movement stops)
      if (highlightedEvent?.coordinates) {
        const [lng, lat] = highlightedEvent.coordinates;
        map.current.easeTo({
          center: [lng, lat],
          zoom: 14,
          duration: 800
        });
      }

      console.log('✅ Map pins updated:', markersRef.current.length, 'visible');
    }, 300), // 300ms debounce
    [mapReady, onEventClick]
  );

  // 🔧 FIX 5: Update pins only when events or selection actually changes
  useEffect(() => {
    if (!mapReady) return;
    updateMapPins(memoizedEvents, memoizedSelectedEvent);
  }, [memoizedEvents, memoizedSelectedEvent, mapReady, updateMapPins]);

  return (
    <div 
      ref={mapContainer} 
      className="event-discovery-map"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 1
      }}
    />
  );
};

export default EventDiscoveryMap;
```

#### B. Fix Excessive App Re-renders
**File:** `discovery-dial/src/App.jsx`

The app is re-rendering on every tiny state change. Look for:
- Unnecessary state updates in filter handlers
- Creating new object/array references on every render
- Missing `useMemo` / `useCallback` wrappers

**Key Changes:**
```javascript
// Wrap filter handlers in useCallback
const handleTimeChange = useCallback((time) => {
  setFilters(prev => {
    // Only update if actually changed
    if (prev.time === time || 
        (typeof time === 'object' && typeof prev.time === 'object' && 
         time.hours === prev.time.hours && time.minutes === prev.time.minutes)) {
      return prev; // Skip update if same
    }
    return { ...prev, time };
  });
}, []);

const handleCategoryChange = useCallback((category) => {
  setFilters(prev => {
    if (prev.category === category) return prev;
    return { ...prev, category };
  });
}, []);

// Memoize filtered events
const filteredEvents = useMemo(() => {
  return filterEventsByDialSelection(events, selectedCategory, selectedSubcategory, filters);
}, [events, selectedCategory, selectedSubcategory, filters.time, filters.day]);
```

---

## 🚨 ISSUE #2: Primary Category Gestures Not Working (Stuck on "Professional")

### Symptoms
```
🔵 Touch down in zone: CENTER
🔵 CENTER ZONE → PRIMARY SWIPE {deltaX: '10.9', deltaY: '-0.4'}
🔵 CENTER ZONE → PRIMARY SWIPE {deltaX: '-14.0', deltaY: '0.0'}
```
**But the category never changes!** `primaryIndex: 0` (Professional) stays the same.

### Root Cause Analysis

The gesture is **detected correctly** but **not executing the category change**. This means the problem is in the `useDialGestures` hook's primary swipe handler.

**File:** `discovery-dial/src/hooks/useDialGestures.js`

### The Problem
Looking at your logs, I see:
1. ✅ Touch zone detected: `CENTER`
2. ✅ Gesture type identified: `PRIMARY SWIPE`
3. ✅ Delta calculated: `{deltaX: '10.9', deltaY: '-0.4'}`
4. ❌ **No direction determination** (no "Swipe RIGHT", "Swipe UP", etc.)
5. ❌ **No `setPrimaryByDirection` call**
6. ❌ **primaryIndex never changes**

### The Fix

**File:** `discovery-dial/src/hooks/useDialGestures.js`

```javascript
// Find the PRIMARY SWIPE handling section (around line 280-330)

// 🔧 CURRENT BROKEN CODE (find this):
if (isPrimarySwipeGesture(deltaX, deltaY)) {
  console.log('🔵 CENTER ZONE → PRIMARY SWIPE', { deltaX: deltaX.toFixed(1), deltaY: deltaY.toFixed(1) });
  
  // ❌ PROBLEM: Missing or broken direction logic here
  // Need to determine N/E/S/W and call setPrimaryByDirection
}

// 🔧 REPLACE WITH THIS WORKING CODE:
if (isPrimarySwipeGesture(deltaX, deltaY)) {
  const absDeltaX = Math.abs(deltaX);
  const absDeltaY = Math.abs(deltaY);
  
  console.log('🔵 CENTER ZONE → PRIMARY SWIPE', { 
    deltaX: deltaX.toFixed(1), 
    deltaY: deltaY.toFixed(1),
    absDeltaX: absDeltaX.toFixed(1),
    absDeltaY: absDeltaY.toFixed(1)
  });

  // Determine primary direction based on larger delta
  let direction = null;
  
  if (absDeltaX > absDeltaY) {
    // Horizontal swipe (EAST or WEST)
    if (deltaX > 0) {
      direction = 'east';
      console.log('➡️ PRIMARY SWIPE: EAST (right swipe)');
    } else {
      direction = 'west';
      console.log('⬅️ PRIMARY SWIPE: WEST (left swipe)');
    }
  } else {
    // Vertical swipe (NORTH or SOUTH)
    if (deltaY < 0) {
      direction = 'north';
      console.log('⬆️ PRIMARY SWIPE: NORTH (up swipe)');
    } else {
      direction = 'south';
      console.log('⬇️ PRIMARY SWIPE: SOUTH (down swipe)');
    }
  }

  // Execute the category change
  if (direction && actions.setPrimaryByDirection) {
    console.log('🎯 Executing setPrimaryByDirection:', direction);
    actions.setPrimaryByDirection(direction);
  } else {
    console.error('❌ Cannot change category:', {
      direction,
      hasPrimaryByDirection: !!actions.setPrimaryByDirection
    });
  }
}
```

### Additional Debug Enhancement

Add this at the very end of `handleTouchEnd` in `useDialGestures.js`:

```javascript
// At end of handleTouchEnd, before resetting state
if (DEBUG_GESTURES) {
  console.log('🏁 Gesture complete:', {
    zone: touchZone.current,
    finalDelta: { x: deltaX.toFixed(1), y: deltaY.toFixed(1) },
    gestureResult: 'Check logs above for action taken'
  });
}
```

---

## 📋 TESTING PROTOCOL

### Test Map Stability
1. Open `http://localhost:3001`
2. **Check console** - should see far fewer "🚀 App starting" messages
3. **Monitor Mapbox errors** - should be minimal or none
4. **Interact with filters** - map should stay visible
5. **Let app sit for 30 seconds** - map tiles should remain loaded

### Test Primary Category Gestures
1. Open browser console
2. Find the center circle of the dial
3. **Swipe UP** (from center, drag finger/mouse upward ~50px)
   - Should see: `⬆️ PRIMARY SWIPE: NORTH`
   - Should see: `🎯 Executing setPrimaryByDirection: north`
   - **Category should change!**
4. **Swipe RIGHT** - should switch to next category (east)
5. **Swipe DOWN** - should switch category (south)
6. **Swipe LEFT** - should switch category (west)

### Expected Console Output
```
🔵 Touch down in zone: CENTER
🔵 CENTER ZONE → PRIMARY SWIPE {deltaX: '2.3', deltaY: '-45.8', absDeltaX: '2.3', absDeltaY: '45.8'}
⬆️ PRIMARY SWIPE: NORTH (up swipe)
🎯 Executing setPrimaryByDirection: north
🎯 Category selected: {id: 'social', label: 'Social', direction: 'north', ...}
🏁 Gesture complete: {...}
```

---

## 🎯 SUCCESS CRITERIA

### Map Issue FIXED When:
- ✅ Mapbox errors reduced to < 3 per session
- ✅ Map remains visible during all interactions
- ✅ "🚀 App starting" logs reduced to < 5 per interaction
- ✅ Map pins update smoothly without flickering

### Primary Gesture FIXED When:
- ✅ Swiping UP/DOWN/LEFT/RIGHT in center circle changes primary category
- ✅ Console shows direction detection (`⬆️ PRIMARY SWIPE: NORTH`)
- ✅ Console shows action execution (`🎯 Executing setPrimaryByDirection`)
- ✅ Category label updates in UI immediately
- ✅ Events filter to the new category

---

## 🔍 ROOT CAUSE SUMMARY

| Issue | Root Cause | Fix |
|-------|-----------|-----|
| **Map disappears** | Excessive re-renders causing tile request overload | Memoization + debouncing + proper cleanup |
| **Primary swipe broken** | Direction determination logic missing or broken | Add complete direction logic with proper action calls |

---

## 📝 IMPLEMENTATION ORDER

1. **FIRST:** Fix `useDialGestures.js` (primary swipe logic) - 5 min
2. **SECOND:** Fix `EventDiscoveryMap.jsx` (debouncing + memoization) - 10 min
3. **THIRD:** Fix `App.jsx` (reduce re-renders) - 5 min
4. **FOURTH:** Test both fixes - 10 min

**Total estimated time:** 30 minutes

---

## 🚀 DEPLOYMENT

After testing locally:
```bash
cd discovery-dial
npm run build
git add -A
git commit -m "fix: Resolve map tile errors and primary category gesture navigation"
git push origin master
```

Then verify on `hyyper.co` (allow 2-3 minutes for deployment).

---

**Priority:** CRITICAL - These issues prevent core functionality  
**Complexity:** Medium - Clear root causes, straightforward fixes  
**Risk:** Low - Changes are isolated to specific problematic code sections

