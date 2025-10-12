import { useMemo, useCallback, useEffect } from 'react';
import useEventCompassState from '../hooks/useEventCompassState';
import useDialGestures from '../hooks/useDialGestures';
import { hardTick, softTick } from '../utils/haptics';

/**
 * HYBRID VERSION - Tailwind + Inline Style Fallbacks
 * Guaranteed to render with proper layout and styling
 */
export default function EventCompassHybrid({ categories = [], config = {} }) {
  console.log('🔵 EventCompassHybrid rendering with', categories?.length, 'categories');
  
  // EMERGENCY AUTO-FIX: Force dial visibility after render
  useEffect(() => {
    console.log('🔧 Running emergency visibility fix...');
    
    const fixVisibility = () => {
      const dial = document.querySelector('[data-dial-root]');
      if (!dial) {
        console.warn('⚠️ Dial container not found for auto-fix');
        return;
      }
      
      console.log('✓ Dial container found, applying fixes...');
      
      // Force dial container to be visible
      dial.style.outline = '10px solid red';
      dial.style.outlineOffset = '0px';
      dial.style.backgroundColor = 'rgba(255, 0, 0, 0.1)';
      
      // Fix all circle divs
      const circles = dial.querySelectorAll('div[style*="border-radius"]');
      console.log(`Found ${circles.length} circle divs`);
      
      circles.forEach((circle, i) => {
        console.log(`Fixing circle ${i}...`);
        circle.style.border = '10px solid white';
        circle.style.borderRadius = '50%';
        circle.style.opacity = '1';
        circle.style.position = 'absolute';
        circle.style.top = '0';
        circle.style.right = '0';
        circle.style.bottom = '0';
        circle.style.left = '0';
        circle.style.zIndex = '100';
        circle.style.pointerEvents = 'none';
      });
      
      // Fix SVG circles
      const svgCircles = dial.querySelectorAll('svg circle');
      console.log(`Found ${svgCircles.length} SVG circles`);
      
      svgCircles.forEach((svgCircle, i) => {
        console.log(`Fixing SVG circle ${i}...`);
        svgCircle.setAttribute('stroke', 'white');
        svgCircle.setAttribute('stroke-opacity', '1.0');
        svgCircle.setAttribute('stroke-width', '5');
      });
      
      console.log('✅ Emergency visibility fix complete');
      
      // If no circles were found, CREATE ONE
      if (circles.length === 0) {
        console.warn('⚠️ No circle divs found! Creating one manually...');
        const newCircle = document.createElement('div');
        newCircle.style.position = 'absolute';
        newCircle.style.top = '0';
        newCircle.style.right = '0';
        newCircle.style.bottom = '0';
        newCircle.style.left = '0';
        newCircle.style.border = '10px solid white';
        newCircle.style.borderRadius = '50%';
        newCircle.style.opacity = '1';
        newCircle.style.zIndex = '100';
        newCircle.style.pointerEvents = 'none';
        newCircle.style.boxShadow = '0 0 30px rgba(255, 255, 255, 0.8)';
        dial.appendChild(newCircle);
        console.log('✅ Created circle manually');
      }
    };
    
    // Run fix after a short delay to ensure DOM is ready
    const timer = setTimeout(fixVisibility, 100);
    
    return () => clearTimeout(timer);
  }, []);
  
  const { state, actions } = useEventCompassState(categories);
  
  const actionsWithHaptics = useMemo(() => ({
    setPrimaryByDirection: (direction) => {
      actions.setPrimaryByDirection(direction);
      hardTick();
    },
    rotateSub: (steps) => {
      actions.rotateSub(steps);
      softTick();
    },
    nextEvent: () => {
      actions.nextEvent();
      softTick();
    },
    prevEvent: () => {
      actions.prevEvent();
      softTick();
    }
  }), [actions]);

  const { bindDialAreaProps, bindLowerAreaProps, hoverSubIndex } = 
    useDialGestures(actionsWithHaptics, config.gestures);

  if (!categories || categories.length === 0) {
    return (
      <div style={{ 
        background: '#000000',
        color: '#ffffff', 
        height: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        fontSize: '20px',
        padding: '20px',
        textAlign: 'center',
        fontFamily: 'system-ui, sans-serif'
      }}>
        <div>
          <div style={{ marginBottom: '20px', color: '#FF3B30' }}>⚠️ No Categories Available</div>
          <div style={{ fontSize: '14px', opacity: 0.7 }}>
            Check that categories.json is loaded correctly
          </div>
        </div>
      </div>
    );
  }
  
  console.log('🔵 Active state:', { 
    primary: state.activePrimary?.label,
    sub: state.activeSub?.label,
    event: state.activeEvent?.name 
  });

  return (
    <div 
      className="w-full min-h-screen bg-black text-white flex flex-col items-center justify-center"
      style={{
        // Inline fallbacks to guarantee rendering
        width: '100vw',
        minHeight: '100vh',
        background: '#000000',
        color: '#ffffff',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      }}
      role="application"
      aria-label="Event Compass - Navigate events by category"
    >
      {/* DIAL AREA */}
      <div
        data-dial-root
        className="relative select-none"
        style={{
          // Force dimensions with inline styles (Tailwind fallback)
          width: 'min(90vw, 520px)',
          height: 'min(90vw, 520px)',
          maxWidth: '520px',
          maxHeight: '520px',
          position: 'relative',
          userSelect: 'none',
          outline: '2px solid rgba(255, 59, 48, 0.3)',
          backgroundColor: 'rgba(255, 255, 255, 0.05)'
        }}
        {...bindDialAreaProps}
        tabIndex={0}
        role="group"
        aria-label="Event Compass Dial"
      >
        {/* Outer circle boundary - EMERGENCY BRIGHT MODE */}
        <div 
          className="absolute inset-0 rounded-full border-4 border-white"
          style={{ 
            position: 'absolute',
            top: '0',
            right: '0',
            bottom: '0',
            left: '0',
            borderRadius: '50%',
            border: '4px solid white',
            opacity: 1.0,
            pointerEvents: 'none',
            zIndex: 1,
            boxShadow: '0 0 20px rgba(255, 255, 255, 0.5)'
          }}
        />

        {/* Red pointer at top */}
        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: '6px',
            transform: 'translateX(-50%)',
            zIndex: 20,
            pointerEvents: 'none'
          }}
        >
          <svg
            aria-hidden="true"
            width="18"
            height="12"
            viewBox="0 0 18 12"
            focusable="false"
          >
            <path d="M9 0 L18 12 H0 Z" fill="#FF3B30" />
          </svg>
        </div>

        {/* Crosshairs */}
        <svg 
          className="absolute inset-0 pointer-events-none"
          style={{
            position: 'absolute',
            top: '0',
            left: '0',
            width: '100%',
            height: '100%',
            pointerEvents: 'none'
          }}
          aria-hidden="true"
        >
          <line x1="50%" y1="0" x2="50%" y2="100%" stroke="white" strokeOpacity="0.1" strokeWidth="1" />
          <line x1="0" y1="50%" x2="100%" y2="50%" stroke="white" strokeOpacity="0.1" strokeWidth="1" />
        </svg>

        {/* Dial ring SVG */}
        <svg
          className="absolute inset-0 pointer-events-none"
          style={{
            position: 'absolute',
            top: '0',
            left: '0',
            width: '100%',
            height: '100%',
            pointerEvents: 'none'
          }}
          viewBox="0 0 100 100"
          preserveAspectRatio="xMidYMid meet"
        >
          <circle
            cx="50"
            cy="50"
            r="47.5"
            stroke="white"
            strokeOpacity="0.8"
            strokeWidth="2.0"
            fill="none"
          />
        </svg>

        {/* Category labels at N/E/S/W */}
        <div 
          className="absolute"
          style={{ 
            position: 'absolute',
            left: '50%',
            top: '8px',
            transform: 'translateX(-50%)',
            fontSize: '11px',
            fontWeight: '500',
            letterSpacing: '0.05em',
            color: 'white',
            zIndex: 10
          }}
        >
          {categories[0]?.label?.toUpperCase()}
        </div>
        
        <div 
          className="absolute"
          style={{ 
            position: 'absolute',
            right: '8px',
            top: '50%',
            transform: 'translateY(-50%)',
            fontSize: '11px',
            fontWeight: '500',
            letterSpacing: '0.05em',
            color: 'rgba(255, 255, 255, 0.6)',
            zIndex: 10
          }}
        >
          {categories[1]?.label?.toUpperCase()}
        </div>
        
        <div 
          className="absolute"
          style={{ 
            position: 'absolute',
            left: '50%',
            bottom: '8px',
            transform: 'translateX(-50%)',
            fontSize: '11px',
            fontWeight: '500',
            letterSpacing: '0.05em',
            color: 'rgba(255, 255, 255, 0.6)',
            zIndex: 10
          }}
        >
          {categories[2]?.label?.toUpperCase()}
        </div>
        
        <div 
          className="absolute"
          style={{ 
            position: 'absolute',
            left: '8px',
            top: '50%',
            transform: 'translateY(-50%)',
            fontSize: '11px',
            fontWeight: '500',
            letterSpacing: '0.05em',
            color: 'rgba(255, 255, 255, 0.6)',
            zIndex: 10
          }}
        >
          {categories[3]?.label?.toUpperCase()}
        </div>

        {/* Center indicator dot */}
        <div 
          className="absolute"
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            width: '8px',
            height: '8px',
            background: 'white',
            borderRadius: '50%',
            opacity: 0.3,
            pointerEvents: 'none'
          }}
        />
      </div>

      {/* EVENT READOUT */}
      <div 
        className="mt-8 text-center px-4"
        style={{
          marginTop: '32px',
          textAlign: 'center',
          padding: '0 16px',
          maxWidth: 'min(92vw, 640px)',
          width: '100%'
        }}
        {...bindLowerAreaProps}
      >
        {state.activeEvent ? (
          <>
            <h2 style={{
              fontSize: 'clamp(24px, 5vw, 32px)',
              fontWeight: 'bold',
              marginBottom: '8px',
              lineHeight: '1.2',
              letterSpacing: '-0.01em',
              color: 'white'
            }}>
              {state.activeEvent.name}
            </h2>

            <p style={{
              fontSize: 'clamp(14px, 3vw, 16px)',
              color: 'rgba(255, 255, 255, 0.9)',
              marginTop: '8px'
            }}>
              {state.activeEvent.tags?.join(' · ')} · {state.activePrimary?.label}
            </p>

            <p style={{
              fontSize: 'clamp(14px, 3vw, 16px)',
              color: 'rgba(255, 255, 255, 0.8)',
              marginTop: '4px'
            }}>
              {state.activeEvent.address}
            </p>

            <p style={{
              fontSize: 'clamp(14px, 3vw, 16px)',
              color: 'rgba(255, 255, 255, 0.7)',
              marginTop: '4px'
            }}>
              {state.activeEvent.time}
              {state.activeEvent.distance && ` · ${state.activeEvent.distance}`}
            </p>
          </>
        ) : (
          <p style={{ color: 'rgba(255, 255, 255, 0.5)' }}>No events found</p>
        )}
      </div>

      {/* Debug info (development only) */}
      {import.meta.env.DEV && (
        <div 
          style={{
            position: 'fixed',
            bottom: '8px',
            right: '8px',
            color: 'white',
            fontSize: '11px',
            background: 'rgba(0, 0, 0, 0.8)',
            padding: '8px',
            borderRadius: '4px',
            fontFamily: 'monospace',
            pointerEvents: 'none',
            zIndex: 9999,
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}
        >
          <div>Primary: {state.primaryIndex} ({state.activePrimary?.label})</div>
          <div>Sub: {state.subIndex} ({state.activeSub?.label})</div>
          <div>Event: {state.eventIndex}</div>
          <div style={{color: 'yellow', marginTop: '4px'}}>HYBRID MODE</div>
        </div>
      )}
    </div>
  );
}

