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
      const isMobileSafari = /iPhone|iPad/.test(userAgent) && /Safari/.test(userAgent) && !/Chrome/.test(userAgent);
      
      setIsMobile(isMobileDevice);
      setIsTouch(isTouchDevice);
      
      // Log for debugging
      console.log('Device detection:', { isMobileDevice, isTouchDevice, isMobileSafari, userAgent });
    };
    
    checkDevice();
    window.addEventListener('resize', checkDevice);
    return () => window.removeEventListener('resize', checkDevice);
  }, []);
  
  // Sync with parent component
  useEffect(() => {
    setCurrentRange(selectedRange);
  }, [selectedRange]);
  
  // Force button visibility and functionality on all devices
  useEffect(() => {
    const button = document.querySelector('.date-range-button');
    if (button) {
      // Ensure button is always visible and clickable
      button.style.position = 'fixed';
      button.style.bottom = isMobile ? '80px' : '20px';
      button.style.right = '20px';
      button.style.zIndex = '9999';
      button.style.display = 'block';
      button.style.visibility = 'visible';
      button.style.opacity = '1';
      button.style.pointerEvents = 'auto';
      button.style.minWidth = '120px';
      button.style.minHeight = '44px';
      button.style.backgroundColor = '#000000';
      button.style.color = '#ffffff';
      button.style.border = '1px solid #ffffff';
      button.style.borderRadius = '8px';
      button.style.padding = '12px 16px';
      button.style.fontSize = '14px';
      button.style.fontWeight = '600';
      button.style.cursor = 'pointer';
      button.style.transition = 'all 0.2s ease';
      button.style.userSelect = 'none';
      button.style.webkitUserSelect = 'none';
      
      // Add click event listener as backup
      const handleButtonClick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        handleClick(e);
      };
      
      button.addEventListener('click', handleButtonClick);
      button.addEventListener('touchstart', handleButtonClick);
      
      console.log('Button visibility and functionality forced');
      
      return () => {
        button.removeEventListener('click', handleButtonClick);
        button.removeEventListener('touchstart', handleButtonClick);
      };
    }
  }, [isMobile, handleClick]);
  
  const handleClick = useCallback((e) => {
    console.log('DateRangeButton clicked:', { currentRange, isMobile, isTouch });
    
    const currentIndex = DATE_RANGES.indexOf(currentRange);
    const nextIndex = (currentIndex + 1) % DATE_RANGES.length;
    const nextRange = DATE_RANGES[nextIndex];
    
    console.log('Changing from', currentRange, 'to', nextRange);
    
    // Update local state immediately for visual feedback
    setCurrentRange(nextRange);
    
    // Notify parent component
    if (onRangeChange) {
      onRangeChange(nextRange);
    }
  }, [currentRange, onRangeChange, isMobile, isTouch]);

  // Cross-platform responsive button styles
  const buttonStyle = {
    position: 'fixed',
    right: isMobile ? '16px' : '20px',
    bottom: isMobile ? '60px' : '20px', // Match CSS positioning
    border: '2px solid #007bff',
    backgroundColor: '#007bff',
    padding: isMobile ? '16px 24px' : '12px 20px', // Larger touch targets on mobile
    color: 'white',
    borderRadius: '8px',
    fontSize: isMobile ? '16px' : '14px', // Larger text on mobile
    fontWeight: 'bold',
    cursor: 'pointer',
    zIndex: 9999, // Higher z-index to ensure visibility
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
        // Don't prevent default on touch start - let the click event fire
        e.target.style.transform = 'scale(0.95)';
        e.target.style.backgroundColor = '#0056b3';
      }}
      onTouchEnd={(e) => {
        e.target.style.transform = 'scale(1)';
        e.target.style.backgroundColor = '#007bff';
        // Trigger click manually for mobile Safari
        if (isMobile || isTouch) {
          e.preventDefault();
          e.stopPropagation();
          console.log('Touch end - triggering click manually');
          handleClick(e);
        }
      }}
      onTouchCancel={(e) => {
        e.target.style.transform = 'scale(1)';
        e.target.style.backgroundColor = '#007bff';
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