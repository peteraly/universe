// Mission Control Routes - V12.0
const routes = {
  // Main routes
  '/': 'HomePage',
  '/admin': 'AdminDashboard',
  '/health': 'HealthMonitor',
  '/curator': 'CuratorWorkbench',
  '/governance': 'GovernanceUI',
  '/agents': 'AgentConsole',
  
  // API routes
  '/api/events': 'EventAPI',
  '/api/health': 'HealthAPI',
  '/api/config': 'ConfigAPI',
  '/api/agents': 'AgentAPI',
  '/api/ledger': 'LedgerAPI'
}

module.exports = routes
