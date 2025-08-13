# GolfVision Makefile

.PHONY: help up down build clean test demo install dev logs status

# Default target
help:
	@echo "GolfVision - Golf Course Video Generator"
	@echo ""
	@echo "Available commands:"
	@echo "  make up          - Start all services with Docker Compose"
	@echo "  make down        - Stop all services"
	@echo "  make build       - Build all Docker images"
	@echo "  make clean       - Clean up containers, images, and volumes"
	@echo "  make install     - Install dependencies for local development"
	@echo "  make dev         - Start development environment"
	@echo "  make test        - Run all tests"
	@echo "  make demo        - Run a demo job"
	@echo "  make logs        - Show logs from all services"
	@echo "  make status      - Show status of all services"
	@echo "  make reset       - Reset everything and start fresh"

# Docker commands
up:
	@echo "🚀 Starting GolfVision services..."
	docker-compose up -d
	@echo "✅ Services started! Dashboard: http://localhost:3000"

down:
	@echo "🛑 Stopping GolfVision services..."
	docker-compose down
	@echo "✅ Services stopped"

build:
	@echo "🔨 Building Docker images..."
	docker-compose build --no-cache
	@echo "✅ Images built successfully"

clean:
	@echo "🧹 Cleaning up Docker resources..."
	docker-compose down -v --remove-orphans
	docker system prune -f
	docker volume prune -f
	@echo "✅ Cleanup complete"

logs:
	@echo "📋 Showing logs from all services..."
	docker-compose logs -f

status:
	@echo "📊 Service Status:"
	@docker-compose ps
	@echo ""
	@echo "🔍 Health Checks:"
	@curl -s http://localhost:4000/health || echo "Server not responding"
	@curl -s http://localhost:3000 | head -1 || echo "Web not responding"

reset: clean build up
	@echo "🔄 System reset complete!"

# Development commands
install:
	@echo "📦 Installing dependencies..."
	pnpm install
	@echo "✅ Dependencies installed"

dev:
	@echo "🛠️  Starting development environment..."
	pnpm dev

# Testing commands
test:
	@echo "🧪 Running tests..."
	pnpm test

test:unit:
	@echo "🧪 Running unit tests..."
	pnpm test:unit

test:e2e:
	@echo "🧪 Running end-to-end tests..."
	pnpm test:e2e

test:golden:
	@echo "🧪 Running golden tests..."
	pnpm test:golden

# Error monitoring commands
monitor:errors:
	@echo "🔍 Running error monitor..."
	node scripts/error-monitor.js

monitor:health:
	@echo "🏥 Checking system health..."
	@curl -s http://localhost:4000/health | jq . || echo "Server not responding"
	@curl -s http://localhost:3000 | head -1 || echo "Web not responding"

# Demo commands
demo:
	@echo "🎬 Running demo job..."
	curl -X POST http://localhost:4000/api/jobs \
		-H "Content-Type: application/json" \
		-d '{"courseName": "Pebble Beach", "seed": 12345}'

# Utility commands
open:
	@echo "🌐 Opening dashboard..."
	open http://localhost:3000

health:
	@echo "🏥 Health check..."
	@curl -s http://localhost:4000/health | jq .

jobs:
	@echo "📋 Current jobs..."
	@curl -s http://localhost:4000/api/jobs | jq .

# Production commands
prod:
	@echo "🚀 Starting production environment..."
	docker-compose --profile production up -d

prod:logs:
	@echo "📋 Production logs..."
	docker-compose --profile production logs -f

# Backup and restore
backup:
	@echo "💾 Creating backup..."
	mkdir -p backups
	tar -czf backups/golfvision-$(shell date +%Y%m%d-%H%M%S).tar.gz \
		--exclude=node_modules \
		--exclude=.git \
		--exclude=backups \
		.

restore:
	@echo "📥 Restoring from backup..."
	@if [ -z "$(BACKUP_FILE)" ]; then \
		echo "Usage: make restore BACKUP_FILE=backups/filename.tar.gz"; \
		exit 1; \
	fi
	tar -xzf $(BACKUP_FILE)

# Monitoring
monitor:
	@echo "📊 System monitoring..."
	@echo "CPU Usage:"
	@docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}"
	@echo ""
	@echo "Disk Usage:"
	@du -sh ./outputs ./uploads ./temp 2>/dev/null || echo "Directories not found"

# Quick commands for common tasks
quick: install up open
	@echo "⚡ Quick start complete!"

restart: down up
	@echo "🔄 Services restarted!"

update: down build up
	@echo "🔄 System updated!"
