import React from 'react'
import { UserStatus } from '../lib/eventLogic'
import { StatusBadge } from './StatusBadge'
import { Clock, Users, Check, Lock } from 'lucide-react'

export const WaitlistDemo: React.FC = () => {
  return (
    <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-2xl p-6 mb-6">
      <div className="flex items-start space-x-4">
        <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
          <Clock className="w-5 h-5 text-yellow-600" />
        </div>
        
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-yellow-900 mb-3">
            🎯 Complete Waitlist System - Professional Logic
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            {/* User Status States */}
            <div className="bg-white rounded-lg p-4 border border-yellow-200">
              <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                <Users className="w-4 h-4 mr-2" />
                User Status States
              </h4>
              <div className="space-y-2">
                <StatusBadge status={UserStatus.NOT_ATTENDING} />
                <StatusBadge status={UserStatus.ATTENDING} />
                <StatusBadge status={UserStatus.WAITLISTED} />
                <StatusBadge status={UserStatus.HOST} />
                <StatusBadge status={UserStatus.JOINS_LOCKED} />
                <StatusBadge status={UserStatus.INVITE_REQUIRED} />
              </div>
            </div>
            
            {/* Waitlist Features */}
            <div className="bg-white rounded-lg p-4 border border-yellow-200">
              <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                <Check className="w-4 h-4 mr-2" />
                Waitlist Features
              </h4>
              <ul className="space-y-2 text-xs text-gray-700">
                <li className="flex items-start">
                  <Check className="w-3 h-3 mr-2 mt-0.5 text-green-500 flex-shrink-0" />
                  <span><strong>FIFO Queue:</strong> First in, first served</span>
                </li>
                <li className="flex items-start">
                  <Check className="w-3 h-3 mr-2 mt-0.5 text-green-500 flex-shrink-0" />
                  <span><strong>Auto-Promotion:</strong> Instant seat assignment</span>
                </li>
                <li className="flex items-start">
                  <Check className="w-3 h-3 mr-2 mt-0.5 text-green-500 flex-shrink-0" />
                  <span><strong>Cutoff Policy:</strong> Freeze after 30min</span>
                </li>
                <li className="flex items-start">
                  <Check className="w-3 h-3 mr-2 mt-0.5 text-green-500 flex-shrink-0" />
                  <span><strong>Rate Limiting:</strong> 1 action per 3 seconds</span>
                </li>
                <li className="flex items-start">
                  <Check className="w-3 h-3 mr-2 mt-0.5 text-green-500 flex-shrink-0" />
                  <span><strong>Server Authority:</strong> All mutations via RPC</span>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-yellow-100 rounded-lg">
            <p className="text-xs text-yellow-800 flex items-start space-x-2">
              <Lock className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>
                <strong>Professional Logic:</strong> Every interaction follows strict precedence rules. 
                User status is computed server-side with proper validation. Try switching users (top-right) 
                to see different states and test edge cases like cutoff times and full events!
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
