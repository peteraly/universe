import React from 'react'
import { EventWithAttendees } from '../types'
import { EventCard3Lane } from './EventCard3Lane'
import { useMockAuth } from '../contexts/MockAuthContext'
import { logUserEventSignal } from '../lib/aiRanking'

interface MyScheduleProps {
  events: EventWithAttendees[]
  className?: string
}

export const MySchedule: React.FC<MyScheduleProps> = ({ events, className = '' }) => {
  const { user } = useMockAuth()

  if (!events || events.length === 0) {
    return null
  }

  const handleEventUpdate = (updatedEvent: EventWithAttendees) => {
    // Log user interaction for AI learning
    if (user) {
      logUserEventSignal({
        userId: user.id,
        eventId: updatedEvent.id,
        action: 'schedule_update',
        timestamp: new Date(),
        actionId: `schedule-${updatedEvent.id}-${user.id}-${Date.now()}`,
        context: {
          section: 'my_schedule',
          position: events.findIndex(e => e.id === updatedEvent.id),
          sessionId: `session_${Date.now()}`
        }
      })
    }
  }

  return (
    <div className={`bg-surface border-b border-border ${className}`}>
      <div className="px-3 py-2">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-base font-semibold text-fg">My Schedule</h2>
          <span className="text-xs text-fg-muted">
            {events.length} event{events.length !== 1 ? 's' : ''}
          </span>
        </div>
        
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {events.map((event, index) => (
            <div 
              key={event.id} 
              className="flex-shrink-0 w-72"
              style={{ scrollSnapAlign: 'start' }}
            >
              <EventCard3Lane
                event={event}
                onStateChange={handleEventUpdate}
                className="h-full"
                compact={true}
              />
            </div>
          ))}
        </div>
        
        {events.length === 0 && (
          <div className="text-center py-4">
            <div className="text-fg-muted mb-1">
              <svg className="w-8 h-8 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-xs text-fg-muted">No upcoming events</p>
            <p className="text-xs text-fg-muted mt-0.5">Join some events to see them here</p>
          </div>
        )}
      </div>
    </div>
  )
}
