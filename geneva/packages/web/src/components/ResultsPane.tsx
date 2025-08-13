import React, { useState } from 'react'
import { Download, Share2, Star, MessageSquare, Play, Pause, Volume2, VolumeX } from 'lucide-react'
import { Job } from '../types'
import api from '../services/api'

interface ResultsPaneProps {
  job: Job
  onClose: () => void
}

const ResultsPane: React.FC<ResultsPaneProps> = ({ job, onClose }) => {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [showFeedback, setShowFeedback] = useState(false)
  const [rating, setRating] = useState(0)
  const [feedback, setFeedback] = useState('')
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false)
  const [downloadProgress, setDownloadProgress] = useState(0)
  const [isDownloading, setIsDownloading] = useState(false)
  const [videoLoading, setVideoLoading] = useState(true)
  const [videoError, setVideoError] = useState<string | null>(null)

  const handleDownload = async (type: 'video' | 'captions') => {
    try {
      setIsDownloading(true)
      setDownloadProgress(0)

      // Simulate download progress
      const progressInterval = setInterval(() => {
        setDownloadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 100)

      // In production, this would be a real download
      const filename = type === 'video' 
        ? `${job.courseName}-video.mp4`
        : `${job.courseName}-captions.srt`

      // Simulate API call for download tracking
      await api.post('/api/analytics/performance', {
        jobId: job.id,
        step: 'download',
        duration: 2000,
        success: true
      })

      // Simulate download completion
      setTimeout(() => {
        setDownloadProgress(100)
        setIsDownloading(false)
        
        // Show success message
        alert(`Download completed: ${filename}`)
        
        // Track successful download
        api.post('/api/analytics/performance', {
          jobId: job.id,
          step: 'download_complete',
          duration: 2000,
          success: true
        })
      }, 2000)

    } catch (error) {
      console.error('Download error:', error)
      setIsDownloading(false)
      setDownloadProgress(0)
      
      // Track download error
      api.post('/api/analytics/errors', {
        jobId: job.id,
        step: 'download',
        message: 'Download failed',
        level: 'error',
        context: { type, error: (error as Error).message }
      })
    }
  }

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: `Golf Course Video: ${job.courseName}`,
          text: `Check out this amazing golf course video for ${job.courseName}!`,
          url: window.location.href
        })
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(window.location.href)
        alert('Link copied to clipboard!')
      }

      // Track share action
      api.post('/api/analytics/performance', {
        jobId: job.id,
        step: 'share',
        duration: 500,
        success: true
      })
    } catch (error) {
      console.error('Share error:', error)
    }
  }

  const handleFeedbackSubmit = async () => {
    if (rating === 0) {
      alert('Please select a rating')
      return
    }

    try {
      setIsSubmittingFeedback(true)

      await api.post('/api/analytics/feedback', {
        jobId: job.id,
        rating,
        comments: feedback,
        sessionId: 'user-session-id' // In production, get from auth
      })

      setShowFeedback(false)
      setRating(0)
      setFeedback('')
      alert('Thank you for your feedback!')

      // Track feedback submission
      api.post('/api/analytics/performance', {
        jobId: job.id,
        step: 'feedback_submitted',
        duration: 1000,
        success: true
      })
    } catch (error) {
      console.error('Feedback submission error:', error)
      alert('Failed to submit feedback. Please try again.')
    } finally {
      setIsSubmittingFeedback(false)
    }
  }

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const formatFileSize = (bytes: number): string => {
    const mb = bytes / (1024 * 1024)
    return `${mb.toFixed(1)} MB`
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Your Video
          </h2>
          <p className="text-gray-600">
            Generated for {job.courseName}
          </p>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600"
        >
          ×
        </button>
      </div>

      {/* Video Preview */}
      <div className="bg-gray-900 rounded-lg p-8 text-center mb-6">
        {job.output?.videoUrl ? (
          <div className="relative">
            <video
              className="w-full max-w-2xl mx-auto rounded-lg"
              controls
              poster={job.output.thumbnailUrl}
              preload="metadata"
              crossOrigin="anonymous"
              onError={(e) => {
                console.error('Video error:', e)
                setVideoError('Failed to load video')
                setVideoLoading(false)
              }}
              onLoadStart={() => {
                console.log('Video loading started')
                setVideoLoading(true)
                setVideoError(null)
              }}
              onLoadedData={() => {
                console.log('Video data loaded')
                setVideoLoading(false)
              }}
              onCanPlay={() => {
                console.log('Video can play')
                setVideoLoading(false)
              }}
            >
              <source src={job.output.videoUrl} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
            {videoLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-lg">
                <div className="text-white">Loading video...</div>
              </div>
            )}
            {videoError && (
              <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
                <p>Video loading error: {videoError}</p>
                <p className="text-sm mt-2">Video URL: {job.output.videoUrl}</p>
                <a 
                  href={job.output.videoUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-block mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Open Video in New Tab
                </a>
              </div>
            )}
            <p className="text-gray-300 mt-4">
              Your golf course video is ready! Click play to watch the generated content.
            </p>
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-center mb-4">
              <Play className="h-16 w-16 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              Video Generated Successfully
            </h3>
            <p className="text-gray-300">
              Your golf course video has been created and is ready for download.
            </p>
          </div>
        )}
      </div>

      {/* Video Details */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">
            {formatDuration(job.output?.metadata.duration || 75)}
          </div>
          <div className="text-sm text-gray-600">Duration</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">
            {job.output?.metadata.resolution || '1920x1080'}
          </div>
          <div className="text-sm text-gray-600">Resolution</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">
            {formatFileSize(job.output?.metadata.fileSize || 15 * 1024 * 1024)}
          </div>
          <div className="text-sm text-gray-600">File Size</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">
            {job.output?.metadata.renderTime || 21}s
          </div>
          <div className="text-sm text-gray-600">Render Time</div>
        </div>
      </div>

      {/* Download Options */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Download Options
        </h3>
        
        <div className="space-y-3">
          <button
            onClick={() => handleDownload('video')}
            disabled={isDownloading}
            className="w-full flex items-center justify-center space-x-2 bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            <Download className="h-5 w-5" />
            <span>
              {isDownloading && downloadProgress > 0 
                ? `Downloading... ${downloadProgress}%`
                : 'Download Video (MP4)'
              }
            </span>
          </button>
          
          <button
            onClick={() => handleDownload('captions')}
            disabled={isDownloading}
            className="w-full flex items-center justify-center space-x-2 bg-gray-600 text-white px-4 py-3 rounded-lg hover:bg-gray-700 disabled:opacity-50"
          >
            <Download className="h-5 w-5" />
            <span>Download Captions (SRT)</span>
          </button>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-3 mb-6">
        <button
          onClick={handleShare}
          className="flex-1 flex items-center justify-center space-x-2 bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700"
        >
          <Share2 className="h-5 w-5" />
          <span>Share</span>
        </button>
        
        <button
          onClick={() => setShowFeedback(true)}
          className="flex-1 flex items-center justify-center space-x-2 bg-purple-600 text-white px-4 py-3 rounded-lg hover:bg-purple-700"
        >
          <Star className="h-5 w-5" />
          <span>Rate Video</span>
        </button>
      </div>

      {/* Course Information */}
      <div className="bg-blue-50 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">
          Course Information
        </h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-blue-700">Course Name</span>
            <span className="text-blue-900 font-medium">{job.courseName}</span>
          </div>
          {job.coordinates && (
            <div className="flex justify-between">
              <span className="text-blue-700">Coordinates</span>
              <span className="text-blue-900 font-medium">
                {job.coordinates[0].toFixed(4)}, {job.coordinates[1].toFixed(4)}
              </span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-blue-700">Generated</span>
            <span className="text-blue-900 font-medium">
              {new Date(job.createdAt).toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Feedback Modal */}
      {showFeedback && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Rate Your Video
            </h3>
            
            {/* Star Rating */}
            <div className="flex justify-center space-x-2 mb-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  className={`text-2xl ${rating >= star ? 'text-yellow-400' : 'text-gray-300'}`}
                >
                  ★
                </button>
              ))}
            </div>
            
            {/* Comments */}
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Tell us what you think about the video..."
              className="w-full p-3 border border-gray-300 rounded-lg mb-4 h-24 resize-none"
            />
            
            {/* Action Buttons */}
            <div className="flex space-x-3">
              <button
                onClick={() => setShowFeedback(false)}
                className="flex-1 px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleFeedbackSubmit}
                disabled={isSubmittingFeedback}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {isSubmittingFeedback ? 'Submitting...' : 'Submit'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ResultsPane
