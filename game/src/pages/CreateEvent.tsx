import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Calendar, MapPin, Users, Eye, EyeOff } from 'lucide-react'
import { useMockAuth } from '../contexts/MockAuthContext'
import { CreateEventData } from '../types'

export const CreateEvent: React.FC = () => {
  const { user } = useMockAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<CreateEventData>({
    title: '',
    description: '',
    datetimeISO: '',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    location: '',
    maxSlots: 10,
    visibility: 'public',
    cutoffMinutes: 30,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setLoading(true)
    // Simulate API call
    setTimeout(() => {
      console.log('Event created:', formData)
      navigate('/dashboard')
      setLoading(false)
    }, 1000)
  }

  const handleInputChange = (field: keyof CreateEventData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Create New Event</h1>
        <p className="text-gray-600">Set up your event details and invite others to join</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Basic Information</h2>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Event Title *
              </label>
              <input
                type="text"
                id="title"
                required
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Enter event title"
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                id="description"
                rows={3}
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Describe your event..."
              />
            </div>
          </div>
        </div>

        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Date & Time</h2>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="datetime" className="block text-sm font-medium text-gray-700 mb-1">
                Date & Time *
              </label>
              <div className="flex items-center space-x-2">
                <Calendar className="w-5 h-5 text-gray-400" />
                <input
                  type="datetime-local"
                  id="datetime"
                  required
                  value={formData.datetimeISO}
                  onChange={(e) => handleInputChange('datetimeISO', e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label htmlFor="timezone" className="block text-sm font-medium text-gray-700 mb-1">
                Timezone
              </label>
              <select
                id="timezone"
                value={formData.timezone}
                onChange={(e) => handleInputChange('timezone', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="America/New_York">Eastern Time (ET)</option>
                <option value="America/Chicago">Central Time (CT)</option>
                <option value="America/Denver">Mountain Time (MT)</option>
                <option value="America/Los_Angeles">Pacific Time (PT)</option>
                <option value="UTC">UTC</option>
              </select>
            </div>
          </div>
        </div>

        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Location & Capacity</h2>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                Location *
              </label>
              <div className="flex items-center space-x-2">
                <MapPin className="w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  id="location"
                  required
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Enter location or address"
                />
              </div>
            </div>

            <div>
              <label htmlFor="maxSlots" className="block text-sm font-medium text-gray-700 mb-1">
                Maximum Attendees *
              </label>
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-gray-400" />
                <input
                  type="number"
                  id="maxSlots"
                  required
                  min="1"
                  max="100"
                  value={formData.maxSlots}
                  onChange={(e) => handleInputChange('maxSlots', parseInt(e.target.value))}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label htmlFor="cutoffMinutes" className="block text-sm font-medium text-gray-700 mb-1">
                Registration Cutoff (minutes before event)
              </label>
              <input
                type="number"
                id="cutoffMinutes"
                min="0"
                value={formData.cutoffMinutes}
                onChange={(e) => handleInputChange('cutoffMinutes', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Visibility</h2>
          
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="visibility"
                  value="public"
                  checked={formData.visibility === 'public'}
                  onChange={(e) => handleInputChange('visibility', e.target.value)}
                  className="mr-2"
                />
                <div className="flex items-center">
                  <Eye className="w-4 h-4 mr-2 text-green-600" />
                  <span className="text-sm font-medium text-gray-700">Public</span>
                  <span className="text-xs text-gray-500 ml-1">Anyone can see and join</span>
                </div>
              </label>
            </div>
            
            <div className="flex items-center space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="visibility"
                  value="invite-only"
                  checked={formData.visibility === 'invite-only'}
                  onChange={(e) => handleInputChange('visibility', e.target.value)}
                  className="mr-2"
                />
                <div className="flex items-center">
                  <EyeOff className="w-4 h-4 mr-2 text-orange-600" />
                  <span className="text-sm font-medium text-gray-700">Invite Only</span>
                  <span className="text-xs text-gray-500 ml-1">Only invited users can join</span>
                </div>
              </label>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="btn-secondary"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
          >
            {loading ? 'Creating...' : 'Create Event'}
          </button>
        </div>
      </form>
    </div>
  )
}

