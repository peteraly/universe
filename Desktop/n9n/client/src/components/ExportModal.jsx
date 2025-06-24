import React, { useState, useEffect, useCallback } from 'react';
import { X, Copy, Download, Code, Globe, Check } from 'lucide-react';
import axios from 'axios';

const ExportModal = ({ isOpen, onClose, workflow }) => {
  const [snippet, setSnippet] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [exportType, setExportType] = useState('snippet');

  const generateFallbackSnippet = useCallback(() => {
    if (!workflow) return '';

    const { nodes, edges } = workflow;
    
    return `
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
            case 'webhook':
              results[node.id] = { type: 'webhook', data: inputData };
              break;
            case 'httpRequest':
              results[node.id] = { type: 'httpRequest', data: { url: node.data.url } };
              break;
            case 'slack':
              results[node.id] = { type: 'slack', data: { message: node.data.message } };
              break;
            case 'email':
              results[node.id] = { type: 'email', data: { to: node.data.to } };
              break;
            case 'code':
              results[node.id] = { type: 'code', data: { executed: true } };
              break;
            default:
              results[node.id] = { type: node.type, data: node.data };
          }
        } catch (error) {
          errors.push({ nodeId: node.id, error: error.message });
        }
      }
      
      return { results, errors };
    } catch (error) {
      console.error('Workflow execution failed:', error);
      return { results: {}, errors: [{ error: error.message }] };
    }
  }
  
  // Export the execution function
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { workflow, executeWorkflow };
  } else if (typeof window !== 'undefined') {
    window.n9nWorkflow = { workflow, executeWorkflow };
  }
})();
    `.trim();
  }, [workflow]);

  const generateSnippet = useCallback(async () => {
    if (!workflow) return;

    setIsLoading(true);
    try {
      const response = await axios.post(`/api/export/${workflow.id}`);
      setSnippet(response.data.snippet);
    } catch (error) {
      console.error('Failed to generate snippet:', error);
      // Fallback to client-side generation
      setSnippet(generateFallbackSnippet());
    } finally {
      setIsLoading(false);
    }
  }, [workflow, generateFallbackSnippet]);

  useEffect(() => {
    if (isOpen && workflow) {
      generateSnippet();
    }
  }, [isOpen, workflow, generateSnippet]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(snippet);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([snippet], { type: 'text/javascript' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${workflow?.name || 'workflow'}.js`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getEmbedCode = () => {
    return `<script src="https://your-domain.com/workflows/${workflow?.id}.js"></script>`;
  };

  const getUsageExample = () => {
    return `
// Example usage:
n9nWorkflow.execute({
  user: { name: 'John', email: 'john@example.com' },
  timestamp: new Date().toISOString()
}).then(result => {
  console.log('Workflow result:', result);
});
    `.trim();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <Code className="h-6 w-6 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Export Workflow</h2>
              <p className="text-sm text-gray-500">Generate embeddable JavaScript code</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {/* Export Type Selector */}
          <div className="mb-6">
            <div className="flex space-x-4">
              <button
                onClick={() => setExportType('snippet')}
                className={`px-4 py-2 rounded-md font-medium ${
                  exportType === 'snippet'
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                JavaScript Snippet
              </button>
              <button
                onClick={() => setExportType('embed')}
                className={`px-4 py-2 rounded-md font-medium ${
                  exportType === 'embed'
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Embed Code
              </button>
              <button
                onClick={() => setExportType('usage')}
                className={`px-4 py-2 rounded-md font-medium ${
                  exportType === 'usage'
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Usage Example
              </button>
            </div>
          </div>

          {/* Export Content */}
          <div className="space-y-6">
            {exportType === 'snippet' && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-medium text-gray-900">JavaScript Snippet</h3>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={handleDownload}
                      className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <Download className="h-4 w-4 mr-1" />
                      Download
                    </button>
                    <button
                      onClick={handleCopy}
                      className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      {copied ? (
                        <>
                          <Check className="h-4 w-4 mr-1 text-green-600" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4 mr-1" />
                          Copy
                        </>
                      )}
                    </button>
                  </div>
                </div>
                
                {isLoading ? (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
                    <p className="mt-2 text-gray-600">Generating snippet...</p>
                  </div>
                ) : (
                  <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm">
                    <code>{snippet}</code>
                  </pre>
                )}
              </div>
            )}

            {exportType === 'embed' && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Embed Code</h3>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-3">
                    Add this code to your HTML to embed the workflow:
                  </p>
                  <pre className="bg-white border border-gray-200 p-3 rounded text-sm overflow-x-auto">
                    <code>{getEmbedCode()}</code>
                  </pre>
                </div>
              </div>
            )}

            {exportType === 'usage' && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Usage Example</h3>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-3">
                    After embedding the workflow, you can execute it like this:
                  </p>
                  <pre className="bg-white border border-gray-200 p-3 rounded text-sm overflow-x-auto">
                    <code>{getUsageExample()}</code>
                  </pre>
                </div>
              </div>
            )}
          </div>

          {/* Instructions */}
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-sm font-medium text-blue-900 mb-2 flex items-center">
              <Globe className="h-4 w-4 mr-2" />
              Deployment Instructions
            </h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Copy the JavaScript snippet to your website</li>
              <li>• The workflow will be available as <code>window.n9nWorkflow</code></li>
              <li>• Call <code>n9nWorkflow.execute(data)</code> to run the workflow</li>
              <li>• Make sure your server allows CORS if making external requests</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExportModal; 