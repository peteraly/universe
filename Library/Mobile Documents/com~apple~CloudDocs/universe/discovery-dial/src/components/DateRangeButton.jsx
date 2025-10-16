import React, { useState, useCallback, useEffect } from 'react';

const DATE_RANGES = ['All', 'Today', 'Tomorrow', 'This Week', 'Weekend'];

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
export default function DateRangeButton({ selectedRange = 'All', onRangeChange }) {
  
  // 1. State declarations first
  const [currentRange, setCurrentRange] = useState(selectedRange);
  const [isMobile, setIsMobile] = useState(false);
  const [isTouch, setIsTouch] = useState(false);
  
  // 2. Device detection
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
  
  // 3. Sync with parent component
  useEffect(() => {
    setCurrentRange(selectedRange);
  }, [selectedRange]);
  
  // 4. Click handler (defined before use)
  const handleClick = useCallback((e) => {
    // CRITICAL: Only trigger if the click/touch is DIRECTLY on this button
    // Ignore events that bubbled up from other elements (like event card swipes)
    const targetClass = typeof e.target.className === 'string' 
      ? e.target.className 
      : e.target.className?.baseVal || '';
    
    if (!targetClass.includes('date-range-button')) {
      console.log('DateRangeButton: Ignoring click from non-button element:', targetClass);
      return;
    }
    
    e.preventDefault();
    e.stopPropagation();
    
    console.log('DateRangeButton clicked:', { currentRange, isMobile, isTouch });
    
    const currentIndex = DATE_RANGES.indexOf(currentRange);
    const nextIndex = (currentIndex + 1) % DATE_RANGES.length;
    const nextRange = DATE_RANGES[nextIndex];
    
    console.log('Changing from', currentRange, 'to', nextRange);
    
    // Update local state immediately for visual feedback
    setCurrentRange(nextRange);
    
    // Notify parent component
    onRangeChange?.(nextRange);
    
    // Haptic feedback
    if (navigator.vibrate) {
      navigator.vibrate(30);
    }
  }, [currentRange, isMobile, isTouch, onRangeChange]);
  
  // 5. Button styling and event listeners (after handleClick is defined)
  useEffect(() => {
    const button = document.querySelector('.date-range-button');
    if (button) {
      // Ensure button is always visible and clickable
      Object.assign(button.style, {
        position: 'fixed',
        bottom: isMobile ? '80px' : '20px',
        right: '20px',
        zIndex: '9999',
        display: 'block',
        visibility: 'visible',
        opacity: '1',
        pointerEvents: 'auto',
        minWidth: '120px',
        minHeight: '44px',
        backgroundColor: '#000000',
        color: '#ffffff',
        border: '1px solid #ffffff',
        borderRadius: '8px',
        padding: '12px 16px',
        fontSize: '14px',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        userSelect: 'none',
        WebkitUserSelect: 'none',
        MsUserSelect: 'none'
      });
      
      // Add click event listener as backup (but NOT touchstart to avoid double-triggering)
      const handleButtonClick = (e) => {
        // Only trigger if click is directly on button
        const targetClass = typeof e.target.className === 'string' 
          ? e.target.className 
          : e.target.className?.baseVal || '';
        
        if (!targetClass.includes('date-range-button')) {
          return;
        }
        e.preventDefault();
        e.stopPropagation();
        handleClick(e);
      };
      
      button.addEventListener('click', handleButtonClick);
      // NOTE: Removed 'touchstart' listener to prevent double-triggering
      // The component already has onTouchStart handler
      
      console.log('Button visibility and functionality forced');
      
      return () => {
        button.removeEventListener('click', handleButtonClick);
      };
    }
  }, [isMobile, handleClick]);
  
  // 6. Render
  return (
    <button
      className="date-range-button"
      onClick={handleClick}
      onTouchStart={(e) => {
        // Mobile Safari touch fix
        if (isMobile && isTouch) {
          e.preventDefault();
          e.stopPropagation();
          handleClick(e);
        }
      }}
      onTouchEnd={(e) => {
        // Prevent default browser behaviors
        e.preventDefault();
        e.stopPropagation();
      }}
      onTouchCancel={(e) => {
        // Reset styles on touch cancel
        e.preventDefault();
        e.stopPropagation();
      }}
      style={{
        position: 'fixed',
        bottom: isMobile ? '80px' : '20px',
        right: '20px',
        zIndex: 9999,
        minWidth: '120px',
        minHeight: '44px',
        backgroundColor: '#000000',
        color: '#ffffff',
        border: '1px solid #ffffff',
        borderRadius: '8px',
        padding: '12px 16px',
        fontSize: '14px',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        userSelect: 'none',
        WebkitUserSelect: 'none',
        MsUserSelect: 'none',
        display: 'block',
        visibility: 'visible',
        opacity: '1',
        pointerEvents: 'auto'
      }}
      aria-label={`Current timeframe: ${currentRange}. Click to change.`}
      role="button"
      tabIndex={0}
    >
      {currentRange}
    </button>
  );
}