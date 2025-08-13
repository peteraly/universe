#!/usr/bin/env node

const { videoGeneratorService } = require('../dist/services/videoGenerator')
const { jobProcessorService } = require('../dist/services/jobProcessor')

async function testVideoGeneration() {
  console.log('🎬 Testing Real Video Generation...\n')

  try {
    // Create a test job
    const testJob = await jobProcessorService.createJob(
      'Bacon Park Golf Course',
      [32.0748, -81.0943],
      12345
    )

    console.log(`✅ Created test job: ${testJob.id}`)
    console.log(`📍 Course: ${testJob.courseName}`)
    console.log(`🎯 Coordinates: ${testJob.coordinates}`)
    console.log(`🎲 Seed: ${testJob.seed}\n`)

    // Test the video generation service directly
    console.log('🎥 Starting video generation...')
    const startTime = Date.now()

    const output = await videoGeneratorService.generateVideo(testJob)
    const duration = Date.now() - startTime

    console.log(`✅ Video generation completed in ${duration}ms`)
    console.log(`📹 Video URL: ${output.videoUrl}`)
    console.log(`📝 Captions URL: ${output.captionsUrl}`)
    console.log(`🖼️  Thumbnail URL: ${output.thumbnailUrl}`)
    console.log(`⏱️  Duration: ${output.metadata.duration}s`)
    console.log(`📐 Resolution: ${output.metadata.resolution}`)
    console.log(`💾 File Size: ${(output.metadata.fileSize / 1024 / 1024).toFixed(2)} MB`)
    console.log(`🎬 FPS: ${output.metadata.fps}`)
    console.log(`🔧 Codec: ${output.metadata.codec}`)

    // Cleanup
    await videoGeneratorService.cleanupTempFiles(testJob.id)
    console.log('\n🧹 Cleaned up temporary files')

  } catch (error) {
    console.error('❌ Video generation failed:', error.message)
    process.exit(1)
  }
}

// Run the test
testVideoGeneration()
  .then(() => {
    console.log('\n🎉 Test completed successfully!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n💥 Test failed:', error)
    process.exit(1)
  })
