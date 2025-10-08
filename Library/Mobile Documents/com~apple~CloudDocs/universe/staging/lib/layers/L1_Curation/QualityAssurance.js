#Context: L1 Quality Assurance - Event quality validation and assurance
/**
 * L1 Quality Assurance System
 * Handles event quality validation, assurance, and quality control
 * Implements V12.0 L1_Curation layer specification
 */

class QualityAssurance {
  constructor(config = {}) {
    this.config = {
      qualityThreshold: 0.8,
      enableAutoQA: true,
      requireHumanReview: false,
      qualityChecks: [
        'completeness',
        'accuracy',
        'relevance',
        'timeliness',
        'spam_detection',
        'duplicate_detection'
      ],
      ...config
    };
    
    this.qualityRules = {
      completeness: {
        requiredFields: ['name', 'description', 'date', 'time', 'venue', 'address'],
        optionalFields: ['price', 'organizer', 'contact'],
        weight: 0.3
      },
      accuracy: {
        dateFormat: /^\d{4}-\d{2}-\d{2}$/,
        timeFormat: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
        weight: 0.3
      },
      relevance: {
        minDescriptionLength: 20,
        maxDescriptionLength: 1000,
        weight: 0.2
      },
      timeliness: {
        maxDaysInFuture: 365,
        minDaysInFuture: 0,
        weight: 0.2
      }
    };
    
    this.qualityMetrics = {
      totalEvents: 0,
      passedQA: 0,
      failedQA: 0,
      averageQualityScore: 0,
      qualityTrends: []
    };
  }

  /**
   * Perform quality assurance check on event
   * @param {Object} event - Event to check
   * @returns {Object} - QA result
   */
  async performQualityCheck(event) {
    try {
      const qaResult = {
        eventId: event.id,
        passed: false,
        qualityScore: 0,
        checks: {},
        issues: [],
        recommendations: [],
        timestamp: new Date().toISOString()
      };

      // Run all quality checks
      for (const check of this.config.qualityChecks) {
        const checkResult = await this.runQualityCheck(event, check);
        qaResult.checks[check] = checkResult;
        
        if (!checkResult.passed) {
          qaResult.issues.push({
            check,
            severity: checkResult.severity,
            message: checkResult.message
          });
        }
      }

      // Calculate overall quality score
      qaResult.qualityScore = this.calculateQualityScore(qaResult.checks);
      qaResult.passed = qaResult.qualityScore >= this.config.qualityThreshold;

      // Generate recommendations
      qaResult.recommendations = this.generateRecommendations(qaResult.checks);

      // Update metrics
      this.updateQualityMetrics(qaResult);

      return {
        success: true,
        qaResult,
        message: qaResult.passed ? 'Event passed QA' : 'Event failed QA'
      };
    } catch (error) {
      console.error('Error performing quality check:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Run specific quality check
   * @param {Object} event - Event to check
   * @param {string} checkType - Type of check to run
   * @returns {Object} - Check result
   */
  async runQualityCheck(event, checkType) {
    switch (checkType) {
      case 'completeness':
        return this.checkCompleteness(event);
      case 'accuracy':
        return this.checkAccuracy(event);
      case 'relevance':
        return this.checkRelevance(event);
      case 'timeliness':
        return this.checkTimeliness(event);
      case 'spam_detection':
        return this.checkSpamDetection(event);
      case 'duplicate_detection':
        return this.checkDuplicateDetection(event);
      default:
        return {
          passed: true,
          score: 1,
          message: `Unknown check type: ${checkType}`
        };
    }
  }

  /**
   * Check event completeness
   * @param {Object} event - Event to check
   * @returns {Object} - Completeness check result
   */
  checkCompleteness(event) {
    const requiredFields = this.qualityRules.completeness.requiredFields;
    const presentFields = requiredFields.filter(field => 
      event[field] && event[field].toString().trim().length > 0
    );
    
    const completenessScore = presentFields.length / requiredFields.length;
    const passed = completenessScore >= 0.8;
    
    return {
      passed,
      score: completenessScore,
      severity: passed ? 'low' : 'high',
      message: passed 
        ? 'Event has all required fields'
        : `Missing required fields: ${requiredFields.filter(f => !presentFields.includes(f)).join(', ')}`
    };
  }

  /**
   * Check event accuracy
   * @param {Object} event - Event to check
   * @returns {Object} - Accuracy check result
   */
  checkAccuracy(event) {
    let accuracyScore = 1;
    const issues = [];
    
    // Check date format
    if (event.date) {
      if (!this.qualityRules.accuracy.dateFormat.test(event.date)) {
        accuracyScore -= 0.3;
        issues.push('Invalid date format');
      } else {
        const eventDate = new Date(event.date);
        if (isNaN(eventDate.getTime())) {
          accuracyScore -= 0.3;
          issues.push('Invalid date value');
        }
      }
    }
    
    // Check time format
    if (event.time) {
      if (!this.qualityRules.accuracy.timeFormat.test(event.time)) {
        accuracyScore -= 0.2;
        issues.push('Invalid time format');
      }
    }
    
    // Check for suspicious patterns
    if (event.description && event.description.length < 10) {
      accuracyScore -= 0.2;
      issues.push('Description too short');
    }
    
    const passed = accuracyScore >= 0.7;
    
    return {
      passed,
      score: Math.max(0, accuracyScore),
      severity: passed ? 'low' : 'medium',
      message: passed 
        ? 'Event data appears accurate'
        : `Accuracy issues: ${issues.join(', ')}`
    };
  }

  /**
   * Check event relevance
   * @param {Object} event - Event to check
   * @returns {Object} - Relevance check result
   */
  checkRelevance(event) {
    const rules = this.qualityRules.relevance;
    let relevanceScore = 1;
    const issues = [];
    
    // Check description length
    if (event.description) {
      if (event.description.length < rules.minDescriptionLength) {
        relevanceScore -= 0.3;
        issues.push('Description too short');
      } else if (event.description.length > rules.maxDescriptionLength) {
        relevanceScore -= 0.2;
        issues.push('Description too long');
      }
    }
    
    // Check for relevant content
    const relevantKeywords = ['event', 'meeting', 'workshop', 'conference', 'seminar'];
    const hasRelevantContent = relevantKeywords.some(keyword => 
      event.description?.toLowerCase().includes(keyword)
    );
    
    if (!hasRelevantContent) {
      relevanceScore -= 0.2;
      issues.push('Content may not be relevant');
    }
    
    const passed = relevanceScore >= 0.7;
    
    return {
      passed,
      score: Math.max(0, relevanceScore),
      severity: passed ? 'low' : 'medium',
      message: passed 
        ? 'Event appears relevant'
        : `Relevance issues: ${issues.join(', ')}`
    };
  }

  /**
   * Check event timeliness
   * @param {Object} event - Event to check
   * @returns {Object} - Timeliness check result
   */
  checkTimeliness(event) {
    if (!event.date) {
      return {
        passed: false,
        score: 0,
        severity: 'high',
        message: 'No date provided'
      };
    }
    
    const eventDate = new Date(event.date);
    const now = new Date();
    const daysUntilEvent = (eventDate - now) / (1000 * 60 * 60 * 24);
    
    const rules = this.qualityRules.timeliness;
    let timelinessScore = 1;
    const issues = [];
    
    if (daysUntilEvent < rules.minDaysInFuture) {
      timelinessScore -= 0.5;
      issues.push('Event is in the past');
    } else if (daysUntilEvent > rules.maxDaysInFuture) {
      timelinessScore -= 0.3;
      issues.push('Event is too far in the future');
    }
    
    const passed = timelinessScore >= 0.7;
    
    return {
      passed,
      score: Math.max(0, timelinessScore),
      severity: passed ? 'low' : 'medium',
      message: passed 
        ? 'Event timing is appropriate'
        : `Timing issues: ${issues.join(', ')}`
    };
  }

  /**
   * Check for spam content
   * @param {Object} event - Event to check
   * @returns {Object} - Spam detection result
   */
  checkSpamDetection(event) {
    const spamIndicators = [
      'free money', 'click here', 'urgent', 'limited time',
      'act now', 'guaranteed', 'no risk', 'win big'
    ];
    
    const textContent = `${event.name} ${event.description}`.toLowerCase();
    const spamScore = spamIndicators.reduce((score, indicator) => {
      return score + (textContent.includes(indicator) ? 1 : 0);
    }, 0);
    
    const passed = spamScore === 0;
    
    return {
      passed,
      score: Math.max(0, 1 - (spamScore / spamIndicators.length)),
      severity: passed ? 'low' : 'high',
      message: passed 
        ? 'No spam indicators detected'
        : 'Potential spam content detected'
    };
  }

  /**
   * Check for duplicate events
   * @param {Object} event - Event to check
   * @returns {Object} - Duplicate detection result
   */
  checkDuplicateDetection(event) {
    // This would typically check against existing events in the database
    // For now, return a basic check
    const passed = true; // Placeholder for actual duplicate detection
    
    return {
      passed,
      score: 1,
      severity: 'low',
      message: 'No duplicates detected'
    };
  }

  /**
   * Calculate overall quality score
   * @param {Object} checks - Quality check results
   * @returns {number} - Overall quality score
   */
  calculateQualityScore(checks) {
    const weights = {
      completeness: 0.3,
      accuracy: 0.3,
      relevance: 0.2,
      timeliness: 0.2
    };
    
    let totalScore = 0;
    let totalWeight = 0;
    
    Object.keys(weights).forEach(check => {
      if (checks[check]) {
        totalScore += checks[check].score * weights[check];
        totalWeight += weights[check];
      }
    });
    
    return totalWeight > 0 ? totalScore / totalWeight : 0;
  }

  /**
   * Generate quality recommendations
   * @param {Object} checks - Quality check results
   * @returns {Array} - Quality recommendations
   */
  generateRecommendations(checks) {
    const recommendations = [];
    
    Object.keys(checks).forEach(check => {
      if (!checks[check].passed) {
        switch (check) {
          case 'completeness':
            recommendations.push('Add missing required fields');
            break;
          case 'accuracy':
            recommendations.push('Verify date and time formats');
            break;
          case 'relevance':
            recommendations.push('Improve event description');
            break;
          case 'timeliness':
            recommendations.push('Check event date and time');
            break;
          case 'spam_detection':
            recommendations.push('Review content for spam indicators');
            break;
        }
      }
    });
    
    return recommendations;
  }

  /**
   * Update quality metrics
   * @param {Object} qaResult - QA result to update metrics with
   */
  updateQualityMetrics(qaResult) {
    this.qualityMetrics.totalEvents++;
    
    if (qaResult.passed) {
      this.qualityMetrics.passedQA++;
    } else {
      this.qualityMetrics.failedQA++;
    }
    
    // Update average quality score
    const totalScore = this.qualityMetrics.averageQualityScore * (this.qualityMetrics.totalEvents - 1);
    this.qualityMetrics.averageQualityScore = (totalScore + qaResult.qualityScore) / this.qualityMetrics.totalEvents;
    
    // Add to quality trends
    this.qualityMetrics.qualityTrends.push({
      timestamp: qaResult.timestamp,
      qualityScore: qaResult.qualityScore,
      passed: qaResult.passed
    });
    
    // Keep only last 100 trends
    if (this.qualityMetrics.qualityTrends.length > 100) {
      this.qualityMetrics.qualityTrends = this.qualityMetrics.qualityTrends.slice(-100);
    }
  }

  /**
   * Get quality metrics
   * @returns {Object} - Quality metrics
   */
  getQualityMetrics() {
    return {
      ...this.qualityMetrics,
      passRate: this.qualityMetrics.totalEvents > 0 
        ? this.qualityMetrics.passedQA / this.qualityMetrics.totalEvents 
        : 0
    };
  }

  /**
   * Get quality trends
   * @param {number} days - Number of days to get trends for
   * @returns {Array} - Quality trends
   */
  getQualityTrends(days = 7) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    return this.qualityMetrics.qualityTrends.filter(trend => 
      new Date(trend.timestamp) >= cutoffDate
    );
  }
}

module.exports = QualityAssurance;
