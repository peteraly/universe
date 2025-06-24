const OpenAI = require('openai');
const costMonitor = require('../cost-monitor');

class OpenAIService {
  constructor() {
    // Initialize with environment variables
    this.openai = null;
    this.isEnabled = false;
    this.dailyUsage = 0;
    this.maxDailyRequests = parseInt(process.env.MAX_DAILY_REQUESTS) || 50;
    this.maxTokensPerRequest = parseInt(process.env.MAX_TOKENS_PER_REQUEST) || 2000;
    
    // Check if AI is enabled via environment variable
    const enableAI = process.env.ENABLE_AI_ASSISTANT === 'true';
    const hasApiKey = process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your_openai_api_key_here';
    
    if (enableAI && hasApiKey) {
      this.openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY
      });
      this.isEnabled = true;
      console.log('🤖 AI Assistant enabled with OpenAI API');
    } else {
      console.log('🎭 AI Assistant running in mock mode (no API key or disabled)');
      console.log('   Set ENABLE_AI_ASSISTANT=true and OPENAI_API_KEY in .env to enable real AI');
    }
    
    // COST CONTROL: Print current status
    costMonitor.printStatus();
  }

  // COST CONTROL: Check if AI is enabled and within limits
  checkUsageLimits() {
    if (!this.isEnabled) {
      throw new Error('AI Assistant is disabled to prevent billing. Set ENABLE_AI_ASSISTANT=true in .env to enable.');
    }
    
    if (this.dailyUsage >= this.maxDailyRequests) {
      throw new Error(`Daily AI request limit reached (${this.maxDailyRequests}). Please try again tomorrow.`);
    }
    
    // COST CONTROL: Check cost limits
    try {
      costMonitor.checkLimits();
    } catch (error) {
      throw new Error(`Cost limit reached: ${error.message}`);
    }
    
    return true;
  }

  // COST CONTROL: Increment usage counter
  incrementUsage(tokens = 0, cost = 0) {
    this.dailyUsage++;
    costMonitor.logRequest(tokens, cost);
    console.log(`📊 AI Usage: ${this.dailyUsage}/${this.maxDailyRequests} requests today`);
  }

  async updateWorkflow(prompt, workflow, context = '') {
    try {
      // Check usage limits
      this.checkUsageLimits();
      
      if (!this.isEnabled) {
        // Return mock response when AI is disabled
        return this.generateMockResponse(prompt, workflow, context);
      }
      
      // Rest of the method for real AI processing...
      const systemPrompt = `You are an AI assistant that helps modify workflow automation. 
      You receive a workflow in JSON format and a user prompt describing what changes they want.
      You must respond with ONLY a valid JSON object representing the modified workflow.
      
      Current workflow: ${JSON.stringify(workflow)}
      User prompt: ${prompt}
      Context: ${context}
      
      Rules:
      1. Return ONLY valid JSON - no other text
      2. Preserve the existing workflow structure
      3. Add, modify, or remove nodes based on the user's request
      4. Ensure all node IDs are unique
      5. Maintain valid node positions and connections
      
      Respond with the complete modified workflow JSON:`;
      
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt }
        ],
        max_tokens: this.maxTokensPerRequest,
        temperature: 0.3
      });
      
      const aiResponse = response.choices[0].message.content.trim();
      console.log('🤖 AI Response:', aiResponse);
      
      const updatedWorkflow = this.parseWorkflowUpdate(aiResponse);
      
      // Track usage
      this.dailyUsage++;
      this.trackUsage(response.usage);
      
      return updatedWorkflow;
    } catch (error) {
      console.error('❌ AI workflow update failed:', error);
      
      // Fallback to mock response on error
      return this.generateMockResponse(prompt, workflow, context);
    }
  }

  // COST CONTROL: Calculate cost based on tokens and model
  calculateCost(tokens, model) {
    // OpenAI pricing (as of 2024) - these are estimates
    const pricing = {
      'gpt-4': 0.03 / 1000, // $0.03 per 1K tokens
      'gpt-3.5-turbo': 0.002 / 1000 // $0.002 per 1K tokens
    };
    
    const rate = pricing[model] || pricing['gpt-4'];
    return tokens * rate;
  }

  // Enhanced mock response system
  generateSmartMockResponse(prompt, workflow, context) {
    console.log('🎭 Generating smart mock AI response');
    
    const mockWorkflow = { ...workflow };
    const timestamp = Date.now();
    
    // Analyze the prompt and generate appropriate mock response
    const promptLower = prompt.toLowerCase();
    
    if (promptLower.includes('add') && promptLower.includes('delay')) {
      // Add a delay node
      const delayNode = {
        id: `delay_${timestamp}`,
        type: 'delay',
        position: { x: 300, y: 200 },
        data: {
          label: 'Delay',
          delay: 5000,
          description: 'Wait for 5 seconds before proceeding'
        }
      };
      
      mockWorkflow.nodes.push(delayNode);
      
      // Add edge from first node to delay
      if (mockWorkflow.nodes.length > 1) {
        const edge = {
          id: `edge_${timestamp}`,
          source: mockWorkflow.nodes[0].id,
          target: delayNode.id
        };
        mockWorkflow.edges.push(edge);
      }
      
    } else if (promptLower.includes('instagram') || promptLower.includes('social media')) {
      // Add Instagram/social media node
      const socialNode = {
        id: `social_${timestamp}`,
        type: 'httpRequest',
        position: { x: 400, y: 300 },
        data: {
          label: 'Social Media Post',
          url: 'https://api.instagram.com/v1/media',
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: '{{message}}',
          description: 'Post content to social media'
        }
      };
      
      mockWorkflow.nodes.push(socialNode);
      
    } else if (promptLower.includes('email') || promptLower.includes('notification')) {
      // Add email notification node
      const emailNode = {
        id: `email_${timestamp}`,
        type: 'email',
        position: { x: 350, y: 250 },
        data: {
          label: 'Send Email',
          to: '{{recipient}}',
          subject: '{{subject}}',
          body: '{{message}}',
          description: 'Send email notification'
        }
      };
      
      mockWorkflow.nodes.push(emailNode);
      
    } else if (promptLower.includes('slack') || promptLower.includes('message')) {
      // Add Slack message node
      const slackNode = {
        id: `slack_${timestamp}`,
        type: 'slack',
        position: { x: 450, y: 200 },
        data: {
          label: 'Slack Message',
          channel: '#general',
          message: '{{message}}',
          description: 'Send message to Slack channel'
        }
      };
      
      mockWorkflow.nodes.push(slackNode);
      
    } else if (promptLower.includes('condition') || promptLower.includes('if')) {
      // Add conditional logic node
      const conditionNode = {
        id: `condition_${timestamp}`,
        type: 'condition',
        position: { x: 250, y: 150 },
        data: {
          label: 'Condition Check',
          condition: '{{value}} === "success"',
          description: 'Check condition and route flow'
        }
      };
      
      mockWorkflow.nodes.push(conditionNode);
      
    } else if (promptLower.includes('code') || promptLower.includes('script')) {
      // Add code execution node
      const codeNode = {
        id: `code_${timestamp}`,
        type: 'code',
        position: { x: 200, y: 100 },
        data: {
          label: 'Custom Code',
          code: '// Add your custom logic here\nreturn data;',
          description: 'Execute custom JavaScript code'
        }
      };
      
      mockWorkflow.nodes.push(codeNode);
      
    } else {
      // Generic improvement - add a logging node
      const logNode = {
        id: `log_${timestamp}`,
        type: 'code',
        position: { x: 150, y: 50 },
        data: {
          label: 'Log Activity',
          code: 'console.log("Workflow executed:", data);\nreturn data;',
          description: 'Log workflow execution details'
        }
      };
      
      mockWorkflow.nodes.push(logNode);
    }
    
    return {
      ...mockWorkflow,
      updatedAt: new Date().toISOString(),
      aiGenerated: true,
      mockResponse: true,
      mockReason: 'AI disabled or API unavailable'
    };
  }

  buildSystemPrompt() {
    return `You are an expert workflow automation engineer. Your job is to modify JSON workflow configurations based on natural language instructions.

CRITICAL: You must ALWAYS return ONLY valid JSON. No explanations, no markdown, no text outside the JSON object.

WORKFLOW STRUCTURE:
- A workflow contains nodes (steps) and edges (connections)
- Each node has: id, type, position (x, y), data (configuration)
- Each edge has: id, source (from node), target (to node), condition (optional)

NODE TYPES:
1. webhook - Trigger node that receives HTTP requests
2. httpRequest - Makes HTTP requests to external APIs
3. slack - Sends messages to Slack
4. email - Sends emails
5. delay - Waits for a specified time
6. condition - Evaluates conditions and routes flow
7. code - Executes custom JavaScript code
8. cron - Scheduled triggers
9. notion - Interacts with Notion API
10. airtable - Interacts with Airtable API

INSTRUCTIONS:
1. Return ONLY the complete JSON workflow object
2. Preserve existing nodes and edges unless explicitly asked to remove them
3. Add new nodes with unique IDs (use format: node_${Date.now()}_${Math.random().toString(36).substr(2, 9)})
4. Add new edges to connect nodes properly
5. Update node data configurations as requested
6. Ensure workflow logic makes sense (triggers → actions → outputs)

RESPONSE FORMAT:
Return ONLY the complete JSON workflow object. No explanations, no markdown, no text outside the JSON.`;
  }

  buildUserPrompt(prompt, workflow, context) {
    const workflowStr = JSON.stringify(workflow, null, 2);
    const contextStr = JSON.stringify(context, null, 2);
    
    return `CURRENT WORKFLOW:
${workflowStr}

CONTEXT:
${contextStr}

USER REQUEST:
${prompt}

Return ONLY the complete updated JSON workflow object. No explanations or additional text.`;
  }

  parseWorkflowUpdate(aiResponse, originalWorkflow) {
    try {
      console.log('🔍 Parsing AI response...');
      console.log('AI Response:', aiResponse);
      
      // Try to extract JSON from the response
      let jsonStr = aiResponse.trim();
      
      // Remove markdown code blocks if present
      if (jsonStr.startsWith('```json')) {
        jsonStr = jsonStr.replace(/```json\n?/, '').replace(/```\n?/, '');
      } else if (jsonStr.startsWith('```')) {
        jsonStr = jsonStr.replace(/```\n?/, '').replace(/```\n?/, '');
      }
      
      // Try to find JSON object in the response
      const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        jsonStr = jsonMatch[0];
      }
      
      // Check if the response looks like JSON
      if (!jsonStr.startsWith('{') || !jsonStr.endsWith('}')) {
        console.log('❌ Response is not valid JSON format, using mock response');
        return this.generateSmartMockResponse('fallback', originalWorkflow, {});
      }
      
      const updatedWorkflow = JSON.parse(jsonStr);
      
      // Validate the updated workflow
      this.validateWorkflow(updatedWorkflow);
      
      // Preserve original metadata
      return {
        ...originalWorkflow,
        ...updatedWorkflow,
        updatedAt: new Date().toISOString()
      };
      
    } catch (error) {
      console.error('Failed to parse AI response:', error);
      console.error('AI Response:', aiResponse);
      
      // Return smart mock response on any error
      console.log('🔄 Falling back to smart mock response');
      return this.generateSmartMockResponse('fallback', originalWorkflow, {});
    }
  }

  validateWorkflow(workflow) {
    if (!workflow.nodes || !Array.isArray(workflow.nodes)) {
      throw new Error('Workflow must have a nodes array');
    }
    
    if (!workflow.edges || !Array.isArray(workflow.edges)) {
      throw new Error('Workflow must have an edges array');
    }
    
    // Validate nodes
    const nodeIds = new Set();
    for (const node of workflow.nodes) {
      if (!node.id || !node.type) {
        throw new Error('Each node must have id and type');
      }
      
      if (nodeIds.has(node.id)) {
        throw new Error(`Duplicate node ID: ${node.id}`);
      }
      nodeIds.add(node.id);
    }
    
    // Validate edges
    for (const edge of workflow.edges) {
      if (!edge.id || !edge.source || !edge.target) {
        throw new Error('Each edge must have id, source, and target');
      }
      
      if (!nodeIds.has(edge.source)) {
        throw new Error(`Edge source node not found: ${edge.source}`);
      }
      
      if (!nodeIds.has(edge.target)) {
        throw new Error(`Edge target node not found: ${edge.target}`);
      }
    }
  }

  async suggestWorkflowImprovements(workflow) {
    try {
      const systemPrompt = `You are an expert workflow automation consultant. Analyze the given workflow and suggest improvements for:
1. Performance optimization
2. Error handling
3. Best practices
4. Additional features that could be useful

Provide 3-5 specific, actionable suggestions.`;

      const userPrompt = `Please analyze this workflow and suggest improvements:

${JSON.stringify(workflow, null, 2)}`;

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 1000
      });

      return response.choices[0].message.content;
    } catch (error) {
      console.error('Failed to generate suggestions:', error);
      return 'Unable to generate suggestions at this time.';
    }
  }

  async explainWorkflow(workflow) {
    try {
      const systemPrompt = `You are an expert workflow automation engineer. Explain the given workflow in simple, non-technical terms that a business user would understand. Focus on:
1. What the workflow does
2. When it triggers
3. What actions it performs
4. The business value it provides

Keep the explanation clear and concise.`;

      const userPrompt = `Please explain this workflow in simple terms:

${JSON.stringify(workflow, null, 2)}`;

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.5,
        max_tokens: 800
      });

      return response.choices[0].message.content;
    } catch (error) {
      console.error('Failed to explain workflow:', error);
      return 'Unable to explain workflow at this time.';
    }
  }

  async generateWorkflowFromDescription(description, context = {}) {
    try {
      const systemPrompt = `You are an expert workflow automation engineer. Create a complete workflow JSON based on the user's description.

WORKFLOW REQUIREMENTS:
- Include appropriate trigger nodes (webhook, cron, etc.)
- Add necessary action nodes (httpRequest, slack, email, etc.)
- Connect nodes with proper edges
- Include realistic configuration data
- Ensure the workflow is functional and complete

NODE ID FORMAT: node_${Date.now()}_${Math.random().toString(36).substr(2, 9)}
EDGE ID FORMAT: edge_${Date.now()}_${Math.random().toString(36).substr(2, 9)}

Return ONLY the complete JSON workflow object.`;

      const userPrompt = `Create a workflow for: ${description}

Context: ${JSON.stringify(context, null, 2)}

Generate a complete, functional workflow JSON.`;

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.3,
        max_tokens: 3000
      });

      const result = response.choices[0].message.content;
      const workflow = this.parseWorkflowUpdate(result, {});
      
      return workflow;
    } catch (error) {
      console.error('Failed to generate workflow:', error);
      throw new Error(`Failed to generate workflow: ${error.message}`);
    }
  }

  generateMockResponse(prompt, workflow, context) {
    console.log('🎭 Generating mock AI response (AI disabled to prevent billing)');
    
    // Analyze the prompt to determine what type of modification to make
    const promptLower = prompt.toLowerCase();
    
    // Create a new node based on the prompt
    let newNode = null;
    let nodeType = 'code';
    let nodeLabel = 'AI Generated Node';
    
    if (promptLower.includes('delay') || promptLower.includes('wait')) {
      nodeType = 'delay';
      nodeLabel = 'Delay Node';
      newNode = {
        id: `delay_${Date.now()}`,
        type: 'delay',
        position: { x: 400, y: 200 },
        data: {
          label: nodeLabel,
          config: {
            duration: 5000,
            unit: 'milliseconds'
          }
        }
      };
    } else if (promptLower.includes('email') || promptLower.includes('mail')) {
      nodeType = 'email';
      nodeLabel = 'Email Notification';
      newNode = {
        id: `email_${Date.now()}`,
        type: 'email',
        position: { x: 400, y: 200 },
        data: {
          label: nodeLabel,
          config: {
            to: '{{email}}',
            subject: 'AI Generated Email',
            body: 'This email was generated by AI based on your request.'
          }
        }
      };
    } else if (promptLower.includes('slack') || promptLower.includes('message')) {
      nodeType = 'slack';
      nodeLabel = 'Slack Message';
      newNode = {
        id: `slack_${Date.now()}`,
        type: 'slack',
        position: { x: 400, y: 200 },
        data: {
          label: nodeLabel,
          config: {
            channel: '#general',
            message: 'AI generated message based on your request.'
          }
        }
      };
    } else if (promptLower.includes('code') || promptLower.includes('custom')) {
      nodeType = 'code';
      nodeLabel = 'Custom Code';
      newNode = {
        id: `code_${Date.now()}`,
        type: 'code',
        position: { x: 400, y: 200 },
        data: {
          label: nodeLabel,
          code: `// AI generated code based on: ${prompt}\nconsole.log('Processing request:', data);\nreturn { processed: true, timestamp: new Date().toISOString() };`
        }
      };
    } else if (promptLower.includes('condition') || promptLower.includes('if')) {
      nodeType = 'condition';
      nodeLabel = 'Condition Check';
      newNode = {
        id: `condition_${Date.now()}`,
        type: 'condition',
        position: { x: 400, y: 200 },
        data: {
          label: nodeLabel,
          config: {
            condition: 'data.status === "success"',
            trueOutput: 'success',
            falseOutput: 'error'
          }
        }
      };
    } else {
      // Default to a code node
      newNode = {
        id: `code_${Date.now()}`,
        type: 'code',
        position: { x: 400, y: 200 },
        data: {
          label: 'AI Generated Node',
          code: `// AI generated code based on: ${prompt}\nconsole.log('Processing:', data);\nreturn { result: 'success', message: 'AI processed your request' };`
        }
      };
    }
    
    // Create updated workflow with the new node
    const updatedWorkflow = {
      ...workflow,
      nodes: [...(workflow.nodes || []), newNode],
      edges: workflow.edges || []
    };
    
    // Return the updated workflow as JSON
    return updatedWorkflow;
  }
}

module.exports = new OpenAIService(); 