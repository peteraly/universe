// Context: V12.0 UX Polish & Accessibility - Lighthouse Audit Script
// This script provides automated Lighthouse auditing for the Discovery Dial
// Mission Control system, ensuring optimal performance, accessibility, and SEO.

/* eslint-env node */
import lighthouse from 'lighthouse'
import chromeLauncher from 'chrome-launcher'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

class LighthouseAuditor {
  constructor() {
    this.auditResults = {
      performance: 0,
      accessibility: 0,
      bestPractices: 0,
      seo: 0,
      pwa: 0,
      totalScore: 0
    }
    
    this.reportDir = path.join(__dirname, '../reports')
    this.ensureReportDirectory()
  }

  /**
   * Ensures the reports directory exists.
   */
  ensureReportDirectory() {
    if (!fs.existsSync(this.reportDir)) {
      fs.mkdirSync(this.reportDir, { recursive: true })
    }
  }

  /**
   * Runs Lighthouse audit on the specified URL.
   * @param {string} url - The URL to audit.
   * @returns {Promise<object>} The audit results.
   */
  async runAudit(url = 'http://localhost:5173') {
    console.log('🔍 Starting Lighthouse audit...')
    console.log(`📊 Auditing URL: ${url}`)
    
    const chrome = await chromeLauncher.launch({ chromeFlags: ['--headless'] })
    const options = {
      logLevel: 'info',
      output: 'json',
      onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo', 'pwa'],
      port: chrome.port
    }

    try {
      const runnerResult = await lighthouse(url, options)
      
      // Extract scores
      const scores = {
        performance: Math.round(runnerResult.lhr.categories.performance.score * 100),
        accessibility: Math.round(runnerResult.lhr.categories.accessibility.score * 100),
        bestPractices: Math.round(runnerResult.lhr.categories['best-practices'].score * 100),
        seo: Math.round(runnerResult.lhr.categories.seo.score * 100),
        pwa: Math.round(runnerResult.lhr.categories.pwa.score * 100)
      }
      
      scores.totalScore = Math.round(
        (scores.performance + scores.accessibility + scores.bestPractices + scores.seo + scores.pwa) / 5
      )
      
      this.auditResults = scores
      
      // Save detailed report
      const reportPath = path.join(this.reportDir, `lighthouse-report-${Date.now()}.json`)
      fs.writeFileSync(reportPath, JSON.stringify(runnerResult.lhr, null, 2))
      
      console.log('✅ Lighthouse audit completed')
      console.log(`📊 Report saved to: ${reportPath}`)
      
      return {
        success: true,
        scores: scores,
        reportPath: reportPath,
        recommendations: this.generateRecommendations(scores)
      }
      
    } catch (error) {
      console.error('❌ Lighthouse audit failed:', error.message)
      return {
        success: false,
        error: error.message
      }
    } finally {
      await chrome.kill()
    }
  }

  /**
   * Generates recommendations based on audit scores.
   * @param {object} scores - The audit scores.
   * @returns {Array<string>} Array of recommendations.
   */
  generateRecommendations(scores) {
    const recommendations = []
    
    if (scores.performance < 90) {
      recommendations.push('Performance score below 90 - optimize loading times and resource usage')
    }
    
    if (scores.accessibility < 95) {
      recommendations.push('Accessibility score below 95 - improve screen reader support and keyboard navigation')
    }
    
    if (scores.bestPractices < 90) {
      recommendations.push('Best practices score below 90 - review security and modern web standards')
    }
    
    if (scores.seo < 90) {
      recommendations.push('SEO score below 90 - improve meta tags and structured data')
    }
    
    if (scores.pwa < 80) {
      recommendations.push('PWA score below 80 - implement progressive web app features')
    }
    
    if (scores.totalScore < 85) {
      recommendations.push('Overall score below 85 - comprehensive optimization needed')
    }
    
    return recommendations
  }

  /**
   * Generates a summary report.
   * @returns {object} The summary report.
   */
  generateSummaryReport() {
    const report = {
      timestamp: new Date().toISOString(),
      scores: this.auditResults,
      status: this.auditResults.totalScore >= 85 ? 'PASS' : 'FAIL',
      recommendations: this.generateRecommendations(this.auditResults)
    }
    
    return report
  }

  /**
   * Saves the summary report.
   * @param {object} report - The summary report.
   */
  saveSummaryReport(report) {
    const reportPath = path.join(this.reportDir, `lighthouse-summary-${Date.now()}.json`)
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2))
    
    console.log(`📊 Summary report saved to: ${reportPath}`)
  }

  /**
   * Runs the complete Lighthouse audit process.
   * @param {string} url - The URL to audit.
   * @returns {Promise<object>} The audit results.
   */
  async runCompleteAudit(url = 'http://localhost:5173') {
    console.log('🚀 Starting complete Lighthouse audit process...')
    
    const auditResult = await this.runAudit(url)
    
    if (!auditResult.success) {
      console.error('❌ Audit failed:', auditResult.error)
      return auditResult
    }
    
    const summaryReport = this.generateSummaryReport()
    this.saveSummaryReport(summaryReport)
    
    // Display results
    console.log('\n📊 Lighthouse Audit Results:')
    console.log(`🎯 Performance: ${auditResult.scores.performance}/100`)
    console.log(`♿ Accessibility: ${auditResult.scores.accessibility}/100`)
    console.log(`✅ Best Practices: ${auditResult.scores.bestPractices}/100`)
    console.log(`🔍 SEO: ${auditResult.scores.seo}/100`)
    console.log(`📱 PWA: ${auditResult.scores.pwa}/100`)
    console.log(`📈 Total Score: ${auditResult.scores.totalScore}/100`)
    console.log(`🎯 Status: ${summaryReport.status}`)
    
    if (auditResult.recommendations.length > 0) {
      console.log('\n💡 Recommendations:')
      auditResult.recommendations.forEach(rec => console.log(`   • ${rec}`))
    }
    
    return auditResult
  }
}

// Export for use in other scripts
export { LighthouseAuditor }

// Run audit if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const auditor = new LighthouseAuditor()
  const url = process.argv[2] || 'http://localhost:5173'
  
  auditor.runCompleteAudit(url).then(results => {
    process.exit(results.success ? 0 : 1)
  }).catch(error => {
    console.error('❌ Audit process failed:', error)
    process.exit(1)
  })
}
