// Ledger Write/Read Round-trip Test - V12.0 L3 Governance Ledger
const ConfigAPI = require('../api/config/ConfigAPI')
const GovernanceAPI = require('../api/governance/GovernanceAPI')

class LedgerRoundtripTest {
  constructor() {
    this.configAPI = new ConfigAPI()
    this.governanceAPI = new GovernanceAPI()
    this.testResults = []
  }

  /**
   * Test configuration write with ledger logging
   */
  async testConfigWriteWithLedger() {
    console.log('Testing configuration write with ledger logging...')
    
    try {
      const mockReq = {
        body: {
          key: 'system.debug',
          value: false,
          type: 'boolean'
        },
        userId: 'test_user',
        ip: '127.0.0.1',
        headers: { 'user-agent': 'test-agent' }
      }
      
      const mockRes = {
        json: (data) => {
          if (data.success && data.key === 'system.debug') {
            console.log('✅ Configuration write successful')
            this.testResults.push({ test: 'config_write', result: 'PASSED' })
            return true
          } else {
            console.log('❌ Configuration write failed:', data.error)
            this.testResults.push({ test: 'config_write', result: 'FAILED', error: data.error })
            return false
          }
        }
      }

      await this.configAPI.updateConfig(mockReq, mockRes)
    } catch (error) {
      console.log('❌ Configuration write error:', error.message)
      this.testResults.push({ test: 'config_write', result: 'FAILED', error: error.message })
      return false
    }
  }

  /**
   * Test ledger entry creation
   */
  async testLedgerEntryCreation() {
    console.log('Testing ledger entry creation...')
    
    try {
      const mockReq = {
        body: {
          action: 'config_update',
          key: 'system.debug',
          oldValue: true,
          newValue: false,
          metadata: { test: true }
        },
        userId: 'test_user',
        ip: '127.0.0.1',
        headers: { 'user-agent': 'test-agent' }
      }
      
      const mockRes = {
        json: (data) => {
          if (data.success && data.entry && data.entry.id) {
            console.log('✅ Ledger entry creation successful')
            this.testResults.push({ test: 'ledger_entry_creation', result: 'PASSED' })
            return true
          } else {
            console.log('❌ Ledger entry creation failed:', data.error)
            this.testResults.push({ test: 'ledger_entry_creation', result: 'FAILED', error: data.error })
            return false
          }
        }
      }

      await this.governanceAPI.addLedgerEntry(mockReq, mockRes)
    } catch (error) {
      console.log('❌ Ledger entry creation error:', error.message)
      this.testResults.push({ test: 'ledger_entry_creation', result: 'FAILED', error: error.message })
      return false
    }
  }

  /**
   * Test ledger read
   */
  async testLedgerRead() {
    console.log('Testing ledger read...')
    
    try {
      const mockReq = {
        query: { limit: 10, offset: 0 }
      }
      
      const mockRes = {
        json: (data) => {
          if (data.success && Array.isArray(data.entries)) {
            console.log('✅ Ledger read successful')
            this.testResults.push({ test: 'ledger_read', result: 'PASSED' })
            return true
          } else {
            console.log('❌ Ledger read failed:', data.error)
            this.testResults.push({ test: 'ledger_read', result: 'FAILED', error: data.error })
            return false
          }
        }
      }

      await this.governanceAPI.getLedger(mockReq, mockRes)
    } catch (error) {
      console.log('❌ Ledger read error:', error.message)
      this.testResults.push({ test: 'ledger_read', result: 'FAILED', error: error.message })
      return false
    }
  }

  /**
   * Test ledger filtering
   */
  async testLedgerFiltering() {
    console.log('Testing ledger filtering...')
    
    try {
      const mockReq = {
        query: { 
          action: 'config_update',
          userId: 'test_user',
          limit: 5
        }
      }
      
      const mockRes = {
        json: (data) => {
          if (data.success && data.entries && data.filters) {
            console.log('✅ Ledger filtering successful')
            this.testResults.push({ test: 'ledger_filtering', result: 'PASSED' })
            return true
          } else {
            console.log('❌ Ledger filtering failed:', data.error)
            this.testResults.push({ test: 'ledger_filtering', result: 'FAILED', error: data.error })
            return false
          }
        }
      }

      await this.governanceAPI.getLedger(mockReq, mockRes)
    } catch (error) {
      console.log('❌ Ledger filtering error:', error.message)
      this.testResults.push({ test: 'ledger_filtering', result: 'FAILED', error: error.message })
      return false
    }
  }

  /**
   * Test ledger statistics
   */
  async testLedgerStatistics() {
    console.log('Testing ledger statistics...')
    
    try {
      const mockReq = {
        query: {}
      }
      
      const mockRes = {
        json: (data) => {
          if (data.success && data.stats && typeof data.stats.totalEntries === 'number') {
            console.log('✅ Ledger statistics successful')
            this.testResults.push({ test: 'ledger_statistics', result: 'PASSED' })
            return true
          } else {
            console.log('❌ Ledger statistics failed:', data.error)
            this.testResults.push({ test: 'ledger_statistics', result: 'FAILED', error: data.error })
            return false
          }
        }
      }

      await this.governanceAPI.getLedgerStats(mockReq, mockRes)
    } catch (error) {
      console.log('❌ Ledger statistics error:', error.message)
      this.testResults.push({ test: 'ledger_statistics', result: 'FAILED', error: error.message })
      return false
    }
  }

  /**
   * Test ledger export
   */
  async testLedgerExport() {
    console.log('Testing ledger export...')
    
    try {
      const mockReq = {
        query: { format: 'json' }
      }
      
      const mockRes = {
        json: (data) => {
          if (data.success && data.entries && data.format === 'json') {
            console.log('✅ Ledger export successful')
            this.testResults.push({ test: 'ledger_export', result: 'PASSED' })
            return true
          } else {
            console.log('❌ Ledger export failed:', data.error)
            this.testResults.push({ test: 'ledger_export', result: 'FAILED', error: data.error })
            return false
          }
        }
      }

      await this.governanceAPI.exportLedger(mockReq, mockRes)
    } catch (error) {
      console.log('❌ Ledger export error:', error.message)
      this.testResults.push({ test: 'ledger_export', result: 'FAILED', error: error.message })
      return false
    }
  }

  /**
   * Test complete round-trip: write -> read -> verify
   */
  async testCompleteRoundtrip() {
    console.log('Testing complete round-trip: write -> read -> verify...')
    
    try {
      // Step 1: Write configuration
      const writeReq = {
        body: {
          key: 'system.logLevel',
          value: 'debug',
          type: 'string'
        },
        userId: 'roundtrip_user',
        ip: '127.0.0.1',
        headers: { 'user-agent': 'roundtrip-test' }
      }
      
      let writeSuccess = false
      const writeRes = {
        json: (data) => {
          writeSuccess = data.success && data.key === 'system.logLevel'
        }
      }

      await this.configAPI.updateConfig(writeReq, writeRes)
      
      if (!writeSuccess) {
        throw new Error('Configuration write failed')
      }

      // Step 2: Read ledger entries
      const readReq = {
        query: { 
          action: 'config_update',
          userId: 'roundtrip_user',
          limit: 1
        }
      }
      
      let readSuccess = false
      let ledgerEntry = null
      const readRes = {
        json: (data) => {
          readSuccess = data.success && data.entries && data.entries.length > 0
          if (readSuccess) {
            ledgerEntry = data.entries[0]
          }
        }
      }

      await this.governanceAPI.getLedger(readReq, readRes)
      
      if (!readSuccess || !ledgerEntry) {
        throw new Error('Ledger read failed')
      }

      // Step 3: Verify entry details
      const verificationSuccess = 
        ledgerEntry.action === 'config_update' &&
        ledgerEntry.key === 'system.logLevel' &&
        ledgerEntry.newValue === 'debug' &&
        ledgerEntry.userId === 'roundtrip_user'

      if (verificationSuccess) {
        console.log('✅ Complete round-trip successful')
        this.testResults.push({ test: 'complete_roundtrip', result: 'PASSED' })
        return true
      } else {
        console.log('❌ Complete round-trip verification failed')
        this.testResults.push({ test: 'complete_roundtrip', result: 'FAILED' })
        return false
      }
    } catch (error) {
      console.log('❌ Complete round-trip error:', error.message)
      this.testResults.push({ test: 'complete_roundtrip', result: 'FAILED', error: error.message })
      return false
    }
  }

  /**
   * Test ledger entry retrieval by ID
   */
  async testLedgerEntryById() {
    console.log('Testing ledger entry retrieval by ID...')
    
    try {
      // First, add an entry to get an ID
      const addReq = {
        body: {
          action: 'test_action',
          key: 'test_key',
          oldValue: 'old',
          newValue: 'new'
        },
        userId: 'test_user'
      }
      
      let entryId = null
      const addRes = {
        json: (data) => {
          if (data.success && data.entry) {
            entryId = data.entry.id
          }
        }
      }

      await this.governanceAPI.addLedgerEntry(addReq, addRes)
      
      if (!entryId) {
        throw new Error('Failed to create ledger entry for ID test')
      }

      // Now retrieve by ID
      const getReq = {
        params: { id: entryId }
      }
      
      const getRes = {
        json: (data) => {
          if (data.success && data.entry && data.entry.id === entryId) {
            console.log('✅ Ledger entry by ID successful')
            this.testResults.push({ test: 'ledger_entry_by_id', result: 'PASSED' })
            return true
          } else {
            console.log('❌ Ledger entry by ID failed:', data.error)
            this.testResults.push({ test: 'ledger_entry_by_id', result: 'FAILED', error: data.error })
            return false
          }
        }
      }

      await this.governanceAPI.getLedgerEntry(getReq, getRes)
    } catch (error) {
      console.log('❌ Ledger entry by ID error:', error.message)
      this.testResults.push({ test: 'ledger_entry_by_id', result: 'FAILED', error: error.message })
      return false
    }
  }

  /**
   * Run all ledger round-trip tests
   */
  async runAllTests() {
    console.log('=== L3 Config & Governance Ledger Round-trip Tests - V12.0 ===\n')
    
    await this.testConfigWriteWithLedger()
    await this.testLedgerEntryCreation()
    await this.testLedgerRead()
    await this.testLedgerFiltering()
    await this.testLedgerStatistics()
    await this.testLedgerExport()
    await this.testCompleteRoundtrip()
    await this.testLedgerEntryById()
    
    // Summary
    const totalTests = this.testResults.length
    const passedTests = this.testResults.filter(r => r.result === 'PASSED').length
    const failedTests = this.testResults.filter(r => r.result === 'FAILED').length
    
    console.log('\n=== Ledger Round-trip Test Summary ===')
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
  const ledgerTest = new LedgerRoundtripTest()
  ledgerTest.runAllTests().then(results => {
    if (results.success) {
      console.log('\n✅ All ledger round-trip tests passed!')
      process.exit(0)
    } else {
      console.log('\n❌ Some ledger round-trip tests failed!')
      process.exit(1)
    }
  })
}

module.exports = LedgerRoundtripTest
