# GolfVision Error Tracking & Monitoring System

## Overview

GolfVision includes a comprehensive error tracking and monitoring system that automatically detects, logs, and helps resolve issues. This system ensures the application remains stable and provides clear visibility into any problems that occur.

## Features

### 🔍 Automatic Error Detection
- **Real-time monitoring** of all application components
- **Automatic error logging** with full context and stack traces
- **Severity classification** (low, medium, high, critical)
- **Error categorization** (errors, warnings, info)

### 🛠️ Auto-Fix Capabilities
- **Missing dependencies** - Automatically installs required packages
- **Service startup** - Starts Redis and other required services
- **File permissions** - Creates missing directories and fixes permissions
- **Environment setup** - Creates .env files from templates
- **Port conflicts** - Detects and reports port availability issues

### 📊 Error Dashboard
- **Real-time error monitoring** via web interface
- **Error statistics** and trends
- **Filtering and search** capabilities
- **Bulk error resolution** functionality
- **Export capabilities** for analysis

## Quick Start

### 1. Run Error Monitor
```bash
# Check system health and auto-fix issues
make monitor:errors

# Or run directly
node scripts/error-monitor.js
```

### 2. Access Error Dashboard
1. Start the application: `make up`
2. Open the dashboard: http://localhost:3000
3. Click "Errors" in the navigation bar
4. View and manage errors in real-time

### 3. Monitor System Health
```bash
# Quick health check
make monitor:health

# Detailed health check
curl http://localhost:4000/api/health/detailed
```

## Error Categories

### 🔴 Critical Errors
- System crashes
- Database connection failures
- Service startup failures
- Security violations

### 🟠 High Priority Errors
- API failures
- Worker process failures
- File system errors
- Memory issues

### 🟡 Medium Priority Errors
- Non-critical API errors
- Performance warnings
- Deprecated feature usage
- Configuration issues

### 🔵 Low Priority Errors
- Informational messages
- Debug information
- Non-critical warnings

## Error Tracking API

### Get All Errors
```bash
GET /api/errors?resolved=false&severity=high&type=error
```

### Get Error Statistics
```bash
GET /api/errors/stats
```

### Resolve an Error
```bash
POST /api/errors/{errorId}/resolve
Content-Type: application/json

{
  "notes": "Fixed by updating configuration"
}
```

### Track Custom Error
```bash
POST /api/errors/track
Content-Type: application/json

{
  "message": "Custom error message",
  "severity": "medium",
  "context": {
    "jobId": "123",
    "userId": "user456"
  }
}
```

### Export Errors
```bash
GET /api/errors/export/json?resolved=false&severity=critical
```

## Error Monitor Script

The `scripts/error-monitor.js` script performs comprehensive system checks:

### System Checks
- ✅ **Dependencies** - Verifies all packages are installed
- ✅ **Ports** - Checks if required ports are available
- ✅ **File Permissions** - Ensures directories are writable
- ✅ **Environment** - Validates configuration files
- ✅ **Database** - Tests Redis connection
- ✅ **Processes** - Monitors worker processes
- ✅ **Disk Space** - Checks available storage
- ✅ **Memory** - Monitors memory usage

### Auto-Fixes
- 🔧 **Missing Dependencies** - Runs `pnpm install`
- 🔧 **Service Startup** - Starts Redis service
- 🔧 **Directory Creation** - Creates missing folders
- 🔧 **Environment Setup** - Copies .env from template
- 🔧 **Permission Fixes** - Sets correct file permissions

## Error Dashboard Features

### 📊 Statistics Panel
- Total errors count
- Resolved vs unresolved
- Severity breakdown
- Error type distribution

### 🔍 Filtering Options
- **Status**: Resolved/Unresolved
- **Severity**: Critical/High/Medium/Low
- **Type**: Error/Warning/Info
- **Date Range**: Time-based filtering

### 📋 Error Details
- **Error Message** - Clear description of the issue
- **Stack Trace** - Full error stack for debugging
- **Context** - Additional error context (URL, user, etc.)
- **Timestamps** - When the error occurred
- **Resolution Notes** - How the error was fixed

### 🛠️ Management Actions
- **Resolve Errors** - Mark errors as resolved with notes
- **Bulk Operations** - Resolve multiple errors at once
- **Export Data** - Download error reports
- **Real-time Updates** - Live error monitoring

## Configuration

### Environment Variables
```bash
# Error tracking configuration
ERROR_TRACKING_ENABLED=true
ERROR_LOG_RETENTION_DAYS=30
ERROR_ALERT_EMAIL=admin@golfvision.com
ERROR_ALERT_WEBHOOK=https://hooks.slack.com/...

# Logging configuration
LOG_LEVEL=info
LOG_FILE_PATH=logs/errors.json
```

### Error Retention
- **Active errors** - Kept indefinitely until resolved
- **Resolved errors** - Automatically cleaned up after 30 days
- **Critical errors** - Never automatically deleted
- **Export capability** - Manual export for long-term storage

## Integration Points

### External Services
- **Sentry** - Error reporting and monitoring
- **LogRocket** - Session replay and debugging
- **DataDog** - Application performance monitoring
- **PagerDuty** - Incident management and alerts

### Notification Channels
- **Email** - Critical error alerts
- **Slack** - Real-time error notifications
- **Webhooks** - Custom integrations
- **SMS** - Emergency alerts for critical issues

## Best Practices

### 1. Regular Monitoring
```bash
# Set up cron job for regular health checks
0 */6 * * * cd /path/to/golfvision && make monitor:errors
```

### 2. Error Resolution Workflow
1. **Monitor** - Check error dashboard regularly
2. **Investigate** - Review error context and stack traces
3. **Fix** - Implement the necessary fix
4. **Resolve** - Mark error as resolved with notes
5. **Verify** - Confirm the fix works

### 3. Proactive Maintenance
- Run error monitor before deployments
- Monitor disk space and memory usage
- Keep dependencies updated
- Review error trends regularly

### 4. Documentation
- Document common error patterns
- Maintain troubleshooting guides
- Update runbooks for critical errors
- Share learnings with the team

## Troubleshooting

### Common Issues

#### Error Monitor Not Running
```bash
# Check if script is executable
chmod +x scripts/error-monitor.js

# Run with verbose output
node scripts/error-monitor.js --verbose
```

#### Dashboard Not Loading
```bash
# Check if services are running
make status

# Restart services
make restart
```

#### Redis Connection Issues
```bash
# Start Redis service
brew services start redis

# Test connection
redis-cli ping
```

#### Port Conflicts
```bash
# Check what's using the ports
lsof -i :3000
lsof -i :4000
lsof -i :6379

# Kill conflicting processes
kill -9 <PID>
```

## Support

For issues with the error tracking system:

1. **Check the logs**: `tail -f logs/error-monitor.log`
2. **Run health check**: `make monitor:health`
3. **Review error dashboard**: http://localhost:3000 (Errors tab)
4. **Export error data**: Use the export API for analysis

## Contributing

To improve the error tracking system:

1. **Add new checks** to `scripts/error-monitor.js`
2. **Enhance the dashboard** in `packages/web/src/components/ErrorMonitor.tsx`
3. **Extend the API** in `packages/server/src/routes/errors.ts`
4. **Update documentation** in this file

---

**Remember**: The error tracking system is designed to help you maintain a healthy GolfVision installation. Regular monitoring and proactive maintenance will ensure the best experience for your users.
