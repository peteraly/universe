// Context: V12.0 CI/CD Framework - Test Runner
// This script provides comprehensive test execution capabilities for the Discovery Dial
// Mission Control system, including unit tests, integration tests, and regression tests.

const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

class TestRunner {
  constructor() {
    this.testResults = {
      total: 0,
      passed: 0,
      failed: 0,
      skipped: 0,
      duration: 0
    }
    
    this.testSuites = [
      'recovery-protocols',
      'rollback-verification',
      'governance-regression',
      'access-control',
      'agent-crud',
      'system-health',
      'rbac-validation'
    ]
    
    this.startTime = Date.now()
    this.freezeFlag = this.checkFreezeFlag()
  }

  /**
   * Checks if the system is in freeze mode (prevents deployments).
   * @returns {boolean} True if system is frozen, false otherwise.
   */
  checkFreezeFlag() {
    const freezeFile = path.join(__dirname, '../.freeze')
    const freezeFlag = fs.existsSync(freezeFile)
    
    if (freezeFlag) {
      console.log('🧊 FREEZE FLAG DETECTED - System is frozen, skipping tests')
      return true
    }
    
    return false
  }

  /**
   * Runs a single test suite.
   * @param {string} testSuite - The name of the test suite.
   * @returns {Promise<object>} The test results.
   */
  async runTestSuite(testSuite) {
    const testFile = path.join(__dirname, `../tests/${testSuite}.test.js`)
    
    if (!fs.existsSync(testFile)) {
      console.log(`⚠️  Test file not found: ${testFile}`)
      return { passed: 0, failed: 0, total: 0, skipped: 1 }
    }

    console.log(`\n🧪 Running ${testSuite} tests...`)
    
    try {
      const startTime = Date.now()
      const result = execSync(`node ${testFile}`, { 
        encoding: 'utf8',
        cwd: path.join(__dirname, '..'),
        timeout: 30000 // 30 second timeout per test suite
      })
      
      const duration = Date.now() - startTime
      console.log(`✅ ${testSuite} tests completed in ${duration}ms`)
      
      return { passed: 1, failed: 0, total: 1, skipped: 0, duration }
    } catch (error) {
      console.log(`❌ ${testSuite} tests failed:`, error.message)
      return { passed: 0, failed: 1, total: 1, skipped: 0, duration: 0 }
    }
  }

  /**
   * Runs all test suites.
   * @returns {Promise<object>} The overall test results.
   */
  async runAllTests() {
    if (this.freezeFlag) {
      console.log('🧊 System is frozen - skipping all tests')
      return this.testResults
    }

    console.log('🚀 Starting comprehensive test suite...')
    console.log(`📋 Test suites to run: ${this.testSuites.length}`)
    
    for (const testSuite of this.testSuites) {
      const result = await this.runTestSuite(testSuite)
      
      this.testResults.total += result.total
      this.testResults.passed += result.passed
      this.testResults.failed += result.failed
      this.testResults.skipped += result.skipped
      this.testResults.duration += result.duration || 0
    }
    
    this.testResults.duration = Date.now() - this.startTime
    
    return this.testResults
  }

  /**
   * Runs build validation.
   * @returns {Promise<boolean>} True if build succeeds, false otherwise.
   */
  async runBuildValidation() {
    if (this.freezeFlag) {
      console.log('🧊 System is frozen - skipping build validation')
      return true
    }

    console.log('\n🔨 Running build validation...')
    
    try {
      const startTime = Date.now()
      execSync('npm run build', { 
        cwd: path.join(__dirname, '../../discovery-dial'),
        stdio: 'inherit',
        timeout: 60000 // 60 second timeout for build
      })
      
      const duration = Date.now() - startTime
      console.log(`✅ Build validation completed in ${duration}ms`)
      return true
    } catch (error) {
      console.log(`❌ Build validation failed:`, error.message)
      return false
    }
  }

  /**
   * Runs linting validation.
   * @returns {Promise<boolean>} True if linting passes, false otherwise.
   */
  async runLintValidation() {
    if (this.freezeFlag) {
      console.log('🧊 System is frozen - skipping lint validation')
      return true
    }

    console.log('\n🔍 Running lint validation...')
    
    try {
      const startTime = Date.now()
      execSync('npm run lint', { 
        cwd: path.join(__dirname, '../../discovery-dial'),
        stdio: 'inherit',
        timeout: 30000 // 30 second timeout for linting
      })
      
      const duration = Date.now() - startTime
      console.log(`✅ Lint validation completed in ${duration}ms`)
      return true
    } catch (error) {
      console.log(`❌ Lint validation failed:`, error.message)
      return false
    }
  }

  /**
   * Generates a test report.
   * @returns {object} The test report.
   */
  generateReport() {
    const successRate = this.testResults.total > 0 
      ? Math.round((this.testResults.passed / this.testResults.total) * 100) 
      : 0
    
    const report = {
      timestamp: new Date().toISOString(),
      freezeFlag: this.freezeFlag,
      summary: {
        total: this.testResults.total,
        passed: this.testResults.passed,
        failed: this.testResults.failed,
        skipped: this.testResults.skipped,
        successRate: successRate,
        duration: this.testResults.duration
      },
      status: this.testResults.failed === 0 ? 'PASS' : 'FAIL',
      recommendations: this.generateRecommendations()
    }
    
    return report
  }

  /**
   * Generates recommendations based on test results.
   * @returns {Array<string>} Array of recommendations.
   */
  generateRecommendations() {
    const recommendations = []
    
    if (this.freezeFlag) {
      recommendations.push('System is frozen - resolve freeze flag before proceeding')
    }
    
    if (this.testResults.failed > 0) {
      recommendations.push('Fix failing tests before deployment')
    }
    
    if (this.testResults.skipped > 0) {
      recommendations.push('Review skipped tests for potential issues')
    }
    
    if (this.testResults.successRate < 90) {
      recommendations.push('Success rate below 90% - review test coverage')
    }
    
    if (this.testResults.duration > 300000) { // 5 minutes
      recommendations.push('Test duration exceeds 5 minutes - optimize test performance')
    }
    
    return recommendations
  }

  /**
   * Saves test report to file.
   * @param {object} report - The test report.
   */
  saveReport(report) {
    const reportDir = path.join(__dirname, '../reports')
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true })
    }
    
    const reportFile = path.join(reportDir, `test-report-${Date.now()}.json`)
    fs.writeFileSync(reportFile, JSON.stringify(report, null, 2))
    
    console.log(`📊 Test report saved to: ${reportFile}`)
  }

  /**
   * Runs the complete CI/CD pipeline.
   * @returns {Promise<object>} The pipeline results.
   */
  async runPipeline() {
    console.log('🚀 Starting CI/CD Pipeline...')
    console.log(`⏰ Started at: ${new Date().toISOString()}`)
    
    if (this.freezeFlag) {
      console.log('🧊 FREEZE FLAG ACTIVE - Pipeline halted')
      return {
        success: false,
        reason: 'freeze_flag_active',
        message: 'System is frozen - deployment blocked'
      }
    }
    
    // Run all tests
    const testResults = await this.runAllTests()
    
    // Run build validation
    const buildSuccess = await this.runBuildValidation()
    
    // Run lint validation
    const lintSuccess = await this.runLintValidation()
    
    // Generate report
    const report = this.generateReport()
    
    // Save report
    this.saveReport(report)
    
    // Determine overall success
    const overallSuccess = testResults.failed === 0 && buildSuccess && lintSuccess
    
    console.log('\n📊 CI/CD Pipeline Results:')
    console.log(`✅ Tests Passed: ${testResults.passed}`)
    console.log(`❌ Tests Failed: ${testResults.failed}`)
    console.log(`⏭️  Tests Skipped: ${testResults.skipped}`)
    console.log(`🔨 Build Success: ${buildSuccess ? 'Yes' : 'No'}`)
    console.log(`🔍 Lint Success: ${lintSuccess ? 'Yes' : 'No'}`)
    console.log(`📈 Success Rate: ${report.summary.successRate}%`)
    console.log(`⏱️  Total Duration: ${testResults.duration}ms`)
    console.log(`🎯 Overall Status: ${overallSuccess ? 'PASS' : 'FAIL'}`)
    
    if (report.recommendations.length > 0) {
      console.log('\n💡 Recommendations:')
      report.recommendations.forEach(rec => console.log(`   • ${rec}`))
    }
    
    return {
      success: overallSuccess,
      testResults,
      buildSuccess,
      lintSuccess,
      report
    }
  }
}

// Export for use in other scripts
module.exports = { TestRunner }

// Run pipeline if this script is executed directly
if (require.main === module) {
  const testRunner = new TestRunner()
  testRunner.runPipeline().then(results => {
    process.exit(results.success ? 0 : 1)
  }).catch(error => {
    console.error('❌ Pipeline failed:', error)
    process.exit(1)
  })
}
