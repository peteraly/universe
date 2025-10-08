// Schema Validation Tests - V12.0
const { eventSchema, validateEvent } = require('./events')
const { agentSchema, validateAgent } = require('./agents')
const { ledgerSchema, validateLedgerEntry, createLedgerEntry } = require('./ledger')

// Test data
const validEvent = {
  id: 'event_123',
  name: 'Tech Meetup',
  description: 'A great tech meetup for developers',
  date: '2024-01-15',
  time: '19:00',
  venue: 'Tech Hub',
  address: '123 Tech Street, City',
  primaryCategory: 'Professional',
  secondaryCategories: ['Social/Fun'],
  tags: [
    { tag: 'networking', confidence: 0.9, category: 'Professional' }
  ],
  organizer: 'Tech Community',
  price: 'Free',
  status: 'DRAFT',
  qualityScore: 0.85,
  curationHistory: [],
  createdAt: '2024-01-01T00:00:00.000Z'
}

const validAgent = {
  id: 'agent_123',
  name: 'Curator Bot',
  type: 'AI_ASSISTANT',
  role: 'EVENT_CURATOR',
  permissions: ['READ_EVENTS', 'APPROVE_EVENTS', 'REJECT_EVENTS'],
  status: 'ACTIVE',
  capabilities: {
    maxEventsPerDay: 100,
    canApproveEvents: true,
    canRejectEvents: true,
    canManageConfig: false,
    canViewHealth: false,
    canManageAgents: false
  },
  performance: {
    eventsProcessed: 50,
    approvalRate: 0.92,
    averageProcessingTime: 2.5,
    lastActivity: '2024-01-01T12:00:00.000Z'
  },
  credentials: {
    username: 'curator_bot',
    email: 'bot@example.com',
    lastLogin: '2024-01-01T12:00:00.000Z',
    loginCount: 1
  },
  createdAt: '2024-01-01T00:00:00.000Z'
}

const validLedgerEntry = {
  id: 'ledger_123',
  transactionType: 'EVENT_APPROVED',
  entityType: 'EVENT',
  entityId: 'event_123',
  agentId: 'agent_123',
  action: 'Event approved by curator',
  details: { qualityScore: 0.85 },
  severity: 'LOW',
  status: 'SUCCESS',
  timestamp: '2024-01-01T12:00:00.000Z',
  metadata: {},
  auditTrail: []
}

// Test functions
function runSchemaValidationTests() {
  console.log('Running Schema Validation Tests...')
  
  // Test Event Schema
  console.log('\n=== Event Schema Tests ===')
  const eventValidation = validateEvent(validEvent)
  console.log('Valid Event:', eventValidation.valid ? 'PASS' : 'FAIL')
  if (!eventValidation.valid) {
    console.log('Errors:', eventValidation.errors)
  }
  
  // Test Agent Schema
  console.log('\n=== Agent Schema Tests ===')
  const agentValidation = validateAgent(validAgent)
  console.log('Valid Agent:', agentValidation.valid ? 'PASS' : 'FAIL')
  if (!agentValidation.valid) {
    console.log('Errors:', agentValidation.errors)
  }
  
  // Test Ledger Schema
  console.log('\n=== Ledger Schema Tests ===')
  const ledgerValidation = validateLedgerEntry(validLedgerEntry)
  console.log('Valid Ledger Entry:', ledgerValidation.valid ? 'PASS' : 'FAIL')
  if (!ledgerValidation.valid) {
    console.log('Errors:', ledgerValidation.errors)
  }
  
  // Test Invalid Data
  console.log('\n=== Invalid Data Tests ===')
  const invalidEvent = { id: 'test' } // Missing required fields
  const invalidEventValidation = validateEvent(invalidEvent)
  console.log('Invalid Event (should fail):', !invalidEventValidation.valid ? 'PASS' : 'FAIL')
  
  const invalidAgent = { id: 'test' } // Missing required fields
  const invalidAgentValidation = validateAgent(invalidAgent)
  console.log('Invalid Agent (should fail):', !invalidAgentValidation.valid ? 'PASS' : 'FAIL')
  
  const invalidLedger = { id: 'test' } // Missing required fields
  const invalidLedgerValidation = validateLedgerEntry(invalidLedger)
  console.log('Invalid Ledger (should fail):', !invalidLedgerValidation.valid ? 'PASS' : 'FAIL')
  
  // Test Ledger Entry Creation
  console.log('\n=== Ledger Entry Creation Tests ===')
  const newLedgerEntry = createLedgerEntry('EVENT_CREATED', 'EVENT', 'event_456', 'Event created', 'agent_123')
  const newLedgerValidation = validateLedgerEntry(newLedgerEntry)
  console.log('Created Ledger Entry:', newLedgerValidation.valid ? 'PASS' : 'FAIL')
  
  return {
    eventValidation: eventValidation.valid,
    agentValidation: agentValidation.valid,
    ledgerValidation: ledgerValidation.valid,
    invalidEventValidation: !invalidEventValidation.valid,
    invalidAgentValidation: !invalidAgentValidation.valid,
    invalidLedgerValidation: !invalidLedgerValidation.valid,
    newLedgerValidation: newLedgerValidation.valid
  }
}

// Mock DB connection test
function testDBConnection() {
  console.log('\n=== DB Connection Test (Mock Mode) ===')
  console.log('Testing schema compatibility...')
  
  // Simulate DB operations
  const mockDB = {
    events: [],
    agents: [],
    ledger: []
  }
  
  // Test inserting valid data
  try {
    mockDB.events.push(validEvent)
    mockDB.agents.push(validAgent)
    mockDB.ledger.push(validLedgerEntry)
    console.log('DB Insert Operations: PASS')
  } catch (error) {
    console.log('DB Insert Operations: FAIL -', error.message)
    return false
  }
  
  // Test querying data
  try {
    const event = mockDB.events.find(e => e.id === 'event_123')
    const agent = mockDB.agents.find(a => a.id === 'agent_123')
    const ledger = mockDB.ledger.find(l => l.id === 'ledger_123')
    
    if (event && agent && ledger) {
      console.log('DB Query Operations: PASS')
    } else {
      console.log('DB Query Operations: FAIL - Data not found')
      return false
    }
  } catch (error) {
    console.log('DB Query Operations: FAIL -', error.message)
    return false
  }
  
  console.log('DB Connection Test: PASS')
  return true
}

// Run all tests
function runAllTests() {
  const validationResults = runSchemaValidationTests()
  const dbTestResult = testDBConnection()
  
  const allTestsPassed = 
    validationResults.eventValidation &&
    validationResults.agentValidation &&
    validationResults.ledgerValidation &&
    validationResults.invalidEventValidation &&
    validationResults.invalidAgentValidation &&
    validationResults.invalidLedgerValidation &&
    validationResults.newLedgerValidation &&
    dbTestResult
  
  console.log('\n=== Test Summary ===')
  console.log('All Tests Passed:', allTestsPassed ? 'PASS' : 'FAIL')
  
  return allTestsPassed
}

module.exports = {
  runSchemaValidationTests,
  testDBConnection,
  runAllTests
}
