import { create } from 'zustand';
import { shallow } from 'zustand/shallow';

const useWorkflowStore = create((set, get) => ({
  // State
  nodes: [],
  edges: [],
  selectedNode: null,
  selectedEdge: null,
  nodeTypes: [
    {
      type: 'webhook',
      label: 'Webhook',
      category: 'triggers',
      icon: '🌐',
      description: 'Receive HTTP requests',
      defaultData: {
        path: '/webhook',
        method: 'POST'
      }
    },
    {
      type: 'httpRequest',
      label: 'HTTP Request',
      category: 'actions',
      icon: '📡',
      description: 'Make HTTP requests to external APIs',
      defaultData: {
        url: 'https://api.example.com',
        method: 'GET',
        headers: {},
        body: null
      }
    },
    {
      type: 'slack',
      label: 'Slack',
      category: 'integrations',
      icon: '💬',
      description: 'Send messages to Slack',
      defaultData: {
        webhookUrl: '',
        channel: '#general',
        message: 'Hello from N9N!'
      }
    },
    {
      type: 'email',
      label: 'Email',
      category: 'integrations',
      icon: '📧',
      description: 'Send emails',
      defaultData: {
        to: '',
        subject: '',
        body: '',
        from: 'noreply@yourdomain.com'
      }
    },
    {
      type: 'delay',
      label: 'Delay',
      category: 'logic',
      icon: '⏱️',
      description: 'Wait for a specified time',
      defaultData: {
        duration: 1000
      }
    },
    {
      type: 'condition',
      label: 'Condition',
      category: 'logic',
      icon: '🔀',
      description: 'Evaluate conditions and route flow',
      defaultData: {
        condition: 'data.value === true'
      }
    },
    {
      type: 'code',
      label: 'Code',
      category: 'logic',
      icon: '💻',
      description: 'Execute custom JavaScript code',
      defaultData: {
        code: '// Your custom code here\nreturn data;'
      }
    },
    {
      type: 'cron',
      label: 'Cron',
      category: 'triggers',
      icon: '⏰',
      description: 'Scheduled triggers',
      defaultData: {
        schedule: '0 9 * * *' // Every day at 9 AM
      }
    },
    {
      type: 'notion',
      label: 'Notion',
      category: 'integrations',
      icon: '📝',
      description: 'Interact with Notion API',
      defaultData: {
        action: 'create',
        databaseId: '',
        properties: {}
      }
    },
    {
      type: 'airtable',
      label: 'Airtable',
      category: 'integrations',
      icon: '📊',
      description: 'Interact with Airtable API',
      defaultData: {
        action: 'create',
        baseId: '',
        tableName: '',
        records: []
      }
    }
  ],

  // Actions
  setNodes: (nodes) => set((state) => {
    // Only update if nodes actually changed
    if (shallow(state.nodes, nodes)) {
      return state;
    }
    return { nodes };
  }),
  
  setEdges: (edges) => set((state) => {
    // Only update if edges actually changed
    if (shallow(state.edges, edges)) {
      return state;
    }
    return { edges };
  }),
  
  setSelectedNode: (node) => set((state) => {
    // Only update if selected node actually changed
    if (shallow(state.selectedNode, node)) {
      return state;
    }
    return { selectedNode: node };
  }),
  
  setSelectedEdge: (edge) => set((state) => {
    // Only update if selected edge actually changed
    if (shallow(state.selectedEdge, edge)) {
      return state;
    }
    return { selectedEdge: edge };
  }),

  addNode: (nodeType, position) => {
    const { nodes, nodeTypes } = get();
    const typeConfig = nodeTypes.find(t => t.type === nodeType);
    
    if (!typeConfig) {
      console.error('Unknown node type:', nodeType);
      return;
    }

    // Ensure position is valid
    const validPosition = position && typeof position.x === 'number' && typeof position.y === 'number' 
      ? position 
      : { x: 100, y: 100 };

    const newNode = {
      id: `node_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: nodeType,
      position: validPosition,
      data: {
        label: typeConfig.label,
        ...typeConfig.defaultData
      }
    };

    set({ nodes: [...nodes, newNode] });
    return newNode;
  },

  updateNode: (nodeId, updates) => {
    const { nodes } = get();
    const updatedNodes = nodes.map(node =>
      node.id === nodeId ? { ...node, ...updates } : node
    );
    set({ nodes: updatedNodes });
  },

  deleteNode: (nodeId) => {
    const { nodes, edges } = get();
    
    // Remove the node
    const updatedNodes = nodes.filter(node => node.id !== nodeId);
    
    // Remove connected edges
    const updatedEdges = edges.filter(
      edge => edge.source !== nodeId && edge.target !== nodeId
    );
    
    set({ nodes: updatedNodes, edges: updatedEdges });
  },

  addEdge: (source, target, condition = null) => {
    const { edges } = get();
    const newEdge = {
      id: `edge_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      source,
      target,
      condition
    };
    
    set({ edges: [...edges, newEdge] });
    return newEdge;
  },

  updateEdge: (edgeId, updates) => {
    const { edges } = get();
    const updatedEdges = edges.map(edge =>
      edge.id === edgeId ? { ...edge, ...updates } : edge
    );
    set({ edges: updatedEdges });
  },

  deleteEdge: (edgeId) => {
    const { edges } = get();
    const updatedEdges = edges.filter(edge => edge.id !== edgeId);
    set({ edges: updatedEdges });
  },

  clearSelection: () => set({ selectedNode: null, selectedEdge: null }),

  // Computed values
  getNodeById: (nodeId) => {
    const { nodes } = get();
    return nodes.find(node => node.id === nodeId);
  },

  getConnectedNodes: (nodeId) => {
    const { nodes, edges } = get();
    const connectedEdges = edges.filter(
      edge => edge.source === nodeId || edge.target === nodeId
    );
    
    const connectedNodeIds = new Set();
    connectedEdges.forEach(edge => {
      connectedNodeIds.add(edge.source);
      connectedNodeIds.add(edge.target);
    });
    
    return nodes.filter(node => connectedNodeIds.has(node.id));
  },

  getNodeTypeConfig: (nodeType) => {
    const { nodeTypes } = get();
    return nodeTypes.find(t => t.type === nodeType);
  },

  // Validation
  validateWorkflow: () => {
    const { nodes, edges } = get();
    const errors = [];

    // Check for orphaned nodes
    const connectedNodeIds = new Set();
    edges.forEach(edge => {
      connectedNodeIds.add(edge.source);
      connectedNodeIds.add(edge.target);
    });

    nodes.forEach(node => {
      if (!connectedNodeIds.has(node.id)) {
        errors.push(`Node "${node.data?.label || node.id}" is not connected`);
      }
    });

    // Check for cycles (simplified)
    const visited = new Set();
    const recursionStack = new Set();

    const hasCycle = (nodeId) => {
      if (recursionStack.has(nodeId)) return true;
      if (visited.has(nodeId)) return false;

      visited.add(nodeId);
      recursionStack.add(nodeId);

      const outgoingEdges = edges.filter(edge => edge.source === nodeId);
      for (const edge of outgoingEdges) {
        if (hasCycle(edge.target)) return true;
      }

      recursionStack.delete(nodeId);
      return false;
    };

    for (const node of nodes) {
      if (!visited.has(node.id) && hasCycle(node.id)) {
        errors.push('Workflow contains cycles');
        break;
      }
    }

    return errors;
  },

  // Export/Import
  exportWorkflow: () => {
    const { nodes, edges } = get();
    return { nodes, edges };
  },

  importWorkflow: (workflow) => {
    const { nodes, edges } = workflow;
    set({ nodes: nodes || [], edges: edges || [] });
  },

  // Reset
  reset: () => set({
    nodes: [],
    edges: [],
    selectedNode: null,
    selectedEdge: null
  })
}));

export default useWorkflowStore; 