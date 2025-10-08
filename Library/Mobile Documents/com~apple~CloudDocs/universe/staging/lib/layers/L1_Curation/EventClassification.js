#Context: L1 Event Classification - AI-powered event categorization and tagging
/**
 * L1 Event Classification System
 * Handles automatic event categorization, tagging, and classification
 * Implements V12.0 L1_Curation layer specification
 */

class EventClassification {
  constructor(config = {}) {
    this.config = {
      confidenceThreshold: 0.7,
      maxTagsPerEvent: 10,
      enableAutoClassification: true,
      ...config
    };
    
    this.categories = {
      'Professional': {
        keywords: ['networking', 'conference', 'workshop', 'seminar', 'career', 'business', 'professional'],
        weight: 1.0
      },
      'Arts/Culture': {
        keywords: ['art', 'culture', 'exhibition', 'gallery', 'museum', 'theater', 'music', 'dance'],
        weight: 1.0
      },
      'Social/Fun': {
        keywords: ['social', 'fun', 'party', 'celebration', 'meetup', 'gathering', 'entertainment'],
        weight: 1.0
      },
      'Education': {
        keywords: ['education', 'learning', 'course', 'training', 'academic', 'study', 'knowledge'],
        weight: 1.0
      }
    };
    
    this.tags = {
      'networking': { weight: 0.9, category: 'Professional' },
      'workshop': { weight: 0.8, category: 'Professional' },
      'conference': { weight: 0.9, category: 'Professional' },
      'art': { weight: 0.8, category: 'Arts/Culture' },
      'music': { weight: 0.7, category: 'Arts/Culture' },
      'social': { weight: 0.6, category: 'Social/Fun' },
      'education': { weight: 0.8, category: 'Education' },
      'free': { weight: 0.5, category: 'General' },
      'paid': { weight: 0.3, category: 'General' },
      'virtual': { weight: 0.4, category: 'General' },
      'in-person': { weight: 0.6, category: 'General' }
    };
  }

  /**
   * Classify event into categories and tags
   * @param {Object} event - Event to classify
   * @returns {Object} - Classification result
   */
  async classifyEvent(event) {
    try {
      const classification = {
        primaryCategory: null,
        secondaryCategories: [],
        tags: [],
        confidence: 0,
        classificationMethod: 'automated'
      };

      // Extract text content for analysis
      const textContent = this.extractTextContent(event);
      
      // Classify primary category
      const categoryResult = this.classifyCategory(textContent);
      classification.primaryCategory = categoryResult.category;
      classification.confidence = categoryResult.confidence;
      
      // Generate secondary categories
      classification.secondaryCategories = this.getSecondaryCategories(textContent, categoryResult.category);
      
      // Generate tags
      classification.tags = this.generateTags(textContent, classification.primaryCategory);
      
      // Add classification metadata
      classification.classifiedAt = new Date().toISOString();
      classification.classificationVersion = '1.0';
      
      return {
        success: true,
        classification,
        message: 'Event classified successfully'
      };
    } catch (error) {
      console.error('Error classifying event:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Extract text content from event for analysis
   * @param {Object} event - Event object
   * @returns {string} - Combined text content
   */
  extractTextContent(event) {
    const textFields = [
      event.name || '',
      event.description || '',
      event.venue || '',
      event.primaryCategory || ''
    ];
    
    return textFields.join(' ').toLowerCase();
  }

  /**
   * Classify event into primary category
   * @param {string} textContent - Text content to analyze
   * @returns {Object} - Category classification result
   */
  classifyCategory(textContent) {
    const categoryScores = {};
    
    // Calculate scores for each category
    Object.keys(this.categories).forEach(category => {
      const categoryConfig = this.categories[category];
      let score = 0;
      let keywordMatches = 0;
      
      categoryConfig.keywords.forEach(keyword => {
        if (textContent.includes(keyword.toLowerCase())) {
          score += categoryConfig.weight;
          keywordMatches++;
        }
      });
      
      // Normalize score by number of keywords
      if (keywordMatches > 0) {
        score = score / categoryConfig.keywords.length;
      }
      
      categoryScores[category] = score;
    });
    
    // Find best category
    const bestCategory = Object.keys(categoryScores).reduce((a, b) => 
      categoryScores[a] > categoryScores[b] ? a : b
    );
    
    const confidence = categoryScores[bestCategory];
    
    return {
      category: confidence >= this.config.confidenceThreshold ? bestCategory : 'Uncategorized',
      confidence: Math.min(1, confidence),
      scores: categoryScores
    };
  }

  /**
   * Get secondary categories for event
   * @param {string} textContent - Text content to analyze
   * @param {string} primaryCategory - Primary category
   * @returns {Array} - Secondary categories
   */
  getSecondaryCategories(textContent, primaryCategory) {
    const secondaryCategories = [];
    const categoryScores = {};
    
    // Calculate scores for all categories except primary
    Object.keys(this.categories).forEach(category => {
      if (category !== primaryCategory) {
        const categoryConfig = this.categories[category];
        let score = 0;
        
        categoryConfig.keywords.forEach(keyword => {
          if (textContent.includes(keyword.toLowerCase())) {
            score += categoryConfig.weight;
          }
        });
        
        if (score > 0) {
          score = score / categoryConfig.keywords.length;
          categoryScores[category] = score;
        }
      }
    });
    
    // Add categories with score above threshold
    Object.keys(categoryScores).forEach(category => {
      if (categoryScores[category] >= 0.3) {
        secondaryCategories.push({
          category,
          confidence: categoryScores[category]
        });
      }
    });
    
    // Sort by confidence
    return secondaryCategories.sort((a, b) => b.confidence - a.confidence);
  }

  /**
   * Generate tags for event
   * @param {string} textContent - Text content to analyze
   * @param {string} primaryCategory - Primary category
   * @returns {Array} - Generated tags
   */
  generateTags(textContent, primaryCategory) {
    const eventTags = [];
    
    // Check for tag matches
    Object.keys(this.tags).forEach(tag => {
      const tagConfig = this.tags[tag];
      let score = 0;
      
      // Direct keyword match
      if (textContent.includes(tag.toLowerCase())) {
        score = tagConfig.weight;
      }
      
      // Category-based boost
      if (tagConfig.category === primaryCategory) {
        score *= 1.2;
      }
      
      if (score >= 0.5) {
        eventTags.push({
          tag,
          confidence: Math.min(1, score),
          category: tagConfig.category
        });
      }
    });
    
    // Sort by confidence and limit to max tags
    return eventTags
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, this.config.maxTagsPerEvent);
  }

  /**
   * Get classification statistics
   * @returns {Object} - Classification statistics
   */
  getClassificationStats() {
    return {
      totalCategories: Object.keys(this.categories).length,
      totalTags: Object.keys(this.tags).length,
      confidenceThreshold: this.config.confidenceThreshold,
      maxTagsPerEvent: this.config.maxTagsPerEvent,
      categories: Object.keys(this.categories),
      availableTags: Object.keys(this.tags)
    };
  }

  /**
   * Update category configuration
   * @param {string} category - Category name
   * @param {Object} config - New configuration
   * @returns {Object} - Update result
   */
  updateCategoryConfig(category, config) {
    try {
      if (this.categories[category]) {
        this.categories[category] = { ...this.categories[category], ...config };
        return {
          success: true,
          message: `Category ${category} updated successfully`
        };
      } else {
        return {
          success: false,
          error: `Category ${category} not found`
        };
      }
    } catch (error) {
      console.error('Error updating category config:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Add new tag
   * @param {string} tag - Tag name
   * @param {Object} config - Tag configuration
   * @returns {Object} - Add result
   */
  addTag(tag, config) {
    try {
      this.tags[tag] = {
        weight: config.weight || 0.5,
        category: config.category || 'General',
        ...config
      };
      
      return {
        success: true,
        message: `Tag ${tag} added successfully`
      };
    } catch (error) {
      console.error('Error adding tag:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Remove tag
   * @param {string} tag - Tag name to remove
   * @returns {Object} - Remove result
   */
  removeTag(tag) {
    try {
      if (this.tags[tag]) {
        delete this.tags[tag];
        return {
          success: true,
          message: `Tag ${tag} removed successfully`
        };
      } else {
        return {
          success: false,
          error: `Tag ${tag} not found`
        };
      }
    } catch (error) {
      console.error('Error removing tag:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

module.exports = EventClassification;
