import React from 'react'
import { Link } from 'react-router-dom'
import { Calendar, MapPin, Users, ArrowRight } from 'lucide-react'
import dayjs from 'dayjs'
import timezone from 'dayjs/plugin/timezone'
import utc from 'dayjs/plugin/utc'

dayjs.extend(utc)
dayjs.extend(timezone)
import { Event, User } from '../types'
import { BubbleBar } from './BubbleBar'
import { EventStatusChip } from './EventStatusChip'
import { VisibilityChip } from './VisibilityChip'
import { WaitlistBadge } from './WaitlistBadge'
import { TemporalStatusChip } from './TemporalStatusChip'
import { getTemporalStatusInfo, EventTime, formatTimeUntilStart } from '../lib/temporalStatus'

interface EventCardProps {
  event: Event
  attendees: Array<{ userId: string; user?: User }>
  currentUser?: User | null
  className?: string
}

export const EventCard: React.FC<EventCardProps> = ({
  event,
  attendees,
  currentUser,
  className = ''
}) => {


  // Get temporal status info
  const eventTime: EventTime = {
    startAt: event.startAt || event.startTime,
    endAt: event.endAt,
    durationMinutes: event.durationMinutes,
    cutoffMinutes: event.cutoffMinutes,
    cancelled: event.cancelled,
    tz: event.tz
  }
  const temporalInfo = getTemporalStatusInfo(eventTime)
  const timeUntilStart = formatTimeUntilStart(eventTime)

  const isCurrentUserAttending = currentUser && attendees.some(a => a.userId === currentUser.id)

  return (
    <Link 
      to={`/event/${event.id}`}
      className={`block event-card group ${className}`}
    >
      {/* Event Header */}
      <div className="flex justify-between items-start mb-6">
        <div className="flex-1">
          <h3 className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors line-clamp-2">
            {event.title}
          </h3>
          <div className="flex items-center space-x-3 flex-wrap">
            <TemporalStatusChip 
              status={temporalInfo.status} 
              timeUntilStart={temporalInfo.timeUntilStart}
            />
            <EventStatusChip status={event.status} />
            <VisibilityChip type={event.visibility === 'invite_auto' ? 'invite_auto' : 'invite_manual'} />
            <WaitlistBadge event={event} />
            {(event as any).category && (
              <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                {(event as any).category}
              </span>
            )}
          </div>
        </div>
        <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-primary-600 group-hover:translate-x-1 transition-all" />
      </div>

      {/* Event Details */}
      <div className="space-y-4 mb-6">
        <div className="flex items-center text-gray-700">
          <Calendar className="w-5 h-5 mr-3 text-primary-600" />
          <div>
            <span className="font-medium">
              {temporalInfo.displayTime}
            </span>
            {timeUntilStart && temporalInfo.status === 'UPCOMING' && (
              <span className="text-primary-600 ml-2 font-medium">• {timeUntilStart}</span>
            )}
            {temporalInfo.status === 'IN_PROGRESS' && (
              <span className="text-green-600 ml-2 font-medium">• Live now</span>
            )}
          </div>
        </div>
        
        <div className="flex items-center text-gray-700">
          <MapPin className="w-5 h-5 mr-3 text-primary-600" />
          <span className="font-medium line-clamp-1">{event.location}</span>
        </div>
      </div>

      {/* Capacity Section */}
      <div className="border-t border-gray-100 pt-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Users className="w-5 h-5 text-gray-600" />
            <span className="font-medium text-gray-900">Capacity</span>
          </div>
          <div className="flex items-center space-x-3">
            <span className="text-sm text-gray-500">
              {attendees.length} of {event.maxSlots} filled
            </span>
            {isCurrentUserAttending && (
              <span className="text-xs bg-primary-100 text-primary-700 px-2 py-1 rounded-full font-medium">
                You're in!
              </span>
            )}
          </div>
        </div>
        
        <BubbleBar
          event={event}
          currentUser={currentUser}
        />
      </div>
    </Link>
  )
}
