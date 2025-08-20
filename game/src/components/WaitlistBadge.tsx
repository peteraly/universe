import React from 'react'
import { Event } from '../types'
import { Clock, Users, UserCheck, Lock } from 'lucide-react'
import dayjs from 'dayjs'

interface WaitlistBadgeProps {
  event: Event
  className?: string
}

export const WaitlistBadge: React.FC<WaitlistBadgeProps> = ({
  event,
  className = ''
}) => {
  const isFull = event.attendeeCount >= event.maxSlots
  const cutoffTime = dayjs(event.startTime).subtract(event.cutoffMinutes || 30, 'minute')
  const isPastCutoff = dayjs().isAfter(cutoffTime)
  
  // Don't show any badge if no waitlist/requests
  if (event.waitlistCount === 0 && (event as any).requestCount === 0) {
    return null
  }

  // Cutoff freeze - show locked state
  if (isPastCutoff) {
    return (
      <div className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200 ${className}`}>
        <Lock className="w-3 h-3 mr-1.5" />
        Locked
      </div>
    )
  }

  // Handle different visibility modes
  if (event.visibility === 'invite_manual') {
    if (!isFull && (event as any).requestCount > 0) {
      // Manual mode, not full - show pending requests
      return (
        <div className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200 ${className}`}>
          <Clock className="w-3 h-3 mr-1.5" />
          Requests pending: {(event as any).requestCount || 0}
        </div>
      )
    } else if (isFull && event.waitlistCount > 0) {
      // Manual mode, full - show accepted users on waitlist
      return (
        <div className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-200 ${className}`}>
          <UserCheck className="w-3 h-3 mr-1.5" />
          Waitlist: {event.waitlistCount} (accepted)
        </div>
      )
    }
  } else {
    // Public or invite_auto modes
    if (isFull && event.waitlistCount > 0) {
      return (
        <div className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-200 ${className}`}>
          <Users className="w-3 h-3 mr-1.5" />
          Waitlist: {event.waitlistCount}
        </div>
      )
    }
  }

  return null
}
