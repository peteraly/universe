import { motion, AnimatePresence } from 'framer-motion';
import useReducedMotion from '../hooks/useReducedMotion';
import { SHOW_DISTANCE } from '../config/featureFlags';

/**
 * EventReadout - Displays current event details with gesture support.
 * Animates on event change with fade/slide transitions.
 * Distance display is controlled by SHOW_DISTANCE feature flag.
 * 
 * @param {Object} activeEvent - Current event object
 * @param {Object} activePrimary - Current primary category
 * @param {Object} bindProps - Gesture props from useDialGestures (bindLowerAreaProps)
 */
export default function EventReadout({ activeEvent, activePrimary }) {
  const prefersReducedMotion = useReducedMotion();
  
  if (!activeEvent) {
    return (
      <div 
        className="w-full px-4 py-6 text-center mx-auto"
        role="region"
        aria-label="Event details"
        aria-live="polite"
      >
        <p className="text-white" style={{ opacity: 0.5 }}>
          No events found
        </p>
      </div>
    );
  }

  return (
    <div 
      className="w-full px-4 py-6 text-center mx-auto"
      role="region"
      aria-label="Event details"
      aria-live="polite"
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={activeEvent.id}
          initial={{ opacity: 1, y: 0 }}
          animate={{ opacity: 1, y: 0 }}
          exit={prefersReducedMotion ? false : { opacity: 0, y: -20 }}
          transition={{ duration: 0.15 }}
        >
          {/* Event name - bold, larger, responsive */}
          <h2 
            className="text-white font-bold mb-2 text-2xl md:text-3xl"
            style={{
              fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
              lineHeight: 1.2,
              letterSpacing: '-0.01em'
            }}
          >
            {activeEvent.name}
          </h2>

          {/* Tags/Type - responsive */}
          {activeEvent.tags && activeEvent.tags.length > 0 && (
            <p 
              className="text-white mb-1 text-sm md:text-base"
              style={{
                opacity: 0.9,
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
              }}
            >
              {(activeEvent.tags.length ? activeEvent.tags.join(' · ') + ' · ' : '')}
              {activePrimary?.label}
            </p>
          )}

          {/* Address - responsive */}
          {activeEvent.address && (
            <p 
              className="text-white mb-1 text-sm md:text-base"
              style={{
                opacity: 0.8,
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
              }}
            >
              {activeEvent.address}
            </p>
          )}

          {/* Time & Distance - responsive */}
          <div 
            className="text-white flex items-center justify-center gap-3 text-sm md:text-base"
            style={{
              opacity: 0.7,
              fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
            }}
          >
            {activeEvent.time && <span>{activeEvent.time}</span>}
            {SHOW_DISTANCE && activeEvent.time && activeEvent.distance && <span>·</span>}
            {SHOW_DISTANCE && activeEvent.distance && <span>{activeEvent.distance}</span>}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
