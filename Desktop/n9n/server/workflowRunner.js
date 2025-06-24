const axios = require('axios');
const cron = require('node-cron');

class WorkflowRunner {
  constructor() {
    this.executionContext = new Map();
    this.scheduledJobs = new Map();
  }

  async runWorkflow(workflow, inputData = {}) {
    const executionId = Date.now().toString();
    const context = {
      executionId,
      workflow,
      data: { ...inputData },
      results: {},
      errors: []
    };

    this.executionContext.set(executionId, context);

    try {
      console.log(`🚀 Starting workflow execution: ${workflow.name}`);
      
      // Find trigger nodes (nodes with no incoming edges)
      const triggerNodes = this.findTriggerNodes(workflow);
      
      if (triggerNodes.length === 0) {
        throw new Error('No trigger nodes found in workflow');
      }

      // Execute each trigger node
      for (const triggerNode of triggerNodes) {
        await this.executeNode(triggerNode, context);
      }

      return {
        success: true,
        executionId,
        results: context.results,
        errors: context.errors
      };
    } catch (error) {
      console.error('Workflow execution failed:', error);
      context.errors.push(error.message);
      
      return {
        success: false,
        executionId,
        error: error.message,
        results: context.results,
        errors: context.errors
      };
    } finally {
      this.executionContext.delete(executionId);
    }
  }

  findTriggerNodes(workflow) {
    const { nodes, edges } = workflow;
    const nodesWithIncoming = new Set();
    
    // Find all nodes that have incoming edges
    edges.forEach(edge => {
      nodesWithIncoming.add(edge.target);
    });
    
    // Return nodes without incoming edges (triggers)
    return nodes.filter(node => !nodesWithIncoming.has(node.id));
  }

  async executeNode(node, context) {
    console.log(`📋 Executing node: ${node.type} (${node.id})`);
    
    try {
      let result;
      
      switch (node.type) {
        case 'webhook':
          result = await this.executeWebhookNode(node, context);
          break;
        case 'httpRequest':
          result = await this.executeHttpRequestNode(node, context);
          break;
        case 'slack':
          result = await this.executeSlackNode(node, context);
          break;
        case 'email':
          result = await this.executeEmailNode(node, context);
          break;
        case 'delay':
          result = await this.executeDelayNode(node, context);
          break;
        case 'condition':
          result = await this.executeConditionNode(node, context);
          break;
        case 'code':
          result = await this.executeCodeNode(node, context);
          break;
        case 'cron':
          result = await this.executeCronNode(node, context);
          break;
        case 'notion':
          result = await this.executeNotionNode(node, context);
          break;
        case 'airtable':
          result = await this.executeAirtableNode(node, context);
          break;
        default:
          throw new Error(`Unknown node type: ${node.type}`);
      }
      
      context.results[node.id] = result;
      
      // Execute connected nodes
      await this.executeConnectedNodes(node, context);
      
      return result;
    } catch (error) {
      console.error(`Error executing node ${node.id}:`, error);
      context.errors.push(`Node ${node.id}: ${error.message}`);
      throw error;
    }
  }

  async executeWebhookNode(node, context) {
    // Webhook nodes are triggers, so they just pass through the input data
    return {
      type: 'webhook',
      data: context.data.webhook || context.data,
      timestamp: new Date().toISOString()
    };
  }

  async executeHttpRequestNode(node, context) {
    const config = node.data || {};
    const { url, method = 'GET', headers = {}, body } = config;
    
    if (!url) {
      throw new Error('HTTP Request node requires a URL');
    }
    
    // Replace variables in URL and body
    const processedUrl = this.replaceVariables(url, context);
    const processedBody = body ? this.replaceVariables(body, context) : undefined;
    
    const response = await axios({
      method: method.toUpperCase(),
      url: processedUrl,
      headers,
      data: processedBody,
      timeout: 30000
    });
    
    return {
      type: 'httpRequest',
      status: response.status,
      statusText: response.statusText,
      data: response.data,
      headers: response.headers,
      timestamp: new Date().toISOString()
    };
  }

  async executeSlackNode(node, context) {
    const config = node.data || {};
    const { webhookUrl, channel, message } = config;
    
    if (!webhookUrl || !message) {
      throw new Error('Slack node requires webhook URL and message');
    }
    
    const processedMessage = this.replaceVariables(message, context);
    
    const response = await axios.post(webhookUrl, {
      text: processedMessage,
      channel: channel || '#general'
    });
    
    return {
      type: 'slack',
      success: response.status === 200,
      timestamp: new Date().toISOString()
    };
  }

  async executeEmailNode(node, context) {
    const config = node.data || {};
    const { to, subject, body, from } = config;
    
    if (!to || !subject || !body) {
      throw new Error('Email node requires to, subject, and body');
    }
    
    // For now, we'll just log the email (you can integrate with SendGrid, etc.)
    const processedSubject = this.replaceVariables(subject, context);
    const processedBody = this.replaceVariables(body, context);
    
    console.log(`📧 Email would be sent:`, {
      from: from || 'noreply@yourdomain.com',
      to,
      subject: processedSubject,
      body: processedBody
    });
    
    return {
      type: 'email',
      success: true,
      timestamp: new Date().toISOString()
    };
  }

  async executeDelayNode(node, context) {
    const config = node.data || {};
    const { duration = 1000 } = config; // Default 1 second
    
    await new Promise(resolve => setTimeout(resolve, duration));
    
    return {
      type: 'delay',
      duration,
      timestamp: new Date().toISOString()
    };
  }

  async executeConditionNode(node, context) {
    const config = node.data || {};
    const { condition } = config;
    
    if (!condition) {
      throw new Error('Condition node requires a condition expression');
    }
    
    // Simple condition evaluation (you can make this more sophisticated)
    const result = this.evaluateCondition(condition, context);
    
    return {
      type: 'condition',
      condition,
      result,
      timestamp: new Date().toISOString()
    };
  }

  async executeCodeNode(node, context) {
    const config = node.data || {};
    const { code } = config;
    
    if (!code) {
      throw new Error('Code node requires JavaScript code');
    }
    
    try {
      // Create a safe execution environment
      const sandbox = {
        data: context.data,
        results: context.results,
        console: {
          log: (...args) => console.log('[Code Node]:', ...args),
          error: (...args) => console.error('[Code Node]:', ...args)
        },
        setTimeout,
        clearTimeout,
        Date,
        Math,
        JSON
      };
      
      // Execute the code
      const func = new Function('data', 'results', 'console', 'setTimeout', 'clearTimeout', 'Date', 'Math', 'JSON', code);
      const result = func(
        sandbox.data,
        sandbox.results,
        sandbox.console,
        sandbox.setTimeout,
        sandbox.clearTimeout,
        sandbox.Date,
        sandbox.Math,
        sandbox.JSON
      );
      
      return {
        type: 'code',
        result,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      throw new Error(`Code execution error: ${error.message}`);
    }
  }

  async executeCronNode(node, context) {
    const config = node.data || {};
    const { schedule } = config;
    
    if (!schedule) {
      throw new Error('Cron node requires a schedule expression');
    }
    
    // Schedule the job if not already scheduled
    if (!this.scheduledJobs.has(node.id)) {
      const job = cron.schedule(schedule, async () => {
        console.log(`⏰ Cron job triggered for node: ${node.id}`);
        await this.executeConnectedNodes(node, context);
      });
      
      this.scheduledJobs.set(node.id, job);
    }
    
    return {
      type: 'cron',
      schedule,
      scheduled: true,
      timestamp: new Date().toISOString()
    };
  }

  async executeNotionNode(node, context) {
    const config = node.data || {};
    const { action, databaseId, pageId, properties } = config;
    
    // This is a placeholder - you'd integrate with Notion API
    console.log(`📝 Notion action: ${action}`, { databaseId, pageId, properties });
    
    return {
      type: 'notion',
      action,
      success: true,
      timestamp: new Date().toISOString()
    };
  }

  async executeAirtableNode(node, context) {
    const config = node.data || {};
    const { action, baseId, tableName, records } = config;
    
    // This is a placeholder - you'd integrate with Airtable API
    console.log(`📊 Airtable action: ${action}`, { baseId, tableName, records });
    
    return {
      type: 'airtable',
      action,
      success: true,
      timestamp: new Date().toISOString()
    };
  }

  async executeConnectedNodes(sourceNode, context) {
    const { edges } = context.workflow;
    
    // Find edges that start from this node
    const outgoingEdges = edges.filter(edge => edge.source === sourceNode.id);
    
    for (const edge of outgoingEdges) {
      const targetNode = context.workflow.nodes.find(n => n.id === edge.target);
      
      if (!targetNode) {
        console.warn(`Target node not found: ${edge.target}`);
        continue;
      }
      
      // Check if this is a conditional edge
      if (edge.condition) {
        const shouldExecute = this.evaluateCondition(edge.condition, context);
        if (!shouldExecute) {
          console.log(`Skipping node ${targetNode.id} due to condition: ${edge.condition}`);
          continue;
        }
      }
      
      await this.executeNode(targetNode, context);
    }
  }

  replaceVariables(text, context) {
    if (typeof text !== 'string') return text;
    
    return text.replace(/\{\{([^}]+)\}\}/g, (match, variable) => {
      const parts = variable.trim().split('.');
      let value = context;
      
      for (const part of parts) {
        if (value && typeof value === 'object' && part in value) {
          value = value[part];
        } else {
          return match; // Return original if variable not found
        }
      }
      
      return value !== undefined ? String(value) : match;
    });
  }

  evaluateCondition(condition, context) {
    // Simple condition evaluation - you can make this more sophisticated
    try {
      // Replace variables in condition
      const processedCondition = this.replaceVariables(condition, context);
      
      // Basic evaluation (be careful with this in production)
      return eval(processedCondition);
    } catch (error) {
      console.error('Condition evaluation error:', error);
      return false;
    }
  }

  generateSnippet(workflow) {
    // Generate a JavaScript snippet that can be embedded in websites
    const { nodes, edges } = workflow;
    
    let snippet = `
// N9N Workflow Snippet - ${workflow.name}
// Generated on ${new Date().toISOString()}

(function() {
  'use strict';
  
  const workflow = {
    name: '${workflow.name}',
    nodes: ${JSON.stringify(nodes, null, 2)},
    edges: ${JSON.stringify(edges, null, 2)}
  };
  
  // Simple workflow execution function
  async function executeWorkflow(inputData = {}) {
    const results = {};
    const errors = [];
    
    try {
      console.log('Executing workflow:', workflow.name);
      
      // Execute nodes in order (simplified)
      for (const node of workflow.nodes) {
        try {
          switch (node.type) {
            case 'httpRequest':
              const response = await fetch(node.data.url, {
                method: node.data.method || 'GET',
                headers: node.data.headers || {},
                body: node.data.body ? JSON.stringify(node.data.body) : undefined
              });
              results[node.id] = await response.json();
              break;
              
            case 'code':
              // Execute custom code (simplified)
              const func = new Function('data', 'results', node.data.code);
              results[node.id] = func(inputData, results);
              break;
              
            default:
              console.log('Node type not supported in snippet:', node.type);
          }
        } catch (error) {
          errors.push(\`Node \${node.id}: \${error.message}\`);
        }
      }
      
      return { success: true, results, errors };
    } catch (error) {
      return { success: false, error: error.message, results, errors };
    }
  }
  
  // Expose to global scope
  window.n9nWorkflow = {
    execute: executeWorkflow,
    workflow: workflow
  };
  
  console.log('N9N Workflow loaded:', workflow.name);
})();
    `;
    
    return snippet.trim();
  }

  stopScheduledJobs() {
    for (const [nodeId, job] of this.scheduledJobs) {
      job.stop();
    }
    this.scheduledJobs.clear();
  }
}

module.exports = new WorkflowRunner(); 