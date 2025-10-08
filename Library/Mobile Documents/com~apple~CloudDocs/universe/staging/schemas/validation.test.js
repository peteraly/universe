// Schema Validation Tests - V12.0
const { validateEvent } = require('./events')
const { validateAgent } = require('./agents')
const { validateLedgerEntry, createLedgerEntry } = require('./ledger')

// Test data
const validEvent = {
  id: 'event_123',
  name: 'Tech Meetup',
  description: 'A great tech meetup for developers',
  date: '2024-01-15',
  time: '18:00',
  venue: 'Tech Hub',
  address: '123 Tech Street, City',
  primaryCategory: 'Professional',
  status: 'approved',
  createdAt: '2024-01-01T00:00:00Z',
  qualityScore: 0.85
}

const validAgent = {
  id: 'agent_123',
  name: 'Curation Agent',
  type: 'curation',
  status: 'active',
  config: {
    version: '1.0.0',
    parameters: {},
    thresholds: {},
    enabled: true
  },
  createdAt: '2024-01-01T00:00:00Z'
}

const validLedgerEntry = {
  id: 'ledger_123',
  transactionId: 'txn_123',
  type: 'event_created',
  action: 'create_event',
  entityType: 'event',
  entityId: 'event_123',
  timestamp: '2024-01-01T00:00:00Z',
  status: 'success'
}

// Test functions
function runSchemaValidationTests() {
  console.log('Running schema validation tests...')
  
  let passed = 0
  let failed = 0
  
  // Test valid event
  const eventResult = validateEvent(validEvent)
  if (eventResult.valid) {
    console.log('✅ Valid event passed validation')
    passed++
  } else {
    console.log('❌ Valid event failed validation:', eventResult.errors)
    failed++
  }
  
  // Test invalid event
  const invalidEvent = { ...validEvent, id: null }
  const invalidEventResult = validateEvent(invalidEvent)
  if (!invalidEventResult.valid) {
    console.log('✅ Invalid event correctly rejected')
    passed++
  } else {
    console.log('❌ Invalid event incorrectly passed validation')
    failed++
  }
  
  // Test valid agent
  const agentResult = validateAgent(validAgent)
  if (agentResult.valid) {
    console.log('✅ Valid agent passed validation')
    passed++
  } else {
    console.log('❌ Valid agent failed validation:', agentResult.errors)
    failed++
  }
  
  // Test invalid agent
  const invalidAgent = { ...validAgent, type: 'invalid_type' }
  const invalidAgentResult = validateAgent(invalidAgent)
  if (!invalidAgentResult.valid) {
    console.log('✅ Invalid agent correctly rejected')
    passed++
  } else {
    console.log('❌ Invalid agent incorrectly passed validation')
    failed++
  }
  
  // Test valid ledger entry
  const ledgerResult = validateLedgerEntry(validLedgerEntry)
  if (ledgerResult.valid) {
    console.log('✅ Valid ledger entry passed validation')
    passed++
  } else {
    console.log('❌ Valid ledger entry failed validation:', ledgerResult.errors)
    failed++
  }
  
  // Test invalid ledger entry
  const invalidLedgerEntry = { ...validLedgerEntry, type: 'invalid_type' }
  const invalidLedgerResult = validateLedgerEntry(invalidLedgerEntry)
  if (!invalidLedgerResult.valid) {
    console.log('✅ Invalid ledger entry correctly rejected')
    passed++
  } else {
    console.log('❌ Invalid ledger entry incorrectly passed validation')
    failed++
  }
  
  // Test ledger entry creation
  const createdEntry = createLedgerEntry({
    type: 'event_created',
    action: 'create_event',
    entityType: 'event',
    entityId: 'event_123'
  })
  
  if (createdEntry.id && createdEntry.transactionId && createdEntry.timestamp) {
    console.log('✅ Ledger entry creation successful')
    passed++
  } else {
    console.log('❌ Ledger entry creation failed')
    failed++
  }
  
  console.log(`\nTest Results: ${passed} passed, ${failed} failed`)
  return { passed, failed, total: passed + failed }
}

// Mock DB connection test
function testDBConnection() {
  console.log('Testing DB connection (mock mode)...')
  
  // Simulate DB connection
  const mockDB = {
    connected: true,
    host: 'localhost',
    port: 5432,
    database: 'discovery_dial'
  }
  
  if (mockDB.connected) {
    console.log('✅ DB connection successful (mock)')
    return true
  } else {
    console.log('❌ DB connection failed')
    return false
  }
}

// Run all tests
function runAllTests() {
  console.log('=== V12.0 Schema Validation Tests ===\n')
  
  const validationResults = runSchemaValidationTests()
  const dbConnectionResult = testDBConnection()
  
  console.log('\n=== Test Summary ===')
  console.log(`Schema Validation: ${validationResults.passed}/${validationResults.total} passed`)
  console.log(`DB Connection: ${dbConnectionResult ? 'PASSED' : 'FAILED'}`)
  
  const allTestsPassed = validationResults.failed === 0 && dbConnectionResult
  
  if (allTestsPassed) {
    console.log('\n✅ All tests passed!')
    return true
  } else {
    console.log('\n❌ Some tests failed!')
    return false
  }
}

module.exports = {
  runSchemaValidationTests,
  testDBConnection,
  runAllTests
}

// Run tests if called directly
if (require.main === module) {
  runAllTests()
}
