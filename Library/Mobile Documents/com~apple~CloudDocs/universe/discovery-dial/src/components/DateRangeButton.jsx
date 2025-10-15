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
  console.log('🚨 DateRangeButton RENDERED with selectedRange:', selectedRange);
  
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
      
      console.log('🔍 Cross-Platform Device Detection:', {
        userAgent,
        isMobileDevice,
        isTouchDevice,
        screenSize: `${window.screen.width}x${window.screen.height}`,
        viewportSize: `${window.innerWidth}x${window.innerHeight}`,
        devicePixelRatio: window.devicePixelRatio
      });
    };
    
    checkDevice();
    window.addEventListener('resize', checkDevice);
    return () => window.removeEventListener('resize', checkDevice);
  }, []);
  
  // Sync with parent component
  useEffect(() => {
    console.log('🔄 DateRangeButton: Syncing with parent, selectedRange:', selectedRange);
    setCurrentRange(selectedRange);
  }, [selectedRange]);
  
  const handleClick = useCallback((e) => {
    console.log('🔄 TOGGLE CLICKED - Platform:', isMobile ? 'Mobile' : 'Desktop', 'Touch:', isTouch);
    console.log('🔄 Event type:', e.type, 'Event target:', e.target);
    console.log('🔄 Current range:', currentRange);
    
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
  }, [currentRange, onRangeChange, isMobile, isTouch]);

  // Cross-platform responsive button styles
  const buttonStyle = {
    position: 'fixed',
    right: isMobile ? '16px' : '20px',
    bottom: isMobile ? '16px' : '20px',
    // DEBUG: Make button more visible
    border: '3px solid red',
    backgroundColor: '#ff0000',
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

  // Expose testing utilities to global scope for cross-platform testing
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.crossPlatformTesting = {
        testDesktop: () => {
          console.log('🖥️ Desktop Validation');
          const button = document.querySelector('button');
          if (button) {
            button.click();
            console.log('Desktop click test:', button.textContent);
          }
        },
        testMobile: () => {
          console.log('📱 Mobile Validation');
          const button = document.querySelector('button');
          if (button) {
            // Simulate touch
            const touchEvent = new TouchEvent('touchstart');
            button.dispatchEvent(touchEvent);
            console.log('Mobile touch test:', button.textContent);
          }
        },
        testResponsive: () => {
          console.log('📐 Responsive Validation');
          const button = document.querySelector('button');
          if (button) {
            const rect = button.getBoundingClientRect();
            console.log('Button dimensions:', rect.width + 'x' + rect.height);
            console.log('Meets touch target:', rect.width >= 44 && rect.height >= 44);
            console.log('Device info:', { isMobile, isTouch });
          }
        },
        runAllTests: () => {
          console.log('🧪 Running all cross-platform tests...');
          window.crossPlatformTesting.testDesktop();
          window.crossPlatformTesting.testMobile();
          window.crossPlatformTesting.testResponsive();
        }
      };
      console.log('🔧 Cross-platform testing utilities available:');
      console.log('  - window.crossPlatformTesting.testDesktop()');
      console.log('  - window.crossPlatformTesting.testMobile()');
      console.log('  - window.crossPlatformTesting.testResponsive()');
      console.log('  - window.crossPlatformTesting.runAllTests()');
    }
  }, [isMobile, isTouch]);

  // DEBUG: Always render something visible
  console.log('🚨 DateRangeButton ABOUT TO RENDER button');
  
  return (
    <button
      onClick={handleClick}
      onTouchStart={(e) => {
        console.log('📱 TOUCH START detected');
        e.preventDefault(); // Prevent default touch behavior
      }}
      onTouchEnd={(e) => {
        console.log('📱 TOUCH END detected');
        e.preventDefault();
      }}
      onMouseDown={(e) => {
        console.log('🖱️ MOUSE DOWN detected');
        e.target.style.transform = 'scale(0.95)';
      }}
      onMouseUp={(e) => {
        console.log('🖱️ MOUSE UP detected');
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