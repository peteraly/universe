import { motion } from 'framer-motion';

const TimeframeToggle = ({ label, onNext }) => {
  return (
    <motion.button
      onClick={onNext}
      className="px-6 py-3 rounded-full bg-white/10 text-white backdrop-blur-sm
                 shadow-[0_0_20px_rgba(230,57,70,0.25)] hover:bg-white/15
                 border border-white/20 transition-all duration-200"
      aria-label="Change timeframe"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
    >
      <span className="text-sm font-medium">{label}</span>
    </motion.button>
  );
};

export default TimeframeToggle;
