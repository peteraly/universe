import { exec } from 'child_process'
import { promisify } from 'util'
import fs from 'fs-extra'
import path from 'path'
import logger from '../utils/logger'
import { BlenderConfig, ModelJobData, ModelOutput } from '../types'

const execAsync = promisify(exec)

export class BlenderClient {
  private config: BlenderConfig

  constructor(config: BlenderConfig) {
    this.config = config
  }

  async checkBlenderAvailability(): Promise<boolean> {
    try {
      const { stdout } = await execAsync(`${this.config.executable} --version`)
      logger.info('Blender is available', { version: stdout.split('\n')[0] })
      return true
    } catch (error) {
      logger.error('Blender not available', { error: error.message })
      return false
    }
  }

  async checkGPUAvailability(): Promise<boolean> {
    if (!this.config.gpuEnabled) {
      return false
    }

    try {
      // Create a simple script to check GPU availability
      const gpuCheckScript = `
import bpy
import gpu

try:
    # Check if GPU compute is available
    if gpu.compute.is_available():
        print("GPU compute available")
        return True
    else:
        print("GPU compute not available")
        return False
except Exception as e:
    print(f"GPU check failed: {e}")
    return False
`
      const scriptPath = path.join(process.cwd(), 'temp', 'gpu_check.py')
      await fs.writeFile(scriptPath, gpuCheckScript)

      const { stdout } = await execAsync(
        `${this.config.executable} --background --python ${scriptPath}`
      )

      await fs.remove(scriptPath)
      return stdout.includes('GPU compute available')
    } catch (error) {
      logger.warn('GPU check failed, falling back to CPU', { error: error.message })
      return false
    }
  }

  async generateModel(jobData: ModelJobData): Promise<ModelOutput> {
    const scriptPath = await this.createModelScript(jobData)
    const outputPath = path.join(jobData.outputPath, `model_${jobData.jobId}`)

    try {
      logger.info('Starting 3D model generation', { jobId: jobData.jobId })

      const command = this.buildBlenderCommand(scriptPath, outputPath)
      const { stdout, stderr } = await execAsync(command, {
        timeout: this.config.timeout,
        maxBuffer: 1024 * 1024 * 10 // 10MB buffer
      })

      logger.info('3D model generation completed', { 
        jobId: jobData.jobId,
        outputPath 
      })

      // Parse output and create model output
      const modelOutput = await this.parseModelOutput(outputPath, jobData)
      
      // Clean up temporary script
      await fs.remove(scriptPath)

      return modelOutput
    } catch (error) {
      logger.error('3D model generation failed', { 
        jobId: jobData.jobId,
        error: error.message 
      })
      
      // Clean up on failure
      await fs.remove(scriptPath)
      throw error
    }
  }

  private async createModelScript(jobData: ModelJobData): Promise<string> {
    const scriptContent = this.generateBlenderScript(jobData)
    const scriptPath = path.join(process.cwd(), 'temp', `model_script_${jobData.jobId}.py`)
    
    await fs.ensureDir(path.dirname(scriptPath))
    await fs.writeFile(scriptPath, scriptContent)
    
    return scriptPath
  }

  private generateBlenderScript(jobData: ModelJobData): string {
    return `
import bpy
import math
import random
import json
from mathutils import Vector

# Set random seed for reproducibility
random.seed(${jobData.seed})

# Clear existing scene
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete(use_global=False)

# Create ground plane
bpy.ops.mesh.primitive_plane_add(size=1000, location=(0, 0, 0))
ground = bpy.context.active_object
ground.name = "Ground"

# Add elevation
ground.location.z = ${jobData.elevation}

# Create terrain
bpy.ops.object.modifier_add(type='DISPLACE')
displace = ground.modifiers["Displace"]
displace.strength = 20

# Create holes
holes = ${JSON.stringify(jobData.holes)}

for i, hole in enumerate(holes):
    # Create hole geometry
    bpy.ops.mesh.primitive_cylinder_add(
        radius=hole['distance'] * 0.1,
        depth=2,
        location=(hole['coordinates'][0], hole['coordinates'][1], ${jobData.elevation})
    )
    hole_obj = bpy.context.active_object
    hole_obj.name = f"Hole_{hole['id']}"
    
    # Add hole features (bunkers, water, etc.)
    for feature in hole['features']:
        if feature == 'bunker':
            bpy.ops.mesh.primitive_cube_add(
                size=5,
                location=(hole['coordinates'][0] + random.uniform(-10, 10), 
                         hole['coordinates'][1] + random.uniform(-10, 10), 
                         ${jobData.elevation})
            )
            bunker = bpy.context.active_object
            bunker.name = f"Bunker_{hole['id']}"
        
        elif feature == 'water':
            bpy.ops.mesh.primitive_plane_add(
                size=15,
                location=(hole['coordinates'][0] + random.uniform(-20, 20), 
                         hole['coordinates'][1] + random.uniform(-20, 20), 
                         ${jobData.elevation} - 1)
            )
            water = bpy.context.active_object
            water.name = f"Water_{hole['id']}"

# Add trees and vegetation
for i in range(50):
    x = random.uniform(-200, 200)
    y = random.uniform(-200, 200)
    z = ${jobData.elevation} + random.uniform(0, 10)
    
    bpy.ops.mesh.primitive_cone_add(
        radius1=3,
        radius2=0,
        depth=15,
        location=(x, y, z)
    )
    tree = bpy.context.active_object
    tree.name = f"Tree_{i}"

# Set up camera paths
camera_paths = []

# Create cinematic camera path
bpy.ops.object.camera_add(location=(0, -50, 30))
camera = bpy.context.active_object
camera.name = "CinematicCamera"

# Animate camera
scene = bpy.context.scene
scene.frame_start = 1
scene.frame_end = 250

# Create keyframes for camera movement
keyframes = [
    (1, (0, -50, 30), (math.radians(15), 0, 0)),
    (50, (50, -30, 25), (math.radians(10), math.radians(45), 0)),
    (100, (0, 0, 40), (math.radians(5), 0, 0)),
    (150, (-50, 30, 25), (math.radians(10), math.radians(-45), 0)),
    (200, (0, 50, 30), (math.radians(15), math.radians(180), 0)),
    (250, (0, -50, 30), (math.radians(15), 0, 0))
]

for frame, pos, rot in keyframes:
    camera.location = pos
    camera.rotation_euler = rot
    camera.keyframe_insert(data_path="location", frame=frame)
    camera.keyframe_insert(data_path="rotation_euler", frame=frame)

# Set up rendering
scene.render.engine = 'CYCLES' if ${this.config.gpuEnabled} else 'BLENDER_EEVEE'
scene.render.resolution_x = 1920
scene.render.resolution_y = 1080
scene.render.fps = 30

# Set output path
scene.render.filepath = "${path.join(jobData.outputPath, 'frames')}"

# Render animation
bpy.ops.render.render(animation=True)

# Save camera path data
camera_data = {
    "id": "cinematic_path",
    "name": "Cinematic Camera Path",
    "keyframes": keyframes,
    "duration": 250,
    "easing": "linear"
}

# Save metadata
metadata = {
    "courseName": "${jobData.courseName}",
    "coordinates": ${JSON.stringify(jobData.coordinates)},
    "elevation": ${jobData.elevation},
    "holeCount": len(holes),
    "totalDistance": sum(hole['distance'] for hole in holes),
    "createdAt": "${new Date().toISOString()}",
    "renderTime": 0,  # Will be calculated
    "fileSize": 0     # Will be calculated
}

# Save output data
output_data = {
    "modelPath": "${path.join(jobData.outputPath, 'model.blend')}",
    "texturePath": "${path.join(jobData.outputPath, 'textures')}",
    "cameraPaths": [camera_data],
    "renderSettings": {
        "resolution": [1920, 1080],
        "fps": 30,
        "quality": "high",
        "samples": 128,
        "engine": "cycles" if ${this.config.gpuEnabled} else "eevee",
        "gpuEnabled": ${this.config.gpuEnabled}
    },
    "metadata": metadata,
    "fallbackUsed": False
}

# Save the output data
import json
with open("${path.join(jobData.outputPath, 'model_output.json')}", 'w') as f:
    json.dump(output_data, f, indent=2)

# Save the blend file
bpy.ops.wm.save_as_mainfile(filepath="${path.join(jobData.outputPath, 'model.blend')}")

print("Model generation completed successfully")
`
  }

  private buildBlenderCommand(scriptPath: string, outputPath: string): string {
    const args = [
      '--background',
      '--python', scriptPath,
      '--', // Separator for script arguments
      '--output-path', outputPath
    ]

    if (this.config.gpuEnabled) {
      args.unshift('--enable-gpu')
    }

    return `${this.config.executable} ${args.join(' ')}`
  }

  private async parseModelOutput(outputPath: string, jobData: ModelJobData): Promise<ModelOutput> {
    const outputFile = path.join(outputPath, 'model_output.json')
    
    if (await fs.pathExists(outputFile)) {
      const outputData = await fs.readJson(outputFile)
      return outputData as ModelOutput
    } else {
      throw new Error('Model output file not found')
    }
  }

  async generateStoryboard(jobData: ModelJobData): Promise<ModelOutput> {
    logger.info('Generating storyboard mode', { jobId: jobData.jobId })
    
    // Create simple storyboard assets
    const storyboardPath = path.join(jobData.outputPath, 'storyboard')
    await fs.ensureDir(storyboardPath)

    // Generate a simple map overlay
    const mapScript = this.generateStoryboardScript(jobData)
    const scriptPath = path.join(process.cwd(), 'temp', `storyboard_${jobData.jobId}.py`)
    
    try {
      await fs.writeFile(scriptPath, mapScript)
      
      const command = `${this.config.executable} --background --python ${scriptPath}`
      await execAsync(command, { timeout: 30000 })

      const storyboardOutput: ModelOutput = {
        modelPath: path.join(storyboardPath, 'storyboard.blend'),
        texturePath: path.join(storyboardPath, 'textures'),
        cameraPaths: [],
        renderSettings: {
          resolution: [1920, 1080],
          fps: 30,
          quality: 'low',
          samples: 32,
          engine: 'eevee',
          gpuEnabled: false
        },
        metadata: {
          courseName: jobData.courseName,
          coordinates: jobData.coordinates,
          elevation: jobData.elevation,
          holeCount: jobData.holes.length,
          totalDistance: jobData.holes.reduce((sum, hole) => sum + hole.distance, 0),
          createdAt: new Date().toISOString(),
          renderTime: 0,
          fileSize: 0
        },
        fallbackUsed: true,
        fallbackReason: 'Blender unavailable or GPU rendering failed'
      }

      await fs.writeJson(path.join(storyboardPath, 'storyboard_output.json'), storyboardOutput)
      await fs.remove(scriptPath)

      return storyboardOutput
    } catch (error) {
      logger.error('Storyboard generation failed', { error: error.message })
      await fs.remove(scriptPath)
      throw error
    }
  }

  private generateStoryboardScript(jobData: ModelJobData): string {
    return `
import bpy
import json

# Clear scene
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete(use_global=False)

# Create simple 2D map representation
bpy.ops.mesh.primitive_plane_add(size=100, location=(0, 0, 0))
map_plane = bpy.context.active_object
map_plane.name = "CourseMap"

# Add holes as simple circles
holes = ${JSON.stringify(jobData.holes)}

for hole in holes:
    bpy.ops.mesh.primitive_circle_add(
        radius=hole['distance'] * 0.05,
        location=(hole['coordinates'][0], hole['coordinates'][1], 0.1)
    )
    hole_obj = bpy.context.active_object
    hole_obj.name = f"Hole_{hole['id']}"

# Set up simple rendering
scene = bpy.context.scene
scene.render.engine = 'BLENDER_EEVEE'
scene.render.resolution_x = 1920
scene.render.resolution_y = 1080

# Render single frame
scene.render.filepath = "${path.join(jobData.outputPath, 'storyboard', 'course_map.png')}"
bpy.ops.render.render(write_still=True)

print("Storyboard generation completed")
`
  }
}
