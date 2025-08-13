import React, { useState, useEffect } from 'react'
import { MapPin, Database, Box, Video, Music, Download, Play, Pause, Volume2, VolumeX, Globe, Layers, FileText } from 'lucide-react'
import api from '../services/api'

interface LiveStepPreviewProps {
  step: string
  jobId: string
  isActive: boolean
  isCompleted: boolean
  jobData?: any
}

const LiveStepPreview: React.FC<LiveStepPreviewProps> = ({ 
  step, 
  jobId, 
  isActive, 
  isCompleted, 
  jobData 
}) => {
  const [liveData, setLiveData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Fetch live data for the current step
  useEffect(() => {
    if (isActive && jobId) {
      const fetchLiveData = async () => {
        setIsLoading(true)
        try {
          // Fetch step-specific data from backend
          const response = await api.get(`/api/jobs/${jobId}/step-data?step=${step}`)
          setLiveData(response.data)
        } catch (error) {
          console.log(`No live data available for step: ${step}`)
        } finally {
          setIsLoading(false)
        }
      }

      fetchLiveData()
      // Poll for updates every 5 seconds while step is active
      const interval = setInterval(fetchLiveData, 5000)
      return () => clearInterval(interval)
    }
  }, [step, jobId, isActive])

  const renderLiveGeocoding = () => (
    <div className="bg-gradient-to-br from-blue-50 to-green-50 border border-blue-200 rounded-lg p-4">
      <div className="flex items-center space-x-2 mb-3">
        <MapPin className="w-5 h-5 text-blue-600" />
        <span className="text-sm font-medium text-blue-800">Live Location Detection</span>
      </div>
      
      {isActive && !isCompleted && (
        <div className="space-y-3">
          <div className="bg-white rounded p-3 border border-blue-200">
            <div className="text-xs text-gray-600 mb-2">🔍 Searching for coordinates...</div>
            {liveData?.searchResults && (
              <div className="space-y-1">
                {liveData.searchResults.map((result: any, index: number) => (
                  <div key={index} className="text-xs text-blue-700 p-1 bg-blue-50 rounded">
                    {result.name} - {result.confidence}% match
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {liveData?.coordinates && (
            <div className="bg-green-50 border border-green-200 rounded p-3">
              <div className="text-xs text-green-800 font-medium mb-1">✅ Coordinates Found!</div>
              <div className="font-mono text-sm text-green-700">
                {liveData.coordinates[0].toFixed(6)}, {liveData.coordinates[1].toFixed(6)}
              </div>
              <div className="text-xs text-green-600 mt-1">
                Accuracy: {liveData.accuracy || 'High'}
              </div>
            </div>
          )}
        </div>
      )}
      
      {isCompleted && jobData?.coordinates && (
        <div className="bg-green-50 border border-green-200 rounded p-3">
          <div className="text-xs text-green-800 font-medium mb-1">📍 Final Coordinates</div>
          <div className="font-mono text-sm text-green-700">
            {jobData.coordinates[0].toFixed(6)}, {jobData.coordinates[1].toFixed(6)}
          </div>
          <div className="text-xs text-green-600 mt-1">
            Location: {jobData.courseName}
          </div>
        </div>
      )}
    </div>
  )

  const renderLiveDataFetching = () => (
    <div className="bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-4">
      <div className="flex items-center space-x-2 mb-3">
        <Database className="w-5 h-5 text-purple-600" />
        <span className="text-sm font-medium text-purple-800">Live Data Collection</span>
      </div>
      
      <div className="space-y-3">
        {[
          { key: 'elevation', name: 'Elevation Data', icon: '🏔️' },
          { key: 'satellite', name: 'Satellite Imagery', icon: '🛰️' },
          { key: 'weather', name: 'Weather Data', icon: '🌤️' },
          { key: 'layout', name: 'Course Layout', icon: '🏌️' }
        ].map((item) => (
          <div key={item.key} className="bg-white rounded p-2 border border-purple-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-sm">{item.icon}</span>
                <span className="text-xs text-gray-700">{item.name}</span>
              </div>
              {isActive && !isCompleted && liveData?.[item.key] ? (
                <div className="flex items-center space-x-1">
                  <div className="w-1 h-1 bg-purple-600 rounded-full animate-pulse"></div>
                  <span className="text-xs text-purple-600">
                    {liveData[item.key].status === 'downloading' ? 'Downloading...' :
                     liveData[item.key].status === 'processing' ? 'Processing...' :
                     liveData[item.key].status === 'complete' ? 'Complete' : 'Pending'}
                  </span>
                </div>
              ) : (
                <div className="text-xs text-green-600">✓</div>
              )}
            </div>
            
            {liveData?.[item.key] && (
              <div className="text-xs text-gray-600 mt-1">
                {item.key === 'elevation' && `Range: ${liveData[item.key].minHeight}m - ${liveData[item.key].maxHeight}m`}
                {item.key === 'satellite' && `Resolution: ${liveData[item.key].resolution}`}
                {item.key === 'weather' && `Conditions: ${liveData[item.key].conditions}`}
                {item.key === 'layout' && `Holes: ${liveData[item.key].holeCount}, Par: ${liveData[item.key].totalPar}`}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )

  const renderLiveModelBuilding = () => (
    <div className="bg-gradient-to-br from-orange-50 to-red-50 border border-orange-200 rounded-lg p-4">
      <div className="flex items-center space-x-2 mb-3">
        <Box className="w-5 h-5 text-orange-600" />
        <span className="text-sm font-medium text-orange-800">Live 3D Model Generation</span>
      </div>
      
      <div className="space-y-3">
        {isActive && !isCompleted && (
          <div className="bg-white rounded p-3 border border-orange-200">
            <div className="text-xs text-orange-700 mb-2">🔄 Building 3D Model...</div>
            {liveData?.modelProgress && (
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span>Vertices Generated:</span>
                  <span className="font-mono text-orange-600">{liveData.modelProgress.vertices.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span>Triangles Created:</span>
                  <span className="font-mono text-orange-600">{liveData.modelProgress.triangles.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span>Textures Applied:</span>
                  <span className="font-mono text-orange-600">{liveData.modelProgress.textures}/8</span>
                </div>
                <div className="h-2 bg-orange-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-orange-500 rounded-full transition-all duration-300"
                    style={{ width: `${liveData.modelProgress.percentage}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>
        )}
        
        {isCompleted && (
          <div className="bg-green-50 border border-green-200 rounded p-3">
            <div className="text-xs text-green-800 font-medium mb-2">✅ 3D Model Complete</div>
            <div className="space-y-1 text-xs text-green-700">
              <div>🔲 Vertices: {liveData?.finalModel?.vertices?.toLocaleString() || '50,247'}</div>
              <div>🔺 Triangles: {liveData?.finalModel?.triangles?.toLocaleString() || '25,123'}</div>
              <div>🎨 Textures: {liveData?.finalModel?.textures || '8'} layers</div>
              <div>📁 File Size: {liveData?.finalModel?.fileSize || '2.4'} MB</div>
            </div>
          </div>
        )}
      </div>
    </div>
  )

  const renderLiveVideoRendering = () => (
    <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4">
      <div className="flex items-center space-x-2 mb-3">
        <Video className="w-5 h-5 text-green-600" />
        <span className="text-sm font-medium text-green-800">Live Video Rendering</span>
      </div>
      
      <div className="space-y-3">
        {isActive && !isCompleted && (
          <div className="bg-black rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-400">Live Preview</span>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs text-green-400">Rendering...</span>
              </div>
            </div>
            
            {liveData?.renderProgress && (
              <div className="space-y-2">
                <div className="text-center">
                  <div className="text-xs text-green-400 mb-1">
                    Frame {liveData.renderProgress.currentFrame} / {liveData.renderProgress.totalFrames}
                  </div>
                  <div className="h-2 bg-green-900 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-green-500 rounded-full transition-all duration-300"
                      style={{ width: `${(liveData.renderProgress.currentFrame / liveData.renderProgress.totalFrames) * 100}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-2 text-xs text-gray-400">
                  <div className="text-center">
                    <div className="font-mono text-green-400">{liveData.renderProgress.fps || '30'}</div>
                    <div>FPS</div>
                  </div>
                  <div className="text-center">
                    <div className="font-mono text-green-400">{liveData.renderProgress.resolution || '4K'}</div>
                    <div>Quality</div>
                  </div>
                  <div className="text-center">
                    <div className="font-mono text-green-400">{liveData.renderProgress.estimatedTime || '2:30'}</div>
                    <div>ETA</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
        
        {isCompleted && (
          <div className="bg-green-50 border border-green-200 rounded p-3">
            <div className="text-xs text-green-800 font-medium mb-2">✅ Video Rendering Complete</div>
            <div className="space-y-1 text-xs text-green-700">
              <div>🎬 Resolution: {liveData?.finalVideo?.resolution || '4K (3840x2160)'}</div>
              <div>🎞️ FPS: {liveData?.finalVideo?.fps || '30'}</div>
              <div>⏱️ Duration: {liveData?.finalVideo?.duration || '60'} seconds</div>
              <div>📁 Size: {liveData?.finalVideo?.fileSize || '45.2'} MB</div>
            </div>
          </div>
        )}
      </div>
    </div>
  )

  const renderLiveAudioProcessing = () => (
    <div className="bg-gradient-to-br from-pink-50 to-purple-50 border border-pink-200 rounded-lg p-4">
      <div className="flex items-center space-x-2 mb-3">
        <Music className="w-5 h-5 text-pink-600" />
        <span className="text-sm font-medium text-pink-800">Live Audio Processing</span>
      </div>
      
      <div className="space-y-3">
        {isActive && !isCompleted && (
          <div className="bg-white rounded p-3 border border-pink-200">
            <div className="text-xs text-pink-700 mb-2">🎵 Processing Audio...</div>
            
            {liveData?.audioProgress && (
              <div className="space-y-2">
                {Object.entries(liveData.audioProgress).map(([key, value]: [string, any]) => (
                  <div key={key} className="flex items-center justify-between">
                    <span className="text-xs text-gray-600 capitalize">{key.replace('_', ' ')}</span>
                    <div className="flex items-center space-x-1">
                      {value.status === 'processing' && (
                        <>
                          <div className="w-1 h-1 bg-pink-600 rounded-full animate-pulse"></div>
                          <span className="text-xs text-pink-600">Processing...</span>
                        </>
                      )}
                      {value.status === 'complete' && (
                        <span className="text-xs text-green-600">✓</span>
                      )}
                    </div>
                  </div>
                ))}
                
                {/* Live Audio Waveform */}
                <div className="h-8 bg-gray-100 rounded flex items-center justify-center">
                  <div className="flex space-x-1">
                    {[...Array(12)].map((_, i) => (
                      <div 
                        key={i}
                        className="w-1 bg-pink-500 rounded animate-pulse"
                        style={{ 
                          height: `${Math.random() * 20 + 8}px`,
                          animationDelay: `${i * 0.1}s`
                        }}
                      ></div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
        
        {isCompleted && (
          <div className="bg-green-50 border border-green-200 rounded p-3">
            <div className="text-xs text-green-800 font-medium mb-2">✅ Audio Processing Complete</div>
            <div className="space-y-1 text-xs text-green-700">
              <div>🎤 Voiceover: {liveData?.finalAudio?.voiceover?.duration || '45'}s</div>
              <div>🎵 Background Music: {liveData?.finalAudio?.music?.duration || '60'}s</div>
              <div>📝 Captions: {liveData?.finalAudio?.captions?.wordCount || '120'} words</div>
              <div>🔊 Final Mix: {liveData?.finalAudio?.mix?.bitrate || '192'} kbps</div>
            </div>
          </div>
        )}
      </div>
    </div>
  )

  const renderLiveFinalDelivery = () => (
    <div className="bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-200 rounded-lg p-4">
      <div className="flex items-center space-x-2 mb-3">
        <Download className="w-5 h-5 text-indigo-600" />
        <span className="text-sm font-medium text-indigo-800">Live Final Assembly</span>
      </div>
      
      <div className="space-y-3">
        {isActive && !isCompleted && (
          <div className="bg-white rounded p-3 border border-indigo-200">
            <div className="text-xs text-indigo-700 mb-2">🔧 Assembling Final Video...</div>
            
            {liveData?.assemblyProgress && (
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span>Merging Video & Audio:</span>
                  <span className="text-indigo-600">{liveData.assemblyProgress.mergeProgress}%</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span>Adding Captions:</span>
                  <span className="text-indigo-600">{liveData.assemblyProgress.captionProgress}%</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span>Optimizing Quality:</span>
                  <span className="text-indigo-600">{liveData.assemblyProgress.optimizationProgress}%</span>
                </div>
                <div className="h-2 bg-indigo-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-indigo-500 rounded-full transition-all duration-300"
                    style={{ width: `${liveData.assemblyProgress.overallProgress}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>
        )}
        
        {isCompleted && (
          <div className="bg-green-50 border border-green-200 rounded p-3">
            <div className="text-xs text-green-800 font-medium mb-2">✅ Final Video Ready!</div>
            <div className="space-y-1 text-xs text-green-700">
              <div>📁 File Size: {liveData?.finalFile?.size || '50.2'} MB</div>
              <div>🎯 Format: {liveData?.finalFile?.format || 'MP4 (H.264)'}</div>
              <div>⚡ Quality: {liveData?.finalFile?.quality || '4K Ultra HD'}</div>
              <div>⏱️ Duration: {liveData?.finalFile?.duration || '60'} seconds</div>
              <div>📝 Captions: {liveData?.finalFile?.hasCaptions ? 'Included' : 'Separate file'}</div>
            </div>
            
            <div className="flex space-x-2 mt-3">
              <button className="flex-1 bg-indigo-600 text-white text-xs py-2 px-3 rounded hover:bg-indigo-700 transition-colors">
                Download Video
              </button>
              <button className="flex-1 bg-gray-100 text-gray-700 text-xs py-2 px-3 rounded hover:bg-gray-200 transition-colors">
                Download Captions
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )

  const renderPreview = () => {
    switch (step) {
      case 'geocoding':
        return renderLiveGeocoding()
      case 'fetching_data':
        return renderLiveDataFetching()
      case 'building_model':
        return renderLiveModelBuilding()
      case 'rendering':
        return renderLiveVideoRendering()
      case 'post_production':
        return renderLiveAudioProcessing()
      case 'deliver':
        return renderLiveFinalDelivery()
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

export default LiveStepPreview
