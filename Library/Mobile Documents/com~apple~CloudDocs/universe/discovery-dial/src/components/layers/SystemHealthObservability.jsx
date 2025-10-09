import React, { useState, useEffect } from 'react';
import { can } from '../../lib/auth/rbac.js';

const SystemHealthObservability = ({ user }) => {
  const [systemHealth, setSystemHealth] = useState({
    status: 'healthy',
    uptime: '99.9%',
    responseTime: '120ms',
    errorRate: '0.1%',
    lastIncident: '2 days ago'
  });

  const [alerts, setAlerts] = useState([
    {
      id: 1,
      level: 'P1',
      message: 'High CPU usage detected on server-01',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      status: 'active'
    },
    {
      id: 2,
      level: 'P2',
      message: 'Database connection pool near capacity',
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      status: 'resolved'
    }
  ]);

  const [sliMetrics, setSliMetrics] = useState({
    availability: 99.9,
    latency: 120,
    throughput: 1500,
    errorRate: 0.1
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'healthy': return 'text-green-600 bg-green-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'critical': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getAlertLevelColor = (level) => {
    switch (level) {
      case 'P0': return 'bg-red-100 text-red-800 border-red-200';
      case 'P1': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'P2': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">System Health & Observability</h2>
            <p className="text-gray-600">Monitor system performance and incident management</p>
          </div>
          {can('initiate_rollback') && (
            <button
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={user.role === 'cto'} // CTO role cannot initiate rollback for safety
              title={user.role === 'cto' ? 'CTO role cannot initiate rollback for safety' : 'Initiate system rollback'}
            >
              Initiate Rollback
            </button>
          )}
        </div>

        {/* System Status Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className={`w-3 h-3 rounded-full ${systemHealth.status === 'healthy' ? 'bg-green-400' : 'bg-red-400'}`}></div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">System Status</p>
                <p className={`text-lg font-bold capitalize ${systemHealth.status === 'healthy' ? 'text-green-600' : 'text-red-600'}`}>
                  {systemHealth.status}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <span className="text-blue-600 text-sm font-bold">⏱️</span>
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">Uptime</p>
                <p className="text-lg font-bold text-blue-600">{systemHealth.uptime}</p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <span className="text-green-600 text-sm font-bold">⚡</span>
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">Response Time</p>
                <p className="text-lg font-bold text-green-600">{systemHealth.responseTime}</p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                  <span className="text-red-600 text-sm font-bold">⚠️</span>
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">Error Rate</p>
                <p className="text-lg font-bold text-red-600">{systemHealth.errorRate}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SLI Metrics */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Service Level Indicators (SLIs)</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600">{sliMetrics.availability}%</div>
            <div className="text-sm text-gray-600">Availability</div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div className="bg-green-600 h-2 rounded-full" style={{ width: `${sliMetrics.availability}%` }}></div>
            </div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">{sliMetrics.latency}ms</div>
            <div className="text-sm text-gray-600">Latency</div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div className="bg-blue-600 h-2 rounded-full" style={{ width: '85%' }}></div>
            </div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600">{sliMetrics.throughput}</div>
            <div className="text-sm text-gray-600">Throughput (req/min)</div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div className="bg-purple-600 h-2 rounded-full" style={{ width: '90%' }}></div>
            </div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-red-600">{sliMetrics.errorRate}%</div>
            <div className="text-sm text-gray-600">Error Rate</div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div className="bg-red-600 h-2 rounded-full" style={{ width: `${sliMetrics.errorRate * 10}%` }}></div>
            </div>
          </div>
        </div>
      </div>

      {/* Alerts Feed */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">P0/P1 Alerts Feed</h3>
        <div className="space-y-3">
          {alerts.map((alert) => (
            <div key={alert.id} className={`border rounded-lg p-4 ${getAlertLevelColor(alert.level)}`}>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getAlertLevelColor(alert.level)}`}>
                      {alert.level}
                    </span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      alert.status === 'active' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                    }`}>
                      {alert.status}
                    </span>
                  </div>
                  <p className="text-sm font-medium">{alert.message}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(alert.timestamp).toLocaleString()}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <button className="text-xs px-2 py-1 bg-white bg-opacity-50 rounded hover:bg-opacity-75">
                    Acknowledge
                  </button>
                  <button className="text-xs px-2 py-1 bg-white bg-opacity-50 rounded hover:bg-opacity-75">
                    Resolve
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Ingestion Health Report */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Ingestion Health Report</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">98.5%</div>
            <div className="text-sm text-gray-600">Data Quality</div>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">2.3s</div>
            <div className="text-sm text-gray-600">Processing Time</div>
          </div>
          <div className="text-center p-4 bg-yellow-50 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600">15</div>
            <div className="text-sm text-gray-600">Pending Items</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemHealthObservability;
