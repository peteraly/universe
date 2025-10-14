import { motion, AnimatePresence } from 'framer-motion';

const EventCounter = ({ current, total, isVisible = true }) => {
  if (!isVisible || total <= 1) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="absolute bottom-2 right-4 text-xs text-white/50 font-medium"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        transition={{ duration: 0.2 }}
      >
        {current + 1} / {total}
      </motion.div>
    </AnimatePresence>
  );
};

export default EventCounter;

