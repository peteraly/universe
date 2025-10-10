import { motion } from 'framer-motion';
import { clampHour, hourLabel } from '../utils/formatters';

const TimeSlider = ({ value, onChange, min = 5, max = 24 }) => {
  const hours = Array.from({ length: max - min + 1 }, (_, i) => i + min);
  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <div className="flex flex-col items-center select-none">
      {/* Time display */}
      <div className="mb-2 text-[11px] text-white/70 font-medium">
        {hourLabel(clampHour(value))}
      </div>

      {/* Slider rail */}
      <div className="relative h-[420px] w-[2px] bg-white/25">
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
        onChange={(e) => onChange(clampHour(parseInt(e.target.value, 10)))}
        className="absolute h-[420px] w-12 opacity-0 cursor-pointer"
        orient="vertical"
        style={{ writingMode: 'bt-lr' }}
        aria-label="Select time"
      />
    </div>
  );
};

export default TimeSlider;
