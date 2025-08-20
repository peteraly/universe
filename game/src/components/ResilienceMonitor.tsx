import React from 'react'
import { ResilienceService, collectResilienceMetrics } from '../lib/resilience'
import { Shield, AlertTriangle, TrendingUp, Users } from 'lucide-react'

interface ResilienceMonitorProps {
  resilienceService: ResilienceService
  className?: string
}

export const ResilienceMonitor: React.FC<ResilienceMonitorProps> = ({
  resilienceService,
  className = ''
}) => {
  const [metrics, setMetrics] = React.useState(collectResilienceMetrics(resilienceService))
  const [isVisible, setIsVisible] = React.useState(false)

  // Update metrics every 5 seconds
  React.useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(collectResilienceMetrics(resilienceService))
    }, 5000)

    return () => clearInterval(interval)
  }, [resilienceService])

  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null
  }

  return (
    <div className={`fixed bottom-4 right-4 z-50 ${className}`}>
      {/* Toggle button */}
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="bg-accent-600 text-white p-2 rounded-full shadow-lg hover:bg-accent-700 transition-colors"
        title="Resilience Monitor"
      >
        <Shield className="w-4 h-4" />
      </button>

      {/* Monitor panel */}
      {isVisible && (
        <div className="absolute bottom-12 right-0 bg-white border border-border rounded-lg shadow-lg p-4 w-64">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-fg">Resilience Monitor</h3>
            <button
              onClick={() => setIsVisible(false)}
              className="text-fg-muted hover:text-fg"
            >
              ×
            </button>
          </div>

          <div className="space-y-2 text-xs">
            {/* Cold Start Users */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <Users className="w-3 h-3 text-blue-600" />
                <span>Cold Start</span>
              </div>
              <span className={`font-mono ${metrics.coldStartUsers > 0 ? 'text-blue-600' : 'text-fg-muted'}`}>
                {metrics.coldStartUsers}
              </span>
            </div>

            {/* Fallback Usage */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <AlertTriangle className="w-3 h-3 text-yellow-600" />
                <span>Fallbacks</span>
              </div>
              <span className={`font-mono ${metrics.fallbackUsage > 0 ? 'text-yellow-600' : 'text-fg-muted'}`}>
                {metrics.fallbackUsage}
              </span>
            </div>

            {/* Abuse Detections */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <Shield className="w-3 h-3 text-red-600" />
                <span>Abuse</span>
              </div>
              <span className={`font-mono ${metrics.abuseDetections > 0 ? 'text-red-600' : 'text-fg-muted'}`}>
                {metrics.abuseDetections}
              </span>
            </div>

            {/* Drift Detections */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <TrendingUp className="w-3 h-3 text-orange-600" />
                <span>Drift</span>
              </div>
              <span className={`font-mono ${metrics.driftDetections > 0 ? 'text-orange-600' : 'text-fg-muted'}`}>
                {metrics.driftDetections}
              </span>
            </div>

            {/* Performance */}
            <div className="pt-2 border-t border-border">
              <div className="flex items-center justify-between">
                <span>Response Time</span>
                <span className="font-mono text-fg-muted">
                  {metrics.avgResponseTime}ms
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Error Rate</span>
                <span className={`font-mono ${metrics.errorRate > 0.05 ? 'text-red-600' : 'text-fg-muted'}`}>
                  {(metrics.errorRate * 100).toFixed(1)}%
                </span>
              </div>
            </div>
          </div>

          {/* Status indicator */}
          <div className="mt-3 pt-2 border-t border-border">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${
                metrics.fallbackUsage === 0 && metrics.abuseDetections === 0 
                  ? 'bg-green-500' 
                  : metrics.fallbackUsage > 0 
                    ? 'bg-yellow-500' 
                    : 'bg-red-500'
              }`} />
              <span className="text-xs text-fg-muted">
                {metrics.fallbackUsage === 0 && metrics.abuseDetections === 0 
                  ? 'All systems operational'
                  : metrics.fallbackUsage > 0 
                    ? 'Using fallbacks'
                    : 'Issues detected'
                }
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
