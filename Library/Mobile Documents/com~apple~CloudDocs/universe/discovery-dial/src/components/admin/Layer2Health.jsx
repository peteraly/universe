import React from 'react'
import StatusRing from './StatusRing'

const Layer2Health = ({ healthData = {} }) => {
  const defaultHealthData = {
    overallHealth: 98,
    apiResponse: 45,
    storageUsage: 78,
    uptime: 99.9
  }

  const health = { ...defaultHealthData, ...healthData }

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">System Health</h2>
          <p className="text-gray-600">Aggregated system status and performance metrics</p>
        </div>

        {/* Status Rings Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatusRing
            value={health.overallHealth}
            label="Overall Health"
            unit="%"
          />
          <StatusRing
            value={health.apiResponse}
            label="API Response"
            unit="ms"
            max={100}
          />
          <StatusRing
            value={health.storageUsage}
            label="Storage Usage"
            unit="%"
          />
          <StatusRing
            value={health.uptime}
            label="Uptime"
            unit="%"
          />
        </div>

        {/* Additional Health Info */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">System Status</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 mb-2">All Systems Operational</div>
              <div className="text-sm text-gray-600">No critical issues detected</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 mb-2">3 Active Agents</div>
              <div className="text-sm text-gray-600">All agents responding normally</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-600 mb-2">Last Check: 2 min ago</div>
              <div className="text-sm text-gray-600">Automated monitoring active</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Layer2Health
