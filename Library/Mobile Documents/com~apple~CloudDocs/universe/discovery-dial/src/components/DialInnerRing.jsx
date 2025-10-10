import { motion } from 'framer-motion';

const DialInnerRing = ({ items, activeIndex, onChange, isVisible = true }) => {
  const count = items.length;
  
  if (!isVisible) return null;
  
  return (
    <motion.div 
      className="absolute inset-10 rounded-full border border-white/16"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, type: 'spring', stiffness: 300 }}
    >
      {items.map((item, i) => {
        const angle = (i / count) * 360;
        const isActive = i === activeIndex;
        
        return (
          <motion.button
            key={item}
            onClick={() => onChange(i)}
            className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2
                        text-xs font-medium transition-colors duration-200
                        ${isActive ? 'text-white' : 'text-white/70 hover:text-white/90'}`}
            style={{
              transform: `rotate(${angle}deg) translate(0, -135px) rotate(${-angle}deg)`
            }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 400, damping: 17 }}
            role="option"
            aria-selected={isActive}
          >
            {item}
          </motion.button>
        );
      })}
    </motion.div>
  );
};

export default DialInnerRing;
