import { motion, AnimatePresence } from 'framer-motion';
import { ZONES } from '../utils/gestureZones';

/**
 * GestureHints - Visual overlays showing which gesture type is active
 * 
 * Shows:
 * - Directional arrows (↑ → ↓ ←) when touching center zone (primary categories)
 * - Rotation symbol (↻) when touching perimeter zone (subcategories)
 * 
 * @param {Object} props
 * @param {string} props.activeZone - Current touch zone (ZONES.CENTER | ZONES.PERIMETER | null)
 * @param {string} props.activeGesture - Current gesture type ('primarySwipe' | 'subcategoryRotation' | null)
 * @param {string} props.direction - Swipe direction ('north' | 'east' | 'south' | 'west' | null)
 */
export default function GestureHints({ activeZone, activeGesture, direction }) {
  return (
    <>
      {/* CENTER ZONE HINTS - Directional arrows for primary category swipes */}
      <AnimatePresence>
        {activeZone === ZONES.CENTER && !activeGesture && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 0.3, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2 }}
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 40px)',
              gridTemplateRows: 'repeat(3, 40px)',
              gap: '4px',
              pointerEvents: 'none',
              zIndex: 15
            }}
          >
            <div />
            <div style={{ 
              fontSize: '28px', 
              opacity: 0.6, 
              textAlign: 'center',
              color: 'rgba(100, 150, 255, 0.8)'
            }}>↑</div>
            <div />
            <div style={{ 
              fontSize: '28px', 
              opacity: 0.6, 
              textAlign: 'center',
              color: 'rgba(100, 150, 255, 0.8)'
            }}>←</div>
            <div />
            <div style={{ 
              fontSize: '28px', 
              opacity: 0.6, 
              textAlign: 'center',
              color: 'rgba(100, 150, 255, 0.8)'
            }}>→</div>
            <div />
            <div style={{ 
              fontSize: '28px', 
              opacity: 0.6, 
              textAlign: 'center',
              color: 'rgba(100, 150, 255, 0.8)'
            }}>↓</div>
            <div />
          </motion.div>
        )}
      </AnimatePresence>

      {/* PERIMETER ZONE HINTS - Rotation symbol for subcategory rotation */}
      <AnimatePresence>
        {activeZone === ZONES.PERIMETER && !activeGesture && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 0.4, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2 }}
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              pointerEvents: 'none',
              zIndex: 15
            }}
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ 
                duration: 2, 
                repeat: Infinity, 
                ease: 'linear' 
              }}
              style={{
                fontSize: '40px',
                color: 'rgba(255, 255, 255, 0.6)',
                textAlign: 'center'
              }}
            >
              ↻
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ACTIVE GESTURE FEEDBACK - Large directional arrow during primary swipe */}
      <AnimatePresence>
        {activeGesture === 'primarySwipe' && direction && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 0.6, scale: 1.2 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.15 }}
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              fontSize: '64px',
              color: 'rgba(100, 150, 255, 0.9)',
              pointerEvents: 'none',
              zIndex: 25,
              fontWeight: 'bold',
              textShadow: '0 0 20px rgba(100, 150, 255, 0.6)'
            }}
          >
            {direction === 'north' && '↑'}
            {direction === 'east' && '→'}
            {direction === 'south' && '↓'}
            {direction === 'west' && '←'}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ZONE BOUNDARY INDICATORS - Subtle rings showing zones */}
      <svg
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: 2
        }}
        viewBox="0 0 100 100"
      >
        {/* Center zone boundary (40% radius) */}
        <circle
          cx="50"
          cy="50"
          r="40"
          fill="none"
          stroke="rgba(100, 150, 255, 0.2)"
          strokeWidth="0.5"
          strokeDasharray="2 2"
          opacity={activeZone === ZONES.CENTER ? 0.8 : 0.15}
          style={{ transition: 'opacity 0.2s' }}
        />
      </svg>
    </>
  );
}

