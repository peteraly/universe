import React, { useState, useCallback } from 'react'

const Layer3Configuration = ({ config, onConfigUpdate }) => {
  const [localConfig, setLocalConfig] = useState({
    autoRefresh: false,
    refreshInterval: 6, // hours
    maxEventsPerPage: 20,
    enableNotifications: true,
    enableAutoPublish: false,
    aiConfidenceThreshold: 85,
    ...config
  })

  const [toasts, setToasts] = useState([])

  // Toast management
  const showToast = useCallback((type, title, message) => {
    const id = Date.now()
    setToasts(prev => [...prev, { id, type, title, message }])
    setTimeout(() => removeToast(id), 5000)
  }, [])

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }, [])

  const handleConfigChange = (key, value) => {
    setLocalConfig(prev => ({ ...prev, [key]: value }))
  }

  const handleSave = () => {
    onConfigUpdate(localConfig)
    showToast('success', 'Configuration Saved', 'Settings have been updated successfully')
  }

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Global Configuration</h2>
          <p className="text-gray-600">System settings and controls</p>
        </div>

        <div className="space-y-8">
          {/* Auto-Refresh Settings */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Auto-Refresh Settings</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Enable Auto-Refresh</h4>
                  <p className="text-sm text-gray-500">Automatically check for new events</p>
                </div>
                <button
                  onClick={() => handleConfigChange('autoRefresh', !localConfig.autoRefresh)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    localConfig.autoRefresh ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      localConfig.autoRefresh ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
              
              {localConfig.autoRefresh && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Refresh Interval: {localConfig.refreshInterval} hours
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="24"
                    value={localConfig.refreshInterval}
                    onChange={(e) => handleConfigChange('refreshInterval', parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>1 hour</span>
                    <span>24 hours</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Display Settings */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Display Settings</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Events Per Page: {localConfig.maxEventsPerPage}
                </label>
                <input
                  type="range"
                  min="10"
                  max="100"
                  value={localConfig.maxEventsPerPage}
                  onChange={(e) => handleConfigChange('maxEventsPerPage', parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>10</span>
                  <span>100</span>
                </div>
              </div>
            </div>
          </div>

          {/* AI Settings */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Settings</h3>
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
              
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Enable Auto-Publish</h4>
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

          {/* Notification Settings */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Notification Settings</h3>
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

      {/* Toast Notifications */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className="bg-white border border-gray-200 rounded-lg shadow-lg p-4 max-w-sm"
          >
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <span className="text-lg">
                  {toast.type === 'success' ? '✅' : 
                   toast.type === 'warning' ? '⚠️' : 
                   toast.type === 'error' ? '❌' : 'ℹ️'}
                </span>
              </div>
              <div className="ml-3 flex-1">
                <h4 className="text-sm font-medium text-gray-900">{toast.title}</h4>
                <p className="text-sm text-gray-500 mt-1">{toast.message}</p>
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="ml-4 text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Layer3Configuration


