import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { TIMEFRAMES } from '../utils/formatters';

const TimeframeToggle = ({ currentTimeframe, onTimeframeChange }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleClick = useCallback(() => {
    // Cycle through timeframes
    const nextIndex = (currentIndex + 1) % TIMEFRAMES.length;
    const nextTimeframe = TIMEFRAMES[nextIndex];
    
    setCurrentIndex(nextIndex);
    
    if (onTimeframeChange) {
      onTimeframeChange(nextTimeframe);
    }
    
    // Haptic feedback
    if (navigator.vibrate) {
      navigator.vibrate(10);
    }
    
    // ARIA announcement
    const announcement = `Timeframe set to ${nextTimeframe}`;
    if (window.speechSynthesis) {
      const utterance = new SpeechSynthesisUtterance(announcement);
      utterance.volume = 0.1;
      window.speechSynthesis.speak(utterance);
    }
    
    console.log('TimeframeToggle: Changed to', nextTimeframe);
  }, [currentIndex, onTimeframeChange]);

  // Use currentTimeframe prop if provided, otherwise use currentIndex
  const displayTimeframe = currentTimeframe || TIMEFRAMES[currentIndex];

  return (
    <motion.button
      onClick={handleClick}
      className="time-picker-button"
      aria-label={`Change timeframe. Current: ${displayTimeframe}`}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
    >
      <span className="text-sm font-medium">{displayTimeframe}</span>
    </motion.button>
  );
};

export default TimeframeToggle;
