import React from 'react'
import { TemporalStatus } from '../lib/temporalStatus'
import { Clock, Lock, Play, CheckCircle, XCircle } from 'lucide-react'

interface TemporalStatusChipProps {
  status: TemporalStatus
  timeUntilStart?: number  // Minutes until start (unused but kept for API compatibility)
  className?: string
  showIcon?: boolean
}

export const TemporalStatusChip: React.FC<TemporalStatusChipProps> = ({
  status,
  timeUntilStart: _timeUntilStart, // Unused but kept for API compatibility
  className = '',
  showIcon = true
}) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'UPCOMING':
        return {
          text: 'Confirmed',
          icon: CheckCircle,
          className: 'chip-status-confirmed'
        }
      
      case 'LOCKED':
        return {
          text: 'Joins locked 30m',
          icon: Lock,
          className: 'chip-status-locked'
        }
      
      case 'IN_PROGRESS':
        return {
          text: 'In Progress',
          icon: Play,
          className: 'chip-status-locked'
        }
      
      case 'PASSED':
        return {
          text: 'Ended',
          icon: CheckCircle,
          className: 'chip-status-ended'
        }
      
      case 'CANCELLED':
        return {
          text: 'Cancelled',
          icon: XCircle,
          className: 'chip-status-cancelled'
        }
      
      default:
        return {
          text: 'Unknown',
          icon: Clock,
          className: 'chip-status-ended'
        }
    }
  }

  const config = getStatusConfig()
  const IconComponent = config.icon

  return (
    <div className={`${config.className} ${className}`} role="status" aria-label={`Status: ${config.text}`}>
      {showIcon && <IconComponent className="w-3 h-3" />}
      <span>{config.text}</span>
    </div>
  )
}
