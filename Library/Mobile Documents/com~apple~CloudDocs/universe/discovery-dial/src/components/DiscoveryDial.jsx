import React, { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'

const DiscoveryDial = () => {
  // L1_Curation – Event data loading
  const [currentEvent, setCurrentEvent] = useState(null)
  const [events, setEvents] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeDirection, setActiveDirection] = useState(null)
  const [lastGesture, setLastGesture] = useState('')
  const [selectedTimeRange, setSelectedTimeRange] = useState('Today')
  const [longPressTimer, setLongPressTimer] = useState(null)
  const [showTimeSelector, setShowTimeSelector] = useState(false)

  // L2_Health – Validation and fallback
  const governanceRead = async (endpoint, fallback = null) => {
    try {
      const response = await fetch(endpoint)
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      return await response.json()
    } catch (error) {
      console.warn(`Governance read failed for ${endpoint}:`, error)
      return fallback
    }
  }

  // Load events on component mount
  useEffect(() => {
    loadEvents()
  }, [])

  const loadEvents = async () => {
    try {
      setIsLoading(true)
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Mock events for demo
      const mockEvents = [
        {
          id: 'evt-001',
          name: 'Beach Volleyball Tournament',
          category: 'Social/Fun',
          price: 'Free',
          date: '2024-03-15',
          time: '14:00'
        },
        {
          id: 'evt-002',
          name: 'Tech Meetup: AI & Machine Learning',
          category: 'Professional',
          price: 'Free',
          date: '2024-03-22',
          time: '18:00'
        },
        {
          id: 'evt-003',
          name: 'Art Gallery Opening',
          category: 'Arts/Culture',
          price: 'Free',
          date: '2024-03-28',
          time: '19:00'
        },
        {
          id: 'evt-004',
          name: 'Food Truck Festival',
          category: 'Social/Fun',
          price: 'Free',
          date: '2024-04-05',
          time: '12:00'
        }
      ]
      
      setEvents(mockEvents)
      if (mockEvents.length > 0) {
        setCurrentEvent(mockEvents[0])
      }
    } catch (error) {
      console.error('Error loading events:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // L4_Intelligence – Relationship logic
  const handleDirection = (direction) => {
    setActiveDirection(direction)
    setLastGesture(direction)
    
    // Analytics
    console.log(`Direction selected: ${direction}`)
    
    // Navigate to related event (simple rotation for demo)
    const currentIndex = events.findIndex(e => e.id === currentEvent?.id)
    const nextIndex = (currentIndex + 1) % events.length
    setCurrentEvent(events[nextIndex])
  }

  // Long press handling for time selector
  const handleLongPress = () => {
    setLongPressTimer(setTimeout(() => {
      setShowTimeSelector(true)
      console.log('Long press activated - time selector shown')
    }, 500))
  }

  const handleLongPressEnd = () => {
    if (longPressTimer) {
      clearTimeout(longPressTimer)
      setLongPressTimer(null)
    }
  }

  const handleTimeRangeSelect = (range) => {
    setSelectedTimeRange(range)
    console.log(`Time range selected: ${range}`)
  }

  // L3_Config – UI/UX settings
  const timeOptions = ['Now', 'Today', 'Tonight', 'This Week', 'This Month', 'Later']

  if (isLoading) {
    return (
      <div className="min-h-screen w-full bg-gradient-to-br from-purple-500 via-blue-500 to-purple-700 flex items-center justify-center">
        <div className="text-white text-xl">Loading events...</div>
      </div>
    )
  }

  return (
    <div className="
      min-h-screen w-full
      bg-gradient-to-b from-purple-500 via-blue-500 to-purple-700
      flex flex-col items-center justify-center
      px-4 py-6
      relative overflow-hidden
      safe-area-inset
    ">
      {/* Main content area */}
      <div className="flex flex-col items-center justify-center w-full max-w-md mx-auto">
        {/* Main title */}
        <h1 className="
          text-white text-2xl font-bold
          mb-6 text-center
          tracking-wide
        ">
          Discovery Dial
        </h1>

        {/* Central circular dial */}
        <div className="
          relative w-[60vw] h-[60vw] sm:w-[50vw] sm:h-[50vw] max-w-80 max-h-80
          flex items-center justify-center
          mb-6
        ">
        <div 
          className="
            w-full h-full
            border border-white/40
            rounded-full
            flex flex-col items-center justify-center
            bg-white/10 backdrop-blur-sm
            transition-all duration-300
            cursor-pointer
            shadow-lg
          "
          onMouseDown={handleLongPress}
          onMouseUp={handleLongPressEnd}
          onTouchStart={handleLongPress}
          onTouchEnd={handleLongPressEnd}
        >
          {/* Event display */}
          <motion.div
            key={currentEvent?.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="text-center px-6"
          >
            {currentEvent ? (
              <>
                <h2 className="text-white text-lg font-bold mb-2 leading-tight text-center">
                  {currentEvent.name}
                </h2>
                <p className="text-white/90 text-sm mb-1 text-center">
                  {currentEvent.category}
                </p>
                <p className="text-white/70 text-xs text-center">
                  {currentEvent.price}
                </p>
              </>
            ) : (
              <div className="text-white/60 text-center">
                <p className="text-lg">No events available</p>
                <p className="text-sm">Check back later</p>
              </div>
            )}
          </motion.div>
        </div>

        {/* Instructions */}
        <div className="text-white/70 text-sm text-center mb-6 space-y-1">
          <p>Swipe the dial to discover events</p>
          <p>Hold down the dial for time filter options</p>
        </div>


      {/* Four directional buttons */}
      <div className="grid grid-cols-2 gap-3 w-full max-w-72">
        <button
          onClick={() => handleDirection('north')}
          className={`
            flex flex-col items-center justify-center
            p-4 rounded-xl
            border-2 transition-all duration-300
            ${activeDirection === 'north' 
              ? 'border-blue-500 bg-blue-500 text-white shadow-lg' 
              : 'border-purple-500 bg-purple-500 text-white hover:bg-purple-600'
            }
            focus:outline-none focus:ring-2 focus:ring-blue-400/50
            touch-manipulation
            min-h-[44px]
            shadow-md
          `}
          aria-label="Deep Dive - north"
        >
          <span className="text-2xl mb-1">↑</span>
          <span className="text-white text-sm font-medium">Deep Dive</span>
        </button>

        <button
          onClick={() => handleDirection('south')}
          className={`
            flex flex-col items-center justify-center
            p-4 rounded-xl
            border-2 transition-all duration-300
            ${activeDirection === 'south' 
              ? 'border-green-500 bg-green-500 text-white shadow-lg' 
              : 'border-purple-500 bg-purple-500 text-white hover:bg-purple-600'
            }
            focus:outline-none focus:ring-2 focus:ring-green-400/50
            touch-manipulation
            min-h-[44px]
            shadow-md
          `}
          aria-label="Vibe Shift - south"
        >
          <span className="text-2xl mb-1">↓</span>
          <span className="text-white text-sm font-medium">Vibe Shift</span>
        </button>

        <button
          onClick={() => handleDirection('west')}
          className={`
            flex flex-col items-center justify-center
            p-4 rounded-xl
            border-2 transition-all duration-300
            ${activeDirection === 'west' 
              ? 'border-red-500 bg-red-500 text-white shadow-lg' 
              : 'border-purple-500 bg-purple-500 text-white hover:bg-purple-600'
            }
            focus:outline-none focus:ring-2 focus:ring-red-400/50
            touch-manipulation
            min-h-[44px]
            shadow-md
          `}
          aria-label="Social - west"
        >
          <span className="text-2xl mb-1">←</span>
          <span className="text-white text-sm font-medium">Social</span>
        </button>

        <button
          onClick={() => handleDirection('east')}
          className={`
            flex flex-col items-center justify-center
            p-4 rounded-xl
            border-2 transition-all duration-300
            ${activeDirection === 'east' 
              ? 'border-orange-500 bg-orange-500 text-white shadow-lg' 
              : 'border-purple-500 bg-purple-500 text-white hover:bg-purple-600'
            }
            focus:outline-none focus:ring-2 focus:ring-orange-400/50
            touch-manipulation
            min-h-[44px]
            shadow-md
          `}
          aria-label="Action - east"
        >
          <span className="text-2xl mb-1">→</span>
          <span className="text-white text-sm font-medium">Action</span>
        </button>
      </div>

        {/* Last gesture indicator */}
        {lastGesture && (
          <div className="text-green-400 text-sm mt-4">
            Last gesture: {lastGesture}
          </div>
        )}
      </div>

      {/* Vertical Time Selector - Right Side */}
      <div className="fixed right-4 top-1/2 -translate-y-1/2 z-10">
        <div className="
          backdrop-blur-sm bg-white/10 rounded-2xl
          p-2
          shadow-lg
          opacity-60 hover:opacity-100
          transition-opacity duration-300
        ">
          <div className="flex flex-col space-y-1">
            {timeOptions.map((option) => (
              <motion.button
                key={option}
                onClick={() => {
                  handleTimeRangeSelect(option)
                  // Haptic feedback
                  if (navigator.vibrate) {
                    navigator.vibrate(50)
                  }
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`
                  px-3 py-2 rounded-lg
                  transition-all duration-300
                  text-xs font-medium
                  text-center
                  min-w-[80px]
                  ${selectedTimeRange === option 
                    ? 'bg-white/40 text-white shadow-md shadow-white/25' 
                    : 'bg-white/20 text-white/60 hover:bg-white/30 hover:text-white/80'
                  }
                  focus:outline-none focus:ring-2 focus:ring-white/50
                  touch-manipulation
                `}
              >
                {option}
              </motion.button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

    </div>
  )
}

export default DiscoveryDial
