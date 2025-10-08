// Vector Store - V12.0 L5 Knowledge Layer
class VectorStore {
  constructor() {
    this.vectors = new Map()
    this.metadata = new Map()
    this.indexes = new Map()
    this.nextId = 1
    this.dimension = 384 // Default embedding dimension
  }

  /**
   * Add vector to store
   * @param {string} text - Original text content
   * @param {Array<number>} embedding - Vector embedding
   * @param {Object} metadata - Additional metadata
   * @returns {string} - Vector ID
   */
  addVector(text, embedding, metadata = {}) {
    if (!text || !embedding || !Array.isArray(embedding)) {
      throw new Error('Text and embedding are required')
    }

    if (embedding.length !== this.dimension) {
      throw new Error(`Embedding dimension must be ${this.dimension}`)
    }

    const id = `vec_${this.nextId++}`
    const vector = {
      id,
      text,
      embedding: [...embedding], // Create copy
      metadata: {
        ...metadata,
        createdAt: new Date().toISOString(),
        dimension: this.dimension
      }
    }

    this.vectors.set(id, vector)
    this.metadata.set(id, vector.metadata)
    
    // Update indexes
    this.updateIndexes(id, vector)
    
    console.log(`Vector added: ${id} (text: ${text.substring(0, 50)}...)`)
    return id
  }

  /**
   * Search similar vectors
   * @param {Array<number>} queryEmbedding - Query vector
   * @param {number} topK - Number of results to return
   * @param {Object} filters - Metadata filters
   * @returns {Array<Object>} - Similar vectors with scores
   */
  searchVectors(queryEmbedding, topK = 5, filters = {}) {
    if (!queryEmbedding || !Array.isArray(queryEmbedding)) {
      throw new Error('Query embedding is required')
    }

    if (queryEmbedding.length !== this.dimension) {
      throw new Error(`Query embedding dimension must be ${this.dimension}`)
    }

    const results = []
    
    for (const [id, vector] of this.vectors.entries()) {
      // Apply metadata filters
      if (this.matchesFilters(vector.metadata, filters)) {
        const similarity = this.cosineSimilarity(queryEmbedding, vector.embedding)
        results.push({
          id: vector.id,
          text: vector.text,
          embedding: vector.embedding,
          metadata: vector.metadata,
          similarity
        })
      }
    }

    // Sort by similarity (descending) and return top K
    return results
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, topK)
  }

  /**
   * Get vector by ID
   * @param {string} id - Vector ID
   * @returns {Object|null} - Vector object or null
   */
  getVector(id) {
    return this.vectors.get(id) || null
  }

  /**
   * Update vector metadata
   * @param {string} id - Vector ID
   * @param {Object} newMetadata - New metadata
   * @returns {boolean} - Success status
   */
  updateVectorMetadata(id, newMetadata) {
    const vector = this.vectors.get(id)
    if (!vector) return false

    vector.metadata = {
      ...vector.metadata,
      ...newMetadata,
      updatedAt: new Date().toISOString()
    }
    
    this.metadata.set(id, vector.metadata)
    this.updateIndexes(id, vector)
    
    return true
  }

  /**
   * Delete vector
   * @param {string} id - Vector ID
   * @returns {boolean} - Success status
   */
  deleteVector(id) {
    if (!this.vectors.has(id)) return false

    this.vectors.delete(id)
    this.metadata.delete(id)
    this.removeFromIndexes(id)
    
    console.log(`Vector deleted: ${id}`)
    return true
  }

  /**
   * Get all vectors with pagination
   * @param {number} offset - Starting index
   * @param {number} limit - Number of results
   * @returns {Array<Object>} - Vector list
   */
  getVectors(offset = 0, limit = 100) {
    const vectors = Array.from(this.vectors.values())
    return vectors.slice(offset, offset + limit)
  }

  /**
   * Get vector count
   * @returns {number} - Total vector count
   */
  getVectorCount() {
    return this.vectors.size
  }

  /**
   * Clear all vectors
   */
  clear() {
    this.vectors.clear()
    this.metadata.clear()
    this.indexes.clear()
    this.nextId = 1
    console.log('Vector store cleared')
  }

  /**
   * Calculate cosine similarity
   * @param {Array<number>} a - First vector
   * @param {Array<number>} b - Second vector
   * @returns {number} - Cosine similarity
   */
  cosineSimilarity(a, b) {
    if (a.length !== b.length) {
      throw new Error('Vectors must have the same dimension')
    }

    let dotProduct = 0
    let normA = 0
    let normB = 0

    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i]
      normA += a[i] * a[i]
      normB += b[i] * b[i]
    }

    normA = Math.sqrt(normA)
    normB = Math.sqrt(normB)

    if (normA === 0 || normB === 0) {
      return 0
    }

    return dotProduct / (normA * normB)
  }

  /**
   * Check if metadata matches filters
   * @param {Object} metadata - Vector metadata
   * @param {Object} filters - Filter criteria
   * @returns {boolean} - Match status
   */
  matchesFilters(metadata, filters) {
    for (const [key, value] of Object.entries(filters)) {
      if (metadata[key] !== value) {
        return false
      }
    }
    return true
  }

  /**
   * Update indexes for a vector
   * @param {string} id - Vector ID
   * @param {Object} vector - Vector object
   */
  updateIndexes(id, vector) {
    // Index by metadata fields
    for (const [key, value] of Object.entries(vector.metadata)) {
      if (!this.indexes.has(key)) {
        this.indexes.set(key, new Map())
      }
      
      const index = this.indexes.get(key)
      if (!index.has(value)) {
        index.set(value, new Set())
      }
      
      index.get(value).add(id)
    }
  }

  /**
   * Remove vector from indexes
   * @param {string} id - Vector ID
   */
  removeFromIndexes(id) {
    for (const [key, index] of this.indexes.entries()) {
      for (const [value, ids] of index.entries()) {
        ids.delete(id)
        if (ids.size === 0) {
          index.delete(value)
        }
      }
    }
  }

  /**
   * Get store statistics
   * @returns {Object} - Store statistics
   */
  getStatistics() {
    const vectors = Array.from(this.vectors.values())
    const metadataKeys = new Set()
    
    vectors.forEach(vector => {
      Object.keys(vector.metadata).forEach(key => metadataKeys.add(key))
    })

    return {
      totalVectors: this.vectors.size,
      dimension: this.dimension,
      metadataKeys: Array.from(metadataKeys),
      indexes: Object.fromEntries(
        Array.from(this.indexes.entries()).map(([key, index]) => [
          key,
          Array.from(index.keys())
        ])
      )
    }
  }

  /**
   * Export vectors to JSON
   * @returns {Object} - Exported data
   */
  export() {
    return {
      vectors: Array.from(this.vectors.values()),
      metadata: Array.from(this.metadata.entries()),
      nextId: this.nextId,
      dimension: this.dimension,
      exportedAt: new Date().toISOString()
    }
  }

  /**
   * Import vectors from JSON
   * @param {Object} data - Imported data
   */
  import(data) {
    if (data.dimension && data.dimension !== this.dimension) {
      throw new Error(`Dimension mismatch: expected ${this.dimension}, got ${data.dimension}`)
    }

    this.clear()
    
    if (data.vectors) {
      data.vectors.forEach(vector => {
        this.vectors.set(vector.id, vector)
        this.metadata.set(vector.id, vector.metadata)
      })
    }

    if (data.nextId) {
      this.nextId = data.nextId
    }

    // Rebuild indexes
    for (const [id, vector] of this.vectors.entries()) {
      this.updateIndexes(id, vector)
    }

    console.log(`Imported ${data.vectors?.length || 0} vectors`)
  }
}

module.exports = VectorStore
