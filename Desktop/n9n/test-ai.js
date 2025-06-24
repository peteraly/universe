const axios = require('axios');

async function testAI() {
  console.log('🤖 Testing AI Assistant functionality...\n');
  
  try {
    // Test 1: Basic AI prompt
    console.log('📝 Test 1: Basic AI prompt...');
    const response1 = await axios.post('http://localhost:3001/api/prompt-update/sample-workflow', {
      prompt: 'Add a simple delay node',
      context: 'I want to add a 3 second delay between nodes'
    });
    
    if (response1.status === 200) {
      console.log('✅ AI prompt successful');
      console.log(`📊 Response length: ${JSON.stringify(response1.data).length} characters`);
    } else {
      console.log(`❌ AI prompt failed: ${response1.status}`);
    }
    
    // Test 2: Complex AI prompt
    console.log('\n📝 Test 2: Complex AI prompt...');
    const response2 = await axios.post('http://localhost:3001/api/prompt-update/sample-workflow', {
      prompt: 'Add error handling and retry logic to the HTTP request node',
      context: 'Make the workflow more robust with error handling'
    });
    
    if (response2.status === 200) {
      console.log('✅ Complex AI prompt successful');
      console.log(`📊 Response length: ${JSON.stringify(response2.data).length} characters`);
    } else {
      console.log(`❌ Complex AI prompt failed: ${response2.status}`);
    }
    
    // Test 3: Check if workflow was actually modified
    console.log('\n📝 Test 3: Verifying workflow modifications...');
    const workflowResponse = await axios.get('http://localhost:3001/api/workflows/sample-workflow');
    
    if (workflowResponse.status === 200) {
      const workflow = workflowResponse.data;
      console.log(`✅ Workflow retrieved successfully`);
      console.log(`📊 Nodes count: ${workflow.nodes.length}`);
      console.log(`📊 Edges count: ${workflow.edges.length}`);
      
      // Check if AI modifications were applied
      const hasDelayNode = workflow.nodes.some(node => node.type === 'delay');
      const hasErrorHandling = workflow.nodes.some(node => 
        node.data && node.data.label && node.data.label.toLowerCase().includes('error')
      );
      
      console.log(`🔍 Delay node found: ${hasDelayNode ? '✅' : '❌'}`);
      console.log(`🔍 Error handling found: ${hasErrorHandling ? '✅' : '❌'}`);
    }
    
    console.log('\n🎉 AI Assistant test completed successfully!');
    
  } catch (error) {
    console.error('❌ AI test failed:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

// Run the test
testAI(); 