/**
 * BugDetectionEngine - Intelligent bug detection and classification system
 * Analyzes interaction patterns to identify issues and provide recommendations
 */

class BugDetectionEngine {
  constructor() {
    this.bugPatterns = this.loadBugPatterns();
    this.issueThresholds = this.loadThresholds();
    this.alertRules = this.loadAlertRules();
    this.detectionHistory = [];
    this.learningData = [];
  }

  loadBugPatterns() {
    return {
      performance: {
        slowLoad: { threshold: 3000, severity: 'high' },
        memoryLeak: { threshold: 0.8, severity: 'critical' },
        highCPU: { threshold: 80, severity: 'medium' }
      },
      errors: {
        networkError: { pattern: /network|fetch|connection/i, severity: 'high' },
        parseError: { pattern: /parse|json|syntax/i, severity: 'medium' },
        authError: { pattern: /auth|login|permission/i, severity: 'critical' },
        corsError: { pattern: /cors|cross-origin/i, severity: 'high' }
      },
      ux: {
        repeatedFailures: { threshold: 3, severity: 'medium' },
        longWaitTimes: { threshold: 5000, severity: 'high' },
        confusingFlows: { pattern: /back|retry|confused/i, severity: 'low' }
      },
      security: {
        suspiciousActivity: { pattern: /injection|script|eval/i, severity: 'critical' },
        unauthorizedAccess: { pattern: /403|401|unauthorized/i, severity: 'critical' }
      }
    };
  }

  loadThresholds() {
    return {
      performance: {
        responseTime: { warning: 1000, critical: 3000 },
        memoryUsage: { warning: 0.7, critical: 0.9 },
        errorRate: { warning: 5, critical: 15 }
      },
      userExperience: {
        failureRate: { warning: 10, critical: 25 },
        retryRate: { warning: 20, critical: 40 },
        abandonmentRate: { warning: 30, critical: 50 }
      }
    };
  }

  loadAlertRules() {
    return {
      immediate: ['critical', 'security'],
      delayed: ['high', 'medium'],
      summary: ['low']
    };
  }

  detectIssues(interaction) {
    const issues = [];
    
    // Performance analysis
    issues.push(...this.analyzePerformance(interaction));
    
    // Error analysis
    issues.push(...this.analyzeErrors(interaction));
    
    // UX analysis
    issues.push(...this.analyzeUserExperience(interaction));
    
    // Security analysis
    issues.push(...this.analyzeSecurity(interaction));
    
    // Pattern analysis
    issues.push(...this.analyzePatterns(interaction));
    
    return issues;
  }

  analyzePerformance(interaction) {
    const issues = [];
    const perf = interaction.performance;
    
    // Load time analysis
    if (perf.loadTime > this.issueThresholds.performance.responseTime.critical) {
      issues.push({
        type: 'performance',
        severity: 'critical',
        message: `Extremely slow page load: ${perf.loadTime}ms`,
        recommendation: 'Optimize component rendering, check network connectivity, or implement caching',
        data: { loadTime: perf.loadTime, threshold: this.issueThresholds.performance.responseTime.critical }
      });
    } else if (perf.loadTime > this.issueThresholds.performance.responseTime.warning) {
      issues.push({
        type: 'performance',
        severity: 'medium',
        message: `Slow page load: ${perf.loadTime}ms`,
        recommendation: 'Consider optimizing component rendering or implementing lazy loading',
        data: { loadTime: perf.loadTime, threshold: this.issueThresholds.performance.responseTime.warning }
      });
    }
    
    // Memory usage analysis
    if (perf.memoryUsage) {
      const memoryUsage = perf.memoryUsage.used / perf.memoryUsage.limit;
      if (memoryUsage > this.issueThresholds.performance.memoryUsage.critical) {
        issues.push({
          type: 'performance',
          severity: 'critical',
          message: `Critical memory usage: ${(memoryUsage * 100).toFixed(1)}%`,
          recommendation: 'Clear cache, optimize memory usage, or restart the application',
          data: { memoryUsage: memoryUsage * 100, threshold: this.issueThresholds.performance.memoryUsage.critical * 100 }
        });
      } else if (memoryUsage > this.issueThresholds.performance.memoryUsage.warning) {
        issues.push({
          type: 'performance',
          severity: 'medium',
          message: `High memory usage: ${(memoryUsage * 100).toFixed(1)}%`,
          recommendation: 'Monitor memory usage and consider optimization',
          data: { memoryUsage: memoryUsage * 100, threshold: this.issueThresholds.performance.memoryUsage.warning * 100 }
        });
      }
    }
    
    return issues;
  }

  analyzeErrors(interaction) {
    const issues = [];
    
    if (interaction.data.error) {
      const error = interaction.data.error;
      
      // Network errors
      if (this.bugPatterns.errors.networkError.pattern.test(error)) {
        issues.push({
          type: 'error',
          severity: this.bugPatterns.errors.networkError.severity,
          message: `Network error detected: ${error}`,
          recommendation: 'Check network connection, verify URL accessibility, or implement retry logic',
          data: { error, component: interaction.component }
        });
      }
      
      // Parse errors
      if (this.bugPatterns.errors.parseError.pattern.test(error)) {
        issues.push({
          type: 'error',
          severity: this.bugPatterns.errors.parseError.severity,
          message: `Parse error detected: ${error}`,
          recommendation: 'Check data format, validate JSON structure, or implement better error handling',
          data: { error, component: interaction.component }
        });
      }
      
      // Authentication errors
      if (this.bugPatterns.errors.authError.pattern.test(error)) {
        issues.push({
          type: 'error',
          severity: this.bugPatterns.errors.authError.severity,
          message: `Authentication error detected: ${error}`,
          recommendation: 'Check user credentials, verify session validity, or refresh authentication',
          data: { error, component: interaction.component }
        });
      }
      
      // CORS errors
      if (this.bugPatterns.errors.corsError.pattern.test(error)) {
        issues.push({
          type: 'error',
          severity: this.bugPatterns.errors.corsError.severity,
          message: `CORS error detected: ${error}`,
          recommendation: 'Configure CORS headers, use proxy, or implement alternative parsing method',
          data: { error, component: interaction.component }
        });
      }
    }
    
    return issues;
  }

  analyzeUserExperience(interaction) {
    const issues = [];
    
    // Venue parsing UX issues
    if (interaction.action === 'venue_parse_error') {
      issues.push({
        type: 'ux',
        severity: 'medium',
        message: 'Venue parsing failed - user experience impacted',
        recommendation: 'Improve error messages, add URL validation, or provide parsing alternatives',
        data: { url: interaction.data.url, error: interaction.data.error }
      });
    }
    
    // Repeated failures
    const recentFailures = this.getRecentFailures(interaction.component, 10);
    if (recentFailures.length >= this.bugPatterns.ux.repeatedFailures.threshold) {
      issues.push({
        type: 'ux',
        severity: this.bugPatterns.ux.repeatedFailures.severity,
        message: `Repeated failures in ${interaction.component}: ${recentFailures.length} failures`,
        recommendation: 'Investigate root cause, implement better error handling, or provide user guidance',
        data: { component: interaction.component, failureCount: recentFailures.length }
      });
    }
    
    return issues;
  }

  analyzeSecurity(interaction) {
    const issues = [];
    
    if (interaction.data.error) {
      const error = interaction.data.error;
      
      // Suspicious activity
      if (this.bugPatterns.security.suspiciousActivity.pattern.test(error)) {
        issues.push({
          type: 'security',
          severity: this.bugPatterns.security.suspiciousActivity.severity,
          message: `Suspicious activity detected: ${error}`,
          recommendation: 'Immediately investigate, block suspicious requests, or enhance security measures',
          data: { error, component: interaction.component }
        });
      }
      
      // Unauthorized access
      if (this.bugPatterns.security.unauthorizedAccess.pattern.test(error)) {
        issues.push({
          type: 'security',
          severity: this.bugPatterns.security.unauthorizedAccess.severity,
          message: `Unauthorized access attempt: ${error}`,
          recommendation: 'Verify user permissions, check authentication status, or review access controls',
          data: { error, component: interaction.component }
        });
      }
    }
    
    return issues;
  }

  analyzePatterns(interaction) {
    const issues = [];
    
    // Add interaction to learning data
    this.learningData.push({
      timestamp: interaction.timestamp,
      action: interaction.action,
      component: interaction.component,
      success: !interaction.data.error
    });
    
    // Keep only recent data (last 1000 interactions)
    if (this.learningData.length > 1000) {
      this.learningData = this.learningData.slice(-1000);
    }
    
    // Analyze patterns in recent data
    const recentData = this.learningData.slice(-100);
    const errorRate = recentData.filter(d => !d.success).length / recentData.length;
    
    if (errorRate > this.issueThresholds.performance.errorRate.critical / 100) {
      issues.push({
        type: 'pattern',
        severity: 'high',
        message: `High error rate detected: ${(errorRate * 100).toFixed(1)}%`,
        recommendation: 'Investigate systematic issues, improve error handling, or review recent changes',
        data: { errorRate: errorRate * 100, sampleSize: recentData.length }
      });
    }
    
    return issues;
  }

  getRecentFailures(component, limit = 10) {
    return this.learningData
      .filter(d => d.component === component && !d.success)
      .slice(-limit);
  }

  generateRecommendations(issues) {
    const recommendations = [];
    
    // Group issues by type and severity
    const groupedIssues = this.groupIssuesByType(issues);
    
    // Generate recommendations for each group
    Object.entries(groupedIssues).forEach(([type, typeIssues]) => {
      const criticalIssues = typeIssues.filter(i => i.severity === 'critical');
      const highIssues = typeIssues.filter(i => i.severity === 'high');
      const mediumIssues = typeIssues.filter(i => i.severity === 'medium');
      
      if (criticalIssues.length > 0) {
        recommendations.push({
          type,
          priority: 'critical',
          title: `Critical ${type} Issues Detected`,
          description: `${criticalIssues.length} critical ${type} issues require immediate attention`,
          actions: this.generateActionsForIssues(criticalIssues),
          impact: 'Critical - System stability and security at risk',
          issues: criticalIssues
        });
      }
      
      if (highIssues.length > 0) {
        recommendations.push({
          type,
          priority: 'high',
          title: `${type} Performance Issues`,
          description: `${highIssues.length} high-priority ${type} issues affecting user experience`,
          actions: this.generateActionsForIssues(highIssues),
          impact: 'High - Significant impact on user experience',
          issues: highIssues
        });
      }
      
      if (mediumIssues.length > 0) {
        recommendations.push({
          type,
          priority: 'medium',
          title: `${type} Optimization Opportunities`,
          description: `${mediumIssues.length} ${type} issues that could be improved`,
          actions: this.generateActionsForIssues(mediumIssues),
          impact: 'Medium - Potential for improved user experience',
          issues: mediumIssues
        });
      }
    });
    
    return recommendations;
  }

  groupIssuesByType(issues) {
    return issues.reduce((groups, issue) => {
      if (!groups[issue.type]) {
        groups[issue.type] = [];
      }
      groups[issue.type].push(issue);
      return groups;
    }, {});
  }

  generateActionsForIssues(issues) {
    const actions = new Set();
    
    issues.forEach(issue => {
      if (issue.recommendation) {
        actions.add(issue.recommendation);
      }
    });
    
    return Array.from(actions);
  }

  getDetectionSummary() {
    const recentIssues = this.detectionHistory.slice(-100);
    const issueTypes = this.groupIssuesByType(recentIssues);
    
    return {
      totalDetections: this.detectionHistory.length,
      recentDetections: recentIssues.length,
      issueTypes: Object.keys(issueTypes).length,
      criticalIssues: recentIssues.filter(i => i.severity === 'critical').length,
      highIssues: recentIssues.filter(i => i.severity === 'high').length,
      mediumIssues: recentIssues.filter(i => i.severity === 'medium').length,
      lowIssues: recentIssues.filter(i => i.severity === 'low').length
    };
  }

  recordDetection(issues) {
    issues.forEach(issue => {
      this.detectionHistory.push({
        ...issue,
        detectedAt: Date.now()
      });
    });
    
    // Keep only recent detections (last 1000)
    if (this.detectionHistory.length > 1000) {
      this.detectionHistory = this.detectionHistory.slice(-1000);
    }
  }

  exportDetectionData() {
    return {
      bugPatterns: this.bugPatterns,
      issueThresholds: this.issueThresholds,
      detectionHistory: this.detectionHistory,
      learningData: this.learningData,
      summary: this.getDetectionSummary()
    };
  }
}

export default BugDetectionEngine;
