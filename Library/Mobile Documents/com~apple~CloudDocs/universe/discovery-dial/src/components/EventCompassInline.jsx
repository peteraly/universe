import { useMemo, useCallback } from 'react';
import useEventCompassState from '../hooks/useEventCompassState';

/**
 * EMERGENCY VERSION - INLINE STYLES ONLY
 * NO TAILWIND, NO EXTERNAL CSS
 */
export default function EventCompassInline({ categories = [] }) {
  console.log('🔵 EventCompassInline rendering');
  
  const { state, actions } = useEventCompassState(categories);
  
  if (!categories || categories.length === 0) {
    return (
      <div style={{ 
        background: '#FF0000',
        color: '#FFFFFF', 
        height: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        fontSize: '24px',
        fontWeight: 'bold'
      }}>
        NO CATEGORIES
      </div>
    );
  }
  
  console.log('🔵 Rendering dial with', categories.length, 'categories');
  console.log('🔵 Active primary:', state.activePrimary?.label);
  console.log('🔵 Active event:', state.activeEvent?.name);
  
  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      background: '#000000',
      color: '#FFFFFF',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'system-ui, sans-serif'
    }}>
      {/* DIAL CONTAINER */}
      <div 
        data-dial-root
        style={{
          position: 'relative',
          width: '400px',
          height: '400px',
          background: 'rgba(255, 255, 255, 0.05)',
          outline: '5px solid red',
          borderRadius: '0'
        }}
      >
        {/* OUTER CIRCLE */}
        <div style={{
          position: 'absolute',
          inset: '0',
          border: '6px solid white',
          borderRadius: '50%',
          opacity: 1.0,
          boxShadow: '0 0 30px rgba(255, 255, 255, 0.8)',
          pointerEvents: 'none'
        }} />
        
        {/* RED TRIANGLE */}
        <div style={{
          position: 'absolute',
          left: '50%',
          top: '10px',
          transform: 'translateX(-50%)',
          width: '0',
          height: '0',
          borderLeft: '15px solid transparent',
          borderRight: '15px solid transparent',
          borderBottom: '20px solid #FF3B30'
        }} />
        
        {/* CATEGORY LABELS */}
        <div style={{
          position: 'absolute',
          left: '50%',
          top: '20px',
          transform: 'translateX(-50%)',
          fontSize: '14px',
          fontWeight: 'bold',
          color: 'white'
        }}>
          {categories[0]?.label?.toUpperCase()}
        </div>
        
        <div style={{
          position: 'absolute',
          right: '20px',
          top: '50%',
          transform: 'translateY(-50%)',
          fontSize: '14px',
          fontWeight: 'bold',
          color: 'rgba(255, 255, 255, 0.6)'
        }}>
          {categories[1]?.label?.toUpperCase()}
        </div>
        
        <div style={{
          position: 'absolute',
          left: '50%',
          bottom: '20px',
          transform: 'translateX(-50%)',
          fontSize: '14px',
          fontWeight: 'bold',
          color: 'rgba(255, 255, 255, 0.6)'
        }}>
          {categories[2]?.label?.toUpperCase()}
        </div>
        
        <div style={{
          position: 'absolute',
          left: '20px',
          top: '50%',
          transform: 'translateY(-50%)',
          fontSize: '14px',
          fontWeight: 'bold',
          color: 'rgba(255, 255, 255, 0.6)'
        }}>
          {categories[3]?.label?.toUpperCase()}
        </div>
        
        {/* CENTER DOT */}
        <div style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
          width: '8px',
          height: '8px',
          background: 'white',
          borderRadius: '50%'
        }} />
      </div>
      
      {/* EVENT INFO */}
      <div style={{
        marginTop: '40px',
        textAlign: 'center',
        maxWidth: '600px',
        padding: '20px'
      }}>
        <h2 style={{
          fontSize: '28px',
          fontWeight: 'bold',
          marginBottom: '10px',
          color: 'white'
        }}>
          {state.activeEvent?.name || 'No Event'}
        </h2>
        <p style={{
          fontSize: '16px',
          color: 'rgba(255, 255, 255, 0.8)',
          marginBottom: '5px'
        }}>
          {state.activeEvent?.address || 'No address'}
        </p>
        <p style={{
          fontSize: '16px',
          color: 'rgba(255, 255, 255, 0.7)'
        }}>
          {state.activeEvent?.time || 'No time'}
        </p>
      </div>
      
      {/* DEBUG INFO */}
      <div style={{
        position: 'fixed',
        top: '10px',
        right: '10px',
        background: 'rgba(0, 0, 0, 0.8)',
        color: 'lime',
        padding: '10px',
        fontSize: '12px',
        fontFamily: 'monospace',
        border: '2px solid lime'
      }}>
        <div>PRIMARY: {state.activePrimary?.label}</div>
        <div>SUB: {state.activeSub?.label}</div>
        <div>EVENT: {state.eventIndex + 1}</div>
        <div style={{color: 'yellow', marginTop: '5px'}}>INLINE STYLES MODE</div>
      </div>
    </div>
  );
}



