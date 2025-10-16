import { useState, useEffect, useCallback, memo } from 'react';

// Performance targets (iPhone Compass level)
const PERFORMANCE_TARGETS = {
  ANIMATION_FPS: 60,                     // Smooth animations
  GESTURE_LATENCY: 16,                   // <16ms response time
  RENDER_TIME: 8,                        // <8ms render time
  MEMORY_USAGE: 50,                      // <50MB memory usage
  BATTERY_IMPACT: 'minimal',             // Battery friendly
};

const PerformanceMonitor = ({ isVisible, onClose }) => {
  const [metrics, setMetrics] = useState({
    fps: 0,
    renderTime: 0,
    memoryUsage: 0,
    gestureLatency: 0,
    frameDrops: 0
  });

  const [isMonitoring, setIsMonitoring] = useState(false);
  const [frameCount, setFrameCount] = useState(0);
  const [lastTime, setLastTime] = useState(performance.now());

  // FPS monitoring
  const measureFPS = useCallback(() => {
    const now = performance.now();
    const delta = now - lastTime;
    
    if (delta >= 1000) { // Update every second
      const fps = Math.round((frameCount * 1000) / delta);
      setMetrics(prev => ({ ...prev, fps }));
      setFrameCount(0);
      setLastTime(now);
    }
    
    setFrameCount(prev => prev + 1);
    
    if (isMonitoring) {
      requestAnimationFrame(measureFPS);
    }
  }, [frameCount, lastTime, isMonitoring]);

  // Memory usage monitoring
  const measureMemory = useCallback(() => {
    if (performance.memory) {
      const memoryMB = Math.round(performance.memory.usedJSHeapSize / 1024 / 1024);
      setMetrics(prev => ({ ...prev, memoryUsage: memoryMB }));
    }
  }, []);

  // Render time monitoring
  const measureRenderTime = useCallback(() => {
    const start = performance.now();
    
    // Simulate render measurement
    requestAnimationFrame(() => {
      const end = performance.now();
      const renderTime = end - start;
      setMetrics(prev => ({ ...prev, renderTime: Math.round(renderTime * 100) / 100 }));
    });
  }, []);

  // Start monitoring
  const startMonitoring = useCallback(() => {
    setIsMonitoring(true);
    measureFPS();
    measureMemory();
    measureRenderTime();
  }, [measureFPS, measureMemory, measureRenderTime]);

  // Stop monitoring
  const stopMonitoring = useCallback(() => {
    setIsMonitoring(false);
  }, []);

  // Get performance status
  const getPerformanceStatus = (metric, target) => {
    if (metric <= target) return 'excellent';
    if (metric <= target * 1.2) return 'good';
    if (metric <= target * 1.5) return 'fair';
    return 'poor';
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'excellent': return 'text-green-600';
      case 'good': return 'text-blue-600';
      case 'fair': return 'text-yellow-600';
      case 'poor': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  // Get status icon
  const getStatusIcon = (status) => {
    switch (status) {
      case 'excellent': return '🟢';
      case 'good': return '🔵';
      case 'fair': return '🟡';
      case 'poor': return '🔴';
      default: return '⚪';
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Performance Monitor</h2>
              <p className="text-gray-600 mt-1">iPhone Compass level performance targets</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <span className="text-2xl">×</span>
            </button>
          </div>
        </div>

        {/* Controls */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex space-x-4">
            <button
              onClick={isMonitoring ? stopMonitoring : startMonitoring}
              className={`px-4 py-2 rounded-lg transition-colors ${
                isMonitoring 
                  ? 'bg-red-600 text-white hover:bg-red-700' 
                  : 'bg-green-600 text-white hover:bg-green-700'
              }`}
            >
              {isMonitoring ? 'Stop Monitoring' : 'Start Monitoring'}
            </button>
            <button
              onClick={() => setMetrics({
                fps: 0,
                renderTime: 0,
                memoryUsage: 0,
                gestureLatency: 0,
                frameDrops: 0
              })}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Reset
            </button>
          </div>
        </div>

        {/* Metrics */}
        <div className="p-6 space-y-4">
          {/* FPS */}
          <div className="p-4 border rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900">Frame Rate</h3>
                <p className="text-sm text-gray-600">Target: {PERFORMANCE_TARGETS.ANIMATION_FPS} FPS</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900">{metrics.fps}</div>
                <div className={`text-sm ${getStatusColor(getPerformanceStatus(metrics.fps, PERFORMANCE_TARGETS.ANIMATION_FPS))}`}>
                  {getStatusIcon(getPerformanceStatus(metrics.fps, PERFORMANCE_TARGETS.ANIMATION_FPS))} {getPerformanceStatus(metrics.fps, PERFORMANCE_TARGETS.ANIMATION_FPS)}
                </div>
              </div>
            </div>
          </div>

          {/* Render Time */}
          <div className="p-4 border rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900">Render Time</h3>
                <p className="text-sm text-gray-600">Target: &lt;{PERFORMANCE_TARGETS.RENDER_TIME}ms</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900">{metrics.renderTime}ms</div>
                <div className={`text-sm ${getStatusColor(getPerformanceStatus(PERFORMANCE_TARGETS.RENDER_TIME, metrics.renderTime))}`}>
                  {getStatusIcon(getPerformanceStatus(PERFORMANCE_TARGETS.RENDER_TIME, metrics.renderTime))} {getPerformanceStatus(PERFORMANCE_TARGETS.RENDER_TIME, metrics.renderTime)}
                </div>
              </div>
            </div>
          </div>

          {/* Memory Usage */}
          <div className="p-4 border rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900">Memory Usage</h3>
                <p className="text-sm text-gray-600">Target: &lt;{PERFORMANCE_TARGETS.MEMORY_USAGE}MB</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900">{metrics.memoryUsage}MB</div>
                <div className={`text-sm ${getStatusColor(getPerformanceStatus(PERFORMANCE_TARGETS.MEMORY_USAGE, metrics.memoryUsage))}`}>
                  {getStatusIcon(getPerformanceStatus(PERFORMANCE_TARGETS.MEMORY_USAGE, metrics.memoryUsage))} {getPerformanceStatus(PERFORMANCE_TARGETS.MEMORY_USAGE, metrics.memoryUsage)}
                </div>
              </div>
            </div>
          </div>

          {/* Gesture Latency */}
          <div className="p-4 border rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900">Gesture Latency</h3>
                <p className="text-sm text-gray-600">Target: &lt;{PERFORMANCE_TARGETS.GESTURE_LATENCY}ms</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900">{metrics.gestureLatency}ms</div>
                <div className={`text-sm ${getStatusColor(getPerformanceStatus(PERFORMANCE_TARGETS.GESTURE_LATENCY, metrics.gestureLatency))}`}>
                  {getStatusIcon(getPerformanceStatus(PERFORMANCE_TARGETS.GESTURE_LATENCY, metrics.gestureLatency))} {getPerformanceStatus(PERFORMANCE_TARGETS.GESTURE_LATENCY, metrics.gestureLatency)}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Status */}
        <div className="p-6 bg-gray-50 border-t">
          <div className="text-center">
            <div className="text-sm text-gray-600">
              {isMonitoring ? 'Monitoring performance...' : 'Click "Start Monitoring" to begin'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default memo(PerformanceMonitor);


