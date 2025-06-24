const { spawn } = require('child_process');
const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');

class ErrorMonitor {
  constructor() {
    this.errors = [];
    this.serverProcess = null;
    this.clientProcess = null;
    this.isMonitoring = false;
  }

  log(message, type = 'INFO') {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [${type}] ${message}`);
  }

  startMonitoring() {
    this.isMonitoring = true;
    this.log('🚀 Starting real-time error monitoring...');
    
    // Monitor server logs
    this.monitorServer();
    
    // Monitor client logs
    this.monitorClient();
    
    // Monitor API endpoints
    this.monitorAPI();
    
    // Monitor file system
    this.monitorFileSystem();
    
    this.log('✅ Error monitoring active - watching for issues...');
  }

  monitorServer() {
    this.log('📡 Monitoring server logs...');
    
    // Check server health every 10 seconds
    setInterval(async () => {
      try {
        const response = await axios.get('http://localhost:3001/api/workflows', { timeout: 5000 });
        if (response.status !== 200) {
          this.log(`❌ Server API error: ${response.status}`, 'ERROR');
          this.errors.push({ type: 'API', message: `Status ${response.status}`, timestamp: new Date() });
        }
      } catch (error) {
        this.log(`❌ Server connection failed: ${error.message}`, 'ERROR');
        this.errors.push({ type: 'CONNECTION', message: error.message, timestamp: new Date() });
      }
    }, 10000);
  }

  monitorClient() {
    this.log('🖥️  Monitoring client logs...');
    
    // Check if client is accessible
    setInterval(async () => {
      try {
        const response = await axios.get('http://localhost:3000', { timeout: 5000 });
        if (response.status !== 200) {
          this.log(`❌ Client error: ${response.status}`, 'ERROR');
          this.errors.push({ type: 'CLIENT', message: `Status ${response.status}`, timestamp: new Date() });
        }
      } catch (error) {
        this.log(`❌ Client connection failed: ${error.message}`, 'ERROR');
        this.errors.push({ type: 'CLIENT_CONNECTION', message: error.message, timestamp: new Date() });
      }
    }, 15000);
  }

  monitorAPI() {
    this.log('🔌 Monitoring API endpoints...');
    
    const endpoints = [
      '/api/workflows',
      '/api/workflows/sample-workflow',
      '/webhook/sample-workflow'
    ];
    
    setInterval(async () => {
      for (const endpoint of endpoints) {
        try {
          const response = await axios.get(`http://localhost:3001${endpoint}`, { timeout: 5000 });
          if (response.status >= 400) {
            this.log(`❌ API endpoint error ${endpoint}: ${response.status}`, 'ERROR');
            this.errors.push({ 
              type: 'API_ENDPOINT', 
              message: `${endpoint} returned ${response.status}`, 
              timestamp: new Date() 
            });
          }
        } catch (error) {
          if (error.response && error.response.status === 404) {
            // 404 is expected for some endpoints
            continue;
          }
          this.log(`❌ API endpoint failed ${endpoint}: ${error.message}`, 'ERROR');
          this.errors.push({ 
            type: 'API_ENDPOINT', 
            message: `${endpoint}: ${error.message}`, 
            timestamp: new Date() 
          });
        }
      }
    }, 20000);
  }

  monitorFileSystem() {
    this.log('📁 Monitoring file system...');
    
    setInterval(async () => {
      try {
        const workflowsDir = path.join(__dirname, 'workflows');
        const files = await fs.readdir(workflowsDir);
        
        for (const file of files) {
          if (file.endsWith('.json')) {
            try {
              const content = await fs.readFile(path.join(workflowsDir, file), 'utf8');
              if (!content.trim()) {
                this.log(`❌ Empty workflow file: ${file}`, 'ERROR');
                this.errors.push({ 
                  type: 'FILE_SYSTEM', 
                  message: `Empty file: ${file}`, 
                  timestamp: new Date() 
                });
                continue;
              }
              
              const workflow = JSON.parse(content);
              if (!workflow.id || !workflow.name) {
                this.log(`❌ Invalid workflow file: ${file}`, 'ERROR');
                this.errors.push({ 
                  type: 'FILE_SYSTEM', 
                  message: `Invalid workflow: ${file}`, 
                  timestamp: new Date() 
                });
              }
            } catch (parseError) {
              this.log(`❌ Corrupted workflow file: ${file}`, 'ERROR');
              this.errors.push({ 
                type: 'FILE_SYSTEM', 
                message: `Corrupted file: ${file}`, 
                timestamp: new Date() 
              });
            }
          }
        }
      } catch (error) {
        this.log(`❌ File system error: ${error.message}`, 'ERROR');
        this.errors.push({ 
          type: 'FILE_SYSTEM', 
          message: error.message, 
          timestamp: new Date() 
        });
      }
    }, 30000);
  }

  async testWorkflowOperations() {
    this.log('🧪 Testing workflow operations...');
    
    try {
      // Test creating a workflow
      const createResponse = await axios.post('http://localhost:3001/api/workflows', {
        name: 'Monitor Test Workflow',
        description: 'Test workflow for monitoring',
        nodes: [],
        edges: []
      });
      
      if (createResponse.status !== 201) {
        this.log(`❌ Create workflow failed: ${createResponse.status}`, 'ERROR');
        return;
      }
      
      const workflowId = createResponse.data.id;
      this.log(`✅ Created test workflow: ${workflowId}`);
      
      // Test updating the workflow
      const updateResponse = await axios.put(`http://localhost:3001/api/workflows/${workflowId}`, {
        name: 'Updated Monitor Test',
        nodes: [
          {
            id: 'test_node',
            type: 'webhook',
            position: { x: 100, y: 100 },
            data: { label: 'Test Node' }
          }
        ],
        edges: []
      });
      
      if (updateResponse.status !== 200) {
        this.log(`❌ Update workflow failed: ${updateResponse.status}`, 'ERROR');
      } else {
        this.log('✅ Updated test workflow');
      }
      
      // Test running the workflow
      const runResponse = await axios.post(`http://localhost:3001/api/run/${workflowId}`, {
        testData: { message: 'Monitor test' }
      });
      
      if (runResponse.status !== 200) {
        this.log(`❌ Run workflow failed: ${runResponse.status}`, 'ERROR');
      } else {
        this.log('✅ Ran test workflow');
      }
      
      // Test exporting the workflow
      const exportResponse = await axios.post(`http://localhost:3001/api/export/${workflowId}`);
      
      if (exportResponse.status !== 200) {
        this.log(`❌ Export workflow failed: ${exportResponse.status}`, 'ERROR');
      } else {
        this.log('✅ Exported test workflow');
      }
      
      // Clean up - delete the test workflow
      await axios.delete(`http://localhost:3001/api/workflows/${workflowId}`);
      this.log('✅ Cleaned up test workflow');
      
    } catch (error) {
      this.log(`❌ Workflow operation test failed: ${error.message}`, 'ERROR');
      this.errors.push({ 
        type: 'WORKFLOW_TEST', 
        message: error.message, 
        timestamp: new Date() 
      });
    }
  }

  getErrorSummary() {
    const errorTypes = {};
    this.errors.forEach(error => {
      errorTypes[error.type] = (errorTypes[error.type] || 0) + 1;
    });
    
    return {
      total: this.errors.length,
      byType: errorTypes,
      recent: this.errors.slice(-5) // Last 5 errors
    };
  }

  printStatus() {
    const summary = this.getErrorSummary();
    console.log('\n📊 Error Monitoring Status:');
    console.log('============================');
    console.log(`Total Errors: ${summary.total}`);
    console.log('Errors by Type:');
    Object.entries(summary.byType).forEach(([type, count]) => {
      console.log(`  ${type}: ${count}`);
    });
    
    if (summary.recent.length > 0) {
      console.log('\nRecent Errors:');
      summary.recent.forEach(error => {
        console.log(`  [${error.timestamp.toISOString()}] ${error.type}: ${error.message}`);
      });
    }
    
    if (summary.total === 0) {
      console.log('✅ No errors detected!');
    }
  }

  stop() {
    this.isMonitoring = false;
    this.log('🛑 Stopping error monitoring...');
  }
}

// Create and start the monitor
const monitor = new ErrorMonitor();

// Handle process termination
process.on('SIGINT', () => {
  monitor.printStatus();
  monitor.stop();
  process.exit(0);
});

// Start monitoring
monitor.startMonitoring();

// Run workflow tests every 2 minutes
setInterval(() => {
  monitor.testWorkflowOperations();
}, 120000);

// Print status every minute
setInterval(() => {
  monitor.printStatus();
}, 60000);

// Initial workflow test
setTimeout(() => {
  monitor.testWorkflowOperations();
}, 10000);

module.exports = ErrorMonitor; 