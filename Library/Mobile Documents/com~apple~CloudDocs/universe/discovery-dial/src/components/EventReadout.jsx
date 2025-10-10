import { motion } from 'framer-motion';

const EventReadout = ({ event }) => {
  const { title, time, city, distance, categoryLabel, categoryIcon } = event;

  return (
    <motion.div
      className="text-center px-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <motion.h2
        className="text-2xl font-semibold text-white mb-1"
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.1, type: 'spring', stiffness: 300 }}
      >
        {title}
      </motion.h2>
      
      <motion.div
        className="text-sm text-white/80 mb-1"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        {time} • {city}
      </motion.div>
      
      <motion.div
        className="text-sm text-white/60 flex items-center justify-center gap-1"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <span>{distance}</span>
        <span>•</span>
        <span>{categoryIcon} {categoryLabel}</span>
      </motion.div>
    </motion.div>
  );
};

export default EventReadout;
