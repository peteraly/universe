import React, { useState } from 'react'

const Layer3Config = ({ config = {}, onSave }) => {
  const [localConfig, setLocalConfig] = useState({
    aiConfidenceThreshold: 85,
    autoSyncInterval: '15 minutes',
    maxEventsPerPage: 50,
    enableNotifications: true,
    enableAutoPublish: false,
    ...config
  })

  const handleSave = () => {
    onSave(localConfig)
  }

  const handleConfigChange = (key, value) => {
    setLocalConfig(prev => ({ ...prev, [key]: value }))
  }

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Configuration</h2>
          <p className="text-gray-600">System settings and controls</p>
        </div>

        <div className="space-y-8">
          {/* AI Thresholds */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Thresholds</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  AI Confidence Threshold: {localConfig.aiConfidenceThreshold}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={localConfig.aiConfidenceThreshold}
                  onChange={(e) => handleConfigChange('aiConfidenceThreshold', parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>0%</span>
                  <span>100%</span>
                </div>
              </div>
            </div>
          </div>

          {/* System Settings */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">System Settings</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Auto-Sync Interval
                </label>
                <select
                  value={localConfig.autoSyncInterval}
                  onChange={(e) => handleConfigChange('autoSyncInterval', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="5 minutes">5 minutes</option>
                  <option value="15 minutes">15 minutes</option>
                  <option value="30 minutes">30 minutes</option>
                  <option value="1 hour">1 hour</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max Events Per Page
                </label>
                <input
                  type="number"
                  value={localConfig.maxEventsPerPage}
                  onChange={(e) => handleConfigChange('maxEventsPerPage', parseInt(e.target.value))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Toggle Settings */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Feature Toggles</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Enable Notifications</h4>
                  <p className="text-sm text-gray-500">Receive alerts for system events</p>
                </div>
                <button
                  onClick={() => handleConfigChange('enableNotifications', !localConfig.enableNotifications)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    localConfig.enableNotifications ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      localConfig.enableNotifications ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Auto-Publish Events</h4>
                  <p className="text-sm text-gray-500">Automatically publish events above confidence threshold</p>
                </div>
                <button
                  onClick={() => handleConfigChange('enableAutoPublish', !localConfig.enableAutoPublish)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    localConfig.enableAutoPublish ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      localConfig.enableAutoPublish ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <button
              onClick={handleSave}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Save Configuration
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Layer3Config
