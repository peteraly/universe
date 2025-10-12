/**
 * CategoryLabels - Four primary category labels pinned to N/E/S/W positions.
 * Minimal design: white text, active/inactive opacity only.
 * 
 * @param {Array} categories - Array of category objects with direction and label
 * @param {string} activeDirection - Currently active direction ('north'|'east'|'south'|'west')
 */
export default function CategoryLabels({ categories, activeDirection }) {
  const get = (dir) => categories.find((c) => c.direction === dir)?.label?.toUpperCase() ?? '';
  const cls = (dir) =>
    `absolute text-[11px] md:text-sm font-medium tracking-wide ${
      dir === activeDirection ? 'text-white' : 'text-white/60'
    }`;

  return (
    <>
      {/* North */}
      <div className={`${cls('north')} left-1/2 -translate-x-1/2`} style={{ top: 8 }}>
        {get('north')}
      </div>
      {/* East */}
      <div className={`${cls('east')} top-1/2 -translate-y-1/2`} style={{ right: 8, position: 'absolute' }}>
        {get('east')}
      </div>
      {/* South */}
      <div className={`${cls('south')} left-1/2 -translate-x-1/2`} style={{ bottom: 8, position: 'absolute' }}>
        {get('south')}
      </div>
      {/* West */}
      <div className={`${cls('west')} top-1/2 -translate-y-1/2`} style={{ left: 8, position: 'absolute' }}>
        {get('west')}
      </div>
    </>
  );
}
