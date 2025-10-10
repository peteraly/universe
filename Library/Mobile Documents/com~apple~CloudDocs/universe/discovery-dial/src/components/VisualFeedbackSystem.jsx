import { motion, AnimatePresence } from 'framer-motion';
import { memo, useEffect, useState } from 'react';

const VisualFeedbackSystem = ({ 
  gestureType, 
  isActive, 
  direction, 
  categoryLabel, 
  subcategoryLabel,
  eventTitle 
}) => {
  // Animation variants for different feedback types
  const feedbackVariants = {
    // Primary category change feedback
    primaryCategory: {
      initial: { opacity: 0, y: direction === 'up' ? 20 : -20, scale: 0.9 },
      animate: { opacity: 1, y: 0, scale: 1 },
      exit: { opacity: 0, y: direction === 'up' ? -20 : 20, scale: 0.9 }
    },
    
    // Subcategory change feedback
    subcategory: {
      initial: { opacity: 0, scale: 0.8, rotate: direction === 'clockwise' ? -10 : 10 },
      animate: { opacity: 1, scale: 1, rotate: 0 },
      exit: { opacity: 0, scale: 0.8, rotate: direction === 'clockwise' ? 10 : -10 }
    },
    
    // Event navigation feedback
    eventNavigation: {
      initial: { 
        opacity: 0, 
        x: direction === 'left' ? 50 : -50, 
        scale: 0.95 
      },
      animate: { opacity: 1, x: 0, scale: 1 },
      exit: { 
        opacity: 0, 
        x: direction === 'left' ? -50 : 50, 
        scale: 0.95 
      }
    }
  };

  // Get appropriate variant based on gesture type
  const getVariant = () => {
    switch (gestureType) {
      case 'DIAL_VERTICAL_SWIPE':
        return feedbackVariants.primaryCategory;
      case 'DIAL_CIRCULAR_DRAG':
        return feedbackVariants.subcategory;
      case 'EVENT_HORIZONTAL_SWIPE':
        return feedbackVariants.eventNavigation;
      default:
        return feedbackVariants.primaryCategory;
    }
  };

  // Get feedback content based on gesture type
  const getFeedbackContent = () => {
    switch (gestureType) {
      case 'DIAL_VERTICAL_SWIPE':
        return {
          title: categoryLabel || 'Category Changed',
          subtitle: direction === 'up' ? 'Next Category' : 'Previous Category',
          icon: direction === 'up' ? '↑' : '↓'
        };
      case 'DIAL_CIRCULAR_DRAG':
        return {
          title: subcategoryLabel || 'Subcategory Changed',
          subtitle: direction === 'clockwise' ? 'Next Subcategory' : 'Previous Subcategory',
          icon: direction === 'clockwise' ? '↻' : '↺'
        };
      case 'EVENT_HORIZONTAL_SWIPE':
        return {
          title: eventTitle || 'Event Changed',
          subtitle: direction === 'left' ? 'Next Event' : 'Previous Event',
          icon: direction === 'left' ? '←' : '→'
        };
      default:
        return {
          title: 'Gesture Detected',
          subtitle: 'Processing...',
          icon: '⚡'
        };
    }
  };

  const variant = getVariant();
  const content = getFeedbackContent();

  return (
    <AnimatePresence>
      {isActive && (
        <motion.div
          className="fixed top-20 left-1/2 -translate-x-1/2 z-50"
          variants={variant}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{
            duration: 0.3,
            ease: "easeOut",
            type: "spring",
            stiffness: 300,
            damping: 20
          }}
        >
          {/* Main feedback card */}
          <div className="bg-white/95 backdrop-blur-sm border border-black/20 rounded-xl px-4 py-3 shadow-lg">
            <div className="flex items-center space-x-3">
              {/* Icon */}
              <motion.div
                className="w-8 h-8 bg-red-600 text-white rounded-full flex items-center justify-center text-sm font-bold"
                animate={{ 
                  scale: [1, 1.2, 1],
                  rotate: gestureType === 'DIAL_CIRCULAR_DRAG' ? [0, 360] : 0
                }}
                transition={{ 
                  duration: 0.6,
                  ease: "easeInOut"
                }}
              >
                {content.icon}
              </motion.div>
              
              {/* Text content */}
              <div className="flex-1 min-w-0">
                <motion.div
                  className="text-sm font-semibold text-black truncate"
                  key={content.title}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.1 }}
                >
                  {content.title}
                </motion.div>
                <motion.div
                  className="text-xs text-black/60"
                  key={content.subtitle}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  {content.subtitle}
                </motion.div>
              </div>
            </div>
          </div>

          {/* Progress indicator */}
          <motion.div
            className="absolute bottom-0 left-0 h-1 bg-red-600 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: '100%' }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Haptic feedback component
export const HapticFeedback = memo(({ gestureType, isActive }) => {
  // Trigger haptic feedback based on gesture type
  useEffect(() => {
    if (isActive && navigator.vibrate) {
      let pattern;
      switch (gestureType) {
        case 'DIAL_VERTICAL_SWIPE':
          pattern = 20; // Medium pulse for primary category
          break;
        case 'DIAL_CIRCULAR_DRAG':
          pattern = 10; // Light pulse for subcategory
          break;
        case 'EVENT_HORIZONTAL_SWIPE':
          pattern = 10; // Light pulse for event navigation
          break;
        default:
          pattern = 10;
      }
      navigator.vibrate(pattern);
    }
  }, [gestureType, isActive]);

  return null;
});

// Audio feedback component (optional)
export const AudioFeedback = memo(({ gestureType, isActive }) => {
  useEffect(() => {
    if (isActive) {
      // Create audio context for subtle sound feedback
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      // Different frequencies for different gestures
      let frequency;
      switch (gestureType) {
        case 'DIAL_VERTICAL_SWIPE':
          frequency = 800; // Higher pitch for primary category
          break;
        case 'DIAL_CIRCULAR_DRAG':
          frequency = 600; // Medium pitch for subcategory
          break;
        case 'EVENT_HORIZONTAL_SWIPE':
          frequency = 400; // Lower pitch for event navigation
          break;
        default:
          frequency = 500;
      }
      
      oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.1);
    }
  }, [gestureType, isActive]);

  return null;
});

// Screen reader announcements
export const ScreenReaderAnnouncements = memo(({ 
  gestureType, 
  isActive, 
  categoryLabel, 
  subcategoryLabel, 
  eventTitle 
}) => {
  const [announcement, setAnnouncement] = useState('');

  useEffect(() => {
    if (isActive) {
      let message;
      switch (gestureType) {
        case 'DIAL_VERTICAL_SWIPE':
          message = `Category changed to ${categoryLabel}`;
          break;
        case 'DIAL_CIRCULAR_DRAG':
          message = `Subcategory changed to ${subcategoryLabel}`;
          break;
        case 'EVENT_HORIZONTAL_SWIPE':
          message = `Now viewing ${eventTitle}`;
          break;
        default:
          message = 'Gesture detected';
      }
      setAnnouncement(message);
    }
  }, [gestureType, isActive, categoryLabel, subcategoryLabel, eventTitle]);

  return (
    <div
      aria-live="polite"
      aria-atomic="true"
      className="sr-only"
    >
      {announcement}
    </div>
  );
});

export default memo(VisualFeedbackSystem);
