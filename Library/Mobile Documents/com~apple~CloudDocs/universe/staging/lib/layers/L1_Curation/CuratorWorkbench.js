#Context: L1 Curator Workbench - Human-in-loop curation interface
/**
 * L1 Curator Workbench
 * Provides human-in-loop curation interface for event review and approval
 * Implements V12.0 L1_Curation layer specification
 */

class CuratorWorkbench {
  constructor(curationEngine, config = {}) {
    this.curationEngine = curationEngine;
    this.config = {
      batchSize: 20,
      autoRefreshInterval: 30000, // 30 seconds
      enableBulkActions: true,
      ...config
    };
    
    this.currentBatch = [];
    this.selectedEvents = new Set();
    this.curatorId = null;
    this.isActive = false;
  }

  /**
   * Initialize workbench for curator
   * @param {string} curatorId - Curator identifier
   * @returns {Object} - Initialization result
   */
  async initialize(curatorId) {
    try {
      this.curatorId = curatorId;
      this.isActive = true;
      
      // Load initial batch
      await this.loadBatch();
      
      return {
        success: true,
        curatorId,
        batchSize: this.currentBatch.length,
        message: 'Curator workbench initialized'
      };
    } catch (error) {
      console.error('Error initializing curator workbench:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Load batch of events for curation
   * @returns {Object} - Batch loading result
   */
  async loadBatch() {
    try {
      const curationQueue = this.curationEngine.getCurationQueue();
      const startIndex = 0;
      const endIndex = Math.min(startIndex + this.config.batchSize, curationQueue.length);
      
      this.currentBatch = curationQueue.slice(startIndex, endIndex);
      this.selectedEvents.clear();
      
      return {
        success: true,
        batch: this.currentBatch,
        totalEvents: curationQueue.length,
        message: `Loaded ${this.currentBatch.length} events for curation`
      };
    } catch (error) {
      console.error('Error loading curation batch:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get current batch of events
   * @returns {Array} - Current batch of events
   */
  getCurrentBatch() {
    return this.currentBatch.map(event => ({
      id: event.id,
      name: event.name,
      description: event.description,
      qualityScore: event.qualityScore,
      status: event.status,
      createdAt: event.createdAt,
      selected: this.selectedEvents.has(event.id)
    }));
  }

  /**
   * Select event for bulk action
   * @param {string} eventId - Event ID to select
   * @param {boolean} selected - Whether to select or deselect
   * @returns {Object} - Selection result
   */
  selectEvent(eventId, selected = true) {
    if (selected) {
      this.selectedEvents.add(eventId);
    } else {
      this.selectedEvents.delete(eventId);
    }
    
    return {
      success: true,
      selectedCount: this.selectedEvents.size,
      eventId,
      selected
    };
  }

  /**
   * Select all events in current batch
   * @returns {Object} - Selection result
   */
  selectAll() {
    this.currentBatch.forEach(event => {
      this.selectedEvents.add(event.id);
    });
    
    return {
      success: true,
      selectedCount: this.selectedEvents.size,
      message: 'All events selected'
    };
  }

  /**
   * Deselect all events
   * @returns {Object} - Deselection result
   */
  deselectAll() {
    this.selectedEvents.clear();
    
    return {
      success: true,
      selectedCount: 0,
      message: 'All events deselected'
    };
  }

  /**
   * Approve single event
   * @param {string} eventId - Event ID to approve
   * @returns {Object} - Approval result
   */
  async approveEvent(eventId) {
    try {
      const result = await this.curationEngine.approveEvent(eventId, this.curatorId);
      
      if (result.success) {
        // Remove from current batch
        this.currentBatch = this.currentBatch.filter(event => event.id !== eventId);
        this.selectedEvents.delete(eventId);
      }
      
      return result;
    } catch (error) {
      console.error('Error approving event:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Reject single event
   * @param {string} eventId - Event ID to reject
   * @param {string} reason - Rejection reason
   * @returns {Object} - Rejection result
   */
  async rejectEvent(eventId, reason) {
    try {
      const result = await this.curationEngine.rejectEvent(eventId, this.curatorId, reason);
      
      if (result.success) {
        // Remove from current batch
        this.currentBatch = this.currentBatch.filter(event => event.id !== eventId);
        this.selectedEvents.delete(eventId);
      }
      
      return result;
    } catch (error) {
      console.error('Error rejecting event:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Bulk approve selected events
   * @returns {Object} - Bulk approval result
   */
  async bulkApprove() {
    if (this.selectedEvents.size === 0) {
      return {
        success: false,
        error: 'No events selected for approval'
      };
    }

    try {
      const results = [];
      const eventIds = Array.from(this.selectedEvents);
      
      for (const eventId of eventIds) {
        const result = await this.curationEngine.approveEvent(eventId, this.curatorId);
        results.push({ eventId, ...result });
      }
      
      // Remove approved events from current batch
      this.currentBatch = this.currentBatch.filter(event => 
        !this.selectedEvents.has(event.id)
      );
      this.selectedEvents.clear();
      
      const successCount = results.filter(r => r.success).length;
      
      return {
        success: true,
        approvedCount: successCount,
        totalSelected: eventIds.length,
        results,
        message: `Bulk approved ${successCount} events`
      };
    } catch (error) {
      console.error('Error in bulk approval:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Bulk reject selected events
   * @param {string} reason - Rejection reason for all events
   * @returns {Object} - Bulk rejection result
   */
  async bulkReject(reason) {
    if (this.selectedEvents.size === 0) {
      return {
        success: false,
        error: 'No events selected for rejection'
      };
    }

    try {
      const results = [];
      const eventIds = Array.from(this.selectedEvents);
      
      for (const eventId of eventIds) {
        const result = await this.curationEngine.rejectEvent(eventId, this.curatorId, reason);
        results.push({ eventId, ...result });
      }
      
      // Remove rejected events from current batch
      this.currentBatch = this.currentBatch.filter(event => 
        !this.selectedEvents.has(event.id)
      );
      this.selectedEvents.clear();
      
      const successCount = results.filter(r => r.success).length;
      
      return {
        success: true,
        rejectedCount: successCount,
        totalSelected: eventIds.length,
        results,
        message: `Bulk rejected ${successCount} events`
      };
    } catch (error) {
      console.error('Error in bulk rejection:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get curation statistics
   * @returns {Object} - Curation statistics
   */
  getCurationStats() {
    const qualityMetrics = this.curationEngine.getQualityMetrics();
    
    return {
      currentBatchSize: this.currentBatch.length,
      selectedCount: this.selectedEvents.size,
      totalEvents: qualityMetrics.totalEvents,
      curatedEvents: qualityMetrics.curatedEvents,
      rejectedEvents: qualityMetrics.rejectedEvents,
      approvalRate: qualityMetrics.approvalRate,
      averageQualityScore: qualityMetrics.averageQualityScore,
      curationQueueLength: qualityMetrics.curationQueueLength
    };
  }

  /**
   * Get event details for detailed review
   * @param {string} eventId - Event ID to get details for
   * @returns {Object} - Event details
   */
  getEventDetails(eventId) {
    const event = this.currentBatch.find(e => e.id === eventId);
    if (!event) {
      return {
        success: false,
        error: 'Event not found in current batch'
      };
    }
    
    return {
      success: true,
      event: {
        id: event.id,
        name: event.name,
        description: event.description,
        qualityScore: event.qualityScore,
        status: event.status,
        createdAt: event.createdAt,
        qualityBreakdown: {
          completeness: this.curationEngine.checkCompleteness(event),
          accuracy: this.curationEngine.checkAccuracy(event),
          relevance: this.curationEngine.checkRelevance(event),
          timeliness: this.curationEngine.checkTimeliness(event)
        }
      }
    };
  }

  /**
   * Deactivate workbench
   * @returns {Object} - Deactivation result
   */
  deactivate() {
    this.isActive = false;
    this.curatorId = null;
    this.currentBatch = [];
    this.selectedEvents.clear();
    
    return {
      success: true,
      message: 'Curator workbench deactivated'
    };
  }
}

module.exports = CuratorWorkbench;

