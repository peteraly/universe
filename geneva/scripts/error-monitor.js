#!/usr/bin/env node

/**
 * GolfVision Error Monitor & Auto-Fix Script
 * 
 * This script monitors the system for common errors and automatically fixes them
 * when possible. It can be run manually or as a scheduled task.
 */

const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')
const axios = require('axios')

class ErrorMonitor {
  constructor() {
    this.projectRoot = path.resolve(__dirname, '..')
    this.logsDir = path.join(this.projectRoot, 'logs')
    this.errors = []
    this.fixes = []
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString()
    const logMessage = `[${timestamp}] [${type.toUpperCase()}] ${message}`
    console.log(logMessage)
    
    // Also write to log file
    const logFile = path.join(this.logsDir, 'error-monitor.log')
    fs.appendFileSync(logFile, logMessage + '\n')
  }

  async checkSystemHealth() {
    this.log('🔍 Starting system health check...')
    
    const checks = [
      this.checkDependencies(),
      this.checkPorts(),
      this.checkFilePermissions(),
      this.checkEnvironmentVariables(),
      this.checkDatabaseConnection(),
      this.checkWorkerProcesses(),
      this.checkDiskSpace(),
      this.checkMemoryUsage(),
      this.checkCSSErrors()
    ]

    for (const check of checks) {
      try {
        await check
      } catch (error) {
        this.log(`Check failed: ${error.message}`, 'error')
      }
    }

    this.log(`✅ Health check complete. Found ${this.errors.length} issues, applied ${this.fixes.length} fixes.`)
  }

  async checkDependencies() {
    this.log('📦 Checking dependencies...')
    
    try {
      // Check if node_modules exists
      const nodeModulesPath = path.join(this.projectRoot, 'node_modules')
      if (!fs.existsSync(nodeModulesPath)) {
        this.log('❌ node_modules not found, installing dependencies...', 'warn')
        this.fixes.push('Installed missing dependencies')
        execSync('pnpm install', { cwd: this.projectRoot, stdio: 'inherit' })
      }

      // Check for outdated packages
      try {
        const outdated = execSync('pnpm outdated --json', { cwd: this.projectRoot, encoding: 'utf8' })
        const outdatedPackages = JSON.parse(outdated)
        if (Object.keys(outdatedPackages).length > 0) {
          this.log(`⚠️  Found ${Object.keys(outdatedPackages).length} outdated packages`, 'warn')
          this.errors.push('Outdated packages detected')
        }
      } catch (error) {
        // No outdated packages
      }
    } catch (error) {
      this.log(`❌ Dependency check failed: ${error.message}`, 'error')
      this.errors.push(`Dependency issue: ${error.message}`)
    }
  }

  async checkPorts() {
    this.log('🔌 Checking port availability...')
    
    const requiredPorts = [3000, 4000, 6379]
    
    for (const port of requiredPorts) {
      try {
        execSync(`lsof -i :${port}`, { stdio: 'ignore' })
        this.log(`✅ Port ${port} is in use`)
      } catch (error) {
        this.log(`❌ Port ${port} is not in use`, 'warn')
        this.errors.push(`Port ${port} not available`)
      }
    }
  }

  async checkFilePermissions() {
    this.log('📁 Checking file permissions...')
    
    const criticalPaths = [
      'logs',
      'uploads',
      'outputs',
      'temp'
    ]

    for (const dir of criticalPaths) {
      const dirPath = path.join(this.projectRoot, dir)
      if (!fs.existsSync(dirPath)) {
        this.log(`📁 Creating missing directory: ${dir}`, 'info')
        fs.mkdirSync(dirPath, { recursive: true })
        this.fixes.push(`Created directory: ${dir}`)
      }

      // Check write permissions
      try {
        const testFile = path.join(dirPath, '.test')
        fs.writeFileSync(testFile, 'test')
        fs.unlinkSync(testFile)
      } catch (error) {
        this.log(`❌ No write permission for ${dir}`, 'error')
        this.errors.push(`Permission issue: ${dir}`)
      }
    }
  }

  async checkEnvironmentVariables() {
    this.log('🔧 Checking environment variables...')
    
    const envPath = path.join(this.projectRoot, '.env')
    if (!fs.existsSync(envPath)) {
      this.log('❌ .env file not found, creating from template...', 'warn')
      const envExamplePath = path.join(this.projectRoot, 'env.example')
      if (fs.existsSync(envExamplePath)) {
        fs.copyFileSync(envExamplePath, envPath)
        this.fixes.push('Created .env file from template')
      } else {
        this.log('❌ env.example not found', 'error')
        this.errors.push('Missing environment configuration')
      }
    }
  }

  async checkDatabaseConnection() {
    this.log('🗄️  Checking database connection...')
    
    try {
      // Try to connect to Redis
      execSync('redis-cli ping', { stdio: 'ignore' })
      this.log('✅ Redis connection successful')
    } catch (error) {
      this.log('❌ Redis connection failed', 'error')
      this.errors.push('Redis connection failed')
      
      // Try to start Redis
      try {
        this.log('🔄 Attempting to start Redis...', 'info')
        execSync('brew services start redis', { stdio: 'inherit' })
        this.fixes.push('Started Redis service')
      } catch (startError) {
        this.log('❌ Failed to start Redis', 'error')
      }
    }
  }

  async checkWorkerProcesses() {
    this.log('⚙️  Checking worker processes...')
    
    try {
      // Check if any Node.js processes are running
      const processes = execSync('ps aux | grep node | grep -v grep', { encoding: 'utf8' })
      if (processes.trim()) {
        this.log('✅ Worker processes are running')
      } else {
        this.log('⚠️  No worker processes detected', 'warn')
        this.errors.push('No worker processes running')
      }
    } catch (error) {
      this.log('⚠️  No worker processes detected', 'warn')
      this.errors.push('No worker processes running')
    }
  }

  async checkDiskSpace() {
    this.log('💾 Checking disk space...')
    
    try {
      const df = execSync('df -h .', { encoding: 'utf8' })
      const lines = df.split('\n')
      if (lines.length > 1) {
        const parts = lines[1].split(/\s+/)
        const usedPercent = parseInt(parts[4].replace('%', ''))
        
        if (usedPercent > 90) {
          this.log(`❌ Disk space critical: ${parts[4]} used`, 'error')
          this.errors.push('Low disk space')
        } else if (usedPercent > 80) {
          this.log(`⚠️  Disk space warning: ${parts[4]} used`, 'warn')
        } else {
          this.log(`✅ Disk space OK: ${parts[4]} used`)
        }
      }
    } catch (error) {
      this.log('❌ Could not check disk space', 'error')
    }
  }

  async checkMemoryUsage() {
    this.log('🧠 Checking memory usage...')
    
    try {
      const memory = process.memoryUsage()
      const usedMB = Math.round(memory.heapUsed / 1024 / 1024)
      const totalMB = Math.round(memory.heapTotal / 1024 / 1024)
      
      this.log(`Memory usage: ${usedMB}MB / ${totalMB}MB`)
      
      if (usedMB > 500) {
        this.log('⚠️  High memory usage detected', 'warn')
        this.errors.push('High memory usage')
      }
    } catch (error) {
      this.log('❌ Could not check memory usage', 'error')
    }
  }

  async autoFixCommonIssues() {
    this.log('🔧 Attempting to fix common issues...')
    
    const fixes = [
      this.fixMissingDependencies(),
      this.fixPortConflicts(),
      this.fixFilePermissions(),
      this.fixEnvironmentSetup(),
      this.fixServiceStartup()
    ]

    for (const fix of fixes) {
      try {
        await fix
      } catch (error) {
        this.log(`Fix failed: ${error.message}`, 'error')
      }
    }
  }

  async fixMissingDependencies() {
    try {
      if (!fs.existsSync(path.join(this.projectRoot, 'node_modules'))) {
        this.log('📦 Installing missing dependencies...')
        execSync('pnpm install', { cwd: this.projectRoot, stdio: 'inherit' })
        this.fixes.push('Installed dependencies')
      }
    } catch (error) {
      this.log(`❌ Failed to install dependencies: ${error.message}`, 'error')
    }
  }

  async fixPortConflicts() {
    // Check for port conflicts and suggest solutions
    const ports = [3000, 4000, 6379]
    
    for (const port of ports) {
      try {
        execSync(`lsof -i :${port}`, { stdio: 'ignore' })
      } catch (error) {
        this.log(`⚠️  Port ${port} is available but not in use`, 'warn')
      }
    }
  }

  async fixFilePermissions() {
    const dirs = ['logs', 'uploads', 'outputs', 'temp']
    
    for (const dir of dirs) {
      const dirPath = path.join(this.projectRoot, dir)
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true })
        this.fixes.push(`Created directory: ${dir}`)
      }
    }
  }

  async fixEnvironmentSetup() {
    const envPath = path.join(this.projectRoot, '.env')
    const envExamplePath = path.join(this.projectRoot, 'env.example')
    
    if (!fs.existsSync(envPath) && fs.existsSync(envExamplePath)) {
      fs.copyFileSync(envExamplePath, envPath)
      this.fixes.push('Created .env file')
    }
  }

  async fixServiceStartup() {
    try {
      // Try to start Redis if not running
      execSync('redis-cli ping', { stdio: 'ignore' })
    } catch (error) {
      try {
        this.log('🔄 Starting Redis...')
        execSync('brew services start redis', { stdio: 'inherit' })
        this.fixes.push('Started Redis')
      } catch (startError) {
        this.log('❌ Failed to start Redis', 'error')
      }
    }
  }

  async checkCSSErrors() {
    this.log('🎨 Checking for CSS errors...')
    
    try {
      // Check if server is running to use API
      const serverHealth = await this.checkServerHealth()
      
      if (serverHealth) {
        // Use API to check CSS errors
        const response = await axios.get('http://localhost:4000/api/errors/check/css')
        const result = response.data.data
        
        if (result.errors.length > 0 || result.warnings.length > 0) {
          this.log(`⚠️  Found ${result.errors.length} CSS errors and ${result.warnings.length} warnings`, 'warn')
          
          // Auto-fix CSS errors
          this.log('🔧 Attempting to auto-fix CSS errors...')
          const fixResponse = await axios.post('http://localhost:4000/api/errors/auto-fix/css')
          const fixResult = fixResponse.data.data
          
          if (fixResult.fixed > 0) {
            this.log(`✅ Auto-fixed ${fixResult.fixed} CSS errors`, 'info')
            this.fixes.push(`Auto-fixed ${fixResult.fixed} CSS errors`)
          } else {
            this.log('❌ No CSS errors were auto-fixed', 'warn')
            this.errors.push('CSS errors detected but could not be auto-fixed')
          }
        } else {
          this.log('✅ No CSS errors found')
        }
      } else {
        // Fallback: manual CSS file checking
        await this.checkCSSFilesManually()
      }
    } catch (error) {
      this.log(`❌ CSS error check failed: ${error.message}`, 'error')
      this.errors.push(`CSS check failed: ${error.message}`)
    }
  }

  async checkCSSFilesManually() {
    this.log('🔍 Manually checking CSS files...')
    
    const cssFiles = [
      path.join(this.projectRoot, 'packages', 'web', 'src', 'index.css'),
      path.join(this.projectRoot, 'packages', 'web', 'src', 'App.css')
    ]
    
    const commonErrors = [
      'ring-offset-background',
      'focus-visible:ring-ring',
      'bg-background',
      'text-foreground',
      'border-border'
    ]
    
    let foundErrors = 0
    
    for (const cssFile of cssFiles) {
      if (fs.existsSync(cssFile)) {
        const content = fs.readFileSync(cssFile, 'utf8')
        
        for (const error of commonErrors) {
          if (content.includes(error)) {
            this.log(`⚠️  Found CSS error in ${cssFile}: ${error}`, 'warn')
            foundErrors++
          }
        }
      }
    }
    
    if (foundErrors > 0) {
      this.errors.push(`Found ${foundErrors} CSS errors in files`)
    } else {
      this.log('✅ No CSS errors found in files')
    }
  }

  async checkServerHealth() {
    try {
      const response = await axios.get('http://localhost:4000/health', { timeout: 5000 })
      return response.status === 200
    } catch (error) {
      return false
    }
  }

  generateReport() {
    const report = {
      timestamp: new Date().toISOString(),
      errors: this.errors,
      fixes: this.fixes,
      summary: {
        totalErrors: this.errors.length,
        totalFixes: this.fixes.length,
        status: this.errors.length === 0 ? 'healthy' : 'issues_detected'
      }
    }

    const reportPath = path.join(this.logsDir, `health-report-${new Date().toISOString().split('T')[0]}.json`)
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2))
    
    this.log(`📊 Health report saved to: ${reportPath}`)
    
    return report
  }

  async run() {
    this.log('🚀 Starting GolfVision Error Monitor...')
    
    await this.checkSystemHealth()
    await this.autoFixCommonIssues()
    
    const report = this.generateReport()
    
    if (report.summary.status === 'healthy') {
      this.log('✅ System is healthy!', 'info')
      process.exit(0)
    } else {
      this.log(`⚠️  System has ${report.summary.totalErrors} issues`, 'warn')
      process.exit(1)
    }
  }
}

// Run the monitor
if (require.main === module) {
  const monitor = new ErrorMonitor()
  monitor.run().catch(error => {
    console.error('❌ Error monitor failed:', error)
    process.exit(1)
  })
}

module.exports = ErrorMonitor
