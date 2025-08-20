import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react'
import { EventWithAttendees } from '../types'
import { useMockAuth } from './MockAuthContext'

// Action types for state management
type EventAction = 
  | { type: 'SET_EVENTS'; payload: EventWithAttendees[] }
  | { type: 'UPDATE_EVENT'; payload: EventWithAttendees }
  | { type: 'JOIN_EVENT'; payload: { eventId: string; userId: string } }
  | { type: 'LEAVE_EVENT'; payload: { eventId: string; userId: string } }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }

// State interface
interface EventState {
  events: EventWithAttendees[]
  loading: boolean
  error: string | null
  lastUpdated: Date | null
}

// Initial state
const initialState: EventState = {
  events: [],
  loading: false,
  error: null,
  lastUpdated: null
}

// Reducer function for state updates
function eventReducer(state: EventState, action: EventAction): EventState {
  switch (action.type) {
    case 'SET_EVENTS':
      return {
        ...state,
        events: action.payload,
        loading: false,
        error: null,
        lastUpdated: new Date()
      }
    
    case 'UPDATE_EVENT':
      return {
        ...state,
        events: state.events.map(event => 
          event.id === action.payload.id ? action.payload : event
        ),
        lastUpdated: new Date()
      }
    
    case 'JOIN_EVENT':
      return {
        ...state,
        events: state.events.map(event => {
          if (event.id === action.payload.eventId) {
            // Create new membership for the user
            const newMembership = {
              id: `membership_${action.payload.userId}_${event.id}`,
              userId: action.payload.userId,
              eventId: event.id,
              status: 'attending' as const,
              joinedAt: new Date().toISOString(),
              waitlistOrder: null
            }
            
            // Add user to memberships if not already present
            const existingMembership = event.memberships?.find(m => m.userId === action.payload.userId)
            const updatedMemberships = existingMembership 
              ? event.memberships?.map(m => m.userId === action.payload.userId ? newMembership : m)
              : [...(event.memberships || []), newMembership]
            
            return {
              ...event,
              attendeeCount: event.attendeeCount + 1,
              memberships: updatedMemberships,
              currentUserMembership: newMembership,
              updatedAt: new Date().toISOString()
            }
          }
          return event
        }),
        lastUpdated: new Date()
      }
    
    case 'LEAVE_EVENT':
      return {
        ...state,
        events: state.events.map(event => {
          if (event.id === action.payload.eventId) {
            // Remove user from memberships
            const updatedMemberships = event.memberships?.filter(m => m.userId !== action.payload.userId) || []
            
            return {
              ...event,
              attendeeCount: Math.max(0, event.attendeeCount - 1),
              memberships: updatedMemberships,
              currentUserMembership: null,
              updatedAt: new Date().toISOString()
            }
          }
          return event
        }),
        lastUpdated: new Date()
      }
    
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload
      }
    
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        loading: false
      }
    
    default:
      return state
  }
}

// Context interface
interface EventStateContextType {
  state: EventState
  dispatch: React.Dispatch<EventAction>
  
  // Convenience methods
  joinEvent: (eventId: string, userId: string) => Promise<void>
  leaveEvent: (eventId: string, userId: string) => Promise<void>
  updateEvent: (event: EventWithAttendees) => void
  setEvents: (events: EventWithAttendees[]) => void
  
  // Computed values
  getUserEvents: (userId: string) => EventWithAttendees[]
  getAvailableEvents: (userId: string) => EventWithAttendees[]
  getEventById: (eventId: string) => EventWithAttendees | undefined
}

// Create context
const EventStateContext = createContext<EventStateContextType | undefined>(undefined)

// Provider component
interface EventStateProviderProps {
  children: ReactNode
}

export const EventStateProvider: React.FC<EventStateProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(eventReducer, initialState)
  const { user } = useMockAuth()

  // Simulated API calls
  const joinEventAPI = async (eventId: string, userId: string): Promise<EventWithAttendees> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // Find the event and create updated version
    const event = state.events.find(e => e.id === eventId)
    if (!event) {
      throw new Error('Event not found')
    }
    
    // Check if user is already a member
    const existingMembership = event.memberships?.find(m => m.userId === userId)
    if (existingMembership) {
      throw new Error('User is already a member of this event')
    }
    
    // Create new membership
    const newMembership = {
      id: `membership_${userId}_${eventId}`,
      userId,
      eventId,
      status: 'attending' as const,
      joinedAt: new Date().toISOString(),
      waitlistOrder: null
    }
    
    // Return updated event
    return {
      ...event,
      attendeeCount: event.attendeeCount + 1,
      memberships: [...(event.memberships || []), newMembership],
      currentUserMembership: newMembership,
      updatedAt: new Date().toISOString()
    }
  }

  const leaveEventAPI = async (eventId: string, userId: string): Promise<EventWithAttendees> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // Find the event and create updated version
    const event = state.events.find(e => e.id === eventId)
    if (!event) {
      throw new Error('Event not found')
    }
    
    // Check if user is a member
    const existingMembership = event.memberships?.find(m => m.userId === userId)
    if (!existingMembership) {
      throw new Error('User is not a member of this event')
    }
    
    // Remove user from memberships
    const updatedMemberships = event.memberships?.filter(m => m.userId !== userId) || []
    
    // Return updated event
    return {
      ...event,
      attendeeCount: Math.max(0, event.attendeeCount - 1),
      memberships: updatedMemberships,
      currentUserMembership: null,
      updatedAt: new Date().toISOString()
    }
  }

  // Convenience methods
  const joinEvent = async (eventId: string, userId: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      
      // Optimistic update
      dispatch({ type: 'JOIN_EVENT', payload: { eventId, userId } })
      
      // API call
      const updatedEvent = await joinEventAPI(eventId, userId)
      
      // Update with server response
      dispatch({ type: 'UPDATE_EVENT', payload: updatedEvent })
    } catch (error) {
      // Revert optimistic update on error
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to join event' })
      
      // Revert the optimistic update by refetching the event
      const originalEvent = state.events.find(e => e.id === eventId)
      if (originalEvent) {
        dispatch({ type: 'UPDATE_EVENT', payload: originalEvent })
      }
    }
  }

  const leaveEvent = async (eventId: string, userId: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      
      // Optimistic update
      dispatch({ type: 'LEAVE_EVENT', payload: { eventId, userId } })
      
      // API call
      const updatedEvent = await leaveEventAPI(eventId, userId)
      
      // Update with server response
      dispatch({ type: 'UPDATE_EVENT', payload: updatedEvent })
    } catch (error) {
      // Revert optimistic update on error
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to leave event' })
      
      // Revert the optimistic update by refetching the event
      const originalEvent = state.events.find(e => e.id === eventId)
      if (originalEvent) {
        dispatch({ type: 'UPDATE_EVENT', payload: originalEvent })
      }
    }
  }

  const updateEvent = (event: EventWithAttendees) => {
    dispatch({ type: 'UPDATE_EVENT', payload: event })
  }

  const setEvents = (events: EventWithAttendees[]) => {
    dispatch({ type: 'SET_EVENTS', payload: events })
  }

  // Computed values
  const getUserEvents = (userId: string): EventWithAttendees[] => {
    return state.events.filter(event => 
      event.memberships?.some(m => m.userId === userId && m.status === 'attending')
    )
  }

  const getAvailableEvents = (userId: string): EventWithAttendees[] => {
    return state.events.filter(event => 
      !event.memberships?.some(m => m.userId === userId && m.status === 'attending')
    )
  }

  const getEventById = (eventId: string): EventWithAttendees | undefined => {
    return state.events.find(event => event.id === eventId)
  }

  // Update currentUserMembership for all events when user changes
  useEffect(() => {
    if (user) {
      const updatedEvents = state.events.map(event => ({
        ...event,
        currentUserMembership: event.memberships?.find(m => m.userId === user.id) || null
      }))
      dispatch({ type: 'SET_EVENTS', payload: updatedEvents })
    }
  }, [user])

  const contextValue: EventStateContextType = {
    state,
    dispatch,
    joinEvent,
    leaveEvent,
    updateEvent,
    setEvents,
    getUserEvents,
    getAvailableEvents,
    getEventById
  }

  return (
    <EventStateContext.Provider value={contextValue}>
      {children}
    </EventStateContext.Provider>
  )
}

// Hook to use the context
export const useEventState = () => {
  const context = useContext(EventStateContext)
  if (context === undefined) {
    throw new Error('useEventState must be used within an EventStateProvider')
  }
  return context
}
