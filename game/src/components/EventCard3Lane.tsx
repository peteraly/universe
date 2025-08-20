// EventCard3Lane - Optimized for single-view discovery and quick decisions
// Prioritizes: Title/Sport → Time → Location → Friends → CTA

import React, { useState, useCallback } from 'react'
import { 
  TemporalStatus,
  deriveTemporalStatus,
  deriveEventStatus,
  deriveMyStatus,
  nextAction,
  NextAction
} from '../lib/status'
import { EventStatus, EventVisibility, MembershipStatus } from '../types'
import { EventWithAttendees } from '../types'
import { useMockAuth } from '../contexts/MockAuthContext'
import { useEventState } from '../contexts/EventStateContext'
import { useToastHelpers } from '../components/Toast'
import { eventAPI } from '../lib/api'
import { getEventReason } from '../lib/feedPolicy'
import { mockConnections } from '../lib/mockData'
import { 
  Calendar, 
  MapPin, 
  Users, 
  Clock, 
  Lock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Star
} from 'lucide-react'
import dayjs from 'dayjs'

// Component Props Interface
interface EventCard3LaneProps {
  event: EventWithAttendees
  onStateChange: (newEvent: EventWithAttendees) => void
  aiReasons?: string[]
  aiConfidence?: number
  compact?: boolean
  showReason?: boolean
  showNewBadge?: boolean
  showSpotsOpenedBadge?: boolean
  isPrimary?: boolean // For main stack vs horizontal feed
}

// Compact Status Badge Component
interface CompactStatusBadgeProps {
  status: EventStatus
  temporalStatus: TemporalStatus
  isUrgent?: boolean
}

const CompactStatusBadge: React.FC<CompactStatusBadgeProps> = ({ status, temporalStatus, isUrgent = false }) => {
  const getStatusConfig = () => {
    if (isUrgent) {
      return {
        label: 'URGENT',
        color: 'bg-red-500 text-white',
        icon: Clock,
        ariaLabel: 'Status: Urgent - Starting soon'
      }
    }
    
    switch (status) {
      case 'confirmed':
        return {
          label: 'CONFIRMED',
          color: 'bg-green-500 text-white',
          icon: CheckCircle,
          ariaLabel: 'Status: Confirmed'
        }
      case 'cancelled':
        return {
          label: 'CANCELLED',
          color: 'bg-red-500 text-white',
          icon: XCircle,
          ariaLabel: 'Status: Cancelled'
        }
      default:
        return {
          label: 'PENDING',
          color: 'bg-yellow-500 text-white',
          icon: AlertCircle,
          ariaLabel: 'Status: Pending'
        }
    }
  }

  const config = getStatusConfig()
  const Icon = config.icon

  return (
    <div 
      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold ${config.color}`}
      aria-label={config.ariaLabel}
    >
      <Icon className="w-3 h-3" />
      {config.label}
    </div>
  )
}

// Friend Count Component
interface FriendCountProps {
  friendCount: number
  isCompact?: boolean
}

const FriendCount: React.FC<FriendCountProps> = ({ friendCount, isCompact = false }) => {
  if (friendCount === 0) return null

  return (
    <div className={`flex items-center gap-1 ${isCompact ? 'text-xs' : 'text-sm'} text-blue-600 font-medium`}>
      <Users className={isCompact ? "w-3 h-3" : "w-4 h-4"} />
      <span>{friendCount} friend{friendCount !== 1 ? 's' : ''}</span>
    </div>
  )
}

// Main EventCard3Lane Component
export const EventCard3Lane: React.FC<EventCard3LaneProps> = ({ 
  event: initialEvent, 
  onStateChange,
  aiReasons,
  aiConfidence,
  compact = false,
  showReason = false,
  showNewBadge = false,
  showSpotsOpenedBadge = false,
  isPrimary = false
}) => {
  // Defensive check for invalid event
  if (!initialEvent) {
    console.warn('EventCard3Lane: Invalid event provided', initialEvent)
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="text-center text-gray-500">
          <p>Loading event...</p>
        </div>
      </div>
    )
  }

  const { user } = useMockAuth()
  const { joinEvent, leaveEvent } = useEventState()
  const [isPending, setIsPending] = useState(false)
  const toast = useToastHelpers()
  
  // Use the event from global state if available, otherwise use initialEvent
  const event = initialEvent

  // Safely construct eventTime object with fallbacks
  const eventTime = {
    startAt: event.startAt || event.startTime,
    tz: event.tz || 'America/New_York',
    endAt: event.endAt,
    durationMinutes: event.durationMinutes,
    cutoffMinutes: event.cutoffMinutes
  }
  const temporalStatus = deriveTemporalStatus(eventTime)
  
  // Derive current status and next action using the centralized logic
  const myStatus = deriveMyStatus(user?.id || '', event)
  const nextActionData = nextAction(user?.id || '', event)
  
  // Calculate friend count
  const friendCount = event.memberships?.filter(m => 
    m.userId !== user?.id && 
    mockConnections.some((conn: any) => 
      (conn.userId1 === user?.id && conn.userId2 === m.userId) ||
      (conn.userId2 === user?.id && conn.userId1 === m.userId)
    )
  ).length || 0

  // Check if event is urgent (starting within 2 hours)
  const isUrgent = temporalStatus === 'upcoming' && dayjs(event.startAt || event.startTime).diff(dayjs(), 'hour') < 2

  // Handle CTA click with global state management
  const handleCTAClick = useCallback(async () => {
    if (nextActionData.disabled || isPending || !user) return

    setIsPending(true)

    try {
      switch (nextActionData.action) {
        case 'join':
          await joinEvent(event.id, user.id)
          toast.showJoinedSuccess()
          break
          
        case 'leave':
          await leaveEvent(event.id, user.id)
          toast.showLeftSuccess()
          break
          
        case 'joinWaitlist':
          // For now, treat as join - can be enhanced later
          await joinEvent(event.id, user.id)
          toast.showJoinedWaitlist(1)
          break
          
        case 'leaveWaitlist':
          // For now, treat as leave - can be enhanced later
          await leaveEvent(event.id, user.id)
          toast.showLeftSuccess()
          break
          
        case 'request':
          toast.showRequestSent()
          break
          
        default:
          break
      }
    } catch (error) {
      console.error('CTA action failed:', error)
      toast.showError('Failed to complete action. Try again.')
    } finally {
      setIsPending(false)
    }
  }, [nextActionData, isPending, user, event.id, joinEvent, leaveEvent, toast])

  // Format date/time for display
  const formatDateTime = () => {
    const startTime = dayjs(event.startAt || event.startTime)
    const now = dayjs()
    const hoursUntilStart = startTime.diff(now, 'hour')
    
    if (hoursUntilStart < 1) {
      return `In ${startTime.diff(now, 'minute')}m`
    } else if (hoursUntilStart < 24) {
      return `Today ${startTime.format('h:mm A')}`
    } else if (hoursUntilStart < 48) {
      return `Tomorrow ${startTime.format('h:mm A')}`
    } else {
      return startTime.format('ddd, MMM D • h:mm A')
    }
  }

  // Format location
  const formatLocation = () => {
    if (!event.location) return 'Location TBD'
    return event.location.length > 20 ? `${event.location.substring(0, 20)}...` : event.location
  }

  // Determine CTA styling based on urgency and action
  const getCTAStyling = () => {
    if (isUrgent) {
      return 'bg-red-600 hover:bg-red-700 text-white font-bold'
    }
    
    if (nextActionData.action === 'join') {
      return 'bg-blue-600 hover:bg-blue-700 text-white font-semibold'
    }
    
    if (nextActionData.action === 'leave') {
      return 'bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold'
    }
    
    return 'bg-gray-500 hover:bg-gray-600 text-white font-semibold'
  }

  if (isPrimary) {
    // Primary card design - larger, more prominent
    return (
      <div className="bg-white border-2 border-gray-200 rounded-xl p-6 shadow-lg">
        {/* Header with status and badges */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <CompactStatusBadge 
              status={event.status} 
              temporalStatus={temporalStatus}
              isUrgent={isUrgent}
            />
            {showNewBadge && (
              <div className="bg-purple-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                NEW
              </div>
            )}
            {showSpotsOpenedBadge && (
              <div className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                SPOTS OPENED
              </div>
            )}
          </div>
          <FriendCount friendCount={friendCount} />
        </div>

        {/* Main content */}
        <div className="mb-6">
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            {event.title}
          </h3>
          {event.description && (
            <p className="text-gray-600 mb-3">{event.description}</p>
          )}
          
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>{formatDateTime()}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              <span>{formatLocation()}</span>
            </div>
          </div>
        </div>

        {/* CTA Button */}
        <button
          className={`w-full py-4 px-6 rounded-lg font-semibold text-lg transition-all duration-200 ${getCTAStyling()}`}
          onClick={handleCTAClick}
          disabled={nextActionData.disabled || isPending}
          aria-label={nextActionData.reason ? `${nextActionData.label} - ${nextActionData.reason}` : nextActionData.label}
        >
          {isPending ? 'Processing...' : nextActionData.label}
        </button>

        {/* Reason hint */}
        {showReason && nextActionData.reason && (
          <p className="text-xs text-gray-500 mt-2 text-center">
            {nextActionData.reason}
          </p>
        )}
      </div>
    )
  }

  // Compact card design for horizontal feed
  return (
    <div className={`bg-white border border-gray-200 rounded-lg transition-all duration-200 ${compact ? 'p-3' : 'p-4'} min-w-[280px]`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <CompactStatusBadge 
            status={event.status} 
            temporalStatus={temporalStatus}
            isUrgent={isUrgent}
          />
          {showNewBadge && (
            <div className="bg-purple-500 text-white px-1.5 py-0.5 rounded-full text-xs font-bold">
              NEW
            </div>
          )}
        </div>
        <FriendCount friendCount={friendCount} isCompact={true} />
      </div>

      {/* Main content */}
      <div className="mb-3">
                 <h4 className="font-bold text-gray-900 mb-1 line-clamp-1">
           {event.title}
         </h4>
         {event.description && (
           <p className="text-sm text-gray-600 mb-2">{event.description}</p>
         )}
        
        <div className="space-y-1 text-xs text-gray-600">
          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            <span>{formatDateTime()}</span>
          </div>
          <div className="flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            <span>{formatLocation()}</span>
          </div>
        </div>
      </div>

      {/* CTA Button */}
      <button
        className={`w-full py-2 px-4 rounded-md font-medium text-sm transition-all duration-200 ${getCTAStyling()}`}
        onClick={handleCTAClick}
        disabled={nextActionData.disabled || isPending}
        aria-label={nextActionData.reason ? `${nextActionData.label} - ${nextActionData.reason}` : nextActionData.label}
      >
        {isPending ? 'Processing...' : nextActionData.label}
      </button>
    </div>
  )
}
