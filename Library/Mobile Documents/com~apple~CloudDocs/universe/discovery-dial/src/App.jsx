import React, { useEffect } from 'react';
import EventCompassFinal from './components/EventCompassFinal';
import ErrorBoundary from './components/ErrorBoundary';
import categoriesData from './data/categories.json';
import useScrollPrevention from './hooks/useScrollPrevention';
import useTextSelectionPrevention from './hooks/useTextSelectionPrevention';
import useSafariScrollPrevention from './hooks/useSafariScrollPrevention';
import { useWordPressComEvents } from './hooks/useWordPressComEvents';
import { 
  safeDocumentBody, 
  safeDocumentElement, 
  isDocumentAvailable, 
  isWindowAvailable,
  safeAddEventListener,
  safeRemoveEventListener,
  safeSetStyle,
  safeSetStyles
} from './utils/safeDOM';
import './utils/testWordPress'; // Import test utilities
import './utils/testWordPressCom'; // Import WordPress.com test utilities
import './utils/qaTesting'; // Import QA testing utilities

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

  // Mobile detection and initialization
  useEffect(() => {
    const isMobile = () => {
      return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
             (window.innerWidth <= 768) ||
             ('ontouchstart' in window);
    };

    if (isMobile()) {
      // Add mobile device class
      if (isDocumentAvailable() && document.body) {
        document.body.classList.add('mobile-device');
      }
      
      // Mobile-specific initialization
      console.log('Mobile device detected - applying mobile optimizations');
    }
  }, []);

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

    // Global event listeners for text selection (only if document is available)
    if (isDocumentAvailable()) {
      safeAddEventListener(document, 'selectstart', preventSelectionAndScrolling, { passive: false });
      safeAddEventListener(document, 'dragstart', preventSelectionAndScrolling, { passive: false });
      safeAddEventListener(document, 'contextmenu', preventSelectionAndScrolling, { passive: false });
      
      // Additional text selection prevention events
      safeAddEventListener(document, 'mousedown', preventSelectionAndScrolling, { passive: false });
      safeAddEventListener(document, 'mouseup', preventSelectionAndScrolling, { passive: false });
      safeAddEventListener(document, 'mousemove', preventSelectionAndScrolling, { passive: false });

      // Global event listeners for scrolling
      safeAddEventListener(document, 'wheel', preventScrolling, { passive: false });
      safeAddEventListener(document, 'touchmove', preventScrolling, { passive: false });
      safeAddEventListener(document, 'touchstart', preventScrolling, { passive: false });
      safeAddEventListener(document, 'touchend', preventScrolling, { passive: false });
      safeAddEventListener(document, 'scroll', preventScrolling, { passive: false });
      
      // Additional scroll prevention events
      safeAddEventListener(document, 'DOMMouseScroll', preventScrolling, { passive: false }); // Firefox
      safeAddEventListener(document, 'mousewheel', preventScrolling, { passive: false }); // Older browsers
      safeAddEventListener(document, 'MozMousePixelScroll', preventScrolling, { passive: false }); // Firefox
    }

    // Prevent keyboard scrolling
    const handleKeyDown = (e) => {
      if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'PageUp', 'PageDown', 'Home', 'End'].includes(e.code)) {
        preventScrolling(e);
      }
    };
    if (isDocumentAvailable()) {
      safeAddEventListener(document, 'keydown', handleKeyDown);
    }

    // Apply styles to prevent scrolling (only if document is available)
    if (isDocumentAvailable()) {
      const documentElement = safeDocumentElement();
      const body = safeDocumentBody();
      const root = document.getElementById('root');
      
      // Apply styles to document element
      if (documentElement) {
        safeSetStyles(documentElement, {
          overflow: 'hidden',
          overscrollBehavior: 'none',
          touchAction: 'none',
          position: 'fixed',
          top: '0',
          left: '0',
          right: '0',
          bottom: '0',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none'
        });
      }
      
      // Apply styles to body
      if (body) {
        safeSetStyles(body, {
          overflow: 'hidden',
          overscrollBehavior: 'none',
          touchAction: 'none',
          position: 'fixed',
          top: '0',
          left: '0',
          right: '0',
          bottom: '0',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none'
        });
      }
      
      // Apply styles to root element
      if (root) {
        safeSetStyles(root, {
          overflow: 'hidden',
          overscrollBehavior: 'none',
          touchAction: 'none',
          position: 'fixed',
          top: '0',
          left: '0',
          right: '0',
          bottom: '0',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none'
        });
      }
    }

    // Hide scrollbars for all elements (only if document is available)
    const hideScrollbars = () => {
      if (!isDocumentAvailable()) return;
      
      try {
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
        if (document.head) {
          document.head.appendChild(style);
        }
      } catch (error) {
        console.warn('App: Failed to hide scrollbars', error);
      }
    };
    hideScrollbars();

    // Prevent programmatic scrolling (only if window is available)
    let originalScrollTo, originalScrollBy, originalScroll;
    if (isWindowAvailable()) {
      originalScrollTo = window.scrollTo;
      originalScrollBy = window.scrollBy;
      originalScroll = window.scroll;
      
      window.scrollTo = () => {};
      window.scrollBy = () => {};
      window.scroll = () => {};
    }
    
    // Prevent element scrolling (only if document is available)
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
    
    // Apply to all existing elements (only if document is available)
    if (isDocumentAvailable()) {
      try {
        document.querySelectorAll('*').forEach(preventElementScroll);
      } catch (error) {
        console.warn('App: Failed to prevent element scrolling', error);
      }
    }

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

      // Safari-specific event listeners (only if document is available)
      if (isDocumentAvailable()) {
        safeAddEventListener(document, 'gesturestart', preventSafariScroll, { passive: false });
        safeAddEventListener(document, 'gesturechange', preventSafariScroll, { passive: false });
        safeAddEventListener(document, 'gestureend', preventSafariScroll, { passive: false });
      }

      // Prevent Safari's scroll restoration
      if (isWindowAvailable() && 'scrollRestoration' in history) {
        history.scrollRestoration = 'manual';
      }

      // Force scroll position to top for Safari
      const safariScrollInterval = setInterval(() => {
        if (isWindowAvailable()) {
          window.scrollTo(0, 0);
        }
        if (isDocumentAvailable()) {
          const documentElement = safeDocumentElement();
          const body = safeDocumentBody();
          
          if (documentElement) {
            documentElement.scrollTop = 0;
          }
          if (body) {
            body.scrollTop = 0;
          }
        }
      }, 100);

      // Safari-specific CSS injection (only if document is available)
      let safariStyle = null;
      if (isDocumentAvailable()) {
        try {
          safariStyle = document.createElement('style');
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
          if (document.head) {
            document.head.appendChild(safariStyle);
          }
        } catch (error) {
          console.warn('App: Failed to inject Safari CSS', error);
        }
      }

      // Store references for cleanup
      if (isWindowAvailable()) {
        window.safariScrollInterval = safariScrollInterval;
        window.safariStyle = safariStyle;
      }
    }

    // Cleanup
    return () => {
      if (isDocumentAvailable()) {
        safeRemoveEventListener(document, 'selectstart', preventSelectionAndScrolling);
        safeRemoveEventListener(document, 'dragstart', preventSelectionAndScrolling);
        safeRemoveEventListener(document, 'contextmenu', preventSelectionAndScrolling);
        safeRemoveEventListener(document, 'mousedown', preventSelectionAndScrolling);
        safeRemoveEventListener(document, 'mouseup', preventSelectionAndScrolling);
        safeRemoveEventListener(document, 'mousemove', preventSelectionAndScrolling);
        safeRemoveEventListener(document, 'wheel', preventScrolling);
        safeRemoveEventListener(document, 'touchmove', preventScrolling);
        safeRemoveEventListener(document, 'touchstart', preventScrolling);
        safeRemoveEventListener(document, 'touchend', preventScrolling);
        safeRemoveEventListener(document, 'scroll', preventScrolling);
        safeRemoveEventListener(document, 'DOMMouseScroll', preventScrolling);
        safeRemoveEventListener(document, 'mousewheel', preventScrolling);
        safeRemoveEventListener(document, 'MozMousePixelScroll', preventScrolling);
        safeRemoveEventListener(document, 'keydown', handleKeyDown);
      }
      
      // Restore original scroll methods (only if window is available)
      if (isWindowAvailable()) {
        window.scrollTo = originalScrollTo;
        window.scrollBy = originalScrollBy;
        window.scroll = originalScroll;
      }
      
      // Safari-specific cleanup
      if (isSafari || isIOS) {
        // Clear Safari scroll interval
        if (isWindowAvailable() && window.safariScrollInterval) {
          clearInterval(window.safariScrollInterval);
        }
        
        // Remove Safari-specific styles
        if (isWindowAvailable() && window.safariStyle && window.safariStyle.parentNode) {
          window.safariStyle.parentNode.removeChild(window.safariStyle);
        }
        
        // Remove Safari-specific event listeners
        if (preventSafariScroll && isDocumentAvailable()) {
          safeRemoveEventListener(document, 'gesturestart', preventSafariScroll);
          safeRemoveEventListener(document, 'gesturechange', preventSafariScroll);
          safeRemoveEventListener(document, 'gestureend', preventSafariScroll);
        }
      }
    };
  }, []);

  // Initialize WordPress.com events (with fallback to local data)
  const { events: wordPressComEvents, loading, error, categories, stats } = useWordPressComEvents();

  return (
    <ErrorBoundary name="App">
      <EventCompassFinal
        categories={categoriesData.categories}
        wordPressEvents={wordPressComEvents}
        wordPressLoading={loading}
        wordPressError={error}
        wordPressCategories={categories}
        wordPressStats={stats}
      />
    </ErrorBoundary>
  );
}

export default App;
