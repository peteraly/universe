// Intelligence Center Smoke Test - V12.0 L4 Intelligence Module
const IntelligenceAPI = require('../api/intelligence/IntelligenceAPI')

class IntelligenceSmokeTest {
  constructor() {
    this.intelligenceAPI = new IntelligenceAPI()
    this.testResults = []
  }

  /**
   * Test intelligence status endpoint
   */
  async testIntelligenceStatus() {
    console.log('Testing intelligence status endpoint...')
    
    try {
      const mockReq = {
        headers: { 'x-session-id': 'session_123' },
        query: {}
      }
      
      const mockRes = {
        json: (data) => {
          if (data.success && data.data && typeof data.data.quarantineMode === 'boolean') {
            console.log('✅ Intelligence status endpoint successful')
            this.testResults.push({ test: 'intelligence_status', result: 'PASSED' })
            return true
          } else {
            console.log('❌ Intelligence status endpoint failed:', data.error)
            this.testResults.push({ test: 'intelligence_status', result: 'FAILED', error: data.error })
            return false
          }
        }
      }

      await this.intelligenceAPI.getIntelligenceStatus(mockReq, mockRes)
    } catch (error) {
      console.log('❌ Intelligence status endpoint error:', error.message)
      this.testResults.push({ test: 'intelligence_status', result: 'FAILED', error: error.message })
      return false
    }
  }

  /**
   * Test incidents endpoint
   */
  async testIncidentsEndpoint() {
    console.log('Testing incidents endpoint...')
    
    try {
      const mockReq = {
        headers: { 'x-session-id': 'session_123' },
        query: {}
      }
      
      const mockRes = {
        json: (data) => {
          if (data.success && Array.isArray(data.incidents)) {
            console.log('✅ Incidents endpoint successful')
            this.testResults.push({ test: 'incidents_endpoint', result: 'PASSED' })
            return true
          } else {
            console.log('❌ Incidents endpoint failed:', data.error)
            this.testResults.push({ test: 'incidents_endpoint', result: 'FAILED', error: data.error })
            return false
          }
        }
      }

      await this.intelligenceAPI.getIncidents(mockReq, mockRes)
    } catch (error) {
      console.log('❌ Incidents endpoint error:', error.message)
      this.testResults.push({ test: 'incidents_endpoint', result: 'FAILED', error: error.message })
      return false
    }
  }

  /**
   * Test quarantine toggle
   */
  async testQuarantineToggle() {
    console.log('Testing quarantine toggle...')
    
    try {
      const mockReq = {
        headers: { 'x-session-id': 'session_123' },
        body: { enabled: true },
        userId: 'test_user'
      }
      
      const mockRes = {
        json: (data) => {
          if (data.success && data.quarantineMode === true) {
            console.log('✅ Quarantine toggle successful')
            this.testResults.push({ test: 'quarantine_toggle', result: 'PASSED' })
            return true
          } else {
            console.log('❌ Quarantine toggle failed:', data.error)
            this.testResults.push({ test: 'quarantine_toggle', result: 'FAILED', error: data.error })
            return false
          }
        }
      }

      await this.intelligenceAPI.toggleQuarantine(mockReq, mockRes)
    } catch (error) {
      console.log('❌ Quarantine toggle error:', error.message)
      this.testResults.push({ test: 'quarantine_toggle', result: 'FAILED', error: error.message })
      return false
    }
  }

  /**
   * Test drift detection update
   */
  async testDriftDetectionUpdate() {
    console.log('Testing drift detection update...')
    
    try {
      const mockReq = {
        headers: { 'x-session-id': 'session_123' },
        body: { threshold: 0.2, active: true },
        userId: 'test_user'
      }
      
      const mockRes = {
        json: (data) => {
          if (data.success && data.driftDetection && data.driftDetection.threshold === 0.2) {
            console.log('✅ Drift detection update successful')
            this.testResults.push({ test: 'drift_detection_update', result: 'PASSED' })
            return true
          } else {
            console.log('❌ Drift detection update failed:', data.error)
            this.testResults.push({ test: 'drift_detection_update', result: 'FAILED', error: data.error })
            return false
          }
        }
      }

      await this.intelligenceAPI.updateDriftDetection(mockReq, mockRes)
    } catch (error) {
      console.log('❌ Drift detection update error:', error.message)
      this.testResults.push({ test: 'drift_detection_update', result: 'FAILED', error: error.message })
      return false
    }
  }

  /**
   * Test incident action
   */
  async testIncidentAction() {
    console.log('Testing incident action...')
    
    try {
      // First create a simulated incident
      this.intelligenceAPI.simulateIncident()
      const incidents = this.intelligenceAPI.incidents
      const incidentId = incidents[incidents.length - 1].id
      
      const mockReq = {
        headers: { 'x-session-id': 'session_123' },
        body: { incidentId, action: 'investigate' },
        userId: 'test_user'
      }
      
      const mockRes = {
        json: (data) => {
          if (data.success && data.incident && data.incident.status === 'investigating') {
            console.log('✅ Incident action successful')
            this.testResults.push({ test: 'incident_action', result: 'PASSED' })
            return true
          } else {
            console.log('❌ Incident action failed:', data.error)
            this.testResults.push({ test: 'incident_action', result: 'FAILED', error: data.error })
            return false
          }
        }
      }

      await this.intelligenceAPI.performIncidentAction(mockReq, mockRes)
    } catch (error) {
      console.log('❌ Incident action error:', error.message)
      this.testResults.push({ test: 'incident_action', result: 'FAILED', error: error.message })
      return false
    }
  }

  /**
   * Test drift metrics
   */
  async testDriftMetrics() {
    console.log('Testing drift metrics...')
    
    try {
      const mockReq = {
        headers: { 'x-session-id': 'session_123' },
        query: {}
      }
      
      const mockRes = {
        json: (data) => {
          if (data.success && data.data && typeof data.data.drift === 'number') {
            console.log('✅ Drift metrics successful')
            this.testResults.push({ test: 'drift_metrics', result: 'PASSED' })
            return true
          } else {
            console.log('❌ Drift metrics failed:', data.error)
            this.testResults.push({ test: 'drift_metrics', result: 'FAILED', error: data.error })
            return false
          }
        }
      }

      await this.intelligenceAPI.getDriftMetrics(mockReq, mockRes)
    } catch (error) {
      console.log('❌ Drift metrics error:', error.message)
      this.testResults.push({ test: 'drift_metrics', result: 'FAILED', error: error.message })
      return false
    }
  }

  /**
   * Test incident filtering
   */
  async testIncidentFiltering() {
    console.log('Testing incident filtering...')
    
    try {
      const mockReq = {
        headers: { 'x-session-id': 'session_123' },
        query: { status: 'active', severity: 'high' }
      }
      
      const mockRes = {
        json: (data) => {
          if (data.success && Array.isArray(data.incidents)) {
            console.log('✅ Incident filtering successful')
            this.testResults.push({ test: 'incident_filtering', result: 'PASSED' })
            return true
          } else {
            console.log('❌ Incident filtering failed:', data.error)
            this.testResults.push({ test: 'incident_filtering', result: 'FAILED', error: data.error })
            return false
          }
        }
      }

      await this.intelligenceAPI.getIncidents(mockReq, mockRes)
    } catch (error) {
      console.log('❌ Incident filtering error:', error.message)
      this.testResults.push({ test: 'incident_filtering', result: 'FAILED', error: error.message })
      return false
    }
  }

  /**
   * Test drift detection simulation
   */
  async testDriftDetectionSimulation() {
    console.log('Testing drift detection simulation...')
    
    try {
      // Wait for drift detection to potentially trigger
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const initialIncidentCount = this.intelligenceAPI.incidents.length
      
      // Force a high drift scenario
      const originalThreshold = this.intelligenceAPI.driftDetection.threshold
      this.intelligenceAPI.driftDetection.threshold = 0.01 // Very low threshold
      
      // Wait for detection
      await new Promise(resolve => setTimeout(resolve, 3000))
      
      const finalIncidentCount = this.intelligenceAPI.incidents.length
      
      // Restore original threshold
      this.intelligenceAPI.driftDetection.threshold = originalThreshold
      
      if (finalIncidentCount > initialIncidentCount) {
        console.log('✅ Drift detection simulation successful')
        this.testResults.push({ test: 'drift_detection_simulation', result: 'PASSED' })
        return true
      } else {
        console.log('❌ Drift detection simulation failed - no incidents created')
        this.testResults.push({ test: 'drift_detection_simulation', result: 'FAILED' })
        return false
      }
    } catch (error) {
      console.log('❌ Drift detection simulation error:', error.message)
      this.testResults.push({ test: 'drift_detection_simulation', result: 'FAILED', error: error.message })
      return false
    }
  }

  /**
   * Run all intelligence smoke tests
   */
  async runAllTests() {
    console.log('=== L4 Intelligence Center Smoke Tests - V12.0 ===\n')
    
    await this.testIntelligenceStatus()
    await this.testIncidentsEndpoint()
    await this.testQuarantineToggle()
    await this.testDriftDetectionUpdate()
    await this.testIncidentAction()
    await this.testDriftMetrics()
    await this.testIncidentFiltering()
    await this.testDriftDetectionSimulation()
    
    // Summary
    const totalTests = this.testResults.length
    const passedTests = this.testResults.filter(r => r.result === 'PASSED').length
    const failedTests = this.testResults.filter(r => r.result === 'FAILED').length
    
    console.log('\n=== Intelligence Smoke Test Summary ===')
    console.log(`Total Tests: ${totalTests}`)
    console.log(`Passed: ${passedTests}`)
    console.log(`Failed: ${failedTests}`)
    
    if (failedTests > 0) {
      console.log('\nFailed Tests:')
      this.testResults.filter(r => r.result === 'FAILED').forEach(test => {
        console.log(`- ${test.test}: ${test.error || 'Unknown error'}`)
      })
    }
    
    return {
      total: totalTests,
      passed: passedTests,
      failed: failedTests,
      success: failedTests === 0
    }
  }
}

// Run tests if called directly
if (require.main === module) {
  const intelligenceSmokeTest = new IntelligenceSmokeTest()
  intelligenceSmokeTest.runAllTests().then(results => {
    if (results.success) {
      console.log('\n✅ All intelligence smoke tests passed!')
      process.exit(0)
    } else {
      console.log('\n❌ Some intelligence smoke tests failed!')
      process.exit(1)
    }
  })
}

module.exports = IntelligenceSmokeTest
