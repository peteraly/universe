// Mission Control Routes - V12.0
const routes = {
  // Main routes
  '/': 'HomePage',
  '/admin': 'AdminDashboard',
  '/health': 'HealthMonitor',
  '/curator': 'CuratorWorkbench',
  '/governance': 'GovernanceUI',
  
  // API routes
  '/api/events': 'EventAPI',
  '/api/health': 'HealthAPI',
  '/api/config': 'ConfigAPI',
  '/api/agent': 'AgentAPI',
  '/api/ledger': 'LedgerAPI'
}

module.exports = routes
