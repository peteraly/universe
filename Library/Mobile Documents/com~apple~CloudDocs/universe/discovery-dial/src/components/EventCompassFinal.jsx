import { useMemo, useCallback, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useEventCompassState from '../hooks/useEventCompassState';
import useDialGestures from '../hooks/useDialGestures';
import TimePickerSlider from './TimePickerSlider';
import DateRangeButton from './DateRangeButton';
import GestureHints from './GestureHints';
import { softTick } from '../utils/haptics';
import { 
  getCurrentTime, 
  parseEventTime, 
  getTodayDate,
  shouldShowEvent,
  getDateRangeBounds,
  isDateInRange
} from '../utils/timeHelpers';

/**
 * FINAL PRODUCTION VERSION with Enhanced Gesture Feedback
 * - Primary swipe: Directional arrows, blue tint, strong double-pulse
 * - Subcategory rotation: Rotation symbol, circle glow, soft triple-tick
 */
export default function EventCompassFinal({ 
  categories = [], 
  config = {},
  currentTimeframe,
  onTimeframeChange
}) {
  const [dialSize, setDialSize] = useState(400);
  
  // TIME PICKER STATE (NEW - ADDITIVE ONLY)
  const [selectedTime, setSelectedTime] = useState(() => {
    const now = getCurrentTime();
    // If it's after 11PM, default to 6PM for discovery
    if (now.hours >= 23) {
      return { hours: 18, minutes: 0 };
    }
    return now;
  });
  
  // DATE RANGE STATE (NEW - ADDITIVE)
  const [dateRange, setDateRange] = useState('TODAY');
  
  // Debug date range changes
  useEffect(() => {
    console.log('🚨 EventCompassFinal: Date range changed to:', dateRange);
  }, [dateRange]);

  // Enhanced date range change handler
  const handleDateRangeChange = useCallback((newRange) => {
    console.log('🚨 EventCompassFinal: Date range changing to:', newRange);
    setDateRange(newRange);
  }, []);

  // Timeframe context for debugging
  useEffect(() => {
    console.log('🚨 EventCompassFinal: Current timeframe context:', dateRange);
  }, [dateRange]);
  
  // Calculate responsive dial size (handles resize AND orientation change)
  useEffect(() => {
    const calculateSize = () => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const size = Math.min(
        vw * 0.85,
        vh * 0.5,
        480
      );
      setDialSize(size);
    };
    
    calculateSize();
    window.addEventListener('resize', calculateSize);
    window.addEventListener('orientationchange', calculateSize);
    
    return () => {
      window.removeEventListener('resize', calculateSize);
      window.removeEventListener('orientationchange', calculateSize);
    };
  }, []);
  
  const { state, actions } = useEventCompassState(categories);
  
  // TIME & DATE RANGE FILTERING: Filter events by time AND date range
  const filteredEvents = useMemo(() => {
    if (!state.activeSub?.events) return [];
    
    const today = getTodayDate();
    const { startDate, endDate } = getDateRangeBounds(dateRange);
    
    return state.activeSub.events.filter(event => {
      const eventTime = parseEventTime(event.startTime);
      const eventDate = event.date || today;
      
      // DATE RANGE FILTER: Check if event is in selected date range
      const dateRangeMatch = isDateInRange(eventDate, startDate, endDate);
      
      // TIME FILTER: Event starts at or after selected time
      const timeMatch = shouldShowEvent(eventDate, eventTime, today, selectedTime);
      
      // BOTH filters must pass
      return dateRangeMatch && timeMatch;
    }).sort((a, b) => {
      // Sort by date, then by time
      if (a.date !== b.date) {
        return a.date < b.date ? -1 : 1;
      }
      const timeA = parseEventTime(a.startTime);
      const timeB = parseEventTime(b.startTime);
      const totalMinutesA = timeA.hours * 60 + timeA.minutes;
      const totalMinutesB = timeB.hours * 60 + timeB.minutes;
      return totalMinutesA - totalMinutesB;
    });
  }, [state.activeSub, selectedTime, dateRange]);
  
  // Track filtered event index (separate from state.eventIndex)
  const [filteredEventIndex, setFilteredEventIndex] = useState(0);
  
  // Reset filtered index when subcategory, time, or date range changes
  useEffect(() => {
    setFilteredEventIndex(0);
  }, [state.subIndex, selectedTime, dateRange]);
  
  // Get the currently displayed event from filtered list
  const displayedEvent = useMemo(() => {
    if (filteredEvents.length === 0) return null;
    return filteredEvents[filteredEventIndex] || filteredEvents[0];
  }, [filteredEvents, filteredEventIndex]);
  
  // Actions for event navigation (with haptics)
  const extendedActions = useMemo(() => ({
    ...actions,
    nextEvent: () => {
      softTick();
      // Navigate through filtered events
      if (filteredEvents.length > 0) {
        setFilteredEventIndex((prev) => 
          prev >= filteredEvents.length - 1 ? 0 : prev + 1
        );
      }
    },
    prevEvent: () => {
      softTick();
      // Navigate through filtered events
      if (filteredEvents.length > 0) {
        setFilteredEventIndex((prev) => 
          prev <= 0 ? filteredEvents.length - 1 : prev - 1
        );
      }
    }
  }), [actions, filteredEvents]);

  const { 
    bindDialAreaProps, 
    bindLowerAreaProps, 
    hoverSubIndex, 
    dragDeltaX,
    activeZone,
    activeGestureType,
    gestureDirection,
    dialRef
  } = useDialGestures(extendedActions, config.gestures);

  // Get subcategories for active primary
  const subcategories = state.activePrimary?.subcategories || [];
  const subCount = subcategories.length;

  // Helper to calculate position on circle
  const polarToCartesian = (centerX, centerY, radius, angleDeg) => {
    const angleRad = (angleDeg - 90) * (Math.PI / 180);
    return {
      x: centerX + radius * Math.cos(angleRad),
      y: centerY + radius * Math.sin(angleRad)
    };
  };

  // Calculate primary category positions (INSIDE circle)
  const getPrimaryPosition = (direction) => {
    const centerX = dialSize / 2;
    const centerY = dialSize / 2;
    const radius = dialSize * 0.24; // 24% from center (closer to avoid overlap with subcategories)
    
    const angles = {
      north: 0,
      east: 90,
      south: 180,
      west: 270
    };
    
    return polarToCartesian(centerX, centerY, radius, angles[direction]);
  };

  if (!categories || categories.length === 0) {
    return (
      <div style={{ 
        background: '#000',
        color: '#fff', 
        height: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        fontFamily: 'system-ui, sans-serif'
      }}>
        No Categories Available
      </div>
    );
  }

  return (
    <div style={{
      width: '100vw',
      minHeight: '100vh',
      background: '#000000',
      color: '#ffffff',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      padding: '20px',
      paddingTop: 'max(20px, env(safe-area-inset-top))',
      paddingBottom: 'max(20px, env(safe-area-inset-bottom))'
    }}>
      
      {/* DIAL CONTAINER */}
      <div
        ref={dialRef}
        data-dial-root
        {...bindDialAreaProps}
        style={{
          position: 'relative',
          width: `${dialSize}px`,
          height: `${dialSize}px`,
          flexShrink: 0
        }}
      >
        {/* GESTURE HINTS - Zone-aware visual feedback */}
        <GestureHints 
          activeZone={activeZone}
          activeGesture={activeGestureType}
          direction={gestureDirection}
        />

        {/* OUTER CIRCLE + SUBCATEGORY TICKS */}
        <svg
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
            // Glow during rotation
            filter: activeGestureType === 'subcategoryRotation'
              ? 'drop-shadow(0 0 8px rgba(255, 255, 255, 0.4))' 
              : 'none',
            transition: 'filter 0.3s'
          }}
          viewBox="0 0 100 100"
        >
          {/* Main circle */}
          <circle
            cx="50"
            cy="50"
            r="48"
            fill="none"
            stroke={activeGestureType === 'primarySwipe' ? 'rgba(100, 150, 255, 0.6)' : 'white'}
            strokeWidth={activeGestureType === 'primarySwipe' ? '1.0' : '0.5'}
            opacity="0.4"
            style={{
              transition: 'stroke 0.3s, stroke-width 0.3s'
            }}
          />
          
          {/* ENHANCED: Rotation ring (visual affordance for subcategory rotation) */}
          <circle
            cx="50"
            cy="50"
            r="54"
            fill="none"
            stroke="rgba(255, 255, 255, 0.08)"
            strokeWidth="3"
            strokeDasharray="2 3"  /* Dotted pattern suggests rotation */
            opacity="0.6"
            style={{
              transition: 'opacity 0.3s, stroke 0.3s'
            }}
          />
          
          {/* Rotation ring glow during active rotation */}
          {activeGestureType === 'subcategoryRotation' && (
            <circle
              cx="50"
              cy="50"
              r="54"
              fill="none"
              stroke="rgba(255, 255, 255, 0.25)"
              strokeWidth="5"
              style={{
                filter: 'blur(6px)'
              }}
            />
          )}
          
          {/* Subcategory tick marks */}
          {subcategories.map((sub, i) => {
            const angle = (i * 360) / subCount;
            const isActive = i === state.subIndex;
            const isHovered = hoverSubIndex !== null && i === hoverSubIndex;
            const highlighted = isActive || isHovered;
            
            const outerR = 48;
            const innerR = outerR - (highlighted ? 4 : 3);
            const p1 = polarToCartesian(50, 50, outerR, angle);
            const p2 = polarToCartesian(50, 50, innerR, angle);
            
            return (
              <line
                key={sub.id}
                x1={p1.x}
                y1={p1.y}
                x2={p2.x}
                y2={p2.y}
                stroke="white"
                strokeWidth={highlighted ? 0.8 : 0.5}
                opacity={highlighted ? 1 : 0.5}
                style={{
                  transition: 'opacity 0.2s, stroke-width 0.2s'
                }}
              />
            );
          })}
        </svg>

        {/* RED POINTER (with pulse during primary change) */}
        <motion.svg
          animate={activeGestureType === 'primarySwipe' ? {
            scale: [1, 1.3, 1],
            opacity: [1, 0.7, 1]
          } : {}}
          transition={{ duration: 0.4 }}
          style={{
            position: 'absolute',
            left: '50%',
            top: '8px',
            transform: 'translateX(-50%)',
            zIndex: 20
          }}
          width="14"
          height="10"
          viewBox="0 0 14 10"
        >
          <path d="M7 0 L14 10 H0 Z" fill="#FF3B30" />
        </motion.svg>

        {/* CROSSHAIRS (pulse during primary change) */}
        <svg
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
            opacity: activeGestureType === 'primarySwipe' ? 0.4 : 0.15,
            transition: 'opacity 0.3s'
          }}
          viewBox="0 0 100 100"
        >
          <line x1="50" y1="0" x2="50" y2="100" stroke="white" strokeWidth="0.3" />
          <line x1="0" y1="50" x2="100" y2="50" stroke="white" strokeWidth="0.3" />
        </svg>

        {/* PRIMARY CATEGORY LABELS (with flash animation on change) */}
        {categories.map((cat, index) => {
          const directions = ['north', 'east', 'south', 'west'];
          const direction = directions[index];
          const pos = getPrimaryPosition(direction);
          const isActive = index === state.primaryIndex;
          const justActivated = activeGestureType === 'primarySwipe' && isActive;
          
          return (
            <motion.div
              key={cat.id}
              animate={justActivated ? {
                scale: [1, 1.2, 1],
                opacity: [0.4, 1, 1]
              } : {}}
              transition={{ duration: 0.4 }}
              style={{
                position: 'absolute',
                left: `${pos.x}px`,
                top: `${pos.y}px`,
                transform: 'translate(-50%, -50%)',
                fontSize: isActive ? '18px' : '13px',  // Enhanced: larger active, smaller inactive
                fontWeight: isActive ? '700' : '500',  // Enhanced: bolder active
                letterSpacing: '0.5px',
                color: 'white',
                opacity: activeGestureType === 'primarySwipe' && !isActive 
                  ? 0.2  // Dim others during swipe
                  : isActive ? 1 : 0.35,  // Enhanced: lower inactive opacity
                textShadow: isActive ? '0 0 8px rgba(255, 255, 255, 0.3)' : 'none',  // Enhanced: glow
                transition: 'opacity 0.3s, font-size 0.2s, font-weight 0.2s, text-shadow 0.3s',
                whiteSpace: 'nowrap',
                textAlign: 'center',
                zIndex: 10,
                textTransform: 'uppercase'
              }}
            >
              {cat.label}
            </motion.div>
          );
        })}

        {/* SUBCATEGORY LABELS (with pulse on rotation & progressive opacity) */}
        {subcategories.map((sub, i) => {
          // REAL-TIME ROTATION: Calculate rotation offset from drag
          const dragRotation = subCount > 0 
            ? (dragDeltaX / 140) * (360 / subCount)  // 140 = dialSensitivity
            : 0;
          
          const angle = (i * 360) / subCount - dragRotation;  // Subtract to rotate with drag
          const radius = dialSize * 0.58; // 58% from center (OUTSIDE the circle)
          const centerX = dialSize / 2;
          const centerY = dialSize / 2;
          const pos = polarToCartesian(centerX, centerY, radius, angle);
          
          const isActive = i === state.subIndex;
          const isHovered = hoverSubIndex !== null && i === hoverSubIndex;
          const highlighted = isActive || isHovered;
          const justActivated = activeGestureType === 'subcategoryRotation' && isActive;
          
          // Enhanced: Calculate distance from active for progressive opacity
          const distance = Math.min(
            Math.abs(i - state.subIndex),
            Math.abs((i - state.subIndex + subCount) % subCount),
            Math.abs((i - state.subIndex - subCount) % subCount)
          );
          const isAdjacent = distance === 1;
          
          // Enhanced: Progressive sizing and opacity
          let fontSize = '10px';
          let fontWeight = '500';
          let opacity = 0.4;
          let textShadow = 'none';
          
          if (isActive) {
            fontSize = '14px';  // Enhanced: larger active
            fontWeight = '700';
            opacity = 1;
            textShadow = '0 0 6px rgba(255, 255, 255, 0.4)';  // Enhanced: glow
          } else if (isAdjacent) {
            fontSize = '12px';
            fontWeight = '600';
            opacity = 0.8;  // Enhanced: brighter adjacent
          }
          
          return (
            <motion.div
              key={sub.id}
              animate={justActivated ? {
                scale: [1, 1.15, 1],
                opacity: [0.6, 1, 1]
              } : {}}
              transition={{ duration: 0.3 }}
              style={{
                position: 'absolute',
                left: `${pos.x}px`,
                top: `${pos.y}px`,
                transform: 'translate(-50%, -50%)',
                fontSize,
                fontWeight,
                letterSpacing: '0.3px',
                color: 'white',
                opacity,
                textShadow,
                transition: 'opacity 0.2s, font-size 0.2s, font-weight 0.2s, text-shadow 0.2s',
                whiteSpace: 'nowrap',
                textAlign: 'center',
                zIndex: 5,
                textTransform: 'uppercase'
              }}
            >
              {sub.label}
            </motion.div>
          );
        })}

        {/* CENTER DOT */}
        <div style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
          width: '6px',
          height: '6px',
          background: 'white',
          borderRadius: '50%',
          opacity: 0.4,
          zIndex: 1
        }} />
      </div>

      {/* TIME PICKER SLIDER (NEW - ADDITIVE ONLY) */}
      <TimePickerSlider 
        selectedTime={selectedTime} 
        onTimeChange={(newTime) => setSelectedTime(newTime)} 
      />

      {/* DATE RANGE BUTTON (NEW - ADDITIVE) */}
      <DateRangeButton 
        selectedRange={dateRange}
        onRangeChange={handleDateRangeChange}
      />
      
      {/* DEBUG: Fallback button to test rendering */}
      <div style={{
        position: 'fixed',
        top: '100px',
        right: '20px',
        background: 'lime',
        color: 'black',
        padding: '10px',
        borderRadius: '5px',
        zIndex: 9999,
        fontSize: '12px'
      }}>
        DEBUG: Button should be below
      </div>

      {/* TIMEFRAME INDICATOR - Enhanced Debug Display */}
      <div style={{
        position: 'fixed',
        top: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        background: 'rgba(0, 0, 0, 0.9)',
        color: 'white',
        padding: '10px 20px',
        borderRadius: '25px',
        fontSize: '16px',
        fontWeight: 'bold',
        zIndex: 50,
        pointerEvents: 'none',
        border: '2px solid #007bff',
        boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
      }}>
        📅 Current Timeframe: {dateRange}
      </div>

      {/* EVENT READOUT (with slide transition) */}
      <AnimatePresence mode="wait">
        <motion.div
          key={displayedEvent?.id || 'no-event'}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          {...bindLowerAreaProps}
          style={{
            marginTop: 'clamp(32px, 8vw, 48px)', // Increased spacing from dial (badge removed)
            textAlign: 'center',
            maxWidth: '90vw',
            width: '100%',
            zIndex: 35 // Above dial, below buttons
          }}
        >
          {displayedEvent ? (
          <>
            <h2 style={{
              fontSize: 'clamp(24px, 6vw, 32px)',
              fontWeight: '700',
              marginBottom: '12px',
              lineHeight: '1.2',
              letterSpacing: '-0.02em'
            }}>
              {displayedEvent.name}
            </h2>

            <p style={{
              fontSize: 'clamp(14px, 3.5vw, 16px)',
              opacity: 0.9,
              marginBottom: '6px'
            }}>
              {displayedEvent.tags?.join(' · ')}
              {displayedEvent.tags?.length > 0 && ' · '}
              {state.activePrimary?.label}
            </p>

            <p style={{
              fontSize: 'clamp(14px, 3.5vw, 16px)',
              opacity: 0.8,
              marginBottom: '6px'
            }}>
              {displayedEvent.address}
            </p>

            <p style={{
              fontSize: 'clamp(14px, 3.5vw, 16px)',
              opacity: 0.7
            }}>
              {displayedEvent.time}
              {displayedEvent.distance && ` · ${displayedEvent.distance}`}
            </p>

            {/* EVENT COUNT INDICATOR */}
            {filteredEvents.length > 1 && (
              <motion.p
                key={`${filteredEventIndex}-${filteredEvents.length}`}
                initial={{ opacity: 0.3, scale: 0.95 }}
                animate={{ opacity: 0.5, scale: 1 }}
                transition={{ duration: 0.2 }}
                style={{
                  fontSize: '12px',
                  marginTop: '12px'
                }}
              >
                {filteredEventIndex + 1} of {filteredEvents.length} events
              </motion.p>
            )}
          </>
          ) : (
            <div style={{ opacity: 0.6 }}>
              <p style={{ marginBottom: '8px' }}>No events found</p>
              <p style={{ fontSize: '14px', opacity: 0.7 }}>
                Try selecting a different time or category
              </p>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

