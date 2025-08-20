// API Service Layer for Event Operations
// Handles all client-server communication with proper error handling

export interface APIResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface JoinEventResponse {
  status: 'attending' | 'waitlisted'
  confirmed: boolean
  waitlistPosition?: number
}

export interface LeaveEventResponse {
  success: boolean
}

export interface JoinWaitlistResponse {
  status: 'waitlisted'
  position: number
}

export interface LeaveWaitlistResponse {
  success: boolean
}

export interface RequestJoinResponse {
  success: boolean
  requestId: string
}

// API Service Class
export class EventAPIService {
  private static baseURL = '/api' // Adjust based on your API setup
  
  // Join Event
  static async joinEvent(eventId: string, userId: string): Promise<JoinEventResponse> {
    try {
      // Simulate API call for now
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Simulate different responses based on event state
      const random = Math.random()
      if (random > 0.8) {
        // 20% chance of being waitlisted
        return {
          status: 'waitlisted',
          confirmed: false,
          waitlistPosition: Math.floor(Math.random() * 10) + 1
        }
      }
      
      return {
        status: 'attending',
        confirmed: true
      }
    } catch (error) {
      throw new Error('Failed to join event')
    }
  }
  
  // Leave Event
  static async leaveEvent(eventId: string, userId: string): Promise<LeaveEventResponse> {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500))
      
      return { success: true }
    } catch (error) {
      throw new Error('Failed to leave event')
    }
  }
  
  // Join Waitlist
  static async joinWaitlist(eventId: string, userId: string): Promise<JoinWaitlistResponse> {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800))
      
      return {
        status: 'waitlisted',
        position: Math.floor(Math.random() * 15) + 1
      }
    } catch (error) {
      throw new Error('Failed to join waitlist')
    }
  }
  
  // Leave Waitlist
  static async leaveWaitlist(eventId: string, userId: string): Promise<LeaveWaitlistResponse> {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500))
      
      return { success: true }
    } catch (error) {
      throw new Error('Failed to leave waitlist')
    }
  }
  
  // Request to Join (for invite-only events)
  static async requestJoin(eventId: string, userId: string): Promise<RequestJoinResponse> {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      return {
        success: true,
        requestId: `req_${userId}_${eventId}_${Date.now()}`
      }
    } catch (error) {
      throw new Error('Failed to send request')
    }
  }
}

// Convenience functions for common operations
export const eventAPI = {
  join: EventAPIService.joinEvent,
  leave: EventAPIService.leaveEvent,
  joinWaitlist: EventAPIService.joinWaitlist,
  leaveWaitlist: EventAPIService.leaveWaitlist,
  requestJoin: EventAPIService.requestJoin
}
