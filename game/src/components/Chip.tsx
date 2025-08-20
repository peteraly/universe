import React from 'react'
import { Lock, Mail, Users, Check, Clock, XCircle, AlertTriangle } from 'lucide-react'
import { STATUS_MESSAGES } from '../lib/copy'

export interface ChipProps {
  variant: 'status' | 'visibility'
  type: string
  className?: string
  showIcon?: boolean
}

export const Chip: React.FC<ChipProps> = ({
  variant,
  type,
  className = '',
  showIcon = true
}) => {
  const getChipConfig = () => {
    if (variant === 'status') {
      switch (type) {
        case 'pending':
          return {
            text: STATUS_MESSAGES.PENDING,
            icon: Clock,
            className: 'chip-status-pending'
          }
        case 'confirmed':
          return {
            text: STATUS_MESSAGES.CONFIRMED,
            icon: Check,
            className: 'chip-status-confirmed'
          }
        case 'locked':
          return {
            text: STATUS_MESSAGES.LOCKED,
            icon: Lock,
            className: 'chip-status-locked'
          }
        case 'cancelled':
          return {
            text: STATUS_MESSAGES.CANCELLED,
            icon: XCircle,
            className: 'chip-status-cancelled'
          }
        case 'ended':
          return {
            text: STATUS_MESSAGES.ENDED,
            icon: Clock,
            className: 'chip-status-ended'
          }
        case 'in_progress':
          return {
            text: STATUS_MESSAGES.IN_PROGRESS,
            icon: AlertTriangle,
            className: 'chip-status-locked'
          }
        default:
          return {
            text: type,
            icon: Clock,
            className: 'chip-status-pending'
          }
      }
    } else if (variant === 'visibility') {
      switch (type) {
        case 'public':
          return {
            text: STATUS_MESSAGES.PUBLIC,
            icon: Users,
            className: 'chip-visibility-public'
          }
        case 'invite_auto':
          return {
            text: STATUS_MESSAGES.INVITE_ONLY_AUTO,
            icon: Lock,
            className: 'chip-visibility-invite-auto'
          }
        case 'invite_manual':
          return {
            text: STATUS_MESSAGES.INVITE_ONLY_MANUAL,
            icon: Mail,
            className: 'chip-visibility-invite-manual'
          }
        default:
          return {
            text: type,
            icon: Users,
            className: 'chip-visibility-public'
          }
      }
    }
    
    return {
      text: type,
      icon: Clock,
      className: 'chip-status-pending'
    }
  }

  const config = getChipConfig()
  const IconComponent = config.icon

  return (
    <div className={`${config.className} ${className}`}>
      {showIcon && <IconComponent className="w-3 h-3" />}
      <span>{config.text}</span>
    </div>
  )
}

// Convenience components for common use cases
export const StatusChip: React.FC<Omit<ChipProps, 'variant'>> = (props) => (
  <Chip variant="status" {...props} />
)

export const VisibilityChip: React.FC<Omit<ChipProps, 'variant'>> = (props) => (
  <Chip variant="visibility" {...props} />
)

// Specific status chips
export const PendingChip: React.FC<Omit<ChipProps, 'variant' | 'type'>> = (props) => (
  <StatusChip type="pending" {...props} />
)

export const ConfirmedChip: React.FC<Omit<ChipProps, 'variant' | 'type'>> = (props) => (
  <StatusChip type="confirmed" {...props} />
)

export const LockedChip: React.FC<Omit<ChipProps, 'variant' | 'type'>> = (props) => (
  <StatusChip type="locked" {...props} />
)

export const CancelledChip: React.FC<Omit<ChipProps, 'variant' | 'type'>> = (props) => (
  <StatusChip type="cancelled" {...props} />
)

export const EndedChip: React.FC<Omit<ChipProps, 'variant' | 'type'>> = (props) => (
  <StatusChip type="ended" {...props} />
)

export const InProgressChip: React.FC<Omit<ChipProps, 'variant' | 'type'>> = (props) => (
  <StatusChip type="in_progress" {...props} />
)

// Specific visibility chips
export const PublicChip: React.FC<Omit<ChipProps, 'variant' | 'type'>> = (props) => (
  <VisibilityChip type="public" {...props} />
)

export const InviteAutoChip: React.FC<Omit<ChipProps, 'variant' | 'type'>> = (props) => (
  <VisibilityChip type="invite_auto" {...props} />
)

export const InviteManualChip: React.FC<Omit<ChipProps, 'variant' | 'type'>> = (props) => (
  <VisibilityChip type="invite_manual" {...props} />
)
