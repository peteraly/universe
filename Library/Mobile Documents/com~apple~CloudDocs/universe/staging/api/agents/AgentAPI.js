// Context: V12.0 Agent Console - Agent API Endpoints
// This module defines the API endpoints for managing AI agents within the Discovery Dial system,
// including CRUD operations, heartbeat monitoring, and lifecycle management.

import { agentRegistry } from '../../lib/layers/L2_Health/AgentRegistry'
import { RBAC, PERMISSIONS } from '../../lib/auth/rbac'

// Mock authentication middleware for demonstration
const mockAuth = (req, res, next) => {
  const sessionId = req.headers['x-session-id']
  if (sessionId === 'session_123') { // Simple session check
    req.user = { id: 'admin-user', role: 'admin' }
    next()
  } else {
    res.status(401).json({ message: 'Unauthorized' })
  }
}

// Mock Express-like router for demonstration
class AgentAPIRouter {
  constructor() {
    this.routes = {}
  }

  post(path, handler) {
    this.routes[`POST ${path}`] = handler
  }

  get(path, handler) {
    this.routes[`GET ${path}`] = handler
  }

  put(path, handler) {
    this.routes[`PUT ${path}`] = handler
  }

  delete(path, handler) {
    this.routes[`DELETE ${path}`] = handler
  }

  // Simulate handling a request
  async handleRequest(method, path, req = {}, res = {}) {
    const handler = this.routes[`${method} ${path}`]
    if (handler) {
      try {
        await handler(req, res)
      } catch (error) {
        console.error(`Error handling ${method} ${path}:`, error)
        res.status(500).json({ message: 'Internal Server Error', error: error.message })
      }
    } else {
      res.status(404).json({ message: 'Not Found' })
    }
  }
}

const router = new AgentAPIRouter()

// --- Public Endpoints ---

// GET /api/agents - Retrieve all agents (or filtered)
router.get('/api/agents', async (req, res) => {
  const filters = req.query // e.g., { status: 'active', type: 'intelligence' }
  const agents = agentRegistry.getAgents(filters)
  res.status(200).json({ success: true, agents })
})

// GET /api/agents/stats - Get agent statistics
router.get('/api/agents/stats', async (req, res) => {
  const stats = agentRegistry.getAgentStatistics()
  res.status(200).json({ success: true, stats })
})

// --- Admin/Agent Management Endpoints (Protected) ---

// POST /api/agents - Create a new agent
router.post('/api/agents', mockAuth, async (req, res) => {
  const agentData = req.body
  if (!agentData || !agentData.name) {
    return res.status(400).json({ message: 'Agent name is required.' })
  }

  try {
    const newAgent = agentRegistry.registerAgent(agentData)
    res.status(201).json({ success: true, agent: newAgent })
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
})

// GET /api/agents/:id - Get a specific agent
router.get('/api/agents/:id', mockAuth, async (req, res) => {
  const { id } = req.params
  const agent = agentRegistry.getAgent(id)
  
  if (agent) {
    res.status(200).json({ success: true, agent })
  } else {
    res.status(404).json({ message: 'Agent not found.' })
  }
})

// PUT /api/agents/:id - Update an agent
router.put('/api/agents/:id', mockAuth, async (req, res) => {
  const { id } = req.params
  const updates = req.body

  try {
    const updatedAgent = agentRegistry.updateAgent(id, updates)
    if (updatedAgent) {
      res.status(200).json({ success: true, agent: updatedAgent })
    } else {
      res.status(404).json({ message: 'Agent not found.' })
    }
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
})

// DELETE /api/agents/:id - Delete an agent
router.delete('/api/agents/:id', mockAuth, async (req, res) => {
  const { id } = req.params
  const deleted = agentRegistry.deleteAgent(id)
  
  if (deleted) {
    res.status(204).send() // No Content
  } else {
    res.status(404).json({ message: 'Agent not found.' })
  }
})

// POST /api/agents/:id/start - Start an agent
router.post('/api/agents/:id/start', mockAuth, async (req, res) => {
  const { id } = req.params
  const agent = agentRegistry.startAgent(id)
  
  if (agent) {
    res.status(200).json({ success: true, agent })
  } else {
    res.status(404).json({ message: 'Agent not found.' })
  }
})

// POST /api/agents/:id/stop - Stop an agent
router.post('/api/agents/:id/stop', mockAuth, async (req, res) => {
  const { id } = req.params
  const agent = agentRegistry.stopAgent(id)
  
  if (agent) {
    res.status(200).json({ success: true, agent })
  } else {
    res.status(404).json({ message: 'Agent not found.' })
  }
})

// POST /api/agents/:id/heartbeat - Record agent heartbeat
router.post('/api/agents/:id/heartbeat', async (req, res) => {
  const { id } = req.params
  const heartbeatData = req.body
  
  const agent = agentRegistry.recordHeartbeat(id, heartbeatData)
  
  if (agent) {
    res.status(200).json({ success: true, agent })
  } else {
    res.status(404).json({ message: 'Agent not found.' })
  }
})

// POST /api/agents/:id/error - Record agent error
router.post('/api/agents/:id/error', async (req, res) => {
  const { id } = req.params
  const { errorMessage } = req.body
  
  if (!errorMessage) {
    return res.status(400).json({ message: 'Error message is required.' })
  }
  
  const agent = agentRegistry.recordError(id, errorMessage)
  
  if (agent) {
    res.status(200).json({ success: true, agent })
  } else {
    res.status(404).json({ message: 'Agent not found.' })
  }
})

// GET /api/agents/:id/logs - Get agent logs (placeholder)
router.get('/api/agents/:id/logs', mockAuth, async (req, res) => {
  const { id } = req.params
  const agent = agentRegistry.getAgent(id)
  
  if (!agent) {
    return res.status(404).json({ message: 'Agent not found.' })
  }
  
  // Placeholder for agent logs
  const logs = [
    {
      timestamp: new Date().toISOString(),
      level: 'info',
      message: 'Agent started successfully',
      source: 'agent-registry'
    },
    {
      timestamp: new Date(Date.now() - 30000).toISOString(),
      level: 'debug',
      message: 'Heartbeat received',
      source: 'agent-registry'
    }
  ]
  
  res.status(200).json({ success: true, logs })
})

// GET /api/agents/:id/performance - Get agent performance metrics
router.get('/api/agents/:id/performance', mockAuth, async (req, res) => {
  const { id } = req.params
  const agent = agentRegistry.getAgent(id)
  
  if (!agent) {
    return res.status(404).json({ message: 'Agent not found.' })
  }
  
  const performance = {
    ...agent.performance,
    uptime: agent.uptime,
    lastHeartbeat: agent.lastHeartbeat,
    errorCount: agent.errorCount,
    lastError: agent.lastError
  }
  
  res.status(200).json({ success: true, performance })
})

// POST /api/agents/bulk/start - Start multiple agents
router.post('/api/agents/bulk/start', mockAuth, async (req, res) => {
  const { agentIds } = req.body
  
  if (!Array.isArray(agentIds) || agentIds.length === 0) {
    return res.status(400).json({ message: 'Agent IDs array is required.' })
  }
  
  const results = agentIds.map(id => {
    const agent = agentRegistry.startAgent(id)
    return { id, success: !!agent, agent }
  })
  
  res.status(200).json({ success: true, results })
})

// POST /api/agents/bulk/stop - Stop multiple agents
router.post('/api/agents/bulk/stop', mockAuth, async (req, res) => {
  const { agentIds } = req.body
  
  if (!Array.isArray(agentIds) || agentIds.length === 0) {
    return res.status(400).json({ message: 'Agent IDs array is required.' })
  }
  
  const results = agentIds.map(id => {
    const agent = agentRegistry.stopAgent(id)
    return { id, success: !!agent, agent }
  })
  
  res.status(200).json({ success: true, results })
})

// GET /api/agents/health - Get overall agent health status
router.get('/api/agents/health', async (req, res) => {
  const stats = agentRegistry.getAgentStatistics()
  const health = {
    overall: stats.error > 0 ? 'degraded' : 'healthy',
    total: stats.total,
    active: stats.active,
    error: stats.error,
    averageResponseTime: stats.averageResponseTime,
    overallSuccessRate: stats.overallSuccessRate
  }
  
  res.status(200).json({ success: true, health })
})

export const AgentAPI = router
