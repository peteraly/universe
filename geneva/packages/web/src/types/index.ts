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
  fallbacks?: FallbackInfo[]
}

export type JobStatus = 
  | 'pending'
  | 'geocoding'
  | 'fetching_data'
  | 'building_model'
  | 'rendering'
  | 'post_processing'
  | 'completed'
  | 'failed'
  | 'cancelled'

export interface JobOutput {
  videoUrl: string
  captionsUrl: string
  thumbnailUrl: string
  metadata: {
    duration: number
    resolution: string
    fileSize: number
    renderTime: number
    fps?: number
    codec?: string
  }
}

export interface FallbackInfo {
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
  status?: JobStatus
  progress?: number
  output?: JobOutput
  errors?: string[]
  fallbacks?: FallbackInfo[]
}

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  limit: number
  hasMore: boolean
}

export interface WebSocketMessage {
  type: 'job_update' | 'job_complete' | 'job_error' | 'fallback'
  data: any
  timestamp: string
}

export interface StatusStep {
  id: string
  title: string
  description: string
  status: 'pending' | 'active' | 'completed' | 'error'
  progress?: number
  error?: string
  fallback?: string
}

export interface CourseData {
  name: string
  coordinates: [number, number]
  elevation: number
  holes: Hole[]
  amenities: string[]
}

export interface Hole {
  number: number
  par: number
  distance: number
  coordinates: [number, number]
  features: string[]
}
