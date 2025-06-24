import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import { 
  Play, 
  Save, 
  Download, 
  Bot
} from 'lucide-react';

import WorkflowEditor from './components/WorkflowEditor';
import WorkflowList from './components/WorkflowList';
import AIPromptModal from './components/AIPromptModal';
import NodeConfigModal from './components/NodeConfigModal';
import ExportModal from './components/ExportModal';
import useWorkflowStore from './stores/workflowStore';

// Configure axios base URL
axios.defaults.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

function App() {
  const [workflows, setWorkflows] = useState([]);
  const [currentWorkflow, setCurrentWorkflow] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showAIModal, setShowAIModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  
  const { 
    nodes, 
    edges, 
    setNodes, 
    setEdges, 
    selectedNode,
    setSelectedNode 
  } = useWorkflowStore();

  useEffect(() => {
    loadWorkflows();
  }, []);

  const loadWorkflows = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get('/api/workflows');
      setWorkflows(response.data);
    } catch (error) {
      console.error('Failed to load workflows:', error);
      toast.error('Failed to load workflows');
    } finally {
      setIsLoading(false);
    }
  };

  const createWorkflow = async () => {
    try {
      const response = await axios.post('/api/workflows', {
        name: 'New Workflow',
        description: 'A new automation workflow',
        nodes: [],
        edges: []
      });
      
      setWorkflows([...workflows, response.data]);
      setCurrentWorkflow(response.data);
      setNodes([]);
      setEdges([]);
      
      toast.success('New workflow created');
    } catch (error) {
      console.error('Failed to create workflow:', error);
      toast.error('Failed to create workflow');
    }
  };

  const saveWorkflow = async () => {
    if (!currentWorkflow) {
      toast.error('No workflow selected');
      return;
    }

    try {
      const updatedWorkflow = {
        ...currentWorkflow,
        nodes,
        edges
      };

      const response = await axios.put(`/api/workflows/${currentWorkflow.id}`, updatedWorkflow);
      
      setCurrentWorkflow(response.data);
      setWorkflows(workflows.map(w => 
        w.id === currentWorkflow.id ? response.data : w
      ));
      
      toast.success('Workflow saved');
    } catch (error) {
      console.error('Failed to save workflow:', error);
      toast.error('Failed to save workflow');
    }
  };

  const deleteWorkflow = async (workflowId) => {
    if (!window.confirm('Are you sure you want to delete this workflow?')) {
      return;
    }

    try {
      await axios.delete(`/api/workflows/${workflowId}`);
      
      setWorkflows(workflows.filter(w => w.id !== workflowId));
      
      if (currentWorkflow?.id === workflowId) {
        setCurrentWorkflow(null);
        setNodes([]);
        setEdges([]);
      }
      
      toast.success('Workflow deleted');
    } catch (error) {
      console.error('Failed to delete workflow:', error);
      toast.error('Failed to delete workflow');
    }
  };

  const loadWorkflow = async (workflowId) => {
    try {
      const response = await axios.get(`/api/workflows/${workflowId}`);
      const workflow = response.data;
      
      setCurrentWorkflow(workflow);
      setNodes(workflow.nodes || []);
      setEdges(workflow.edges || []);
      
      toast.success(`Loaded workflow: ${workflow.name}`);
    } catch (error) {
      console.error('Failed to load workflow:', error);
      toast.error('Failed to load workflow');
    }
  };

  const runWorkflow = async () => {
    if (!currentWorkflow) {
      toast.error('No workflow selected');
      return;
    }

    // Check if workflow has nodes
    if (!nodes || nodes.length === 0) {
      toast.error('Cannot run empty workflow. Please add nodes first.');
      return;
    }

    try {
      setIsRunning(true);
      
      // Provide better test data based on workflow type
      const testData = {
        message: 'Test execution from frontend',
        email: 'test@example.com',
        userId: 'test123',
        timestamp: new Date().toISOString(),
        // Add webhook-like structure for workflows expecting webhook data
        webhook: {
          body: {
            email: 'test@example.com',
            userId: 'test123',
            message: 'Test webhook data'
          },
          headers: {
            'content-type': 'application/json'
          },
          method: 'POST'
        }
      };
      
      const response = await axios.post(`/api/run/${currentWorkflow.id}`, testData);
      
      if (response.data.success) {
        toast.success('Workflow executed successfully');
        console.log('Execution results:', response.data.results);
      } else {
        toast.error('Workflow execution failed');
        console.error('Execution errors:', response.data.errors);
      }
    } catch (error) {
      console.error('Failed to run workflow:', error);
      toast.error('Failed to run workflow');
    } finally {
      setIsRunning(false);
    }
  };

  const runWorkflowFromList = async (workflowId) => {
    try {
      // Find the workflow to check if it has nodes
      const workflow = workflows.find(w => w.id === workflowId);
      if (!workflow) {
        toast.error('Workflow not found');
        return;
      }

      // Check if workflow has nodes
      if (!workflow.nodes || workflow.nodes.length === 0) {
        toast.error('Cannot run empty workflow. Please add nodes first.');
        return;
      }

      setIsRunning(true);
      
      // Provide better test data based on workflow type
      const testData = {
        message: 'Test execution from list',
        email: 'test@example.com',
        userId: 'test123',
        timestamp: new Date().toISOString(),
        // Add webhook-like structure for workflows expecting webhook data
        webhook: {
          body: {
            email: 'test@example.com',
            userId: 'test123',
            message: 'Test webhook data'
          },
          headers: {
            'content-type': 'application/json'
          },
          method: 'POST'
        }
      };
      
      const response = await axios.post(`/api/run/${workflowId}`, testData);
      
      if (response.data.success) {
        toast.success('Workflow executed successfully');
        console.log('Execution results:', response.data.results);
      } else {
        toast.error('Workflow execution failed');
        console.error('Execution errors:', response.data.errors);
      }
    } catch (error) {
      console.error('Failed to run workflow:', error);
      toast.error('Failed to run workflow');
    } finally {
      setIsRunning(false);
    }
  };

  const handleAIUpdate = async (prompt, context) => {
    if (!currentWorkflow) {
      toast.error('No workflow selected');
      return;
    }

    try {
      const response = await axios.post(`/api/prompt-update/${currentWorkflow.id}`, {
        prompt,
        context
      });
      
      const updatedWorkflow = response.data;
      setCurrentWorkflow(updatedWorkflow);
      setNodes(updatedWorkflow.nodes || []);
      setEdges(updatedWorkflow.edges || []);
      setWorkflows(workflows.map(w => 
        w.id === currentWorkflow.id ? updatedWorkflow : w
      ));
      
      toast.success('Workflow updated with AI');
    } catch (error) {
      console.error('Failed to update workflow with AI:', error);
      toast.error('Failed to update workflow');
    }
  };

  const exportWorkflow = async () => {
    if (!currentWorkflow) {
      toast.error('No workflow selected');
      return;
    }

    try {
      const response = await axios.post(`/api/export/${currentWorkflow.id}`);
      setShowExportModal(true);
      return response.data.snippet;
    } catch (error) {
      console.error('Failed to export workflow:', error);
      toast.error('Failed to export workflow');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading workflows...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Toaster position="top-right" />
        
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <h1 className="text-xl font-semibold text-gray-900">
                  N9N Automation Platform
                </h1>
              </div>
              
              <div className="flex items-center space-x-4">
                {currentWorkflow && (
                  <>
                    <button
                      onClick={() => setShowAIModal(true)}
                      className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                    >
                      <Bot className="h-4 w-4 mr-2" />
                      AI Assistant
                    </button>
                    
                    <button
                      onClick={runWorkflow}
                      disabled={isRunning}
                      className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                    >
                      <Play className="h-4 w-4 mr-2" />
                      {isRunning ? 'Running...' : 'Run'}
                    </button>
                    
                    <button
                      onClick={saveWorkflow}
                      className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Save
                    </button>
                    
                    <button
                      onClick={exportWorkflow}
                      className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Routes>
            <Route 
              path="/" 
              element={
                <WorkflowList
                  workflows={workflows}
                  currentWorkflow={currentWorkflow}
                  onCreateWorkflow={createWorkflow}
                  onLoadWorkflow={loadWorkflow}
                  onDeleteWorkflow={deleteWorkflow}
                  onRunWorkflow={runWorkflowFromList}
                />
              } 
            />
            <Route 
              path="/editor" 
              element={
                currentWorkflow ? (
                  <WorkflowEditor 
                    onRun={runWorkflow}
                    onSave={saveWorkflow}
                  />
                ) : (
                  <Navigate to="/" replace />
                )
              } 
            />
          </Routes>
        </main>

        {/* Modals */}
        {showAIModal && (
          <AIPromptModal
            isOpen={showAIModal}
            onClose={() => setShowAIModal(false)}
            onSubmit={handleAIUpdate}
            workflow={currentWorkflow}
          />
        )}

        {selectedNode && (
          <NodeConfigModal
            isOpen={!!selectedNode}
            onClose={() => setSelectedNode(null)}
            node={selectedNode}
          />
        )}

        {showExportModal && (
          <ExportModal
            isOpen={showExportModal}
            onClose={() => setShowExportModal(false)}
            workflow={currentWorkflow}
          />
        )}
      </div>
    </Router>
  );
}

export default App; 