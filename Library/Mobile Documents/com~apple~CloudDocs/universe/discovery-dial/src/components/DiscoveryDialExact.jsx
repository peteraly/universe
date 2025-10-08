import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const DiscoveryDialExact = () => {
  // State management
  const [currentEventIndex, setCurrentEventIndex] = useState(0)
  const [lastGesture, setLastGesture] = useState('')
  const [timeFilterCycle, setTimeFilterCycle] = useState('today')
  const [startTime, setStartTime] = useState(0)

  // Event dataset
  const events = [
    { name: "Beach Volleyball Tournament", category: "Social/Fun", price: "Free" },
    { name: "Food Truck Festival", category: "Social/Fun", price: "Free" },
    { name: "Tech Meetup: AI & Machine Learning", category: "Professional", price: "Free" },
    { name: "Art Gallery Opening", category: "Arts/Culture", price: "Free" }
  ]

  // Time filter options
  const timeFilterOptions = ['today', 'tomorrow', 'thisWeek', 'thisMonth']
  const timeFilterLabels = {
    today: 'Today',
    tomorrow: 'Tomorrow', 
    thisWeek: 'This Week',
    thisMonth: 'This Month'
  }

  // Navigation function
  const navigateEvent = (direction) => {
    const directionMap = {
      'up': 'north',
      'down': 'south', 
      'left': 'west',
      'right': 'east'
    }
    
    const gesture = directionMap[direction] || direction
    setLastGesture(gesture)
    
    // Rotate through events
    setCurrentEventIndex((prev) => (prev + 1) % events.length)
    
    console.log({ 
      action: 'navigate', 
      direction: gesture, 
      timeFilterCycle, 
      startTime 
    })
  }

  // Time filter cycling
  const cycleTimeFilter = () => {
    const currentIndex = timeFilterOptions.indexOf(timeFilterCycle)
    const nextIndex = (currentIndex + 1) % timeFilterOptions.length
    const nextFilter = timeFilterOptions[nextIndex]
    
    setTimeFilterCycle(nextFilter)
    
    console.log({ 
      action: 'timeFilterChange', 
      timeFilterCycle: nextFilter, 
      startTime 
    })
  }

  // Keyboard support
  useEffect(() => {
    const handleKeyDown = (e) => {
      const keyMap = {
        'ArrowUp': 'up',
        'ArrowDown': 'down',
        'ArrowLeft': 'left', 
        'ArrowRight': 'right'
      }
      
      const direction = keyMap[e.key]
      if (direction) {
        e.preventDefault()
        navigateEvent(direction)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [timeFilterCycle, startTime])

  const currentEvent = events[currentEventIndex]

  return (
    <div 
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, rgb(102, 126, 234) 0%, rgb(118, 75, 162) 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        color: 'white',
        fontFamily: 'system-ui, -apple-system, sans-serif'
      }}
    >
      {/* Central Circular Event Card */}
      <div 
        style={{
          width: '60vw',
          height: '60vw',
          maxWidth: '320px',
          maxHeight: '320px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '24px'
        }}
      >
        <motion.div 
          style={{
            width: '100%',
            height: '100%',
            borderRadius: '50%',
            border: '1px solid rgba(255, 255, 255, 0.4)',
            boxShadow: '0 0 60px rgba(255, 255, 255, 0.08)',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            backgroundColor: 'rgba(255, 255, 255, 0.1)'
          }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          role="button"
          aria-label="Event navigation dial"
          tabIndex={0}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={currentEventIndex}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
              style={{
                textAlign: 'center',
                padding: '24px'
              }}
              aria-live="polite"
            >
              <h2 style={{
                color: 'white',
                fontWeight: '600',
                fontSize: '1.5rem',
                marginBottom: '8px',
                lineHeight: '1.2'
              }}>
                {currentEvent.name}
              </h2>
              <p style={{
                color: 'rgba(255, 255, 255, 0.8)',
                fontSize: '0.875rem',
                marginBottom: '4px'
              }}>
                {currentEvent.category}
              </p>
              <p style={{
                color: 'rgba(255, 255, 255, 0.6)',
                fontSize: '0.75rem'
              }}>
                {currentEvent.price}
              </p>
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Helper Text */}
      <div style={{
        color: 'rgba(255, 255, 255, 0.7)',
        fontSize: '0.875rem',
        textAlign: 'center',
        marginBottom: '24px'
      }}>
        Swipe the dial to discover events
      </div>

      {/* Cycle Button */}
      <motion.button
        onClick={cycleTimeFilter}
        style={{
          padding: '12px 24px',
          borderRadius: '12px',
          backgroundColor: 'rgba(255, 255, 255, 0.2)',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          color: 'white',
          fontSize: '0.875rem',
          fontWeight: '500',
          marginBottom: '24px',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
        }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-label={`Current filter: ${timeFilterLabels[timeFilterCycle]}`}
      >
        <AnimatePresence mode="wait">
          <motion.span
            key={timeFilterCycle}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {timeFilterLabels[timeFilterCycle]}
          </motion.span>
        </AnimatePresence>
      </motion.button>

      {/* Four Directional Buttons */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '16px',
        width: '100%',
        maxWidth: '320px',
        marginBottom: '24px'
      }}>
        {[
          { direction: 'up', label: 'Deep Dive', icon: '↑', color: 'blue' },
          { direction: 'down', label: 'Vibe Shift', icon: '↓', color: 'green' },
          { direction: 'left', label: 'Social', icon: '←', color: 'rose' },
          { direction: 'right', label: 'Action', icon: '→', color: 'amber' }
        ].map(({ direction, label, icon, color }) => (
          <motion.button
            key={direction}
            onClick={() => navigateEvent(direction)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '16px',
              borderRadius: '12px',
              backgroundColor: 'rgba(255, 255, 255, 0.12)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              color: 'white',
              minHeight: '44px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            aria-label={`${label} - ${direction}`}
          >
            <span style={{ fontSize: '1.5rem', marginBottom: '4px' }}>{icon}</span>
            <span style={{ fontSize: '0.875rem', fontWeight: '500' }}>{label}</span>
          </motion.button>
        ))}
      </div>

      {/* Last Gesture Indicator */}
      {lastGesture && (
        <div style={{
          color: '#4ade80',
          fontSize: '0.75rem',
          fontWeight: '500',
          marginBottom: '16px'
        }}>
          Last gesture: {lastGesture}
        </div>
      )}

      {/* Right-Side Time Slider */}
      <div style={{
        position: 'fixed',
        right: '8px',
        top: '50%',
        transform: 'translateY(-50%)',
        width: '8px',
        height: '128px',
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
        borderRadius: '4px',
        opacity: 0.6,
        cursor: 'pointer',
        transition: 'opacity 0.2s ease'
      }}>
        <div style={{
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(255, 255, 255, 0.5)',
          borderRadius: '4px'
        }}></div>
      </div>
    </div>
  )
}

export default DiscoveryDialExact
