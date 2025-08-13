#!/usr/bin/env node

const axios = require('axios')

const API_BASE_URL = process.env.API_URL || 'http://localhost:4000'

async function runDemo() {
  console.log('🎬 GolfVision Demo - Creating a sample job...')
  
  try {
    // Create a demo job
    const jobData = {
      courseName: 'Pebble Beach Golf Links',
      seed: 12345
    }
    
    console.log(`📝 Creating job for: ${jobData.courseName}`)
    
    const response = await axios.post(`${API_BASE_URL}/api/jobs`, jobData, {
      headers: {
        'Content-Type': 'application/json'
      }
    })
    
    if (response.data.success) {
      const job = response.data.data
      console.log(`✅ Job created successfully!`)
      console.log(`🆔 Job ID: ${job.id}`)
      console.log(`📊 Status: ${job.status}`)
      console.log(`📈 Progress: ${job.progress}%`)
      
      // Monitor job progress
      console.log('\n📊 Monitoring job progress...')
      await monitorJob(job.id)
      
    } else {
      console.error('❌ Failed to create job:', response.data.error)
    }
    
  } catch (error) {
    console.error('❌ Demo failed:', error.message)
    if (error.response) {
      console.error('Response:', error.response.data)
    }
  }
}

async function monitorJob(jobId) {
  const maxAttempts = 60 // 5 minutes with 5-second intervals
  let attempts = 0
  
  while (attempts < maxAttempts) {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/jobs/${jobId}`)
      const job = response.data.data
      
      console.log(`⏳ Status: ${job.status} (${job.progress}%)`)
      
      if (job.status === 'completed') {
        console.log('\n🎉 Job completed successfully!')
        if (job.output) {
          console.log(`📹 Video: ${job.output.videoUrl}`)
          console.log(`📝 Captions: ${job.output.captionsUrl}`)
          console.log(`🖼️  Preview: ${job.output.previewUrl}`)
        }
        return
      }
      
      if (job.status === 'failed') {
        console.log('\n❌ Job failed!')
        if (job.errors) {
          job.errors.forEach(error => console.error(`Error: ${error}`))
        }
        return
      }
      
      // Wait 5 seconds before next check
      await new Promise(resolve => setTimeout(resolve, 5000))
      attempts++
      
    } catch (error) {
      console.error('❌ Error monitoring job:', error.message)
      attempts++
    }
  }
  
  console.log('\n⏰ Demo timeout - job may still be processing')
}

// Health check before running demo
async function healthCheck() {
  try {
    const response = await axios.get(`${API_BASE_URL}/health`)
    console.log('✅ Server is healthy')
    return true
  } catch (error) {
    console.error('❌ Server health check failed:', error.message)
    console.log('💡 Make sure the server is running with: make up')
    return false
  }
}

async function main() {
  console.log('🏌️‍♂️ GolfVision Demo')
  console.log('==================\n')
  
  const isHealthy = await healthCheck()
  if (!isHealthy) {
    process.exit(1)
  }
  
  await runDemo()
}

if (require.main === module) {
  main().catch(console.error)
}

module.exports = { runDemo, monitorJob, healthCheck }
