export interface PostJobData {
  jobId: string
  courseName: string
  modelOutput: ModelOutput
  outputPath: string
  seed: number
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

export interface VideoOutput {
  videoPath: string
  thumbnailPath: string
  captionsPath: string
  audioPath: string
  metadata: VideoMetadata
  processingTime: number
  fileSize: number
}

export interface VideoMetadata {
  duration: number
  resolution: [number, number]
  fps: number
  bitrate: number
  codec: string
  audioCodec: string
  courseName: string
  createdAt: string
}

export interface TTSConfig {
  engine: 'piper' | 'espeak' | 'gtts'
  voice: string
  language: string
  speed: number
  pitch: number
}

export interface CaptionConfig {
  enabled: boolean
  font: string
  fontSize: number
  color: string
  position: 'top' | 'bottom' | 'middle'
  style: 'simple' | 'animated' | 'professional'
}

export interface AudioConfig {
  backgroundMusic: string
  volume: number
  fadeIn: number
  fadeOut: number
  voiceoverVolume: number
}

export interface FFmpegConfig {
  executable: string
  threads: number
  preset: string
  crf: number
  maxBitrate: string
  timeout: number
}

export interface PostWorkerConfig {
  ffmpeg: FFmpegConfig
  tts: TTSConfig
  captions: CaptionConfig
  audio: AudioConfig
  output: {
    basePath: string
    tempPath: string
    maxFileSize: number
  }
  performance: {
    maxConcurrentJobs: number
    timeout: number
    retryAttempts: number
  }
}
