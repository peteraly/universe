import React from 'react'
import { Loader2 } from 'lucide-react'
import { CTAS } from '../lib/copy'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'destructive'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  children: React.ReactNode
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  children,
  leftIcon,
  rightIcon,
  disabled,
  className = '',
  ...props
}) => {
  const baseClasses = 'btn'
  
  const variantClasses = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    ghost: 'btn-ghost',
    destructive: 'btn-destructive',
  }
  
  const sizeClasses = {
    sm: 'btn-sm',
    md: '', // Default size
    lg: 'btn-lg',
  }
  
  const classes = [
    baseClasses,
    variantClasses[variant],
    sizeClasses[size],
    className
  ].filter(Boolean).join(' ')
  
  const isDisabled = disabled || loading
  
  return (
    <button
      className={classes}
      disabled={isDisabled}
      {...props}
    >
      {loading && (
        <Loader2 className="w-4 h-4 animate-spin" />
      )}
      {!loading && leftIcon && (
        <span className="flex-shrink-0">{leftIcon}</span>
      )}
      <span className="flex-shrink-0">{children}</span>
      {!loading && rightIcon && (
        <span className="flex-shrink-0">{rightIcon}</span>
      )}
    </button>
  )
}

// Convenience components for common use cases
export const JoinButton: React.FC<Omit<ButtonProps, 'children'> & { 
  isJoining?: boolean 
}> = ({ isJoining, ...props }) => (
  <Button
    variant="primary"
    loading={isJoining}
    leftIcon={isJoining ? undefined : undefined}
    {...props}
  >
    {isJoining ? 'Joining...' : CTAS.JOIN}
  </Button>
)

export const LeaveButton: React.FC<Omit<ButtonProps, 'children'> & { 
  isLeaving?: boolean 
}> = ({ isLeaving, ...props }) => (
  <Button
    variant="destructive"
    loading={isLeaving}
    {...props}
  >
    {isLeaving ? 'Leaving...' : CTAS.LEAVE}
  </Button>
)

export const JoinWaitlistButton: React.FC<Omit<ButtonProps, 'children'> & { 
  isJoining?: boolean 
}> = ({ isJoining, ...props }) => (
  <Button
    variant="secondary"
    loading={isJoining}
    {...props}
  >
    {isJoining ? 'Joining...' : CTAS.JOIN_WAITLIST}
  </Button>
)

export const LeaveWaitlistButton: React.FC<Omit<ButtonProps, 'children'> & { 
  isLeaving?: boolean 
}> = ({ isLeaving, ...props }) => (
  <Button
    variant="ghost"
    loading={isLeaving}
    {...props}
  >
    {isLeaving ? 'Leaving...' : CTAS.LEAVE_WAITLIST}
  </Button>
)

export const RequestButton: React.FC<Omit<ButtonProps, 'children'> & { 
  isRequesting?: boolean 
}> = ({ isRequesting, ...props }) => (
  <Button
    variant="primary"
    loading={isRequesting}
    {...props}
  >
    {isRequesting ? 'Sending...' : CTAS.REQUEST_TO_JOIN}
  </Button>
)

export const ShareButton: React.FC<Omit<ButtonProps, 'children'>> = (props) => (
  <Button
    variant="ghost"
    size="sm"
    {...props}
  >
    {CTAS.SHARE}
  </Button>
)

export const ManageEventButton: React.FC<Omit<ButtonProps, 'children'>> = (props) => (
  <Button
    variant="secondary"
    {...props}
  >
    {CTAS.MANAGE_EVENT}
  </Button>
)
