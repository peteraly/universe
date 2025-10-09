import React, { useState, useEffect } from 'react';
import { authManager, can, getCurrentUser, isAuthenticated } from '../lib/auth/rbac.js';
import EventCurationHub from './layers/EventCurationHub.jsx';
import SystemHealthObservability from './layers/SystemHealthObservability.jsx';
import GlobalConfigurationControl from './layers/GlobalConfigurationControl.jsx';
import IntelligenceBugResolution from './layers/IntelligenceBugResolution.jsx';
import VenueManager from './VenueManager.jsx';
import AdminMonitoringDashboard from './monitoring/AdminMonitoringDashboard.jsx';
import LoginForm from './auth/LoginForm.jsx';

const CTOMissionControl = () => {
  const [activeTab, setActiveTab] = useState('curation');
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check authentication on mount
    const currentUser = getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
    }
    setIsLoading(false);
  }, []);

  const handleLogin = (email, password) => {
    const result = authManager.login(email, password);
    if (result.success) {
      setUser(result.user);
    }
    return result;
  };

  const handleLogout = () => {
    authManager.logout();
    setUser(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading CTO Mission Control...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginForm onLogin={handleLogin} />;
  }

  const tabs = [
    {
      id: 'curation',
      name: 'Event Curation Hub',
      icon: '📊',
      component: EventCurationHub,
      permission: 'view_events'
    },
    {
      id: 'health',
      name: 'System Health & Observability',
      icon: '🏥',
      component: SystemHealthObservability,
      permission: 'view_system_health'
    },
    {
      id: 'config',
      name: 'Global Configuration & Control',
      icon: '⚙️',
      component: GlobalConfigurationControl,
      permission: 'manage_config'
    },
    {
      id: 'intelligence',
      name: 'Intelligence & Bug Resolution',
      icon: '🧠',
      component: IntelligenceBugResolution,
      permission: 'view_analytics'
    },
    {
      id: 'venues',
      name: 'Venue Parser',
      icon: '🏢',
      component: VenueManager,
      permission: 'view_events'
    },
    {
      id: 'monitoring',
      name: 'Live Monitoring',
      icon: '🔍',
      component: AdminMonitoringDashboard,
      permission: 'view_analytics'
    }
  ];

  const availableTabs = tabs.filter(tab => can(tab.permission));
  const ActiveComponent = availableTabs.find(tab => tab.id === activeTab)?.component;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">CTO</span>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Mission Control</h1>
                  <p className="text-sm text-gray-500">Discovery Dial Enterprise Portal</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{user.name}</p>
                <p className="text-xs text-gray-500 capitalize">{user.role}</p>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => window.location.href = '/'}
                  className="px-3 py-1 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded hover:bg-gray-50"
                >
                  Back to App
                </button>
                <button
                  onClick={handleLogout}
                  className="px-3 py-1 text-sm text-red-600 hover:text-red-800 border border-red-300 rounded hover:bg-red-50"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {availableTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.name}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {ActiveComponent && <ActiveComponent user={user} />}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center text-sm text-gray-500">
            <div>
              <span className="font-medium">Discovery Dial</span> CTO Mission Control v1.0
            </div>
            <div>
              Last updated: {new Date().toLocaleString()}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default CTOMissionControl;
