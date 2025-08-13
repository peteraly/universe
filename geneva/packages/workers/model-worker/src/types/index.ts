export interface ModelJobData {
  jobId: string
  courseName: string
  coordinates: [number, number]
  elevation: number
  holes: Hole[]
  amenities: string[]
  seed: number
  outputPath: string
}

export interface Hole {
  id: number
  par: number
  distance: number
  coordinates: [number, number]
  features: string[]
}

export interface ModelOutput {
  modelPath: string
  texturePath: string
  cameraPaths: CameraPath[]
  renderSettings: RenderSettings
  metadata: ModelMetadata
  fallbackUsed: boolean
  fallbackReason?: string
}

export interface CameraPath {
  id: string
  name: string
  keyframes: Keyframe[]
  duration: number
  easing: string
}

export interface Keyframe {
  frame: number
  position: [number, number, number]
  rotation: [number, number, number]
  fov: number
}

export interface RenderSettings {
  resolution: [number, number]
  fps: number
  quality: 'low' | 'medium' | 'high'
  samples: number
  engine: 'cycles' | 'eevee'
  gpuEnabled: boolean
}

export interface ModelMetadata {
  courseName: string
  coordinates: [number, number]
  elevation: number
  holeCount: number
  totalDistance: number
  createdAt: string
  renderTime: number
  fileSize: number
}

export interface BlenderConfig {
  executable: string
  pythonPath: string
  addonPath: string
  gpuEnabled: boolean
  maxMemory: number
  timeout: number
}

export interface StoryboardMode {
  enabled: boolean
  reason: string
  assets: StoryboardAsset[]
}

export interface StoryboardAsset {
  type: 'map' | 'overlay' | 'text'
  path: string
  duration: number
  position: [number, number]
  size: [number, number]
}

export interface ModelWorkerConfig {
  blender: BlenderConfig
  output: {
    basePath: string
    tempPath: string
    maxFileSize: number
  }
  fallback: {
    storyboardMode: boolean
    defaultAssets: string[]
  }
  performance: {
    maxConcurrentJobs: number
    timeout: number
    retryAttempts: number
  }
}
