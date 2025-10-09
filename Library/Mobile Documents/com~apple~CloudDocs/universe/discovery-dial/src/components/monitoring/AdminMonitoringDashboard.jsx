import React, { useState, useEffect, useRef } from 'react';
import AdminInteractionTracker from '../../lib/monitoring/AdminInteractionTracker.js';
import BugDetectionEngine from '../../lib/monitoring/BugDetectionEngine.js';
import LiveRecommendationEngine from '../../lib/monitoring/LiveRecommendationEngine.js';

const AdminMonitoringDashboard = () => {
  // Core monitoring systems
  const [tracker] = useState(() => new AdminInteractionTracker());
  const [bugDetector] = useState(() => new BugDetectionEngine());
  const [recommendationEngine] = useState(() => new LiveRecommendationEngine());
  
  // State management
  const [interactions, setInteractions] = useState([]);
  const [issues, setIssues] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [performanceMetrics, setPerformanceMetrics] = useState({});
  const [isMonitoring, setIsMonitoring] = useState(true);
  const [selectedTab, setSelectedTab] = useState('overview');
  
  // Refs for cleanup
  const updateIntervalRef = useRef(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    // Start monitoring
    startMonitoring();
    
    // Set up periodic updates
    updateIntervalRef.current = setInterval(updateDashboard, 2000);
    
    // Cleanup on unmount
    return () => {
      mountedRef.current = false;
      if (updateIntervalRef.current) {
        clearInterval(updateIntervalRef.current);
      }
      tracker.stopMonitoring();
    };
  }, []);

  const startMonitoring = () => {
    tracker.startMonitoring();
    setIsMonitoring(true);
    
    // Track dashboard load
    tracker.trackInteraction('monitoring_dashboard_load', 'AdminMonitoringDashboard', {
      timestamp: Date.now(),
      userAgent: navigator.userAgent
    });
  };

  const updateDashboard = () => {
    if (!mountedRef.current) return;
    
    // Update interactions
    const latestInteractions = tracker.interactions.slice(-20);
    setInteractions(latestInteractions);
    
    // Update performance metrics
    const metrics = tracker.getSessionSummary();
    setPerformanceMetrics(metrics);
    
    // Generate new recommendations
    const newRecommendations = recommendationEngine.generateRecommendations(
      tracker.interactions,
      bugDetector.detectionHistory
    );
    setRecommendations(newRecommendations);
    
    // Update issues
    const recentIssues = bugDetector.detectionHistory.slice(-20);
    setIssues(recentIssues);
  };

  const handleMonitoringToggle = () => {
    if (isMonitoring) {
      tracker.stopMonitoring();
      setIsMonitoring(false);
    } else {
      tracker.startMonitoring();
      setIsMonitoring(true);
    }
    
    tracker.trackInteraction('monitoring_toggle', 'AdminMonitoringDashboard', {
      action: isMonitoring ? 'stop' : 'start'
    });
  };

  const handleClearData = () => {
    tracker.clearData();
    bugDetector.detectionHistory = [];
    recommendationEngine.recommendationHistory = [];
    setInteractions([]);
    setIssues([]);
    setRecommendations([]);
    
    tracker.trackInteraction('monitoring_clear_data', 'AdminMonitoringDashboard', {
      timestamp: Date.now()
    });
  };

  const handleExportData = () => {
    const exportData = {
      tracker: tracker.exportData(),
      bugDetector: bugDetector.exportDetectionData(),
      recommendationEngine: recommendationEngine.exportRecommendationData(),
      exportedAt: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `admin-monitoring-data-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    tracker.trackInteraction('monitoring_export_data', 'AdminMonitoringDashboard', {
      dataSize: JSON.stringify(exportData).length
    });
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'critical': return 'border-l-red-500 bg-red-50';
      case 'high': return 'border-l-orange-500 bg-orange-50';
      case 'medium': return 'border-l-yellow-500 bg-yellow-50';
      case 'low': return 'border-l-blue-500 bg-blue-50';
      default: return 'border-l-gray-500 bg-gray-50';
    }
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  const formatDuration = (seconds) => {
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  return (
    <div className="admin-monitoring-dashboard p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="monitoring-header mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard Monitoring</h1>
            <p className="text-gray-600 mt-1">Real-time interaction tracking and issue detection</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <span className={`w-3 h-3 rounded-full ${isMonitoring ? 'bg-green-500' : 'bg-red-500'}`}></span>
              <span className="text-sm font-medium">
                {isMonitoring ? '🟢 Monitoring' : '🔴 Stopped'}
              </span>
            </div>
            <button
              onClick={handleMonitoringToggle}
              className={`px-4 py-2 rounded-md font-medium ${
                isMonitoring 
                  ? 'bg-red-600 text-white hover:bg-red-700' 
                  : 'bg-green-600 text-white hover:bg-green-700'
              }`}
            >
              {isMonitoring ? 'Stop Monitoring' : 'Start Monitoring'}
            </button>
            <button
              onClick={handleClearData}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
            >
              Clear Data
            </button>
            <button
              onClick={handleExportData}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Export Data
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'overview', name: 'Overview', icon: '📊' },
              { id: 'interactions', name: 'Interactions', icon: '🔄' },
              { id: 'issues', name: 'Issues', icon: '⚠️' },
              { id: 'recommendations', name: 'Recommendations', icon: '💡' },
              { id: 'performance', name: 'Performance', icon: '⚡' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setSelectedTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  selectedTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.icon} {tab.name}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {selectedTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Session Summary */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Session Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Duration:</span>
                  <span className="font-medium">{formatDuration(performanceMetrics.duration || 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Interactions:</span>
                  <span className="font-medium">{performanceMetrics.totalInteractions || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Bug Reports:</span>
                  <span className="font-medium">{performanceMetrics.bugReports || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Critical Issues:</span>
                  <span className="font-medium text-red-600">{performanceMetrics.criticalIssues || 0}</span>
                </div>
              </div>
            </div>

            {/* Performance Metrics */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Avg Response Time:</span>
                  <span className="font-medium">{performanceMetrics.avgResponseTime?.toFixed(0) || 0}ms</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Success Rate:</span>
                  <span className="font-medium text-green-600">{performanceMetrics.successRate?.toFixed(1) || 100}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Error Rate:</span>
                  <span className="font-medium text-red-600">{performanceMetrics.errorRate?.toFixed(1) || 0}%</span>
                </div>
              </div>
            </div>

            {/* Recent Issues */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Issues</h3>
              <div className="space-y-2">
                {issues.slice(0, 5).map((issue, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 truncate">{issue.message}</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(issue.severity)}`}>
                      {issue.severity}
                    </span>
                  </div>
                ))}
                {issues.length === 0 && (
                  <p className="text-gray-500 text-sm">No recent issues</p>
                )}
              </div>
            </div>

            {/* Active Recommendations */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Active Recommendations</h3>
              <div className="space-y-2">
                {recommendations.slice(0, 5).map((rec, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 truncate">{rec.title}</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(rec.priority)}`}>
                      {rec.priority}
                    </span>
                  </div>
                ))}
                {recommendations.length === 0 && (
                  <p className="text-gray-500 text-sm">No active recommendations</p>
                )}
              </div>
            </div>
          </div>
        )}

        {selectedTab === 'interactions' && (
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Recent Interactions</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Component</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {interactions.map((interaction, index) => (
                    <tr key={interaction.id || index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatTimestamp(interaction.timestamp)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          interaction.action.includes('error') 
                            ? 'bg-red-100 text-red-800' 
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {interaction.action}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {interaction.component}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {interaction.data.error ? (
                          <span className="text-red-600">{interaction.data.error}</span>
                        ) : (
                          <span className="text-gray-600">
                            {interaction.data.duration ? `${interaction.data.duration}ms` : 'Success'}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {selectedTab === 'issues' && (
          <div className="space-y-4">
            {issues.map((issue, index) => (
              <div key={index} className={`border-l-4 p-4 rounded-r-lg ${getSeverityColor(issue.severity)}`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="text-lg font-medium text-gray-900">{issue.message}</h4>
                    <p className="text-sm text-gray-600 mt-1">{issue.recommendation}</p>
                    <div className="mt-2 flex items-center space-x-4 text-xs text-gray-500">
                      <span>Type: {issue.type}</span>
                      <span>Severity: {issue.severity}</span>
                      <span>Time: {formatTimestamp(issue.detectedAt || issue.timestamp)}</span>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getSeverityColor(issue.severity)}`}>
                    {issue.severity}
                  </span>
                </div>
              </div>
            ))}
            {issues.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">No issues detected</p>
                <p className="text-gray-400 text-sm mt-1">System is running smoothly</p>
              </div>
            )}
          </div>
        )}

        {selectedTab === 'recommendations' && (
          <div className="space-y-4">
            {recommendations.map((rec, index) => (
              <div key={index} className={`border-l-4 p-6 rounded-r-lg ${getPriorityColor(rec.priority)}`}>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h4 className="text-xl font-semibold text-gray-900">{rec.title}</h4>
                    <p className="text-gray-600 mt-1">{rec.description}</p>
                    <p className="text-sm text-gray-500 mt-2">
                      <strong>Impact:</strong> {rec.impact}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getSeverityColor(rec.priority)}`}>
                    {rec.priority}
                  </span>
                </div>
                
                <div className="mt-4">
                  <h5 className="text-sm font-medium text-gray-900 mb-2">Recommended Actions:</h5>
                  <ul className="list-disc list-inside space-y-1">
                    {rec.actions.map((action, actionIndex) => (
                      <li key={actionIndex} className="text-sm text-gray-700">{action}</li>
                    ))}
                  </ul>
                </div>
                
                {rec.metrics && (
                  <div className="mt-4 p-3 bg-gray-100 rounded-md">
                    <h6 className="text-sm font-medium text-gray-900 mb-2">Metrics:</h6>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      {Object.entries(rec.metrics).map(([key, value]) => (
                        <div key={key} className="flex justify-between">
                          <span className="text-gray-600">{key}:</span>
                          <span className="font-medium">{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
            {recommendations.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">No recommendations available</p>
                <p className="text-gray-400 text-sm mt-1">System is performing optimally</p>
              </div>
            )}
          </div>
        )}

        {selectedTab === 'performance' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Performance Metrics */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Metrics</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Average Response Time</span>
                  <span className="text-2xl font-bold text-blue-600">
                    {performanceMetrics.avgResponseTime?.toFixed(0) || 0}ms
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Success Rate</span>
                  <span className="text-2xl font-bold text-green-600">
                    {performanceMetrics.successRate?.toFixed(1) || 100}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Error Rate</span>
                  <span className="text-2xl font-bold text-red-600">
                    {performanceMetrics.errorRate?.toFixed(1) || 0}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Interactions</span>
                  <span className="text-2xl font-bold text-gray-600">
                    {performanceMetrics.totalInteractions || 0}
                  </span>
                </div>
              </div>
            </div>

            {/* Session Information */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Session Information</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Session ID:</span>
                  <span className="font-mono text-sm text-gray-900">
                    {performanceMetrics.sessionId?.substring(0, 20)}...
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Duration:</span>
                  <span className="font-medium">{formatDuration(performanceMetrics.duration || 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Monitoring Status:</span>
                  <span className={`font-medium ${isMonitoring ? 'text-green-600' : 'text-red-600'}`}>
                    {isMonitoring ? 'Active' : 'Stopped'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Recent Interactions:</span>
                  <span className="font-medium">{performanceMetrics.recentInteractions || 0}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminMonitoringDashboard;
