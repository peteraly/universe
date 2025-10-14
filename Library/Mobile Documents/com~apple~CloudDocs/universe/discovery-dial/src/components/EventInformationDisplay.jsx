import { motion, AnimatePresence } from 'framer-motion';
import { memo } from 'react';

const EventInformationDisplay = ({ event, isVisible = true }) => {
  if (!isVisible || !event) return null;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={event.id || 'no-event'}
        className="event-information-area"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
      >
        <div className="event-content">
          <motion.h2
            className="event-title"
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.1, type: 'spring', stiffness: 300 }}
            style={{ 
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden'
            }}
          >
            {event.name || 'No Event Selected'}
          </motion.h2>
          
          <motion.div
            className="event-description"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            {event.tags?.join(' · ')}
            {event.tags?.length > 0 && ' · '}
            {event.category}
          </motion.div>
          
          <motion.div
            className="event-details"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            {event.address && (
              <div className="event-address">
                {event.address}
              </div>
            )}
            
            <div className="event-time-distance">
              {event.time}
              {event.distance && ` · ${event.distance}`}
            </div>
          </motion.div>

          {/* Event count indicator */}
          {event.totalEvents > 1 && (
            <motion.div
              className="event-count-indicator"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              {event.currentIndex + 1} of {event.totalEvents} events
            </motion.div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default memo(EventInformationDisplay);
