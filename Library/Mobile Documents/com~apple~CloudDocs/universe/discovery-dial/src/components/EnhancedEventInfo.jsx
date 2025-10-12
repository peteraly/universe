import { motion, AnimatePresence } from 'framer-motion';
import { memo } from 'react';

const EnhancedEventInfo = ({ 
  currentEvent, 
  recommendations = [], 
  onRecommendationClick,
  onEventAction 
}) => {
  if (!currentEvent) {
    return (
      <motion.div
        className="event-info-area"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="text-center py-8">
          <div className="text-black/60 mb-4">No events in this window</div>
          <div className="flex justify-center space-x-4">
            <button className="px-4 py-2 bg-red-600/10 text-red-600 rounded text-sm hover:bg-red-600/20 transition-colors">
              Try Earlier
            </button>
            <button className="px-4 py-2 bg-red-600/10 text-red-600 rounded text-sm hover:bg-red-600/20 transition-colors">
              Try Later
            </button>
            <button className="px-4 py-2 bg-red-600/10 text-red-600 rounded text-sm hover:bg-red-600/20 transition-colors">
              This Week
            </button>
          </div>
        </div>
      </motion.div>
    );
  }

  const { title, time, city, distance, categoryLabel, categoryIcon } = currentEvent;

  return (
    <motion.div
      className="event-info-area"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Current Event Display */}
      <div className="current-event">
        <motion.h3
          className="text-lg font-bold text-black mb-2 leading-tight"
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
          {title}
        </motion.h3>
        
        <motion.div
          className="text-sm text-black/70 mb-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {time} • {city}
        </motion.div>
        
        <motion.div
          className="text-xs text-black/60 flex items-center justify-center gap-2 mb-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <span>{distance || '— mi'}</span>
          <span>•</span>
          <span>{categoryIcon} {categoryLabel}</span>
        </motion.div>

        {/* Quick Actions */}
        <div className="flex justify-center gap-3 mb-4">
          <motion.button
            className="px-4 py-2 bg-red-600 text-white rounded-full text-xs font-medium hover:bg-red-700 transition-colors touch-target no-select"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onEventAction?.('save', currentEvent)}
          >
            Save Event
          </motion.button>
          <motion.button
            className="px-4 py-2 bg-white border border-red-600 text-red-600 rounded-full text-xs font-medium hover:bg-red-50 transition-colors touch-target no-select"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onEventAction?.('directions', currentEvent)}
          >
            Directions
          </motion.button>
        </div>
      </div>

      {/* Recommendations Section */}
      {recommendations.length > 0 && (
        <motion.div
          className="recommendations"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          transition={{ delay: 0.4, duration: 0.3 }}
        >
          <h4 className="text-xs font-semibold text-black/80 mb-2">Similar Events:</h4>
          <div className="recommendation-chips">
            <AnimatePresence>
              {recommendations.map((rec, index) => (
                <motion.span
                  key={rec.id || rec.title}
                  className="recommendation-chip touch-target no-select"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  whileHover={{ scale: 1.05, backgroundColor: 'rgba(230,57,70,0.2)' }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onRecommendationClick?.(rec)}
                >
                  {rec.title}
                </motion.span>
              ))}
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default memo(EnhancedEventInfo);
