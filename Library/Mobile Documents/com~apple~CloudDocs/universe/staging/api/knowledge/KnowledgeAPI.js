// Knowledge API - V12.0 L5 Knowledge Layer
const VectorStore = require('../../lib/layers/L5_Knowledge/VectorStore')
const AgentMemoryCards = require('../../lib/layers/L5_Knowledge/AgentMemoryCards')
const SecureLedgerAccess = require('../../lib/layers/L5_Knowledge/SecureLedgerAccess')
const RBACMiddleware = require('../../lib/auth/middleware')

class KnowledgeAPI {
  constructor() {
    this.middleware = new RBACMiddleware()
    this.vectorStore = new VectorStore()
    this.memoryCards = new AgentMemoryCards()
    this.secureLedger = new SecureLedgerAccess()
  }

  /**
   * Add knowledge to vector store
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async addKnowledge(req, res) {
    try {
      const { text, metadata = {} } = req.body
      const entityId = req.userId || 'system'
      const entityType = req.userRole || 'user'
      
      if (!text) {
        return res.status(400).json({
          success: false,
          error: 'Text content is required'
        })
      }

      // Generate embedding (simulated)
      const embedding = this.generateEmbedding(text)
      
      // Add to vector store
      const vectorId = this.vectorStore.addVector(text, embedding, {
        ...metadata,
        addedBy: entityId,
        entityType
      })

      // Log to secure ledger
      const ledgerResult = this.secureLedger.writeToLedger(entityId, entityType, {
        action: 'knowledge_added',
        data: { vectorId, text: text.substring(0, 100) + '...' },
        timestamp: new Date().toISOString(),
        metadata: { vectorId, textLength: text.length }
      })

      if (!ledgerResult.success) {
        console.warn('Failed to log to ledger:', ledgerResult.error)
      }

      res.json({
        success: true,
        message: 'Knowledge added successfully',
        vectorId,
        timestamp: new Date().toISOString()
      })
    } catch (error) {
      console.error('Error adding knowledge:', error)
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      })
    }
  }

  /**
   * Search knowledge
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async searchKnowledge(req, res) {
    try {
      const { query, topK = 5, filters = {} } = req.query
      const entityId = req.userId || 'system'
      const entityType = req.userRole || 'user'
      
      if (!query) {
        return res.status(400).json({
          success: false,
          error: 'Search query is required'
        })
      }

      // Generate query embedding
      const queryEmbedding = this.generateEmbedding(query)
      
      // Search vector store
      const results = this.vectorStore.searchVectors(queryEmbedding, parseInt(topK), filters)

      // Log search to secure ledger
      const ledgerResult = this.secureLedger.writeToLedger(entityId, entityType, {
        action: 'knowledge_searched',
        data: { query, resultCount: results.length },
        timestamp: new Date().toISOString(),
        metadata: { query, topK, filters }
      })

      if (!ledgerResult.success) {
        console.warn('Failed to log search to ledger:', ledgerResult.error)
      }

      res.json({
        success: true,
        results,
        query,
        total: results.length,
        timestamp: new Date().toISOString()
      })
    } catch (error) {
      console.error('Error searching knowledge:', error)
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      })
    }
  }

  /**
   * Create agent memory card
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async createMemoryCard(req, res) {
    try {
      const { agentId, content, type = 'conversation', metadata = {} } = req.body
      const entityId = req.userId || 'system'
      const entityType = req.userRole || 'user'
      
      if (!agentId || !content) {
        return res.status(400).json({
          success: false,
          error: 'Agent ID and content are required'
        })
      }

      // Create memory card
      const cardId = this.memoryCards.createMemoryCard(agentId, content, type, {
        ...metadata,
        createdBy: entityId,
        entityType
      })

      // Log to secure ledger
      const ledgerResult = this.secureLedger.writeToLedger(entityId, entityType, {
        action: 'memory_card_created',
        data: { cardId, agentId, type },
        timestamp: new Date().toISOString(),
        metadata: { cardId, agentId, type, contentLength: content.length }
      })

      if (!ledgerResult.success) {
        console.warn('Failed to log to ledger:', ledgerResult.error)
      }

      res.json({
        success: true,
        message: 'Memory card created successfully',
        cardId,
        timestamp: new Date().toISOString()
      })
    } catch (error) {
      console.error('Error creating memory card:', error)
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      })
    }
  }

  /**
   * Get agent memory cards
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async getMemoryCards(req, res) {
    try {
      const { agentId } = req.params
      const { filters = {}, limit = 50 } = req.query
      const entityId = req.userId || 'system'
      const entityType = req.userRole || 'user'
      
      if (!agentId) {
        return res.status(400).json({
          success: false,
          error: 'Agent ID is required'
        })
      }

      // Get memory cards
      const cards = this.memoryCards.getMemoryCards(agentId, filters, parseInt(limit))

      // Log access to secure ledger
      const ledgerResult = this.secureLedger.writeToLedger(entityId, entityType, {
        action: 'memory_cards_accessed',
        data: { agentId, cardCount: cards.length },
        timestamp: new Date().toISOString(),
        metadata: { agentId, filters, limit }
      })

      if (!ledgerResult.success) {
        console.warn('Failed to log to ledger:', ledgerResult.error)
      }

      res.json({
        success: true,
        cards,
        agentId,
        total: cards.length,
        timestamp: new Date().toISOString()
      })
    } catch (error) {
      console.error('Error getting memory cards:', error)
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      })
    }
  }

  /**
   * Search agent memory cards
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async searchMemoryCards(req, res) {
    try {
      const { agentId } = req.params
      const { query, topK = 5 } = req.query
      const entityId = req.userId || 'system'
      const entityType = req.userRole || 'user'
      
      if (!agentId || !query) {
        return res.status(400).json({
          success: false,
          error: 'Agent ID and query are required'
        })
      }

      // Search memory cards
      const results = this.memoryCards.searchMemoryCards(agentId, query, parseInt(topK))

      // Log search to secure ledger
      const ledgerResult = this.secureLedger.writeToLedger(entityId, entityType, {
        action: 'memory_cards_searched',
        data: { agentId, query, resultCount: results.length },
        timestamp: new Date().toISOString(),
        metadata: { agentId, query, topK }
      })

      if (!ledgerResult.success) {
        console.warn('Failed to log search to ledger:', ledgerResult.error)
      }

      res.json({
        success: true,
        results,
        agentId,
        query,
        total: results.length,
        timestamp: new Date().toISOString()
      })
    } catch (error) {
      console.error('Error searching memory cards:', error)
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      })
    }
  }

  /**
   * Get knowledge statistics
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async getKnowledgeStatistics(req, res) {
    try {
      const entityId = req.userId || 'system'
      const entityType = req.userRole || 'user'
      
      // Get vector store statistics
      const vectorStats = this.vectorStore.getStatistics()
      
      // Get memory card statistics
      const memoryStats = this.memoryCards.getStatistics()
      
      // Get ledger statistics
      const ledgerStats = this.secureLedger.getLedgerStatistics(entityId, entityType)
      
      const statistics = {
        vectorStore: vectorStats,
        memoryCards: memoryStats,
        ledger: ledgerStats.success ? ledgerStats.statistics : null,
        timestamp: new Date().toISOString()
      }

      res.json({
        success: true,
        statistics,
        timestamp: new Date().toISOString()
      })
    } catch (error) {
      console.error('Error getting knowledge statistics:', error)
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      })
    }
  }

  /**
   * Get ledger entries (read-only for LLM)
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async getLedgerEntries(req, res) {
    try {
      const { filters = {} } = req.query
      const entityId = req.userId || 'system'
      const entityType = req.userRole || 'user'
      
      // Read from secure ledger
      const result = this.secureLedger.readFromLedger(entityId, entityType, filters)
      
      if (!result.success) {
        return res.status(403).json({
          success: false,
          error: result.error,
          accessDenied: result.accessDenied
        })
      }

      res.json({
        success: true,
        entries: result.entries,
        total: result.total,
        limit: result.limit,
        offset: result.offset,
        accessLevel: result.accessLevel,
        timestamp: new Date().toISOString()
      })
    } catch (error) {
      console.error('Error getting ledger entries:', error)
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      })
    }
  }

  /**
   * Generate embedding for text (simulated)
   * @param {string} text - Input text
   * @returns {Array<number>} - Embedding vector
   */
  generateEmbedding(text) {
    // Simulate embedding generation
    const embedding = new Array(384).fill(0)
    const words = text.toLowerCase().split(/\s+/)
    
    // Simple hash-based embedding simulation
    words.forEach(word => {
      const hash = this.simpleHash(word)
      for (let i = 0; i < embedding.length; i++) {
        embedding[i] += Math.sin(hash + i) * 0.1
      }
    })

    // Normalize
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
      hash = hash & hash // Convert to 32-bit integer
    }
    return Math.abs(hash)
  }

  /**
   * Get middleware for routes
   * @returns {Object} - Middleware functions
   */
  getMiddleware() {
    return {
      requirePermission: this.middleware.requirePermission.bind(this.middleware)
    }
  }
}

module.exports = KnowledgeAPI

