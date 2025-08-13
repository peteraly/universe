import React, { useState, useEffect, useRef } from 'react'
import { MapPin, Play, Settings, Search, Check, X, Loader2 } from 'lucide-react'
import { JobCreateRequest } from '../types'
import api from '../services/api'

interface CourseSuggestion {
  id: string
  name: string
  address: string
  city: string
  state: string
  country: string
  coordinates?: [number, number]
  type: 'golf_course' | 'country_club' | 'resort'
  phone?: string
  website?: string
}

interface JobFormProps {
  onSubmit: (data: JobCreateRequest) => void
  isLoading: boolean
}

const JobForm: React.FC<JobFormProps> = ({ onSubmit, isLoading }) => {
  const [courseName, setCourseName] = useState('')
  const [coordinates, setCoordinates] = useState('')
  const [seed, setSeed] = useState('')
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const [suggestions, setSuggestions] = useState<CourseSuggestion[]>([])
  const [selectedCourse, setSelectedCourse] = useState<CourseSuggestion | null>(null)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const suggestionsRef = useRef<HTMLDivElement>(null)

  // Real course search function using the API
  const searchCourses = async (query: string): Promise<CourseSuggestion[]> => {
    try {
      console.log('🔍 Searching for courses with query:', query)
      const response = await api.get(`/api/jobs/search-courses?query=${encodeURIComponent(query)}&limit=10`)
      console.log('📡 API Response status:', response.status)
      console.log('📡 API Response data:', response.data)
      console.log('📡 API Response data type:', typeof response.data)
      console.log('📡 API Response data.data:', response.data?.data)
      
      const courses = response.data?.data || []
      console.log('🏌️ Found courses:', courses.length, courses)
      return courses
    } catch (error) {
      console.error('❌ Error searching courses:', error)
      return []
    }
  }

  // Handle course name input changes
  const handleCourseNameChange = (value: string) => {
    setCourseName(value)
    setSelectedCourse(null)
    
    // Clear previous timeout
    if (searchTimeout) {
      clearTimeout(searchTimeout)
    }

    if (value.trim().length < 2) {
      setSuggestions([])
      setShowSuggestions(false)
      return
    }

    // Set new timeout for search
    const timeout = setTimeout(async () => {
      setIsSearching(true)
      try {
        const results = await searchCourses(value.trim())
        setSuggestions(results)
        setShowSuggestions(true)
      } catch (error) {
        console.error('Error in search timeout:', error)
        setSuggestions([])
      } finally {
        setIsSearching(false)
      }
    }, 300)

    setSearchTimeout(timeout)
  }

  // Handle course selection
  const handleCourseSelect = (course: CourseSuggestion) => {
    setSelectedCourse(course)
    setCourseName(course.name)
    setSuggestions([])
    setShowSuggestions(false)
    
    // Auto-fill coordinates if available
    if (course.coordinates) {
      setCoordinates(`${course.coordinates[0]}, ${course.coordinates[1]}`)
    }
  }

  // Clear selected course
  const handleClearSelection = () => {
    setSelectedCourse(null)
    setCourseName('')
    setCoordinates('')
    setSuggestions([])
    setShowSuggestions(false)
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!courseName.trim()) {
      return
    }

    const jobData: JobCreateRequest = {
      courseName: courseName.trim(),
    }

    // Use selected course coordinates if available
    if (selectedCourse?.coordinates) {
      jobData.coordinates = selectedCourse.coordinates
    } else if (coordinates.trim()) {
      const coords = coordinates.split(',').map(c => parseFloat(c.trim()))
      if (coords.length === 2 && !isNaN(coords[0]) && !isNaN(coords[1])) {
        jobData.coordinates = [coords[0], coords[1]]
      }
    }

    // Add seed if provided
    if (seed.trim()) {
      const seedNum = parseInt(seed.trim())
      if (!isNaN(seedNum)) {
        jobData.seed = seedNum
      }
    }

    onSubmit(jobData)
    
    // Reset form
    setCourseName('')
    setCoordinates('')
    setSeed('')
    setSelectedCourse(null)
    setSuggestions([])
    setShowSuggestions(false)
  }

  // Handle quick start
  const handleQuickStart = (course: string) => {
    setCourseName(course)
    setSelectedCourse({
      id: 'quick',
      name: course,
      address: '',
      city: '',
      state: '',
      country: 'USA',
      type: 'golf_course'
    })
    onSubmit({ courseName: course })
  }

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="space-y-6">
      {/* Quick Start Examples */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-3">
          Quick Start Examples
        </h3>
        <div className="flex flex-wrap gap-2">
          {['Pebble Beach', 'Augusta National', 'St. Andrews', 'Pinehurst No. 2'].map((course) => (
            <button
              key={course}
              type="button"
              onClick={() => handleQuickStart(course)}
              disabled={isLoading}
              className="btn btn-sm btn-outline hover:bg-golf-50 hover:border-golf-300"
            >
              {course}
            </button>
          ))}
        </div>
      </div>

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="courseName" className="block text-sm font-medium text-gray-700 mb-2">
            Golf Course Name
          </label>
          <div className="relative" ref={suggestionsRef}>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                ref={inputRef}
                type="text"
                id="courseName"
                value={courseName}
                onChange={(e) => handleCourseNameChange(e.target.value)}
                placeholder="Search for a golf course (e.g., Bacon Park Golf Course)"
                className="input pl-10 pr-10"
                required
                disabled={isLoading}
                autoComplete="off"
              />
              {isSearching && (
                <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 animate-spin" />
              )}
            </div>

            {/* Course Suggestions Dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                {suggestions.map((course) => (
                  <button
                    key={course.id}
                    type="button"
                    onClick={() => handleCourseSelect(course)}
                    className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                  >
                    <div className="font-medium text-gray-900">{course.name}</div>
                    <div className="text-sm text-gray-600">
                      {course.address}, {course.city}, {course.state} {course.country}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {course.type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* No Results */}
            {showSuggestions && suggestions.length === 0 && !isSearching && courseName.trim().length >= 2 && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg p-4">
                <div className="text-gray-500 text-center">
                  No courses found. Try a different search term or use coordinates.
                </div>
              </div>
            )}
          </div>

          {/* Selected Course Confirmation */}
          {selectedCourse && (
            <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-md">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <Check className="h-5 w-5 text-green-500 mt-0.5" />
                  <div>
                    <div className="font-medium text-green-800">{selectedCourse.name}</div>
                    <div className="text-sm text-green-700">
                      {selectedCourse.address}, {selectedCourse.city}, {selectedCourse.state} {selectedCourse.country}
                    </div>
                    {selectedCourse.coordinates && (
                      <div className="text-xs text-green-600 mt-1">
                        Coordinates: {selectedCourse.coordinates[0].toFixed(4)}, {selectedCourse.coordinates[1].toFixed(4)}
                      </div>
                    )}
                    {selectedCourse.phone && (
                      <div className="text-xs text-green-600">
                        Phone: {selectedCourse.phone}
                      </div>
                    )}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleClearSelection}
                  className="text-green-600 hover:text-green-800"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          <p className="mt-1 text-sm text-gray-500">
            Search for any golf course. We'll automatically find its location and data.
          </p>
        </div>

        {/* Advanced Options Toggle */}
        <div>
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-900"
          >
            <Settings className="h-4 w-4" />
            <span>Advanced Options</span>
          </button>
        </div>

        {/* Advanced Options */}
        {showAdvanced && (
          <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
            <div>
              <label htmlFor="coordinates" className="block text-sm font-medium text-gray-700 mb-2">
                Coordinates (Optional)
              </label>
              <input
                type="text"
                id="coordinates"
                value={coordinates}
                onChange={(e) => setCoordinates(e.target.value)}
                placeholder="Latitude, Longitude (e.g., 32.0748, -81.0943)"
                className="input"
                disabled={isLoading}
              />
              <p className="mt-1 text-sm text-gray-500">
                Specify exact coordinates if the course name is ambiguous.
              </p>
            </div>

            <div>
              <label htmlFor="seed" className="block text-sm font-medium text-gray-700 mb-2">
                Random Seed (Optional)
              </label>
              <input
                type="number"
                id="seed"
                value={seed}
                onChange={(e) => setSeed(e.target.value)}
                placeholder="Enter a number for reproducible results"
                className="input"
                disabled={isLoading}
              />
              <p className="mt-1 text-sm text-gray-500">
                Use the same seed to get identical results for the same course.
              </p>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isLoading || !courseName.trim()}
            className="btn btn-lg btn-primary flex items-center space-x-2"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Creating...</span>
              </>
            ) : (
              <>
                <Play className="h-5 w-5" />
                <span>Generate Video</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">
              How it works
            </h3>
            <div className="mt-2 text-sm text-blue-700">
              <p>
                Search for any golf course by name. Our system will show you matching courses with their exact locations.
                Select the correct course to ensure accurate video generation. The system will automatically geocode the course,
                fetch elevation and layout data, generate a 3D model, render cinematic footage, and create a professional
                marketing video with voiceover and captions. The entire process takes 2-5 minutes.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default JobForm
