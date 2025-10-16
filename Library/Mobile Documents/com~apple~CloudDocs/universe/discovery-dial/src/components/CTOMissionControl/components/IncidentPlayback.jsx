import React, { useState } from 'react'

const IncidentPlayback = ({ incidents }) => {
  const [selectedIncident, setSelectedIncident] = useState(null)
  const [playbackSpeed, setPlaybackSpeed] = useState(1)
  const [isPlaying, setIsPlaying] = useState(false)

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'P0': return 'text-red-600 bg-red-100 border-red-200'
      case 'P1': return 'text-orange-600 bg-orange-100 border-orange-200'
      case 'P2': return 'text-yellow-600 bg-yellow-100 border-yellow-200'
      default: return 'text-gray-600 bg-gray-100 border-gray-200'
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'text-red-600 bg-red-100'
      case 'investigating': return 'text-yellow-600 bg-yellow-100'
      case 'resolved': return 'text-green-600 bg-green-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'P0': return '🚨'
      case 'P1': return '⚠️'
      case 'P2': return 'ℹ️'
      default: return '📋'
    }
  }

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString()
  }

  const formatDuration = (minutes) => {
    if (!minutes) return 'N/A'
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`
  }

  const handlePlayback = (incident) => {
    setSelectedIncident(incident)
    setIsPlaying(true)
    // Simulate playback
    setTimeout(() => {
      setIsPlaying(false)
    }, 3000)
  }

  if (!incidents || incidents.length === 0) {
    return (
      <div className="text-center text-gray-500">
        <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <p>No incidents available for playback</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Incident Playback (Replay Mode)</h3>
        <p className="text-sm text-gray-600">
          Review and analyze past incidents with detailed playback functionality
        </p>
      </div>

      {/* Playback Controls */}
      {selectedIncident && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-blue-900">
                Playing: {selectedIncident.type}
              </h4>
              <p className="text-xs text-blue-700">
                {formatTimestamp(selectedIncident.timestamp)}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <label className="text-xs text-blue-700">Speed:</label>
                <select
                  value={playbackSpeed}
                  onChange={(e) => setPlaybackSpeed(parseFloat(e.target.value))}
                  className="border border-blue-300 rounded px-2 py-1 text-xs"
                >
                  <option value={0.5}>0.5x</option>
                  <option value={1}>1x</option>
                  <option value={2}>2x</option>
                  <option value={4}>4x</option>
                </select>
              </div>
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
              >
                {isPlaying ? 'Pause' : 'Play'}
              </button>
              <button
                onClick={() => setSelectedIncident(null)}
                className="bg-gray-600 text-white px-3 py-1 rounded text-sm hover:bg-gray-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Incidents List */}
      <div className="space-y-4">
        {incidents.map((incident) => (
          <div key={incident.id} className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3">
                <div className={`p-2 rounded-full ${getSeverityColor(incident.severity)}`}>
                  <span className="text-lg">{getSeverityIcon(incident.severity)}</span>
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSeverityColor(incident.severity)}`}>
                      {incident.severity}
                    </span>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(incident.status)}`}>
                      {incident.status}
                    </span>
                  </div>
                  
                  <h4 className="text-sm font-medium text-gray-900 mb-1">
                    {incident.type}
                  </h4>
                  
                  <p className="text-sm text-gray-600 mb-3">
                    {incident.description}
                  </p>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs text-gray-500">
                    <div>
                      <span className="font-medium">Timestamp:</span>
                      <br />
                      {formatTimestamp(incident.timestamp)}
                    </div>
                    <div>
                      <span className="font-medium">Affected Events:</span>
                      <br />
                      {incident.affectedEvents}
                    </div>
                    <div>
                      <span className="font-medium">Resolution Time:</span>
                      <br />
                      {formatDuration(incident.resolutionTime)}
                    </div>
                    <div>
                      <span className="font-medium">Status:</span>
                      <br />
                      <span className={`capitalize ${getStatusColor(incident.status)}`}>
                        {incident.status}
                      </span>
                    </div>
                  </div>
                  
                  {incident.resolution && (
                    <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded">
                      <h5 className="text-xs font-medium text-green-800 mb-1">Resolution:</h5>
                      <p className="text-xs text-green-700">{incident.resolution}</p>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex flex-col space-y-2">
                <button
                  onClick={() => handlePlayback(incident)}
                  className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                >
                  Playback
                </button>
                <button className="text-gray-600 hover:text-gray-800 text-sm">
                  View Details
                </button>
                <button className="text-gray-600 hover:text-gray-800 text-sm">
                  Export Log
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Incident Summary */}
      <div className="bg-white rounded-lg shadow p-6">
        <h4 className="text-lg font-medium text-gray-900 mb-4">Incident Summary</h4>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600 mb-1">
              {incidents.filter(i => i.severity === 'P0').length}
            </div>
            <div className="text-sm text-gray-600">P0 Incidents</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600 mb-1">
              {incidents.filter(i => i.severity === 'P1').length}
            </div>
            <div className="text-sm text-gray-600">P1 Incidents</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600 mb-1">
              {incidents.filter(i => i.severity === 'P2').length}
            </div>
            <div className="text-sm text-gray-600">P2 Incidents</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600 mb-1">
              {incidents.filter(i => i.status === 'resolved').length}
            </div>
            <div className="text-sm text-gray-600">Resolved</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default IncidentPlayback


