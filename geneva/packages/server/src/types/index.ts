export interface Job {
  id: string
  courseName: string
  coordinates?: [number, number]
  seed?: number
  status: JobStatus
  progress: number
  createdAt: string
  updatedAt: string
  completedAt?: string
  output?: JobOutput
  errors?: string[]
  fallbacks?: Fallback[]
}

export type JobStatus = 'pending' | 'geocoding' | 'fetching_data' | 'building_model' | 'rendering' | 'post_production' | 'deliver' | 'completed' | 'failed' | 'cancelled'

export interface JobOutput {
  videoUrl: string
  captionsUrl: string
  thumbnailUrl: string
  metadata: {
    duration: number
    resolution: string
    fileSize: number
    renderTime: number
    fps: number
    codec: string
  }
}

export interface Fallback {
  step: string
  reason: string
  fallback: string
  timestamp: string
}

export interface JobCreateRequest {
  courseName: string
  coordinates?: [number, number]
  seed?: number
}

export interface JobUpdateRequest {
  status?: Job['status']
  progress?: number
  output?: Job['output']
  errors?: string[]
  fallbacks?: Fallback[]
  analytics?: JobAnalytics
  qualityMetrics?: QualityMetrics
}

export interface ApiResponse<T> {
  success: boolean
  data: T
  message: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

// New tracking and monitoring interfaces
export interface JobAnalytics {
  jobId: string
  courseName: string
  coordinates?: [number, number]
  createdAt: string
  completedAt?: string
  status: string
  duration?: number
  output?: JobOutput
}

export interface QualityMetrics {
  videoQuality: {
    resolution: string
    bitrate: number
    frameRate: number
    compressionRatio: number
    fileSize: number
  }
  contentQuality: {
    courseAccuracy: number
    visualAppeal: number
    audioQuality: number
    captionAccuracy: number
    overallScore: number
  }
  technicalQuality: {
    renderTime: number
    memoryUsage: number
    cpuUsage: number
    errorRate: number
  }
  userFeedback?: {
    rating: number
    comments: string
    timestamp: string
  }
}

export interface SystemMetrics {
  timestamp: string
  cpu: number
  memory: number
  disk: number
  network: number
  activeJobs: number
  queueLength: number
}

export interface CourseData {
  name: string
  coordinates: [number, number]
  elevation: number
  terrain: string
  holes: number
  par: number
  length: number
  features: string[]
  realHoles?: any[]
  waterFeatures?: any[]
  amenities?: string[]
  boundaries?: any[]
  satelliteData?: any
  weatherData?: any
  elevationData?: any
}

export interface ErrorLog {
  id: string
  jobId: string
  step: string
  message: string
  level: 'error' | 'warning' | 'info'
  context?: any
  timestamp: string
}

export interface PerformanceLog {
  id: string
  jobId: string
  timestamp: string
  step: string
  duration: number
  memoryUsage: number
  cpuUsage: number
  success: boolean
  error?: string
}

export interface UserSession {
  id: string
  userId?: string
  ipAddress: string
  userAgent: string
  startTime: string
  jobsCreated: number
  jobsCompleted: number
  jobsFailed: number
  totalRenderTime: number
  averageJobDuration: number
  preferredCourses: string[]
  commonErrors: string[]
  feedback: {
    rating: number
    comments: string
    timestamp: string
  }[]
}

export interface WebSocketMessage {
  type: 'job_update' | 'progress' | 'error' | 'complete'
  jobId: string
  data: any
  timestamp: string
}
