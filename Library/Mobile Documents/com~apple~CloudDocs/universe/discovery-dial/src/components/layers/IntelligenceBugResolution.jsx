import React, { useState, useEffect } from 'react';
import { can } from '../../lib/auth/rbac.js';

const IntelligenceBugResolution = ({ user }) => {
  const [sliTicker, setSliTicker] = useState({
    availability: 99.9,
    latency: 120,
    throughput: 1500,
    errorRate: 0.1
  });

  const [outcomes, setOutcomes] = useState({
    algorithmicRejections: 45,
    explicitIntentRates: 78,
    manualOverrides: 12,
    autoResolutions: 156
  });

  const [incidents, setIncidents] = useState([
    {
      id: 1,
      title: 'High CPU Usage Alert',
      severity: 'P1',
      status: 'resolved',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      resolution: 'Auto-scaled server instances',
      duration: '15 minutes'
    },
    {
      id: 2,
      title: 'Database Connection Pool Exhaustion',
      severity: 'P2',
      status: 'investigating',
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      resolution: null,
      duration: '2 hours'
    }
  ]);

  const [adminFixes, setAdminFixes] = useState([
    {
      id: 1,
      eventId: 'event-123',
      issue: 'Low AI confidence score',
      action: 'Manual tag adjustment',
      timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
      admin: 'curator@discoverydial.com',
      result: 'Confidence improved from 45% to 78%'
    },
    {
      id: 2,
      eventId: 'event-456',
      issue: 'Duplicate event detection',
      action: 'Event merge and deduplication',
      timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
      admin: 'admin@discoverydial.com',
      result: 'Merged 3 duplicate events into 1'
    }
  ]);

  // Simulate real-time SLI updates
  useEffect(() => {
    const interval = setInterval(() => {
      setSliTicker(prev => ({
        availability: Math.max(99.0, Math.min(100, prev.availability + (Math.random() - 0.5) * 0.1)),
        latency: Math.max(50, Math.min(500, prev.latency + (Math.random() - 0.5) * 20)),
        throughput: Math.max(1000, Math.min(2000, prev.throughput + (Math.random() - 0.5) * 100)),
        errorRate: Math.max(0, Math.min(5, prev.errorRate + (Math.random() - 0.5) * 0.2))
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'P0': return 'bg-red-100 text-red-800 border-red-200';
      case 'P1': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'P2': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'investigating': return 'bg-yellow-100 text-yellow-800';
      case 'active': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Intelligence & Bug Resolution Center</h2>
          <p className="text-gray-600">Real-time monitoring, incident management, and AI-assisted fixes</p>
        </div>
      </div>

      {/* Real-Time SLI Ticker */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Real-Time SLI Ticker</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="text-2xl font-bold text-green-600">
              {sliTicker.availability.toFixed(1)}%
            </div>
            <div className="text-sm text-gray-600">Availability</div>
            <div className="text-xs text-green-600 mt-1">● Live</div>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="text-2xl font-bold text-blue-600">
              {Math.round(sliTicker.latency)}ms
            </div>
            <div className="text-sm text-gray-600">Latency</div>
            <div className="text-xs text-blue-600 mt-1">● Live</div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
            <div className="text-2xl font-bold text-purple-600">
              {Math.round(sliTicker.throughput)}
            </div>
            <div className="text-sm text-gray-600">Throughput</div>
            <div className="text-xs text-purple-600 mt-1">● Live</div>
          </div>
          <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200">
            <div className="text-2xl font-bold text-red-600">
              {sliTicker.errorRate.toFixed(2)}%
            </div>
            <div className="text-sm text-gray-600">Error Rate</div>
            <div className="text-xs text-red-600 mt-1">● Live</div>
          </div>
        </div>
      </div>

      {/* Outcomes Dashboard */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Outcomes Dashboard</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-red-50 rounded-lg">
            <div className="text-2xl font-bold text-red-600">{outcomes.algorithmicRejections}</div>
            <div className="text-sm text-gray-600">Algorithmic Rejections</div>
            <div className="text-xs text-gray-500 mt-1">Last 24h</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{outcomes.explicitIntentRates}%</div>
            <div className="text-sm text-gray-600">Explicit Intent Rate</div>
            <div className="text-xs text-gray-500 mt-1">User satisfaction</div>
          </div>
          <div className="text-center p-4 bg-yellow-50 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600">{outcomes.manualOverrides}</div>
            <div className="text-sm text-gray-600">Manual Overrides</div>
            <div className="text-xs text-gray-500 mt-1">Admin interventions</div>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{outcomes.autoResolutions}</div>
            <div className="text-sm text-gray-600">Auto Resolutions</div>
            <div className="text-xs text-gray-500 mt-1">AI fixes applied</div>
          </div>
        </div>
      </div>

      {/* Active Incidents */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Active Incidents</h3>
        <div className="space-y-3">
          {incidents.map((incident) => (
            <div key={incident.id} className="border rounded-lg p-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getSeverityColor(incident.severity)}`}>
                      {incident.severity}
                    </span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(incident.status)}`}>
                      {incident.status}
                    </span>
                    <span className="text-xs text-gray-500">
                      {incident.duration}
                    </span>
                  </div>
                  <h4 className="font-medium text-gray-900">{incident.title}</h4>
                  {incident.resolution && (
                    <p className="text-sm text-gray-600 mt-1">
                      <strong>Resolution:</strong> {incident.resolution}
                    </p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(incident.timestamp).toLocaleString()}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <button className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded hover:bg-blue-200">
                    View Details
                  </button>
                  {incident.status === 'investigating' && (
                    <button className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded hover:bg-green-200">
                      Resolve
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Admin-Assisted Fixes */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Admin-Assisted Fixes</h3>
        <div className="space-y-3">
          {adminFixes.map((fix) => (
            <div key={fix.id} className="border rounded-lg p-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-xs font-medium text-blue-600 bg-blue-100 px-2 py-1 rounded">
                      {fix.eventId}
                    </span>
                    <span className="text-xs text-gray-500">
                      by {fix.admin}
                    </span>
                  </div>
                  <h4 className="font-medium text-gray-900">{fix.issue}</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    <strong>Action:</strong> {fix.action}
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>Result:</strong> {fix.result}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(fix.timestamp).toLocaleString()}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <button className="text-xs px-2 py-1 bg-gray-100 text-gray-800 rounded hover:bg-gray-200">
                    Replay
                  </button>
                  <button className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded hover:bg-blue-200">
                    Apply Similar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Incident Playback */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Incident Playback (Replay Mode)</h3>
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center space-x-4 mb-4">
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              ▶️ Play
            </button>
            <button className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700">
              ⏸️ Pause
            </button>
            <button className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700">
              ⏹️ Stop
            </button>
            <div className="flex-1">
              <input
                type="range"
                min="0"
                max="100"
                defaultValue="0"
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>
            <span className="text-sm text-gray-600">00:00 / 15:30</span>
          </div>
          <div className="bg-black rounded-lg p-4 text-white font-mono text-sm">
            <div className="text-green-400">[2024-01-15 14:30:15] System: CPU usage normal (45%)</div>
            <div className="text-green-400">[2024-01-15 14:30:30] System: Memory usage normal (62%)</div>
            <div className="text-yellow-400">[2024-01-15 14:30:45] Alert: CPU usage increasing (78%)</div>
            <div className="text-red-400">[2024-01-15 14:31:00] Alert: CPU usage critical (95%)</div>
            <div className="text-blue-400">[2024-01-15 14:31:15] Auto-scaling: Adding 2 instances</div>
            <div className="text-green-400">[2024-01-15 14:31:30] System: CPU usage normalizing (65%)</div>
            <div className="text-green-400">[2024-01-15 14:31:45] Incident resolved</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IntelligenceBugResolution;
