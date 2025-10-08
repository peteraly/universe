// Context: V12.0 L2 Health Monitoring - Heartbeat Simulator
// This module provides simulated heartbeat functionality for testing and demonstration
// of the agent monitoring system within the Discovery Dial platform.

import { agentRegistry } from './AgentRegistry'

class HeartbeatSimulator {
  constructor() {
    this.simulatedAgents = new Map()
    this.heartbeatInterval = 15000 // 15 seconds
    this.isRunning = false
    this.intervalId = null
  }

  /**
   * Starts the heartbeat simulation for all active agents.
   */
  startSimulation() {
    if (this.isRunning) {
      console.log('Heartbeat simulation is already running')
      return
    }

    this.isRunning = true
    console.log('Starting heartbeat simulation...')

    // Start the heartbeat interval
    this.intervalId = setInterval(() => {
      this.simulateHeartbeats()
    }, this.heartbeatInterval)

    // Initial heartbeat for all active agents
    this.simulateHeartbeats()
  }

  /**
   * Stops the heartbeat simulation.
   */
  stopSimulation() {
    if (!this.isRunning) {
      console.log('Heartbeat simulation is not running')
      return
    }

    this.isRunning = false
    if (this.intervalId) {
      clearInterval(this.intervalId)
      this.intervalId = null
    }
    console.log('Heartbeat simulation stopped')
  }

  /**
   * Simulates heartbeats for all active agents.
   */
  simulateHeartbeats() {
    const agents = agentRegistry.getAgents({ status: 'active' })
    
    for (const agent of agents) {
      this.simulateAgentHeartbeat(agent)
    }
  }

  /**
   * Simulates a heartbeat for a specific agent.
   * @param {object} agent - The agent object.
   */
  simulateAgentHeartbeat(agent) {
    // Simulate realistic heartbeat data
    const heartbeatData = {
      timestamp: new Date().toISOString(),
      status: 'healthy',
      tasksCompleted: Math.floor(Math.random() * 3), // 0-2 tasks
      responseTime: Math.floor(Math.random() * 200) + 50, // 50-250ms
      success: Math.random() > 0.1, // 90% success rate
    }

    // Record the heartbeat
    agentRegistry.recordHeartbeat(agent.id, heartbeatData)

    // Simulate occasional errors (5% chance)
    if (Math.random() < 0.05) {
      const errorMessages = [
        'Connection timeout',
        'Resource limit exceeded',
        'Invalid response format',
        'Network error',
        'Processing error'
      ]
      const randomError = errorMessages[Math.floor(Math.random() * errorMessages.length)]
      agentRegistry.recordError(agent.id, randomError)
    }

    // Update uptime (simplified calculation)
    const now = new Date()
    const createdAt = new Date(agent.createdAt)
    const uptimeMs = now.getTime() - createdAt.getTime()
    const uptimeHours = Math.floor(uptimeMs / (1000 * 60 * 60))
    const uptimeMinutes = Math.floor((uptimeMs % (1000 * 60 * 60)) / (1000 * 60))
    agent.uptime = `${uptimeHours}h ${uptimeMinutes}m`

    console.log(`Simulated heartbeat for agent ${agent.id}: ${JSON.stringify(heartbeatData)}`)
  }

  /**
   * Creates a simulated agent for testing.
   * @param {object} agentData - The agent configuration.
   * @returns {object} The created agent.
   */
  createSimulatedAgent(agentData) {
    const agent = agentRegistry.registerAgent(agentData)
    
    // Start the agent
    agentRegistry.startAgent(agent.id)
    
    // Add to simulated agents map
    this.simulatedAgents.set(agent.id, {
      agent,
      lastHeartbeat: new Date(),
      errorCount: 0
    })

    return agent
  }

  /**
   * Removes a simulated agent.
   * @param {string} agentId - The agent ID.
   * @returns {boolean} True if removed, false otherwise.
   */
  removeSimulatedAgent(agentId) {
    const removed = this.simulatedAgents.delete(agentId)
    if (removed) {
      agentRegistry.deleteAgent(agentId)
    }
    return removed
  }

  /**
   * Gets the status of the heartbeat simulation.
   * @returns {object} Simulation status.
   */
  getSimulationStatus() {
    return {
      isRunning: this.isRunning,
      interval: this.heartbeatInterval,
      simulatedAgents: this.simulatedAgents.size,
      lastUpdate: new Date().toISOString()
    }
  }

  /**
   * Creates a set of demo agents for testing.
   * @returns {Array<object>} Array of created agents.
   */
  createDemoAgents() {
    const demoAgents = [
      {
        name: 'Curation Agent Alpha',
        type: 'curation',
        description: 'AI-powered event curation and classification',
        config: { model: 'gpt-4', confidence: 0.85 },
        enabled: true
      },
      {
        name: 'Intelligence Agent Beta',
        type: 'intelligence',
        description: 'Real-time system intelligence and decision making',
        config: { model: 'claude-3', responseTime: 200 },
        enabled: true
      },
      {
        name: 'Health Monitor Gamma',
        type: 'health',
        description: 'System health monitoring and alerting',
        config: { checkInterval: 30000, alertThreshold: 0.8 },
        enabled: true
      },
      {
        name: 'Config Manager Delta',
        type: 'config',
        description: 'Configuration management and updates',
        config: { autoUpdate: true, backupEnabled: true },
        enabled: true
      },
      {
        name: 'Knowledge Agent Epsilon',
        type: 'knowledge',
        description: 'Vector memory and knowledge management',
        config: { vectorSize: 384, similarityThreshold: 0.7 },
        enabled: true
      }
    ]

    const createdAgents = []
    for (const agentData of demoAgents) {
      const agent = this.createSimulatedAgent(agentData)
      createdAgents.push(agent)
    }

    console.log(`Created ${createdAgents.length} demo agents`)
    return createdAgents
  }

  /**
   * Clears all simulated agents.
   */
  clearSimulatedAgents() {
    for (const agentId of this.simulatedAgents.keys()) {
      agentRegistry.deleteAgent(agentId)
    }
    this.simulatedAgents.clear()
    console.log('All simulated agents cleared')
  }

  /**
   * Gets performance metrics for all simulated agents.
   * @returns {object} Performance metrics.
   */
  getPerformanceMetrics() {
    const agents = Array.from(this.simulatedAgents.values())
    const total = agents.length
    
    if (total === 0) {
      return {
        total: 0,
        averageResponseTime: 0,
        averageSuccessRate: 100,
        totalTasksCompleted: 0,
        errorRate: 0
      }
    }

    const totalResponseTime = agents.reduce((sum, agent) => 
      sum + (agent.agent.performance.averageResponseTime || 0), 0)
    const totalSuccessRate = agents.reduce((sum, agent) => 
      sum + (agent.agent.performance.successRate || 100), 0)
    const totalTasksCompleted = agents.reduce((sum, agent) => 
      sum + (agent.agent.performance.tasksCompleted || 0), 0)
    const totalErrors = agents.reduce((sum, agent) => 
      sum + (agent.agent.errorCount || 0), 0)

    return {
      total,
      averageResponseTime: Math.round(totalResponseTime / total),
      averageSuccessRate: Math.round(totalSuccessRate / total),
      totalTasksCompleted,
      errorRate: Math.round((totalErrors / total) * 100) / 100
    }
  }
}

export const heartbeatSimulator = new HeartbeatSimulator()
