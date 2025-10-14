// Context: V12.0 CI/CD Framework - Regression Test Suite
// This script provides comprehensive regression testing capabilities for the Discovery Dial
// Mission Control system, ensuring system stability across all components.

const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

class RegressionSuite {
  constructor() {
    this.regressionResults = {
      total: 0,
      passed: 0,
      failed: 0,
      skipped: 0,
      duration: 0
    }
    
    this.regressionTests = [
      {
        name: 'system-health',
        description: 'System health monitoring and recovery',
        critical: true
      },
      {
        name: 'governance-compliance',
        description: 'Governance board and compliance checks',
        critical: true
      },
      {
        name: 'agent-management',
        description: 'Agent console and registry functionality',
        critical: true
      },
      {
        name: 'event-curation',
        description: 'Event curation and management',
        critical: true
      },
      {
        name: 'rbac-security',
        description: 'Role-based access control and security',
        critical: true
      },
      {
        name: 'recovery-protocols',
        description: 'Recovery and incident management',
        critical: true
      },
      {
        name: 'api-endpoints',
        description: 'API endpoint functionality',
        critical: false
      },
      {
        name: 'ui-components',
        description: 'User interface component rendering',
        critical: false
      }
    ]
    
    this.startTime = Date.now()
    this.freezeFlag = this.checkFreezeFlag()
  }

  /**
   * Checks if the system is in freeze mode.
   * @returns {boolean} True if system is frozen, false otherwise.
   */
  checkFreezeFlag() {
    const freezeFile = path.join(__dirname, '../.freeze')
    return fs.existsSync(freezeFile)
  }

  /**
   * Runs a single regression test.
   * @param {object} test - The test configuration.
   * @returns {Promise<object>} The test results.
   */
  async runRegressionTest(test) {
    const testFile = path.join(__dirname, `../tests/${test.name}.test.js`)
    
    if (!fs.existsSync(testFile)) {
      console.log(`⚠️  Regression test file not found: ${testFile}`)
      return { 
        name: test.name, 
        passed: 0, 
        failed: 0, 
        total: 0, 
        skipped: 1, 
        critical: test.critical,
        error: 'Test file not found'
      }
    }

    console.log(`\n🧪 Running ${test.name} regression test...`)
    console.log(`   Description: ${test.description}`)
    console.log(`   Critical: ${test.critical ? 'Yes' : 'No'}`)
    
    try {
      const startTime = Date.now()
      const result = execSync(`node "${testFile}"`, { 
        encoding: 'utf8',
        cwd: path.join(__dirname, '..'),
        timeout: 45000 // 45 second timeout per regression test
      })
      
      const duration = Date.now() - startTime
      console.log(`✅ ${test.name} regression test completed in ${duration}ms`)
      
      return { 
        name: test.name, 
        passed: 1, 
        failed: 0, 
        total: 1, 
        skipped: 0, 
        critical: test.critical,
        duration
      }
    } catch (error) {
      console.log(`❌ ${test.name} regression test failed:`, error.message)
      return { 
        name: test.name, 
        passed: 0, 
        failed: 1, 
        total: 1, 
        skipped: 0, 
        critical: test.critical,
        error: error.message,
        duration: 0
      }
    }
  }

  /**
   * Runs all regression tests.
   * @returns {Promise<object>} The overall regression results.
   */
  async runAllRegressionTests() {
    if (this.freezeFlag) {
      console.log('🧊 System is frozen - skipping regression tests')
      return this.regressionResults
    }

    console.log('🚀 Starting comprehensive regression test suite...')
    console.log(`📋 Regression tests to run: ${this.regressionTests.length}`)
    
    const testResults = []
    
    for (const test of this.regressionTests) {
      const result = await this.runRegressionTest(test)
      testResults.push(result)
      
      this.regressionResults.total += result.total
      this.regressionResults.passed += result.passed
      this.regressionResults.failed += result.failed
      this.regressionResults.skipped += result.skipped
      this.regressionResults.duration += result.duration || 0
    }
    
    this.regressionResults.duration = Date.now() - this.startTime
    this.regressionResults.testResults = testResults
    
    return this.regressionResults
  }

  /**
   * Analyzes regression test results.
   * @returns {object} The analysis results.
   */
  analyzeResults() {
    const criticalTests = this.regressionResults.testResults.filter(t => t.critical)
    const criticalFailures = criticalTests.filter(t => t.failed > 0)
    const nonCriticalFailures = this.regressionResults.testResults.filter(t => !t.critical && t.failed > 0)
    
    const analysis = {
      overallStatus: this.regressionResults.failed === 0 ? 'PASS' : 'FAIL',
      criticalStatus: criticalFailures.length === 0 ? 'PASS' : 'FAIL',
      nonCriticalStatus: nonCriticalFailures.length === 0 ? 'PASS' : 'FAIL',
      criticalFailures: criticalFailures.length,
      nonCriticalFailures: nonCriticalFailures.length,
      successRate: this.regressionResults.total > 0 
        ? Math.round((this.regressionResults.passed / this.regressionResults.total) * 100) 
        : 0,
      recommendations: this.generateRecommendations(criticalFailures, nonCriticalFailures)
    }
    
    return analysis
  }

  /**
   * Generates recommendations based on regression test results.
   * @param {Array} criticalFailures - Critical test failures.
   * @param {Array} nonCriticalFailures - Non-critical test failures.
   * @returns {Array<string>} Array of recommendations.
   */
  generateRecommendations(criticalFailures, nonCriticalFailures) {
    const recommendations = []
    
    if (this.freezeFlag) {
      recommendations.push('System is frozen - resolve freeze flag before proceeding')
    }
    
    if (criticalFailures.length > 0) {
      recommendations.push('CRITICAL: Fix critical test failures before deployment')
      criticalFailures.forEach(failure => {
        recommendations.push(`  • ${failure.name}: ${failure.error || 'Unknown error'}`)
      })
    }
    
    if (nonCriticalFailures.length > 0) {
      recommendations.push('Review non-critical test failures for potential issues')
      nonCriticalFailures.forEach(failure => {
        recommendations.push(`  • ${failure.name}: ${failure.error || 'Unknown error'}`)
      })
    }
    
    if (this.regressionResults.successRate < 95) {
      recommendations.push('Success rate below 95% - review test coverage and quality')
    }
    
    if (this.regressionResults.duration > 600000) { // 10 minutes
      recommendations.push('Regression test duration exceeds 10 minutes - optimize test performance')
    }
    
    return recommendations
  }

  /**
   * Generates a detailed regression report.
   * @returns {object} The regression report.
   */
  generateReport() {
    const analysis = this.analyzeResults()
    
    const report = {
      timestamp: new Date().toISOString(),
      freezeFlag: this.freezeFlag,
      summary: {
        total: this.regressionResults.total,
        passed: this.regressionResults.passed,
        failed: this.regressionResults.failed,
        skipped: this.regressionResults.skipped,
        successRate: analysis.successRate,
        duration: this.regressionResults.duration
      },
      analysis: {
        overallStatus: analysis.overallStatus,
        criticalStatus: analysis.criticalStatus,
        nonCriticalStatus: analysis.nonCriticalStatus,
        criticalFailures: analysis.criticalFailures,
        nonCriticalFailures: analysis.nonCriticalFailures
      },
      testResults: this.regressionResults.testResults,
      recommendations: analysis.recommendations,
      status: analysis.overallStatus
    }
    
    return report
  }

  /**
   * Saves regression report to file.
   * @param {object} report - The regression report.
   */
  saveReport(report) {
    const reportDir = path.join(__dirname, '../reports')
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true })
    }
    
    const reportFile = path.join(reportDir, `regression-report-${Date.now()}.json`)
    fs.writeFileSync(reportFile, JSON.stringify(report, null, 2))
    
    console.log(`📊 Regression report saved to: ${reportFile}`)
  }

  /**
   * Runs the complete regression suite.
   * @returns {Promise<object>} The regression suite results.
   */
  async runRegressionSuite() {
    console.log('🚀 Starting Regression Test Suite...')
    console.log(`⏰ Started at: ${new Date().toISOString()}`)
    
    if (this.freezeFlag) {
      console.log('🧊 FREEZE FLAG ACTIVE - Regression suite halted')
      return {
        success: false,
        reason: 'freeze_flag_active',
        message: 'System is frozen - regression testing blocked'
      }
    }
    
    // Run all regression tests
    const regressionResults = await this.runAllRegressionTests()
    
    // Analyze results
    const analysis = this.analyzeResults()
    
    // Generate report
    const report = this.generateReport()
    
    // Save report
    this.saveReport(report)
    
    // Determine overall success
    const overallSuccess = analysis.overallStatus === 'PASS'
    
    console.log('\n📊 Regression Suite Results:')
    console.log(`✅ Tests Passed: ${regressionResults.passed}`)
    console.log(`❌ Tests Failed: ${regressionResults.failed}`)
    console.log(`⏭️  Tests Skipped: ${regressionResults.skipped}`)
    console.log(`🎯 Overall Status: ${analysis.overallStatus}`)
    console.log(`🚨 Critical Status: ${analysis.criticalStatus}`)
    console.log(`⚠️  Non-Critical Status: ${analysis.nonCriticalStatus}`)
    console.log(`📈 Success Rate: ${analysis.successRate}%`)
    console.log(`⏱️  Total Duration: ${regressionResults.duration}ms`)
    
    if (analysis.criticalFailures > 0) {
      console.log(`\n🚨 CRITICAL FAILURES: ${analysis.criticalFailures}`)
    }
    
    if (analysis.nonCriticalFailures > 0) {
      console.log(`\n⚠️  NON-CRITICAL FAILURES: ${analysis.nonCriticalFailures}`)
    }
    
    if (report.recommendations.length > 0) {
      console.log('\n💡 Recommendations:')
      report.recommendations.forEach(rec => console.log(`   • ${rec}`))
    }
    
    return {
      success: overallSuccess,
      regressionResults,
      analysis,
      report
    }
  }
}

// Export for use in other scripts
module.exports = { RegressionSuite }

// Run regression suite if this script is executed directly
if (require.main === module) {
  const regressionSuite = new RegressionSuite()
  regressionSuite.runRegressionSuite().then(results => {
    process.exit(results.success ? 0 : 1)
  }).catch(error => {
    console.error('❌ Regression suite failed:', error)
    process.exit(1)
  })
}
