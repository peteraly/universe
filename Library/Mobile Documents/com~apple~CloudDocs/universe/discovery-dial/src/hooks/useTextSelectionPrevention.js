import { useEffect, useCallback, useRef } from 'react';

/**
 * Custom hook for complete text selection prevention
 * Prevents all text highlighting that could interfere with gesture controls
 */
const useTextSelectionPrevention = () => {
  const observerRef = useRef(null);

  // Prevent text selection via JavaScript
  const preventTextSelection = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
    return false;
  }, []);

  // Apply text selection prevention to all elements
  const applyTextSelectionPrevention = useCallback(() => {
    // Apply to all existing elements
    const allElements = document.querySelectorAll('*');
    allElements.forEach(element => {
      element.addEventListener('selectstart', preventTextSelection, { passive: false });
      element.addEventListener('dragstart', preventTextSelection, { passive: false });
      element.addEventListener('contextmenu', preventTextSelection, { passive: false });
    });

    // Apply to document and window
    document.addEventListener('selectstart', preventTextSelection, { passive: false });
    document.addEventListener('dragstart', preventTextSelection, { passive: false });
    document.addEventListener('contextmenu', preventTextSelection, { passive: false });
    window.addEventListener('selectstart', preventTextSelection, { passive: false });
    window.addEventListener('dragstart', preventTextSelection, { passive: false });
    window.addEventListener('contextmenu', preventTextSelection, { passive: false });
  }, [preventTextSelection]);

  // Remove text selection prevention from all elements
  const removeTextSelectionPrevention = useCallback(() => {
    const allElements = document.querySelectorAll('*');
    allElements.forEach(element => {
      element.removeEventListener('selectstart', preventTextSelection);
      element.removeEventListener('dragstart', preventTextSelection);
      element.removeEventListener('contextmenu', preventTextSelection);
    });

    document.removeEventListener('selectstart', preventTextSelection);
    document.removeEventListener('dragstart', preventTextSelection);
    document.removeEventListener('contextmenu', preventTextSelection);
    window.removeEventListener('selectstart', preventTextSelection);
    window.removeEventListener('dragstart', preventTextSelection);
    window.removeEventListener('contextmenu', preventTextSelection);
  }, [preventTextSelection]);

  // Set up mutation observer for dynamically added elements
  const setupMutationObserver = useCallback(() => {
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    observerRef.current = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            // Apply text selection prevention to new elements
            node.addEventListener('selectstart', preventTextSelection, { passive: false });
            node.addEventListener('dragstart', preventTextSelection, { passive: false });
            node.addEventListener('contextmenu', preventTextSelection, { passive: false });

            // Apply to all child elements
            const childElements = node.querySelectorAll('*');
            childElements.forEach(child => {
              child.addEventListener('selectstart', preventTextSelection, { passive: false });
              child.addEventListener('dragstart', preventTextSelection, { passive: false });
              child.addEventListener('contextmenu', preventTextSelection, { passive: false });
            });
          }
        });
      });
    });

    observerRef.current.observe(document.body, { 
      childList: true, 
      subtree: true,
      attributes: true,
      attributeFilter: ['class', 'id']
    });
  }, [preventTextSelection]);

  // Initialize text selection prevention
  useEffect(() => {
    // Apply prevention to all existing elements
    applyTextSelectionPrevention();

    // Set up mutation observer for new elements
    setupMutationObserver();

    // Apply CSS-based prevention as backup
    const applyCSSPrevention = () => {
      const style = document.createElement('style');
      style.textContent = `
        * {
          -webkit-user-select: none !important;
          -moz-user-select: none !important;
          -ms-user-select: none !important;
          user-select: none !important;
          -webkit-touch-callout: none !important;
          -webkit-tap-highlight-color: transparent !important;
        }
      `;
      document.head.appendChild(style);
    };

    applyCSSPrevention();

    // Cleanup function
    return () => {
      removeTextSelectionPrevention();
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [applyTextSelectionPrevention, removeTextSelectionPrevention, setupMutationObserver]);

  // Return utilities for manual control
  return {
    preventTextSelection,
    applyTextSelectionPrevention,
    removeTextSelectionPrevention
  };
};

export default useTextSelectionPrevention;
