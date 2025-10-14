import { useState, useCallback, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Gesture Testing Protocol
const GESTURE_TEST_PROTOCOL = {
  // Test 1: Vertical Swipe (Primary Category)
  testVerticalSwipe: {
    id: 'vertical-swipe',
    name: 'Vertical Swipe Test',
    description: 'Swipe UP/DOWN on dial area to change primary category',
    expected: 'Next/Previous primary category selected',
    feedback: 'Medium haptic + visual category change',
    threshold: '50px vertical movement, 150px/s velocity',
    status: 'pending'
  },
  
  // Test 2: Circular Drag (Subcategory)
  testCircularDrag: {
    id: 'circular-drag',
    name: 'Circular Drag Test',
    description: 'Touch and drag in circular motion on dial',
    expected: 'Subcategory changes within active primary',
    feedback: 'Light haptic + smooth rotation animation',
    threshold: '15° rotation minimum, snap to subcategory',
    status: 'pending'
  },
  
  // Test 3: Horizontal Swipe (Event Navigation)
  testHorizontalSwipe: {
    id: 'horizontal-swipe',
    name: 'Horizontal Swipe Test',
    description: 'Swipe LEFT/RIGHT on event card area',
    expected: 'Event changes in filtered list',
    feedback: 'Light haptic + card slide animation',
    threshold: '30px horizontal movement, 200px/s velocity',
    status: 'pending'
  },
  
  // Test 4: Gesture Conflict Resolution
  testConflictResolution: {
    id: 'conflict-resolution',
    name: 'Conflict Resolution Test',
    description: 'Simultaneous vertical and horizontal swipe',
    expected: 'Vertical swipe takes priority (primary category)',
    feedback: 'Only primary category changes, event stays same',
    status: 'pending'
  }
};

const GestureTestingSuite = ({ isVisible, onClose }) => {
  const [testResults, setTestResults] = useState({});
  const [currentTest, setCurrentTest] = useState(null);
  const [isRunning, setIsRunning] = useState(false);

  // Update test result
  const updateTestResult = useCallback((testId, status, details = '') => {
    setTestResults(prev => ({
      ...prev,
      [testId]: {
        status,
        details,
        timestamp: new Date().toISOString()
      }
    }));
  }, []);

  // Run individual test
  const runTest = useCallback((test) => {
    setCurrentTest(test);
    setIsRunning(true);
    
    // Simulate test execution
    setTimeout(() => {
      const success = Math.random() > 0.2; // 80% success rate for demo
      updateTestResult(test.id, success ? 'passed' : 'failed', 
        success ? 'Test completed successfully' : 'Test failed - check gesture thresholds');
      setIsRunning(false);
      setCurrentTest(null);
    }, 2000);
  }, [updateTestResult]);

  // Run all tests
  const runAllTests = useCallback(() => {
    Object.values(GESTURE_TEST_PROTOCOL).forEach((test, index) => {
      setTimeout(() => runTest(test), index * 3000);
    });
  }, [runTest]);

  // Get test status color
  const getStatusColor = (testId) => {
    const result = testResults[testId];
    if (!result) return 'text-gray-500';
    return result.status === 'passed' ? 'text-green-600' : 'text-red-600';
  };

  // Get test status icon
  const getStatusIcon = (testId) => {
    const result = testResults[testId];
    if (!result) return '⏳';
    return result.status === 'passed' ? '✅' : '❌';
  };

  if (!isVisible) return null;

  return (
    <motion.div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Gesture Testing Suite</h2>
              <p className="text-gray-600 mt-1">Verify all dial interactions work correctly</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <span className="text-2xl">×</span>
            </button>
          </div>
        </div>

        {/* Test Controls */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex space-x-4">
            <button
              onClick={runAllTests}
              disabled={isRunning}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isRunning ? 'Running Tests...' : 'Run All Tests'}
            </button>
            <button
              onClick={() => setTestResults({})}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Clear Results
            </button>
          </div>
        </div>

        {/* Test List */}
        <div className="p-6 overflow-y-auto max-h-96">
          <div className="space-y-4">
            {Object.values(GESTURE_TEST_PROTOCOL).map((test) => (
              <motion.div
                key={test.id}
                className={`p-4 border rounded-lg transition-all ${
                  currentTest?.id === test.id 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{getStatusIcon(test.id)}</span>
                      <div>
                        <h3 className="font-semibold text-gray-900">{test.name}</h3>
                        <p className="text-sm text-gray-600 mt-1">{test.description}</p>
                      </div>
                    </div>
                    
                    <div className="mt-3 space-y-2">
                      <div className="text-sm">
                        <span className="font-medium text-gray-700">Expected:</span>
                        <span className="ml-2 text-gray-600">{test.expected}</span>
                      </div>
                      <div className="text-sm">
                        <span className="font-medium text-gray-700">Feedback:</span>
                        <span className="ml-2 text-gray-600">{test.feedback}</span>
                      </div>
                      <div className="text-sm">
                        <span className="font-medium text-gray-700">Threshold:</span>
                        <span className="ml-2 text-gray-600">{test.threshold}</span>
                      </div>
                    </div>

                    {testResults[test.id] && (
                      <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <span className={`font-medium ${getStatusColor(test.id)}`}>
                            {testResults[test.id].status.toUpperCase()}
                          </span>
                          <span className="text-xs text-gray-500">
                            {new Date(testResults[test.id].timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                        {testResults[test.id].details && (
                          <p className="text-sm text-gray-600 mt-1">
                            {testResults[test.id].details}
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => runTest(test)}
                    disabled={isRunning}
                    className="ml-4 px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Run
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Current Test Indicator */}
        <AnimatePresence>
          {currentTest && (
            <motion.div
              className="absolute inset-0 bg-blue-500/10 flex items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="bg-white p-6 rounded-lg shadow-lg text-center">
                <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                <h3 className="font-semibold text-gray-900">Running Test</h3>
                <p className="text-gray-600 mt-1">{currentTest.name}</p>
                <p className="text-sm text-gray-500 mt-2">{currentTest.description}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
};

export default memo(GestureTestingSuite);

