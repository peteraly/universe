#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

async function setup() {
  console.log('🏌️‍♂️ GolfVision Setup')
  console.log('===================\n')
  
  try {
    // Check prerequisites
    console.log('🔍 Checking prerequisites...')
    await checkPrerequisites()
    
    // Create necessary directories
    console.log('\n📁 Creating directories...')
    createDirectories()
    
    // Copy environment file
    console.log('\n⚙️  Setting up environment...')
    setupEnvironment()
    
    // Install dependencies
    console.log('\n📦 Installing dependencies...')
    installDependencies()
    
    // Setup Docker (optional)
    console.log('\n🐳 Setting up Docker...')
    setupDocker()
    
    console.log('\n✅ Setup completed successfully!')
    console.log('\n🚀 Next steps:')
    console.log('1. Copy env.example to .env and configure settings')
    console.log('2. Run: make up (for Docker) or pnpm dev (for local development)')
    console.log('3. Open http://localhost:3000 in your browser')
    
  } catch (error) {
    console.error('❌ Setup failed:', error.message)
    process.exit(1)
  }
}

async function checkPrerequisites() {
  const requirements = [
    { name: 'Node.js', command: 'node --version', minVersion: '18.0.0' },
    { name: 'pnpm', command: 'pnpm --version', minVersion: '8.0.0' },
    { name: 'Git', command: 'git --version', minVersion: '2.0.0' }
  ]
  
  for (const req of requirements) {
    try {
      const version = execSync(req.command, { encoding: 'utf8' }).trim()
      console.log(`✅ ${req.name}: ${version}`)
    } catch (error) {
      throw new Error(`${req.name} is not installed or not in PATH`)
    }
  }
  
  // Check optional requirements
  const optional = [
    { name: 'Docker', command: 'docker --version' },
    { name: 'Docker Compose', command: 'docker-compose --version' },
    { name: 'FFmpeg', command: 'ffmpeg -version' },
    { name: 'Blender', command: 'blender --version' }
  ]
  
  for (const opt of optional) {
    try {
      const version = execSync(opt.command, { encoding: 'utf8' }).trim()
      console.log(`✅ ${opt.name}: ${version.split('\n')[0]}`)
    } catch (error) {
      console.log(`⚠️  ${opt.name}: Not installed (optional)`)
    }
  }
}

function createDirectories() {
  const dirs = [
    'logs',
    'uploads',
    'outputs',
    'temp',
    'packages/web/dist',
    'packages/server/dist',
    'packages/workers/data-worker/dist',
    'packages/workers/model-worker/dist',
    'packages/workers/post-worker/dist'
  ]
  
  for (const dir of dirs) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
      console.log(`✅ Created: ${dir}`)
    } else {
      console.log(`ℹ️  Exists: ${dir}`)
    }
  }
}

function setupEnvironment() {
  const envExample = 'env.example'
  const envFile = '.env'
  
  if (!fs.existsSync(envFile)) {
    if (fs.existsSync(envExample)) {
      fs.copyFileSync(envExample, envFile)
      console.log(`✅ Created .env from ${envExample}`)
    } else {
      console.log('⚠️  env.example not found, creating basic .env')
      createBasicEnv()
    }
  } else {
    console.log('ℹ️  .env already exists')
  }
}

function createBasicEnv() {
  const basicEnv = `# GolfVision Environment Configuration

# Server Configuration
PORT=4000
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000

# Redis Configuration
REDIS_URL=redis://localhost:6379

# Job Queue Configuration
QUEUE_NAME=golfvision-jobs
MAX_CONCURRENT_JOBS=3
JOB_TIMEOUT=300000

# File Storage
UPLOAD_DIR=./uploads
OUTPUT_DIR=./outputs
TEMP_DIR=./temp

# External Services
NOMINATIM_URL=https://nominatim.openstreetmap.org
OVERPASS_URL=https://overpass-api.de/api
OPENTOPODATA_URL=https://api.opentopodata.org/v1

# Fallback Configuration
DEMO_COORDINATES=36.5683,-121.9496
STORYBOARD_MODE_ENABLED=true
PROCEDURAL_FALLBACK_ENABLED=true

# Logging
LOG_LEVEL=info
DEBUG=false
`
  
  fs.writeFileSync('.env', basicEnv)
}

function installDependencies() {
  try {
    console.log('Installing root dependencies...')
    execSync('pnpm install', { stdio: 'inherit' })
    
    console.log('Installing workspace dependencies...')
    execSync('pnpm install --recursive', { stdio: 'inherit' })
    
  } catch (error) {
    console.error('Failed to install dependencies:', error.message)
    throw error
  }
}

function setupDocker() {
  try {
    // Check if Docker is available
    execSync('docker --version', { stdio: 'ignore' })
    
    console.log('Building Docker images...')
    execSync('docker-compose build', { stdio: 'inherit' })
    
  } catch (error) {
    console.log('⚠️  Docker setup skipped (Docker not available)')
  }
}

// Run setup if called directly
if (require.main === module) {
  setup().catch(console.error)
}

module.exports = { setup }
