import React from 'react';
import { 
  Zap, 
  Globe, 
  MessageSquare, 
  Mail, 
  Clock, 
  GitBranch, 
  Code, 
  Calendar,
  FileText,
  Database
} from 'lucide-react';

import useWorkflowStore from '../stores/workflowStore';

const NodeSidebar = () => {
  const { nodeTypes } = useWorkflowStore();

  const onDragStart = (event, nodeType) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  const getIcon = (type) => {
    const iconMap = {
      webhook: <Globe className="h-5 w-5" />,
      httpRequest: <Zap className="h-5 w-5" />,
      slack: <MessageSquare className="h-5 w-5" />,
      email: <Mail className="h-5 w-5" />,
      delay: <Clock className="h-5 w-5" />,
      condition: <GitBranch className="h-5 w-5" />,
      code: <Code className="h-5 w-5" />,
      cron: <Calendar className="h-5 w-5" />,
      notion: <FileText className="h-5 w-5" />,
      airtable: <Database className="h-5 w-5" />
    };
    return iconMap[type] || <Zap className="h-5 w-5" />;
  };

  const getCategoryColor = (category) => {
    const colorMap = {
      triggers: 'bg-blue-50 border-blue-200 text-blue-700',
      actions: 'bg-green-50 border-green-200 text-green-700',
      integrations: 'bg-purple-50 border-purple-200 text-purple-700',
      logic: 'bg-orange-50 border-orange-200 text-orange-700'
    };
    return colorMap[category] || 'bg-gray-50 border-gray-200 text-gray-700';
  };

  const groupedNodes = nodeTypes.reduce((acc, nodeType) => {
    if (!acc[nodeType.category]) {
      acc[nodeType.category] = [];
    }
    acc[nodeType.category].push(nodeType);
    return acc;
  }, {});

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Node Types</h2>
        <p className="text-sm text-gray-500 mt-1">
          Drag nodes to the canvas
        </p>
      </div>

      {/* Node Categories */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {Object.entries(groupedNodes).map(([category, nodes]) => (
          <div key={category}>
            <h3 className="text-sm font-medium text-gray-900 mb-3 capitalize">
              {category}
            </h3>
            <div className="space-y-2">
              {nodes.map((nodeType) => (
                <div
                  key={nodeType.type}
                  className={`
                    p-3 border rounded-lg cursor-move hover:shadow-md transition-shadow
                    ${getCategoryColor(nodeType.category)}
                  `}
                  draggable
                  onDragStart={(event) => onDragStart(event, nodeType.type)}
                >
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      {getIcon(nodeType.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {nodeType.label}
                      </p>
                      <p className="text-xs opacity-75 truncate">
                        {nodeType.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="text-xs text-gray-500">
          <p>💡 Tip: Connect nodes by dragging from output to input</p>
          <p className="mt-1">🔧 Double-click nodes to configure</p>
        </div>
      </div>
    </div>
  );
};

export default NodeSidebar; 