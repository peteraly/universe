import React from 'react'
import { MapPin, Database, Box, Video, Music, Download, Play, Pause, Volume2, VolumeX } from 'lucide-react'

interface StepVisualPreviewProps {
  step: string
  isActive: boolean
  isCompleted: boolean
  data?: any
}

const StepVisualPreview: React.FC<StepVisualPreviewProps> = ({ 
  step, 
  isActive, 
  isCompleted, 
  data 
}) => {
  const [isPlaying, setIsPlaying] = React.useState(false)
  const [isMuted, setIsMuted] = React.useState(false)

  const renderGeocodingPreview = () => (
    <div className="bg-gradient-to-br from-blue-50 to-green-50 border border-blue-200 rounded-lg p-4">
      <div className="flex items-center space-x-2 mb-3">
        <MapPin className="w-5 h-5 text-blue-600" />
        <span className="text-sm font-medium text-blue-800">Location Detection</span>
      </div>
      
      {isActive && !isCompleted && (
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
            <span className="text-xs text-blue-600">Searching for coordinates...</span>
          </div>
          <div className="h-2 bg-blue-100 rounded-full overflow-hidden">
            <div className="h-full bg-blue-500 rounded-full animate-pulse" style={{ width: '60%' }}></div>
          </div>
        </div>
      )}
      
      {isCompleted && data?.coordinates && (
        <div className="space-y-2">
          <div className="bg-white rounded p-2 border border-blue-200">
            <div className="text-xs text-gray-600 mb-1">📍 Coordinates Found</div>
            <div className="font-mono text-sm text-blue-800">
              {data.coordinates[0].toFixed(6)}, {data.coordinates[1].toFixed(6)}
            </div>
          </div>
          <div className="text-xs text-green-600 flex items-center space-x-1">
            <div className="w-1 h-1 bg-green-600 rounded-full"></div>
            <span>Location verified</span>
          </div>
        </div>
      )}
    </div>
  )

  const renderDataFetchingPreview = () => (
    <div className="bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-4">
      <div className="flex items-center space-x-2 mb-3">
        <Database className="w-5 h-5 text-purple-600" />
        <span className="text-sm font-medium text-purple-800">Data Collection</span>
      </div>
      
      <div className="space-y-2">
        {['Elevation Data', 'Satellite Imagery', 'Weather Data', 'Course Layout'].map((item, index) => (
          <div key={item} className="flex items-center justify-between">
            <span className="text-xs text-gray-600">{item}</span>
            {isActive && !isCompleted && index < 2 ? (
              <div className="flex items-center space-x-1">
                <div className="w-1 h-1 bg-purple-600 rounded-full animate-pulse"></div>
                <span className="text-xs text-purple-600">Fetching...</span>
              </div>
            ) : (
              <div className="text-xs text-green-600">✓</div>
            )}
          </div>
        ))}
      </div>
      
      {isActive && !isCompleted && (
        <div className="mt-3">
          <div className="h-1 bg-purple-100 rounded-full overflow-hidden">
            <div className="h-full bg-purple-500 rounded-full animate-pulse" style={{ width: '75%' }}></div>
          </div>
        </div>
      )}
    </div>
  )

  const renderModelBuildingPreview = () => (
    <div className="bg-gradient-to-br from-orange-50 to-red-50 border border-orange-200 rounded-lg p-4">
      <div className="flex items-center space-x-2 mb-3">
        <Box className="w-5 h-5 text-orange-600" />
        <span className="text-sm font-medium text-orange-800">3D Model Generation</span>
      </div>
      
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-600">Vertices</span>
          <span className="text-xs font-mono text-orange-600">50,247</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-600">Triangles</span>
          <span className="text-xs font-mono text-orange-600">25,123</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-600">Textures</span>
          <span className="text-xs font-mono text-orange-600">8 layers</span>
        </div>
        
        {isActive && !isCompleted && (
          <div className="mt-3">
            <div className="h-1 bg-orange-100 rounded-full overflow-hidden">
              <div className="h-full bg-orange-500 rounded-full animate-pulse" style={{ width: '85%' }}></div>
            </div>
            <div className="text-xs text-orange-600 mt-1 text-center">Rendering geometry...</div>
          </div>
        )}
      </div>
    </div>
  )

  const renderVideoRenderingPreview = () => (
    <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4">
      <div className="flex items-center space-x-2 mb-3">
        <Video className="w-5 h-5 text-green-600" />
        <span className="text-sm font-medium text-green-800">Video Rendering</span>
      </div>
      
      <div className="space-y-3">
        <div className="bg-black rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-400">Preview</span>
            <div className="flex items-center space-x-1">
              <button 
                onClick={() => setIsPlaying(!isPlaying)}
                className="text-gray-400 hover:text-white"
              >
                {isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
              </button>
              <button 
                onClick={() => setIsMuted(!isMuted)}
                className="text-gray-400 hover:text-white"
              >
                {isMuted ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3" />}
              </button>
            </div>
          </div>
          
          {isActive && !isCompleted ? (
            <div className="h-20 bg-gradient-to-r from-green-900 to-emerald-900 rounded flex items-center justify-center">
              <div className="text-center">
                <div className="w-8 h-8 border-2 border-green-400 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                <div className="text-xs text-green-400">Rendering frame 1,800 / 3,600</div>
              </div>
            </div>
          ) : (
            <div className="h-20 bg-gradient-to-r from-green-900 to-emerald-900 rounded flex items-center justify-center">
              <div className="text-center">
                <div className="text-xs text-green-400">4K Video Ready</div>
                <div className="text-xs text-gray-500">60 seconds • 30 fps</div>
              </div>
            </div>
          )}
        </div>
        
        <div className="grid grid-cols-3 gap-2 text-xs">
          <div className="text-center">
            <div className="font-mono text-green-600">3840</div>
            <div className="text-gray-500">Width</div>
          </div>
          <div className="text-center">
            <div className="font-mono text-green-600">2160</div>
            <div className="text-gray-500">Height</div>
          </div>
          <div className="text-center">
            <div className="font-mono text-green-600">30</div>
            <div className="text-gray-500">FPS</div>
          </div>
        </div>
      </div>
    </div>
  )

  const renderAudioProcessingPreview = () => (
    <div className="bg-gradient-to-br from-pink-50 to-purple-50 border border-pink-200 rounded-lg p-4">
      <div className="flex items-center space-x-2 mb-3">
        <Music className="w-5 h-5 text-pink-600" />
        <span className="text-sm font-medium text-pink-800">Audio Processing</span>
      </div>
      
      <div className="space-y-3">
        {['Voiceover Generation', 'Background Music', 'Audio Mixing', 'Caption Sync'].map((item, index) => (
          <div key={item} className="flex items-center justify-between">
            <span className="text-xs text-gray-600">{item}</span>
            {isActive && !isCompleted && index < 2 ? (
              <div className="flex items-center space-x-1">
                <div className="w-1 h-1 bg-pink-600 rounded-full animate-pulse"></div>
                <span className="text-xs text-pink-600">Processing...</span>
              </div>
            ) : (
              <div className="text-xs text-green-600">✓</div>
            )}
          </div>
        ))}
        
        {isActive && !isCompleted && (
          <div className="mt-3">
            <div className="h-6 bg-gray-100 rounded flex items-center justify-center">
              <div className="flex space-x-1">
                {[...Array(8)].map((_, i) => (
                  <div 
                    key={i}
                    className="w-1 bg-pink-500 rounded animate-pulse"
                    style={{ 
                      height: `${Math.random() * 20 + 5}px`,
                      animationDelay: `${i * 0.1}s`
                    }}
                  ></div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )

  const renderFinalDeliveryPreview = () => (
    <div className="bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-200 rounded-lg p-4">
      <div className="flex items-center space-x-2 mb-3">
        <Download className="w-5 h-5 text-indigo-600" />
        <span className="text-sm font-medium text-indigo-800">Final Video Ready</span>
      </div>
      
      <div className="space-y-3">
        <div className="bg-white rounded p-3 border border-indigo-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-indigo-800">Video File</span>
            <span className="text-xs text-green-600">Ready</span>
          </div>
          <div className="text-xs text-gray-600 space-y-1">
            <div>📁 Size: ~50.2 MB</div>
            <div>🎯 Format: MP4 (H.264)</div>
            <div>⚡ Quality: 4K Ultra HD</div>
            <div>⏱️ Duration: 60 seconds</div>
          </div>
        </div>
        
        <div className="flex space-x-2">
          <button className="flex-1 bg-indigo-600 text-white text-xs py-2 px-3 rounded hover:bg-indigo-700 transition-colors">
            Download Video
          </button>
          <button className="flex-1 bg-gray-100 text-gray-700 text-xs py-2 px-3 rounded hover:bg-gray-200 transition-colors">
            Download Captions
          </button>
        </div>
      </div>
    </div>
  )

  const renderPreview = () => {
    switch (step) {
      case 'geocoding':
        return renderGeocodingPreview()
      case 'fetching_data':
        return renderDataFetchingPreview()
      case 'building_model':
        return renderModelBuildingPreview()
      case 'rendering':
        return renderVideoRenderingPreview()
      case 'post_production':
        return renderAudioProcessingPreview()
      case 'deliver':
        return renderFinalDeliveryPreview()
      default:
        return null
    }
  }

  if (!isActive && !isCompleted) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 opacity-50">
        <div className="text-center text-gray-400">
          <div className="text-xs">Step not started</div>
        </div>
      </div>
    )
  }

  return renderPreview()
}

export default StepVisualPreview
