const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');

const BASE_URL = 'http://localhost:3001';

class AppTester {
  constructor() {
    this.testResults = [];
    this.currentTest = '';
  }

  async log(message) {
    console.log(`[${new Date().toISOString()}] ${message}`);
  }

  async test(name, testFn) {
    this.currentTest = name;
    console.log(`\n🧪 Testing: ${name}`);
    
    try {
      await testFn();
      this.testResults.push({ name, status: 'PASS' });
      console.log(`✅ ${name} - PASSED`);
    } catch (error) {
      this.testResults.push({ name, status: 'FAIL', error: error.message });
      console.log(`❌ ${name} - FAILED: ${error.message}`);
    }
  }

  async testServerHealth() {
    const response = await axios.get(`${BASE_URL}/api/workflows`);
    if (response.status !== 200) {
      throw new Error(`Server returned status ${response.status}`);
    }
  }

  async testCreateWorkflow() {
    const workflowData = {
      name: 'Test Workflow',
      description: 'A test workflow for validation',
      nodes: [],
      edges: []
    };

    const response = await axios.post(`${BASE_URL}/api/workflows`, workflowData);
    
    if (response.status !== 201) {
      throw new Error(`Create workflow returned status ${response.status}`);
    }

    if (!response.data.id || !response.data.name) {
      throw new Error('Created workflow missing required fields');
    }

    return response.data.id;
  }

  async testGetWorkflow(workflowId) {
    const response = await axios.get(`${BASE_URL}/api/workflows/${workflowId}`);
    
    if (response.status !== 200) {
      throw new Error(`Get workflow returned status ${response.status}`);
    }

    if (response.data.id !== workflowId) {
      throw new Error('Retrieved workflow ID mismatch');
    }
  }

  async testUpdateWorkflow(workflowId) {
    const updateData = {
      name: 'Updated Test Workflow',
      description: 'Updated description',
      nodes: [
        {
          id: 'test_node_1',
          type: 'webhook',
          position: { x: 100, y: 100 },
          data: { label: 'Test Webhook' }
        }
      ],
      edges: []
    };

    const response = await axios.put(`${BASE_URL}/api/workflows/${workflowId}`, updateData);
    
    if (response.status !== 200) {
      throw new Error(`Update workflow returned status ${response.status}`);
    }

    if (response.data.name !== 'Updated Test Workflow') {
      throw new Error('Workflow name not updated correctly');
    }
  }

  async testRunWorkflow(workflowId) {
    const testData = {
      testData: { message: 'Test execution' }
    };

    const response = await axios.post(`${BASE_URL}/api/run/${workflowId}`, testData);
    
    if (response.status !== 200) {
      throw new Error(`Run workflow returned status ${response.status}`);
    }

    if (typeof response.data.success !== 'boolean') {
      throw new Error('Run response missing success field');
    }
  }

  async testExportWorkflow(workflowId) {
    const response = await axios.post(`${BASE_URL}/api/export/${workflowId}`);
    
    if (response.status !== 200) {
      throw new Error(`Export workflow returned status ${response.status}`);
    }

    if (!response.data.snippet || typeof response.data.snippet !== 'string') {
      throw new Error('Export response missing snippet');
    }
  }

  async testWebhookTrigger(workflowId) {
    const webhookData = {
      title: 'Test Webhook',
      body: 'This is a test webhook payload'
    };

    const response = await axios.post(`${BASE_URL}/webhook/${workflowId}`, webhookData);
    
    if (response.status !== 200) {
      throw new Error(`Webhook trigger returned status ${response.status}`);
    }

    if (!response.data.success) {
      throw new Error('Webhook trigger failed');
    }
  }

  async testDeleteWorkflow(workflowId) {
    const response = await axios.delete(`${BASE_URL}/api/workflows/${workflowId}`);
    
    if (response.status !== 200) {
      throw new Error(`Delete workflow returned status ${response.status}`);
    }

    // Verify it's actually deleted
    try {
      await axios.get(`${BASE_URL}/api/workflows/${workflowId}`);
      throw new Error('Workflow still exists after deletion');
    } catch (error) {
      if (error.response.status !== 404) {
        throw new Error(`Expected 404 after deletion, got ${error.response.status}`);
      }
    }
  }

  async testFileSystem() {
    const workflowsDir = path.join(__dirname, 'workflows');
    
    // Check if workflows directory exists
    const exists = await fs.pathExists(workflowsDir);
    if (!exists) {
      throw new Error('Workflows directory does not exist');
    }

    // Check if sample workflow exists and is valid
    const samplePath = path.join(workflowsDir, 'sample-workflow.json');
    const sampleExists = await fs.pathExists(samplePath);
    if (!sampleExists) {
      throw new Error('Sample workflow file does not exist');
    }

    const sampleContent = await fs.readFile(samplePath, 'utf8');
    const sampleWorkflow = JSON.parse(sampleContent);
    
    if (!sampleWorkflow.id || !sampleWorkflow.name || !sampleWorkflow.nodes) {
      throw new Error('Sample workflow has invalid structure');
    }
  }

  async testErrorHandling() {
    // Test non-existent workflow
    try {
      await axios.get(`${BASE_URL}/api/workflows/non-existent-id`);
      throw new Error('Expected 404 for non-existent workflow');
    } catch (error) {
      if (error.response.status !== 404) {
        throw new Error(`Expected 404, got ${error.response.status}`);
      }
    }

    // Test invalid workflow ID format
    try {
      await axios.get(`${BASE_URL}/api/workflows/invalid-id-format`);
      // This should not throw if the server handles it gracefully
    } catch (error) {
      if (error.response.status !== 404) {
        throw new Error(`Expected 404 for invalid ID, got ${error.response.status}`);
      }
    }
  }

  async runAllTests() {
    console.log('🚀 Starting comprehensive app testing...\n');

    await this.test('Server Health Check', () => this.testServerHealth());
    await this.test('File System Validation', () => this.testFileSystem());
    await this.test('Error Handling', () => this.testErrorHandling());

    // Test workflow lifecycle
    let workflowId;
    await this.test('Create Workflow', async () => {
      workflowId = await this.testCreateWorkflow();
    });

    if (workflowId) {
      await this.test('Get Workflow', () => this.testGetWorkflow(workflowId));
      await this.test('Update Workflow', () => this.testUpdateWorkflow(workflowId));
      await this.test('Run Workflow', () => this.testRunWorkflow(workflowId));
      await this.test('Export Workflow', () => this.testExportWorkflow(workflowId));
      await this.test('Webhook Trigger', () => this.testWebhookTrigger(workflowId));
      await this.test('Delete Workflow', () => this.testDeleteWorkflow(workflowId));
    }

    // Print summary
    console.log('\n📊 Test Summary:');
    console.log('================');
    
    const passed = this.testResults.filter(r => r.status === 'PASS').length;
    const failed = this.testResults.filter(r => r.status === 'FAIL').length;
    
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`📈 Success Rate: ${((passed / this.testResults.length) * 100).toFixed(1)}%`);

    if (failed > 0) {
      console.log('\n❌ Failed Tests:');
      this.testResults
        .filter(r => r.status === 'FAIL')
        .forEach(r => console.log(`  - ${r.name}: ${r.error}`));
    }

    return this.testResults;
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  const tester = new AppTester();
  tester.runAllTests().catch(console.error);
}

module.exports = AppTester; 