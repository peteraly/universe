import React, { useEffect } from 'react';
import EventCompassFinal from './components/EventCompassFinal';
import categoriesData from './data/categories.json';
import useScrollPrevention from './hooks/useScrollPrevention';
import useTextSelectionPrevention from './hooks/useTextSelectionPrevention';
import useSafariScrollPrevention from './hooks/useSafariScrollPrevention';
import { useWordPressComEvents } from './hooks/useWordPressComEvents';
import './utils/testWordPress'; // Import test utilities
import './utils/testWordPressCom'; // Import WordPress.com test utilities

/**
 * Main application component.
 * FINAL PRODUCTION VERSION - Clean compass dial with WordPress.com integration and complete scroll prevention
 */
function App() {
  // Initialize complete scroll prevention
  useScrollPrevention();

  // Initialize complete text selection prevention
  useTextSelectionPrevention();

  // Initialize Safari-specific scroll prevention
  const { isSafari, isIOS } = useSafariScrollPrevention();

  // Enhanced text selection and scroll prevention
  useEffect(() => {
    const preventSelectionAndScrolling = (e) => {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      return false;
    };

    const preventScrolling = (e) => {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      return false;
    };

    // Global event listeners for text selection
    document.addEventListener('selectstart', preventSelectionAndScrolling, { passive: false });
    document.addEventListener('dragstart', preventSelectionAndScrolling, { passive: false });
    document.addEventListener('contextmenu', preventSelectionAndScrolling, { passive: false });
    
    // Additional text selection prevention events
    document.addEventListener('mousedown', preventSelectionAndScrolling, { passive: false });
    document.addEventListener('mouseup', preventSelectionAndScrolling, { passive: false });
    document.addEventListener('mousemove', preventSelectionAndScrolling, { passive: false });

    // Global event listeners for scrolling
    document.addEventListener('wheel', preventScrolling, { passive: false });
    document.addEventListener('touchmove', preventScrolling, { passive: false });
    document.addEventListener('touchstart', preventScrolling, { passive: false });
    document.addEventListener('touchend', preventScrolling, { passive: false });
    document.addEventListener('scroll', preventScrolling, { passive: false });
    
    // Additional scroll prevention events
    document.addEventListener('DOMMouseScroll', preventScrolling, { passive: false }); // Firefox
    document.addEventListener('mousewheel', preventScrolling, { passive: false }); // Older browsers
    document.addEventListener('MozMousePixelScroll', preventScrolling, { passive: false }); // Firefox

    // Prevent keyboard scrolling
    const handleKeyDown = (e) => {
      if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'PageUp', 'PageDown', 'Home', 'End'].includes(e.code)) {
        preventScrolling(e);
      }
    };
    document.addEventListener('keydown', handleKeyDown);

    // Apply styles to prevent scrolling
    const targets = [document, window, document.documentElement, document.body, document.getElementById('root')];
    targets.forEach(target => {
      if (target) {
        target.style.overflow = 'hidden';
        target.style.overscrollBehavior = 'none';
        target.style.touchAction = 'none';
        target.style.position = 'fixed';
        target.style.top = '0';
        target.style.left = '0';
        target.style.right = '0';
        target.style.bottom = '0';
        target.style.scrollbarWidth = 'none';
        target.style.msOverflowStyle = 'none';
      }
    });

    // Hide scrollbars for all elements
    const hideScrollbars = () => {
      const style = document.createElement('style');
      style.textContent = `
        *::-webkit-scrollbar {
          display: none !important;
        }
        * {
          scrollbar-width: none !important;
          -ms-overflow-style: none !important;
        }
      `;
      document.head.appendChild(style);
    };
    hideScrollbars();

    // Prevent programmatic scrolling
    const originalScrollTo = window.scrollTo;
    const originalScrollBy = window.scrollBy;
    const originalScroll = window.scroll;
    
    window.scrollTo = () => {};
    window.scrollBy = () => {};
    window.scroll = () => {};
    
    // Prevent element scrolling
    const preventElementScroll = (element) => {
      if (element && typeof element.scrollTo === 'function') {
        element.scrollTo = () => {};
      }
      if (element && typeof element.scrollBy === 'function') {
        element.scrollBy = () => {};
      }
      if (element && typeof element.scroll === 'function') {
        element.scroll = () => {};
      }
    };
    
    // Apply to all existing elements
    document.querySelectorAll('*').forEach(preventElementScroll);

    // Safari-specific scroll prevention
    let preventSafariScroll = null;
    if (isSafari || isIOS) {
      // Safari-specific scroll prevention
      preventSafariScroll = (e) => {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        return false;
      };

      // Safari-specific event listeners
      document.addEventListener('gesturestart', preventSafariScroll, { passive: false });
      document.addEventListener('gesturechange', preventSafariScroll, { passive: false });
      document.addEventListener('gestureend', preventSafariScroll, { passive: false });

      // Prevent Safari's scroll restoration
      if ('scrollRestoration' in history) {
        history.scrollRestoration = 'manual';
      }

      // Force scroll position to top for Safari
      const safariScrollInterval = setInterval(() => {
        window.scrollTo(0, 0);
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
      }, 100);

      // Safari-specific CSS injection
      const safariStyle = document.createElement('style');
      safariStyle.textContent = `
        /* Safari-specific scroll prevention */
        html, body, #root, .App {
          overflow: hidden !important;
          overscroll-behavior: none !important;
          -webkit-overflow-scrolling: auto !important;
          touch-action: none !important;
          position: fixed !important;
          top: 0 !important;
          left: 0 !important;
          right: 0 !important;
          bottom: 0 !important;
          width: 100vw !important;
          height: 100vh !important;
          -webkit-transform: translateZ(0) !important;
          -webkit-backface-visibility: hidden !important;
          -webkit-perspective: 1000 !important;
        }
        
        /* Disable Safari's rubber band scrolling */
        body {
          overscroll-behavior-y: none !important;
          -webkit-overflow-scrolling: auto !important;
        }
      `;
      document.head.appendChild(safariStyle);

      // Store references for cleanup
      window.safariScrollInterval = safariScrollInterval;
      window.safariStyle = safariStyle;
    }

    // Cleanup
    return () => {
      document.removeEventListener('selectstart', preventSelectionAndScrolling);
      document.removeEventListener('dragstart', preventSelectionAndScrolling);
      document.removeEventListener('contextmenu', preventSelectionAndScrolling);
      document.removeEventListener('mousedown', preventSelectionAndScrolling);
      document.removeEventListener('mouseup', preventSelectionAndScrolling);
      document.removeEventListener('mousemove', preventSelectionAndScrolling);
      document.removeEventListener('wheel', preventScrolling);
      document.removeEventListener('touchmove', preventScrolling);
      document.removeEventListener('touchstart', preventScrolling);
      document.removeEventListener('touchend', preventScrolling);
      document.removeEventListener('scroll', preventScrolling);
      document.removeEventListener('DOMMouseScroll', preventScrolling);
      document.removeEventListener('mousewheel', preventScrolling);
      document.removeEventListener('MozMousePixelScroll', preventScrolling);
      document.removeEventListener('keydown', handleKeyDown);
      
      // Restore original scroll methods
      window.scrollTo = originalScrollTo;
      window.scrollBy = originalScrollBy;
      window.scroll = originalScroll;
      
      // Safari-specific cleanup
      if (isSafari || isIOS) {
        // Clear Safari scroll interval
        if (window.safariScrollInterval) {
          clearInterval(window.safariScrollInterval);
        }
        
        // Remove Safari-specific styles
        if (window.safariStyle && window.safariStyle.parentNode) {
          window.safariStyle.parentNode.removeChild(window.safariStyle);
        }
        
        // Remove Safari-specific event listeners
        if (preventSafariScroll) {
          document.removeEventListener('gesturestart', preventSafariScroll);
          document.removeEventListener('gesturechange', preventSafariScroll);
          document.removeEventListener('gestureend', preventSafariScroll);
        }
      }
    };
  }, []);

  // Initialize WordPress.com events (with fallback to local data)
  const { events: wordPressComEvents, loading, error, categories, stats } = useWordPressComEvents();

  return (
    <EventCompassFinal 
      categories={categoriesData.categories} 
      wordPressEvents={wordPressComEvents}
      wordPressLoading={loading}
      wordPressError={error}
      wordPressCategories={categories}
      wordPressStats={stats}
    />
  );
}

export default App;
