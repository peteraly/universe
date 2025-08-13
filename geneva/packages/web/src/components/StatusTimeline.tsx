import React from 'react'
import { CheckCircle, Clock, AlertCircle, MapPin, Database, Box, Video, Music, Download } from 'lucide-react'
import LiveStepPreview from './LiveStepPreview'

interface StatusTimelineProps {
  job: any
  currentStep: string
  progress: number
}

const StatusTimeline: React.FC<StatusTimelineProps> = ({ job, currentStep, progress }) => {
  const steps = [
    {
      id: 'geocoding',
      name: 'Geocoding',
      description: 'Finding course location and coordinates',
      icon: MapPin,
      visual: 'map-preview'
    },
    {
      id: 'fetching_data',
      name: 'Fetching Data',
      description: 'Downloading elevation and course layout data',
      icon: Database,
      visual: 'data-preview'
    },
    {
      id: 'building_model',
      name: 'Building Model',
      description: 'Creating 3D course model and materials',
      icon: Box,
      visual: 'model-preview'
    },
    {
      id: 'rendering',
      name: 'Rendering',
      description: 'Generating cinematic video sequences',
      icon: Video,
      visual: 'render-preview'
    },
    {
      id: 'post_production',
      name: 'Post-Production',
      description: 'Adding voiceover, captions, and music',
      icon: Music,
      visual: 'audio-preview'
    },
    {
      id: 'deliver',
      name: 'Deliver',
      description: 'Finalizing video and preparing download',
      icon: Download,
      visual: 'final-preview'
    }
  ]

  const getStepStatus = (stepId: string) => {
    if (job.status === 'failed') return 'error'
    if (job.status === 'completed') return 'completed'
    
    // Define step order for comparison
    const stepOrder = ['geocoding', 'fetching_data', 'building_model', 'rendering', 'post_production', 'deliver']
    const currentStepIndex = stepOrder.indexOf(job.status)
    const stepIndex = stepOrder.indexOf(stepId)
    
    if (stepIndex === currentStepIndex) return 'active'
    if (stepIndex < currentStepIndex) return 'completed'
    return 'pending'
  }

  const renderVisualPreview = (step: any, status: string) => {
    if (status === 'pending') {
      return (
        <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
          <step.icon className="w-6 h-6 text-gray-400" />
        </div>
      )
    }

    if (status === 'active') {
      return (
        <div className="w-16 h-16 bg-blue-50 border-2 border-blue-200 rounded-lg flex items-center justify-center animate-pulse">
          <step.icon className="w-6 h-6 text-blue-600" />
        </div>
      )
    }

    if (status === 'completed') {
      return (
        <div className="w-16 h-16 bg-green-50 border-2 border-green-200 rounded-lg flex items-center justify-center">
          <CheckCircle className="w-6 h-6 text-green-600" />
        </div>
      )
    }

    return (
      <div className="w-16 h-16 bg-red-50 border-2 border-red-200 rounded-lg flex items-center justify-center">
        <AlertCircle className="w-6 h-6 text-red-600" />
      </div>
    )
  }

  const renderStepContent = (step: any, status: string) => {
    const isActive = status === 'active'
    const isCompleted = status === 'completed'

    return (
      <div className="flex-1 ml-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className={`font-medium ${isActive ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-500'}`}>
            {step.name}
          </h3>
          {isActive && (
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
              <span className="text-sm text-blue-600 font-medium">{progress}%</span>
            </div>
          )}
        </div>
        
        <p className="text-sm text-gray-600 mb-3">{step.description}</p>
        
        {/* Live Content Preview - Shows actual content being created */}
        <div className="mb-3">
          <LiveStepPreview
            step={step.id}
            jobId={job.id}
            isActive={isActive}
            isCompleted={isCompleted}
            jobData={job}
          />
        </div>

        {/* Progress Bar for Active Step */}
        {isActive && (
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Processing Steps</h2>
        <div className="text-sm text-gray-500">
          Overall Progress: {Math.round((steps.findIndex(s => s.id === currentStep) / steps.length) * 100)}%
        </div>
      </div>

      <div className="space-y-4">
        {steps.map((step, index) => {
          const status = getStepStatus(step.id)
          const isLast = index === steps.length - 1

          return (
            <div key={step.id} className="flex">
              <div className="flex flex-col items-center">
                {renderVisualPreview(step, status)}
                {!isLast && (
                  <div className={`w-0.5 h-8 mt-2 ${status === 'completed' ? 'bg-green-200' : 'bg-gray-200'}`}></div>
                )}
              </div>
              {renderStepContent(step, status)}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default StatusTimeline
