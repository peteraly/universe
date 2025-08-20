import React from 'react'
import { UserStatus } from '../lib/eventLogic'
import { Check, Clock, Lock, Users, XCircle, Shield, User } from 'lucide-react'

interface StatusBadgeProps {
  status: UserStatus
  className?: string
  showIcon?: boolean
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  className = '',
  showIcon = true
}) => {
  const getStatusConfig = () => {
    switch (status) {
      case UserStatus.CANCELLED:
        return {
          text: 'Event Cancelled',
          icon: XCircle,
          className: 'bg-red-100 text-red-800 border-red-200'
        }
        
      case UserStatus.BLOCKED:
        return {
          text: 'Access Denied',
          icon: Shield,
          className: 'bg-red-100 text-red-800 border-red-200'
        }
        
      case UserStatus.HOST:
        return {
          text: 'Event Host',
          icon: Users,
          className: 'bg-purple-100 text-purple-800 border-purple-200'
        }
        
      case UserStatus.JOINS_LOCKED:
        return {
          text: 'Joins Locked',
          icon: Clock,
          className: 'bg-gray-100 text-gray-600 border-gray-200'
        }
        
                    case UserStatus.INVITE_REQUIRED:
                return {
                  text: 'Invite Required',
                  icon: Lock,
                  className: 'bg-orange-100 text-orange-800 border-orange-200'
                }

              case UserStatus.REQUEST_PENDING:
                return {
                  text: 'Request Pending',
                  icon: Clock,
                  className: 'bg-blue-100 text-blue-800 border-blue-200'
                }

              case UserStatus.REQUEST_ACCEPTED:
                return {
                  text: 'Request Accepted',
                  icon: Check,
                  className: 'bg-green-100 text-green-800 border-green-200'
                }
        
      case UserStatus.ATTENDING:
        return {
          text: 'Attending',
          icon: Check,
          className: 'bg-green-100 text-green-800 border-green-200'
        }
        
      case UserStatus.WAITLISTED:
        return {
          text: 'Waitlisted',
          icon: Clock,
          className: 'bg-yellow-100 text-yellow-800 border-yellow-200'
        }
        
      case UserStatus.NOT_ATTENDING:
        return {
          text: 'Not Attending',
          icon: User,
          className: 'bg-gray-100 text-gray-600 border-gray-200'
        }
        
      default:
        return {
          text: 'Unknown',
          icon: User,
          className: 'bg-gray-100 text-gray-600 border-gray-200'
        }
    }
  }

  const config = getStatusConfig()
  const IconComponent = config.icon

  return (
    <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${config.className} ${className}`}>
      {showIcon && <IconComponent className="w-3 h-3 mr-1.5" />}
      {config.text}
    </div>
  )
}
