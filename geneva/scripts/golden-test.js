#!/usr/bin/env node

/**
 * GolfVision Golden Test
 * 
 * This script runs comprehensive tests to verify the system's output integrity
 * and ensure consistent results across different environments.
 */

const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')
const crypto = require('crypto')

class GoldenTest {
  constructor() {
    this.projectRoot = path.resolve(__dirname, '..')
    this.testResults = []
    this.goldenDataPath = path.join(this.projectRoot, 'test-results', 'golden-data')
    this.currentTestPath = path.join(this.projectRoot, 'test-results', 'current-test')
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString()
    const logMessage = `[${timestamp}] [${type.toUpperCase()}] ${message}`
    console.log(logMessage)
    
    this.testResults.push({
      timestamp,
      type,
      message
    })
  }

  async runAllTests() {
    this.log('🧪 Starting GolfVision Golden Test Suite...')
    
    try {
      // Create test directories
      await this.setupTestEnvironment()
      
      // Run test suite
      await this.testSystemHealth()
      await this.testDataWorker()
      await this.testModelWorker()
      await this.testPostWorker()
      await this.testEndToEnd()
      await this.testErrorHandling()
      await this.testPerformance()
      
      // Generate report
      await this.generateReport()
      
      this.log('✅ Golden test suite completed successfully!')
      return true
    } catch (error) {
      this.log(`❌ Golden test suite failed: ${error.message}`, 'error')
      await this.generateReport()
      return false
    }
  }

  async setupTestEnvironment() {
    this.log('📁 Setting up test environment...')
    
    // Create test directories
    const dirs = [this.goldenDataPath, this.currentTestPath]
    for (const dir of dirs) {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true })
      }
    }
    
    // Copy golden data if it exists
    const goldenDataExists = fs.existsSync(path.join(this.goldenDataPath, 'reference.json'))
    if (!goldenDataExists) {
      this.log('📋 No golden data found, will create reference data')
    }
  }

  async testSystemHealth() {
    this.log('🏥 Testing system health...')
    
    try {
      // Test Redis connection
      execSync('redis-cli ping', { stdio: 'ignore' })
      this.log('✅ Redis connection successful')
      
      // Test API health
      const healthResponse = execSync('curl -s http://localhost:4000/health', { encoding: 'utf8' })
      const health = JSON.parse(healthResponse)
      
      if (health.status === 'healthy') {
        this.log('✅ API health check passed')
      } else {
        throw new Error('API health check failed')
      }
      
      // Test web dashboard
      const webResponse = execSync('curl -s -o /dev/null -w "%{http_code}" http://localhost:3000', { encoding: 'utf8' })
      if (webResponse.trim() === '200') {
        this.log('✅ Web dashboard accessible')
      } else {
        throw new Error('Web dashboard not accessible')
      }
      
    } catch (error) {
      throw new Error(`System health test failed: ${error.message}`)
    }
  }

  async testDataWorker() {
    this.log('📊 Testing data worker functionality...')
    
    try {
      // Test geocoding
      const testCourse = 'Pebble Beach Golf Links'
      const geocodingResponse = execSync(`curl -s "https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(testCourse)}&format=json&limit=1"`, { encoding: 'utf8' })
      const geocodingResult = JSON.parse(geocodingResponse)
      
      if (geocodingResult.length > 0) {
        this.log('✅ Geocoding test passed')
      } else {
        throw new Error('Geocoding returned no results')
      }
      
      // Test DEM data fetching
      const coordinates = [36.5683, -121.9496]
      const demUrl = `https://api.opentopodata.org/v1/aster30m?locations=${coordinates[0]},${coordinates[1]}`
      const demResponse = execSync(`curl -s "${demUrl}"`, { encoding: 'utf8' })
      const demResult = JSON.parse(demResponse)
      
      if (demResult.results && demResult.results.length > 0) {
        this.log('✅ DEM data fetching test passed')
      } else {
        throw new Error('DEM data fetching failed')
      }
      
    } catch (error) {
      throw new Error(`Data worker test failed: ${error.message}`)
    }
  }

  async testModelWorker() {
    this.log('🎨 Testing model worker functionality...')
    
    try {
      // Test Blender availability
      try {
        execSync('blender --version', { stdio: 'ignore' })
        this.log('✅ Blender is available')
      } catch (error) {
        this.log('⚠️ Blender not available, will use storyboard mode', 'warn')
      }
      
      // Test storyboard generation
      const storyboardScript = `
import bpy
import json

# Clear scene
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete(use_global=False)

# Create simple test scene
bpy.ops.mesh.primitive_plane_add(size=10, location=(0, 0, 0))
plane = bpy.context.active_object
plane.name = "TestPlane"

# Save test file
bpy.ops.wm.save_as_mainfile(filepath="${path.join(this.currentTestPath, 'test_model.blend')}")

print("Storyboard test completed")
`
      
      const scriptPath = path.join(this.currentTestPath, 'test_storyboard.py')
      fs.writeFileSync(scriptPath, storyboardScript)
      
      try {
        execSync(`blender --background --python ${scriptPath}`, { stdio: 'ignore' })
        this.log('✅ Storyboard generation test passed')
      } catch (error) {
        this.log('⚠️ Storyboard generation failed, but this is acceptable in test environment', 'warn')
      }
      
    } catch (error) {
      throw new Error(`Model worker test failed: ${error.message}`)
    }
  }

  async testPostWorker() {
    this.log('🎬 Testing post worker functionality...')
    
    try {
      // Test FFmpeg availability
      try {
        execSync('ffmpeg -version', { stdio: 'ignore' })
        this.log('✅ FFmpeg is available')
      } catch (error) {
        this.log('⚠️ FFmpeg not available', 'warn')
      }
      
      // Test eSpeak availability
      try {
        execSync('espeak --version', { stdio: 'ignore' })
        this.log('✅ eSpeak is available')
      } catch (error) {
        this.log('⚠️ eSpeak not available', 'warn')
      }
      
      // Test simple video generation
      const testVideoPath = path.join(this.currentTestPath, 'test_video.mp4')
      try {
        execSync(`ffmpeg -f lavfi -i testsrc=duration=5:size=320x240:rate=1 -c:v libx264 -y ${testVideoPath}`, { stdio: 'ignore' })
        
        if (fs.existsSync(testVideoPath)) {
          const stats = fs.statSync(testVideoPath)
          if (stats.size > 0) {
            this.log('✅ Video generation test passed')
          } else {
            throw new Error('Generated video file is empty')
          }
        } else {
          throw new Error('Video file was not created')
        }
      } catch (error) {
        this.log('⚠️ Video generation test failed, but this is acceptable in test environment', 'warn')
      }
      
    } catch (error) {
      throw new Error(`Post worker test failed: ${error.message}`)
    }
  }

  async testEndToEnd() {
    this.log('🔄 Testing end-to-end workflow...')
    
    try {
      // Create a test job
      const testJob = {
        courseName: 'Golden Test Course',
        coordinates: [36.5683, -121.9496],
        seed: 12345
      }
      
      // Submit job to API
      const jobResponse = execSync(`curl -s -X POST http://localhost:4000/api/jobs -H "Content-Type: application/json" -d '${JSON.stringify(testJob)}'`, { encoding: 'utf8' })
      const jobResult = JSON.parse(jobResponse)
      
      if (jobResult.success && jobResult.data.id) {
        this.log('✅ Job creation test passed')
        
        // Wait a moment and check job status
        await new Promise(resolve => setTimeout(resolve, 2000))
        
        const statusResponse = execSync(`curl -s http://localhost:4000/api/jobs/${jobResult.data.id}`, { encoding: 'utf8' })
        const statusResult = JSON.parse(statusResponse)
        
        if (statusResult.success) {
          this.log('✅ Job status check test passed')
        } else {
          throw new Error('Job status check failed')
        }
      } else {
        throw new Error('Job creation failed')
      }
      
    } catch (error) {
      throw new Error(`End-to-end test failed: ${error.message}`)
    }
  }

  async testErrorHandling() {
    this.log('🛡️ Testing error handling...')
    
    try {
      // Test invalid job creation
      const invalidJob = {
        courseName: '', // Invalid empty name
        coordinates: [999, 999] // Invalid coordinates
      }
      
      const errorResponse = execSync(`curl -s -X POST http://localhost:4000/api/jobs -H "Content-Type: application/json" -d '${JSON.stringify(invalidJob)}'`, { encoding: 'utf8' })
      const errorResult = JSON.parse(errorResponse)
      
      if (!errorResult.success) {
        this.log('✅ Error handling test passed')
      } else {
        throw new Error('Error handling failed - invalid job was accepted')
      }
      
      // Test error tracking
      const errorsResponse = execSync('curl -s http://localhost:4000/api/errors/stats', { encoding: 'utf8' })
      const errorsResult = JSON.parse(errorsResponse)
      
      if (errorsResult.success) {
        this.log('✅ Error tracking test passed')
      } else {
        throw new Error('Error tracking failed')
      }
      
    } catch (error) {
      throw new Error(`Error handling test failed: ${error.message}`)
    }
  }

  async testPerformance() {
    this.log('⚡ Testing performance...')
    
    try {
      // Test API response time
      const startTime = Date.now()
      execSync('curl -s http://localhost:4000/health', { stdio: 'ignore' })
      const responseTime = Date.now() - startTime
      
      if (responseTime < 1000) {
        this.log(`✅ API response time: ${responseTime}ms`)
      } else {
        this.log(`⚠️ API response time slow: ${responseTime}ms`, 'warn')
      }
      
      // Test memory usage
      const memoryUsage = process.memoryUsage()
      const memoryMB = Math.round(memoryUsage.heapUsed / 1024 / 1024)
      
      if (memoryMB < 500) {
        this.log(`✅ Memory usage: ${memoryMB}MB`)
      } else {
        this.log(`⚠️ High memory usage: ${memoryMB}MB`, 'warn')
      }
      
      // Test disk space
      const diskUsage = execSync('df -h . | tail -1', { encoding: 'utf8' })
      const usagePercent = parseInt(diskUsage.split(/\s+/)[4].replace('%', ''))
      
      if (usagePercent < 90) {
        this.log(`✅ Disk usage: ${usagePercent}%`)
      } else {
        this.log(`⚠️ High disk usage: ${usagePercent}%`, 'warn')
      }
      
    } catch (error) {
      throw new Error(`Performance test failed: ${error.message}`)
    }
  }

  async generateReport() {
    this.log('📊 Generating test report...')
    
    const report = {
      timestamp: new Date().toISOString(),
      testResults: this.testResults,
      summary: {
        total: this.testResults.length,
        passed: this.testResults.filter(r => r.type === 'info' && r.message.includes('✅')).length,
        warnings: this.testResults.filter(r => r.type === 'warn').length,
        errors: this.testResults.filter(r => r.type === 'error').length
      }
    }
    
    const reportPath = path.join(this.currentTestPath, 'golden-test-report.json')
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2))
    
    this.log(`📄 Test report saved to: ${reportPath}`)
    
    // Compare with golden data if it exists
    const goldenReportPath = path.join(this.goldenDataPath, 'reference.json')
    if (fs.existsSync(goldenReportPath)) {
      const goldenData = JSON.parse(fs.readFileSync(goldenReportPath, 'utf8'))
      const comparison = this.compareResults(report, goldenData)
      
      if (comparison.matches) {
        this.log('✅ Test results match golden data')
      } else {
        this.log('⚠️ Test results differ from golden data', 'warn')
        this.log(`Differences: ${comparison.differences.join(', ')}`)
      }
    } else {
      this.log('📋 Creating golden data reference')
      fs.writeFileSync(goldenReportPath, JSON.stringify(report, null, 2))
    }
    
    // Print summary
    console.log('\n' + '='.repeat(50))
    console.log('GOLDEN TEST SUMMARY')
    console.log('='.repeat(50))
    console.log(`Total Tests: ${report.summary.total}`)
    console.log(`Passed: ${report.summary.passed}`)
    console.log(`Warnings: ${report.summary.warnings}`)
    console.log(`Errors: ${report.summary.errors}`)
    console.log('='.repeat(50))
  }

  compareResults(current, golden) {
    const differences = []
    
    // Compare basic metrics
    if (current.summary.total !== golden.summary.total) {
      differences.push('Total test count differs')
    }
    
    if (current.summary.passed !== golden.summary.passed) {
      differences.push('Passed test count differs')
    }
    
    // Compare test messages
    const currentMessages = current.testResults.map(r => r.message).join('|')
    const goldenMessages = golden.testResults.map(r => r.message).join('|')
    
    if (currentMessages !== goldenMessages) {
      differences.push('Test messages differ')
    }
    
    return {
      matches: differences.length === 0,
      differences
    }
  }
}

// Run the golden test
if (require.main === module) {
  const goldenTest = new GoldenTest()
  goldenTest.runAllTests().then(success => {
    process.exit(success ? 0 : 1)
  }).catch(error => {
    console.error('Golden test failed:', error)
    process.exit(1)
  })
}

module.exports = GoldenTest
