import { motion } from 'framer-motion';

const TimeframeToggle = ({ label, onNext }) => {
  const handleClick = () => {
    onNext();
    // Haptic feedback
    if (navigator.vibrate) {
      navigator.vibrate(10);
    }
    // ARIA announcement
    const announcement = `Timeframe set to ${label}`;
    if (window.speechSynthesis) {
      const utterance = new SpeechSynthesisUtterance(announcement);
      utterance.volume = 0.1;
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <motion.button
      onClick={handleClick}
      className="px-6 py-3 rounded-full bg-red-600 text-white backdrop-blur-sm
                 shadow-[0_0_20px_rgba(230,57,70,0.25)] hover:bg-red-700
                 border border-red-500 transition-all duration-200"
      aria-label={`Change timeframe. Current: ${label}`}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
    >
      <span className="text-sm font-medium">{label}</span>
    </motion.button>
  );
};

export default TimeframeToggle;
