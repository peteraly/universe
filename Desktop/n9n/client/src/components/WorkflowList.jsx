import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Play, 
  Edit, 
  Trash2, 
  Bot,
  Clock,
  FileText,
  Copy
} from 'lucide-react';

const WorkflowList = ({ 
  workflows, 
  currentWorkflow, 
  onCreateWorkflow, 
  onLoadWorkflow, 
  onDeleteWorkflow,
  onRunWorkflow
}) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredWorkflows = workflows.filter(workflow =>
    workflow.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    workflow.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleEditWorkflow = (workflow) => {
    onLoadWorkflow(workflow.id);
    navigate('/editor');
  };

  const handleCreateNew = () => {
    onCreateWorkflow();
    navigate('/editor');
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Workflows</h1>
            <p className="mt-2 text-gray-600">
              Create and manage your automation workflows
            </p>
          </div>
          
          <button
            onClick={handleCreateNew}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Plus className="h-5 w-5 mr-2" />
            New Workflow
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Search workflows..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Workflows Grid */}
      {filteredWorkflows.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No workflows</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm ? 'No workflows match your search.' : 'Get started by creating a new workflow.'}
          </p>
          {!searchTerm && (
            <div className="mt-6">
              <button
                onClick={handleCreateNew}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Plus className="h-5 w-5 mr-2" />
                Create Workflow
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredWorkflows.map((workflow) => (
            <div
              key={workflow.id}
              className={`
                bg-white rounded-lg shadow-sm border-2 p-6 hover:shadow-md transition-shadow cursor-pointer
                ${currentWorkflow?.id === workflow.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}
              `}
            >
              {/* Workflow Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-gray-900 truncate">
                    {workflow.name}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                    {workflow.description || 'No description'}
                  </p>
                </div>
                
                <div className="flex items-center space-x-2 ml-4">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    {workflow.nodes?.length || 0} nodes
                  </span>
                </div>
              </div>

              {/* Workflow Stats */}
              <div className="flex items-center text-sm text-gray-500 mb-4">
                <Clock className="h-4 w-4 mr-1" />
                <span>Updated {formatDate(workflow.updatedAt)}</span>
              </div>

              {/* Workflow Actions */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditWorkflow(workflow);
                    }}
                    className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <Edit className="h-3 w-3 mr-1" />
                    Edit
                  </button>
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRunWorkflow(workflow.id);
                    }}
                    disabled={!workflow.nodes || workflow.nodes.length === 0}
                    className={`
                      inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded focus:outline-none focus:ring-2 focus:ring-offset-2
                      ${!workflow.nodes || workflow.nodes.length === 0 
                        ? 'text-gray-400 bg-gray-100 cursor-not-allowed' 
                        : 'text-white bg-green-600 hover:bg-green-700 focus:ring-green-500'
                      }
                    `}
                    title={!workflow.nodes || workflow.nodes.length === 0 ? 'Add nodes to run this workflow' : 'Run workflow'}
                  >
                    <Play className="h-3 w-3 mr-1" />
                    Run
                  </button>
                </div>
                
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteWorkflow(workflow.id);
                  }}
                  className="inline-flex items-center p-1.5 border border-transparent text-xs font-medium rounded text-red-600 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Quick Actions */}
      {workflows.length > 0 && (
        <div className="mt-8 p-6 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={handleCreateNew}
              className="flex items-center p-4 bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-sm transition-all"
            >
              <Plus className="h-6 w-6 text-blue-600 mr-3" />
              <div className="text-left">
                <div className="font-medium text-gray-900">Create New</div>
                <div className="text-sm text-gray-500">Start from scratch</div>
              </div>
            </button>
            
            <button
              onClick={() => {
                // Handle import workflow
                console.log('Import workflow');
              }}
              className="flex items-center p-4 bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-sm transition-all"
            >
              <Copy className="h-6 w-6 text-green-600 mr-3" />
              <div className="text-left">
                <div className="font-medium text-gray-900">Import</div>
                <div className="text-sm text-gray-500">From JSON or template</div>
              </div>
            </button>
            
            <button
              onClick={() => {
                // Handle view templates
                console.log('View templates');
              }}
              className="flex items-center p-4 bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-sm transition-all"
            >
              <FileText className="h-6 w-6 text-purple-600 mr-3" />
              <div className="text-left">
                <div className="font-medium text-gray-900">Templates</div>
                <div className="text-sm text-gray-500">Browse pre-built workflows</div>
              </div>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkflowList; 