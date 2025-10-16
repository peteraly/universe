import { useRef, useCallback } from 'react'

export const useSwipe = (onSwipe) => {
  const touchStartRef = useRef(null)
  const touchEndRef = useRef(null)

  const handleTouchStart = useCallback((e) => {
    touchStartRef.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
      time: Date.now()
    }
  }, [])

  const handleTouchMove = useCallback((e) => {
    if (!touchStartRef.current) return
    
    touchEndRef.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
      time: Date.now()
    }
  }, [])

  const handleTouchEnd = useCallback((e) => {
    if (!touchStartRef.current || !touchEndRef.current) return

    const deltaX = touchEndRef.current.x - touchStartRef.current.x
    const deltaY = touchEndRef.current.y - touchStartRef.current.y
    const deltaTime = touchEndRef.current.time - touchStartRef.current.time

    // Minimum swipe distance and maximum time
    const minDistance = 50
    const maxTime = 500

    if (deltaTime > maxTime) return

    // Determine swipe direction
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      // Horizontal swipe
      if (Math.abs(deltaX) > minDistance) {
        if (deltaX > 0) {
          onSwipe('right')
        } else {
          onSwipe('left')
        }
      }
    } else {
      // Vertical swipe
      if (Math.abs(deltaY) > minDistance) {
        if (deltaY > 0) {
          onSwipe('down')
        } else {
          onSwipe('up')
        }
      }
    }

    // Reset refs
    touchStartRef.current = null
    touchEndRef.current = null
  }, [onSwipe])

  return {
    onTouchStart: handleTouchStart,
    onTouchMove: handleTouchMove,
    onTouchEnd: handleTouchEnd
  }
}


