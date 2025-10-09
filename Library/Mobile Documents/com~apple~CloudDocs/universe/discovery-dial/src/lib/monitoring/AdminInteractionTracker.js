/**
 * AdminInteractionTracker - Real-time interaction monitoring for admin dashboard
 * Tracks all admin actions, performance metrics, and user behavior patterns
 */

class AdminInteractionTracker {
  constructor() {
    this.interactions = [];
    this.sessionId = this.generateSessionId();
    this.startTime = Date.now();
    this.bugReports = [];
    this.performanceMetrics = {
      avgResponseTime: 0,
      successRate: 100,
      errorRate: 0,
      totalInteractions: 0
    };
    this.isMonitoring = true;
    
    // Initialize monitoring
    this.initializeMonitoring();
  }

  generateSessionId() {
    return `admin-session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  generateId() {
    return `interaction-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  initializeMonitoring() {
    // Set up global error tracking
    window.addEventListener('error', (event) => {
      this.trackInteraction('error', 'Global', {
        error: event.error?.message || 'Unknown error',
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno
      });
    });

    // Set up unhandled promise rejection tracking
    window.addEventListener('unhandledrejection', (event) => {
      this.trackInteraction('unhandled_rejection', 'Global', {
        error: event.reason?.message || 'Unhandled promise rejection',
        reason: event.reason
      });
    });

    console.log(`🔍 Admin Interaction Tracker initialized - Session: ${this.sessionId}`);
  }

  trackInteraction(action, component, data = {}) {
    if (!this.isMonitoring) return;

    const interaction = {
      id: this.generateId(),
      sessionId: this.sessionId,
      timestamp: Date.now(),
      action,
      component,
      data,
      userAgent: navigator.userAgent,
      url: window.location.href,
      performance: this.capturePerformanceMetrics()
    };
    
    this.interactions.push(interaction);
    this.updatePerformanceMetrics(interaction);
    this.analyzeForIssues(interaction);
    
    // Keep only last 1000 interactions to prevent memory issues
    if (this.interactions.length > 1000) {
      this.interactions = this.interactions.slice(-1000);
    }

    // Log significant interactions
    if (this.isSignificantInteraction(interaction)) {
      console.log(`📊 Admin Interaction: ${action} on ${component}`, interaction);
    }
  }

  capturePerformanceMetrics() {
    const navigation = performance.getEntriesByType('navigation')[0];
    const paint = performance.getEntriesByType('paint');
    
    return {
      loadTime: navigation ? navigation.loadEventEnd - navigation.loadEventStart : 0,
      domContentLoaded: navigation ? navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart : 0,
      firstPaint: paint.find(p => p.name === 'first-paint')?.startTime || 0,
      firstContentfulPaint: paint.find(p => p.name === 'first-contentful-paint')?.startTime || 0,
      memoryUsage: performance.memory ? {
        used: performance.memory.usedJSHeapSize,
        total: performance.memory.totalJSHeapSize,
        limit: performance.memory.jsHeapSizeLimit
      } : null
    };
  }

  updatePerformanceMetrics(interaction) {
    this.performanceMetrics.totalInteractions++;
    
    // Update average response time
    if (interaction.data.duration) {
      const total = this.performanceMetrics.avgResponseTime * (this.performanceMetrics.totalInteractions - 1);
      this.performanceMetrics.avgResponseTime = (total + interaction.data.duration) / this.performanceMetrics.totalInteractions;
    }
    
    // Update success/error rates
    const recentInteractions = this.interactions.slice(-100); // Last 100 interactions
    const errors = recentInteractions.filter(i => i.action.includes('error') || i.data.error);
    const successes = recentInteractions.filter(i => !i.action.includes('error') && !i.data.error);
    
    this.performanceMetrics.errorRate = (errors.length / recentInteractions.length) * 100;
    this.performanceMetrics.successRate = (successes.length / recentInteractions.length) * 100;
  }

  analyzeForIssues(interaction) {
    const issues = this.detectIssues(interaction);
    if (issues.length > 0) {
      this.reportIssues(issues, interaction);
    }
  }

  detectIssues(interaction) {
    const issues = [];
    
    // Performance issues
    if (interaction.performance.loadTime > 3000) {
      issues.push({
        type: 'performance',
        severity: 'high',
        message: 'Slow page load detected',
        recommendation: 'Optimize component rendering or check network connectivity',
        data: { loadTime: interaction.performance.loadTime }
      });
    }
    
    // Error patterns
    if (interaction.data.error) {
      issues.push({
        type: 'error',
        severity: 'critical',
        message: `Error in ${interaction.component}: ${interaction.data.error}`,
        recommendation: this.getErrorRecommendation(interaction.data.error),
        data: { error: interaction.data.error, component: interaction.component }
      });
    }
    
    // User experience issues
    if (interaction.action === 'venue_parse_error') {
      issues.push({
        type: 'ux',
        severity: 'medium',
        message: 'Venue parsing failed',
        recommendation: 'Check venue URL format and parsing methods',
        data: { url: interaction.data.url, error: interaction.data.error }
      });
    }
    
    // Memory issues
    if (interaction.performance.memoryUsage) {
      const memoryUsage = interaction.performance.memoryUsage.used / interaction.performance.memoryUsage.limit;
      if (memoryUsage > 0.8) {
        issues.push({
          type: 'performance',
          severity: 'high',
          message: 'High memory usage detected',
          recommendation: 'Clear cache or optimize memory usage',
          data: { memoryUsage: memoryUsage * 100 }
        });
      }
    }
    
    return issues;
  }

  getErrorRecommendation(error) {
    const recommendations = {
      'Failed to fetch': 'Check network connection and venue URL accessibility',
      'Invalid URL': 'Ensure URL format is correct (include http:// or https://)',
      'CORS error': 'Venue may block cross-origin requests, try different parsing method',
      'Timeout': 'Venue may be slow to respond, consider increasing timeout',
      'Parse error': 'Venue structure may have changed, try reparsing or different method',
      'Network error': 'Check internet connection and try again',
      'Syntax error': 'Check for JavaScript syntax issues in the code'
    };
    
    // Find best matching recommendation
    for (const [key, recommendation] of Object.entries(recommendations)) {
      if (error.toLowerCase().includes(key.toLowerCase())) {
        return recommendation;
      }
    }
    
    return 'Review error details and try alternative approach';
  }

  reportIssues(issues, interaction) {
    issues.forEach(issue => {
      const bugReport = {
        id: this.generateId(),
        timestamp: Date.now(),
        sessionId: this.sessionId,
        issue,
        interaction,
        resolved: false
      };
      
      this.bugReports.push(bugReport);
      
      // Log critical issues immediately
      if (issue.severity === 'critical') {
        console.error(`🚨 Critical Issue Detected: ${issue.message}`, bugReport);
      } else {
        console.warn(`⚠️ Issue Detected: ${issue.message}`, bugReport);
      }
    });
  }

  isSignificantInteraction(interaction) {
    const significantActions = [
      'venue_parse_success',
      'venue_parse_error',
      'admin_login',
      'admin_logout',
      'error',
      'unhandled_rejection'
    ];
    
    return significantActions.includes(interaction.action) || 
           interaction.data.error || 
           interaction.performance.loadTime > 2000;
  }

  getSessionSummary() {
    const duration = Date.now() - this.startTime;
    const recentInteractions = this.interactions.slice(-50);
    
    return {
      sessionId: this.sessionId,
      duration: Math.round(duration / 1000), // seconds
      totalInteractions: this.interactions.length,
      recentInteractions: recentInteractions.length,
      performanceMetrics: this.performanceMetrics,
      bugReports: this.bugReports.length,
      criticalIssues: this.bugReports.filter(b => b.issue.severity === 'critical').length,
      isMonitoring: this.isMonitoring
    };
  }

  startMonitoring() {
    this.isMonitoring = true;
    console.log('🔍 Admin monitoring started');
  }

  stopMonitoring() {
    this.isMonitoring = false;
    console.log('⏹️ Admin monitoring stopped');
  }

  clearData() {
    this.interactions = [];
    this.bugReports = [];
    this.performanceMetrics = {
      avgResponseTime: 0,
      successRate: 100,
      errorRate: 0,
      totalInteractions: 0
    };
    console.log('🗑️ Admin monitoring data cleared');
  }

  exportData() {
    return {
      sessionId: this.sessionId,
      startTime: this.startTime,
      endTime: Date.now(),
      interactions: this.interactions,
      bugReports: this.bugReports,
      performanceMetrics: this.performanceMetrics,
      summary: this.getSessionSummary()
    };
  }
}

export default AdminInteractionTracker;
