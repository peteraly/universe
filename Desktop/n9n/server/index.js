const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs-extra');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const workflowRunner = require('./workflowRunner');
const openaiService = require('./openaiService');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname, '../client/build')));

// Ensure workflows directory exists
const workflowsDir = path.join(__dirname, '../workflows');
fs.ensureDirSync(workflowsDir);

// API Routes

// Get all workflows
app.get('/api/workflows', async (req, res) => {
  try {
    const files = await fs.readdir(workflowsDir);
    const workflows = [];
    
    for (const file of files) {
      if (file.endsWith('.json')) {
        try {
          const content = await fs.readFile(path.join(workflowsDir, file), 'utf8');
          
          // Skip empty files
          if (!content.trim()) {
            console.warn(`Skipping empty file: ${file}`);
            continue;
          }
          
          const workflow = JSON.parse(content);
          
          // Validate workflow structure
          if (!workflow.id || !workflow.name) {
            console.warn(`Skipping invalid workflow file: ${file}`);
            continue;
          }
          
          workflows.push({
            id: file.replace('.json', ''),
            name: workflow.name || 'Untitled Workflow',
            description: workflow.description || '',
            createdAt: workflow.createdAt || new Date().toISOString(),
            updatedAt: workflow.updatedAt || new Date().toISOString(),
            nodes: workflow.nodes || [],
            edges: workflow.edges || []
          });
        } catch (parseError) {
          console.error(`Error parsing workflow file ${file}:`, parseError.message);
          // Continue with other files instead of failing completely
          continue;
        }
      }
    }
    
    res.json(workflows);
  } catch (error) {
    console.error('Error reading workflows:', error);
    res.status(500).json({ error: 'Failed to read workflows' });
  }
});

// Get single workflow
app.get('/api/workflows/:id', async (req, res) => {
  try {
    const workflowPath = path.join(workflowsDir, `${req.params.id}.json`);
    const exists = await fs.pathExists(workflowPath);
    
    if (!exists) {
      return res.status(404).json({ error: 'Workflow not found' });
    }
    
    const content = await fs.readFile(workflowPath, 'utf8');
    
    // Check for empty content
    if (!content.trim()) {
      return res.status(500).json({ error: 'Workflow file is empty' });
    }
    
    try {
      const workflow = JSON.parse(content);
      
      // Validate workflow structure
      if (!workflow.id || !workflow.name) {
        return res.status(500).json({ error: 'Invalid workflow structure' });
      }
      
      res.json(workflow);
    } catch (parseError) {
      console.error(`Error parsing workflow ${req.params.id}:`, parseError.message);
      res.status(500).json({ error: 'Invalid JSON in workflow file' });
    }
  } catch (error) {
    console.error('Error reading workflow:', error);
    res.status(500).json({ error: 'Failed to read workflow' });
  }
});

// Create new workflow
app.post('/api/workflows', async (req, res) => {
  try {
    const { name, description, nodes, edges } = req.body;
    const id = uuidv4();
    const now = new Date().toISOString();
    
    const workflow = {
      id,
      name: name || 'New Workflow',
      description: description || '',
      createdAt: now,
      updatedAt: now,
      nodes: nodes || [],
      edges: edges || []
    };
    
    await fs.writeFile(
      path.join(workflowsDir, `${id}.json`),
      JSON.stringify(workflow, null, 2)
    );
    
    res.status(201).json(workflow);
  } catch (error) {
    console.error('Error creating workflow:', error);
    res.status(500).json({ error: 'Failed to create workflow' });
  }
});

// Update workflow
app.put('/api/workflows/:id', async (req, res) => {
  try {
    const workflowPath = path.join(workflowsDir, `${req.params.id}.json`);
    const exists = await fs.pathExists(workflowPath);
    
    if (!exists) {
      return res.status(404).json({ error: 'Workflow not found' });
    }
    
    const existingContent = await fs.readFile(workflowPath, 'utf8');
    const existing = JSON.parse(existingContent);
    
    const updated = {
      ...existing,
      ...req.body,
      id: req.params.id,
      updatedAt: new Date().toISOString()
    };
    
    await fs.writeFile(workflowPath, JSON.stringify(updated, null, 2));
    res.json(updated);
  } catch (error) {
    console.error('Error updating workflow:', error);
    res.status(500).json({ error: 'Failed to update workflow' });
  }
});

// Delete workflow
app.delete('/api/workflows/:id', async (req, res) => {
  try {
    const workflowPath = path.join(workflowsDir, `${req.params.id}.json`);
    const exists = await fs.pathExists(workflowPath);
    
    if (!exists) {
      return res.status(404).json({ error: 'Workflow not found' });
    }
    
    await fs.remove(workflowPath);
    res.json({ message: 'Workflow deleted successfully' });
  } catch (error) {
    console.error('Error deleting workflow:', error);
    res.status(500).json({ error: 'Failed to delete workflow' });
  }
});

// Run workflow
app.post('/api/run/:workflowId', async (req, res) => {
  try {
    const workflowPath = path.join(workflowsDir, `${req.params.workflowId}.json`);
    const exists = await fs.pathExists(workflowPath);
    
    if (!exists) {
      return res.status(404).json({ error: 'Workflow not found' });
    }
    
    const content = await fs.readFile(workflowPath, 'utf8');
    const workflow = JSON.parse(content);
    
    const result = await workflowRunner.runWorkflow(workflow, req.body);
    res.json(result);
  } catch (error) {
    console.error('Error running workflow:', error);
    res.status(500).json({ error: 'Failed to run workflow', details: error.message });
  }
});

// AI-powered workflow update
app.post('/api/prompt-update/:workflowId', async (req, res) => {
  try {
    const { prompt, context } = req.body;
    const workflowPath = path.join(workflowsDir, `${req.params.workflowId}.json`);
    const exists = await fs.pathExists(workflowPath);
    
    if (!exists) {
      return res.status(404).json({ error: 'Workflow not found' });
    }
    
    const content = await fs.readFile(workflowPath, 'utf8');
    const workflow = JSON.parse(content);
    
    const updatedWorkflow = await openaiService.updateWorkflow(prompt, workflow, context);
    
    // Save the updated workflow
    await fs.writeFile(workflowPath, JSON.stringify(updatedWorkflow, null, 2));
    
    res.json(updatedWorkflow);
  } catch (error) {
    console.error('Error updating workflow with AI:', error);
    res.status(500).json({ error: 'Failed to update workflow', details: error.message });
  }
});

// AI Status endpoint
app.get('/api/ai-status', (req, res) => {
  try {
    const isEnabled = process.env.ENABLE_AI_ASSISTANT === 'true';
    const hasApiKey = process.env.OPENAI_API_KEY && 
                     process.env.OPENAI_API_KEY !== 'your_openai_api_key_here' &&
                     process.env.OPENAI_API_KEY.startsWith('sk-');
    
    const status = {
      enabled: isEnabled && hasApiKey,
      mockMode: !isEnabled || !hasApiKey,
      hasApiKey: hasApiKey,
      aiEnabled: isEnabled,
      maxDailyRequests: parseInt(process.env.MAX_DAILY_REQUESTS) || 50,
      maxTokensPerRequest: parseInt(process.env.MAX_TOKENS_PER_REQUEST) || 2000,
      setupInstructions: !hasApiKey ? {
        message: 'To enable real AI, set up your OpenAI API key:',
        steps: [
          '1. Get an API key from https://platform.openai.com/api-keys',
          '2. Create a .env file with OPENAI_API_KEY=sk-your-key-here',
          '3. Set ENABLE_AI_ASSISTANT=true in .env',
          '4. Restart the server'
        ]
      } : null
    };
    
    res.json(status);
  } catch (error) {
    console.error('Error getting AI status:', error);
    res.status(500).json({ error: 'Failed to get AI status' });
  }
});

// Export workflow as JavaScript snippet
app.post('/api/export/:workflowId', async (req, res) => {
  try {
    const workflowPath = path.join(workflowsDir, `${req.params.workflowId}.json`);
    const exists = await fs.pathExists(workflowPath);
    
    if (!exists) {
      return res.status(404).json({ error: 'Workflow not found' });
    }
    
    const content = await fs.readFile(workflowPath, 'utf8');
    const workflow = JSON.parse(content);
    
    const snippet = workflowRunner.generateSnippet(workflow);
    res.json({ snippet });
  } catch (error) {
    console.error('Error exporting workflow:', error);
    res.status(500).json({ error: 'Failed to export workflow' });
  }
});

// Webhook endpoint for trigger nodes
app.post('/webhook/:workflowId', async (req, res) => {
  try {
    const workflowPath = path.join(workflowsDir, `${req.params.workflowId}.json`);
    const exists = await fs.pathExists(workflowPath);
    
    if (!exists) {
      return res.status(404).json({ error: 'Workflow not found' });
    }
    
    const content = await fs.readFile(workflowPath, 'utf8');
    const workflow = JSON.parse(content);
    
    // Trigger the workflow with webhook data
    const result = await workflowRunner.runWorkflow(workflow, {
      webhook: {
        body: req.body,
        headers: req.headers,
        method: req.method,
        url: req.url
      }
    });
    
    res.json({ success: true, result });
  } catch (error) {
    console.error('Error handling webhook:', error);
    res.status(500).json({ error: 'Failed to process webhook' });
  }
});

// Serve React app for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build/index.html'));
});

// For local development
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📁 Workflows directory: ${workflowsDir}`);
  });
}

// Export for Vercel
module.exports = app; 