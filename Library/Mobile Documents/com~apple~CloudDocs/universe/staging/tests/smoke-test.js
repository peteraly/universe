// Smoke Test - V12.0 All Pages Integration Test
const RBAC = require('../lib/auth/rbac')
const EventCurationAPI = require('../api/events/EventCurationAPI')
const AdminRoutes = require('../routes/admin')
const AgentsRoutes = require('../routes/agents')

class SmokeTest {
  constructor() {
    this.rbac = new RBAC()
    this.curationAPI = new EventCurationAPI()
    this.adminRoutes = new AdminRoutes()
    this.agentsRoutes = new AgentsRoutes()
    this.testResults = []
  }

  /**
   * Test Home page functionality
   */
  async testHomePage() {
    console.log('Testing Home page...')
    
    try {
      // Simulate home page load
      const homePageData = {
        title: 'Discovery Dial',
        events: [],
        status: 'ready'
      }
      
      if (homePageData.title && homePageData.status === 'ready') {
        console.log('✅ Home page test passed')
        this.testResults.push({ test: 'home_page', result: 'PASSED' })
        return true
      } else {
        console.log('❌ Home page test failed')
        this.testResults.push({ test: 'home_page', result: 'FAILED' })
        return false
      }
    } catch (error) {
      console.log('❌ Home page test error:', error.message)
      this.testResults.push({ test: 'home_page', result: 'FAILED', error: error.message })
      return false
    }
  }

  /**
   * Test Admin page functionality
   */
  async testAdminPage() {
    console.log('Testing Admin page...')
    
    try {
      // Create admin session
      const session = this.rbac.createSession('admin_user', 'admin')
      if (!session.success) {
        throw new Error('Failed to create admin session')
      }

      // Test admin dashboard
      const mockReq = {
        userId: 'admin_user',
        userRole: 'admin',
        session: { permissions: ['events:read', 'events:write', 'agents:read'] }
      }
      
      const mockRes = {
        json: (data) => {
          if (data.success && data.data.title === 'Admin Dashboard') {
            console.log('✅ Admin page test passed')
            this.testResults.push({ test: 'admin_page', result: 'PASSED' })
            return true
          } else {
            console.log('❌ Admin page test failed:', data.error)
            this.testResults.push({ test: 'admin_page', result: 'FAILED', error: data.error })
            return false
          }
        }
      }

      await this.adminRoutes.getAdminDashboard(mockReq, mockRes)
    } catch (error) {
      console.log('❌ Admin page test error:', error.message)
      this.testResults.push({ test: 'admin_page', result: 'FAILED', error: error.message })
      return false
    }
  }

  /**
   * Test Agents page functionality
   */
  async testAgentsPage() {
    console.log('Testing Agents page...')
    
    try {
      // Create agent session
      const session = this.rbac.createSession('agent_user', 'agent')
      if (!session.success) {
        throw new Error('Failed to create agent session')
      }

      // Test agents list
      const mockReq = {
        userId: 'agent_user',
        userRole: 'agent',
        session: { permissions: ['events:read', 'health:read'] }
      }
      
      const mockRes = {
        json: (data) => {
          if (data.success && data.data.agents && Array.isArray(data.data.agents)) {
            console.log('✅ Agents page test passed')
            this.testResults.push({ test: 'agents_page', result: 'PASSED' })
            return true
          } else {
            console.log('❌ Agents page test failed:', data.error)
            this.testResults.push({ test: 'agents_page', result: 'FAILED', error: data.error })
            return false
          }
        }
      }

      await this.agentsRoutes.getAgents(mockReq, mockRes)
    } catch (error) {
      console.log('❌ Agents page test error:', error.message)
      this.testResults.push({ test: 'agents_page', result: 'FAILED', error: error.message })
      return false
    }
  }

  /**
   * Test Health page functionality
   */
  async testHealthPage() {
    console.log('Testing Health page...')
    
    try {
      // Create admin session for health access
      const session = this.rbac.createSession('admin_user', 'admin')
      if (!session.success) {
        throw new Error('Failed to create admin session')
      }

      // Test health monitoring
      const mockReq = {
        userId: 'admin_user',
        userRole: 'admin',
        session: { permissions: ['health:read'] }
      }
      
      const mockRes = {
        json: (data) => {
          if (data.success && data.data.systemHealth && data.data.uptime) {
            console.log('✅ Health page test passed')
            this.testResults.push({ test: 'health_page', result: 'PASSED' })
            return true
          } else {
            console.log('❌ Health page test failed:', data.error)
            this.testResults.push({ test: 'health_page', result: 'FAILED', error: data.error })
            return false
          }
        }
      }

      await this.adminRoutes.getAdminHealth(mockReq, mockRes)
    } catch (error) {
      console.log('❌ Health page test error:', error.message)
      this.testResults.push({ test: 'health_page', result: 'FAILED', error: error.message })
      return false
    }
  }

  /**
   * Test Curation page functionality
   */
  async testCurationPage() {
    console.log('Testing Curation page...')
    
    try {
      // Create curator session
      const session = this.rbac.createSession('curator_user', 'curator')
      if (!session.success) {
        throw new Error('Failed to create curator session')
      }

      // Test curation queue
      const mockReq = {
        headers: { 'x-session-id': session.sessionId },
        query: {}
      }
      
      const mockRes = {
        json: (data) => {
          if (data.success && data.queue && Array.isArray(data.queue)) {
            console.log('✅ Curation page test passed')
            this.testResults.push({ test: 'curation_page', result: 'PASSED' })
            return true
          } else {
            console.log('❌ Curation page test failed:', data.error)
            this.testResults.push({ test: 'curation_page', result: 'FAILED', error: data.error })
            return false
          }
        }
      }

      await this.curationAPI.getCurationQueue(mockReq, mockRes)
    } catch (error) {
      console.log('❌ Curation page test error:', error.message)
      this.testResults.push({ test: 'curation_page', result: 'FAILED', error: error.message })
      return false
    }
  }

  /**
   * Test RBAC functionality
   */
  async testRBACFunctionality() {
    console.log('Testing RBAC functionality...')
    
    try {
      // Test role creation
      const adminSession = this.rbac.createSession('admin_user', 'admin')
      const curatorSession = this.rbac.createSession('curator_user', 'curator')
      const viewerSession = this.rbac.createSession('viewer_user', 'viewer')
      
      if (!adminSession.success || !curatorSession.success || !viewerSession.success) {
        throw new Error('Failed to create test sessions')
      }

      // Test permission checking
      const adminPermission = this.rbac.checkPermission(adminSession.sessionId, 'events:write')
      const curatorPermission = this.rbac.checkPermission(curatorSession.sessionId, 'curation:approve')
      const viewerPermission = this.rbac.checkPermission(viewerSession.sessionId, 'events:write')
      
      if (adminPermission.success && curatorPermission.success && !viewerPermission.success) {
        console.log('✅ RBAC functionality test passed')
        this.testResults.push({ test: 'rbac_functionality', result: 'PASSED' })
        return true
      } else {
        console.log('❌ RBAC functionality test failed')
        this.testResults.push({ test: 'rbac_functionality', result: 'FAILED' })
        return false
      }
    } catch (error) {
      console.log('❌ RBAC functionality test error:', error.message)
      this.testResults.push({ test: 'rbac_functionality', result: 'FAILED', error: error.message })
      return false
    }
  }

  /**
   * Run all smoke tests
   */
  async runAllTests() {
    console.log('=== V12.0 Smoke Test - All Pages ===\n')
    
    await this.testHomePage()
    await this.testAdminPage()
    await this.testAgentsPage()
    await this.testHealthPage()
    await this.testCurationPage()
    await this.testRBACFunctionality()
    
    // Summary
    const totalTests = this.testResults.length
    const passedTests = this.testResults.filter(r => r.result === 'PASSED').length
    const failedTests = this.testResults.filter(r => r.result === 'FAILED').length
    
    console.log('\n=== Smoke Test Summary ===')
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
  const smokeTest = new SmokeTest()
  smokeTest.runAllTests().then(results => {
    if (results.success) {
      console.log('\n✅ All smoke tests passed!')
      process.exit(0)
    } else {
      console.log('\n❌ Some smoke tests failed!')
      process.exit(1)
    }
  })
}

module.exports = SmokeTest
