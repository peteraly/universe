// L5 Knowledge Layer Tests - V12.0 Read/Write Tests
const VectorStore = require('../lib/layers/L5_Knowledge/VectorStore')
const AgentMemoryCards = require('../lib/layers/L5_Knowledge/AgentMemoryCards')
const SecureLedgerAccess = require('../lib/layers/L5_Knowledge/SecureLedgerAccess')
const KnowledgeAPI = require('../api/knowledge/KnowledgeAPI')

class L5KnowledgeTests {
  constructor() {
    this.vectorStore = new VectorStore()
    this.memoryCards = new AgentMemoryCards()
    this.secureLedger = new SecureLedgerAccess()
    this.knowledgeAPI = new KnowledgeAPI()
    this.testResults = []
  }

  /**
   * Test vector store read/write operations
   */
  async testVectorStoreOperations() {
    console.log('Testing vector store read/write operations...')
    
    try {
      // Test adding vectors
      const text1 = 'This is a test document about machine learning'
      const text2 = 'Another document about artificial intelligence'
      const embedding1 = this.generateTestEmbedding(text1)
      const embedding2 = this.generateTestEmbedding(text2)
      
      const id1 = this.vectorStore.addVector(text1, embedding1, { type: 'ml' })
      const id2 = this.vectorStore.addVector(text2, embedding2, { type: 'ai' })
      
      if (!id1 || !id2) {
        throw new Error('Failed to add vectors')
      }
      
      // Test reading vectors
      const vector1 = this.vectorStore.getVector(id1)
      const vector2 = this.vectorStore.getVector(id2)
      
      if (!vector1 || !vector2) {
        throw new Error('Failed to read vectors')
      }
      
      // Test searching vectors
      const queryEmbedding = this.generateTestEmbedding('machine learning')
      const results = this.vectorStore.searchVectors(queryEmbedding, 2)
      
      if (results.length === 0) {
        throw new Error('No search results found')
      }
      
      // Test updating vector metadata
      const updateSuccess = this.vectorStore.updateVectorMetadata(id1, { updated: true })
      if (!updateSuccess) {
        throw new Error('Failed to update vector metadata')
      }
      
      // Test deleting vector
      const deleteSuccess = this.vectorStore.deleteVector(id2)
      if (!deleteSuccess) {
        throw new Error('Failed to delete vector')
      }
      
      console.log('✅ Vector store operations successful')
      this.testResults.push({ test: 'vector_store_operations', result: 'PASSED' })
      return true
    } catch (error) {
      console.log('❌ Vector store operations failed:', error.message)
      this.testResults.push({ test: 'vector_store_operations', result: 'FAILED', error: error.message })
      return false
    }
  }

  /**
   * Test agent memory cards operations
   */
  async testMemoryCardsOperations() {
    console.log('Testing memory cards read/write operations...')
    
    try {
      const agentId = 'test_agent_123'
      
      // Test creating memory cards
      const cardId1 = this.memoryCards.createMemoryCard(
        agentId, 
        'User asked about machine learning algorithms', 
        'conversation',
        { topic: 'ml' }
      )
      const cardId2 = this.memoryCards.createMemoryCard(
        agentId, 
        'System learned about neural networks', 
        'knowledge',
        { topic: 'neural_networks' }
      )
      
      if (!cardId1 || !cardId2) {
        throw new Error('Failed to create memory cards')
      }
      
      // Test reading memory cards
      const cards = this.memoryCards.getMemoryCards(agentId, {}, 10)
      if (cards.length < 2) {
        throw new Error('Failed to read memory cards')
      }
      
      // Test searching memory cards
      const searchResults = this.memoryCards.searchMemoryCards(agentId, 'machine learning', 2)
      if (searchResults.length === 0) {
        throw new Error('No search results found')
      }
      
      // Test updating memory card
      const updateSuccess = this.memoryCards.updateMemoryCard(cardId1, { 
        content: 'Updated conversation about machine learning algorithms' 
      })
      if (!updateSuccess) {
        throw new Error('Failed to update memory card')
      }
      
      // Test getting agent session
      const session = this.memoryCards.getAgentSession(agentId)
      if (!session || session.totalCards < 2) {
        throw new Error('Failed to get agent session')
      }
      
      // Test deleting memory card
      const deleteSuccess = this.memoryCards.deleteMemoryCard(cardId2)
      if (!deleteSuccess) {
        throw new Error('Failed to delete memory card')
      }
      
      console.log('✅ Memory cards operations successful')
      this.testResults.push({ test: 'memory_cards_operations', result: 'PASSED' })
      return true
    } catch (error) {
      console.log('❌ Memory cards operations failed:', error.message)
      this.testResults.push({ test: 'memory_cards_operations', result: 'FAILED', error: error.message })
      return false
    }
  }

  /**
   * Test secure ledger access control
   */
  async testSecureLedgerAccess() {
    console.log('Testing secure ledger access control...')
    
    try {
      // Test admin write access
      const adminWrite = this.secureLedger.writeToLedger('admin_123', 'admin', {
        action: 'test_action',
        data: { test: 'data' },
        timestamp: new Date().toISOString()
      })
      
      if (!adminWrite.success) {
        throw new Error('Admin write access failed')
      }
      
      // Test LLM read access
      const llmRead = this.secureLedger.readFromLedger('llm_123', 'llm', {})
      if (!llmRead.success) {
        throw new Error('LLM read access failed')
      }
      
      // Test LLM write access (should fail)
      const llmWrite = this.secureLedger.writeToLedger('llm_123', 'llm', {
        action: 'test_action',
        data: { test: 'data' },
        timestamp: new Date().toISOString()
      })
      
      if (llmWrite.success) {
        throw new Error('LLM write access should have failed')
      }
      
      // Test user read access
      const userRead = this.secureLedger.readFromLedger('user_123', 'user', {})
      if (!userRead.success) {
        throw new Error('User read access failed')
      }
      
      // Test user write access (should fail)
      const userWrite = this.secureLedger.writeToLedger('user_123', 'user', {
        action: 'test_action',
        data: { test: 'data' },
        timestamp: new Date().toISOString()
      })
      
      if (userWrite.success) {
        throw new Error('User write access should have failed')
      }
      
      // Test getting statistics
      const stats = this.secureLedger.getLedgerStatistics('admin_123', 'admin')
      if (!stats.success) {
        throw new Error('Failed to get ledger statistics')
      }
      
      console.log('✅ Secure ledger access control successful')
      this.testResults.push({ test: 'secure_ledger_access', result: 'PASSED' })
      return true
    } catch (error) {
      console.log('❌ Secure ledger access control failed:', error.message)
      this.testResults.push({ test: 'secure_ledger_access', result: 'FAILED', error: error.message })
      return false
    }
  }

  /**
   * Test knowledge API endpoints
   */
  async testKnowledgeAPIEndpoints() {
    console.log('Testing knowledge API endpoints...')
    
    try {
      // Test add knowledge
      const mockReq1 = {
        body: { text: 'Test knowledge content', metadata: { type: 'test' } },
        userId: 'test_user',
        userRole: 'admin'
      }
      
      const mockRes1 = {
        json: (data) => {
          if (data.success && data.vectorId) {
            return true
          }
          throw new Error('Add knowledge failed')
        }
      }
      
      await this.knowledgeAPI.addKnowledge(mockReq1, mockRes1)
      
      // Test search knowledge
      const mockReq2 = {
        query: { query: 'test knowledge', topK: 5 },
        userId: 'test_user',
        userRole: 'admin'
      }
      
      const mockRes2 = {
        json: (data) => {
          if (data.success && Array.isArray(data.results)) {
            return true
          }
          throw new Error('Search knowledge failed')
        }
      }
      
      await this.knowledgeAPI.searchKnowledge(mockReq2, mockRes2)
      
      // Test create memory card
      const mockReq3 = {
        body: { 
          agentId: 'test_agent', 
          content: 'Test memory content', 
          type: 'conversation' 
        },
        userId: 'test_user',
        userRole: 'admin'
      }
      
      const mockRes3 = {
        json: (data) => {
          if (data.success && data.cardId) {
            return true
          }
          throw new Error('Create memory card failed')
        }
      }
      
      await this.knowledgeAPI.createMemoryCard(mockReq3, mockRes3)
      
      // Test get memory cards
      const mockReq4 = {
        params: { agentId: 'test_agent' },
        query: { limit: 10 },
        userId: 'test_user',
        userRole: 'admin'
      }
      
      const mockRes4 = {
        json: (data) => {
          if (data.success && Array.isArray(data.cards)) {
            return true
          }
          throw new Error('Get memory cards failed')
        }
      }
      
      await this.knowledgeAPI.getMemoryCards(mockReq4, mockRes4)
      
      // Test get ledger entries
      const mockReq5 = {
        query: { limit: 10 },
        userId: 'test_user',
        userRole: 'admin'
      }
      
      const mockRes5 = {
        json: (data) => {
          if (data.success && Array.isArray(data.entries)) {
            return true
          }
          throw new Error('Get ledger entries failed')
        }
      }
      
      await this.knowledgeAPI.getLedgerEntries(mockReq5, mockRes5)
      
      console.log('✅ Knowledge API endpoints successful')
      this.testResults.push({ test: 'knowledge_api_endpoints', result: 'PASSED' })
      return true
    } catch (error) {
      console.log('❌ Knowledge API endpoints failed:', error.message)
      this.testResults.push({ test: 'knowledge_api_endpoints', result: 'FAILED', error: error.message })
      return false
    }
  }

  /**
   * Test L3/L4 interactions
   */
  async testL3L4Interactions() {
    console.log('Testing L3/L4 interactions...')
    
    try {
      // Test configuration change logging
      const configChange = this.secureLedger.writeToLedger('admin_123', 'admin', {
        action: 'config_updated',
        data: { key: 'system.debug', oldValue: true, newValue: false },
        timestamp: new Date().toISOString(),
        metadata: { source: 'L3_Config' }
      })
      
      if (!configChange.success) {
        throw new Error('Configuration change logging failed')
      }
      
      // Test intelligence incident logging
      const incidentLog = this.secureLedger.writeToLedger('system_123', 'system', {
        action: 'incident_detected',
        data: { incidentId: 'inc_123', severity: 'high', type: 'drift' },
        timestamp: new Date().toISOString(),
        metadata: { source: 'L4_Intelligence' }
      })
      
      if (!incidentLog.success) {
        throw new Error('Incident logging failed')
      }
      
      // Test cross-layer knowledge retrieval
      const crossLayerRead = this.secureLedger.readFromLedger('llm_123', 'llm', {
        filters: { action: 'config_updated' }
      })
      
      if (!crossLayerRead.success) {
        throw new Error('Cross-layer knowledge retrieval failed')
      }
      
      // Test memory card creation from L4 intelligence
      const intelligenceCard = this.memoryCards.createMemoryCard(
        'intelligence_agent',
        'System detected performance drift in API response times',
        'intelligence',
        { source: 'L4_Intelligence', incidentId: 'inc_123' }
      )
      
      if (!intelligenceCard) {
        throw new Error('Intelligence memory card creation failed')
      }
      
      // Test vector store integration with L3 config
      const configVector = this.vectorStore.addVector(
        'System configuration updated: debug mode disabled',
        this.generateTestEmbedding('System configuration updated: debug mode disabled'),
        { source: 'L3_Config', configKey: 'system.debug' }
      )
      
      if (!configVector) {
        throw new Error('Configuration vector creation failed')
      }
      
      console.log('✅ L3/L4 interactions successful')
      this.testResults.push({ test: 'l3_l4_interactions', result: 'PASSED' })
      return true
    } catch (error) {
      console.log('❌ L3/L4 interactions failed:', error.message)
      this.testResults.push({ test: 'l3_l4_interactions', result: 'FAILED', error: error.message })
      return false
    }
  }

  /**
   * Test system stability
   */
  async testSystemStability() {
    console.log('Testing system stability...')
    
    try {
      // Test concurrent operations
      const promises = []
      
      for (let i = 0; i < 10; i++) {
        promises.push(
          this.vectorStore.addVector(
            `Test document ${i}`,
            this.generateTestEmbedding(`Test document ${i}`),
            { index: i }
          )
        )
      }
      
      const results = await Promise.all(promises)
      if (results.some(id => !id)) {
        throw new Error('Concurrent operations failed')
      }
      
      // Test memory card creation under load
      const memoryPromises = []
      for (let i = 0; i < 5; i++) {
        memoryPromises.push(
          this.memoryCards.createMemoryCard(
            `agent_${i}`,
            `Test memory content ${i}`,
            'test',
            { index: i }
          )
        )
      }
      
      const memoryResults = await Promise.all(memoryPromises)
      if (memoryResults.some(id => !id)) {
        throw new Error('Concurrent memory card creation failed')
      }
      
      // Test ledger operations under load
      const ledgerPromises = []
      for (let i = 0; i < 5; i++) {
        ledgerPromises.push(
          this.secureLedger.writeToLedger('test_user', 'admin', {
            action: `test_action_${i}`,
            data: { index: i },
            timestamp: new Date().toISOString()
          })
        )
      }
      
      const ledgerResults = await Promise.all(ledgerPromises)
      if (ledgerResults.some(result => !result.success)) {
        throw new Error('Concurrent ledger operations failed')
      }
      
      console.log('✅ System stability successful')
      this.testResults.push({ test: 'system_stability', result: 'PASSED' })
      return true
    } catch (error) {
      console.log('❌ System stability failed:', error.message)
      this.testResults.push({ test: 'system_stability', result: 'FAILED', error: error.message })
      return false
    }
  }

  /**
   * Generate test embedding
   * @param {string} text - Input text
   * @returns {Array<number>} - Test embedding
   */
  generateTestEmbedding(text) {
    const embedding = new Array(384).fill(0)
    const words = text.toLowerCase().split(/\s+/)
    
    words.forEach(word => {
      const hash = this.simpleHash(word)
      for (let i = 0; i < embedding.length; i++) {
        embedding[i] += Math.sin(hash + i) * 0.1
      }
    })
    
    const norm = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0))
    return embedding.map(val => val / norm)
  }

  /**
   * Simple hash function
   * @param {string} str - Input string
   * @returns {number} - Hash value
   */
  simpleHash(str) {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash
    }
    return Math.abs(hash)
  }

  /**
   * Run all L5 knowledge tests
   */
  async runAllTests() {
    console.log('=== L5 Knowledge Layer Tests - V12.0 ===\n')
    
    await this.testVectorStoreOperations()
    await this.testMemoryCardsOperations()
    await this.testSecureLedgerAccess()
    await this.testKnowledgeAPIEndpoints()
    await this.testL3L4Interactions()
    await this.testSystemStability()
    
    // Summary
    const totalTests = this.testResults.length
    const passedTests = this.testResults.filter(r => r.result === 'PASSED').length
    const failedTests = this.testResults.filter(r => r.result === 'FAILED').length
    
    console.log('\n=== L5 Knowledge Test Summary ===')
    console.log(`Total Tests: ${totalTests}`)
    console.log(`Passed: ${passedTests}`)
    console.log(`Failed: ${failedTests}`)
    
    if (failedTests > 0) {
      console.log('\nFailed Tests:')
      this.testResults.filter(r => r.result === 'FAILED').forEach(test => {
        console.log(`- ${test.test}: ${test.error || 'Unknown error'}`)
      })
    }
    
    return {
      total: totalTests,
      passed: passedTests,
      failed: failedTests,
      success: failedTests === 0
    }
  }
}

// Run tests if called directly
if (require.main === module) {
  const l5Tests = new L5KnowledgeTests()
  l5Tests.runAllTests().then(results => {
    if (results.success) {
      console.log('\n✅ All L5 knowledge tests passed!')
      process.exit(0)
    } else {
      console.log('\n❌ Some L5 knowledge tests failed!')
      process.exit(1)
    }
  })
}

module.exports = L5KnowledgeTests

