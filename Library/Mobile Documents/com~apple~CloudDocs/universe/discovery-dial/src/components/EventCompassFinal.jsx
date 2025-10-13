import { useMemo, useCallback, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useEventCompassState from '../hooks/useEventCompassState';
import useDialGestures from '../hooks/useDialGestures';
import TimePickerSlider from './TimePickerSlider';
import DateRangeButton from './DateRangeButton';
import { hardTick, softTick } from '../utils/haptics';
import { 
  getCurrentTime, 
  parseEventTime, 
  getTodayDate,
  shouldShowEvent,
  formatTime,
  getDateRangeBounds,
  isDateInRange,
  getDateRangeLabel
} from '../utils/timeHelpers';

/**
 * FINAL PRODUCTION VERSION with Enhanced Gesture Feedback
 * - Primary swipe: Directional arrows, blue tint, strong double-pulse
 * - Subcategory rotation: Rotation symbol, circle glow, soft triple-tick
 */
export default function EventCompassFinal({ categories = [], config = {} }) {
  const [dialSize, setDialSize] = useState(400);
  const [gestureState, setGestureState] = useState({
    type: null,  // 'primary' | 'subcategory' | null
    direction: null,  // 'north' | 'east' | 'south' | 'west' | 'rotate'
    isActive: false
  });
  
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
  
  // Enhanced haptic patterns
  const primaryHaptic = useCallback(() => {
    if (navigator.vibrate) {
      navigator.vibrate([0, 50, 100, 50]); // Strong double pulse (DA-DUM)
    }
  }, []);
  
  const subcategoryHaptic = useCallback(() => {
    if (navigator.vibrate) {
      // ENHANCED: Double pulse pattern - stronger feedback for snap
      navigator.vibrate([0, 20, 40, 20]); // Two strong pulses
    }
  }, []);
  
  // Wrapped actions with enhanced multi-sensory feedback
  const actionsWithFeedback = useMemo(() => ({
    setPrimaryByDirection: (direction) => {
      // Set gesture state for visual feedback
      setGestureState({ type: 'primary', direction, isActive: true });
      
      // Multi-sensory feedback
      primaryHaptic();
      
      // Execute action
      actions.setPrimaryByDirection(direction);
      
      // Clear gesture state after animation
      setTimeout(() => {
        setGestureState({ type: null, direction: null, isActive: false });
      }, 600);
    },
    rotateSub: (steps) => {
      // Set gesture state for visual feedback
      setGestureState({ type: 'subcategory', direction: 'rotate', isActive: true });
      
      // Multi-sensory feedback
      subcategoryHaptic();
      
      // Execute action
      actions.rotateSub(steps);
      
      // Clear gesture state after animation
      setTimeout(() => {
        setGestureState({ type: null, direction: null, isActive: false });
      }, 300);
    },
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
  }), [primaryHaptic, subcategoryHaptic, filteredEvents]);

  const { bindDialAreaProps, bindLowerAreaProps, hoverSubIndex, dragDeltaX } = 
    useDialGestures(actionsWithFeedback, config.gestures);

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
    const radius = dialSize * 0.28; // 28% from center (well inside circle)
    
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
        data-dial-root
        {...bindDialAreaProps}
        style={{
          position: 'relative',
          width: `${dialSize}px`,
          height: `${dialSize}px`,
          flexShrink: 0
        }}
      >
        {/* VISUAL FEEDBACK: Directional arrow during primary swipe */}
        <AnimatePresence>
          {gestureState.type === 'primary' && gestureState.isActive && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              transition={{ duration: 0.2 }}
              style={{
                position: 'absolute',
                left: '50%',
                top: '50%',
                transform: 'translate(-50%, -50%)',
                fontSize: '48px',
                color: 'rgba(100, 150, 255, 0.8)',
                zIndex: 30,
                pointerEvents: 'none'
              }}
            >
              {gestureState.direction === 'north' && '↑'}
              {gestureState.direction === 'east' && '→'}
              {gestureState.direction === 'south' && '↓'}
              {gestureState.direction === 'west' && '←'}
            </motion.div>
          )}
        </AnimatePresence>

        {/* VISUAL FEEDBACK: Rotation indicator during subcategory drag */}
        <AnimatePresence>
          {gestureState.type === 'subcategory' && gestureState.isActive && (
            <motion.div
              initial={{ opacity: 0, rotate: -30 }}
              animate={{ opacity: 0.6, rotate: 0 }}
              exit={{ opacity: 0, rotate: 30 }}
              transition={{ duration: 0.3 }}
              style={{
                position: 'absolute',
                left: '50%',
                top: '50%',
                transform: 'translate(-50%, -50%)',
                fontSize: '32px',
                color: 'rgba(255, 255, 255, 0.5)',
                zIndex: 30,
                pointerEvents: 'none'
              }}
            >
              ↻
            </motion.div>
          )}
        </AnimatePresence>

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
            filter: gestureState.type === 'subcategory' && gestureState.isActive 
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
            stroke={gestureState.type === 'primary' ? 'rgba(100, 150, 255, 0.6)' : 'white'}
            strokeWidth={gestureState.type === 'primary' ? '1.0' : '0.5'}
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
          {gestureState.type === 'subcategory' && gestureState.isActive && (
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

        {/* RED POINTER - Primary Category Indicator (with pulse during primary change) */}
        <motion.svg
          animate={gestureState.type === 'primary' && gestureState.isActive ? {
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

        {/* BLUE POINTER - Subcategory Selector (shows active alignment) */}
        <motion.svg
          animate={gestureState.type === 'subcategory' && gestureState.isActive ? {
            scale: [1, 1.2, 1],
            opacity: [0.8, 1, 0.9]
          } : {}}
          transition={{ duration: 0.3 }}
          style={{
            position: 'absolute',
            left: '50%',
            top: `${dialSize * 0.08}px`, // Positioned just inside outer ring
            transform: 'translateX(-50%)',
            zIndex: 20,
            filter: 'drop-shadow(0 2px 6px rgba(100, 150, 255, 0.6))'
          }}
          width="16"
          height="12"
          viewBox="0 0 16 12"
        >
          <path d="M8 12 L16 0 H0 Z" fill="rgba(100, 150, 255, 0.95)" />
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
            opacity: gestureState.type === 'primary' && gestureState.isActive ? 0.4 : 0.15,
            transition: 'opacity 0.3s'
          }}
          viewBox="0 0 100 100"
        >
          <line x1="50" y1="0" x2="50" y2="100" stroke="white" strokeWidth="0.3" />
          <line x1="0" y1="50" x2="100" y2="50" stroke="white" strokeWidth="0.3" />
        </svg>

        {/* ENHANCED: Directional hint arrows (subtle affordance) */}
        <AnimatePresence>
          {gestureState.type === 'primary' && gestureState.isActive && (
            <>
              {/* Arrow pointing to target direction */}
              {gestureState.direction === 'north' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 0.4, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  style={{
                    position: 'absolute',
                    left: '50%',
                    top: '30%',
                    transform: 'translateX(-50%)',
                    fontSize: '20px',
                    color: 'rgba(100, 150, 255, 0.6)',
                    pointerEvents: 'none',
                    zIndex: 8
                  }}
                >
                  ⌃ ⌃ ⌃
                </motion.div>
              )}
              {gestureState.direction === 'east' && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 0.4, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.2 }}
                  style={{
                    position: 'absolute',
                    right: '30%',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    fontSize: '20px',
                    color: 'rgba(100, 150, 255, 0.6)',
                    pointerEvents: 'none',
                    zIndex: 8
                  }}
                >
                  ⌃ ⌃ ⌃
                </motion.div>
              )}
              {gestureState.direction === 'south' && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 0.4, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.2 }}
                  style={{
                    position: 'absolute',
                    left: '50%',
                    bottom: '30%',
                    transform: 'translateX(-50%) rotate(180deg)',
                    fontSize: '20px',
                    color: 'rgba(100, 150, 255, 0.6)',
                    pointerEvents: 'none',
                    zIndex: 8
                  }}
                >
                  ⌃ ⌃ ⌃
                </motion.div>
              )}
              {gestureState.direction === 'west' && (
                <motion.div
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 0.4, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                  style={{
                    position: 'absolute',
                    left: '30%',
                    top: '50%',
                    transform: 'translateY(-50%) rotate(-90deg)',
                    fontSize: '20px',
                    color: 'rgba(100, 150, 255, 0.6)',
                    pointerEvents: 'none',
                    zIndex: 8
                  }}
                >
                  ⌃ ⌃ ⌃
                </motion.div>
              )}
            </>
          )}
        </AnimatePresence>

        {/* PRIMARY CATEGORY LABELS (with flash animation on change) */}
        {categories.map((cat, index) => {
          const directions = ['north', 'east', 'south', 'west'];
          const direction = directions[index];
          const pos = getPrimaryPosition(direction);
          const isActive = index === state.primaryIndex;
          const justActivated = gestureState.type === 'primary' && isActive && gestureState.isActive;
          
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
                opacity: gestureState.type === 'primary' && gestureState.isActive && !isActive 
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
          const justActivated = gestureState.type === 'subcategory' && isActive && gestureState.isActive;
          
          // Enhanced: Calculate distance from active for progressive opacity
          const distance = Math.min(
            Math.abs(i - state.subIndex),
            Math.abs((i - state.subIndex + subCount) % subCount),
            Math.abs((i - state.subIndex - subCount) % subCount)
          );
          const isAdjacent = distance === 1;
          
          // ENHANCED: Progressive sizing, opacity, and color hierarchy
          let fontSize, fontWeight, opacity, color, textShadow, scale;
          
          if (isActive) {
            // ACTIVE: Blue, large, strong glow - unmistakable
            fontSize = 'clamp(16px, 4vw, 20px)';
            fontWeight = '800';
            opacity = 1;
            color = 'rgba(100, 150, 255, 1)';  // BLUE accent
            textShadow = '0 0 12px rgba(100, 150, 255, 0.8), 0 0 24px rgba(100, 150, 255, 0.4)';
            scale = 1.2;
          } else if (isAdjacent) {
            // ADJACENT: White, medium, semi-visible
            fontSize = 'clamp(13px, 3.5vw, 16px)';
            fontWeight = '600';
            opacity = 0.75;
            color = 'white';
            textShadow = 'none';
            scale = 1.0;
          } else {
            // FAR: White, small, faded
            fontSize = 'clamp(11px, 3vw, 13px)';
            fontWeight = '500';
            opacity = 0.3;
            color = 'white';
            textShadow = 'none';
            scale = 0.95;
          }
          
          return (
            <motion.div
              key={sub.id}
              animate={justActivated ? {
                // ENHANCED: Stronger snap animation with pulse
                scale: [0.8, 1.3, 1.15],  // Pop in → overshoot → settle
                opacity: [0.5, 1, 1]
              } : {
                scale,
                opacity
              }}
              transition={justActivated ? {
                duration: 0.4,
                times: [0, 0.6, 1],
                ease: 'easeOut'
              } : {
                duration: 0.2,
                ease: 'easeInOut'
              }}
              style={{
                position: 'absolute',
                left: `${pos.x}px`,
                top: `${pos.y}px`,
                transform: 'translate(-50%, -50%)',
                fontSize,
                fontWeight,
                letterSpacing: '0.3px',
                color,  // CHANGED: Use variable color (blue for active)
                textShadow,  // CHANGED: Enhanced glow
                whiteSpace: 'nowrap',
                textAlign: 'center',
                zIndex: isActive ? 10 : 5,  // CHANGED: Active on top
                textTransform: 'uppercase',
                transition: 'color 0.2s, text-shadow 0.2s'
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
        onRangeChange={setDateRange}
      />

      {/* TIME & DATE FILTER BADGE - Shows current selected time and date range */}
      <motion.div
        key={`${selectedTime.hours}-${selectedTime.minutes}-${dateRange}`}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2 }}
        style={{
          marginTop: 'clamp(16px, 5vw, 24px)',
          marginBottom: 'clamp(8px, 2.5vw, 12px)',
          padding: 'clamp(6px, 2vw, 10px) clamp(12px, 4vw, 20px)',
          background: 'rgba(100, 150, 255, 0.15)',
          border: '1px solid rgba(100, 150, 255, 0.3)',
          borderRadius: '20px',
          fontSize: 'clamp(12px, 3.5vw, 16px)',
          textAlign: 'center',
          opacity: 0.9,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 'clamp(6px, 2vw, 10px)',
          alignSelf: 'center',
          maxWidth: 'calc(100vw - 40px)', // Prevent overflow at high zoom
          whiteSpace: 'normal', // Allow wrapping if needed
          lineHeight: 1.4,
          flexWrap: 'wrap' // Allow content to wrap gracefully
        }}
      >
        <span style={{ opacity: 0.8 }}>🕐</span>
        <span style={{ fontWeight: '500' }}>
          After {formatTime(selectedTime.hours, selectedTime.minutes)}
        </span>
        <span style={{ opacity: 0.6 }}>·</span>
        <span style={{ fontWeight: '500' }}>
          {getDateRangeLabel(dateRange)}
        </span>
        {filteredEvents.length > 0 && (
          <span style={{ 
            opacity: 0.7,
            fontSize: '13px',
            marginLeft: '4px'
          }}>
            ({filteredEvents.length})
          </span>
        )}
      </motion.div>

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
            marginTop: '40px',
            textAlign: 'center',
            maxWidth: '90vw',
            width: '100%'
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

