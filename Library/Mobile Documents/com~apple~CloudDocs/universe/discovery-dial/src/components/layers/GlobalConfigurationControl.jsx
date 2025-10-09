import React, { useState } from 'react';
import { can } from '../../lib/auth/rbac.js';

const GlobalConfigurationControl = ({ user }) => {
  const [config, setConfig] = useState({
    aiConfidenceThreshold: 60,
    maxEventsPerPage: 20,
    autoPublishThreshold: 85,
    systemMaintenanceMode: false,
    debugMode: false
  });

  const [venueTaxonomy, setVenueTaxonomy] = useState([
    { id: 1, name: 'Downtown Theater', category: 'Entertainment', status: 'active' },
    { id: 2, name: 'City Park', category: 'Outdoor', status: 'active' },
    { id: 3, name: 'Tech Hub', category: 'Business', status: 'active' },
    { id: 4, name: 'Art Gallery', category: 'Culture', status: 'inactive' }
  ]);

  const [rbacUsers, setRbacUsers] = useState([
    { id: 1, email: 'cto@discoverydial.com', role: 'CTO', status: 'active', lastLogin: '2024-01-15' },
    { id: 2, email: 'admin@discoverydial.com', role: 'Admin', status: 'active', lastLogin: '2024-01-15' },
    { id: 3, email: 'curator@discoverydial.com', role: 'Curator', status: 'active', lastLogin: '2024-01-14' }
  ]);

  const handleConfigChange = (key, value) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  const handleVenueAdd = () => {
    const newVenue = {
      id: Date.now(),
      name: '',
      category: '',
      status: 'active'
    };
    setVenueTaxonomy(prev => [...prev, newVenue]);
  };

  const handleVenueUpdate = (id, updates) => {
    setVenueTaxonomy(prev => prev.map(venue => 
      venue.id === id ? { ...venue, ...updates } : venue
    ));
  };

  const handleUserRoleChange = (userId, newRole) => {
    setRbacUsers(prev => prev.map(user => 
      user.id === userId ? { ...user, role: newRole } : user
    ));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Global Configuration & Control</h2>
          <p className="text-gray-600">Manage system settings, venue taxonomy, and user permissions</p>
        </div>
      </div>

      {/* AI Configuration */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Confidence Thresholds</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Minimum AI Confidence Threshold
            </label>
            <input
              type="number"
              min="0"
              max="100"
              value={config.aiConfidenceThreshold}
              onChange={(e) => handleConfigChange('aiConfidenceThreshold', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">
              Events below this threshold will be flagged for manual review
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Auto-Publish Threshold
            </label>
            <input
              type="number"
              min="0"
              max="100"
              value={config.autoPublishThreshold}
              onChange={(e) => handleConfigChange('autoPublishThreshold', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">
              Events above this threshold can be auto-published
            </p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Max Events Per Page
            </label>
            <input
              type="number"
              min="10"
              max="100"
              value={config.maxEventsPerPage}
              onChange={(e) => handleConfigChange('maxEventsPerPage', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div className="flex items-center space-x-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={config.systemMaintenanceMode}
                onChange={(e) => handleConfigChange('systemMaintenanceMode', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">System Maintenance Mode</span>
            </label>
            
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={config.debugMode}
                onChange={(e) => handleConfigChange('debugMode', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">Debug Mode</span>
            </label>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Save Configuration
          </button>
        </div>
      </div>

      {/* Venue Taxonomy Editor */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Venue Taxonomy Editor</h3>
          <button
            onClick={handleVenueAdd}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Add Venue
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Venue Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {venueTaxonomy.map((venue) => (
                <tr key={venue.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="text"
                      value={venue.name}
                      onChange={(e) => handleVenueUpdate(venue.id, { name: e.target.value })}
                      className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="text"
                      value={venue.category}
                      onChange={(e) => handleVenueUpdate(venue.id, { category: e.target.value })}
                      className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={venue.status}
                      onChange={(e) => handleVenueUpdate(venue.id, { status: e.target.value })}
                      className="px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button className="text-red-600 hover:text-red-900">
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* RBAC Manager */}
      {can('manage_rbac') && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">RBAC Manager</h3>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Login
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {rbacUsers.map((user) => (
                  <tr key={user.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{user.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={user.role}
                        onChange={(e) => handleUserRoleChange(user.id, e.target.value)}
                        className="px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="CTO">CTO</option>
                        <option value="Admin">Admin</option>
                        <option value="Curator">Curator</option>
                        <option value="Viewer">Viewer</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.lastLogin}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button className="text-blue-600 hover:text-blue-900 mr-3">
                        Edit
                      </button>
                      <button className="text-red-600 hover:text-red-900">
                        Deactivate
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default GlobalConfigurationControl;
