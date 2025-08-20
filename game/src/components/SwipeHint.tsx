import React, { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface SwipeHintProps {
  onDismiss?: () => void
}

export const SwipeHint: React.FC<SwipeHintProps> = ({ onDismiss }) => {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    // Auto-dismiss after 5 seconds
    const timer = setTimeout(() => {
      setIsVisible(false)
      onDismiss?.()
    }, 5000)

    return () => clearTimeout(timer)
  }, [onDismiss])

  if (!isVisible) return null

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 px-6 py-4 flex items-center space-x-4 animate-fadeIn">
        <div className="flex items-center space-x-2">
          <ChevronLeft className="w-5 h-5 text-gray-400 swipe-hint" />
          <span className="text-sm font-medium text-gray-700">Swipe to explore</span>
          <ChevronRight className="w-5 h-5 text-gray-400 swipe-hint" />
        </div>
        <button
          onClick={() => {
            setIsVisible(false)
            onDismiss?.()
          }}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  )
}
