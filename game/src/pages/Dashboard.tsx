import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { EventWithAttendees } from '../types'
import { useMockAuth } from '../contexts/MockAuthContext'
import { useEventState } from '../contexts/EventStateContext'
import { EventCard3Lane } from '../components/EventCard3Lane'
import { getEventsWithAttendees } from '../lib/mockData'

import { Calendar, Plus, Users, Clock, Zap } from 'lucide-react'
import dayjs from 'dayjs'
import timezone from 'dayjs/plugin/timezone'
import utc from 'dayjs/plugin/utc'

dayjs.extend(utc)
dayjs.extend(timezone)

export const Dashboard: React.FC = () => {
  const { user } = useMockAuth()
  const { state: eventState, getUserEvents, getAvailableEvents } = useEventState()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return

    // Simulate loading delay
    const timer = setTimeout(() => {
      setLoading(false)
    }, 500)

    return () => clearTimeout(timer)
  }, [user])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  // Get events from global state
  const joinedEvents = getUserEvents(user?.id || '')
  const availableEvents = getAvailableEvents(user?.id || '')
  
  // Filter hosted events from global state
  const hostedEvents = eventState.events.filter(event => event.createdBy === user?.id)
  
  // Smart "Next Up" ordering - top 3 most relevant available events
  const nextUpEvents = availableEvents
    .filter(event => dayjs(event.startAt || event.startTime).isAfter(dayjs()))
    .slice(0, 3)
  
  const upcomingHosted = hostedEvents.filter(e => dayjs(e.startAt || e.startTime).isAfter(dayjs()))
  const pastHosted = hostedEvents.filter(e => dayjs(e.startAt || e.startTime).isBefore(dayjs()))
  const upcomingJoined = joinedEvents.filter(e => dayjs(e.startAt || e.startTime).isAfter(dayjs()))
  const pastJoined = joinedEvents.filter(e => dayjs(e.startAt || e.startTime).isBefore(dayjs()))

  // Quick join functionality now handled by EventCard3Lane component

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-h1 text-gray-900 mb-2">Dashboard</h1>
        <p className="text-body text-gray-600">Manage your events and see what you're attending</p>
      </div>

      {/* Next Up - Fast-Path Joins */}
      {nextUpEvents.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <Zap className="w-6 h-6 text-yellow-500 mr-2" />
            <h2 className="text-h3 text-gray-900">Next Up</h2>
            <span className="ml-2 text-sm text-gray-500">• One-tap join</span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {nextUpEvents.map(event => (
              <EventCard3Lane
                key={event.id}
                event={event}
                className="h-full"
              />
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Hosted Events */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-h2 text-gray-900">Events You're Hosting</h2>
            <Link to="/create" className="btn-primary">
              <Plus className="w-4 h-4 mr-2" />
              Create Event
            </Link>
          </div>

          {upcomingHosted.length === 0 && pastHosted.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg border-2 border-dashed border-gray-300">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No events yet</h3>
              <p className="text-gray-600 mb-4">Create your first event to get started</p>
              <Link to="/create" className="btn-primary">
                Create Event
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {upcomingHosted.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                    <Clock className="w-5 h-5 mr-2 text-green-600" />
                    Upcoming ({upcomingHosted.length})
                  </h3>
                  <div className="space-y-4">
                    {upcomingHosted.map(event => (
                      <EventCard3Lane
                        key={event.id}
                        event={event}
                      />
                    ))}
                  </div>
                </div>
              )}

              {pastHosted.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Past Events ({pastHosted.length})</h3>
                  <div className="space-y-4">
                    {pastHosted.map(event => (
                      <EventCard3Lane
                        key={event.id}
                        event={event}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Joined Events */}
        <div>
          <h2 className="text-h2 text-gray-900 mb-6">Events You're Attending</h2>

          {upcomingJoined.length === 0 && pastJoined.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg border-2 border-dashed border-gray-300">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Not attending any events</h3>
              <p className="text-gray-600 mb-4">Explore events to join and connect with others</p>
              <Link to="/explore" className="btn-primary">
                Explore Events
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {upcomingJoined.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                    <Clock className="w-5 h-5 mr-2 text-green-600" />
                    Upcoming ({upcomingJoined.length})
                  </h3>
                  <div className="space-y-4">
                    {upcomingJoined.map(event => (
                      <EventCard3Lane
                        key={event.id}
                        event={event}
                      />
                    ))}
                  </div>
                </div>
              )}

              {pastJoined.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Past Events ({pastJoined.length})</h3>
                  <div className="space-y-4">
                    {pastJoined.map(event => (
                      <EventCard3Lane
                        key={event.id}
                        event={event}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
