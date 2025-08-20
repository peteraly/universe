import React from 'react'
import { EventWithAttendees } from '../types'
import { EventCard3Lane } from './EventCard3Lane'
import { useMockAuth } from '../contexts/MockAuthContext'
import { logUserEventSignal } from '../lib/aiRanking'
import { FeedSection as FeedSectionType } from '../lib/feedPolicy'

interface FeedSectionProps {
  section: FeedSectionType
  className?: string
}

export const FeedSection: React.FC<FeedSectionProps> = ({ section, className = '' }) => {
  const { user } = useMockAuth()

  if (!section.events || section.events.length === 0) {
    return null
  }

  const handleEventUpdate = (updatedEvent: EventWithAttendees) => {
    // Log user interaction for AI learning
    if (user) {
      logUserEventSignal({
        userId: user.id,
        eventId: updatedEvent.id,
        action: 'join',
        timestamp: new Date(),
        actionId: `section-${section.type}-${updatedEvent.id}-${user.id}-${Date.now()}`,
        context: {
          position: section.events.findIndex(e => e.id === updatedEvent.id),
          sessionId: `session_${Date.now()}`
        }
      })
    }
  }

  const getSectionIcon = () => {
    switch (section.type) {
      case 'spots-opened':
        return (
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )
      case 'from-hosts':
        return (
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        )
      case 'new-today':
        return (
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        )
      default:
        return null
    }
  }

  const getSectionColor = () => {
    switch (section.type) {
      case 'spots-opened':
        return 'text-green-600 bg-green-50 border-green-200'
      case 'from-hosts':
        return 'text-blue-600 bg-blue-50 border-blue-200'
      case 'new-today':
        return 'text-purple-600 bg-purple-50 border-purple-200'
      default:
        return 'text-fg-muted bg-bg-muted border-border'
    }
  }

  return (
    <div className={`bg-surface border-b border-border ${className}`}>
      <div className="px-3 py-2">
        <div className="flex items-center gap-2 mb-2">
          <div className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-xs font-medium border ${getSectionColor()}`}>
            {getSectionIcon()}
            {section.title}
          </div>
          <span className="text-xs text-fg-muted">
            {section.events.length} event{section.events.length !== 1 ? 's' : ''}
          </span>
        </div>
        
        <div className="space-y-2">
          {section.events.map((event, index) => (
            <div key={event.id}>
              <EventCard3Lane
                event={event}
                onStateChange={handleEventUpdate}
                showReason={true}
                showNewBadge={section.type === 'new-today'}
                showSpotsOpenedBadge={section.type === 'spots-opened'}
                compact={true}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
