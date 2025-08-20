import React from 'react'
import { EventWithAttendees } from '../types'
import { Users, ChevronRight } from 'lucide-react'

interface FriendsStripProps {
  events: EventWithAttendees[]
  userConnections: string[]
  onEventClick?: (event: EventWithAttendees) => void
  className?: string
}

export const FriendsStrip: React.FC<FriendsStripProps> = ({
  events,
  userConnections,
  onEventClick,
  className = ''
}) => {
  // Find events with friends attending
  const eventsWithFriends = events
    .filter(event => {
      const friendsAttending = event.attendees?.filter(a => 
        userConnections.includes(a.userId)
      ) || []
      return friendsAttending.length > 0
    })
    .slice(0, 5) // Limit to top 5 for carousel

  if (eventsWithFriends.length === 0) return null

  return (
    <div className={`bg-accent-50 border-b border-accent-100 ${className}`}>
      <div className="px-4 py-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-accent-600" />
            <span className="text-sm font-medium text-accent-900">
              Friends are in
            </span>
          </div>
          <ChevronRight className="w-4 h-4 text-accent-600" />
        </div>
        
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          {eventsWithFriends.map(event => {
            const friendsCount = event.attendees?.filter(a => 
              userConnections.includes(a.userId)
            ).length || 0
            
            return (
              <button
                key={event.id}
                onClick={() => onEventClick?.(event)}
                className="flex-shrink-0 bg-white rounded-lg border border-accent-200 p-3 min-w-0 hover:border-accent-300 transition-colors"
              >
                <div className="text-left">
                  <div className="text-xs font-medium text-accent-900 truncate mb-1">
                    {event.title}
                  </div>
                  <div className="text-xs text-accent-600">
                    {friendsCount} friend{friendsCount !== 1 ? 's' : ''} • {event.location}
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
