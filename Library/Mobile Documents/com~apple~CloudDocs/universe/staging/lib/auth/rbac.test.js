// RBAC Unit Tests - V12.0 Role-Based Access Control Tests
const RBAC = require('./rbac')

class RBACTests {
  constructor() {
    this.rbac = new RBAC()
    this.testResults = []
  }

  /**
   * Test super_admin role permissions
   */
  testSuperAdmin() {
    console.log('Testing super_admin role...')
    
    const session = this.rbac.createSession('user1', 'super_admin')
    if (!session.success) {
      this.testResults.push({ test: 'super_admin_creation', result: 'FAILED', error: session.error })
      return
    }

    // Test all permissions
    const permissions = [
      'events:read', 'events:write', 'events:delete',
      'agents:read', 'agents:write',
      'curation:approve', 'curation:reject',
      'health:read', 'config:read', 'config:write'
    ]

    let passed = 0
    let failed = 0

    permissions.forEach(permission => {
      const check = this.rbac.checkPermission(session.sessionId, permission)
      if (check.success) {
        passed++
      } else {
        failed++
        this.testResults.push({ 
          test: `super_admin_${permission}`, 
          result: 'FAILED', 
          error: check.error 
        })
      }
    })

    this.testResults.push({ 
      test: 'super_admin_permissions', 
      result: failed === 0 ? 'PASSED' : 'FAILED',
      passed,
      failed
    })
  }

  /**
   * Test admin role permissions
   */
  testAdmin() {
    console.log('Testing admin role...')
    
    const session = this.rbac.createSession('user2', 'admin')
    if (!session.success) {
      this.testResults.push({ test: 'admin_creation', result: 'FAILED', error: session.error })
      return
    }

    // Test allowed permissions
    const allowedPermissions = [
      'events:read', 'events:write', 'events:delete',
      'agents:read', 'agents:write',
      'curation:approve', 'curation:reject',
      'health:read', 'config:read'
    ]

    let passed = 0
    let failed = 0

    allowedPermissions.forEach(permission => {
      const check = this.rbac.checkPermission(session.sessionId, permission)
      if (check.success) {
        passed++
      } else {
        failed++
        this.testResults.push({ 
          test: `admin_${permission}`, 
          result: 'FAILED', 
          error: check.error 
        })
      }
    })

    // Test denied permissions
    const deniedPermissions = ['config:write']
    deniedPermissions.forEach(permission => {
      const check = this.rbac.checkPermission(session.sessionId, permission)
      if (!check.success) {
        passed++
      } else {
        failed++
        this.testResults.push({ 
          test: `admin_denied_${permission}`, 
          result: 'FAILED', 
          error: 'Permission should be denied' 
        })
      }
    })

    this.testResults.push({ 
      test: 'admin_permissions', 
      result: failed === 0 ? 'PASSED' : 'FAILED',
      passed,
      failed
    })
  }

  /**
   * Test curator role permissions
   */
  testCurator() {
    console.log('Testing curator role...')
    
    const session = this.rbac.createSession('user3', 'curator')
    if (!session.success) {
      this.testResults.push({ test: 'curator_creation', result: 'FAILED', error: session.error })
      return
    }

    // Test allowed permissions
    const allowedPermissions = [
      'events:read', 'events:write',
      'curation:approve', 'curation:reject',
      'health:read'
    ]

    let passed = 0
    let failed = 0

    allowedPermissions.forEach(permission => {
      const check = this.rbac.checkPermission(session.sessionId, permission)
      if (check.success) {
        passed++
      } else {
        failed++
        this.testResults.push({ 
          test: `curator_${permission}`, 
          result: 'FAILED', 
          error: check.error 
        })
      }
    })

    // Test denied permissions
    const deniedPermissions = ['events:delete', 'agents:write', 'config:read']
    deniedPermissions.forEach(permission => {
      const check = this.rbac.checkPermission(session.sessionId, permission)
      if (!check.success) {
        passed++
      } else {
        failed++
        this.testResults.push({ 
          test: `curator_denied_${permission}`, 
          result: 'FAILED', 
          error: 'Permission should be denied' 
        })
      }
    })

    this.testResults.push({ 
      test: 'curator_permissions', 
      result: failed === 0 ? 'PASSED' : 'FAILED',
      passed,
      failed
    })
  }

  /**
   * Test agent role permissions
   */
  testAgent() {
    console.log('Testing agent role...')
    
    const session = this.rbac.createSession('user4', 'agent')
    if (!session.success) {
      this.testResults.push({ test: 'agent_creation', result: 'FAILED', error: session.error })
      return
    }

    // Test allowed permissions
    const allowedPermissions = [
      'events:read', 'events:write',
      'health:read'
    ]

    let passed = 0
    let failed = 0

    allowedPermissions.forEach(permission => {
      const check = this.rbac.checkPermission(session.sessionId, permission)
      if (check.success) {
        passed++
      } else {
        failed++
        this.testResults.push({ 
          test: `agent_${permission}`, 
          result: 'FAILED', 
          error: check.error 
        })
      }
    })

    // Test denied permissions
    const deniedPermissions = ['events:delete', 'curation:approve', 'agents:write']
    deniedPermissions.forEach(permission => {
      const check = this.rbac.checkPermission(session.sessionId, permission)
      if (!check.success) {
        passed++
      } else {
        failed++
        this.testResults.push({ 
          test: `agent_denied_${permission}`, 
          result: 'FAILED', 
          error: 'Permission should be denied' 
        })
      }
    })

    this.testResults.push({ 
      test: 'agent_permissions', 
      result: failed === 0 ? 'PASSED' : 'FAILED',
      passed,
      failed
    })
  }

  /**
   * Test viewer role permissions
   */
  testViewer() {
    console.log('Testing viewer role...')
    
    const session = this.rbac.createSession('user5', 'viewer')
    if (!session.success) {
      this.testResults.push({ test: 'viewer_creation', result: 'FAILED', error: session.error })
      return
    }

    // Test allowed permissions
    const allowedPermissions = [
      'events:read',
      'health:read'
    ]

    let passed = 0
    let failed = 0

    allowedPermissions.forEach(permission => {
      const check = this.rbac.checkPermission(session.sessionId, permission)
      if (check.success) {
        passed++
      } else {
        failed++
        this.testResults.push({ 
          test: `viewer_${permission}`, 
          result: 'FAILED', 
          error: check.error 
        })
      }
    })

    // Test denied permissions
    const deniedPermissions = ['events:write', 'events:delete', 'curation:approve', 'agents:write']
    deniedPermissions.forEach(permission => {
      const check = this.rbac.checkPermission(session.sessionId, permission)
      if (!check.success) {
        passed++
      } else {
        failed++
        this.testResults.push({ 
          test: `viewer_denied_${permission}`, 
          result: 'FAILED', 
          error: 'Permission should be denied' 
        })
      }
    })

    this.testResults.push({ 
      test: 'viewer_permissions', 
      result: failed === 0 ? 'PASSED' : 'FAILED',
      passed,
      failed
    })
  }

  /**
   * Test session management
   */
  testSessionManagement() {
    console.log('Testing session management...')
    
    // Test session creation
    const session = this.rbac.createSession('user6', 'admin')
    if (!session.success) {
      this.testResults.push({ test: 'session_creation', result: 'FAILED', error: session.error })
      return
    }

    // Test session validation
    const check = this.rbac.checkPermission(session.sessionId, 'events:read')
    if (!check.success) {
      this.testResults.push({ test: 'session_validation', result: 'FAILED', error: check.error })
      return
    }

    // Test session revocation
    const revoke = this.rbac.revokeSession(session.sessionId)
    if (!revoke.success) {
      this.testResults.push({ test: 'session_revocation', result: 'FAILED', error: revoke.error })
      return
    }

    // Test revoked session
    const revokedCheck = this.rbac.checkPermission(session.sessionId, 'events:read')
    if (revokedCheck.success) {
      this.testResults.push({ test: 'revoked_session_check', result: 'FAILED', error: 'Revoked session should fail' })
      return
    }

    this.testResults.push({ test: 'session_management', result: 'PASSED' })
  }

  /**
   * Run all tests
   */
  runAllTests() {
    console.log('=== RBAC Unit Tests - V12.0 ===\n')
    
    this.testSuperAdmin()
    this.testAdmin()
    this.testCurator()
    this.testAgent()
    this.testViewer()
    this.testSessionManagement()
    
    // Summary
    const totalTests = this.testResults.length
    const passedTests = this.testResults.filter(r => r.result === 'PASSED').length
    const failedTests = this.testResults.filter(r => r.result === 'FAILED').length
    
    console.log('\n=== Test Summary ===')
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
  const tests = new RBACTests()
  const results = tests.runAllTests()
  
  if (results.success) {
    console.log('\n✅ All RBAC tests passed!')
    process.exit(0)
  } else {
    console.log('\n❌ Some RBAC tests failed!')
    process.exit(1)
  }
}

module.exports = RBACTests
