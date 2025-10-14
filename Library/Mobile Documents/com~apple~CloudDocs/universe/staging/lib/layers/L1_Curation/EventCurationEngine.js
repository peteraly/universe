#Context: L1 Event Curation Engine - Core event management and curation logic
/**
 * L1 Event Curation Engine
 * Handles event lifecycle, quality scoring, and curation workflows
 * Implements V12.0 L1_Curation layer specification
 */

class EventCurationEngine {
  constructor(config = {}) {
    this.config = {
      qualityThreshold: 0.8,
      maxEventsPerBatch: 100,
      curationWorkflow: 'human-in-loop',
      ...config
    };
    
    this.events = new Map();
    this.curationQueue = [];
    this.qualityMetrics = {
      totalEvents: 0,
      curatedEvents: 0,
      rejectedEvents: 0,
      averageQualityScore: 0
    };
  }

  /**
   * Add event to curation pipeline
   * @param {Object} eventData - Event information
   * @returns {Object} - Curation result with quality score
   */
  async addEvent(eventData) {
    try {
      const event = {
        id: this.generateEventId(),
        ...eventData,
        createdAt: new Date().toISOString(),
        status: 'pending_curation',
        qualityScore: 0,
        curationHistory: []
      };

      // Initial quality assessment
      const qualityScore = await this.assessEventQuality(event);
      event.qualityScore = qualityScore;

      // Add to appropriate queue based on quality
      if (qualityScore >= this.config.qualityThreshold) {
        event.status = 'approved';
        this.events.set(event.id, event);
        this.qualityMetrics.curatedEvents++;
      } else {
        event.status = 'pending_review';
        this.curationQueue.push(event);
      }

      this.qualityMetrics.totalEvents++;
      this.updateQualityMetrics();

      return {
        success: true,
        eventId: event.id,
        qualityScore,
        status: event.status,
        message: qualityScore >= this.config.qualityThreshold 
          ? 'Event auto-approved' 
          : 'Event requires manual review'
      };

    } catch (error) {
      console.error('Error adding event to curation pipeline:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Assess event quality using multiple criteria
   * @param {Object} event - Event to assess
   * @returns {number} - Quality score (0-1)
   */
  async assessEventQuality(event) {
    const criteria = {
      completeness: this.checkCompleteness(event),
      accuracy: this.checkAccuracy(event),
      relevance: this.checkRelevance(event),
      timeliness: this.checkTimeliness(event)
    };

    // Weighted quality score
    const weights = {
      completeness: 0.3,
      accuracy: 0.3,
      relevance: 0.2,
      timeliness: 0.2
    };

    const qualityScore = Object.keys(criteria).reduce((score, criterion) => {
      return score + (criteria[criterion] * weights[criterion]);
    }, 0);

    return Math.min(1, Math.max(0, qualityScore));
  }

  /**
   * Check event completeness
   * @param {Object} event - Event to check
   * @returns {number} - Completeness score (0-1)
   */
  checkCompleteness(event) {
    const requiredFields = ['name', 'description', 'date', 'time', 'venue', 'address'];
    const presentFields = requiredFields.filter(field => 
      event[field] && event[field].toString().trim().length > 0
    );
    
    return presentFields.length / requiredFields.length;
  }

  /**
   * Check event accuracy
   * @param {Object} event - Event to check
   * @returns {number} - Accuracy score (0-1)
   */
  checkAccuracy(event) {
    let accuracyScore = 1;
    
    // Check date format and validity
    if (event.date) {
      const eventDate = new Date(event.date);
      if (isNaN(eventDate.getTime()) || eventDate < new Date()) {
        accuracyScore -= 0.3;
      }
    }
    
    // Check time format
    if (event.time && !/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(event.time)) {
      accuracyScore -= 0.2;
    }
    
    // Check for suspicious patterns
    if (event.description && event.description.length < 10) {
      accuracyScore -= 0.2;
    }
    
    return Math.max(0, accuracyScore);
  }

  /**
   * Check event relevance
   * @param {Object} event - Event to check
   * @returns {number} - Relevance score (0-1)
   */
  checkRelevance(event) {
    // Simple relevance scoring based on category and content
    const relevantCategories = ['Professional', 'Arts/Culture', 'Social/Fun', 'Education'];
    const categoryScore = relevantCategories.includes(event.primaryCategory) ? 1 : 0.5;
    
    // Check for relevant keywords
    const relevantKeywords = ['networking', 'workshop', 'conference', 'meetup', 'seminar'];
    const hasRelevantKeywords = relevantKeywords.some(keyword => 
      event.description?.toLowerCase().includes(keyword)
    );
    
    const keywordScore = hasRelevantKeywords ? 1 : 0.7;
    
    return (categoryScore + keywordScore) / 2;
  }

  /**
   * Check event timeliness
   * @param {Object} event - Event to check
   * @returns {number} - Timeliness score (0-1)
   */
  checkTimeliness(event) {
    if (!event.date) return 0;
    
    const eventDate = new Date(event.date);
    const now = new Date();
    const daysUntilEvent = (eventDate - now) / (1000 * 60 * 60 * 24);
    
    // Prefer events that are 1-30 days away
    if (daysUntilEvent < 0) return 0; // Past events
    if (daysUntilEvent > 90) return 0.5; // Too far in future
    if (daysUntilEvent >= 1 && daysUntilEvent <= 30) return 1; // Optimal range
    if (daysUntilEvent < 1) return 0.8; // Very soon
    
    return 0.6; // Acceptable range
  }

  /**
   * Get events for curation review
   * @returns {Array} - Events pending review
   */
  getCurationQueue() {
    return this.curationQueue.map(event => ({
      id: event.id,
      name: event.name,
      description: event.description,
      qualityScore: event.qualityScore,
      status: event.status,
      createdAt: event.createdAt
    }));
  }

  /**
   * Approve event for publication
   * @param {string} eventId - Event ID to approve
   * @param {string} curatorId - Curator who approved
   * @returns {Object} - Approval result
   */
  async approveEvent(eventId, curatorId) {
    const event = this.curationQueue.find(e => e.id === eventId);
    if (!event) {
      return { success: false, error: 'Event not found in curation queue' };
    }

    event.status = 'approved';
    event.curationHistory.push({
      action: 'approved',
      curatorId,
      timestamp: new Date().toISOString()
    });

    this.events.set(eventId, event);
    this.curationQueue = this.curationQueue.filter(e => e.id !== eventId);
    this.qualityMetrics.curatedEvents++;

    return { success: true, eventId, status: 'approved' };
  }

  /**
   * Reject event
   * @param {string} eventId - Event ID to reject
   * @param {string} curatorId - Curator who rejected
   * @param {string} reason - Rejection reason
   * @returns {Object} - Rejection result
   */
  async rejectEvent(eventId, curatorId, reason) {
    const event = this.curationQueue.find(e => e.id === eventId);
    if (!event) {
      return { success: false, error: 'Event not found in curation queue' };
    }

    event.status = 'rejected';
    event.curationHistory.push({
      action: 'rejected',
      curatorId,
      reason,
      timestamp: new Date().toISOString()
    });

    this.curationQueue = this.curationQueue.filter(e => e.id !== eventId);
    this.qualityMetrics.rejectedEvents++;

    return { success: true, eventId, status: 'rejected' };
  }

  /**
   * Get quality metrics
   * @returns {Object} - Quality metrics
   */
  getQualityMetrics() {
    return {
      ...this.qualityMetrics,
      curationQueueLength: this.curationQueue.length,
      approvalRate: this.qualityMetrics.totalEvents > 0 
        ? this.qualityMetrics.curatedEvents / this.qualityMetrics.totalEvents 
        : 0
    };
  }

  /**
   * Update quality metrics
   */
  updateQualityMetrics() {
    if (this.qualityMetrics.totalEvents > 0) {
      const totalScore = Array.from(this.events.values())
        .reduce((sum, event) => sum + event.qualityScore, 0);
      this.qualityMetrics.averageQualityScore = totalScore / this.events.size;
    }
  }

  /**
   * Generate unique event ID
   * @returns {string} - Unique event ID
   */
  generateEventId() {
    return `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

module.exports = EventCurationEngine;

