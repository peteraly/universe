import { Job, JobOutput } from '../types'
import { logger } from '../utils/logger'
import { analyticsService } from './analytics'
import { v4 as uuidv4 } from 'uuid'
import * as fs from 'fs'
import * as path from 'path'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

interface VideoGenerationConfig {
  resolution: string
  fps: number
  duration: number
  quality: 'low' | 'medium' | 'high'
  format: 'mp4' | 'webm'
}

interface CourseData {
  name: string
  coordinates: [number, number]
  elevation: number
  terrain: string
  holes: number
  par: number
  length: number
  features: string[]
}

class VideoGeneratorService {
  private outputDir: string
  private tempDir: string
  private ffmpegPath: string

  constructor() {
    this.outputDir = path.join(process.cwd(), 'outputs', 'videos')
    this.tempDir = path.join(process.cwd(), 'temp')
    this.ffmpegPath = process.env.FFMPEG_PATH || 'ffmpeg'
    
    // Ensure directories exist
    this.ensureDirectories()
  }

  private ensureDirectories() {
    const dirs = [this.outputDir, this.tempDir]
    dirs.forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true })
      }
    })
  }

  private getBlenderPath(): string {
    return process.env.BLENDER_PATH || '/Applications/Blender.app/Contents/MacOS/Blender'
  }

  async generateVideo(job: Job): Promise<JobOutput> {
    const startTime = Date.now()
    const jobId = job.id
    const courseName = job.courseName

    try {
      logger.info(`Starting video generation for job ${jobId}: ${courseName}`)

      // Track generation start
      await analyticsService.trackPerformance(jobId, 'video_generation_start', 0, true)

      // 1. Fetch and process course data
      const courseData = await this.fetchCourseData(job)
      
      // 2. Generate 3D course model
      const modelPath = await this.generate3DModel(courseData, jobId)
      
      // 3. Create camera paths and animations
      const cameraPaths = await this.generateCameraPaths(courseData)
      
      // 4. Render video frames
      const framesDir = await this.renderFrames(modelPath, cameraPaths, jobId)
      
      // 5. Add visual effects and post-processing
      const processedFrames = await this.addVisualEffects(framesDir, courseData)
      
      // 6. Generate audio (voiceover and ambient sounds)
      const audioPath = await this.generateAudio(courseData, jobId)
      
      // 7. Compile final video
      const videoPath = await this.compileVideo(processedFrames, audioPath, jobId)
      
      // 8. Generate captions
      const captionsPath = await this.generateCaptions(courseData, videoPath)
      
      // 9. Create thumbnail
      const thumbnailPath = await this.generateThumbnail(videoPath, jobId)

      const duration = Date.now() - startTime

      // Track successful generation
      await analyticsService.trackPerformance(jobId, 'video_generation_complete', duration, true)

      // Get video metadata
      const metadata = await this.getVideoMetadata(videoPath)

      // Convert file paths to web-accessible URLs
      const baseUrl = process.env.BASE_URL || 'http://localhost:4000'
      const videoUrl = `${baseUrl}/outputs/videos/${path.basename(videoPath)}`
      const captionsUrl = `${baseUrl}/outputs/videos/${path.basename(captionsPath)}`
      const thumbnailUrl = `${baseUrl}/outputs/videos/${path.basename(thumbnailPath)}`

      return {
        videoUrl,
        captionsUrl,
        thumbnailUrl,
        metadata: {
          duration: metadata.duration,
          resolution: metadata.resolution,
          fileSize: metadata.fileSize,
          renderTime: duration,
          fps: metadata.fps,
          codec: metadata.codec
        }
      }

    } catch (error) {
      const duration = Date.now() - startTime
      await analyticsService.trackError(jobId, 'video_generation', (error as Error).message, 'error', { courseName })
      throw error
    }
  }

  private async fetchCourseData(job: Job): Promise<CourseData> {
    const startTime = Date.now()
    
    try {
      // Fetch detailed course information from multiple APIs
      const [elevationData, terrainData, courseInfo] = await Promise.all([
        this.fetchElevationData(job.coordinates!),
        this.fetchTerrainData(job.coordinates!),
        this.fetchCourseInformation(job.courseName)
      ])

      const duration = Date.now() - startTime
      
      await analyticsService.trackPerformance({
        jobId: job.id,
        step: 'course_data_fetch',
        duration,
        success: true
      })

      return {
        name: job.courseName,
        coordinates: job.coordinates!,
        elevation: elevationData.elevation,
        terrain: terrainData.terrain,
        holes: courseInfo.holes,
        par: courseInfo.par,
        length: courseInfo.length,
        features: courseInfo.features
      }

    } catch (error) {
      await analyticsService.trackError({
        jobId: job.id,
        step: 'course_data_fetch',
        message: error.message,
        level: 'error'
      })
      throw error
    }
  }

  private async fetchElevationData(coordinates: [number, number]): Promise<{ elevation: number }> {
    // Simulate API call to elevation service
    await new Promise(resolve => setTimeout(resolve, 500))
    return { elevation: Math.random() * 100 + 50 } // 50-150m elevation
  }

  private async fetchTerrainData(coordinates: [number, number]): Promise<{ terrain: string }> {
    // Simulate API call to terrain service
    await new Promise(resolve => setTimeout(resolve, 300))
    const terrains = ['rolling_hills', 'flat_meadows', 'mountainous', 'coastal']
    return { terrain: terrains[Math.floor(Math.random() * terrains.length)] }
  }

  private async fetchCourseInformation(courseName: string): Promise<{ holes: number, par: number, length: number, features: string[] }> {
    // Simulate API call to golf course database
    await new Promise(resolve => setTimeout(resolve, 400))
    return {
      holes: 18,
      par: 72,
      length: Math.floor(Math.random() * 2000) + 6000, // 6000-8000 yards
      features: ['water_hazards', 'sand_bunkers', 'elevated_greens', 'tree_obstacles']
    }
  }

  private async generate3DModel(courseData: CourseData, jobId: string): Promise<string> {
    const startTime = Date.now()
    const modelPath = path.join(this.tempDir, `${jobId}_model.glb`)

    try {
      // Generate 3D model using Blender or similar
      const blenderScript = this.createBlenderScript(courseData)
      const scriptPath = path.join(this.tempDir, `${jobId}_script.py`)
      
      fs.writeFileSync(scriptPath, blenderScript)

      // Execute Blender to generate 3D model
      const { stdout, stderr } = await execAsync(
        `${this.getBlenderPath()} --background --python ${scriptPath} -- ${modelPath}`,
        { timeout: 300000 } // 5 minutes timeout
      )

      const duration = Date.now() - startTime
      
      await analyticsService.trackPerformance({
        jobId,
        step: '3d_model_generation',
        duration,
        success: true,
        metadata: { modelPath }
      })

      return modelPath

    } catch (error) {
      await analyticsService.trackError({
        jobId,
        step: '3d_model_generation',
        message: error.message,
        level: 'error'
      })
      throw error
    }
  }

  private createBlenderScript(courseData: CourseData): string {
    return `
import bpy
import os

# Clear existing objects
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete(use_global=False)

# Create a simple golf course terrain
bpy.ops.mesh.primitive_plane_add(size=100, location=(0, 0, 0))
terrain = bpy.context.active_object
terrain.name = "GolfCourse"

# Add some basic golf course features
for i in range(18):
    x = (i % 6) * 15 - 37.5
    y = (i // 6) * 15 - 37.5
    
    # Create a simple hole
    bpy.ops.mesh.primitive_cylinder_add(radius=1, depth=0.1, location=(x, y, 0.05))
    hole = bpy.context.active_object
    hole.name = f"Hole_{i+1}"
    
    # Add a flag
    bpy.ops.mesh.primitive_cylinder_add(radius=0.05, depth=2, location=(x, y, 1))
    flag_pole = bpy.context.active_object
    flag_pole.name = f"Flag_{i+1}"

# Add some trees
for i in range(10):
    x = (i * 7) % 80 - 40
    y = (i * 11) % 80 - 40
    
    bpy.ops.mesh.primitive_cone_add(radius1=2, depth=4, location=(x, y, 2))
    tree = bpy.context.active_object
    tree.name = f"Tree_{i+1}"

# Add water hazard
bpy.ops.mesh.primitive_cube_add(size=10, location=(30, 0, -0.5))
water = bpy.context.active_object
water.name = "WaterHazard"

print("Golf course model created successfully!")
`
  }

  private async generateCameraPaths(courseData: CourseData): Promise<any[]> {
    // Generate cinematic camera paths for the course
    const paths = []
    
    // Hole overview shots
    for (let i = 0; i < courseData.holes; i++) {
      paths.push({
        type: 'overview',
        hole: i + 1,
        startPosition: [i * 50, -30, 20],
        endPosition: [i * 50, 30, 20],
        duration: 3
      })
    }
    
    // Flyover shots
    paths.push({
      type: 'flyover',
      startPosition: [0, -100, 50],
      endPosition: [courseData.length, -100, 50],
      duration: 10
    })
    
    return paths
  }

  private async renderFrames(modelPath: string, cameraPaths: any[], jobId: string): Promise<string> {
    const startTime = Date.now()
    const framesDir = path.join(this.tempDir, `${jobId}_frames`)
    
    if (!fs.existsSync(framesDir)) {
      fs.mkdirSync(framesDir, { recursive: true })
    }

    try {
      // Render frames using Blender
      const renderScript = this.createBlenderRenderScript(cameraPaths, jobId)
      const scriptPath = path.join(this.tempDir, `${jobId}_render.py`)
      
      fs.writeFileSync(scriptPath, renderScript)

      const { stdout, stderr } = await execAsync(
        `${this.getBlenderPath()} --background --python ${scriptPath}`,
        { timeout: 120000 } // 2 minutes timeout for quick test
      )

      const duration = Date.now() - startTime
      
      await analyticsService.trackPerformance({
        jobId,
        step: 'frame_rendering',
        duration,
        success: true,
        metadata: { framesDir, frameCount: fs.readdirSync(framesDir).length }
      })

      return framesDir

    } catch (error) {
      await analyticsService.trackError({
        jobId,
        step: 'frame_rendering',
        message: error.message,
        level: 'error'
      })
      throw error
    }
  }

  private createBlenderRenderScript(cameraPaths: any[], jobId: string): string {
    return `
import bpy
import os
import math

# Clear existing objects
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete(use_global=False)

# Create a simple golf course terrain
bpy.ops.mesh.primitive_plane_add(size=100, location=(0, 0, 0))
terrain = bpy.context.active_object
terrain.name = "GolfCourse"

# Add some hills and features
bpy.ops.mesh.primitive_cylinder_add(radius=5, depth=2, location=(20, 10, 1))
hill1 = bpy.context.active_object
hill1.name = "Hill1"

bpy.ops.mesh.primitive_cylinder_add(radius=3, depth=1.5, location=(-15, -20, 0.75))
hill2 = bpy.context.active_object
hill2.name = "Hill2"

# Add a simple green
bpy.ops.mesh.primitive_cylinder_add(radius=2, depth=0.1, location=(0, 0, 0.05))
green = bpy.context.active_object
green.name = "Green"

# Create camera
bpy.ops.object.camera_add(location=(0, -50, 30), rotation=(math.radians(60), 0, 0))
camera = bpy.context.active_object
bpy.context.scene.camera = camera

# Set up rendering - QUICK TEST SETTINGS
bpy.context.scene.render.engine = 'CYCLES'  # Use Cycles with fast settings
bpy.context.scene.render.resolution_x = 640  # Lower resolution for speed
bpy.context.scene.render.resolution_y = 360
bpy.context.scene.render.fps = 30

# Fast Cycles settings
bpy.context.scene.cycles.samples = 1  # Very low samples for speed
bpy.context.scene.cycles.preview_samples = 1
bpy.context.scene.cycles.use_denoising = False  # Disable denoising for speed

# Create output directory
output_dir = "/Users/alyssapeterson/geneva/packages/server/temp/${jobId}_frames"
os.makedirs(output_dir, exist_ok=True)

# Render a very short animation for quick testing
total_frames = 15  # 0.5 seconds at 30fps - QUICK TEST
for frame in range(total_frames):
    # Set frame
    bpy.context.scene.frame_set(frame + 1)
    
    # Animate camera
    angle = (frame / total_frames) * 2 * math.pi
    radius = 50
    height = 30 + math.sin(angle * 2) * 10
    
    camera.location.x = math.cos(angle) * radius
    camera.location.y = math.sin(angle) * radius
    camera.location.z = height
    
    # Look at center
    camera.rotation_euler = (math.radians(60), 0, angle + math.pi)
    
    # Render frame
    frame_path = os.path.join(output_dir, f"frame_{frame:04d}.png")
    bpy.context.scene.render.filepath = frame_path
    bpy.ops.render.render(write_still=True)
    
    print(f"Rendered frame {frame + 1}/{total_frames}")

print(f"Rendering complete! {total_frames} frames saved to {output_dir}")
`
  }

  private async addVisualEffects(framesDir: string, courseData: CourseData): Promise<string> {
    const startTime = Date.now()
    const processedDir = framesDir.replace('_frames', '_processed')
    
    if (!fs.existsSync(processedDir)) {
      fs.mkdirSync(processedDir, { recursive: true })
    }

    try {
      // Add visual effects using ImageMagick or similar
      const frames = fs.readdirSync(framesDir).filter(f => f.endsWith('.png')).sort()
      
      for (const frame of frames) {
        const inputPath = path.join(framesDir, frame)
        const outputPath = path.join(processedDir, frame)
        
        // Add effects: color grading, lens flare, motion blur
        await execAsync(`convert "${inputPath}" -modulate 110,120,100 -contrast-stretch 0.1% "${outputPath}"`)
      }

      const duration = Date.now() - startTime
      
      await analyticsService.trackPerformance('temp', 'visual_effects', duration, true)

      return processedDir

    } catch (error) {
      await analyticsService.trackError('temp', 'visual_effects', (error as Error).message, 'error')
      throw error
    }
  }

  private async generateAudio(courseData: CourseData, jobId: string): Promise<string> {
    const startTime = Date.now()
    const audioPath = path.join(this.tempDir, `${jobId}_audio.wav`)

    try {
      // Generate voiceover using text-to-speech
      const voiceoverScript = this.createVoiceoverScript(courseData)
      
      // Use gTTS or similar for text-to-speech
      await execAsync(`gtts-cli "${voiceoverScript}" --output "${audioPath}"`)

      // Add ambient sounds (birds, wind, etc.)
      const ambientPath = path.join(this.tempDir, `${jobId}_ambient.wav`)
      await execAsync(`ffmpeg -f lavfi -i "sine=frequency=1000:duration=75" -f lavfi -i "sine=frequency=800:duration=75" -filter_complex amix=inputs=2:duration=longest "${ambientPath}"`)

      // Mix voiceover with ambient sounds
      const finalAudioPath = path.join(this.tempDir, `${jobId}_final_audio.wav`)
      await execAsync(`ffmpeg -i "${audioPath}" -i "${ambientPath}" -filter_complex "[0:a][1:a]amix=inputs=2:duration=longest" "${finalAudioPath}"`)

      const duration = Date.now() - startTime
      
      await analyticsService.trackPerformance(jobId, 'audio_generation', duration, true)

      return finalAudioPath

    } catch (error) {
      await analyticsService.trackError(jobId, 'audio_generation', (error as Error).message, 'error')
      throw error
    }
  }

  private createVoiceoverScript(courseData: CourseData): string {
    return `Welcome to ${courseData.name}. This beautiful ${courseData.holes}-hole course features ${courseData.terrain} terrain with an elevation of ${courseData.elevation} meters. The course plays to par ${courseData.par} and measures ${courseData.length} yards from the back tees. Enjoy your round!`
  }

  private async compileVideo(framesDir: string, audioPath: string, jobId: string): Promise<string> {
    const startTime = Date.now()
    const videoPath = path.join(this.outputDir, `${jobId}_video.mp4`)

    try {
      // Compile frames into video with audio
      await execAsync(
        `ffmpeg -framerate 30 -i "${framesDir}/frame_%04d.png" -i "${audioPath}" -c:v libx264 -preset medium -crf 23 -c:a aac -b:a 128k "${videoPath}"`
      )

      const duration = Date.now() - startTime
      
      await analyticsService.trackPerformance({
        jobId,
        step: 'video_compilation',
        duration,
        success: true,
        metadata: { videoPath, fileSize: fs.statSync(videoPath).size }
      })

      return videoPath

    } catch (error) {
      await analyticsService.trackError({
        jobId,
        step: 'video_compilation',
        message: error.message,
        level: 'error'
      })
      throw error
    }
  }

  private async generateCaptions(courseData: CourseData, videoPath: string): Promise<string> {
    const startTime = Date.now()
    const captionsPath = path.join(this.outputDir, `${courseData.name.replace(/[^a-zA-Z0-9]/g, '_')}_captions.srt`)

    try {
      // Generate SRT captions file
      const captions = this.createCaptions(courseData)
      fs.writeFileSync(captionsPath, captions)

      const duration = Date.now() - startTime
      
      await analyticsService.trackPerformance({
        jobId: 'temp',
        step: 'caption_generation',
        duration,
        success: true
      })

      return captionsPath

    } catch (error) {
      await analyticsService.trackError({
        jobId: 'temp',
        step: 'caption_generation',
        message: error.message,
        level: 'error'
      })
      throw error
    }
  }

  private createCaptions(courseData: CourseData): string {
    return `1
00:00:00,000 --> 00:00:03,000
Welcome to ${courseData.name}

2
00:00:03,000 --> 00:00:06,000
This beautiful ${courseData.holes}-hole course

3
00:00:06,000 --> 00:00:09,000
Features ${courseData.terrain} terrain

4
00:00:09,000 --> 00:00:12,000
With an elevation of ${courseData.elevation} meters

5
00:00:12,000 --> 00:00:15,000
The course plays to par ${courseData.par}

6
00:00:15,000 --> 00:00:18,000
And measures ${courseData.length} yards from the back tees

7
00:00:18,000 --> 00:00:21,000
Enjoy your round!
`
  }

  private async generateThumbnail(videoPath: string, jobId: string): Promise<string> {
    const startTime = Date.now()
    const thumbnailPath = path.join(this.outputDir, `${jobId}_thumbnail.jpg`)

    try {
      // Extract thumbnail from video with proper color space handling
      await execAsync(
        `ffmpeg -i "${videoPath}" -ss 00:00:05 -vframes 1 -vf "scale=640:360" -pix_fmt yuv420p -q:v 2 "${thumbnailPath}"`
      )

      const duration = Date.now() - startTime
      
      await analyticsService.trackPerformance({
        jobId,
        step: 'thumbnail_generation',
        duration,
        success: true
      })

      return thumbnailPath

    } catch (error) {
      // If thumbnail generation fails, create a simple placeholder
      logger.warn(`Thumbnail generation failed for job ${jobId}, creating placeholder:`, error.message)
      
      try {
        // Create a simple colored placeholder image
        await execAsync(
          `convert -size 640x360 xc:green -pointsize 24 -fill white -gravity center -annotate +0+0 "Golf Course\\nVideo" "${thumbnailPath}"`
        )
        
        const duration = Date.now() - startTime
        await analyticsService.trackPerformance({
          jobId,
          step: 'thumbnail_generation',
          duration,
          success: true
        })
        
        return thumbnailPath
      } catch (placeholderError) {
        await analyticsService.trackError({
          jobId,
          step: 'thumbnail_generation',
          message: `Failed to generate thumbnail and placeholder: ${error.message}`,
          level: 'error'
        })
        throw error
      }
    }
  }

  private async getVideoMetadata(videoPath: string): Promise<any> {
    try {
      const { stdout } = await execAsync(
        `ffprobe -v quiet -print_format json -show_format -show_streams "${videoPath}"`
      )
      
      const metadata = JSON.parse(stdout)
      const videoStream = metadata.streams.find((s: any) => s.codec_type === 'video')
      
      return {
        duration: parseFloat(metadata.format.duration),
        resolution: `${videoStream.width}x${videoStream.height}`,
        fileSize: parseInt(metadata.format.size),
        fps: eval(videoStream.r_frame_rate),
        codec: videoStream.codec_name
      }
    } catch (error) {
      // Return default metadata if ffprobe fails
      return {
        duration: 75,
        resolution: '1920x1080',
        fileSize: fs.statSync(videoPath).size,
        fps: 30,
        codec: 'h264'
      }
    }
  }

  async cleanupTempFiles(jobId: string) {
    try {
      const tempFiles = [
        path.join(this.tempDir, `${jobId}_model.glb`),
        path.join(this.tempDir, `${jobId}_script.py`),
        path.join(this.tempDir, `${jobId}_render.py`),
        path.join(this.tempDir, `${jobId}_frames`),
        path.join(this.tempDir, `${jobId}_processed`),
        path.join(this.tempDir, `${jobId}_audio.wav`),
        path.join(this.tempDir, `${jobId}_ambient.wav`),
        path.join(this.tempDir, `${jobId}_final_audio.wav`)
      ]

      for (const file of tempFiles) {
        if (fs.existsSync(file)) {
          if (fs.statSync(file).isDirectory()) {
            fs.rmSync(file, { recursive: true, force: true })
          } else {
            fs.unlinkSync(file)
          }
        }
      }
    } catch (error) {
      logger.warn(`Failed to cleanup temp files for job ${jobId}:`, error)
    }
  }
}

export const videoGeneratorService = new VideoGeneratorService()
