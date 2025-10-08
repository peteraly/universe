import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export const RightTimeSlider = ({ onTimeChange, currentTime }) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [dragY, setDragY] = useState(0)
  const sliderRef = useRef(null)
  const timeoutRef = useRef(null)

  // Time options with labels and minutes since midnight
  const timeOptions = [
    { label: 'Now', minutes: 0 },
    { label: '8a', minutes: 480 },
    { label: '10a', minutes: 600 },
    { label: '12p', minutes: 720 },
    { label: '2p', minutes: 840 },
    { label: '4p', minutes: 960 },
    { label: '6p', minutes: 1080 },
    { label: '8p', minutes: 1200 },
    { label: '10p', minutes: 1320 }
  ]

  // Find closest time option
  const findClosestTime = (minutes) => {
    return timeOptions.reduce((closest, option) => 
      Math.abs(option.minutes - minutes) < Math.abs(closest.minutes - minutes) 
        ? option 
        : closest
    )
  }

  // Handle mouse/touch events
  const handleStart = (clientY) => {
    setIsDragging(true)
    setDragY(clientY)
    clearTimeout(timeoutRef.current)
  }

  const handleMove = (clientY) => {
    if (!isDragging) return
    
    const deltaY = clientY - dragY
    const sliderHeight = sliderRef.current?.offsetHeight || 200
    const progress = Math.max(0, Math.min(1, -deltaY / sliderHeight))
    const minutes = Math.round(progress * (timeOptions.length - 1) * 120) // 2-hour intervals
    const closestTime = findClosestTime(minutes)
    
    onTimeChange(closestTime.minutes)
  }

  const handleEnd = () => {
    setIsDragging(false)
    setDragY(0)
    
    // Auto-collapse after 1s
    timeoutRef.current = setTimeout(() => {
      setIsExpanded(false)
    }, 1000)
  }

  // Mouse events
  const handleMouseDown = (e) => {
    e.preventDefault()
    handleStart(e.clientY)
  }

  const handleMouseMove = (e) => {
    if (isDragging) {
      handleMove(e.clientY)
    }
  }

  const handleMouseUp = () => {
    if (isDragging) {
      handleEnd()
    }
  }

  // Touch events
  const handleTouchStart = (e) => {
    e.preventDefault()
    handleStart(e.touches[0].clientY)
  }

  const handleTouchMove = (e) => {
    if (isDragging) {
      e.preventDefault()
      handleMove(e.touches[0].clientY)
    }
  }

  const handleTouchEnd = () => {
    if (isDragging) {
      handleEnd()
    }
  }

  // Global event listeners
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      document.addEventListener('touchmove', handleTouchMove, { passive: false })
      document.addEventListener('touchend', handleTouchEnd)
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      document.removeEventListener('touchmove', handleTouchMove)
      document.removeEventListener('touchend', handleTouchEnd)
    }
  }, [isDragging, dragY])

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  // Toggle expanded state
  const toggleExpanded = () => {
    setIsExpanded(!isExpanded)
    clearTimeout(timeoutRef.current)
  }

  // Get current time label
  const currentTimeLabel = timeOptions.find(option => option.minutes === currentTime)?.label || 'Now'

  return (
    <motion.div
      className={`
        fixed right-1 top-24 bottom-24
        rounded-full
        bg-white/30 hover:bg-white/50
        transition-all duration-300
        cursor-pointer
        z-10
        ${isExpanded ? 'w-12 p-2 rounded-xl bg-white/25 backdrop-blur-md shadow-lg opacity-100' : 'w-2 opacity-60'}
      `}
      onClick={toggleExpanded}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      aria-label={`Time selector: ${currentTimeLabel}`}
      role="button"
      tabIndex={0}
    >
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            ref={sliderRef}
            className="
              h-full flex flex-col justify-between
              items-center
              relative
            "
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2 }}
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
          >
            {/* Time labels */}
            {timeOptions.map((option, index) => (
              <motion.div
                key={option.label}
                className={`
                  text-xs font-medium
                  transition-colors duration-200
                  ${option.minutes === currentTime 
                    ? 'text-white font-bold' 
                    : 'text-white/60'
                  }
                `}
                whileHover={{ scale: 1.1 }}
              >
                {option.label}
              </motion.div>
            ))}

            {/* Draggable thumb indicator */}
            <motion.div
              className="
                absolute right-0 w-1 h-1
                bg-white rounded-full
                shadow-lg
              "
              style={{
                top: `${(timeOptions.findIndex(option => option.minutes === currentTime) / (timeOptions.length - 1)) * 100}%`
              }}
              animate={{
                scale: isDragging ? 1.5 : 1,
                opacity: isDragging ? 1 : 0.8
              }}
              transition={{ duration: 0.2 }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Collapsed state indicator */}
      {!isExpanded && (
        <div className="
          h-full flex items-center justify-center
          text-white/60 text-xs
        ">
          <motion.div
            className="w-1 h-1 bg-white rounded-full"
            animate={{ opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </div>
      )}
    </motion.div>
  )
}
