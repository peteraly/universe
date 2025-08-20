import React, { useState, useEffect, useCallback } from 'react'
import { X } from 'lucide-react'
import { TOAST_MESSAGES, CONFIG } from '../lib/copy'

export interface ToastProps {
  id: string
  type: 'success' | 'error' | 'warn' | 'info'
  message: string
  duration?: number
  onDismiss: (id: string) => void
  onUndo?: () => void
  undoText?: string
}

export const Toast: React.FC<ToastProps> = ({
  id,
  type,
  message,
  duration = CONFIG.UNDO_TOAST_MS,
  onDismiss,
  onUndo,
  undoText = 'Undo'
}) => {
  const [isVisible, setIsVisible] = useState(true)
  const [timeLeft, setTimeLeft] = useState(duration / 1000)

  const handleDismiss = useCallback(() => {
    setIsVisible(false)
    setTimeout(() => onDismiss(id), 200) // Allow exit animation
  }, [id, onDismiss])

  const handleUndo = useCallback(() => {
    onUndo?.()
    handleDismiss()
  }, [onUndo, handleDismiss])

  // Auto-dismiss timer
  useEffect(() => {
    if (!onUndo) {
      const timer = setTimeout(handleDismiss, duration)
      return () => clearTimeout(timer)
    }
  }, [duration, handleDismiss, onUndo])

  // Countdown timer for undo
  useEffect(() => {
    if (onUndo) {
      const interval = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleDismiss()
            return 0
          }
          return prev - 1
        })
      }, 1000)

      return () => clearInterval(interval)
    }
  }, [onUndo, handleDismiss])

  const getToastClasses = () => {
    const baseClasses = 'toast'
    const typeClasses = {
      success: 'toast-success',
      error: 'toast-error',
      warn: 'toast-warn',
      info: 'toast'
    }
    return `${baseClasses} ${typeClasses[type]}`
  }

  if (!isVisible) return null

  return (
    <div 
      className={getToastClasses()}
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-balance">{message}</p>
        </div>
        
        <div className="flex items-center gap-2 flex-shrink-0">
          {onUndo && (
            <button
              onClick={handleUndo}
              className="text-xs font-medium text-accent-600 hover:text-accent-700 transition-colors"
              aria-label={`${undoText} (${timeLeft}s left)`}
            >
              {undoText}
            </button>
          )}
          
          <button
            onClick={handleDismiss}
            className="text-fg-muted hover:text-fg transition-colors"
            aria-label="Dismiss notification"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      {onUndo && (
        <div className="mt-2">
          <div className="w-full bg-border rounded-full h-1">
            <div 
              className="bg-accent-600 h-1 rounded-full transition-all duration-1000 ease-linear"
              style={{ width: `${(timeLeft / (duration / 1000)) * 100}%` }}
            />
          </div>
        </div>
      )}
    </div>
  )
}

// Toast context and provider
interface ToastContextType {
  showToast: (toast: Omit<ToastProps, 'id' | 'onDismiss'>) => void
  dismissToast: (id: string) => void
}

const ToastContext = React.createContext<ToastContextType | undefined>(undefined)

export const useToast = () => {
  const context = React.useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}

interface ToastProviderProps {
  children: React.ReactNode
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastProps[]>([])

  const showToast = useCallback((toast: Omit<ToastProps, 'id' | 'onDismiss'>) => {
    const id = Math.random().toString(36).substr(2, 9)
    const newToast: ToastProps = {
      ...toast,
      id,
      onDismiss: dismissToast
    }
    setToasts(prev => [...prev, newToast])
  }, [])

  const dismissToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ showToast, dismissToast }}>
      {children}
      <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-toast space-y-2">
        {toasts.map(toast => (
          <Toast key={toast.id} {...toast} />
        ))}
      </div>
    </ToastContext.Provider>
  )
}

// Convenience functions for common toast types
export const useToastHelpers = () => {
  const { showToast } = useToast()

  return {
    showSuccess: (message: string, options?: { onUndo?: () => void }) => {
      showToast({
        type: 'success',
        message,
        onUndo: options?.onUndo
      })
    },
    
    showError: (message: string) => {
      showToast({
        type: 'error',
        message
      })
    },
    
    showWarn: (message: string) => {
      showToast({
        type: 'warn',
        message
      })
    },
    
    showInfo: (message: string) => {
      showToast({
        type: 'info',
        message
      })
    },
    
    // Predefined toast messages
    showJoining: () => {
      showToast({
        type: 'info',
        message: TOAST_MESSAGES.JOINING
      })
    },
    
    showJoinedSuccess: (onUndo?: () => void) => {
      showToast({
        type: 'success',
        message: TOAST_MESSAGES.JOINED_SUCCESS,
        onUndo
      })
    },
    
    showJoinedWaitlist: (position?: number) => {
      const message = position 
        ? TOAST_MESSAGES.JOINED_WAITLIST_WITH_POSITION.replace('{position}', position.toString())
        : TOAST_MESSAGES.JOINED_WAITLIST
      
      showToast({
        type: 'warn',
        message
      })
    },
    
    showLeaving: () => {
      showToast({
        type: 'info',
        message: TOAST_MESSAGES.LEAVING
      })
    },
    
    showLeftSuccess: () => {
      showToast({
        type: 'success',
        message: TOAST_MESSAGES.LEFT_SUCCESS
      })
    },
    
    showRequesting: () => {
      showToast({
        type: 'info',
        message: TOAST_MESSAGES.REQUESTING
      })
    },
    
    showRequestSent: () => {
      showToast({
        type: 'success',
        message: TOAST_MESSAGES.REQUEST_SENT
      })
    },
    
    showJoinsLocked: (minutes: number) => {
      const message = TOAST_MESSAGES.JOINS_LOCKED.replace('{minutes}', minutes.toString())
      showToast({
        type: 'warn',
        message
      })
    },
    
    showInviteRequired: () => {
      showToast({
        type: 'error',
        message: TOAST_MESSAGES.INVITE_REQUIRED
      })
    },
    
    showEventClosed: () => {
      showToast({
        type: 'error',
        message: TOAST_MESSAGES.EVENT_CLOSED
      })
    },
    
    showPromoted: () => {
      showToast({
        type: 'success',
        message: TOAST_MESSAGES.PROMOTED_FROM_WAITLIST
      })
    }
  }
}
