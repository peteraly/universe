# GolfVision Deployment Guide

## Overview

This guide covers deploying the GolfVision system in various environments, from local development to production.

## Prerequisites

### System Requirements
- **CPU**: 4+ cores (8+ recommended for production)
- **RAM**: 8GB minimum (16GB+ recommended)
- **Storage**: 50GB+ available space
- **GPU**: Optional but recommended for 3D rendering
- **OS**: Linux (Ubuntu 22.04+), macOS, or Windows with WSL2

### Software Requirements
- **Docker**: 20.10+ with Docker Compose
- **Node.js**: 18.0+ (for local development)
- **pnpm**: 8.0+ (for local development)
- **Git**: Latest version

## Quick Start (Docker)

### 1. Clone and Setup
```bash
git clone <your-repo-url>
cd golfvision
cp env.example .env
```

### 2. Start All Services
```bash
# Start everything with Docker
make up

# Or manually
docker-compose up -d
```

### 3. Access the System
- **Dashboard**: http://localhost:3000
- **API**: http://localhost:4000
- **Health Check**: http://localhost:4000/health

## Local Development Setup

### 1. Install Dependencies
```bash
# Install pnpm globally
npm install -g pnpm

# Install project dependencies
pnpm install
```

### 2. Setup Environment
```bash
# Copy environment template
cp env.example .env

# Edit configuration
nano .env
```

### 3. Start Services
```bash
# Start Redis
brew services start redis  # macOS
sudo systemctl start redis  # Linux

# Start development servers
pnpm dev
```

### 4. Install External Tools (Optional)
```bash
# Install Blender (for 3D rendering)
# macOS
brew install --cask blender

# Ubuntu
sudo apt update
sudo apt install blender

# Install FFmpeg (for video processing)
# macOS
brew install ffmpeg

# Ubuntu
sudo apt install ffmpeg

# Install eSpeak (for TTS)
# macOS
brew install espeak

# Ubuntu
sudo apt install espeak
```

## Production Deployment

### Docker Production Setup

#### 1. Production Environment
```bash
# Create production environment file
cp env.example .env.production

# Edit production settings
nano .env.production
```

#### 2. Production Configuration
```env
# Production settings
NODE_ENV=production
PORT=4000
CORS_ORIGIN=https://yourdomain.com

# Redis
REDIS_URL=redis://redis:6379
REDIS_PASSWORD=your-secure-password

# Job Queue
MAX_CONCURRENT_JOBS=5
JOB_TIMEOUT=600000

# Blender
BLENDER_GPU_ENABLED=true
BLENDER_TIMEOUT=600000

# FFmpeg
FFMPEG_THREADS=8
FFMPEG_PRESET=slow
FFMPEG_CRF=18

# Security
RATE_LIMIT_WINDOW=900000
RATE_LIMIT_MAX=100
```

#### 3. Start Production Services
```bash
# Build and start production services
docker-compose --env-file .env.production -f docker-compose.prod.yml up -d

# Or use the Makefile
make prod
```

### Kubernetes Deployment

#### 1. Create Namespace
```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: golfvision
```

#### 2. Deploy Redis
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: redis
  namespace: golfvision
spec:
  replicas: 1
  selector:
    matchLabels:
      app: redis
  template:
    metadata:
      labels:
        app: redis
    spec:
      containers:
      - name: redis
        image: redis:7-alpine
        ports:
        - containerPort: 6379
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
---
apiVersion: v1
kind: Service
metadata:
  name: redis
  namespace: golfvision
spec:
  selector:
    app: redis
  ports:
  - port: 6379
    targetPort: 6379
```

#### 3. Deploy Application Services
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: golfvision-server
  namespace: golfvision
spec:
  replicas: 2
  selector:
    matchLabels:
      app: golfvision-server
  template:
    metadata:
      labels:
        app: golfvision-server
    spec:
      containers:
      - name: server
        image: golfvision/server:latest
        ports:
        - containerPort: 4000
        env:
        - name: NODE_ENV
          value: "production"
        - name: REDIS_URL
          value: "redis://redis:6379"
        resources:
          requests:
            memory: "512Mi"
            cpu: "500m"
          limits:
            memory: "1Gi"
            cpu: "1000m"
        livenessProbe:
          httpGet:
            path: /health
            port: 4000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /health/ready
            port: 4000
          initialDelaySeconds: 5
          periodSeconds: 5
```

### Cloud Deployment

#### AWS ECS Deployment

##### 1. Create ECR Repository
```bash
aws ecr create-repository --repository-name golfvision
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <account-id>.dkr.ecr.us-east-1.amazonaws.com
```

##### 2. Build and Push Images
```bash
# Build images
docker-compose build

# Tag and push
docker tag golfvision_server:latest <account-id>.dkr.ecr.us-east-1.amazonaws.com/golfvision:latest
docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/golfvision:latest
```

##### 3. Create ECS Task Definition
```json
{
  "family": "golfvision",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "1024",
  "memory": "2048",
  "executionRoleArn": "arn:aws:iam::<account-id>:role/ecsTaskExecutionRole",
  "containerDefinitions": [
    {
      "name": "golfvision-server",
      "image": "<account-id>.dkr.ecr.us-east-1.amazonaws.com/golfvision:latest",
      "portMappings": [
        {
          "containerPort": 4000,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "NODE_ENV",
          "value": "production"
        },
        {
          "name": "REDIS_URL",
          "value": "redis://redis:6379"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/golfvision",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "ecs"
        }
      }
    }
  ]
}
```

#### Google Cloud Run

##### 1. Build and Deploy
```bash
# Build container
gcloud builds submit --tag gcr.io/PROJECT_ID/golfvision

# Deploy to Cloud Run
gcloud run deploy golfvision \
  --image gcr.io/PROJECT_ID/golfvision \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --memory 2Gi \
  --cpu 2 \
  --set-env-vars NODE_ENV=production
```

## Monitoring and Logging

### Health Checks
```bash
# Check system health
make monitor:health

# Check specific service
curl http://localhost:4000/health

# Check error status
curl http://localhost:4000/api/errors/stats
```

### Logs
```bash
# View all logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f server

# View error logs
tail -f logs/error-monitor.log
```

### Metrics
- **Application Metrics**: Available at `/api/health/detailed`
- **Error Tracking**: Available at `/api/errors/stats`
- **Job Queue Status**: Available at `/api/health`

## Security Considerations

### Environment Variables
- Use strong, unique passwords for Redis
- Set appropriate CORS origins
- Configure rate limiting
- Use HTTPS in production

### Network Security
- Use private subnets for database services
- Configure security groups/firewall rules
- Enable VPC for cloud deployments
- Use secrets management for sensitive data

### Application Security
- Enable helmet.js security headers
- Configure rate limiting
- Validate all inputs
- Use HTTPS everywhere
- Regular security updates

## Scaling

### Horizontal Scaling
```bash
# Scale workers
docker-compose up -d --scale data-worker=3 --scale model-worker=2 --scale post-worker=2

# Scale with Kubernetes
kubectl scale deployment golfvision-server --replicas=5
```

### Vertical Scaling
- Increase CPU/memory limits in Docker Compose
- Adjust Kubernetes resource requests/limits
- Optimize Blender and FFmpeg settings

## Backup and Recovery

### Data Backup
```bash
# Backup Redis data
docker exec golfvision-redis redis-cli BGSAVE

# Backup outputs
tar -czf golfvision-backup-$(date +%Y%m%d).tar.gz outputs/

# Backup logs
tar -czf golfvision-logs-$(date +%Y%m%d).tar.gz logs/
```

### Recovery
```bash
# Restore from backup
tar -xzf golfvision-backup-20240813.tar.gz

# Restart services
docker-compose restart
```

## Troubleshooting

### Common Issues

#### Service Won't Start
```bash
# Check logs
docker-compose logs service-name

# Check resource usage
docker stats

# Restart service
docker-compose restart service-name
```

#### Blender Issues
```bash
# Check Blender installation
docker exec golfvision-model-worker blender --version

# Check GPU availability
docker exec golfvision-model-worker nvidia-smi
```

#### FFmpeg Issues
```bash
# Check FFmpeg installation
docker exec golfvision-post-worker ffmpeg -version

# Check available codecs
docker exec golfvision-post-worker ffmpeg -codecs
```

#### Redis Connection Issues
```bash
# Check Redis status
docker exec golfvision-redis redis-cli ping

# Check Redis logs
docker-compose logs redis
```

### Performance Optimization

#### Blender Rendering
- Enable GPU rendering when available
- Adjust render settings for quality vs speed
- Use appropriate sample counts
- Consider render farm for large projects

#### FFmpeg Processing
- Use hardware acceleration when available
- Optimize preset and CRF settings
- Parallel processing for multiple jobs
- Appropriate thread allocation

#### Database Optimization
- Redis persistence configuration
- Memory optimization
- Connection pooling
- Regular cleanup of old data

## Support

For deployment issues:
1. Check the logs: `docker-compose logs`
2. Run health checks: `make monitor:health`
3. Review error tracking: Dashboard → Errors tab
4. Check system resources: `docker stats`

For additional help:
- Review the error tracking documentation
- Check the troubleshooting section
- Monitor system health regularly
- Keep dependencies updated
