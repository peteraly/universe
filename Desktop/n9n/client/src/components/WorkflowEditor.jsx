import React, { useCallback, useRef, useState, useEffect } from 'react';
import ReactFlow, {
  addEdge,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  MiniMap,
  Panel
} from 'reactflow';
import 'reactflow/dist/style.css';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  ArrowLeft,
  Play,
  Save
} from 'lucide-react';

import useWorkflowStore from '../stores/workflowStore';
import NodeSidebar from './NodeSidebar';
import { nodeTypes } from '../utils/nodeTypes';

const WorkflowEditor = ({ onRun, onSave }) => {
  const navigate = useNavigate();
  const reactFlowWrapper = useRef(null);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);
  const [showSidebar, setShowSidebar] = useState(true);
  
  const {
    nodes: storeNodes,
    edges: storeEdges,
    setNodes: setStoreNodes,
    setEdges: setStoreEdges,
    addNode,
    addEdge: addEdgeToStore,
    deleteNode,
    deleteEdge,
    setSelectedNode,
    clearSelection
  } = useWorkflowStore();

  // Use React Flow's built-in state management
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  // Initialize React Flow state from store (only once)
  useEffect(() => {
    if (storeNodes && storeNodes.length > 0) {
      // Ensure all nodes have proper position data
      const validatedNodes = storeNodes.map(node => ({
        ...node,
        position: node.position || { x: 0, y: 0 },
        data: node.data || { label: node.type || 'Unknown' }
      }));
      setNodes(validatedNodes);
    }
  }, [storeNodes, setNodes]);

  useEffect(() => {
    if (storeEdges && storeEdges.length > 0) {
      setEdges(storeEdges);
    }
  }, [storeEdges, setEdges]);

  // Sync React Flow state back to store only when nodes/edges actually change
  const syncToStore = useCallback(() => {
    if (nodes.length > 0) {
      setStoreNodes(nodes);
    }
  }, [nodes, setStoreNodes]);

  const syncEdgesToStore = useCallback(() => {
    if (edges.length > 0) {
      setStoreEdges(edges);
    }
  }, [edges, setStoreEdges]);

  // Debounced sync to prevent excessive updates
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      syncToStore();
    }, 100);
    return () => clearTimeout(timeoutId);
  }, [syncToStore]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      syncEdgesToStore();
    }, 100);
    return () => clearTimeout(timeoutId);
  }, [syncEdgesToStore]);

  const onConnect = useCallback(
    (params) => {
      setEdges((eds) => addEdge(params, eds));
      addEdgeToStore(params.source, params.target);
    },
    [setEdges, addEdgeToStore]
  );

  const onNodesDelete = useCallback(
    (deleted) => {
      deleted.forEach(node => deleteNode(node.id));
    },
    [deleteNode]
  );

  const onEdgesDelete = useCallback(
    (deleted) => {
      deleted.forEach(edge => deleteEdge(edge.id));
    },
    [deleteEdge]
  );

  const onNodeClick = useCallback(
    (event, node) => {
      setSelectedNode(node);
    },
    [setSelectedNode]
  );

  const onPaneClick = useCallback(() => {
    clearSelection();
  }, [clearSelection]);

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();

      const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
      const type = event.dataTransfer.getData('application/reactflow');
      const position = reactFlowInstance.project({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      });

      addNode(type, position);
    },
    [reactFlowInstance, addNode]
  );

  const onInit = useCallback((instance) => {
    setReactFlowInstance(instance);
  }, []);

  const onNodeDragStop = useCallback((event, node) => {
    // Update node position in React Flow state only
    // Store will be updated via the debounced sync
    const updatedNodes = nodes.map(n => 
      n.id === node.id ? { ...n, position: node.position } : n
    );
    setNodes(updatedNodes);
  }, [nodes, setNodes]);

  const handleRun = () => {
    onRun();
  };

  const handleSave = () => {
    onSave();
  };

  return (
    <div className="h-screen flex">
      {/* Node Sidebar */}
      {showSidebar && (
        <NodeSidebar />
      )}
      
      {/* Main Editor */}
      <div className="flex-1 flex flex-col">
        {/* Toolbar */}
        <div className="bg-white border-b px-4 py-2 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/')}
              className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Workflows
            </button>
            
            <button
              onClick={() => setShowSidebar(!showSidebar)}
              className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Plus className="h-4 w-4 mr-2" />
              {showSidebar ? 'Hide' : 'Show'} Nodes
            </button>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={handleRun}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              <Play className="h-4 w-4 mr-2" />
              Run
            </button>
            
            <button
              onClick={handleSave}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Save className="h-4 w-4 mr-2" />
              Save
            </button>
          </div>
        </div>
        
        {/* React Flow Canvas */}
        <div className="flex-1" ref={reactFlowWrapper}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodesDelete={onNodesDelete}
            onEdgesDelete={onEdgesDelete}
            onNodeClick={onNodeClick}
            onPaneClick={onPaneClick}
            onDragOver={onDragOver}
            onDrop={onDrop}
            onInit={onInit}
            onNodeDragStop={onNodeDragStop}
            nodeTypes={nodeTypes}
            fitView
            attributionPosition="bottom-left"
          >
            <Controls />
            <Background />
            <MiniMap />
            
            {/* Status Panel */}
            <Panel position="top-right" className="bg-white rounded-lg shadow-lg p-4">
              <div className="text-sm text-gray-600">
                <div>Nodes: {nodes.length}</div>
                <div>Edges: {edges.length}</div>
              </div>
            </Panel>
          </ReactFlow>
        </div>
      </div>
    </div>
  );
};

export default WorkflowEditor; 