import React, { useEffect, useCallback } from 'react'

// Keyboard shortcut hook
export const useKeyboardShortcuts = (shortcuts = {}) => {
  const handleKeyDown = useCallback((event) => {
    // Don't trigger shortcuts if user is typing in an input
    if (
      event.target.tagName === 'INPUT' ||
      event.target.tagName === 'TEXTAREA' ||
      event.target.contentEditable === 'true'
    ) {
      return
    }

    // Build the key combination string
    const keys = []
    if (event.ctrlKey || event.metaKey) keys.push('ctrl')
    if (event.altKey) keys.push('alt')
    if (event.shiftKey) keys.push('shift')
    keys.push(event.key.toLowerCase())

    const combination = keys.join('+')
    
    // Find matching shortcut
    const shortcut = shortcuts[combination]
    if (shortcut) {
      event.preventDefault()
      shortcut.action(event)
    }
  }, [shortcuts])

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])
}

// Keyboard shortcuts component
const KeyboardShortcuts = ({ 
  shortcuts = {},
  showHelp = false,
  onToggleHelp 
}) => {
  useKeyboardShortcuts(shortcuts)

  const shortcutGroups = {
    'Navigation': [
      { keys: 'ctrl+1', description: 'Go to Dashboard' },
      { keys: 'ctrl+2', description: 'Go to Events' },
      { keys: 'ctrl+3', description: 'Go to System Health' },
      { keys: 'ctrl+4', description: 'Go to Configuration' },
      { keys: 'ctrl+5', description: 'Go to Intelligence' },
      { keys: 'ctrl+6', description: 'Go to Data Pipeline' }
    ],
    'Actions': [
      { keys: 'ctrl+n', description: 'Add New Event' },
      { keys: 'ctrl+s', description: 'Save Changes' },
      { keys: 'ctrl+r', description: 'Refresh Data' },
      { keys: 'ctrl+f', description: 'Search' },
      { keys: 'ctrl+shift+r', description: 'Run Manual Sync' }
    ],
    'General': [
      { keys: '?', description: 'Show/Hide Help' },
      { keys: 'escape', description: 'Close Modal/Cancel' },
      { keys: 'ctrl+/', description: 'Toggle Help Panel' }
    ]
  }

  if (!showHelp) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-96 overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Keyboard Shortcuts</h2>
            <button
              onClick={onToggleHelp}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <span className="sr-only">Close</span>
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="space-y-6">
            {Object.entries(shortcutGroups).map(([group, shortcuts]) => (
              <div key={group}>
                <h3 className="text-sm font-medium text-gray-900 mb-3">{group}</h3>
                <div className="space-y-2">
                  {shortcuts.map((shortcut, index) => (
                    <div key={index} className="flex items-center justify-between py-2">
                      <span className="text-sm text-gray-600">{shortcut.description}</span>
                      <kbd className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-800 text-xs font-mono rounded border">
                        {shortcut.keys}
                      </kbd>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              Press <kbd className="px-1 py-0.5 bg-gray-100 text-gray-800 text-xs font-mono rounded">?</kbd> or <kbd className="px-1 py-0.5 bg-gray-100 text-gray-800 text-xs font-mono rounded">Ctrl+/</kbd> to toggle this help panel.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

// Predefined shortcut configurations
export const defaultShortcuts = {
  // Navigation shortcuts
  'ctrl+1': { action: () => window.location.href = '/admin' },
  'ctrl+2': { action: () => window.location.href = '/admin/events' },
  'ctrl+3': { action: () => window.location.href = '/admin/health' },
  'ctrl+4': { action: () => window.location.href = '/admin/config' },
  'ctrl+5': { action: () => window.location.href = '/admin/intelligence' },
  'ctrl+6': { action: () => window.location.href = '/admin/pipeline' },
  
  // Action shortcuts
  'ctrl+n': { action: () => console.log('Add New Event') },
  'ctrl+s': { action: () => console.log('Save Changes') },
  'ctrl+r': { action: () => window.location.reload() },
  'ctrl+f': { action: () => console.log('Search') },
  'ctrl+shift+r': { action: () => console.log('Run Manual Sync') },
  
  // General shortcuts
  'escape': { action: () => console.log('Close Modal') }
}

// Hook for managing help panel state
export const useKeyboardHelp = () => {
  const [showHelp, setShowHelp] = React.useState(false)
  
  const toggleHelp = useCallback(() => {
    setShowHelp(prev => !prev)
  }, [])
  
  const shortcuts = React.useMemo(() => ({
    ...defaultShortcuts,
    '?': { action: toggleHelp },
    'ctrl+/': { action: toggleHelp }
  }), [toggleHelp])
  
  return {
    showHelp,
    toggleHelp,
    shortcuts
  }
}

export default KeyboardShortcuts
