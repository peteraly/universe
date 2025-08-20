import React from 'react'
import { Sparkles } from 'lucide-react'

interface AIReasonHintProps {
  reasons: string[]
  confidence: number
  className?: string
}

export const AIReasonHint: React.FC<AIReasonHintProps> = ({
  reasons,
  confidence,
  className = ''
}) => {
  if (reasons.length === 0 || confidence < 0.3) return null

  return (
    <div className={`flex items-center gap-1.5 text-xs text-fg-muted ${className}`}>
      <Sparkles className="w-3 h-3 text-accent-600 flex-shrink-0" />
      <span>
        Because {reasons.join(' • ')}
      </span>
      {/* Optional confidence indicator for debugging */}
      {process.env.NODE_ENV === 'development' && (
        <span className="text-accent-600 font-mono">
          ({Math.round(confidence * 100)}%)
        </span>
      )}
    </div>
  )
}
