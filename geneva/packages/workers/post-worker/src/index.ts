import { Worker, Job } from 'bullmq'
import Redis from 'ioredis'
import dotenv from 'dotenv'
import path from 'path'
import fs from 'fs-extra'
import logger from './utils/logger'
import { VideoProcessor } from './ffmpeg/videoProcessor'
import { PostJobData, VideoOutput, FFmpegConfig, TTSConfig, CaptionConfig, AudioConfig } from './types'

dotenv.config()

// Redis connection
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
  maxRetriesPerRequest: 3,
  retryDelayOnFailover: 100,
  enableReadyCheck: false,
  maxRetriesPerRequest: null
})

// FFmpeg configuration
const ffmpegConfig: FFmpegConfig = {
  executable: process.env.FFMPEG_EXECUTABLE || 'ffmpeg',
  threads: parseInt(process.env.FFMPEG_THREADS || '4'),
  preset: process.env.FFMPEG_PRESET || 'medium',
  crf: parseInt(process.env.FFMPEG_CRF || '23'),
  maxBitrate: process.env.FFMPEG_MAX_BITRATE || '5M',
  timeout: parseInt(process.env.FFMPEG_TIMEOUT || '300000') // 5 minutes
}

// TTS configuration
const ttsConfig: TTSConfig = {
  engine: (process.env.TTS_ENGINE as 'piper' | 'espeak' | 'gtts') || 'espeak',
  voice: process.env.TTS_VOICE || 'en-us',
  language: process.env.TTS_LANGUAGE || 'en',
  speed: parseFloat(process.env.TTS_SPEED || '1.0'),
  pitch: parseFloat(process.env.TTS_PITCH || '1.0')
}

// Caption configuration
const captionConfig: CaptionConfig = {
  enabled: process.env.CAPTIONS_ENABLED === 'true',
  font: process.env.CAPTIONS_FONT || '/System/Library/Fonts/Arial.ttf',
  fontSize: parseInt(process.env.CAPTIONS_FONT_SIZE || '24'),
  color: process.env.CAPTIONS_COLOR || 'white',
  position: (process.env.CAPTIONS_POSITION as 'top' | 'bottom' | 'middle') || 'bottom',
  style: (process.env.CAPTIONS_STYLE as 'simple' | 'animated' | 'professional') || 'professional'
}

// Audio configuration
const audioConfig: AudioConfig = {
  backgroundMusic: process.env.BACKGROUND_MUSIC_PATH || '',
  volume: parseFloat(process.env.MUSIC_VOLUME || '0.3'),
  fadeIn: parseFloat(process.env.MUSIC_FADE_IN || '2.0'),
  fadeOut: parseFloat(process.env.MUSIC_FADE_OUT || '2.0'),
  voiceoverVolume: parseFloat(process.env.VOICEOVER_VOLUME || '0.8')
}

// Initialize video processor
const videoProcessor = new VideoProcessor(ffmpegConfig)

// Create post worker
const postWorker = new Worker('post-worker', async (job: Job) => {
  const jobData = job.data as PostJobData
  logger.info(`Processing post-production job ${job.id} for course: ${jobData.courseName}`)

  try {
    // Check FFmpeg availability
    const ffmpegAvailable = await videoProcessor.checkFFmpegAvailability()
    
    if (!ffmpegAvailable) {
      logger.error('FFmpeg not available, cannot process video', { jobId: job.id })
      throw new Error('FFmpeg not available')
    }

    // Create output directory
    const outputPath = path.join(process.cwd(), 'outputs', `video_${jobData.jobId}`)
    await fs.ensureDir(outputPath)

    let videoOutput: VideoOutput

    // Check if we have model output or need to create storyboard
    if (jobData.modelOutput.fallbackUsed) {
      // Use storyboard mode
      logger.info('Using storyboard mode for video creation', { jobId: job.id })
      videoOutput = await videoProcessor.createStoryboardVideo(
        jobData.courseName,
        path.join(outputPath, 'final_video.mp4'),
        {
          duration: 30,
          resolution: [1920, 1080]
        }
      )
    } else {
      // Process the 3D rendered frames
      const framesPath = path.join(jobData.modelOutput.modelPath, 'frames')
      
      if (await fs.pathExists(framesPath)) {
        // Process rendered frames
        const inputPattern = path.join(framesPath, 'frame_%04d.png')
        videoOutput = await videoProcessor.processVideo(
          inputPattern,
          path.join(outputPath, 'final_video.mp4'),
          {
            captions: captionConfig,
            audio: audioConfig,
            resolution: [1920, 1080]
          }
        )
      } else {
        // Fallback to storyboard if no frames found
        logger.warn('No rendered frames found, using storyboard mode', { jobId: job.id })
        videoOutput = await videoProcessor.createStoryboardVideo(
          jobData.courseName,
          path.join(outputPath, 'final_video.mp4')
        )
      }
    }

    // Generate voiceover if TTS is available
    if (ttsConfig.engine !== 'none') {
      try {
        const voiceoverPath = await generateVoiceover(jobData.courseName, outputPath, ttsConfig)
        videoOutput.audioPath = voiceoverPath
      } catch (error) {
        logger.warn('Voiceover generation failed, continuing without audio', { error: error.message })
      }
    }

    logger.info(`Post-production completed for job ${job.id}`, {
      outputPath: videoOutput.videoPath,
      processingTime: videoOutput.processingTime
    })

    return videoOutput
  } catch (error) {
    logger.error(`Post-production job ${job.id} failed:`, error)
    throw error
  }
}, { 
  connection: redis, 
  concurrency: parseInt(process.env.MAX_CONCURRENT_POST_JOBS || '2') 
})

// Event handlers
postWorker.on('completed', (job: Job, result: VideoOutput) => {
  logger.info(`Post-production job ${job.id} completed successfully`, {
    videoPath: result.videoPath,
    processingTime: result.processingTime
  })
})

postWorker.on('failed', (job: Job, error: Error) => {
  logger.error(`Post-production job ${job.id} failed:`, error)
})

postWorker.on('error', (error: Error) => {
  logger.error('Post-production worker error:', error)
})

// Voiceover generation function
async function generateVoiceover(
  courseName: string,
  outputPath: string,
  ttsConfig: TTSConfig
): Promise<string> {
  const voiceoverPath = path.join(outputPath, 'voiceover.wav')
  
  try {
    const { exec } = require('child_process')
    const { promisify } = require('util')
    const execAsync = promisify(exec)

    const text = `Welcome to ${courseName}. Experience the beauty and challenge of our championship course. Book your tee time today and discover golfing excellence.`

    let command: string

    switch (ttsConfig.engine) {
      case 'espeak':
        command = `espeak -v ${ttsConfig.voice} -s ${Math.round(150 * ttsConfig.speed)} -p ${Math.round(50 * ttsConfig.pitch)} "${text}" -w ${voiceoverPath}`
        break
      case 'piper':
        // Piper TTS command (if available)
        command = `echo "${text}" | piper --model ${ttsConfig.voice} --output_file ${voiceoverPath}`
        break
      default:
        throw new Error(`Unsupported TTS engine: ${ttsConfig.engine}`)
    }

    await execAsync(command)
    logger.info('Voiceover generated successfully', { path: voiceoverPath })
    return voiceoverPath
  } catch (error) {
    logger.error('Voiceover generation failed', { error: error.message })
    throw error
  }
}

// Graceful shutdown
const shutdown = async () => {
  logger.info('Shutting down post-production worker...')
  await postWorker.close()
  await redis.quit()
  process.exit(0)
}

process.on('SIGTERM', shutdown)
process.on('SIGINT', shutdown)

logger.info('Post-production worker started', {
  ffmpegExecutable: ffmpegConfig.executable,
  ttsEngine: ttsConfig.engine,
  captionsEnabled: captionConfig.enabled,
  maxConcurrentJobs: parseInt(process.env.MAX_CONCURRENT_POST_JOBS || '2')
})
