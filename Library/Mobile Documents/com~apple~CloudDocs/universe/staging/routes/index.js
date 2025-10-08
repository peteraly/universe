// Mission Control Routes - V12.0
const routes = {
  // Main routes
  '/': 'HomePage',
  '/admin': 'AdminDashboard',
  '/health': 'HealthMonitor',
  '/curator': 'CuratorWorkbench',
  '/governance': 'GovernanceBoard',
  '/agents': 'AgentConsole',
  '/public': 'PublicPortal',
  
  // API routes
  '/api/events': 'EventAPI',
  '/api/health': 'HealthAPI',
  '/api/config': 'ConfigAPI',
  '/api/agents': 'AgentAPI',
  '/api/governance': 'GovernanceAPI',
  '/api/public': 'GovernanceAPI',
  '/api/recovery': 'RecoveryAPI',
  '/api/ledger': 'LedgerAPI'
}

module.exports = routes
