# Discovery Dial Mission Control - API Documentation

## Overview

The Discovery Dial Mission Control system provides a comprehensive RESTful API for event management, system administration, and operational control. This document outlines all available endpoints, authentication, and usage examples.

## Base URL

```
Production: https://discovery-dial.vercel.app/api
Development: http://localhost:5173/api
```

## Authentication

### JWT Token Authentication
All API endpoints require authentication via JWT tokens.

```bash
# Example authentication header
Authorization: Bearer <jwt_token>
```

### Role-Based Access Control
Endpoints are protected by RBAC with the following roles:
- `super_admin`: Full system access
- `admin`: Administrative operations
- `curator`: Event and content management
- `agent`: Agent operations
- `viewer`: Read-only access

## API Endpoints

### Event Management

#### Get All Events
```http
GET /api/events
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "evt-001",
      "name": "Tech Innovation Summit 2024",
      "description": "A comprehensive summit featuring the latest in AI, blockchain, and emerging technologies.",
      "date": "2024-03-15",
      "time": "09:00",
      "venue": "San Francisco Convention Center",
      "category": "Tech",
      "tags": ["AI", "blockchain", "networking"],
      "status": "live",
      "qualityScore": 95,
      "createdAt": "2024-01-15T10:00:00Z",
      "updatedAt": "2024-01-15T10:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 1,
    "pages": 1
  }
}
```

#### Get Event by ID
```http
GET /api/events/:id
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "evt-001",
    "name": "Tech Innovation Summit 2024",
    "description": "A comprehensive summit featuring the latest in AI, blockchain, and emerging technologies.",
    "date": "2024-03-15",
    "time": "09:00",
    "venue": "San Francisco Convention Center",
    "category": "Tech",
    "tags": ["AI", "blockchain", "networking"],
    "status": "live",
    "qualityScore": 95,
    "createdAt": "2024-01-15T10:00:00Z",
    "updatedAt": "2024-01-15T10:00:00Z"
  }
}
```

#### Create Event
```http
POST /api/events
```

**Request Body:**
```json
{
  "name": "New Event",
  "description": "Event description",
  "date": "2024-03-20",
  "time": "14:00",
  "venue": "Event Venue",
  "category": "Tech",
  "tags": ["technology", "innovation"]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "evt-002",
    "name": "New Event",
    "description": "Event description",
    "date": "2024-03-20",
    "time": "14:00",
    "venue": "Event Venue",
    "category": "Tech",
    "tags": ["technology", "innovation"],
    "status": "draft",
    "qualityScore": 0,
    "createdAt": "2024-01-15T10:00:00Z",
    "updatedAt": "2024-01-15T10:00:00Z"
  }
}
```

#### Update Event
```http
PUT /api/events/:id
```

**Request Body:**
```json
{
  "name": "Updated Event Name",
  "description": "Updated description",
  "status": "live"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "evt-001",
    "name": "Updated Event Name",
    "description": "Updated description",
    "status": "live",
    "updatedAt": "2024-01-15T11:00:00Z"
  }
}
```

#### Delete Event
```http
DELETE /api/events/:id
```

**Response:**
```json
{
  "success": true,
  "message": "Event deleted successfully"
}
```

### Agent Management

#### Get All Agents
```http
GET /api/agents
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "agent-001",
      "name": "Event Curator AI",
      "type": "curation",
      "status": "active",
      "capabilities": ["event_classification", "quality_assessment"],
      "performance": {
        "eventsProcessed": 1247,
        "accuracy": 94.2,
        "responseTime": 1.2
      },
      "lastHeartbeat": "2024-01-15T10:30:00Z",
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-15T10:30:00Z"
    }
  ]
}
```

#### Create Agent
```http
POST /api/agents
```

**Request Body:**
```json
{
  "name": "New Agent",
  "type": "curation",
  "capabilities": ["event_classification", "quality_assessment"]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "agent-002",
    "name": "New Agent",
    "type": "curation",
    "status": "inactive",
    "capabilities": ["event_classification", "quality_assessment"],
    "performance": {
      "eventsProcessed": 0,
      "accuracy": 0,
      "responseTime": 0
    },
    "createdAt": "2024-01-15T10:00:00Z",
    "updatedAt": "2024-01-15T10:00:00Z"
  }
}
```

#### Update Agent
```http
PUT /api/agents/:id
```

**Request Body:**
```json
{
  "status": "active",
  "capabilities": ["event_classification", "quality_assessment", "content_moderation"]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "agent-001",
    "status": "active",
    "capabilities": ["event_classification", "quality_assessment", "content_moderation"],
    "updatedAt": "2024-01-15T11:00:00Z"
  }
}
```

#### Delete Agent
```http
DELETE /api/agents/:id
```

**Response:**
```json
{
  "success": true,
  "message": "Agent deleted successfully"
}
```

### System Health

#### Get System Health
```http
GET /api/health
```

**Response:**
```json
{
  "success": true,
  "data": {
    "overallStatus": "healthy",
    "uptime": 86400,
    "memoryUsage": {
      "used": 512,
      "total": 1024
    },
    "cpuUsage": 45,
    "components": {
      "eventCurationEngine": "healthy",
      "eventAPI": "healthy",
      "database": "healthy",
      "llmService": "healthy",
      "vectorStore": "healthy"
    },
    "metrics": {
      "responseTime": 120,
      "throughput": 850,
      "errorRate": 0.2,
      "activeConnections": 156
    },
    "issues": [],
    "lastCheck": "2024-01-15T10:30:00Z"
  }
}
```

#### Get Health Metrics
```http
GET /api/health/metrics
```

**Response:**
```json
{
  "success": true,
  "data": {
    "responseTime": 120,
    "throughput": 850,
    "errorRate": 0.2,
    "activeConnections": 156,
    "timestamp": "2024-01-15T10:30:00Z"
  }
}
```

### Configuration Management

#### Get Configuration
```http
GET /api/config
```

**Response:**
```json
{
  "success": true,
  "data": {
    "environment": "production",
    "apiBaseUrl": "/api",
    "eventRefreshInterval": 60000,
    "featureFlags": {
      "newAdminUI": true,
      "aiCuration": true,
      "darkModeBanner": false
    }
  }
}
```

#### Update Configuration
```http
PUT /api/config
```

**Request Body:**
```json
{
  "eventRefreshInterval": 30000,
  "featureFlags": {
    "newAdminUI": true,
    "aiCuration": true,
    "darkModeBanner": true
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "environment": "production",
    "apiBaseUrl": "/api",
    "eventRefreshInterval": 30000,
    "featureFlags": {
      "newAdminUI": true,
      "aiCuration": true,
      "darkModeBanner": true
    },
    "updatedAt": "2024-01-15T11:00:00Z"
  }
}
```

### Recovery System

#### Get Recovery Status
```http
GET /api/recovery
```

**Response:**
```json
{
  "success": true,
  "data": {
    "systemState": {
      "current": "stable",
      "previous": "stable",
      "lastStableBuild": "v1.2.3",
      "freezeMode": false,
      "rollbackInProgress": false
    },
    "activeIncidents": 0,
    "recoveryMetrics": {
      "totalIncidents": 3,
      "resolvedIncidents": 3,
      "successRate": 100
    }
  }
}
```

#### Freeze System
```http
POST /api/recovery/freeze
```

**Request Body:**
```json
{
  "reason": "Emergency maintenance",
  "initiatedBy": "admin"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "systemState": {
      "current": "frozen",
      "freezeMode": true,
      "freezeReason": "Emergency maintenance",
      "freezeInitiatedBy": "admin",
      "freezeTimestamp": "2024-01-15T11:00:00Z"
    }
  }
}
```

#### Unfreeze System
```http
POST /api/recovery/unfreeze
```

**Response:**
```json
{
  "success": true,
  "data": {
    "systemState": {
      "current": "stable",
      "freezeMode": false,
      "unfreezeTimestamp": "2024-01-15T11:30:00Z"
    }
  }
}
```

#### Emergency Rollback
```http
POST /api/recovery/rollback
```

**Request Body:**
```json
{
  "targetVersion": "v1.2.2",
  "reason": "Critical issue detected",
  "initiatedBy": "admin"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "rollbackInProgress": true,
    "targetVersion": "v1.2.2",
    "rollbackReason": "Critical issue detected",
    "rollbackInitiatedBy": "admin",
    "rollbackTimestamp": "2024-01-15T11:00:00Z"
  }
}
```

### Governance

#### Get Governance Data
```http
GET /api/governance
```

**Response:**
```json
{
  "success": true,
  "data": {
    "policies": [
      {
        "id": "policy-001",
        "name": "Event Quality Standards",
        "description": "Minimum quality requirements for event submissions",
        "status": "active",
        "createdAt": "2024-01-01T00:00:00Z"
      }
    ],
    "decisions": [
      {
        "id": "decision-001",
        "title": "Approved AI Classification System",
        "description": "Decision to implement AI-powered event classification",
        "status": "approved",
        "createdAt": "2024-01-10T14:00:00Z"
      }
    ],
    "metrics": {
      "totalPolicies": 2,
      "activePolicies": 2,
      "totalDecisions": 1,
      "pendingDecisions": 0
    }
  }
}
```

#### Create Policy
```http
POST /api/governance/policies
```

**Request Body:**
```json
{
  "name": "New Policy",
  "description": "Policy description",
  "status": "active"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "policy-002",
    "name": "New Policy",
    "description": "Policy description",
    "status": "active",
    "createdAt": "2024-01-15T10:00:00Z"
  }
}
```

## Error Handling

### Standard Error Response
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": {
      "field": "name",
      "reason": "Name is required"
    }
  }
}
```

### Error Codes
- `VALIDATION_ERROR`: Input validation failed
- `AUTHENTICATION_ERROR`: Authentication failed
- `AUTHORIZATION_ERROR`: Insufficient permissions
- `NOT_FOUND`: Resource not found
- `INTERNAL_ERROR`: Internal server error
- `RATE_LIMIT_EXCEEDED`: Rate limit exceeded

## Rate Limiting

### Rate Limits
- **General API**: 1000 requests per hour
- **Authentication**: 10 requests per minute
- **Admin Operations**: 100 requests per hour
- **Recovery Operations**: 10 requests per hour

### Rate Limit Headers
```http
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1640995200
```

## Pagination

### Pagination Parameters
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10, max: 100)
- `sort`: Sort field (default: createdAt)
- `order`: Sort order (asc/desc, default: desc)

### Pagination Response
```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "pages": 10,
    "hasNext": true,
    "hasPrev": false
  }
}
```

## Webhooks

### Webhook Events
- `event.created`: Event created
- `event.updated`: Event updated
- `event.deleted`: Event deleted
- `agent.created`: Agent created
- `agent.updated`: Agent updated
- `system.health`: System health change
- `recovery.incident`: Recovery incident

### Webhook Payload
```json
{
  "event": "event.created",
  "timestamp": "2024-01-15T10:00:00Z",
  "data": {
    "id": "evt-001",
    "name": "Tech Innovation Summit 2024"
  }
}
```

## SDK and Libraries

### JavaScript SDK
```javascript
import { DiscoveryDialAPI } from '@discovery-dial/sdk';

const api = new DiscoveryDialAPI({
  baseUrl: 'https://discovery-dial.vercel.app/api',
  token: 'your-jwt-token'
});

// Get events
const events = await api.events.getAll();

// Create event
const event = await api.events.create({
  name: 'New Event',
  description: 'Event description'
});
```

### Python SDK
```python
from discovery_dial import DiscoveryDialAPI

api = DiscoveryDialAPI(
    base_url='https://discovery-dial.vercel.app/api',
    token='your-jwt-token'
)

# Get events
events = api.events.get_all()

# Create event
event = api.events.create({
    'name': 'New Event',
    'description': 'Event description'
})
```

## Testing

### API Testing
```bash
# Test authentication
curl -H "Authorization: Bearer <token>" \
  https://discovery-dial.vercel.app/api/events

# Test event creation
curl -X POST \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Event","description":"Test description"}' \
  https://discovery-dial.vercel.app/api/events
```

### Postman Collection
Import the Postman collection for comprehensive API testing:
- Authentication endpoints
- Event management
- Agent operations
- System health
- Recovery procedures

## Conclusion

The Discovery Dial Mission Control API provides comprehensive functionality for event management, system administration, and operational control. The API is designed for scalability, security, and ease of use with comprehensive documentation and testing support.

## References

- [Architecture Documentation](architecture.md)
- [RBAC Documentation](rbac.md)
- [Recovery Documentation](recovery.md)
- [Governance Documentation](governance.md)
