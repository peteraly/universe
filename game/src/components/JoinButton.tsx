import React, { useState } from 'react'
import { EventWithAttendees } from '../types'
import { useMockAuth } from '../contexts/MockAuthContext'
import { useToastHelpers } from './Toast'
import { Clock, CheckCircle, XCircle } from 'lucide-react'

interface JoinButtonProps {
  event: EventWithAttendees
  onUpdate: () => void
  className?: string
}

export const JoinButton: React.FC<JoinButtonProps> = ({
  event,
  onUpdate,
  className = ''
}) => {
  const { user } = useMockAuth()
  const { showSuccess, showInfo } = useToastHelpers()
  const [loading, setLoading] = useState(false)
  
  if (!user) {
    return (
      <button 
        className={`btn-primary w-full ${className}`}
        onClick={() => window.location.href = '/login'}
      >
        Sign in to join
      </button>
    )
  }

  const isAttending = event.currentUserAttendee
  const isWaitlisted = event.currentUserWaitlist
  const isFull = event.attendeeCount >= event.maxSlots
  const isPast = new Date(event.startTime) < new Date()
  const isHost = event.createdBy === user.id

  if (isPast) {
    return (
      <button className={`btn-secondary w-full ${className}`} disabled>
        Event has passed
      </button>
    )
  }

  if (isHost) {
    return (
      <button className={`btn-secondary w-full ${className}`} disabled>
        You're hosting this event
      </button>
    )
  }

  const handleJoin = async (e: React.MouseEvent) => {
    e.stopPropagation() // Prevent event bubbling
    if (loading) return
    
    setLoading(true)
    // Simulate API call
    setTimeout(() => {
      onUpdate()
      setLoading(false)
      showSuccess(`Successfully joined "${event.title}"!`)
    }, 1000)
  }

  const handleLeave = async (e: React.MouseEvent) => {
    e.stopPropagation() // Prevent event bubbling
    if (loading) return
    
    setLoading(true)
    // Simulate API call
    setTimeout(() => {
      onUpdate()
      setLoading(false)
      showInfo(`Left "${event.title}"`)
    }, 1000)
  }

  if (isAttending) {
    return (
      <button 
        onClick={handleLeave}
        disabled={loading}
        className={`btn-leave w-full flex items-center justify-center space-x-2 ${className}`}
      >
        <XCircle className="w-4 h-4" />
        <span>{loading ? 'Leaving...' : 'Leave Event'}</span>
      </button>
    )
  }

  if (isWaitlisted) {
    return (
      <button 
        onClick={handleLeave}
        disabled={loading}
        className={`btn-leave w-full flex items-center justify-center space-x-2 ${className}`}
      >
        <Clock className="w-4 h-4" />
        <span>{loading ? 'Removing...' : `Leave Waitlist (#${isWaitlisted.position})`}</span>
      </button>
    )
  }

  if (isFull) {
    return (
      <button 
        onClick={handleJoin}
        disabled={loading}
        className={`btn-waitlist w-full flex items-center justify-center space-x-2 ${className}`}
      >
        <Clock className="w-4 h-4" />
        <span>{loading ? 'Joining...' : 'Join Waitlist'}</span>
      </button>
    )
  }

  return (
    <button 
      onClick={handleJoin}
      disabled={loading}
      className={`btn-join w-full flex items-center justify-center space-x-2 ${className}`}
    >
      <CheckCircle className="w-4 h-4" />
      <span>{loading ? 'Joining...' : 'Join Event'}</span>
    </button>
  )
}
