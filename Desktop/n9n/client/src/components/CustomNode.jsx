import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';
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
  Database,
  Settings
} from 'lucide-react';

const CustomNode = ({ data, selected, type }) => {
  const getIcon = (nodeType) => {
    const iconMap = {
      webhook: <Globe className="h-4 w-4" />,
      httpRequest: <Zap className="h-4 w-4" />,
      slack: <MessageSquare className="h-4 w-4" />,
      email: <Mail className="h-4 w-4" />,
      delay: <Clock className="h-4 w-4" />,
      condition: <GitBranch className="h-4 w-4" />,
      code: <Code className="h-4 w-4" />,
      cron: <Calendar className="h-4 w-4" />,
      notion: <FileText className="h-4 w-4" />,
      airtable: <Database className="h-4 w-4" />
    };
    return iconMap[nodeType] || <Zap className="h-4 w-4" />;
  };

  const getNodeColor = (nodeType) => {
    const colorMap = {
      webhook: 'bg-blue-500',
      httpRequest: 'bg-green-500',
      slack: 'bg-purple-500',
      email: 'bg-red-500',
      delay: 'bg-yellow-500',
      condition: 'bg-orange-500',
      code: 'bg-gray-500',
      cron: 'bg-indigo-500',
      notion: 'bg-pink-500',
      airtable: 'bg-teal-500'
    };
    return colorMap[nodeType] || 'bg-gray-500';
  };

  const getNodeBorder = (nodeType) => {
    const borderMap = {
      webhook: 'border-blue-200',
      httpRequest: 'border-green-200',
      slack: 'border-purple-200',
      email: 'border-red-200',
      delay: 'border-yellow-200',
      condition: 'border-orange-200',
      code: 'border-gray-200',
      cron: 'border-indigo-200',
      notion: 'border-pink-200',
      airtable: 'border-teal-200'
    };
    return borderMap[nodeType] || 'border-gray-200';
  };

  const getNodeBg = (nodeType) => {
    const bgMap = {
      webhook: 'bg-blue-50',
      httpRequest: 'bg-green-50',
      slack: 'bg-purple-50',
      email: 'bg-red-50',
      delay: 'bg-yellow-50',
      condition: 'bg-orange-50',
      code: 'bg-gray-50',
      cron: 'bg-indigo-50',
      notion: 'bg-pink-50',
      airtable: 'bg-teal-50'
    };
    return bgMap[nodeType] || 'bg-gray-50';
  };

  return (
    <div
      className={`
        px-4 py-3 shadow-lg rounded-lg border-2 min-w-[200px]
        ${getNodeBg(type)}
        ${getNodeBorder(type)}
        ${selected ? 'ring-2 ring-blue-500 ring-offset-2' : ''}
      `}
    >
      {/* Input Handle */}
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 bg-gray-400 border-2 border-white"
      />

      {/* Node Content */}
      <div className="flex items-center space-x-3">
        <div className={`p-2 rounded-full ${getNodeColor(type)} text-white`}>
          {getIcon(type)}
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-medium text-gray-900 truncate">
            {data.label || type}
          </h3>
          
          {/* Node-specific preview */}
          <div className="text-xs text-gray-500 mt-1">
            {type === 'webhook' && (
              <span>POST {data.path || '/webhook'}</span>
            )}
            {type === 'httpRequest' && (
              <span>{data.method || 'GET'} {data.url || 'https://...'}</span>
            )}
            {type === 'slack' && (
              <span>#{data.channel || 'general'}</span>
            )}
            {type === 'email' && (
              <span>To: {data.to || 'recipient@example.com'}</span>
            )}
            {type === 'delay' && (
              <span>{data.duration || 1000}ms</span>
            )}
            {type === 'condition' && (
              <span>If: {data.condition || 'condition'}</span>
            )}
            {type === 'code' && (
              <span>Custom JavaScript</span>
            )}
            {type === 'cron' && (
              <span>{data.schedule || '0 9 * * *'}</span>
            )}
            {type === 'notion' && (
              <span>{data.action || 'create'} page</span>
            )}
            {type === 'airtable' && (
              <span>{data.action || 'create'} record</span>
            )}
          </div>
        </div>

        {/* Settings indicator */}
        <div className="flex-shrink-0">
          <Settings className="h-4 w-4 text-gray-400" />
        </div>
      </div>

      {/* Output Handle */}
      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3 bg-gray-400 border-2 border-white"
      />
    </div>
  );
};

export default memo(CustomNode); 