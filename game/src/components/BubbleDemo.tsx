import React from 'react'
import { Info, MousePointer } from 'lucide-react'

export const BubbleDemo: React.FC = () => {
  return (
    <div className="bg-gradient-to-r from-blue-50 to-primary-50 border border-blue-200 rounded-2xl p-6 mb-6">
      <div className="flex items-start space-x-4">
        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
          <MousePointer className="w-5 h-5 text-blue-600" />
        </div>
        
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">
            🎮 Interactive Bubble System - Try It!
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            {/* Empty Bubbles */}
            <div className="bg-white rounded-lg p-4 border border-blue-200">
              <div className="flex items-center space-x-2 mb-2">
                <div className="bubble bubble-empty w-8 h-8 text-xs">+</div>
                <span className="font-medium text-gray-900">Empty Seats</span>
              </div>
              <p className="text-gray-600 text-xs">
                Click any empty bubble (+) to join instantly! Hover to see the preview effect.
              </p>
            </div>
            
            {/* Your Bubble */}
            <div className="bg-white rounded-lg p-4 border border-blue-200">
              <div className="flex items-center space-x-2 mb-2">
                <div className="bubble bubble-yours w-8 h-8 text-xs relative">
                  Y
                  <div className="w-2 h-2 bg-white rounded-full absolute -top-0.5 -right-0.5 flex items-center justify-center">
                    <div className="w-1 h-1 bg-primary-600 rounded-full"></div>
                  </div>
                </div>
                <span className="font-medium text-gray-900">Your Seat</span>
              </div>
              <p className="text-gray-600 text-xs">
                Your bubble has a special ring! Click it to leave the event.
              </p>
            </div>
            
            {/* Waitlist */}
            <div className="bg-white rounded-lg p-4 border border-blue-200">
              <div className="flex items-center space-x-2 mb-2">
                <div className="bubble bubble-waitlist w-8 h-8 text-xs">W3</div>
                <span className="font-medium text-gray-900">Waitlist</span>
              </div>
              <p className="text-gray-600 text-xs">
                When full, click waitlist bubble to join the queue. Shows your position!
              </p>
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-blue-100 rounded-lg">
            <p className="text-xs text-blue-800 flex items-start space-x-2">
              <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>
                <strong>Pro tip:</strong> All interactions show instant feedback with smooth animations. 
                No instructions needed - just click and see what happens! Use the user switcher (top-right) 
                to test different perspectives.
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
