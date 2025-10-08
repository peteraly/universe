import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { RightTimeSlider } from './RightTimeSlider'
import { useSwipe } from '../hooks/useSwipe'

const DiscoveryDial = () => {
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
    
    // Console logging
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
    
    // Console logging
    console.log({ 
      action: 'timeFilterChange', 
      timeFilterCycle: nextFilter, 
      startTime 
    })
  }

  // Handle time slider change
  const handleTimeSliderChange = (time) => {
    setStartTime(time)
    
    // Console logging
    console.log({ 
      action: 'startTimeChange', 
      timeFilterCycle, 
      startTime: time 
    })
  }

  // Swipe gesture detection
  const swipeHandlers = useSwipe(navigateEvent)

  // Debug logging
  useEffect(() => {
    console.log('DiscoveryDial mounted')
    console.log('Cycle button should be visible')
    console.log('RightTimeSlider should be visible')
  }, [])

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
    <div className="
      min-h-screen w-full
      bg-gradient-to-b from-indigo-500 via-purple-500 to-violet-600
      flex flex-col items-center justify-center
      px-4 py-6
      relative overflow-hidden
      pt-safe pb-safe
    ">
      {/* Central Circular Event Card */}
      <div className="
        relative w-[60vw] h-[60vw] sm:w-[50vw] sm:h-[50vw] max-w-80 max-h-80
        flex items-center justify-center
        mb-6
      ">
        <motion.div 
          className="
            w-full h-full
            rounded-full border border-white/40
            shadow-[0_0_60px_rgba(255,255,255,0.08)]
            backdrop-blur-sm
            flex flex-col items-center justify-center
            cursor-pointer
            transition-all duration-300
          "
          {...swipeHandlers}
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
              className="text-center px-6"
              aria-live="polite"
            >
              <h2 className="text-white font-semibold text-xl sm:text-2xl mb-2">
                {currentEvent.name}
              </h2>
              <p className="text-white/80 text-sm mb-1">
                {currentEvent.category}
              </p>
              <p className="text-white/60 text-xs">
                {currentEvent.price}
              </p>
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Helper Text */}
      <div className="text-white/70 text-sm text-center mb-6">
        Swipe the dial to discover events
      </div>

      {/* Cycle Button */}
      <motion.button
        onClick={cycleTimeFilter}
        className="
          px-6 py-3 rounded-xl
          bg-white/20 hover:bg-white/30
          focus-visible:ring-2 focus-visible:ring-white/60
          transition-all duration-200
          text-white text-sm font-medium
          mb-6
          border border-white/30
          shadow-lg
        "
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
      <div className="grid grid-cols-2 gap-4 w-full max-w-80 mb-6">
        {[
          { direction: 'up', label: 'Deep Dive', icon: '↑', color: 'blue' },
          { direction: 'down', label: 'Vibe Shift', icon: '↓', color: 'green' },
          { direction: 'left', label: 'Social', icon: '←', color: 'rose' },
          { direction: 'right', label: 'Action', icon: '→', color: 'amber' }
        ].map(({ direction, label, icon, color }) => (
          <motion.button
            key={direction}
            onClick={() => navigateEvent(direction)}
            className={`
              flex flex-col items-center justify-center
              p-4 rounded-xl
              bg-white/12 hover:bg-white/16
              focus-visible:ring-2 focus-visible:ring-white/60
              transition-all duration-200
              text-white
              min-h-[44px]
              border border-white/20
              shadow-md
            `}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            aria-label={`${label} - ${direction}`}
          >
            <span className="text-2xl mb-1">{icon}</span>
            <span className="text-sm font-medium">{label}</span>
          </motion.button>
        ))}
      </div>

      {/* Last Gesture Indicator */}
      {lastGesture && (
        <div className="text-green-400 text-xs font-medium mb-4">
          Last gesture: {lastGesture}
        </div>
      )}

      {/* Right-Side Time Slider */}
      <RightTimeSlider 
        onTimeChange={handleTimeSliderChange}
        currentTime={startTime}
      />
    </div>
  )
}

export default DiscoveryDial