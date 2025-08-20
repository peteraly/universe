import React, { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { EventWithAttendees } from '../types'
import { useMockAuth } from '../contexts/MockAuthContext'
import { useToastHelpers } from '../components/Toast'
import { BubbleBar } from '../components/BubbleBar'
import { BubbleDemo } from '../components/BubbleDemo'
import { WaitlistDemo } from '../components/WaitlistDemo'
import { StatusBadge } from '../components/StatusBadge'
import { VisibilityChip } from '../components/VisibilityChip'
import { WaitlistBadge } from '../components/WaitlistBadge'
import { TemporalStatusChip } from '../components/TemporalStatusChip'
import { JoinButton } from '../components/JoinButton'
import { AttendeeList } from '../components/AttendeeList'
import { EventStatusChip } from '../components/EventStatusChip'
import { EventLogicService } from '../lib/eventLogic'
import { getTemporalStatusInfo, EventTime, formatTimeUntilStart } from '../lib/temporalStatus'
import { Calendar, MapPin, Users, ArrowLeft, Edit, Trash2 } from 'lucide-react'
import dayjs from 'dayjs'
import timezone from 'dayjs/plugin/timezone'
import utc from 'dayjs/plugin/utc'
import { getEventById, getEventAttendees, getEventWaitlist } from '../lib/mockData'

dayjs.extend(utc)
dayjs.extend(timezone)

export const EventDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const { user } = useMockAuth()
  const { showSuccess, showInfo, showWarn, showError } = useToastHelpers()
  const navigate = useNavigate()
  const [event, setEvent] = useState<EventWithAttendees | null>(null)
  const [loading, setLoading] = useState(true)
  const [cancelling, setCancelling] = useState(false)
  const [autoJoinAttempted, setAutoJoinAttempted] = useState(false)

  // Magic Join Link - Auto-join functionality
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const autoJoin = urlParams.get('t') === 'join'
    
    if (autoJoin && event && user && !autoJoinAttempted && !event.currentUserAttendee) {
      setAutoJoinAttempted(true)
      handleMagicJoin()
    }
  }, [event, user, autoJoinAttempted])

  const handleMagicJoin = async () => {
    if (!event || !user) return
    
    try {
      const result = await EventLogicService.processJoin(event, user)
      
      if (result.state === 'attending') {
        // Auto-join success
        const updatedEvent = {
          ...event,
          attendeeCount: event.attendeeCount + 1,
          currentUserAttendee: { userId: user.id } as any,
          status: result.confirmed ? 'confirmed' : event.status
        }
        setEvent(updatedEvent)
        showSuccess(`🎉 You're in for "${event.title}"!`, {
          onUndo: async () => {
            // Undo function
            const leaveResult = await EventLogicService.processLeave(updatedEvent, user)
            if (leaveResult.success) {
              setEvent(prev => prev ? {
                ...prev,
                attendeeCount: Math.max(0, prev.attendeeCount - 1),
                currentUserAttendee: undefined
              } : null)
              showInfo(`Left "${event.title}".`)
            }
          }
        })
        
        // Auto add-to-calendar
        setTimeout(() => {
          addToCalendar(event)
          showSuccess('📅 Added to calendar')
        }, 1000)
        
      } else if (result.state === 'waitlisted') {
        // Auto-waitlist
        const updatedEvent = {
          ...event,
          waitlistCount: event.waitlistCount + 1,
          currentUserWaitlist: { userId: user.id, position: result.waitlistPosition } as any
        }
        setEvent(updatedEvent)
        showWarn(`Event full — you're #${result.waitlistPosition} on waitlist`)
        
      } else {
        // Show appropriate error
        showError(result.message)
      }
    } catch (error) {
      showError('Could not join event. Try again.')
    }
  }

  const addToCalendar = (event: EventWithAttendees) => {
    // Create ICS file content
    const startDate = dayjs(event.startTime).format('YYYYMMDDTHHmmss')
    const endDate = event.endTime ? dayjs(event.endTime).format('YYYYMMDDTHHmmss') : dayjs(event.startTime).add(2, 'hour').format('YYYYMMDDTHHmmss')
    
    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//GameOn//Event//EN',
      'BEGIN:VEVENT',
      `UID:${event.id}@gameon.app`,
      `DTSTART:${startDate}`,
      `DTEND:${endDate}`,
      `SUMMARY:${event.title}`,
      `DESCRIPTION:${event.description || ''}`,
      `LOCATION:${event.location}`,
      'STATUS:CONFIRMED',
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n')

    // Create and download ICS file
    const blob = new Blob([icsContent], { type: 'text/calendar' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${event.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.ics`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  useEffect(() => {
    if (!id) return

    // Simulate loading delay
    const timer = setTimeout(() => {
      const eventData = getEventById(id)
      if (!eventData) {
        setEvent(null)
        setLoading(false)
        return
      }

      const attendees = getEventAttendees(id)
      const waitlist = getEventWaitlist(id)
      
      const currentUserAttendee = attendees.find(a => a.userId === user?.id)
      const currentUserWaitlist = waitlist.find(w => w.userId === user?.id)

      const eventWithAttendees: EventWithAttendees = {
        ...eventData,
        startTime: eventData.datetimeISO,
        attendees: attendees.map(attendee => ({
          userId: attendee.userId,
          user: { 
            id: attendee.userId, 
            displayName: `User ${attendee.userId}`,
            email: `user${attendee.userId}@example.com`,
            createdAt: new Date()
          }
        })),
        waitlist: waitlist.map((w, index) => ({
          id: `${w.eventId}_${w.userId}`,
          userId: w.userId,
          eventId: w.eventId,
          joinedAt: w.joinedAt,
          position: index + 1,
          user: { id: w.userId, displayName: `User ${w.userId}` }
        })),
        requests: [], // Initialize empty requests array
        memberships: [], // Initialize empty memberships array
        currentUserAttendee: currentUserAttendee ? {
          ...currentUserAttendee,
          id: currentUserAttendee.userId
        } : undefined,
        currentUserWaitlist: currentUserWaitlist ? {
          id: `${currentUserWaitlist.eventId}_${currentUserWaitlist.userId}`,
          userId: currentUserWaitlist.userId,
          eventId: currentUserWaitlist.eventId,
          joinedAt: currentUserWaitlist.joinedAt,
          position: waitlist.findIndex(w => w.userId === currentUserWaitlist.userId) + 1
        } : undefined,
        attendeeCount: attendees.length,
        waitlistCount: waitlist.length,
      }

      setEvent(eventWithAttendees)
      setLoading(false)
    }, 500)

    return () => clearTimeout(timer)
  }, [id, user])

  const handleCancelEvent = async () => {
    if (!event || !user || event.createdBy !== user.id) return
    
    if (!confirm('Are you sure you want to cancel this event? This action cannot be undone.')) {
      return
    }

    setCancelling(true)
    // Simulate API call
    setTimeout(() => {
      setEvent(prev => prev ? { ...prev, status: 'cancelled' } : null)
      setCancelling(false)
    }, 1000)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!event) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Event not found</h2>
        <p className="text-gray-600 mb-6">The event you're looking for doesn't exist or has been removed.</p>
        <Link to="/explore" className="btn-primary">
          Back to Explore
        </Link>
      </div>
    )
  }

  const eventDate = dayjs(event.startTime)
  const isHost = user?.id === event.createdBy
  const isPast = eventDate.isBefore(dayjs())
  
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

  return (
    <div className="max-w-4xl mx-auto">
      <BubbleDemo />
      <WaitlistDemo />
      
      {/* Header */}
      <div className="mb-6">
        <Link 
          to="/explore" 
          className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Explore
        </Link>
        
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{event.title}</h1>
            <div className="flex items-center space-x-4 mb-3 flex-wrap">
              <TemporalStatusChip 
                status={temporalInfo.status} 
                timeUntilStart={temporalInfo.timeUntilStart}
              />
              <EventStatusChip status={event.status} />
              <VisibilityChip type={event.visibility === 'invite_auto' ? 'invite_auto' : 'invite_manual'} />
              <WaitlistBadge event={event} />
              {user && (
                <StatusBadge 
                  status={EventLogicService.deriveUserStatus(event, user, {
                    attendeeExists: !!event.currentUserAttendee,
                    waitlistExists: !!event.currentUserWaitlist,
                    isInvited: true
                  })}
                />
              )}
            </div>
          </div>
          
          {isHost && !isPast && event.status !== 'cancelled' && (
            <div className="flex space-x-2">
              <button
                onClick={() => {
                  const magicLink = `${window.location.origin}/event/${event.id}?t=join`
                  navigator.clipboard.writeText(magicLink)
                  showSuccess('🔗 Magic join link copied!')
                }}
                className="btn-secondary"
              >
                <Users className="w-4 h-4 mr-2" />
                Copy Join Link
              </button>
              <button
                onClick={() => navigate('/dashboard')}
                className="btn-secondary"
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </button>
              <button
                onClick={handleCancelEvent}
                disabled={cancelling}
                className="btn-danger"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                {cancelling ? 'Cancelling...' : 'Cancel'}
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Event details */}
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Event Details</h2>
            
            <div className="space-y-4">
              <div className="flex items-start">
                <Calendar className="w-5 h-5 text-gray-500 mr-3 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-gray-900">
                    {temporalInfo.displayTime}
                  </p>
                  {timeUntilStart && temporalInfo.status === 'UPCOMING' && (
                    <p className="text-primary-600 font-medium">
                      Starts in {timeUntilStart}
                    </p>
                  )}
                  {temporalInfo.status === 'IN_PROGRESS' && (
                    <p className="text-green-600 font-medium">
                      Event is live now
                    </p>
                  )}
                  {temporalInfo.status === 'LOCKED' && (
                    <p className="text-yellow-600 font-medium">
                      {temporalInfo.reason}
                    </p>
                  )}
                  {temporalInfo.status === 'PASSED' && (
                    <p className="text-gray-500 font-medium">
                      Event has ended
                    </p>
                  )}
                  {temporalInfo.status === 'CANCELLED' && (
                    <p className="text-red-600 font-medium">
                      Event was cancelled
                    </p>
                  )}
                </div>
              </div>
              
              <div className="flex items-start">
                <MapPin className="w-5 h-5 text-gray-500 mr-3 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-gray-900">{event.location}</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <Users className="w-5 h-5 text-gray-500 mr-3 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-gray-900">
                    {event.attendeeCount} / {event.maxSlots} spots filled
                  </p>
                  {event.waitlistCount > 0 && (
                    <p className="text-gray-600">
                      {event.waitlistCount} on waitlist
                    </p>
                  )}
                </div>
              </div>
            </div>

            {event.description && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="font-medium text-gray-900 mb-2">Description</h3>
                <p className="text-gray-700 whitespace-pre-wrap">{event.description}</p>
              </div>
            )}
          </div>

          {/* Attendees */}
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Attendees</h2>
            <AttendeeList event={event} currentUser={user} />
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Join/Leave button */}
          <div className="card">
            <JoinButton 
              event={event} 
              onUpdate={() => {
                // Trigger a re-fetch of the event data
                setEvent({ ...event! })
              }}
            />
          </div>

          {/* Seat availability */}
          <div className="card">
            <h3 className="font-medium text-gray-900 mb-4">Seat Availability</h3>
            <BubbleBar
              event={event}
              currentUser={user}
              onStateChange={(updatedEvent) => {
                setEvent(updatedEvent as EventWithAttendees)
                // Show appropriate toast based on state change
                if (updatedEvent.currentUserAttendee && !event.currentUserAttendee) {
                  showSuccess(`You're in for "${event.title}"! ✨`, {
                    onUndo: async () => {
                      // Undo function - leave the event
                      const leaveResult = await EventLogicService.processLeave(updatedEvent, user!)
                      if (leaveResult.success) {
                        setEvent(prev => prev ? {
                          ...prev,
                          attendeeCount: Math.max(0, prev.attendeeCount - 1),
                          currentUserAttendee: undefined
                        } : null)
                        showInfo(`Left "${event.title}".`)
                      }
                    }
                  })
                } else if (!updatedEvent.currentUserAttendee && event.currentUserAttendee) {
                  showInfo(`Left "${event.title}".`)
                } else if (updatedEvent.currentUserWaitlist && !event.currentUserWaitlist) {
                  showWarn(`Event full — joined waitlist for "${event.title}".`)
                } else if (!updatedEvent.currentUserWaitlist && event.currentUserWaitlist) {
                  showInfo(`Left waitlist for "${event.title}".`)
                }
              }}
            />
          </div>

          {/* Host info */}
          <div className="card">
            <h3 className="font-medium text-gray-900 mb-4">Hosted by</h3>
            <div className="flex items-center">
              <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center text-primary-700 font-medium mr-3">
                {event.createdBy.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-medium text-gray-900">Event Host</p>
                <p className="text-sm text-gray-500">Created {dayjs(event.createdAt).format('MMM D, YYYY')}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
