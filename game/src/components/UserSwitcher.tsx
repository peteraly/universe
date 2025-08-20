import React, { useState } from 'react'
import { Users, ChevronDown } from 'lucide-react'
import { useMockAuth } from '../contexts/MockAuthContext'
import { mockUsers } from '../lib/mockData'

export const UserSwitcher: React.FC = () => {
  const { user, switchUser } = useMockAuth()
  const [isOpen, setIsOpen] = useState(false)

  if (!user) return null

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
      >
        <Users className="w-4 h-4" />
        <span className="hidden md:inline">{user.displayName}</span>
        <ChevronDown className="w-4 h-4" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          <div className="p-3 border-b border-gray-200">
            <p className="text-sm font-medium text-gray-900">Switch User (Demo)</p>
            <p className="text-xs text-gray-500">Test different user perspectives</p>
          </div>
          <div className="max-h-64 overflow-y-auto">
            {mockUsers.map((mockUser) => (
              <button
                key={mockUser.id}
                onClick={() => {
                  switchUser(mockUser.id)
                  setIsOpen(false)
                }}
                className={`w-full text-left px-3 py-2 hover:bg-gray-50 transition-colors ${
                  user.id === mockUser.id ? 'bg-primary-50 text-primary-700' : ''
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center text-primary-700 font-medium text-sm">
                    {mockUser.displayName.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{mockUser.displayName}</p>
                    <p className="text-xs text-gray-500">{mockUser.bio}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
