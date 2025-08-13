import axios from 'axios'
import { Job, JobCreateRequest, JobUpdateRequest, ApiResponse, PaginatedResponse } from '../types'

// Use relative URL to work with Vite proxy in development
const API_BASE_URL = import.meta.env.VITE_API_URL || ''

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor for logging
api.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`)
    return config
  },
  (error) => {
    console.error('API Request Error:', error)
    return Promise.reject(error)
  }
)

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    console.log(`API Response: ${response.status} ${response.config.url}`)
    return response
  },
  (error) => {
    console.error('API Response Error:', error.response?.data || error.message)
    return Promise.reject(error)
  }
)

// Job API functions
export const createJob = async (jobData: JobCreateRequest): Promise<Job> => {
  const response = await api.post<ApiResponse<Job>>('/api/jobs', jobData)
  if (!response.data.success) {
    throw new Error(response.data.error || 'Failed to create job')
  }
  return response.data.data!
}

export const getJobs = async (): Promise<Job[]> => {
  const response = await api.get<ApiResponse<Job[]>>('/api/jobs')
  if (!response.data.success) {
    throw new Error(response.data.error || 'Failed to fetch jobs')
  }
  return response.data.data!
}

export const getJob = async (jobId: string): Promise<Job> => {
  const response = await api.get<ApiResponse<Job>>(`/api/jobs/${jobId}`)
  if (!response.data.success) {
    throw new Error(response.data.error || 'Failed to fetch job')
  }
  return response.data.data!
}

export const updateJob = async (jobId: string, updates: JobUpdateRequest): Promise<Job> => {
  const response = await api.patch<ApiResponse<Job>>(`/api/jobs/${jobId}`, updates)
  if (!response.data.success) {
    throw new Error(response.data.error || 'Failed to update job')
  }
  return response.data.data!
}

export const deleteJob = async (jobId: string): Promise<void> => {
  const response = await api.delete<ApiResponse<void>>(`/api/jobs/${jobId}`)
  if (!response.data.success) {
    throw new Error(response.data.error || 'Failed to delete job')
  }
}

export const cancelJob = async (jobId: string): Promise<Job> => {
  const response = await api.post<ApiResponse<Job>>(`/api/jobs/${jobId}/cancel`)
  if (!response.data.success) {
    throw new Error(response.data.error || 'Failed to cancel job')
  }
  return response.data.data!
}

// Health check
export const healthCheck = async (): Promise<{ status: string; timestamp: string }> => {
  const response = await api.get<{ status: string; timestamp: string }>('/health')
  return response.data
}

// File download helpers
export const downloadFile = async (url: string, filename: string): Promise<void> => {
  const response = await api.get(url, { responseType: 'blob' })
  const blob = new Blob([response.data])
  const downloadUrl = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = downloadUrl
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  window.URL.revokeObjectURL(downloadUrl)
}

// WebSocket URL helper
export const getWebSocketUrl = (jobId: string): string => {
  // Use proxy for WebSocket in development
  const wsBaseUrl = import.meta.env.VITE_WS_URL || window.location.origin.replace('http', 'ws')
  return `${wsBaseUrl}/ws/jobs/${jobId}`
}

export default api
