import React from 'react'
import { Lock, Mail } from 'lucide-react'

export interface VisibilityChipProps {
  type: 'invite_auto' | 'invite_manual'
  className?: string
  showIcon?: boolean
}

export const VisibilityChip: React.FC<VisibilityChipProps> = ({
  type,
  className = '',
  showIcon = true
}) => {
  const getChipConfig = () => {
    switch (type) {
      case 'invite_auto':
        return {
          text: '🔒 Auto',
          icon: Lock,
          className: 'chip-visibility-invite-auto'
        }
      case 'invite_manual':
        return {
          text: '📨 Manual',
          icon: Mail,
          className: 'chip-visibility-invite-manual'
        }
      default:
        return {
          text: type,
          icon: Lock,
          className: 'chip-visibility-invite-auto'
        }
    }
  }

  const config = getChipConfig()
  const IconComponent = config.icon

  return (
    <div className={`${config.className} ${className}`} role="status" aria-label={`Visibility: ${config.text}`}>
      {showIcon && <IconComponent className="w-3 h-3" />}
      <span>{config.text}</span>
    </div>
  )
}
