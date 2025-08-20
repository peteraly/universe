import React from 'react'
import { CheckCircle, Clock, XCircle } from 'lucide-react'

interface EventStatusChipProps {
  status: 'pending' | 'confirmed' | 'cancelled'
  className?: string
}

export const EventStatusChip: React.FC<EventStatusChipProps> = ({ 
  status, 
  className = '' 
}) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'confirmed':
        return {
          label: 'Confirmed',
          icon: CheckCircle,
          className: 'bg-green-100 text-green-700 border-green-200'
        }
      case 'pending':
        return {
          label: 'Pending',
          icon: Clock,
          className: 'bg-yellow-100 text-yellow-700 border-yellow-200'
        }
      case 'cancelled':
        return {
          label: 'Cancelled',
          icon: XCircle,
          className: 'bg-red-100 text-red-700 border-red-200'
        }
    }
  }

  const config = getStatusConfig()
  const Icon = config.icon

  return (
    <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${config.className} ${className}`}>
      <Icon className="w-3 h-3 mr-1" />
      {config.label}
    </div>
  )
}

