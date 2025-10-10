import { motion } from 'framer-motion';
import { memo } from 'react';
import { clampHour, hourLabel } from '../utils/formatters';
import useHapticFeedback from '../hooks/useHapticFeedback';

const TimeSlider = ({ value, onChange, min = 5, max = 24 }) => {
  const hours = Array.from({ length: max - min + 1 }, (_, i) => i + min);
  const percentage = ((value - min) / (max - min)) * 100;
  const { triggerHaptic } = useHapticFeedback();

  const handleHapticFeedback = () => {
    triggerHaptic('light');
  };

  const handleThumbPress = () => {
    triggerHaptic('light');
  };

  return (
    <div className="flex flex-col items-center select-none">
      {/* Live time display */}
      <motion.div 
        className="mb-2 text-[12px] text-black/70 font-medium"
        key={value}
        initial={{ scale: 1.1 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.2 }}
      >
        {hourLabel(clampHour(value))}
      </motion.div>

      {/* Slider rail */}
      <div className="relative h-[50vh] w-[2px] bg-black/20">
        {/* Thumb */}
        <motion.div
          className="absolute -left-3 w-6 h-8 rounded-full bg-red-600 shadow-lg cursor-pointer"
          style={{
            top: `${percentage}%`,
            transform: 'translateY(-50%)'
          }}
          whileHover={{ 
            scale: 1.1,
            boxShadow: '0 0 12px rgba(230,57,70,0.3)'
          }}
          whileTap={{ 
            scale: 1.3,
            boxShadow: '0 0 16px rgba(230,57,70,0.5)'
          }}
          onTapStart={handleThumbPress}
          transition={{ type: 'spring', stiffness: 400, damping: 17 }}
        />

        {/* Hour ticks and labels */}
        <div className="absolute -right-4 top-0 h-full flex flex-col justify-between">
          {hours.map((hour, i) => (
            <div
              key={`hour-${hour}`} // FIXED: Stable unique key
              className="flex items-center"
              style={{ height: `${100 / (hours.length - 1)}%` }}
            >
              <div className="w-1 h-1 bg-black/50 rounded-full" />
              {i % 2 === 0 && (
                <span className="ml-2 text-[10px] text-black/50">
                  {hourLabel(hour).replace(':00 ', '')}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Invisible input for accessibility */}
      <input
        type="range"
        min={min}
        max={max}
        step="1"
        value={value}
        onChange={(e) => {
          const newValue = clampHour(parseInt(e.target.value, 10));
          onChange(newValue);
          handleHapticFeedback();
        }}
        className="absolute h-[50vh] w-12 opacity-0 cursor-pointer"
        orient="vertical"
        style={{ writingMode: 'bt-lr' }}
        aria-label="Select start time"
        role="slider"
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={value}
      />
    </div>
  );
};

export default memo(TimeSlider);
