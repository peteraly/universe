import { motion } from 'framer-motion';
import useReducedMotion, { getTransition } from '../hooks/useReducedMotion';

const TICK_LENGTH_ACTIVE = 12;
const TICK_LENGTH_INACTIVE = 8;

/**
 * Helper: Convert polar coordinates to Cartesian
 * @param {number} cx - Center X (0-100 in SVG viewBox)
 * @param {number} cy - Center Y (0-100 in SVG viewBox)
 * @param {number} r - Radius
 * @param {number} angleDeg - Angle in degrees (0 = North/top)
 */
function polarToCartesian(cx, cy, r, angleDeg) {
  const angleRad = ((angleDeg - 90) * Math.PI) / 180;
  return {
    x: cx + r * Math.cos(angleRad),
    y: cy + r * Math.sin(angleRad)
  };
}

/**
 * DialRing - SVG-based circular ring with subcategory ticks and labels.
 * Positioned using polar coordinates for proper circular layout.
 *
 * @param {number|null} hoverSubIndex - Transient hover index during rotation
 * @param {number} activeSubIndex - Currently active subcategory index
 * @param {Array} subcategories - Array of subcategory objects
 */
export default function DialRing({ hoverSubIndex, activeSubIndex, subcategories = [] }) {
  const prefersReducedMotion = useReducedMotion();

  const count = subcategories?.length || 0;
  const cx = 50; // Center X in viewBox
  const cy = 50; // Center Y in viewBox
  const rOuter = 48; // Outer radius
  
  // Debug logging in production
  if (typeof window !== 'undefined' && import.meta.env.PROD) {
    console.log('✓ DialRing rendering:', {
      subcategories: count,
      activeIndex: activeSubIndex,
      hoverIndex: hoverSubIndex
    });
  }

  return (
    <svg
      className="absolute inset-0 pointer-events-none"
      width="100%"
      height="100%"
      viewBox="0 0 100 100"
      preserveAspectRatio="xMidYMid meet"
    >
      {/* Outer circle boundary - EMERGENCY BRIGHT MODE */}
      <circle
        cx={cx}
        cy={cy}
        r={47.5}
        stroke="white"
        strokeOpacity="0.8"
        strokeWidth="2.0"
        fill="none"
      />

      {/* Subcategory ticks and labels - only if data exists */}
      {count > 0 && (subcategories || []).map((sub, i) => {
        const angleDeg = (i * 360) / count;
        const isActive = i === activeSubIndex;
        const isHovered = hoverSubIndex !== null && i === (activeSubIndex + hoverSubIndex) % count;
        const highlighted = isActive || isHovered;

        const tickLength = highlighted ? TICK_LENGTH_ACTIVE : TICK_LENGTH_INACTIVE;
        const rInner = rOuter - tickLength;

        const p1 = polarToCartesian(cx, cy, rOuter, angleDeg);
        const p2 = polarToCartesian(cx, cy, rInner, angleDeg);

        // Label position (further inside)
        const labelR = rInner - 6;
        const labelPos = polarToCartesian(cx, cy, labelR, angleDeg);

        return (
          <motion.g
            key={sub.id}
            initial={false}
            animate={{
              opacity: highlighted ? 1 : 0.6
            }}
            transition={getTransition(prefersReducedMotion, {
              duration: 0.15,
              ease: 'easeOut'
            })}
          >
            {/* Tick mark */}
            <line
              x1={p1.x}
              y1={p1.y}
              x2={p2.x}
              y2={p2.y}
              stroke="white"
              strokeWidth={highlighted ? 1.0 : 0.7}
            />

            {/* Label */}
            <text
              x={labelPos.x}
              y={labelPos.y}
              fontSize="3"
              textAnchor="middle"
              dominantBaseline="central"
              fill="white"
              fillOpacity={highlighted ? 0.95 : 0.65}
              fontWeight={highlighted ? 600 : 400}
              style={{
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}
            >
              {sub.label}
            </text>
          </motion.g>
        );
      })}
    </svg>
  );
}
