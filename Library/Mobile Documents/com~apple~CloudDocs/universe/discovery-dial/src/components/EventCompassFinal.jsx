import { useMemo, useCallback, useState, useEffect } from 'react';
import useEventCompassState from '../hooks/useEventCompassState';
import useDialGestures from '../hooks/useDialGestures';
import { hardTick, softTick } from '../utils/haptics';

/**
 * FINAL PRODUCTION VERSION
 * Clean, minimal compass-style dial matching iPhone Compass aesthetic
 */
export default function EventCompassFinal({ categories = [], config = {} }) {
  const [dialSize, setDialSize] = useState(400);
  
  // Calculate responsive dial size
  useEffect(() => {
    const calculateSize = () => {
      const size = Math.min(
        window.innerWidth * 0.85,
        window.innerHeight * 0.5,
        480
      );
      setDialSize(size);
    };
    
    calculateSize();
    window.addEventListener('resize', calculateSize);
    return () => window.removeEventListener('resize', calculateSize);
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
        {/* OUTER CIRCLE + SUBCATEGORY TICKS */}
        <svg
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none'
          }}
          viewBox="0 0 100 100"
        >
          {/* Main circle */}
          <circle
            cx="50"
            cy="50"
            r="48"
            fill="none"
            stroke="white"
            strokeWidth="0.5"
            opacity="0.4"
          />
          
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

        {/* RED POINTER - Small triangle at top */}
        <svg
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
        </svg>

        {/* CROSSHAIRS - Subtle */}
        <svg
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none'
          }}
          viewBox="0 0 100 100"
        >
          <line x1="50" y1="0" x2="50" y2="100" stroke="white" strokeWidth="0.3" opacity="0.15" />
          <line x1="0" y1="50" x2="100" y2="50" stroke="white" strokeWidth="0.3" opacity="0.15" />
        </svg>

        {/* PRIMARY CATEGORY LABELS (Always visible, faded when inactive) */}
        {/* North */}
        <div style={{
          position: 'absolute',
          left: '50%',
          top: '20px',
          transform: 'translateX(-50%)',
          fontSize: '13px',
          fontWeight: '600',
          letterSpacing: '0.5px',
          color: 'white',
          opacity: state.primaryIndex === 0 ? 1 : 0.3,
          transition: 'opacity 0.3s',
          zIndex: 5
        }}>
          {categories[0]?.label?.toUpperCase()}
        </div>

        {/* East */}
        <div style={{
          position: 'absolute',
          right: '20px',
          top: '50%',
          transform: 'translateY(-50%)',
          fontSize: '13px',
          fontWeight: '600',
          letterSpacing: '0.5px',
          color: 'white',
          opacity: state.primaryIndex === 1 ? 1 : 0.3,
          transition: 'opacity 0.3s',
          zIndex: 5
        }}>
          {categories[1]?.label?.toUpperCase()}
        </div>

        {/* South */}
        <div style={{
          position: 'absolute',
          left: '50%',
          bottom: '20px',
          transform: 'translateX(-50%)',
          fontSize: '13px',
          fontWeight: '600',
          letterSpacing: '0.5px',
          color: 'white',
          opacity: state.primaryIndex === 2 ? 1 : 0.3,
          transition: 'opacity 0.3s',
          zIndex: 5
        }}>
          {categories[2]?.label?.toUpperCase()}
        </div>

        {/* West */}
        <div style={{
          position: 'absolute',
          left: '20px',
          top: '50%',
          transform: 'translateY(-50%)',
          fontSize: '13px',
          fontWeight: '600',
          letterSpacing: '0.5px',
          color: 'white',
          opacity: state.primaryIndex === 3 ? 1 : 0.3,
          transition: 'opacity 0.3s',
          zIndex: 5
        }}>
          {categories[3]?.label?.toUpperCase()}
        </div>

        {/* SUBCATEGORY LABELS (Around perimeter) */}
        {subcategories.map((sub, i) => {
          const angle = (i * 360) / subCount;
          const radius = dialSize * 0.35; // 35% from center
          const centerX = dialSize / 2;
          const centerY = dialSize / 2;
          const pos = polarToCartesian(centerX, centerY, radius, angle);
          
          const isActive = i === state.subIndex;
          const isHovered = hoverSubIndex !== null && i === hoverSubIndex;
          const highlighted = isActive || isHovered;
          
          return (
            <div
              key={sub.id}
              style={{
                position: 'absolute',
                left: `${pos.x}px`,
                top: `${pos.y}px`,
                transform: 'translate(-50%, -50%)',
                fontSize: '11px',
                fontWeight: highlighted ? '600' : '500',
                letterSpacing: '0.3px',
                color: 'white',
                opacity: highlighted ? 1 : 0.5,
                transition: 'opacity 0.2s, font-weight 0.2s',
                whiteSpace: 'nowrap',
                textAlign: 'center',
                zIndex: 3
              }}
            >
              {sub.label.toUpperCase()}
            </div>
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
          opacity: 0.4
        }} />
      </div>

      {/* EVENT READOUT - Below dial */}
      <div 
        {...bindLowerAreaProps}
        style={{
          marginTop: '40px',
          textAlign: 'center',
          maxWidth: '90vw',
          width: '100%'
        }}
      >
        {state.activeEvent ? (
          <>
            <h2 style={{
              fontSize: 'clamp(24px, 6vw, 32px)',
              fontWeight: '700',
              marginBottom: '12px',
              lineHeight: '1.2',
              letterSpacing: '-0.02em'
            }}>
              {state.activeEvent.name}
            </h2>

            <p style={{
              fontSize: 'clamp(14px, 3.5vw, 16px)',
              opacity: 0.9,
              marginBottom: '6px'
            }}>
              {state.activeEvent.tags?.join(' · ')}
              {state.activeEvent.tags?.length > 0 && ' · '}
              {state.activePrimary?.label}
            </p>

            <p style={{
              fontSize: 'clamp(14px, 3.5vw, 16px)',
              opacity: 0.8,
              marginBottom: '6px'
            }}>
              {state.activeEvent.address}
            </p>

            <p style={{
              fontSize: 'clamp(14px, 3.5vw, 16px)',
              opacity: 0.7
            }}>
              {state.activeEvent.time}
              {state.activeEvent.distance && ` · ${state.activeEvent.distance}`}
            </p>
          </>
        ) : (
          <p style={{ opacity: 0.5 }}>No events found</p>
        )}
      </div>
    </div>
  );
}

