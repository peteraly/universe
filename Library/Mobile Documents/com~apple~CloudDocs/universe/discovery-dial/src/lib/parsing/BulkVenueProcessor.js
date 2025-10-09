/**
 * BulkVenueProcessor - Handles processing of 1000+ venue URLs efficiently
 * Provides batch processing, progress tracking, and comprehensive analytics
 */

import AdaptiveParser from './AdaptiveParser.js';
import AdminInteractionTracker from '../monitoring/AdminInteractionTracker.js';

class BulkVenueProcessor {
  constructor() {
    this.adaptiveParser = new AdaptiveParser();
    this.tracker = new AdminInteractionTracker();
    this.processingQueue = [];
    this.isProcessing = false;
    this.progressCallbacks = [];
    this.results = [];
    this.statistics = this.initializeStatistics();
  }

  initializeStatistics() {
    return {
      totalProcessed: 0,
      successful: 0,
      failed: 0,
      totalEvents: 0,
      averageConfidence: 0,
      processingTime: 0,
      parserUsage: {},
      errorTypes: {},
      venueTypes: {},
      startTime: null,
      endTime: null
    };
  }

  async processVenueBatch(urls, options = {}) {
    console.log(`[BulkVenueProcessor] Starting batch processing of ${urls.length} URLs`);
    
    // Initialize processing session
    this.statistics = this.initializeStatistics();
    this.statistics.startTime = new Date();
    this.results = [];
    this.isProcessing = true;

    // Track batch processing start
    this.tracker.trackInteraction('bulk_processing_start', 'BulkVenueProcessor', {
      urlCount: urls.length,
      options: options,
      timestamp: Date.now()
    });

    try {
      const batchSize = options.batchSize || 20;
      const delay = options.delay || 2000; // 2 seconds between batches
      const maxConcurrent = options.maxConcurrent || 5;

      // Process URLs in batches
      for (let i = 0; i < urls.length; i += batchSize) {
        if (!this.isProcessing) {
          console.log('[BulkVenueProcessor] Processing stopped by user');
          break;
        }

        const batch = urls.slice(i, i + batchSize);
        const batchNumber = Math.floor(i / batchSize) + 1;
        const totalBatches = Math.ceil(urls.length / batchSize);

        console.log(`[BulkVenueProcessor] Processing batch ${batchNumber}/${totalBatches} (${batch.length} URLs)`);

        // Process batch with concurrency control
        const batchResults = await this.processBatchWithConcurrency(batch, maxConcurrent);
        this.results.push(...batchResults);

        // Update progress
        this.updateProgress(i + batch.length, urls.length, batchResults);

        // Delay between batches to avoid overwhelming servers
        if (i + batchSize < urls.length) {
          await this.delay(delay);
        }
      }

      // Finalize processing
      this.statistics.endTime = new Date();
      this.statistics.processingTime = this.statistics.endTime - this.statistics.startTime;
      this.calculateFinalStatistics();

      // Track batch processing completion
      this.tracker.trackInteraction('bulk_processing_complete', 'BulkVenueProcessor', {
        totalProcessed: this.statistics.totalProcessed,
        successful: this.statistics.successful,
        failed: this.statistics.failed,
        totalEvents: this.statistics.totalEvents,
        processingTime: this.statistics.processingTime,
        timestamp: Date.now()
      });

      console.log(`[BulkVenueProcessor] Batch processing complete. ${this.statistics.successful}/${this.statistics.totalProcessed} successful`);
      return this.generateProcessingReport();

    } catch (error) {
      console.error('[BulkVenueProcessor] Batch processing failed:', error);
      
      // Track batch processing error
      this.tracker.trackInteraction('bulk_processing_error', 'BulkVenueProcessor', {
        error: error.message,
        processed: this.statistics.totalProcessed,
        timestamp: Date.now()
      });

      throw error;
    } finally {
      this.isProcessing = false;
    }
  }

  async processBatchWithConcurrency(batch, maxConcurrent) {
    const results = [];
    const promises = [];

    for (let i = 0; i < batch.length; i += maxConcurrent) {
      const concurrentBatch = batch.slice(i, i + maxConcurrent);
      
      const batchPromises = concurrentBatch.map(async (url, index) => {
        try {
          const result = await this.processSingleVenue(url);
          return { url, result, success: true };
        } catch (error) {
          console.error(`[BulkVenueProcessor] Failed to process ${url}:`, error.message);
          return { 
            url, 
            result: { events: [], error: error.message, confidence: 0 }, 
            success: false 
          };
        }
      });

      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);

      // Small delay between concurrent batches
      if (i + maxConcurrent < batch.length) {
        await this.delay(500);
      }
    }

    return results;
  }

  async processSingleVenue(url) {
    const startTime = Date.now();
    
    try {
      // Track individual venue processing
      this.tracker.trackInteraction('venue_parse_start', 'BulkVenueProcessor', {
        url: url,
        timestamp: Date.now()
      });

      const result = await this.adaptiveParser.parseVenue(url);
      const processingTime = Date.now() - startTime;

      // Track successful processing
      this.tracker.trackInteraction('venue_parse_success', 'BulkVenueProcessor', {
        url: url,
        eventsFound: result.events ? result.events.length : 0,
        confidence: result.confidence || 0,
        method: result.method || 'unknown',
        processingTime: processingTime,
        timestamp: Date.now()
      });

      return result;

    } catch (error) {
      const processingTime = Date.now() - startTime;
      
      // Track failed processing
      this.tracker.trackInteraction('venue_parse_error', 'BulkVenueProcessor', {
        url: url,
        error: error.message,
        processingTime: processingTime,
        timestamp: Date.now()
      });

      throw error;
    }
  }

  updateProgress(processed, total, batchResults) {
    const progress = {
      processed: processed,
      total: total,
      percentage: Math.round((processed / total) * 100),
      successful: this.statistics.successful,
      failed: this.statistics.failed,
      totalEvents: this.statistics.totalEvents,
      currentBatch: batchResults
    };

    // Update statistics
    batchResults.forEach(({ result, success }) => {
      this.statistics.totalProcessed++;
      
      if (success && result.events && result.events.length > 0) {
        this.statistics.successful++;
        this.statistics.totalEvents += result.events.length;
        
        // Track parser usage
        const parser = result.parserUsed || result.method || 'unknown';
        this.statistics.parserUsage[parser] = (this.statistics.parserUsage[parser] || 0) + 1;
        
        // Track venue types
        if (result.analysis && result.analysis.cmsType) {
          const venueType = result.analysis.cmsType.type;
          this.statistics.venueTypes[venueType] = (this.statistics.venueTypes[venueType] || 0) + 1;
        }
      } else {
        this.statistics.failed++;
        
        // Track error types
        const errorType = result.error || 'unknown_error';
        this.statistics.errorTypes[errorType] = (this.statistics.errorTypes[errorType] || 0) + 1;
      }
    });

    // Notify progress callbacks
    this.progressCallbacks.forEach(callback => {
      try {
        callback(progress);
      } catch (error) {
        console.warn('[BulkVenueProcessor] Progress callback error:', error);
      }
    });
  }

  calculateFinalStatistics() {
    if (this.statistics.totalProcessed > 0) {
      this.statistics.averageConfidence = this.results.reduce((sum, { result }) => {
        return sum + (result.confidence || 0);
      }, 0) / this.statistics.totalProcessed;
    }
  }

  generateProcessingReport() {
    const report = {
      summary: {
        totalProcessed: this.statistics.totalProcessed,
        successful: this.statistics.successful,
        failed: this.statistics.failed,
        successRate: this.statistics.totalProcessed > 0 ? 
          Math.round((this.statistics.successful / this.statistics.totalProcessed) * 100) : 0,
        totalEvents: this.statistics.totalEvents,
        averageConfidence: Math.round(this.statistics.averageConfidence * 100) / 100,
        processingTime: this.statistics.processingTime,
        averageTimePerVenue: this.statistics.totalProcessed > 0 ? 
          Math.round(this.statistics.processingTime / this.statistics.totalProcessed) : 0
      },
      parserUsage: this.statistics.parserUsage,
      venueTypes: this.statistics.venueTypes,
      errorTypes: this.statistics.errorTypes,
      results: this.results,
      recommendations: this.generateRecommendations()
    };

    return report;
  }

  generateRecommendations() {
    const recommendations = [];

    // Success rate recommendations
    if (this.statistics.successful / this.statistics.totalProcessed < 0.7) {
      recommendations.push({
        type: 'success_rate',
        message: 'Low success rate detected. Consider reviewing failed URLs and improving parsing strategies.',
        priority: 'high'
      });
    }

    // Parser usage recommendations
    const mostUsedParser = Object.keys(this.statistics.parserUsage).reduce((a, b) => 
      this.statistics.parserUsage[a] > this.statistics.parserUsage[b] ? a : b
    );
    
    if (mostUsedParser && this.statistics.parserUsage[mostUsedParser] / this.statistics.successful > 0.8) {
      recommendations.push({
        type: 'parser_diversity',
        message: `Most venues (${Math.round(this.statistics.parserUsage[mostUsedParser] / this.statistics.successful * 100)}%) use ${mostUsedParser} parser. Consider optimizing other parsers.`,
        priority: 'medium'
      });
    }

    // Error type recommendations
    const mostCommonError = Object.keys(this.statistics.errorTypes).reduce((a, b) => 
      this.statistics.errorTypes[a] > this.statistics.errorTypes[b] ? a : b
    );
    
    if (mostCommonError && this.statistics.errorTypes[mostCommonError] > 5) {
      recommendations.push({
        type: 'error_pattern',
        message: `Most common error: ${mostCommonError} (${this.statistics.errorTypes[mostCommonError]} occurrences). Consider addressing this issue.`,
        priority: 'high'
      });
    }

    return recommendations;
  }

  // Progress tracking
  onProgress(callback) {
    this.progressCallbacks.push(callback);
  }

  removeProgressCallback(callback) {
    const index = this.progressCallbacks.indexOf(callback);
    if (index > -1) {
      this.progressCallbacks.splice(index, 1);
    }
  }

  // Control methods
  stopProcessing() {
    this.isProcessing = false;
    console.log('[BulkVenueProcessor] Processing stop requested');
  }

  pauseProcessing() {
    this.isProcessing = false;
    console.log('[BulkVenueProcessor] Processing paused');
  }

  resumeProcessing() {
    this.isProcessing = true;
    console.log('[BulkVenueProcessor] Processing resumed');
  }

  // Utility methods
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // URL validation and preparation
  validateUrls(urls) {
    const validUrls = [];
    const invalidUrls = [];

    urls.forEach(url => {
      try {
        new URL(url);
        validUrls.push(url);
      } catch (error) {
        invalidUrls.push({ url, error: 'Invalid URL format' });
      }
    });

    return { validUrls, invalidUrls };
  }

  // CSV/Text import support
  parseUrlList(input) {
    const urls = [];
    const lines = input.split('\n');

    lines.forEach(line => {
      const trimmedLine = line.trim();
      if (trimmedLine && !trimmedLine.startsWith('#')) {
        // Handle CSV format (first column is URL)
        if (trimmedLine.includes(',')) {
          const url = trimmedLine.split(',')[0].trim();
          if (url) urls.push(url);
        } else {
          // Handle plain text format
          urls.push(trimmedLine);
        }
      }
    });

    return this.validateUrls(urls);
  }

  // Export results
  exportResults(format = 'json') {
    switch (format) {
      case 'json':
        return JSON.stringify(this.generateProcessingReport(), null, 2);
      case 'csv':
        return this.exportToCSV();
      default:
        throw new Error(`Unsupported export format: ${format}`);
    }
  }

  exportToCSV() {
    const headers = ['URL', 'Success', 'Events Found', 'Confidence', 'Method', 'Error'];
    const rows = [headers.join(',')];

    this.results.forEach(({ url, result, success }) => {
      const row = [
        url,
        success ? 'Yes' : 'No',
        result.events ? result.events.length : 0,
        result.confidence || 0,
        result.method || 'unknown',
        result.error || ''
      ];
      rows.push(row.map(field => `"${field}"`).join(','));
    });

    return rows.join('\n');
  }

  // Get current status
  getStatus() {
    return {
      isProcessing: this.isProcessing,
      statistics: this.statistics,
      queueLength: this.processingQueue.length,
      resultsCount: this.results.length
    };
  }

  // Clear results
  clearResults() {
    this.results = [];
    this.statistics = this.initializeStatistics();
    console.log('[BulkVenueProcessor] Results cleared');
  }
}

export default BulkVenueProcessor;
