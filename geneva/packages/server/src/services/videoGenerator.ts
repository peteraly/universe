import { exec } from 'child_process'
import { promisify } from 'util'
import * as fs from 'fs'
import * as path from 'path'
import { CourseData } from '../types'

const execAsync = promisify(exec)

export class VideoGeneratorService {
  private outputDir: string
  private tempDir: string
  private ffmpegPath: string
  private blenderPath: string

  constructor() {
    this.outputDir = process.env.OUTPUT_DIR || path.resolve(__dirname, '../../../outputs/videos')
    this.tempDir = process.env.TEMP_DIR || path.resolve(__dirname, '../../../temp')
    this.ffmpegPath = process.env.FFMPEG_PATH || 'ffmpeg'
    this.blenderPath = process.env.BLENDER_PATH || '/Applications/Blender.app/Contents/MacOS/Blender'
    
    // Ensure directories exist
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true })
    }
    if (!fs.existsSync(this.tempDir)) {
      fs.mkdirSync(this.tempDir, { recursive: true })
    }
  }

  async generateVideo(courseData: CourseData, jobId: string): Promise<string> {
    const startTime = Date.now()
    
    try {
      console.log(`🎬 Starting digital twin video generation for ${courseData.name}...`)
      
      // Step 1: Create 3D Digital Twin Model
      const modelPath = await this.createDigitalTwinModel(courseData, jobId)
      
      // Step 2: Generate Cinematic Camera Paths
      const cameraPaths = await this.generateCameraPaths(courseData)
      
      // Step 3: Render Professional Frames
      const framesDir = await this.renderCinematicFrames(modelPath, cameraPaths, courseData, jobId)
      
      // Step 4: Generate Professional Audio
      const audioPath = await this.generateProfessionalAudio(courseData, jobId)
      
      // Step 5: Compile Final Marketing Video
      const videoPath = await this.compileMarketingVideo(framesDir, audioPath, courseData, jobId)
      
      const duration = Date.now() - startTime
      console.log(`✅ Digital twin marketing video generated successfully: ${videoPath}`)
      return videoPath
      
    } catch (error) {
      console.error(`❌ Video generation failed:`, error)
      throw error
    }
  }

  private async createDigitalTwinModel(courseData: CourseData, jobId: string): Promise<string> {
    const startTime = Date.now()
    const modelPath = path.join(this.tempDir, `${jobId}_digital_twin.blend`)
    
    try {
      console.log(`🏗️ Creating 3D digital twin model for ${courseData.name}...`)
      
      // Create simplified Blender script
      const blenderScript = this.createSimplifiedBlenderScript(courseData, modelPath)
      const scriptPath = path.join(this.tempDir, `${jobId}_digital_twin_script.py`)
      
      fs.writeFileSync(scriptPath, blenderScript)
      
      // Execute Blender with digital twin script
      const command = `${this.blenderPath} --background --python "${scriptPath}"`
      await execAsync(command, { timeout: 300000, maxBuffer: 1024 * 1024 * 10 }) // 5 minutes timeout, 10MB buffer
      
      const duration = Date.now() - startTime
      console.log(`✅ Digital twin model created successfully: ${modelPath}`)
      return modelPath
      
    } catch (error) {
      console.error(`❌ Digital twin creation failed:`, error)
      throw error
    }
  }

  private createSimplifiedBlenderScript(courseData: CourseData, outputPath: string): string {
    const elevation = courseData.elevation || 50
    const holes = courseData.holes || 18
    const courseName = courseData.name
    const terrain = courseData.terrain || 'flat'
    
    return `
import bpy
import math
import random

# Clear existing scene
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete(use_global=False)

# Set up scene
bpy.context.scene.render.engine = 'CYCLES'
bpy.context.scene.cycles.samples = 16
bpy.context.scene.render.resolution_x = 1280
bpy.context.scene.render.resolution_y = 720
bpy.context.scene.render.film_transparent = False

# Create terrain
bpy.ops.mesh.primitive_plane_add(size=1000, location=(0, 0, 0))
terrain = bpy.context.active_object
terrain.name = "Golf_Course_Terrain"

# Add displacement for elevation
displace = terrain.modifiers.new(name="Displacement", type='DISPLACE')
tex = bpy.data.textures.new("Elevation", type='CLOUDS')
tex.noise_scale = 3.0
displace.texture = tex
displace.strength = ${elevation} * 0.1

# Add material
mat = bpy.data.materials.new(name="Terrain_Material")
mat.use_nodes = True
nodes = mat.node_tree.nodes
principled = nodes["Principled BSDF"]
principled.inputs['Base Color'].default_value = (0.2, 0.5, 0.2, 1.0)
terrain.data.materials.append(mat)

# Create golf course layout
for i in range(${holes}):
    angle = (i * 360 / ${holes}) * (math.pi / 180)
    distance = 150 + (i * 25)
    x = math.cos(angle) * distance
    y = math.sin(angle) * distance
    
    # Create tee box
    bpy.ops.mesh.primitive_plane_add(size=10, location=(x, y, 0.1))
    tee = bpy.context.active_object
    tee.name = f"Tee_{i+1}"
    
    # Create fairway
    bpy.ops.mesh.primitive_plane_add(size=20, location=(x + 15, y, 0.05))
    fairway = bpy.context.active_object
    fairway.name = f"Fairway_{i+1}"
    
    # Create green
    bpy.ops.mesh.primitive_plane_add(size=15, location=(x + 30, y, 0.02))
    green = bpy.context.active_object
    green.name = f"Green_{i+1}"
    
    # Add bunker every 3 holes
    if i % 3 == 0:
        bpy.ops.mesh.primitive_cylinder_add(radius=8, depth=2, location=(x + 20, y + 10, -1))
        bunker = bpy.context.active_object
        bunker.name = f"Bunker_{i+1}"
        
        bunker_mat = bpy.data.materials.new(name=f"Sand_Material_{i+1}")
        bunker_mat.use_nodes = True
        bunker_nodes = bunker_mat.node_tree.nodes
        bunker_principled = bunker_nodes["Principled BSDF"]
        bunker_principled.inputs['Base Color'].default_value = (0.8, 0.7, 0.5, 1.0)
        bunker.data.materials.append(bunker_mat)

# Add lighting
bpy.ops.object.light_add(type='SUN', location=(0, 0, 100))
sun = bpy.context.active_object
sun.data.energy = 5.0
sun.rotation_euler = (math.radians(45), math.radians(45), 0)

# Add camera
bpy.ops.object.camera_add(location=(0, -200, 100))
camera = bpy.context.active_object
camera.name = "Main_Camera"
camera.rotation_euler = (math.radians(30), 0, 0)
bpy.context.scene.camera = camera

# Save the model
bpy.ops.wm.save_as_mainfile(filepath="${outputPath}")

print("Digital twin model created successfully!")
`
  }

  private async generateCameraPaths(courseData: CourseData): Promise<any[]> {
    const holes = courseData.holes || 18
    const cameraPaths = []
    
    // Create simple camera paths
    for (let i = 0; i < holes; i++) {
      const angle = (i * 360 / holes) * (Math.PI / 180)
      const distance = 200 + (i * 50)
      const x = Math.cos(angle) * distance
      const y = Math.sin(angle) * distance
      
      cameraPaths.push({
        name: `Hole_${i + 1}_Flyover`,
        keyframes: [
          { frame: i * 30, location: [x - 50, y - 50, 80], rotation: [30, 0, angle] },
          { frame: i * 30 + 15, location: [x, y, 60], rotation: [45, 0, angle] },
          { frame: i * 30 + 30, location: [x + 50, y + 50, 80], rotation: [30, 0, angle + Math.PI] }
        ]
      })
    }
    
    return cameraPaths
  }

  private async renderCinematicFrames(modelPath: string, cameraPaths: any[], courseData: CourseData, jobId: string): Promise<string> {
    const startTime = Date.now()
    const framesDir = path.join(this.tempDir, `${jobId}_cinematic_frames`)
    
    if (!fs.existsSync(framesDir)) {
      fs.mkdirSync(framesDir, { recursive: true })
    }
    
    try {
      console.log(`🎬 Rendering cinematic frames for ${courseData.name}...`)
      
      // Create simplified render script
      const renderScript = this.createSimplifiedRenderScript(modelPath, cameraPaths, framesDir)
      const scriptPath = path.join(this.tempDir, `${jobId}_render_script.py`)
      
      fs.writeFileSync(scriptPath, renderScript)
      
      // Execute Blender rendering
      const command = `${this.blenderPath} --background "${modelPath}" --python "${scriptPath}"`
      await execAsync(command, { timeout: 600000, maxBuffer: 1024 * 1024 * 10 }) // 10 minutes timeout, 10MB buffer
      
      const duration = Date.now() - startTime
      console.log(`✅ Cinematic frames rendered successfully: ${framesDir}`)
      return framesDir
      
    } catch (error) {
      console.error(`❌ Cinematic rendering failed:`, error)
      throw error
    }
  }

  private createSimplifiedRenderScript(modelPath: string, cameraPaths: any[], framesDir: string): string {
    return `
import bpy
import math

# Load the digital twin model
bpy.ops.wm.open_mainfile(filepath="${modelPath}")

# Set up rendering
bpy.context.scene.render.engine = 'CYCLES'
bpy.context.scene.cycles.samples = 8
bpy.context.scene.render.resolution_x = 1280
bpy.context.scene.render.resolution_y = 720
bpy.context.scene.render.fps = 30
bpy.context.scene.render.image_settings.file_format = 'PNG'
bpy.context.scene.render.filepath = "${framesDir}/frame_"

# Set total frames (reduced for faster rendering)
total_frames = 60
bpy.context.scene.frame_start = 1
bpy.context.scene.frame_end = total_frames

# Create camera animation
camera = bpy.context.scene.camera

# Simple camera movement
for frame in range(1, total_frames + 1):
    bpy.context.scene.frame_set(frame)
    
    # Calculate camera position
    angle = (frame / total_frames) * 2 * math.pi
    radius = 200
    height = 100 + 50 * math.sin(frame * 0.1)
    
    x = radius * math.cos(angle)
    y = radius * math.sin(angle)
    z = height
    
    camera.location = (x, y, z)
    camera.rotation_euler = (math.radians(30), 0, angle)
    
    camera.keyframe_insert(data_path="location", frame=frame)
    camera.keyframe_insert(data_path="rotation_euler", frame=frame)

# Render all frames
bpy.ops.render.render(animation=True)

print("Cinematic rendering completed!")
`
  }

  private async generateProfessionalAudio(courseData: CourseData, jobId: string): Promise<string> {
    const startTime = Date.now()
    const audioPath = path.join(this.tempDir, `${jobId}_professional_audio.mp3`)
    
    try {
      console.log(`🎵 Generating professional audio for ${courseData.name}...`)
      
      // Create voiceover script
      const voiceoverScript = this.createVoiceoverScript(courseData)
      const scriptPath = path.join(this.tempDir, `${jobId}_voiceover.txt`)
      
      fs.writeFileSync(scriptPath, voiceoverScript)
      
      // Generate voiceover using gTTS
      const voiceoverCommand = `gtts-cli -f "${scriptPath}" -l en -o "${audioPath}"`
      await execAsync(voiceoverCommand, { timeout: 60000, maxBuffer: 1024 * 1024 * 10 }) // 60 seconds timeout, 10MB buffer
      
      const duration = Date.now() - startTime
      console.log(`✅ Professional audio generated successfully: ${audioPath}`)
      return audioPath
      
    } catch (error) {
      console.error(`❌ Audio generation failed:`, error)
      // Create a silent audio file as fallback
      const silentCommand = `${this.ffmpegPath} -f lavfi -i anullsrc=channel_layout=stereo:sample_rate=44100 -t 30 -c:a aac -b:a 192k -y "${audioPath}"`
      await execAsync(silentCommand, { timeout: 60000, maxBuffer: 1024 * 1024 * 10 }) // 60 seconds timeout, 10MB buffer
      return audioPath
    }
  }

  private createVoiceoverScript(courseData: CourseData): string {
    const courseName = courseData.name
    const holes = courseData.holes || 18
    const par = courseData.par || 72
    const length = courseData.length || 6500
    const elevation = courseData.elevation || 50
    
    return `Welcome to ${courseName}, a premier golf destination that combines natural beauty with championship-level play. This stunning ${holes}-hole course, playing to par ${par}, stretches across ${length} yards of meticulously maintained terrain. With elevation changes of up to ${elevation} meters, each hole presents a unique challenge that will test every aspect of your game. From the rolling fairways to the pristine greens, ${courseName} offers an unforgettable golfing experience. Whether you're a seasoned pro or just beginning your golf journey, this course provides the perfect setting for creating lasting memories on the links. Experience the perfect blend of challenge and beauty at ${courseName}.`
  }

  private async compileMarketingVideo(framesDir: string, audioPath: string, courseData: CourseData, jobId: string): Promise<string> {
    const startTime = Date.now()
    const videoPath = path.join(this.outputDir, `${jobId}_marketing_video.mp4`)
    
    try {
      console.log(`🎬 Compiling final marketing video for ${courseData.name}...`)
      
      // Check if frames exist
      const frames = fs.readdirSync(framesDir).filter(f => f.endsWith('.png')).sort()
      if (frames.length === 0) {
        throw new Error('No frames found for video compilation')
      }
      
      // Compile frames into video
      const command = `${this.ffmpegPath} -framerate 30 -i "${framesDir}/frame_%04d.png" -i "${audioPath}" -c:v libx264 -preset fast -crf 23 -c:a aac -b:a 192k -pix_fmt yuv420p -movflags +faststart -y "${videoPath}"`
      
      await execAsync(command, { timeout: 300000, maxBuffer: 1024 * 1024 * 10 }) // 5 minutes timeout, 10MB buffer
      
      const duration = Date.now() - startTime
      console.log(`✅ Marketing video compiled successfully: ${videoPath}`)
      return videoPath
      
    } catch (error) {
      console.error(`❌ Video compilation failed:`, error)
      throw error
    }
  }

  async cleanupTempFiles(jobId: string) {
    try {
      const tempFiles = [
        path.join(this.tempDir, `${jobId}_digital_twin.blend`),
        path.join(this.tempDir, `${jobId}_digital_twin_script.py`),
        path.join(this.tempDir, `${jobId}_render_script.py`),
        path.join(this.tempDir, `${jobId}_cinematic_frames`),
        path.join(this.tempDir, `${jobId}_professional_audio.mp3`),
        path.join(this.tempDir, `${jobId}_voiceover.txt`)
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
      console.warn(`Failed to cleanup temp files for job ${jobId}:`, error)
    }
  }
}

export const videoGeneratorService = new VideoGeneratorService()