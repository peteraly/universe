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
  const timeOptions = ['Today', 'This Week', 'Next Week', 'This Month']

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
      bg-gradient-to-br from-purple-500 via-blue-500 to-purple-700
      flex items-center justify-center
      px-4 py-6
      relative overflow-hidden
    ">
      {/* Main content area */}
      <div className="flex-1 flex flex-col items-center justify-center max-w-4xl mx-auto">
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
          relative w-72 h-72 sm:w-80 sm:h-80
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
        <div className="text-white/80 text-sm text-center mb-6 space-y-1">
          <p>Swipe the dial to discover events</p>
          <p>Hold down the dial for time filter options</p>
        </div>


      {/* Four directional buttons */}
      <div className="grid grid-cols-2 gap-3 w-72">
        <button
          onClick={() => handleDirection('north')}
          className={`
            flex flex-col items-center justify-center
            p-3 rounded-lg
            border-2 transition-all duration-200
            ${activeDirection === 'north' 
              ? 'border-blue-400 bg-blue-500/30 shadow-lg' 
              : 'border-white/30 bg-white/15 hover:bg-white/25'
            }
            focus:outline-none focus:ring-2 focus:ring-white/50
            touch-manipulation
            min-h-[70px]
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
            p-3 rounded-lg
            border-2 transition-all duration-200
            ${activeDirection === 'south' 
              ? 'border-green-400 bg-green-500/30 shadow-lg' 
              : 'border-white/30 bg-white/15 hover:bg-white/25'
            }
            focus:outline-none focus:ring-2 focus:ring-white/50
            touch-manipulation
            min-h-[70px]
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
            p-3 rounded-lg
            border-2 transition-all duration-200
            ${activeDirection === 'west' 
              ? 'border-red-400 bg-red-500/30 shadow-lg' 
              : 'border-white/30 bg-white/15 hover:bg-white/25'
            }
            focus:outline-none focus:ring-2 focus:ring-white/50
            touch-manipulation
            min-h-[70px]
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
            p-3 rounded-lg
            border-2 transition-all duration-200
            ${activeDirection === 'east' 
              ? 'border-orange-400 bg-orange-500/30 shadow-lg' 
              : 'border-white/30 bg-white/15 hover:bg-white/25'
            }
            focus:outline-none focus:ring-2 focus:ring-white/50
            touch-manipulation
            min-h-[70px]
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
          backdrop-blur-sm bg-white/20 rounded-2xl
          p-3
          shadow-lg
        ">
          <div className="flex flex-col space-y-2">
            {timeOptions.map((option) => (
              <button
                key={option}
                onClick={() => {
                  handleTimeRangeSelect(option)
                  // Haptic feedback
                  if (navigator.vibrate) {
                    navigator.vibrate(50)
                  }
                }}
                className={`
                  px-4 py-3 rounded-xl
                  transition-all duration-200
                  text-sm font-medium
                  text-center
                  min-w-[100px]
                  ${selectedTimeRange === option 
                    ? 'bg-white/40 text-white shadow-md' 
                    : 'bg-white/20 text-white/80 hover:bg-white/30'
                  }
                  focus:outline-none focus:ring-2 focus:ring-white/50
                  touch-manipulation
                `}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
    </div>
      </div>
    </div>
  )
}

export default DiscoveryDial
