import { motion } from 'framer-motion';
import { clampHour, hourLabel } from '../utils/formatters';

const TimeSlider = ({ value, onChange, min = 5, max = 24 }) => {
  const hours = Array.from({ length: max - min + 1 }, (_, i) => i + min);
  const percentage = ((value - min) / (max - min)) * 100;

  const handleHapticFeedback = () => {
    if (navigator.vibrate) {
      navigator.vibrate(10); // Light haptic feedback
    }
  };

  return (
    <div className="flex flex-col items-center select-none">
      {/* Live time display */}
      <motion.div 
        className="mb-2 text-[12px] text-white/70 font-medium"
        key={value}
        initial={{ scale: 1.1 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.2 }}
      >
        {hourLabel(clampHour(value))}
      </motion.div>

      {/* Slider rail */}
      <div className="relative h-[60vh] w-[2px] bg-white/25">
        {/* Thumb */}
        <motion.div
          className="absolute -left-3 w-6 h-8 rounded-full bg-white/85 shadow-lg cursor-pointer"
          style={{
            top: `${percentage}%`,
            transform: 'translateY(-50%)'
          }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          transition={{ type: 'spring', stiffness: 400, damping: 17 }}
        />

        {/* Hour ticks and labels */}
        <div className="absolute -right-4 top-0 h-full flex flex-col justify-between">
          {hours.map((hour, i) => (
            <div
              key={hour}
              className="flex items-center"
              style={{ height: `${100 / (hours.length - 1)}%` }}
            >
              <div className="w-1 h-1 bg-white/50 rounded-full" />
              {i % 2 === 0 && (
                <span className="ml-2 text-[10px] text-white/50">
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
        className="absolute h-[60vh] w-12 opacity-0 cursor-pointer"
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

export default TimeSlider;
