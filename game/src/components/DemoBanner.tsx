import React from 'react'
import { Info } from 'lucide-react'

export const DemoBanner: React.FC = () => {
  return (
    <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
      <div className="flex items-start">
        <Info className="w-5 h-5 text-blue-400 mt-0.5 mr-3 flex-shrink-0" />
        <div>
          <h3 className="text-sm font-medium text-blue-800 mb-1">
            🎉 Demo Mode - Fully Functional GameOn App
          </h3>
          <div className="text-sm text-blue-700">
            <p className="mb-2">
              You're experiencing the complete GameOn app with realistic sample data! 
              All features are working including:
            </p>
            <ul className="text-xs space-y-1 ml-4 list-disc">
              <li><strong>Bubble UI:</strong> Visual seat availability with overflow handling</li>
              <li><strong>Join Methods:</strong> Click "Join Event" button OR click empty bubbles to join instantly!</li>
              <li><strong>Privacy Controls:</strong> Names only visible to connected users</li>
              <li><strong>Swipe Navigation:</strong> Touch and keyboard support</li>
              <li><strong>User Switching:</strong> Use the dropdown in the top-right to test different perspectives</li>
              <li><strong>Real-time Updates:</strong> Changes sync across the app</li>
              <li><strong>Waitlist System:</strong> Automatic promotion when seats open</li>
            </ul>
            <p className="mt-2 text-xs">
              <strong>Try this:</strong> Switch between Alex Chen, Maria Garcia, and other users to see how privacy controls work!
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
