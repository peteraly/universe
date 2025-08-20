import React from 'react'
import { User, EventWithAttendees } from '../types'
import { Users, User as UserIcon } from 'lucide-react'

interface AttendeeListProps {
  event: EventWithAttendees
  currentUser?: User | null
  className?: string
}

export const AttendeeList: React.FC<AttendeeListProps> = ({
  event,
  currentUser,
  className = ''
}) => {
  // Mock function to check if users are connected
  // In real app, this would check the connections collection
  const areUsersConnected = (userAId: string, userBId: string): boolean => {
    // For demo purposes, simulate some connections
    const mockConnections = [
      ['user_alex_chen', 'user_sarah_kim'],
      ['user_maria_garcia', 'user_amanda_green'],
      ['user_james_wilson', 'user_anna_taylor'],
      ['user_alex_chen', 'user_lisa_anderson'],
      ['user_emily_davis', 'user_lisa_anderson']
    ]
    
    return mockConnections.some(([a, b]) => 
      (a === userAId && b === userBId) || (a === userBId && b === userAId)
    )
  }

  const getAttendeeDisplay = (attendee: any): { name: string; isConnected: boolean; isCurrentUser: boolean } => {
    const isCurrentUser = attendee.userId === currentUser?.id
    const isConnected = currentUser ? areUsersConnected(currentUser.id, attendee.userId) : false
    
    if (isCurrentUser && currentUser) {
      return {
        name: currentUser.displayName,
        isConnected: true,
        isCurrentUser: true
      }
    }
    
    if (isConnected) {
      return {
        name: attendee.user?.displayName || `User ${attendee.userId}`,
        isConnected: true,
        isCurrentUser: false
      }
    }
    
    return {
      name: 'Guest',
      isConnected: false,
      isCurrentUser: false
    }
  }

  if (!event.attendees || event.attendees.length === 0) {
    return (
      <div className={`text-center py-6 text-gray-500 ${className}`}>
        <Users className="w-8 h-8 mx-auto mb-2 text-gray-400" />
        <p>No attendees yet</p>
      </div>
    )
  }

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">
          Attendees ({event.attendees.length})
        </h3>
        {event.waitlistCount > 0 && (
          <span className="text-sm text-yellow-600 bg-yellow-50 px-2 py-1 rounded-full">
            {event.waitlistCount} on waitlist
          </span>
        )}
      </div>
      
      <div className="space-y-2">
        {event.attendees.map((attendee) => {
          const display = getAttendeeDisplay(attendee)
          
          return (
            <div
              key={attendee.userId}
              className={`flex items-center space-x-3 p-3 rounded-lg border ${
                display.isCurrentUser 
                  ? 'bg-primary-50 border-primary-200' 
                  : 'bg-gray-50 border-gray-200'
              }`}
            >
              <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                {display.isCurrentUser ? (
                  <UserIcon className="w-4 h-4 text-primary-600" />
                ) : (
                  <span className="text-sm font-medium text-primary-600">
                    {display.name.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <span className={`font-medium truncate ${
                    display.isCurrentUser ? 'text-primary-900' : 'text-gray-900'
                  }`}>
                    {display.name}
                  </span>
                  
                  {display.isCurrentUser && (
                    <span className="text-xs bg-primary-100 text-primary-800 px-2 py-0.5 rounded-full">
                      You
                    </span>
                  )}
                  
                  {!display.isConnected && !display.isCurrentUser && (
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                      Anonymous
                    </span>
                  )}
                </div>
                
                {display.isConnected && !display.isCurrentUser && (
                  <p className="text-sm text-gray-500 truncate">
                    Connected
                  </p>
                )}
              </div>
            </div>
          )
        })}
      </div>
      
      {event.waitlistCount > 0 && (
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <Users className="w-4 h-4 text-yellow-600" />
            <span className="text-sm font-medium text-yellow-800">
              {event.waitlistCount} people on waitlist
            </span>
          </div>
          <p className="text-xs text-yellow-700 mt-1">
            They'll be automatically promoted when seats become available
          </p>
        </div>
      )}
    </div>
  )
}
