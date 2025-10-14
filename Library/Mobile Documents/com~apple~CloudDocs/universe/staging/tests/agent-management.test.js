// Context: V12.0 Agent Console + Registry - Agent Management Tests
// This test suite validates agent management and registry operations.

// Mock agent registry
const AgentRegistry = {
  agents: [
    { id: 'agent-001', name: 'Event Curator AI', status: 'active' },
    { id: 'agent-002', name: 'Content Moderator', status: 'active' }
  ],
  
  createAgent(agentData) {
    const newAgent = {
      id: `agent-${Date.now()}`,
      ...agentData,
      status: 'inactive',
      createdAt: new Date().toISOString()
    }
    this.agents.push(newAgent)
    return newAgent
  },
  
  updateAgent(agentId, updates) {
    const agent = this.agents.find(a => a.id === agentId)
    if (agent) {
      Object.assign(agent, updates)
      agent.updatedAt = new Date().toISOString()
      return agent
    }
    return null
  },
  
  deleteAgent(agentId) {
    const index = this.agents.findIndex(a => a.id === agentId)
    if (index !== -1) {
      return this.agents.splice(index, 1)[0]
    }
    return null
  }
}

// Test execution function
const runTests = async () => {
  let passed = 0
  let failed = 0
  let total = 0

  const testFunctions = [
    () => {
      try {
        const agent = AgentRegistry.createAgent({ name: 'Test Agent', type: 'test' })
        if (agent && agent.name === 'Test Agent') {
          console.log('✅ Agent Management: Agent creation works')
          return true
        }
        throw new Error('Agent creation failed')
      } catch (error) {
        console.log('❌ Agent Management: Agent creation -', error.message)
        return false
      }
    },
    
    () => {
      try {
        const agent = AgentRegistry.updateAgent('agent-001', { status: 'inactive' })
        if (agent && agent.status === 'inactive') {
          console.log('✅ Agent Management: Agent update works')
          return true
        }
        throw new Error('Agent update failed')
      } catch (error) {
        console.log('❌ Agent Management: Agent update -', error.message)
        return false
      }
    },
    
    () => {
      try {
        const deletedAgent = AgentRegistry.deleteAgent('agent-002')
        if (deletedAgent && deletedAgent.name === 'Content Moderator') {
          console.log('✅ Agent Management: Agent deletion works')
          return true
        }
        throw new Error('Agent deletion failed')
      } catch (error) {
        console.log('❌ Agent Management: Agent deletion -', error.message)
        return false
      }
    }
  ]

  for (const testFn of testFunctions) {
    total++
    try {
      const result = await testFn()
      if (result) {
        passed++
      } else {
        failed++
      }
    } catch (error) {
      failed++
      console.log('❌ Test failed with error:', error.message)
    }
  }

  console.log(`\n📊 Agent Management Test Results: ${passed}/${total} tests passed`)
  console.log(`✅ Passed: ${passed}`)
  console.log(`❌ Failed: ${failed}`)
  console.log(`📈 Success Rate: ${Math.round((passed / total) * 100)}%`)
  
  return { passed, failed, total }
}

// Export for use in other test files
export { runTests }

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runTests().then(results => {
    if (results.failed > 0) {
      process.exit(1)
    }
  })
}

