import React, { useState, useCallback, useEffect } from 'react';

const DATE_RANGES = ['TODAY', 'TOMORROW', 'THIS WEEK', 'THIS MONTH'];

/**
 * DateRangeButton - Minimal working timeframe toggle
 * 
 * CORE GOAL: Make the Today/Day toggle work properly
 * - Button responds to clicks
 * - Text changes to show new timeframe
 * - State updates in parent component
 * - Works on all devices and browsers
 */
export default function DateRangeButton({ selectedRange = 'TODAY', onRangeChange }) {
  const [currentRange, setCurrentRange] = useState(selectedRange);
  
  // Sync with parent component
  useEffect(() => {
    console.log('🔄 DateRangeButton: Syncing with parent, selectedRange:', selectedRange);
    setCurrentRange(selectedRange);
  }, [selectedRange]);
  
  const handleClick = useCallback(() => {
    console.log('🔄 TOGGLE CLICKED - Current:', currentRange);
    
    const currentIndex = DATE_RANGES.indexOf(currentRange);
    const nextIndex = (currentIndex + 1) % DATE_RANGES.length;
    const nextRange = DATE_RANGES[nextIndex];
    
    console.log('🔄 TOGGLE CHANGING - From:', currentRange, 'To:', nextRange);
    
    // Update local state immediately for visual feedback
    setCurrentRange(nextRange);
    
    // Notify parent component
    if (onRangeChange) {
      onRangeChange(nextRange);
      console.log('🔄 TOGGLE NOTIFIED PARENT - New range:', nextRange);
    } else {
      console.error('❌ TOGGLE ERROR - No onRangeChange callback provided');
    }
  }, [currentRange, onRangeChange]);

  return (
    <button
      onClick={handleClick}
      style={{
        position: 'fixed',
        right: '20px',
        bottom: '20px',
        padding: '12px 20px',
        backgroundColor: '#007bff',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        fontSize: '14px',
        fontWeight: 'bold',
        cursor: 'pointer',
        zIndex: 1000,
        minWidth: '100px',
        textAlign: 'center',
        boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
        transition: 'all 0.2s ease',
        userSelect: 'none',
        WebkitUserSelect: 'none',
        touchAction: 'manipulation'
      }}
      onMouseOver={(e) => e.target.style.backgroundColor = '#0056b3'}
      onMouseOut={(e) => e.target.style.backgroundColor = '#007bff'}
      onMouseDown={(e) => e.target.style.transform = 'scale(0.95)'}
      onMouseUp={(e) => e.target.style.transform = 'scale(1)'}
      aria-label={`Current timeframe: ${currentRange}. Click to change.`}
      role="button"
      tabIndex={0}
    >
      {currentRange}
    </button>
  );
}