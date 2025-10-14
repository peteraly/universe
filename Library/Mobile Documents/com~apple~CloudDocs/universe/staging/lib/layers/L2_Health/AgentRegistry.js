// Context: V12.0 L2 Health Monitoring - Agent Registry System
// This module provides core functionality for managing AI agents within the Discovery Dial system,
// including registration, heartbeat monitoring, and lifecycle management.

class AgentRegistry {
  constructor() {
    this.agents = new Map()
    this.heartbeatInterval = 30000 // 30 seconds
    this.heartbeatTimeout = 60000 // 60 seconds
    this.agentTypes = ['curation', 'intelligence', 'health', 'config', 'knowledge']
    this.agentStatuses = ['active', 'inactive', 'error', 'starting', 'stopping']
    this.nextAgentId = 1
    
    // Start heartbeat monitoring
    this.startHeartbeatMonitoring()
  }

  /**
   * Registers a new agent in the system.
   * @param {object} agentData - The agent configuration.
   * @returns {object} The registered agent with assigned ID and metadata.
   */
  registerAgent(agentData) {
    const agentId = `agent-${this.nextAgentId++}`
    const agent = {
      id: agentId,
      name: agentData.name || `Agent ${agentId}`,
      type: agentData.type || 'curation',
      description: agentData.description || '',
      config: agentData.config || {},
      enabled: agentData.enabled !== false,
      status: 'inactive',
      version: agentData.version || '1.0.0',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastHeartbeat: null,
      uptime: '0s',
      errorCount: 0,
      lastError: null,
      performance: {
        tasksCompleted: 0,
        averageResponseTime: 0,
        successRate: 100
      }
    }

    // Validate agent data
    if (!this.agentTypes.includes(agent.type)) {
      throw new Error(`Invalid agent type: ${agent.type}. Must be one of: ${this.agentTypes.join(', ')}`)
    }

    this.agents.set(agentId, agent)
    console.log(`Agent registered: ${agentId} (${agent.name})`)
    return agent
  }

  /**
   * Retrieves an agent by ID.
   * @param {string} agentId - The agent ID.
   * @returns {object|null} The agent object or null if not found.
   */
  getAgent(agentId) {
    return this.agents.get(agentId) || null
  }

  /**
   * Retrieves all agents, optionally filtered by status or type.
   * @param {object} filters - Filter criteria (e.g., { status: 'active', type: 'intelligence' }).
   * @returns {Array<object>} Array of agent objects.
   */
  getAgents(filters = {}) {
    let agents = Array.from(this.agents.values())

    if (filters.status) {
      agents = agents.filter(agent => agent.status === filters.status)
    }
    if (filters.type) {
      agents = agents.filter(agent => agent.type === filters.type)
    }
    if (filters.enabled !== undefined) {
      agents = agents.filter(agent => agent.enabled === filters.enabled)
    }

    return agents
  }

  /**
   * Updates an agent's configuration or status.
   * @param {string} agentId - The agent ID.
   * @param {object} updates - The fields to update.
   * @returns {object|null} The updated agent or null if not found.
   */
  updateAgent(agentId, updates) {
    const agent = this.agents.get(agentId)
    if (!agent) return null

    // Validate updates
    if (updates.type && !this.agentTypes.includes(updates.type)) {
      throw new Error(`Invalid agent type: ${updates.type}`)
    }
    if (updates.status && !this.agentStatuses.includes(updates.status)) {
      throw new Error(`Invalid agent status: ${updates.status}`)
    }

    Object.assign(agent, updates)
    agent.updatedAt = new Date().toISOString()
    
    console.log(`Agent updated: ${agentId}`)
    return agent
  }

  /**
   * Deletes an agent from the registry.
   * @param {string} agentId - The agent ID.
   * @returns {boolean} True if deleted, false otherwise.
   */
  deleteAgent(agentId) {
    const deleted = this.agents.delete(agentId)
    if (deleted) {
      console.log(`Agent deleted: ${agentId}`)
    }
    return deleted
  }

  /**
   * Starts an agent (changes status to 'active').
   * @param {string} agentId - The agent ID.
   * @returns {object|null} The updated agent or null if not found.
   */
  startAgent(agentId) {
    const agent = this.agents.get(agentId)
    if (!agent) return null

    if (agent.status === 'active') {
      console.log(`Agent ${agentId} is already active`)
      return agent
    }

    agent.status = 'starting'
    agent.updatedAt = new Date().toISOString()
    
    // Simulate startup process
    setTimeout(() => {
      const currentAgent = this.agents.get(agentId)
      if (currentAgent) {
        currentAgent.status = 'active'
        currentAgent.updatedAt = new Date().toISOString()
        console.log(`Agent started: ${agentId}`)
      }
    }, 1000)

    return agent
  }

  /**
   * Stops an agent (changes status to 'inactive').
   * @param {string} agentId - The agent ID.
   * @returns {object|null} The updated agent or null if not found.
   */
  stopAgent(agentId) {
    const agent = this.agents.get(agentId)
    if (!agent) return null

    if (agent.status === 'inactive') {
      console.log(`Agent ${agentId} is already inactive`)
      return agent
    }

    agent.status = 'stopping'
    agent.updatedAt = new Date().toISOString()
    
    // Simulate shutdown process
    setTimeout(() => {
      const currentAgent = this.agents.get(agentId)
      if (currentAgent) {
        currentAgent.status = 'inactive'
        currentAgent.updatedAt = new Date().toISOString()
        console.log(`Agent stopped: ${agentId}`)
      }
    }, 1000)

    return agent
  }

  /**
   * Records a heartbeat from an agent.
   * @param {string} agentId - The agent ID.
   * @param {object} heartbeatData - Additional heartbeat data.
   * @returns {object|null} The updated agent or null if not found.
   */
  recordHeartbeat(agentId, heartbeatData = {}) {
    const agent = this.agents.get(agentId)
    if (!agent) return null

    const now = new Date().toISOString()
    agent.lastHeartbeat = now
    agent.updatedAt = now

    // Update performance metrics if provided
    if (heartbeatData.tasksCompleted) {
      agent.performance.tasksCompleted += heartbeatData.tasksCompleted
    }
    if (heartbeatData.responseTime) {
      // Simple moving average for response time
      const currentAvg = agent.performance.averageResponseTime
      const newAvg = (currentAvg + heartbeatData.responseTime) / 2
      agent.performance.averageResponseTime = Math.round(newAvg)
    }
    if (heartbeatData.success !== undefined) {
      // Update success rate (simplified)
      const currentRate = agent.performance.successRate
      const newRate = heartbeatData.success ? Math.min(100, currentRate + 1) : Math.max(0, currentRate - 1)
      agent.performance.successRate = newRate
    }

    // Reset error count on successful heartbeat
    if (heartbeatData.success !== false) {
      agent.errorCount = 0
      agent.lastError = null
    }

    console.log(`Heartbeat recorded for agent ${agentId}`)
    return agent
  }

  /**
   * Records an error for an agent.
   * @param {string} agentId - The agent ID.
   * @param {string} errorMessage - The error message.
   * @returns {object|null} The updated agent or null if not found.
   */
  recordError(agentId, errorMessage) {
    const agent = this.agents.get(agentId)
    if (!agent) return null

    agent.errorCount++
    agent.lastError = {
      message: errorMessage,
      timestamp: new Date().toISOString()
    }
    agent.updatedAt = new Date().toISOString()

    // Set status to error if too many errors
    if (agent.errorCount >= 3) {
      agent.status = 'error'
    }

    console.log(`Error recorded for agent ${agentId}: ${errorMessage}`)
    return agent
  }

  /**
   * Starts the heartbeat monitoring system.
   * Checks for stale agents and updates their status.
   */
  startHeartbeatMonitoring() {
    setInterval(() => {
      const now = Date.now()
      const staleThreshold = this.heartbeatTimeout

      for (const [agentId, agent] of this.agents) {
        if (agent.status === 'active' && agent.lastHeartbeat) {
          const lastHeartbeatTime = new Date(agent.lastHeartbeat).getTime()
          const timeSinceHeartbeat = now - lastHeartbeatTime

          if (timeSinceHeartbeat > staleThreshold) {
            agent.status = 'error'
            agent.lastError = {
              message: 'Heartbeat timeout',
              timestamp: new Date().toISOString()
            }
            agent.updatedAt = new Date().toISOString()
            console.log(`Agent ${agentId} marked as error due to heartbeat timeout`)
          }
        }
      }
    }, this.heartbeatInterval)
  }

  /**
   * Gets agent statistics for monitoring.
   * @returns {object} Statistics about agents.
   */
  getAgentStatistics() {
    const agents = Array.from(this.agents.values())
    const total = agents.length
    const active = agents.filter(a => a.status === 'active').length
    const inactive = agents.filter(a => a.status === 'inactive').length
    const error = agents.filter(a => a.status === 'error').length
    const starting = agents.filter(a => a.status === 'starting').length
    const stopping = agents.filter(a => a.status === 'stopping').length

    return {
      total,
      active,
      inactive,
      error,
      starting,
      stopping,
      averageUptime: this.calculateAverageUptime(agents),
      averageResponseTime: this.calculateAverageResponseTime(agents),
      overallSuccessRate: this.calculateOverallSuccessRate(agents)
    }
  }

  /**
   * Calculates average uptime for all agents.
   * @param {Array<object>} agents - Array of agent objects.
   * @returns {string} Average uptime as a string.
   */
  calculateAverageUptime(agents) {
    if (agents.length === 0) return '0s'
    
    const activeAgents = agents.filter(a => a.status === 'active')
    if (activeAgents.length === 0) return '0s'
    
    // Simplified calculation - in a real system, this would be more sophisticated
    return '2h 15m' // Mock value
  }

  /**
   * Calculates average response time for all agents.
   * @param {Array<object>} agents - Array of agent objects.
   * @returns {number} Average response time in milliseconds.
   */
  calculateAverageResponseTime(agents) {
    if (agents.length === 0) return 0
    
    const totalResponseTime = agents.reduce((sum, agent) => 
      sum + (agent.performance.averageResponseTime || 0), 0)
    
    return Math.round(totalResponseTime / agents.length)
  }

  /**
   * Calculates overall success rate for all agents.
   * @param {Array<object>} agents - Array of agent objects.
   * @returns {number} Overall success rate percentage.
   */
  calculateOverallSuccessRate(agents) {
    if (agents.length === 0) return 100
    
    const totalSuccessRate = agents.reduce((sum, agent) => 
      sum + (agent.performance.successRate || 100), 0)
    
    return Math.round(totalSuccessRate / agents.length)
  }

  /**
   * Clears all agents from the registry.
   */
  clearRegistry() {
    this.agents.clear()
    this.nextAgentId = 1
    console.log('Agent registry cleared')
  }
}

export const agentRegistry = new AgentRegistry()

