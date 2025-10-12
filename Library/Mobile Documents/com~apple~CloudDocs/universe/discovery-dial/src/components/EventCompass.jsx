import { useMemo, useCallback } from 'react';
import useEventCompassState from '../hooks/useEventCompassState';
import useDialGestures from '../hooks/useDialGestures';
import RedPointer from './RedPointer';
import DialRing from './DialRing';
import CategoryLabels from './CategoryLabels';
import Crosshairs from './Crosshairs';
import EventReadout from './EventReadout';
import { hardTick, softTick } from '../utils/haptics';
import { COMPASS_CONFIG } from '../config/compassConfig';
import { ENABLE_KEYBOARD_SHORTCUTS, SHOW_DEBUG_INFO } from '../config/featureFlags';

/**
 * EventCompass - Main compass dial interface.
 * Fullscreen black container with circular dial and event readout.
 * Performance-optimized with memoization and throttled updates.
 * 
 * @param {Array} categories - Category data from categories.json
 * @param {Object} config - Optional config overrides
 */
export default function EventCompass({ categories = [], config = {} }) {
  // State management (hooks must be called unconditionally)
  const { state, actions } = useEventCompassState(categories);
  
  // Wrap actions with haptic feedback
  const actionsWithHaptics = useMemo(() => ({
    setPrimaryByDirection: (direction) => {
      actions.setPrimaryByDirection(direction);
      hardTick(); // Hard tick on primary category change
    },
    rotateSub: (steps) => {
      actions.rotateSub(steps);
      softTick(); // Soft tick on subcategory snap
    },
    nextEvent: () => {
      actions.nextEvent();
      softTick(); // Soft tick on event navigation
    },
    prevEvent: () => {
      actions.prevEvent();
      softTick(); // Soft tick on event navigation
    }
  }), [actions]);

  // Gesture detection (with optional config overrides)
  const { bindDialAreaProps, bindLowerAreaProps, hoverSubIndex } = 
    useDialGestures(actionsWithHaptics, config.gestures);

  // Map categories to N/E/S/W with active state
  const mappedCategories = useMemo(() => {
    return categories.map((cat, index) => ({
      ...cat,
      isActive: index === state.primaryIndex
    }));
  }, [categories, state.primaryIndex]);

  // Keyboard navigation handler (respects ENABLE_KEYBOARD_SHORTCUTS flag)
  const handleKeyDown = useCallback((e) => {
    if (!ENABLE_KEYBOARD_SHORTCUTS) return;
    
    // Prevent default for our custom keys
    const handledKeys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'a', 'd', 'A', 'D', 'j', 'k', 'J', 'K'];
    if (handledKeys.includes(e.key)) {
      e.preventDefault();
    }

    switch (e.key) {
      // Arrow keys: Primary category navigation (N/E/S/W)
      case 'ArrowUp':
        actionsWithHaptics.setPrimaryByDirection('north');
        break;
      case 'ArrowRight':
        actionsWithHaptics.setPrimaryByDirection('east');
        break;
      case 'ArrowDown':
        actionsWithHaptics.setPrimaryByDirection('south');
        break;
      case 'ArrowLeft':
        actionsWithHaptics.setPrimaryByDirection('west');
        break;

      // A/D: Subcategory rotation
      case 'a':
      case 'A':
        actionsWithHaptics.rotateSub(-1);
        break;
      case 'd':
      case 'D':
        actionsWithHaptics.rotateSub(1);
        break;

      // J/K: Event navigation
      case 'j':
      case 'J':
        actionsWithHaptics.nextEvent();
        break;
      case 'k':
      case 'K':
        actionsWithHaptics.prevEvent();
        break;

      default:
        break;
    }
  }, [actionsWithHaptics]);

  // Early return after hooks if no categories
  if (!categories || categories.length === 0) {
    // Debug: Log to console in production
    if (typeof window !== 'undefined') {
      console.error('🔴 DIAL ERROR: No categories provided to EventCompass');
      console.log('Debug info:', {
        categoriesReceived: categories,
        categoriesLength: categories?.length,
        categoriesType: typeof categories,
        timestamp: new Date().toISOString()
      });
    }
    
    return (
      <div style={{ 
        background: 'black', 
        color: 'white', 
        height: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        fontSize: '20px',
        padding: '20px',
        textAlign: 'center'
      }}>
        <div>
          <div style={{ marginBottom: '20px', color: '#FF3B30' }}>⚠️ No Categories Available</div>
          <div style={{ fontSize: '14px', opacity: 0.7 }}>
            Check that categories.json is loaded correctly
          </div>
          <div style={{ fontSize: '12px', opacity: 0.5, marginTop: '20px', fontFamily: 'monospace' }}>
            categories type: {typeof categories}<br/>
            categories length: {categories?.length || 0}
          </div>
        </div>
      </div>
    );
  }
  
  // Debug: Confirm render in production
  if (typeof window !== 'undefined' && import.meta.env.PROD) {
    console.log('✓ EventCompass rendering with', categories.length, 'categories');
  }

  return (
    <div 
      className="w-full min-h-screen bg-black text-white flex flex-col items-center justify-center"
      style={{
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      }}
      role="application"
      aria-label="Event Compass - Navigate events by category, subcategory, and time"
    >
      {/* Keyboard navigation instructions (visually hidden) */}
      <div className="sr-only" id="compass-instructions">
        Use arrow keys to change primary category (North, East, South, West).
        Press A or D to rotate through subcategories.
        Press J or K to navigate between events.
      </div>

      {/* DIAL AREA: centered square (must be relative for absolute children) */}
      <div
        data-dial-root
        className="relative select-none"
        style={{
          width: 'min(90vw, 520px)',
          height: 'min(90vw, 520px)',
          // Temporary: Very subtle background to verify dial container is rendering
          backgroundColor: 'rgba(255, 255, 255, 0.02)'
        }}
        {...bindDialAreaProps}
        tabIndex={0}
        onKeyDown={handleKeyDown}
        role="group"
        aria-label="Event Compass Dial"
        aria-describedby="compass-instructions"
      >
          {/* Outer circle boundary (visual reference) */}
          <div 
            className="absolute inset-0 rounded-full border-2 border-white"
            style={{ 
              opacity: 0.5,
              pointerEvents: 'none',
              zIndex: 1
            }}
          />

          {/* Red pointer at top */}
          <RedPointer />

          {/* Crosshairs */}
          <Crosshairs />

          {/* Dial ring with subcategories */}
          <div role="group" aria-label="Subcategory ring">
            <DialRing
              hoverSubIndex={hoverSubIndex}
              activeSubIndex={state.subIndex}
              subcategories={state.activePrimary?.subcategories || []}
            />
          </div>

          {/* Primary category labels at N/E/S/W */}
          <div role="group" aria-label="Primary categories">
            <CategoryLabels
              categories={mappedCategories}
              activeDirection={state.activePrimary?.direction}
            />
          </div>

          {/* Center indicator (optional subtle dot) */}
          <div 
            className="absolute left-1/2 top-1/2 w-2 h-2 bg-white rounded-full"
            style={{
              transform: 'translate(-50%, -50%)',
              opacity: 0.3,
              pointerEvents: 'none'
            }}
          />
      </div>

      {/* READOUT centered */}
      <div className="mt-8 w-[min(92vw,640px)] text-center px-4" {...bindLowerAreaProps}>
        <EventReadout
          activeEvent={state.activeEvent}
          activePrimary={state.activePrimary}
        />
      </div>

      {/* Debug info (controlled by SHOW_DEBUG_INFO flag and dev mode) */}
      {SHOW_DEBUG_INFO && import.meta.env.DEV && (
        <div 
          className="fixed bottom-2 right-2 text-white text-xs bg-black bg-opacity-80 p-2 rounded"
          style={{
            fontFamily: 'monospace',
            pointerEvents: 'none',
            zIndex: 9999
          }}
        >
          <div>Primary: {state.primaryIndex} ({state.activePrimary?.label})</div>
          <div>Sub: {state.subIndex} ({state.activeSub?.label})</div>
          <div>Event: {state.eventIndex} ({state.activeEvent?.name?.substring(0, 20)})</div>
          {hoverSubIndex !== null && <div>Hover: {hoverSubIndex}</div>}
        </div>
      )}
    </div>
  );
}

