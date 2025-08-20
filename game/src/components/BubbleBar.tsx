import React, { useState, useCallback, useRef } from 'react'
import { User, Event } from '../types'
import { Check, Clock, Lock, Users, RotateCcw } from 'lucide-react'
import { EventLogicService, UserStatus } from '../lib/eventLogic'
import { deriveJoinOutcome, isJoinAction, isBlocked, isIdempotent } from '../lib/joinEligibility'

interface BubbleBarProps {
  event: Event
  currentUser?: User | null
  onStateChange?: (newEvent: Event) => void
  className?: string
}

export const BubbleBar: React.FC<BubbleBarProps> = ({
  event,
  currentUser,
  onStateChange,
  className = ''
}) => {
  const [optimisticState, setOptimisticState] = useState<'joining' | 'leaving' | 'joiningWaitlist' | 'leavingWaitlist' | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [undoTimer, setUndoTimer] = useState<number | null>(null)
  const undoTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const [focusedBubble, setFocusedBubble] = useState<number | null>(null)
  
  const maxBubblesToShow = 12
  const bubblesToShow = Math.min(event.maxSlots, maxBubblesToShow)
  const overflowCount = event.maxSlots > maxBubblesToShow ? event.maxSlots - maxBubblesToShow : 0
  const takenSlots = event.attendeeCount
  const isFull = takenSlots >= event.maxSlots
  
  // Get user state from server logic
  const userState = currentUser ? EventLogicService.getUserState(event, currentUser) : null
  
  // Get current user membership (if any) - using existing attendee/waitlist data
  const currentUserMembership = currentUser ? {
    id: 'temp',
    eventId: event.id,
    userId: currentUser.id,
    status: (event.currentUserAttendee ? 'attending' : 
            event.currentUserWaitlist ? 'waitlisted' : 'none') as 'none' | 'requested' | 'attending' | 'waitlisted' | 'blocked'
  } : null
  
  // Determine join eligibility using the new system
  const joinContext = {
    isInvited: true, // TODO: Get from invite system
    now: new Date().toISOString(),
    afterCutoff: false, // TODO: Calculate from temporal status
    passed: false, // TODO: Calculate from temporal status
    cancelled: event.cancelled || false
  }
  
  const joinEligibility = currentUser 
    ? deriveJoinOutcome(event, currentUserMembership, joinContext)
    : null
  
  // Determine interaction capabilities
  const canInteract = currentUser && !isProcessing && userState?.status !== UserStatus.HOST
  const canJoin = joinEligibility?.canTap && isJoinAction(joinEligibility.outcome) || false
  const canLeave = joinEligibility?.canTap && isIdempotent(joinEligibility.outcome) || false
  const canJoinWaitlist = joinEligibility?.canTap && joinEligibility.outcome === 'WAITLIST' || false
  const canLeaveWaitlist = joinEligibility?.canTap && joinEligibility.outcome === 'ALREADY_WAITLISTED' || false
  
  const handleBubbleClick = useCallback(async (_index: number, _isUserBubble: boolean) => {
    if (!canInteract || isProcessing || !joinEligibility) {
      console.log('🔄 Bubble click blocked - already processing or not interactive')
      return
    }
    
    setIsProcessing(true)
    
    try {
      // Handle different outcomes based on eligibility
      if (isIdempotent(joinEligibility.outcome)) {
        // User already has a status - handle leave actions
        if (joinEligibility.outcome === 'ALREADY_ATTENDING' && canLeave) {
          setOptimisticState('leaving')
          
          const result = await EventLogicService.processLeave(event, currentUser!)
          
          if (result.success) {
            const updatedEvent = {
              ...event,
              attendeeCount: Math.max(0, event.attendeeCount - 1),
              currentUserAttendee: undefined
            }
            onStateChange?.(updatedEvent)
          } else {
            setOptimisticState(null)
          }
        } else if (joinEligibility.outcome === 'ALREADY_WAITLISTED' && canLeaveWaitlist) {
          setOptimisticState('leavingWaitlist')
          
          const result = await EventLogicService.processLeaveWaitlist(event, currentUser!)
          
          if (result.success) {
            onStateChange?.(event) // Update event state
          } else {
            setOptimisticState(null)
          }
        } else {
          // Idempotent state - show current status
          // No action needed, UI should reflect current state
        }
        
      } else if (isJoinAction(joinEligibility.outcome)) {
        // User can perform a join action
        if (joinEligibility.outcome === 'ATTEND') {
          setOptimisticState('joining')
          
          // Optimistic update immediately
          const optimisticEvent = {
            ...event,
            attendeeCount: event.attendeeCount + 1,
            currentUserAttendee: { userId: currentUser!.id } as any
          }
          
          const result = await EventLogicService.processJoin(event, currentUser!)
          
          if (result.state === 'attending') {
            const finalEvent = {
              ...optimisticEvent,
              status: result.confirmed ? 'confirmed' : event.status
            }
            onStateChange?.(finalEvent)
            
            // Start undo timer (5 seconds)
            if (undoTimeoutRef.current) clearTimeout(undoTimeoutRef.current)
            undoTimeoutRef.current = setTimeout(() => {
              setUndoTimer(null)
            }, 5000)
            setUndoTimer(5)
            
          } else if (result.state === 'waitlisted') {
            // Rollback to outline - user got waitlisted
            setOptimisticState(null)
            onStateChange?.(event)
          }
          
        } else if (joinEligibility.outcome === 'WAITLIST') {
          setOptimisticState('joiningWaitlist')
          
          const result = await EventLogicService.processJoinWaitlist(event, currentUser!)
          
          if (result.state === 'waitlisted') {
            onStateChange?.(event) // Update event state
          } else {
            setOptimisticState(null)
          }
          
        } else if (joinEligibility.outcome === 'REQUEST') {
          setOptimisticState('joining') // Use joining state for request
          
          const result = await EventLogicService.requestToJoin(event, currentUser!)
          
          if (result.success) {
            onStateChange?.(event) // Update event state
          } else {
            setOptimisticState(null)
          }
        }
        
      } else if (isBlocked(joinEligibility.outcome)) {
        // User is blocked - show reason
        // No optimistic UI needed, just show blocked state
      }
      
    } catch (error) {
      console.error('Bubble click error:', error)
      setOptimisticState(null)
    } finally {
      setIsProcessing(false)
    }
  }, [canInteract, isProcessing, joinEligibility, event, currentUser, onStateChange, canLeave, canLeaveWaitlist])
  
  const handleWaitlistClick = useCallback(async () => {
    if (!canInteract || isProcessing) {
      console.log('🔄 Waitlist click blocked - already processing or not interactive')
      return
    }
    
    setIsProcessing(true)
    
    try {
      if (canLeaveWaitlist) {
        // Leave waitlist
        setOptimisticState('leavingWaitlist')
        
        const result = await EventLogicService.processLeaveWaitlist(event, currentUser!)
        
        if (result.success) {
          const updatedEvent = {
            ...event,
            waitlistCount: Math.max(0, event.waitlistCount - 1),
            currentUserWaitlist: undefined
          }
          onStateChange?.(updatedEvent)
        } else {
          setOptimisticState(null)
        }
        
      } else if (canJoinWaitlist) {
        // Join waitlist
        setOptimisticState('joiningWaitlist')
        
        const result = await EventLogicService.processJoinWaitlist(event, currentUser!)
        
        if (result.state === 'waitlisted') {
          const updatedEvent = {
            ...event,
            waitlistCount: event.waitlistCount + 1,
            currentUserWaitlist: { userId: currentUser!.id, position: result.waitlistPosition } as any
          }
          onStateChange?.(updatedEvent)
        } else {
          setOptimisticState(null)
        }
      }
    } catch (error) {
      console.error('Waitlist interaction failed:', error)
      setOptimisticState(null)
    } finally {
      setIsProcessing(false)
      setTimeout(() => setOptimisticState(null), 300)
    }
  }, [event, currentUser, canInteract, canLeaveWaitlist, canJoinWaitlist, isProcessing, onStateChange])

  // Keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent, index: number) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      const isCurrentUserSeat = event.attendees[index]?.userId === currentUser?.id
      handleBubbleClick(index, isCurrentUserSeat)
    } else if (e.key === 'ArrowRight') {
      e.preventDefault()
      setFocusedBubble(Math.min(index + 1, bubblesToShow - 1))
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault()
      setFocusedBubble(Math.max(index - 1, 0))
    }
  }, [event, currentUser, bubblesToShow, handleBubbleClick])

  return (
    <div className={`flex flex-col items-center space-y-4 ${className} ${event.status === 'confirmed' ? 'bubble-confirmed' : ''}`}>
      {/* Progress indicator */}
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className={`h-full rounded-full transition-all duration-500 ease-out ${
            event.status === 'confirmed' ? 'bg-gradient-to-r from-green-400 to-green-600' :
            isFull ? 'bg-gradient-to-r from-yellow-400 to-orange-500' :
            'bg-gradient-to-r from-blue-400 to-primary-600'
          }`}
          style={{ width: `${Math.min((takenSlots / event.maxSlots) * 100, 100)}%` }}
        />
      </div>
      
      {/* Sticky Join Area - Entire bubble bar is clickable */}
      <div 
        className={`flex flex-wrap justify-center gap-3 max-w-sm p-4 rounded-lg transition-all duration-200 ${
          canJoin ? 'cursor-pointer hover:bg-green-50 hover:scale-[1.02] active:scale-[0.98]' : ''
        }`}
        role="group" 
        aria-label={`Event seating: ${takenSlots} of ${event.maxSlots} seats filled`}
        onClick={(e) => {
          e.stopPropagation() // Prevent event bubbling
          if (canJoin && !isProcessing) {
            // Find first empty bubble and simulate click
            const firstEmptyIndex = event.attendees.findIndex((_, index) => index >= takenSlots)
            if (firstEmptyIndex !== -1 || takenSlots < event.maxSlots) {
              handleBubbleClick(takenSlots, false)
            }
          }
        }}
        title={canJoin ? 'Click anywhere to join this event' : undefined}
      >
        {Array.from({ length: bubblesToShow }, (_, index) => {
          const attendee = event.attendees[index]
          const isTaken = index < takenSlots
          const isCurrentUserSeat = attendee?.userId === currentUser?.id
          const isLoading = optimisticState === 'joining' && !isTaken && canJoin
          
          let bubbleClass = 'bubble'
          let content = ''
          let ariaLabel = ''
          
          if (isTaken) {
            if (isCurrentUserSeat) {
              bubbleClass += ' bubble-yours'
              content = currentUser?.displayName?.charAt(0).toUpperCase() || 'Y'
              ariaLabel = `Your seat (${currentUser?.displayName}). Click to leave.`
            } else {
              bubbleClass += ' bubble-taken'
              content = attendee?.user?.displayName?.charAt(0).toUpperCase() || '✓'
              ariaLabel = `Seat taken by ${attendee?.user?.displayName || 'another user'}`
            }
          } else {
            bubbleClass += ' bubble-empty'
            content = '+'
            ariaLabel = canJoin ? `Empty seat ${index + 1}. Click to join.` : `Empty seat ${index + 1}`
          }
          
          if (!canInteract || isProcessing) {
            bubbleClass += ' bubble-disabled'
          }
          
          if (isLoading) {
            bubbleClass += ' bubble-loading'
          }
          
          return (
            <button
              key={index}
              className={`${bubbleClass} ${focusedBubble === index ? 'ring-2 ring-blue-500' : ''}`}
              onClick={(e) => {
                e.stopPropagation() // Prevent event bubbling
                handleBubbleClick(index, isCurrentUserSeat)
              }}
              onKeyDown={(e) => handleKeyDown(e, index)}
              onFocus={() => setFocusedBubble(index)}
              onBlur={() => setFocusedBubble(null)}
              disabled={!canInteract || isProcessing || (!isTaken && !canJoin) || (isTaken && !isCurrentUserSeat)}
              aria-label={ariaLabel}
              title={ariaLabel}
              tabIndex={canInteract ? 0 : -1}
            >
              {isCurrentUserSeat && <Check className="w-3 h-3 absolute top-0 right-0 bg-white rounded-full p-0.5 text-primary-600" />}
              <span>{content}</span>
            </button>
          )
        })}
        
        {/* Overflow indicator */}
        {overflowCount > 0 && (
          <div className="bubble bubble-overflow" aria-label={`${overflowCount} additional seats`}>
            +{overflowCount}
          </div>
        )}
        
        {/* Smart Waitlist/Request Indicator */}
        {(event.waitlistCount > 0 || (event as any).requestCount > 0) && (
          <button
            className={`bubble bubble-waitlist ${event.currentUserWaitlist ? 'ring-2 ring-yellow-300' : ''}`}
            onClick={(e) => {
              e.stopPropagation() // Prevent event bubbling
              handleWaitlistClick()
            }}
            disabled={!canInteract || isProcessing || (!canInteract && !event.currentUserWaitlist)}
            aria-label={
              event.currentUserWaitlist 
                ? `You're on the waitlist. Click to leave waitlist.`
                : canJoinWaitlist
                  ? `Click to join waitlist or submit request.`
                  : `Waitlist/requests available`
            }
            title={
              event.currentUserWaitlist 
                ? 'You\'re waitlisted - click to leave'
                : canJoinWaitlist
                  ? 'Click to join waitlist or submit request'
                  : 'View waitlist/requests'
            }
          >
            {event.visibility === 'invite_manual' && !(event.attendeeCount >= event.maxSlots) 
              ? `R${(event as any).requestCount || 0}` 
              : `W${event.waitlistCount}`
            }
          </button>
        )}
      </div>
      
              {/* Primary CTA Button */}
        {joinEligibility && (
          <div className="mt-4 text-center">
            <button
              className={`px-6 py-2 rounded-lg font-medium transition-all duration-200 ${
                joinEligibility.canTap
                  ? 'bg-primary-600 text-white hover:bg-primary-700 active:bg-primary-800'
                  : 'bg-gray-200 text-gray-500 cursor-not-allowed'
              } ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={() => handleBubbleClick(0, false)} // Use first bubble for CTA
              disabled={!joinEligibility.canTap || isProcessing}
              aria-label={joinEligibility.message}
              title={joinEligibility.message}
            >
              {isProcessing ? 'Processing...' : joinEligibility.ctaText}
            </button>
            {joinEligibility.reason && (
              <div className="text-xs text-gray-500 mt-1">
                {joinEligibility.reason}
              </div>
            )}
          </div>
        )}
        
        {/* Status text */}
        <div className="text-center">
          <div className="text-sm font-medium text-gray-900">
            {takenSlots} of {event.maxSlots} seats filled
          </div>
        {event.waitlistCount > 0 && (
          <div className="text-xs text-yellow-600 mt-1">
            {event.waitlistCount} on waitlist
          </div>
        )}
        {event.status === 'confirmed' && (
          <div className="text-xs text-green-600 font-medium mt-1 flex items-center justify-center">
            <Check className="w-3 h-3 mr-1" />
            Event Confirmed - Game On!
          </div>
        )}
        {userState?.message && (
          <div className="text-xs text-gray-500 mt-1 flex items-center justify-center">
            {userState.status === UserStatus.JOINS_LOCKED && <Clock className="w-3 h-3 mr-1" />}
            {userState.status === UserStatus.INVITE_REQUIRED && <Lock className="w-3 h-3 mr-1" />}
            {userState.status === UserStatus.HOST && <Users className="w-3 h-3 mr-1" />}
            {userState.message}
          </div>
        )}
        
        {/* Undo timer */}
        {undoTimer !== null && (
          <div className="text-xs text-blue-600 font-medium mt-2 flex items-center justify-center">
            <RotateCcw className="w-3 h-3 mr-1" />
            Undo available ({undoTimer}s)
          </div>
        )}
      </div>
    </div>
  )
}