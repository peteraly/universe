# Discovery Dial Mission Control V12.0

## Overview

The Discovery Dial Mission Control system is a comprehensive enterprise-scale event curation and management platform. Built with React 18, Vite, and modern web technologies, it provides intuitive gesture-based event discovery, AI-powered curation, and comprehensive system administration.

## Features

### 🎯 Core Features
- **Gesture-Based Discovery**: Intuitive swipe and keyboard navigation
- **AI-Powered Curation**: Automated event classification and quality assessment
- **Enterprise Admin Dashboard**: Comprehensive system administration
- **Real-Time Monitoring**: Live system health and performance tracking
- **Recovery System**: Automated incident response and recovery procedures
- **RBAC Security**: Role-based access control with 5-tier permission system

### 🚀 Advanced Features
- **Agent Console**: AI agent management and monitoring
- **Governance Board**: Policy management and compliance tracking
- **Public Portal**: Transparent system status and metrics
- **Seed Data Management**: Demo data and testing capabilities
- **Accessibility**: WCAG compliance and screen reader support
- **Performance Optimization**: Lighthouse auditing and performance monitoring

## Quick Start

### Prerequisites
- Node.js 18+ 
- npm 9+
- Modern web browser
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/discovery-dial.git
   cd discovery-dial
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open in browser**
   ```
   http://localhost:5173
   ```

## Available Commands

### Development Commands
```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linting
npm run lint
```

### Testing Commands
```bash
# Run unit tests
npm run test

# Run regression tests
npm run test:regression

# Run all tests
npm run test:all

# Run CI/CD pipeline
npm run pipeline
```

### System Management Commands
```bash
# Freeze system
npm run freeze

# Unfreeze system
npm run unfreeze

# Check freeze status
npm run freeze:status

# View freeze logs
npm run freeze:log
```

### Seed Data Commands
```bash
# Seed system with demo data
npm run seed

# Remove seed data
npm run unseed

# Check seed status
npm run seed:status

# Validate seed data
npm run seed:validate

# View seed logs
npm run seed:log
```

### Audit Commands
```bash
# Run Lighthouse audit
npm run lighthouse

# Run accessibility check
npm run accessibility

# Run all audits
npm run audit:all
```

## Environment Configuration

### Development Environment
```bash
# Environment variables
NODE_ENV=development
VITE_API_BASE_URL=http://localhost:5173/api
VITE_APP_TITLE=Discovery Dial Mission Control
VITE_APP_VERSION=12.0.0
```

### Production Environment
```bash
# Environment variables
NODE_ENV=production
VITE_API_BASE_URL=https://discovery-dial.vercel.app/api
VITE_APP_TITLE=Discovery Dial Mission Control
VITE_APP_VERSION=12.0.0
```

### Staging Environment
```bash
# Environment variables
NODE_ENV=staging
VITE_API_BASE_URL=https://discovery-dial-staging.vercel.app/api
VITE_APP_TITLE=Discovery Dial Mission Control (Staging)
VITE_APP_VERSION=12.0.0-staging
```

## System Architecture

### Core Components
- **L1 Event Curation Hub**: AI-powered event classification and quality assessment
- **L2 System Health Monitor**: Real-time health monitoring and telemetry
- **L3 Configuration Management**: Centralized configuration and governance
- **L4 Intelligence Center**: AI decision engine and drift detection
- **L5 Knowledge System**: Vector memory and agent experience tracking
- **L6 Ecosystem Integration**: External system integrations and analytics

### Technology Stack
- **Frontend**: React 18, Vite, Lucide React, CSS3
- **Backend**: Node.js, Express.js, RESTful APIs
- **Database**: Firestore, Vector Store, Ledger
- **DevOps**: Vercel, GitHub, Lighthouse, ESLint

## API Documentation

### Base URL
```
Production: https://discovery-dial.vercel.app/api
Development: http://localhost:5173/api
```

### Authentication
All API endpoints require JWT token authentication:
```bash
Authorization: Bearer <jwt_token>
```

### Key Endpoints
- `GET /api/events` - Get all events
- `POST /api/events` - Create new event
- `GET /api/agents` - Get all agents
- `GET /api/health` - Get system health
- `GET /api/config` - Get configuration
- `GET /api/recovery` - Get recovery status

## Security

### Role-Based Access Control (RBAC)
- **Super Admin**: Full system access
- **Admin**: Administrative operations
- **Curator**: Event and content management
- **Agent**: Agent operations
- **Viewer**: Read-only access

### Security Features
- JWT token authentication
- Role-based permissions
- API rate limiting
- Input validation and sanitization
- Audit logging and compliance

## Deployment

### Vercel Deployment
```bash
# Deploy to Vercel
vercel --prod

# Deploy to staging
vercel --target staging
```

### Environment Variables
Set the following environment variables in your deployment platform:
- `NODE_ENV`
- `VITE_API_BASE_URL`
- `VITE_APP_TITLE`
- `VITE_APP_VERSION`

## Monitoring and Observability

### System Health
- Real-time health monitoring
- Performance metrics tracking
- Error tracking and alerting
- Automated recovery procedures

### Business Metrics
- Event processing throughput
- User engagement analytics
- System utilization metrics
- Cost optimization tracking

## Documentation

### Comprehensive Documentation
- [Architecture Documentation](docs/architecture.md)
- [RBAC Documentation](docs/rbac.md)
- [API Documentation](docs/api.md)
- [Recovery Documentation](docs/recovery.md)
- [Governance Documentation](docs/governance.md)

### Additional Resources
- [V12.0 Mission Control Directive](.cursor/context/mission-control-directive.md)
- [Staging Environment](../staging/)
- [Scripts and Tools](../staging/scripts/)

## Contributing

### Development Workflow
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

### Code Standards
- ESLint configuration
- Prettier formatting
- TypeScript support
- Comprehensive testing

## Support

### Getting Help
- Check the documentation
- Review the staging environment
- Run system diagnostics
- Contact the development team

### Troubleshooting
- Check system health: `npm run accessibility`
- Run diagnostics: `npm run lighthouse`
- Review logs: `npm run seed:log`
- Check freeze status: `npm run freeze:status`

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Version History

### V12.0.0 (Current)
- Complete system architecture implementation
- Enterprise-scale admin dashboard
- AI-powered event curation
- Comprehensive recovery system
- RBAC security implementation
- Accessibility and performance optimization

### Previous Versions
- V11.x: Initial system development
- V10.x: Core functionality implementation
- V9.x: Basic event management

## Acknowledgments

- React team for the excellent framework
- Vite team for the fast build tool
- Lucide team for the beautiful icons
- Vercel team for the deployment platform
- All contributors and stakeholders

---

**Discovery Dial Mission Control V12.0** - Enterprise-scale event curation and management platform.

