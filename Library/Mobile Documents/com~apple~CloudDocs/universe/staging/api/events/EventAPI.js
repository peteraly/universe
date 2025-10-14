#Context: L1 Event API - RESTful API for event management and curation
/**
 * L1 Event API
 * RESTful API endpoints for event management and curation
 * Implements V12.0 L1_Curation layer specification
 */

const EventCurationEngine = require('../../lib/layers/L1_Curation/EventCurationEngine');
const CuratorWorkbench = require('../../lib/layers/L1_Curation/CuratorWorkbench');
const EventClassification = require('../../lib/layers/L1_Curation/EventClassification');
const QualityAssurance = require('../../lib/layers/L1_Curation/QualityAssurance');

class EventAPI {
  constructor(config = {}) {
    this.config = {
      port: 3001,
      enableCORS: true,
      enableRateLimiting: true,
      ...config
    };
    
    this.curationEngine = new EventCurationEngine();
    this.classification = new EventClassification();
    this.qualityAssurance = new QualityAssurance();
    this.workbenches = new Map(); // Active curator workbenches
  }

  /**
   * Initialize API routes
   * @returns {Object} - API routes configuration
   */
  initializeRoutes() {
    return {
      // Event management endpoints
      'POST /api/events': this.createEvent.bind(this),
      'GET /api/events': this.getEvents.bind(this),
      'GET /api/events/:id': this.getEvent.bind(this),
      'PUT /api/events/:id': this.updateEvent.bind(this),
      'DELETE /api/events/:id': this.deleteEvent.bind(this),
      
      // Curation endpoints
      'GET /api/events/curation/queue': this.getCurationQueue.bind(this),
      'POST /api/events/curation/approve': this.approveEvent.bind(this),
      'POST /api/events/curation/reject': this.rejectEvent.bind(this),
      'POST /api/events/curation/bulk-approve': this.bulkApproveEvents.bind(this),
      'POST /api/events/curation/bulk-reject': this.bulkRejectEvents.bind(this),
      
      // Classification endpoints
      'POST /api/events/classify': this.classifyEvent.bind(this),
      'GET /api/events/classification/stats': this.getClassificationStats.bind(this),
      
      // Quality assurance endpoints
      'POST /api/events/quality-check': this.performQualityCheck.bind(this),
      'GET /api/events/quality/metrics': this.getQualityMetrics.bind(this),
      'GET /api/events/quality/trends': this.getQualityTrends.bind(this),
      
      // Curator workbench endpoints
      'POST /api/curator/workbench/initialize': this.initializeWorkbench.bind(this),
      'GET /api/curator/workbench/batch': this.getWorkbenchBatch.bind(this),
      'POST /api/curator/workbench/select': this.selectEvent.bind(this),
      'POST /api/curator/workbench/bulk-approve': this.bulkApproveWorkbench.bind(this),
      'POST /api/curator/workbench/bulk-reject': this.bulkRejectWorkbench.bind(this),
      'GET /api/curator/workbench/stats': this.getWorkbenchStats.bind(this)
    };
  }

  /**
   * Create new event
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async createEvent(req, res) {
    try {
      const eventData = req.body;
      
      // Validate required fields
      const requiredFields = ['name', 'description', 'date', 'time', 'venue', 'address'];
      const missingFields = requiredFields.filter(field => !eventData[field]);
      
      if (missingFields.length > 0) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields',
          missingFields
        });
      }
      
      // Add event to curation pipeline
      const result = await this.curationEngine.addEvent(eventData);
      
      if (result.success) {
        res.status(201).json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      console.error('Error creating event:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  /**
   * Get events with filtering and pagination
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async getEvents(req, res) {
    try {
      const { status, category, limit = 50, offset = 0 } = req.query;
      
      // Get events from curation engine
      const events = Array.from(this.curationEngine.events.values());
      
      // Apply filters
      let filteredEvents = events;
      
      if (status) {
        filteredEvents = filteredEvents.filter(event => event.status === status);
      }
      
      if (category) {
        filteredEvents = filteredEvents.filter(event => event.primaryCategory === category);
      }
      
      // Apply pagination
      const paginatedEvents = filteredEvents.slice(offset, offset + parseInt(limit));
      
      res.json({
        success: true,
        events: paginatedEvents,
        total: filteredEvents.length,
        limit: parseInt(limit),
        offset: parseInt(offset)
      });
    } catch (error) {
      console.error('Error getting events:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  /**
   * Get single event by ID
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async getEvent(req, res) {
    try {
      const { id } = req.params;
      const event = this.curationEngine.events.get(id);
      
      if (!event) {
        return res.status(404).json({
          success: false,
          error: 'Event not found'
        });
      }
      
      res.json({
        success: true,
        event
      });
    } catch (error) {
      console.error('Error getting event:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  /**
   * Update event
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async updateEvent(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;
      
      const event = this.curationEngine.events.get(id);
      if (!event) {
        return res.status(404).json({
          success: false,
          error: 'Event not found'
        });
      }
      
      // Update event
      const updatedEvent = { ...event, ...updateData, updatedAt: new Date().toISOString() };
      this.curationEngine.events.set(id, updatedEvent);
      
      res.json({
        success: true,
        event: updatedEvent
      });
    } catch (error) {
      console.error('Error updating event:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  /**
   * Delete event
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async deleteEvent(req, res) {
    try {
      const { id } = req.params;
      
      const event = this.curationEngine.events.get(id);
      if (!event) {
        return res.status(404).json({
          success: false,
          error: 'Event not found'
        });
      }
      
      this.curationEngine.events.delete(id);
      
      res.json({
        success: true,
        message: 'Event deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting event:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  /**
   * Get curation queue
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async getCurationQueue(req, res) {
    try {
      const queue = this.curationEngine.getCurationQueue();
      
      res.json({
        success: true,
        queue,
        total: queue.length
      });
    } catch (error) {
      console.error('Error getting curation queue:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  /**
   * Approve event
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async approveEvent(req, res) {
    try {
      const { eventId, curatorId } = req.body;
      
      if (!eventId || !curatorId) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields: eventId, curatorId'
        });
      }
      
      const result = await this.curationEngine.approveEvent(eventId, curatorId);
      res.json(result);
    } catch (error) {
      console.error('Error approving event:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  /**
   * Reject event
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async rejectEvent(req, res) {
    try {
      const { eventId, curatorId, reason } = req.body;
      
      if (!eventId || !curatorId) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields: eventId, curatorId'
        });
      }
      
      const result = await this.curationEngine.rejectEvent(eventId, curatorId, reason);
      res.json(result);
    } catch (error) {
      console.error('Error rejecting event:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  /**
   * Classify event
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async classifyEvent(req, res) {
    try {
      const event = req.body;
      
      const result = await this.classification.classifyEvent(event);
      res.json(result);
    } catch (error) {
      console.error('Error classifying event:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  /**
   * Perform quality check
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async performQualityCheck(req, res) {
    try {
      const event = req.body;
      
      const result = await this.qualityAssurance.performQualityCheck(event);
      res.json(result);
    } catch (error) {
      console.error('Error performing quality check:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  /**
   * Get quality metrics
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async getQualityMetrics(req, res) {
    try {
      const metrics = this.qualityAssurance.getQualityMetrics();
      res.json({
        success: true,
        metrics
      });
    } catch (error) {
      console.error('Error getting quality metrics:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  /**
   * Initialize curator workbench
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async initializeWorkbench(req, res) {
    try {
      const { curatorId } = req.body;
      
      if (!curatorId) {
        return res.status(400).json({
          success: false,
          error: 'Missing required field: curatorId'
        });
      }
      
      const workbench = new CuratorWorkbench(this.curationEngine);
      const result = await workbench.initialize(curatorId);
      
      if (result.success) {
        this.workbenches.set(curatorId, workbench);
      }
      
      res.json(result);
    } catch (error) {
      console.error('Error initializing workbench:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  /**
   * Get workbench batch
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async getWorkbenchBatch(req, res) {
    try {
      const { curatorId } = req.query;
      
      if (!curatorId) {
        return res.status(400).json({
          success: false,
          error: 'Missing required field: curatorId'
        });
      }
      
      const workbench = this.workbenches.get(curatorId);
      if (!workbench) {
        return res.status(404).json({
          success: false,
          error: 'Workbench not found'
        });
      }
      
      const batch = workbench.getCurrentBatch();
      res.json({
        success: true,
        batch
      });
    } catch (error) {
      console.error('Error getting workbench batch:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }
}

module.exports = EventAPI;

