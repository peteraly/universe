// Context: V12.0 Seed Fixtures - Demo Seed Data
// This module provides comprehensive seed data for the Discovery Dial
// Mission Control system, including events, agents, and system configurations.

const seedData = {
  // Sample Events for Discovery Dial
  events: [
    {
      id: 'evt-seed-001',
      name: 'Tech Innovation Summit 2024',
      description: 'A comprehensive summit featuring the latest in AI, blockchain, and emerging technologies. Join industry leaders for keynotes, workshops, and networking.',
      date: '2024-03-15',
      time: '09:00',
      venue: 'San Francisco Convention Center',
      address: '747 Howard St, San Francisco, CA 94103',
      category: 'Tech',
      tags: ['AI', 'blockchain', 'networking', 'workshop'],
      status: 'live',
      qualityScore: 95,
      createdAt: '2024-01-15T10:00:00Z',
      updatedAt: '2024-01-15T10:00:00Z'
    },
    {
      id: 'evt-seed-002',
      name: 'Art Gallery Opening: Digital Futures',
      description: 'Experience the intersection of art and technology in this groundbreaking exhibition featuring digital artists from around the world.',
      date: '2024-03-22',
      time: '18:00',
      venue: 'Modern Art Museum',
      address: '151 3rd St, San Francisco, CA 94103',
      category: 'Art',
      tags: ['digital art', 'technology', 'exhibition', 'culture'],
      status: 'live',
      qualityScore: 88,
      createdAt: '2024-01-20T14:30:00Z',
      updatedAt: '2024-01-20T14:30:00Z'
    },
    {
      id: 'evt-seed-003',
      name: 'Community Garden Workshop',
      description: 'Learn sustainable gardening practices and connect with your local community. Perfect for beginners and experienced gardeners alike.',
      date: '2024-03-30',
      time: '10:00',
      venue: 'Golden Gate Park',
      address: 'Golden Gate Park, San Francisco, CA',
      category: 'Community',
      tags: ['sustainability', 'gardening', 'community', 'education'],
      status: 'live',
      qualityScore: 92,
      createdAt: '2024-01-25T09:15:00Z',
      updatedAt: '2024-01-25T09:15:00Z'
    },
    {
      id: 'evt-seed-004',
      name: 'Jazz Night at The Blue Note',
      description: 'An intimate evening of live jazz featuring local musicians and special guests. Dinner and drinks available.',
      date: '2024-04-05',
      time: '20:00',
      venue: 'The Blue Note',
      address: '1317 Fillmore St, San Francisco, CA 94115',
      category: 'Music',
      tags: ['jazz', 'live music', 'dinner', 'entertainment'],
      status: 'live',
      qualityScore: 85,
      createdAt: '2024-02-01T16:45:00Z',
      updatedAt: '2024-02-01T16:45:00Z'
    },
    {
      id: 'evt-seed-005',
      name: 'Startup Pitch Competition',
      description: 'Watch innovative startups pitch their ideas to a panel of investors. Great opportunity for networking and learning about emerging businesses.',
      date: '2024-04-12',
      time: '14:00',
      venue: 'WeWork Market Street',
      address: '1 Market St, San Francisco, CA 94105',
      category: 'Tech',
      tags: ['startup', 'pitching', 'investment', 'networking'],
      status: 'live',
      qualityScore: 90,
      createdAt: '2024-02-05T11:20:00Z',
      updatedAt: '2024-02-05T11:20:00Z'
    }
  ],

  // Sample Agents for Agent Console
  agents: [
    {
      id: 'agent-seed-001',
      name: 'Event Curator AI',
      type: 'curation',
      status: 'active',
      capabilities: ['event_classification', 'quality_assessment', 'content_moderation'],
      performance: {
        eventsProcessed: 1247,
        accuracy: 94.2,
        responseTime: 1.2
      },
      lastHeartbeat: '2024-01-15T10:30:00Z',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-15T10:30:00Z'
    },
    {
      id: 'agent-seed-002',
      name: 'Content Moderator',
      type: 'moderation',
      status: 'active',
      capabilities: ['spam_detection', 'content_filtering', 'safety_checks'],
      performance: {
        eventsProcessed: 892,
        accuracy: 97.8,
        responseTime: 0.8
      },
      lastHeartbeat: '2024-01-15T10:29:45Z',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-15T10:29:45Z'
    },
    {
      id: 'agent-seed-003',
      name: 'Recommendation Engine',
      type: 'recommendation',
      status: 'active',
      capabilities: ['user_preferences', 'event_matching', 'personalization'],
      performance: {
        eventsProcessed: 2156,
        accuracy: 89.5,
        responseTime: 2.1
      },
      lastHeartbeat: '2024-01-15T10:28:30Z',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-15T10:28:30Z'
    }
  ],

  // Sample System Health Data
  systemHealth: {
    overallStatus: 'healthy',
    uptime: 86400, // 24 hours in seconds
    memoryUsage: {
      used: 512,
      total: 1024
    },
    cpuUsage: 45,
    components: {
      eventCurationEngine: 'healthy',
      eventAPI: 'healthy',
      database: 'healthy',
      llmService: 'healthy',
      vectorStore: 'healthy'
    },
    metrics: {
      responseTime: 120,
      throughput: 850,
      errorRate: 0.2,
      activeConnections: 156
    },
    issues: [],
    lastCheck: '2024-01-15T10:30:00Z'
  },

  // Sample Governance Data
  governance: {
    policies: [
      {
        id: 'policy-001',
        name: 'Event Quality Standards',
        description: 'Minimum quality requirements for event submissions',
        status: 'active',
        createdAt: '2024-01-01T00:00:00Z'
      },
      {
        id: 'policy-002',
        name: 'Content Moderation Guidelines',
        description: 'Guidelines for content moderation and safety',
        status: 'active',
        createdAt: '2024-01-01T00:00:00Z'
      }
    ],
    decisions: [
      {
        id: 'decision-001',
        title: 'Approved AI Classification System',
        description: 'Decision to implement AI-powered event classification',
        status: 'approved',
        createdAt: '2024-01-10T14:00:00Z'
      }
    ],
    metrics: {
      totalPolicies: 2,
      activePolicies: 2,
      totalDecisions: 1,
      pendingDecisions: 0
    }
  },

  // Sample Recovery Data
  recovery: {
    systemState: {
      current: 'stable',
      previous: 'stable',
      lastStableBuild: 'v1.2.3',
      freezeMode: false,
      rollbackInProgress: false
    },
    activeIncidents: 0,
    recoveryMetrics: {
      totalIncidents: 3,
      resolvedIncidents: 3,
      successRate: 100
    }
  },

  // Sample Configuration Data
  configuration: {
    environment: 'production',
    apiBaseUrl: '/api',
    eventRefreshInterval: 60000,
    featureFlags: {
      newAdminUI: true,
      aiCuration: true,
      darkModeBanner: false
    }
  }
}

module.exports = seedData

