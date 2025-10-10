import { motion } from 'framer-motion';

const DialInnerRing = ({ items, activeIndex, onChange }) => {
  const count = items.length;
  
  return (
    <div className="absolute inset-10 rounded-full border border-white/16">
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
          >
            {item}
          </motion.button>
        );
      })}
    </div>
  );
};

export default DialInnerRing;
