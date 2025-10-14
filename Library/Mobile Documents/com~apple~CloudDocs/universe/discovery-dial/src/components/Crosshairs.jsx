/**
 * Crosshairs - Subtle vertical/horizontal hairlines across compass dial.
 * Minimal design: 1px white lines at low opacity.
 */

export default function Crosshairs() {
  return (
    <div 
      className="absolute inset-0 pointer-events-none"
      aria-hidden="true"
    >
      {/* Vertical line */}
      <div 
        className="absolute left-1/2 top-0 bottom-0 w-px bg-white"
        style={{ opacity: 0.15 }}
      />
      
      {/* Horizontal line */}
      <div 
        className="absolute top-1/2 left-0 right-0 h-px bg-white"
        style={{ opacity: 0.15 }}
      />
    </div>
  );
}


