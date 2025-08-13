import ffmpeg from 'fluent-ffmpeg'
import { promisify } from 'util'
import fs from 'fs-extra'
import path from 'path'
import logger from '../utils/logger'
import { FFmpegConfig, VideoOutput, VideoMetadata, CaptionConfig, AudioConfig } from '../types'

export class VideoProcessor {
  private config: FFmpegConfig

  constructor(config: FFmpegConfig) {
    this.config = config
    // Set FFmpeg path if provided
    if (config.executable && config.executable !== 'ffmpeg') {
      ffmpeg.setFfmpegPath(config.executable)
    }
  }

  async checkFFmpegAvailability(): Promise<boolean> {
    try {
      const { exec } = require('child_process')
      const execAsync = promisify(exec)
      const { stdout } = await execAsync(`${this.config.executable} -version`)
      logger.info('FFmpeg is available', { version: stdout.split('\n')[0] })
      return true
    } catch (error) {
      logger.error('FFmpeg not available', { error: error.message })
      return false
    }
  }

  async processVideo(
    inputPath: string,
    outputPath: string,
    options: {
      captions?: CaptionConfig
      audio?: AudioConfig
      duration?: number
      resolution?: [number, number]
    } = {}
  ): Promise<VideoOutput> {
    const startTime = Date.now()
    
    try {
      logger.info('Starting video processing', { inputPath, outputPath })

      // Ensure output directory exists
      await fs.ensureDir(path.dirname(outputPath))

      // Build FFmpeg command
      const command = this.buildFFmpegCommand(inputPath, outputPath, options)
      
      // Execute FFmpeg
      await this.executeFFmpeg(command)
      
      // Get video metadata
      const metadata = await this.getVideoMetadata(outputPath)
      
      // Get file size
      const stats = await fs.stat(outputPath)
      
      const processingTime = Date.now() - startTime
      
      const videoOutput: VideoOutput = {
        videoPath: outputPath,
        thumbnailPath: await this.generateThumbnail(outputPath),
        captionsPath: options.captions?.enabled ? await this.generateCaptions(outputPath, options.captions) : '',
        audioPath: options.audio?.backgroundMusic || '',
        metadata: {
          ...metadata,
          createdAt: new Date().toISOString()
        },
        processingTime,
        fileSize: stats.size
      }

      logger.info('Video processing completed', {
        outputPath,
        processingTime,
        fileSize: stats.size
      })

      return videoOutput
    } catch (error) {
      logger.error('Video processing failed', { error: error.message })
      throw error
    }
  }

  private buildFFmpegCommand(
    inputPath: string,
    outputPath: string,
    options: {
      captions?: CaptionConfig
      audio?: AudioConfig
      duration?: number
      resolution?: [number, number]
    }
  ): ffmpeg.FfmpegCommand {
    const command = ffmpeg(inputPath)
      .outputOptions([
        `-c:v libx264`,
        `-preset ${this.config.preset}`,
        `-crf ${this.config.crf}`,
        `-maxrate ${this.config.maxBitrate}`,
        `-bufsize ${this.config.maxBitrate}`,
        `-threads ${this.config.threads}`,
        `-movflags +faststart`
      ])

    // Set resolution if provided
    if (options.resolution) {
      command.size(`${options.resolution[0]}x${options.resolution[1]}`)
    }

    // Set duration if provided
    if (options.duration) {
      command.duration(options.duration)
    }

    // Add audio processing
    if (options.audio?.backgroundMusic) {
      command
        .input(options.audio.backgroundMusic)
        .complexFilter([
          `[0:a]volume=${options.audio.voiceoverVolume}[voice]`,
          `[1:a]volume=${options.audio.volume}[music]`,
          `[voice][music]amix=inputs=2:duration=longest[a]`
        ])
        .outputOptions(['-map 0:v', '-map [a]'])
    }

    // Add captions if enabled
    if (options.captions?.enabled) {
      const captionFilter = this.buildCaptionFilter(options.captions)
      command.complexFilter(captionFilter)
    }

    return command.output(outputPath)
  }

  private buildCaptionFilter(captions: CaptionConfig): string[] {
    const filters = []
    
    // Base text filter
    let textFilter = `drawtext=text='Welcome to ${captions.style === 'professional' ? 'the' : ''} Golf Course'`
    textFilter += `:fontfile=${captions.font}`
    textFilter += `:fontsize=${captions.fontSize}`
    textFilter += `:fontcolor=${captions.color}`
    
    // Position
    switch (captions.position) {
      case 'top':
        textFilter += ':x=(w-text_w)/2:y=50'
        break
      case 'bottom':
        textFilter += ':x=(w-text_w)/2:y=h-text_h-50'
        break
      case 'middle':
        textFilter += ':x=(w-text_w)/2:y=(h-text_h)/2'
        break
    }
    
    // Animation for animated style
    if (captions.style === 'animated') {
      textFilter += `:enable='between(t,0,3)'`
    }
    
    filters.push(textFilter)
    
    return filters
  }

  private async executeFFmpeg(command: ffmpeg.FfmpegCommand): Promise<void> {
    return new Promise((resolve, reject) => {
      command
        .on('start', (commandLine) => {
          logger.info('FFmpeg command started', { command: commandLine })
        })
        .on('progress', (progress) => {
          logger.debug('FFmpeg progress', { 
            percent: progress.percent,
            timemark: progress.timemark 
          })
        })
        .on('end', () => {
          logger.info('FFmpeg processing completed')
          resolve()
        })
        .on('error', (error) => {
          logger.error('FFmpeg processing failed', { error: error.message })
          reject(error)
        })
        .run()
    })
  }

  private async getVideoMetadata(videoPath: string): Promise<VideoMetadata> {
    return new Promise((resolve, reject) => {
      ffmpeg.ffprobe(videoPath, (error, metadata) => {
        if (error) {
          reject(error)
          return
        }

        const videoStream = metadata.streams.find(s => s.codec_type === 'video')
        const audioStream = metadata.streams.find(s => s.codec_type === 'audio')

        const videoMetadata: VideoMetadata = {
          duration: metadata.format.duration || 0,
          resolution: [
            videoStream?.width || 1920,
            videoStream?.height || 1080
          ],
          fps: eval(videoStream?.r_frame_rate || '30/1'),
          bitrate: metadata.format.bit_rate ? parseInt(metadata.format.bit_rate) : 0,
          codec: videoStream?.codec_name || 'unknown',
          audioCodec: audioStream?.codec_name || 'unknown',
          courseName: '',
          createdAt: new Date().toISOString()
        }

        resolve(videoMetadata)
      })
    })
  }

  private async generateThumbnail(videoPath: string): Promise<string> {
    const thumbnailPath = videoPath.replace(/\.[^/.]+$/, '_thumb.jpg')
    
    return new Promise((resolve, reject) => {
      ffmpeg(videoPath)
        .screenshots({
          timestamps: ['50%'],
          filename: path.basename(thumbnailPath),
          folder: path.dirname(thumbnailPath),
          size: '320x240'
        })
        .on('end', () => resolve(thumbnailPath))
        .on('error', reject)
    })
  }

  private async generateCaptions(videoPath: string, captions: CaptionConfig): Promise<string> {
    const captionsPath = videoPath.replace(/\.[^/.]+$/, '.srt')
    
    // Generate simple SRT captions
    const srtContent = this.generateSRTCaptions(captions)
    await fs.writeFile(captionsPath, srtContent)
    
    return captionsPath
  }

  private generateSRTCaptions(captions: CaptionConfig): string {
    const courseName = 'Golf Course'
    const duration = 90 // 90 seconds
    
    let srtContent = ''
    let subtitleIndex = 1
    
    // Welcome subtitle
    srtContent += `${subtitleIndex}\n`
    srtContent += `00:00:00,000 --> 00:00:03,000\n`
    srtContent += `Welcome to ${courseName}\n\n`
    subtitleIndex++
    
    // Course overview
    srtContent += `${subtitleIndex}\n`
    srtContent += `00:00:03,000 --> 00:00:08,000\n`
    srtContent += `Experience the beauty and challenge\n`
    srtContent += `of our championship course\n\n`
    subtitleIndex++
    
    // Features
    srtContent += `${subtitleIndex}\n`
    srtContent += `00:00:08,000 --> 00:00:15,000\n`
    srtContent += `Featuring pristine fairways,\n`
    srtContent += `challenging bunkers, and stunning views\n\n`
    subtitleIndex++
    
    // Call to action
    srtContent += `${subtitleIndex}\n`
    srtContent += `00:00:15,000 --> 00:00:20,000\n`
    srtContent += `Book your tee time today\n`
    srtContent += `and discover golfing excellence\n\n`
    
    return srtContent
  }

  async createStoryboardVideo(
    courseName: string,
    outputPath: string,
    options: {
      duration?: number
      resolution?: [number, number]
    } = {}
  ): Promise<VideoOutput> {
    const startTime = Date.now()
    
    try {
      logger.info('Creating storyboard video', { courseName, outputPath })
      
      // Create a simple color video with text overlay
      const command = ffmpeg()
        .input('color=black:size=1920x1080:duration=30')
        .input('anullsrc=channel_layout=stereo:sample_rate=44100')
        .outputOptions([
          '-c:v libx264',
          '-preset fast',
          '-crf 23',
          '-c:a aac',
          '-b:a 128k',
          '-shortest'
        ])
        .complexFilter([
          `drawtext=text='${courseName}':fontsize=72:fontcolor=white:x=(w-text_w)/2:y=(h-text_h)/2`
        ])
        .output(outputPath)
      
      await this.executeFFmpeg(command)
      
      const metadata = await this.getVideoMetadata(outputPath)
      const stats = await fs.stat(outputPath)
      
      const videoOutput: VideoOutput = {
        videoPath: outputPath,
        thumbnailPath: await this.generateThumbnail(outputPath),
        captionsPath: '',
        audioPath: '',
        metadata: {
          ...metadata,
          courseName,
          createdAt: new Date().toISOString()
        },
        processingTime: Date.now() - startTime,
        fileSize: stats.size
      }
      
      return videoOutput
    } catch (error) {
      logger.error('Storyboard video creation failed', { error: error.message })
      throw error
    }
  }
}
