import React, { useState, useCallback, useEffect } from 'react';

const DATE_RANGES = ['TODAY', 'TOMORROW', 'THIS WEEK', 'THIS MONTH'];

/**
 * DateRangeButton - Cross-platform optimized timeframe toggle
 * 
 * CORE GOAL: Make the Today/Day toggle work properly on ALL platforms
 * - Button responds to clicks and touch
 * - Text changes to show new timeframe
 * - State updates in parent component
 * - Works on desktop, mobile, and all browsers
 * - Meets accessibility standards (WCAG)
 */
export default function DateRangeButton({ selectedRange = 'TODAY', onRangeChange }) {
  
  const [currentRange, setCurrentRange] = useState(selectedRange);
  const [isMobile, setIsMobile] = useState(false);
  const [isTouch, setIsTouch] = useState(false);
  
  // Cross-platform device detection
  useEffect(() => {
    const checkDevice = () => {
      const userAgent = navigator.userAgent;
      const isMobileDevice = /Mobile|Android|iPhone|iPad/.test(userAgent);
      const isTouchDevice = 'ontouchstart' in window;
      
      setIsMobile(isMobileDevice);
      setIsTouch(isTouchDevice);
      
    };
    
    checkDevice();
    window.addEventListener('resize', checkDevice);
    return () => window.removeEventListener('resize', checkDevice);
  }, []);
  
  // Sync with parent component
  useEffect(() => {
    setCurrentRange(selectedRange);
  }, [selectedRange]);
  
  const handleClick = useCallback((e) => {
    const currentIndex = DATE_RANGES.indexOf(currentRange);
    const nextIndex = (currentIndex + 1) % DATE_RANGES.length;
    const nextRange = DATE_RANGES[nextIndex];
    
    // Update local state immediately for visual feedback
    setCurrentRange(nextRange);
    
    // Notify parent component
    if (onRangeChange) {
      onRangeChange(nextRange);
    }
  }, [currentRange, onRangeChange]);

  // Cross-platform responsive button styles
  const buttonStyle = {
    position: 'fixed',
    right: isMobile ? '16px' : '20px',
    bottom: isMobile ? '16px' : '20px',
    border: '2px solid #007bff',
    backgroundColor: '#007bff',
    padding: isMobile ? '16px 24px' : '12px 20px', // Larger touch targets on mobile
    color: 'white',
    borderRadius: '8px',
    fontSize: isMobile ? '16px' : '14px', // Larger text on mobile
    fontWeight: 'bold',
    cursor: 'pointer',
    zIndex: 1000,
    minWidth: isMobile ? '120px' : '100px', // Larger minimum width on mobile
    minHeight: '44px', // WCAG minimum touch target
    textAlign: 'center',
    boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
    transition: 'all 0.2s ease',
    userSelect: 'none',
    WebkitUserSelect: 'none',
    touchAction: 'manipulation', // Optimize for touch
    WebkitTapHighlightColor: 'transparent', // Remove iOS tap highlight
    // Cross-platform compatibility
    WebkitAppearance: 'none',
    MozAppearance: 'none',
    appearance: 'none',
    // Ensure button is always clickable
    pointerEvents: 'auto',
    // Hardware acceleration for smooth performance
    transform: 'translateZ(0)',
    backfaceVisibility: 'hidden'
  };


  
  return (
    <button
      onClick={handleClick}
      onTouchStart={(e) => {
        e.preventDefault(); // Prevent default touch behavior
      }}
      onTouchEnd={(e) => {
        e.preventDefault();
      }}
      onMouseDown={(e) => {
        e.target.style.transform = 'scale(0.95)';
      }}
      onMouseUp={(e) => {
        e.target.style.transform = 'scale(1)';
      }}
      style={buttonStyle}
      onMouseOver={(e) => e.target.style.backgroundColor = '#0056b3'}
      onMouseOut={(e) => e.target.style.backgroundColor = '#007bff'}
      aria-label={`Current timeframe: ${currentRange}. Click to change.`}
      role="button"
      tabIndex={0}
      // Cross-platform accessibility
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick(e);
        }
      }}
    >
      {currentRange}
    </button>
  );
}