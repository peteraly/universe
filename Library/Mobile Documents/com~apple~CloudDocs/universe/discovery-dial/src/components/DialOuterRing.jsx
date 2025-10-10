import { motion } from 'framer-motion';

const DialOuterRing = ({ rotate, labels, onDragEnd }) => {
  return (
    <div className="absolute inset-0">
      {/* Red pointer at top */}
      <div className="absolute left-1/2 top-[-10px] -translate-x-1/2 z-10">
        <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[10px] border-b-[#E63946]" />
      </div>

      <motion.div
        className="absolute inset-0 rounded-full border border-white/25"
        style={{ rotate }}
        drag
        dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
        dragElastic={0.05}
        onDragEnd={onDragEnd}
        transition={{ type: 'spring', stiffness: 180, damping: 18 }}
        whileDrag={{ scale: 1.02 }}
      >
        {/* Tick marks around the perimeter - minor every 2°, major every 30° */}
        {[...Array(180)].map((_, i) => (
          <div
            key={i}
            className="absolute left-1/2 top-1/2 origin-[0_100%]"
            style={{
              transform: `rotate(${i * 2}deg) translate(-1px, -168px)`,
              width: i % 15 === 0 ? 2 : 1,
              height: i % 15 === 0 ? 12 : 6,
              backgroundColor: `rgba(255,255,255,${i % 15 === 0 ? 0.8 : 0.4})`
            }}
          />
        ))}

        {/* Primary labels at N/E/S/W */}
        {['N', 'E', 'S', 'W'].map((pos, idx) => (
          <div
            key={pos}
            className={`absolute text-center text-[11px] font-medium ${labels[idx]?.className ?? ''}`}
            style={{
              left: '50%',
              top: '50%',
              transform: {
                'N': 'translate(-50%, -165px)',
                'E': 'translate(150px, -50%) rotate(90deg)',
                'S': 'translate(-50%, 150px) rotate(180deg)',
                'W': 'translate(-165px, -50%) rotate(-90deg)'
              }[pos]
            }}
          >
            <span className="block max-w-[120px] leading-tight">
              {labels[idx]?.text}
            </span>
          </div>
        ))}
      </motion.div>
    </div>
  );
};

export default DialOuterRing;
