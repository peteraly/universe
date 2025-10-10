import { motion } from 'framer-motion';

const EventReadout = ({ event, onSingleTap, onDoubleTap }) => {
  const { title, time, city, distance, categoryLabel, categoryIcon } = event;

  const handleTap = () => {
    onSingleTap && onSingleTap(event);
  };

  const handleDoubleTap = () => {
    onDoubleTap && onDoubleTap(event);
  };

  return (
    <motion.div
      className="text-center px-4 cursor-pointer"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      onClick={handleTap}
      onDoubleClick={handleDoubleTap}
      role="button"
      tabIndex={0}
      aria-label={`Event: ${title}. ${time} in ${city}. ${distance} away. Category: ${categoryLabel}`}
      aria-live="polite"
      aria-atomic="true"
    >
      <motion.h2
        className="text-[24px] font-semibold text-white mb-1 leading-tight"
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
      </motion.h2>
      
      <motion.div
        className="text-[14px] text-white/70 mb-1"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        {time} • {city}
      </motion.div>
      
      <motion.div
        className="text-[13px] text-white/60 flex items-center justify-center gap-1"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <span>{distance || '— mi'}</span>
        <span>•</span>
        <span>{categoryIcon} {categoryLabel}</span>
      </motion.div>
    </motion.div>
  );
};

export default EventReadout;
