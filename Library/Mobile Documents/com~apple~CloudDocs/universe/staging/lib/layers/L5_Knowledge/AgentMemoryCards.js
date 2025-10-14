// Agent Memory Cards - V12.0 L5 Knowledge Layer
const VectorStore = require('./VectorStore')

class AgentMemoryCards {
  constructor() {
    this.vectorStore = new VectorStore()
    this.memoryCards = new Map()
    this.agentSessions = new Map()
    this.nextCardId = 1
  }

  /**
   * Create a new memory card for an agent
   * @param {string} agentId - Agent identifier
   * @param {string} content - Memory content
   * @param {string} type - Memory type (conversation, knowledge, experience)
   * @param {Object} metadata - Additional metadata
   * @returns {string} - Memory card ID
   */
  createMemoryCard(agentId, content, type = 'conversation', metadata = {}) {
    if (!agentId || !content) {
      throw new Error('Agent ID and content are required')
    }

    const cardId = `card_${this.nextCardId++}`
    const timestamp = new Date().toISOString()
    
    // Generate embedding for the content (simulated)
    const embedding = this.generateEmbedding(content)
    
    // Create memory card
    const memoryCard = {
      id: cardId,
      agentId,
      content,
      type,
      embedding,
      metadata: {
        ...metadata,
        createdAt: timestamp,
        updatedAt: timestamp,
        accessCount: 0,
        lastAccessed: null
      }
    }

    // Store in vector store
    const vectorId = this.vectorStore.addVector(content, embedding, {
      agentId,
      type,
      cardId,
      ...metadata
    })

    // Store memory card
    this.memoryCards.set(cardId, memoryCard)
    
    // Update agent session
    this.updateAgentSession(agentId, cardId, 'created')
    
    console.log(`Memory card created: ${cardId} for agent ${agentId}`)
    return cardId
  }

  /**
   * Retrieve memory cards for an agent
   * @param {string} agentId - Agent identifier
   * @param {Object} filters - Filter criteria
   * @param {number} limit - Maximum number of results
   * @returns {Array<Object>} - Memory cards
   */
  getMemoryCards(agentId, filters = {}, limit = 50) {
    if (!agentId) {
      throw new Error('Agent ID is required')
    }

    const agentCards = Array.from(this.memoryCards.values())
      .filter(card => card.agentId === agentId)
      .filter(card => this.matchesFilters(card, filters))
      .sort((a, b) => new Date(b.metadata.createdAt) - new Date(a.metadata.createdAt))
      .slice(0, limit)

    // Update access tracking
    agentCards.forEach(card => {
      card.metadata.accessCount++
      card.metadata.lastAccessed = new Date().toISOString()
    })

    return agentCards
  }

  /**
   * Search memory cards by similarity
   * @param {string} agentId - Agent identifier
   * @param {string} query - Search query
   * @param {number} topK - Number of results
   * @returns {Array<Object>} - Similar memory cards
   */
  searchMemoryCards(agentId, query, topK = 5) {
    if (!agentId || !query) {
      throw new Error('Agent ID and query are required')
    }

    // Generate embedding for query
    const queryEmbedding = this.generateEmbedding(query)
    
    // Search in vector store
    const results = this.vectorStore.searchVectors(queryEmbedding, topK, {
      agentId
    })

    // Convert to memory card format
    return results.map(result => {
      const card = this.memoryCards.get(result.metadata.cardId)
      if (card) {
        // Update access tracking
        card.metadata.accessCount++
        card.metadata.lastAccessed = new Date().toISOString()
        
        return {
          ...card,
          similarity: result.similarity
        }
      }
      return null
    }).filter(Boolean)
  }

  /**
   * Update memory card
   * @param {string} cardId - Memory card ID
   * @param {Object} updates - Update data
   * @returns {boolean} - Success status
   */
  updateMemoryCard(cardId, updates) {
    const card = this.memoryCards.get(cardId)
    if (!card) return false

    // Update card data
    Object.assign(card, updates)
    card.metadata.updatedAt = new Date().toISOString()

    // Update vector store if content changed
    if (updates.content) {
      const newEmbedding = this.generateEmbedding(updates.content)
      card.embedding = newEmbedding
      
      // Find and update vector
      for (const [vectorId, vector] of this.vectorStore.vectors.entries()) {
        if (vector.metadata.cardId === cardId) {
          this.vectorStore.vectors.set(vectorId, {
            ...vector,
            text: updates.content,
            embedding: newEmbedding
          })
          break
        }
      }
    }

    console.log(`Memory card updated: ${cardId}`)
    return true
  }

  /**
   * Delete memory card
   * @param {string} cardId - Memory card ID
   * @returns {boolean} - Success status
   */
  deleteMemoryCard(cardId) {
    const card = this.memoryCards.get(cardId)
    if (!card) return false

    // Remove from vector store
    for (const [vectorId, vector] of this.vectorStore.vectors.entries()) {
      if (vector.metadata.cardId === cardId) {
        this.vectorStore.deleteVector(vectorId)
        break
      }
    }

    // Remove from memory cards
    this.memoryCards.delete(cardId)
    
    // Update agent session
    this.updateAgentSession(card.agentId, cardId, 'deleted')
    
    console.log(`Memory card deleted: ${cardId}`)
    return true
  }

  /**
   * Get agent session summary
   * @param {string} agentId - Agent identifier
   * @returns {Object} - Session summary
   */
  getAgentSession(agentId) {
    const session = this.agentSessions.get(agentId) || {
      agentId,
      totalCards: 0,
      cardTypes: {},
      lastActivity: null,
      recentCards: []
    }

    // Update with current data
    const agentCards = Array.from(this.memoryCards.values())
      .filter(card => card.agentId === agentId)

    session.totalCards = agentCards.length
    session.cardTypes = agentCards.reduce((types, card) => {
      types[card.type] = (types[card.type] || 0) + 1
      return types
    }, {})

    session.lastActivity = agentCards.length > 0 
      ? Math.max(...agentCards.map(card => new Date(card.metadata.createdAt).getTime()))
      : null

    session.recentCards = agentCards
      .sort((a, b) => new Date(b.metadata.createdAt) - new Date(a.metadata.createdAt))
      .slice(0, 10)
      .map(card => ({
        id: card.id,
        type: card.type,
        content: card.content.substring(0, 100) + '...',
        createdAt: card.metadata.createdAt
      }))

    return session
  }

  /**
   * Get memory card statistics
   * @returns {Object} - Statistics
   */
  getStatistics() {
    const cards = Array.from(this.memoryCards.values())
    const agents = new Set(cards.map(card => card.agentId))
    
    const stats = {
      totalCards: cards.length,
      totalAgents: agents.size,
      cardTypes: {},
      agentStats: {},
      vectorStoreStats: this.vectorStore.getStatistics()
    }

    // Card type distribution
    cards.forEach(card => {
      stats.cardTypes[card.type] = (stats.cardTypes[card.type] || 0) + 1
    })

    // Agent statistics
    agents.forEach(agentId => {
      const agentCards = cards.filter(card => card.agentId === agentId)
      stats.agentStats[agentId] = {
        totalCards: agentCards.length,
        cardTypes: agentCards.reduce((types, card) => {
          types[card.type] = (types[card.type] || 0) + 1
          return types
        }, {}),
        lastActivity: agentCards.length > 0 
          ? Math.max(...agentCards.map(card => new Date(card.metadata.createdAt).getTime()))
          : null
      }
    })

    return stats
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
   * Check if card matches filters
   * @param {Object} card - Memory card
   * @param {Object} filters - Filter criteria
   * @returns {boolean} - Match status
   */
  matchesFilters(card, filters) {
    for (const [key, value] of Object.entries(filters)) {
      if (card[key] !== value && card.metadata[key] !== value) {
        return false
      }
    }
    return true
  }

  /**
   * Update agent session
   * @param {string} agentId - Agent identifier
   * @param {string} cardId - Memory card ID
   * @param {string} action - Action performed
   */
  updateAgentSession(agentId, cardId, action) {
    if (!this.agentSessions.has(agentId)) {
      this.agentSessions.set(agentId, {
        agentId,
        totalCards: 0,
        cardTypes: {},
        lastActivity: null,
        recentCards: []
      })
    }

    const session = this.agentSessions.get(agentId)
    session.lastActivity = new Date().toISOString()
  }

  /**
   * Clear all memory cards
   */
  clear() {
    this.memoryCards.clear()
    this.agentSessions.clear()
    this.vectorStore.clear()
    this.nextCardId = 1
    console.log('All memory cards cleared')
  }

  /**
   * Export memory cards
   * @returns {Object} - Exported data
   */
  export() {
    return {
      memoryCards: Array.from(this.memoryCards.values()),
      agentSessions: Array.from(this.agentSessions.entries()),
      vectorStore: this.vectorStore.export(),
      nextCardId: this.nextCardId,
      exportedAt: new Date().toISOString()
    }
  }

  /**
   * Import memory cards
   * @param {Object} data - Imported data
   */
  import(data) {
    this.clear()
    
    if (data.memoryCards) {
      data.memoryCards.forEach(card => {
        this.memoryCards.set(card.id, card)
      })
    }

    if (data.agentSessions) {
      data.agentSessions.forEach(([agentId, session]) => {
        this.agentSessions.set(agentId, session)
      })
    }

    if (data.vectorStore) {
      this.vectorStore.import(data.vectorStore)
    }

    if (data.nextCardId) {
      this.nextCardId = data.nextCardId
    }

    console.log(`Imported ${data.memoryCards?.length || 0} memory cards`)
  }
}

module.exports = AgentMemoryCards

