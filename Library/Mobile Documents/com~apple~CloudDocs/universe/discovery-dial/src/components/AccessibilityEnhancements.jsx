// Context: V12.0 UX Polish & Accessibility - Accessibility Enhancements
// This component provides comprehensive accessibility features for the Discovery Dial
// Mission Control system, including screen reader support, keyboard navigation, and ARIA labels.

import React, { useEffect, useState } from 'react'

const AccessibilityEnhancements = ({ children }) => {
  const [isReducedMotion, setIsReducedMotion] = useState(false)
  const [isHighContrast, setIsHighContrast] = useState(false)
  const [fontSize, setFontSize] = useState(16)

  useEffect(() => {
    // Check for reduced motion preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setIsReducedMotion(mediaQuery.matches)
    
    // Check for high contrast preference
    const highContrastQuery = window.matchMedia('(prefers-contrast: high)')
    setIsHighContrast(highContrastQuery.matches)
    
    // Listen for changes
    const handleMotionChange = (e) => setIsReducedMotion(e.matches)
    const handleContrastChange = (e) => setIsHighContrast(e.matches)
    
    mediaQuery.addEventListener('change', handleMotionChange)
    highContrastQuery.addEventListener('change', handleContrastChange)
    
    return () => {
      mediaQuery.removeEventListener('change', handleMotionChange)
      highContrastQuery.removeEventListener('change', handleContrastChange)
    }
  }, [])

  // Apply accessibility styles
  useEffect(() => {
    const root = document.documentElement
    
    // Set CSS custom properties for accessibility
    root.style.setProperty('--accessibility-reduced-motion', isReducedMotion ? '1' : '0')
    root.style.setProperty('--accessibility-high-contrast', isHighContrast ? '1' : '0')
    root.style.setProperty('--accessibility-font-size', `${fontSize}px`)
    
    // Apply high contrast styles
    if (isHighContrast) {
      root.classList.add('high-contrast')
    } else {
      root.classList.remove('high-contrast')
    }
    
    // Apply reduced motion styles
    if (isReducedMotion) {
      root.classList.add('reduced-motion')
    } else {
      root.classList.remove('reduced-motion')
    }
  }, [isReducedMotion, isHighContrast, fontSize])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Alt + 1: Focus main content
      if (e.altKey && e.key === '1') {
        e.preventDefault()
        const main = document.querySelector('[role="main"]')
        if (main) main.focus()
      }
      
      // Alt + 2: Focus navigation
      if (e.altKey && e.key === '2') {
        e.preventDefault()
        const nav = document.querySelector('nav')
        if (nav) nav.focus()
      }
      
      // Alt + 3: Focus footer
      if (e.altKey && e.key === '3') {
        e.preventDefault()
        const footer = document.querySelector('footer')
        if (footer) footer.focus()
      }
      
      // Ctrl + +: Increase font size
      if (e.ctrlKey && e.key === '+') {
        e.preventDefault()
        setFontSize(prev => Math.min(prev + 2, 24))
      }
      
      // Ctrl + -: Decrease font size
      if (e.ctrlKey && e.key === '-') {
        e.preventDefault()
        setFontSize(prev => Math.max(prev - 2, 12))
      }
      
      // Ctrl + 0: Reset font size
      if (e.ctrlKey && e.key === '0') {
        e.preventDefault()
        setFontSize(16)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <>
      {children}
      
      {/* Accessibility Styles */}
      <style>{`
        :root {
          --accessibility-reduced-motion: 0;
          --accessibility-high-contrast: 0;
          --accessibility-font-size: 16px;
        }
        
        /* High Contrast Mode */
        .high-contrast {
          filter: contrast(150%) brightness(110%);
        }
        
        .high-contrast * {
          border-color: currentColor !important;
        }
        
        .high-contrast button,
        .high-contrast input,
        .high-contrast select,
        .high-contrast textarea {
          border: 2px solid currentColor !important;
        }
        
        /* Reduced Motion */
        .reduced-motion *,
        .reduced-motion *::before,
        .reduced-motion *::after {
          animation-duration: 0.01ms !important;
          animation-iteration-count: 1 !important;
          transition-duration: 0.01ms !important;
          scroll-behavior: auto !important;
        }
        
        /* Focus Indicators */
        *:focus {
          outline: 2px solid #3b82f6 !important;
          outline-offset: 2px !important;
        }
        
        *:focus:not(:focus-visible) {
          outline: none !important;
        }
        
        *:focus-visible {
          outline: 2px solid #3b82f6 !important;
          outline-offset: 2px !important;
        }
        
        /* Skip Links */
        .skip-link {
          position: absolute;
          top: -40px;
          left: 6px;
          background: #000;
          color: #fff;
          padding: 8px;
          text-decoration: none;
          z-index: 1000;
          border-radius: 4px;
        }
        
        .skip-link:focus {
          top: 6px;
        }
        
        /* Screen Reader Only */
        .sr-only {
          position: absolute;
          width: 1px;
          height: 1px;
          padding: 0;
          margin: -1px;
          overflow: hidden;
          clip: rect(0, 0, 0, 0);
          white-space: nowrap;
          border: 0;
        }
        
        /* High Contrast Focus */
        .high-contrast *:focus {
          outline: 3px solid #ffff00 !important;
          outline-offset: 3px !important;
        }
        
        /* Font Size Adjustments */
        html {
          font-size: var(--accessibility-font-size);
        }
        
        /* Touch Target Sizes */
        button,
        input,
        select,
        textarea,
        [role="button"] {
          min-height: 44px;
          min-width: 44px;
        }
        
        /* Color Contrast */
        .high-contrast {
          color-scheme: light dark;
        }
        
        /* Reduced Motion Animations */
        @media (prefers-reduced-motion: reduce) {
          *,
          *::before,
          *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
            scroll-behavior: auto !important;
          }
        }
        
        /* High Contrast Media Query */
        @media (prefers-contrast: high) {
          * {
            border-color: currentColor !important;
          }
          
          button,
          input,
          select,
          textarea {
            border: 2px solid currentColor !important;
          }
        }
      `}</style>
      
      {/* Skip Links */}
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      <a href="#navigation" className="skip-link">
        Skip to navigation
      </a>
      <a href="#footer" className="skip-link">
        Skip to footer
      </a>
      
      {/* Screen Reader Announcements */}
      <div 
        id="sr-announcements" 
        className="sr-only" 
        aria-live="polite" 
        aria-atomic="true"
      />
      
      {/* Accessibility Instructions */}
      <div className="sr-only">
        <h2>Keyboard Shortcuts</h2>
        <ul>
          <li>Alt + 1: Focus main content</li>
          <li>Alt + 2: Focus navigation</li>
          <li>Alt + 3: Focus footer</li>
          <li>Ctrl + +: Increase font size</li>
          <li>Ctrl + -: Decrease font size</li>
          <li>Ctrl + 0: Reset font size</li>
        </ul>
      </div>
    </>
  )
}

export default AccessibilityEnhancements
