import { Router } from 'express'
import Joi from 'joi'
import { createError } from '../middleware/errorHandler'
import { ApiResponse } from '../types'
import { jobProcessorService } from '../services/jobProcessor'
import { JobUpdateRequest } from '../types'

const router: Router = Router()

// Validation schemas
const createJobSchema = Joi.object({
  courseName: Joi.string().required().min(1).max(200),
  coordinates: Joi.array().items(Joi.number()).length(2).optional(),
  seed: Joi.number().integer().min(0).max(999999).optional()
})

const searchCoursesSchema = Joi.object({
  query: Joi.string().required().min(1).max(100),
  limit: Joi.number().integer().min(1).max(50).default(10)
})

// Create a new job
router.post('/', async (req, res, next) => {
  try {
    const { error, value } = createJobSchema.validate(req.body)
    if (error) {
      throw createError(`Validation error: ${error.details[0]?.message || 'Invalid data'}`, 400)
    }

    const { courseName, coordinates, seed } = value

    if (!courseName) {
      throw createError('Course name is required', 400)
    }

    const job = await jobProcessorService.createJob(courseName, coordinates || undefined, seed || undefined)

    res.status(201).json({
      success: true,
      data: job,
      message: `Job created successfully for ${courseName}`
    } as ApiResponse<any>)
  } catch (error) {
    next(error)
  }
})

// Get all jobs
router.get('/', async (req, res, next) => {
  try {
    const jobs = await jobProcessorService.getAllJobs()

    res.json({
      success: true,
      data: jobs,
      message: `Retrieved ${jobs.length} jobs`
    } as ApiResponse<any[]>)
  } catch (error) {
    next(error)
  }
})

// Delete a job
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params
    const deleted = await jobProcessorService.deleteJob(id)

    if (!deleted) {
      return next(createError('Job not found', 404))
    }

    res.json({
      success: true,
      message: 'Job deleted successfully'
    } as ApiResponse<void>)
  } catch (error) {
    next(error)
  }
})

// Cancel a job
router.post('/:id/cancel', async (req, res, next) => {
  try {
    const { id } = req.params
    const cancelled = await jobProcessorService.cancelJob(id)

    if (!cancelled) {
      return next(createError('Job not found', 404))
    }

    res.json({
      success: true,
      message: 'Job cancelled successfully'
    } as ApiResponse<void>)
  } catch (error) {
    next(error)
  }
})

// Update a job
router.patch('/:id', async (req, res, next) => {
  try {
    const { id } = req.params
    const updates = req.body as JobUpdateRequest

    const updatedJob = await jobProcessorService.updateJob(id, updates)

    res.json({
      success: true,
      data: updatedJob,
      message: 'Job updated successfully'
    })
  } catch (error) {
    next(error)
  }
})

// Search for golf courses
router.get('/search-courses', async (req, res, next) => {
  try {
    const { error, value } = searchCoursesSchema.validate(req.query)
    if (error) {
      throw createError(`Validation error: ${error.details[0]?.message || 'Invalid data'}`, 400)
    }

    const { query, limit } = value

    if (!query || !limit) {
      throw createError('Query and limit are required', 400)
    }

    // Mock course search (in production, this would call external APIs like Google Places, OpenStreetMap, etc.)
    const mockCourses = [
      {
        id: '1',
        name: 'Bacon Park Golf Course',
        address: '1 Shorty Cooper Rd, Savannah, GA 31406',
        city: 'Savannah',
        state: 'GA',
        coordinates: [32.0748, -81.0943] as [number, number],
        type: 'public' as const,
        holes: 18,
        par: 72,
        length: 6500
      },
      {
        id: '2',
        name: 'Augusta National Golf Club',
        address: '2604 Washington Rd, Augusta, GA 30904',
        city: 'Augusta',
        state: 'GA',
        coordinates: [33.5021, -82.0228] as [number, number],
        type: 'private' as const,
        holes: 18,
        par: 72,
        length: 7475
      },
      {
        id: '3',
        name: 'Pebble Beach Golf Links',
        address: '1700 17-Mile Drive, Pebble Beach, CA 93953',
        city: 'Pebble Beach',
        state: 'CA',
        coordinates: [36.5683, -121.9497] as [number, number],
        type: 'public' as const,
        holes: 18,
        par: 72,
        length: 7075
      },
      {
        id: '4',
        name: 'St. Andrews Old Course',
        address: 'St Andrews KY16 9SF, United Kingdom',
        city: 'St Andrews',
        state: 'Scotland',
        coordinates: [56.3398, -2.7967] as [number, number],
        type: 'public' as const,
        holes: 18,
        par: 72,
        length: 7305
      },
      {
        id: '5',
        name: 'Pinehurst No. 2',
        address: '1 Carolina Vista Dr, Pinehurst, NC 28374',
        city: 'Pinehurst',
        state: 'NC',
        coordinates: [35.1894, -79.4697] as [number, number],
        type: 'resort' as const,
        holes: 18,
        par: 72,
        length: 7214
      }
    ]

    // Filter courses based on query
    const filteredCourses = mockCourses.filter(course =>
      course.name.toLowerCase().includes(query.toLowerCase()) ||
      course.city.toLowerCase().includes(query.toLowerCase()) ||
      course.state.toLowerCase().includes(query.toLowerCase()) ||
      course.address.toLowerCase().includes(query.toLowerCase())
    ).slice(0, limit)

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300))

    res.json({
      success: true,
      data: filteredCourses,
      message: `Found ${filteredCourses.length} courses matching "${query}"`
    } as ApiResponse<any[]>)
  } catch (error) {
    next(error)
  }
})

// Get a specific job
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params
    const job = await jobProcessorService.getJob(id)

    if (!job) {
      throw createError('Job not found', 404)
    }

    res.json({
      success: true,
      data: job,
      message: 'Job retrieved successfully'
    } as ApiResponse<any>)
  } catch (error) {
    next(error)
  }
})

// Get live step data for real-time previews
router.get('/:id/step-data', async (req, res, next) => {
  try {
    const { id } = req.params
    const step = req.query.step as string

    const job = await jobProcessorService.getJob(id)
    if (!job) {
      return next(createError('Job not found', 404))
    }

    // Generate live data based on the current step
    let stepData: any = {}

    switch (step) {
      case 'geocoding':
        if (job.status === 'geocoding' || job.status === 'fetching_data' || job.status === 'building_model' || job.status === 'rendering' || job.status === 'post_production' || job.status === 'deliver' || job.status === 'completed') {
          stepData = {
            searchResults: [
              { name: job.courseName, confidence: 95 },
              { name: `${job.courseName} Golf Club`, confidence: 87 },
              { name: `${job.courseName} Country Club`, confidence: 82 }
            ],
            coordinates: job.coordinates,
            accuracy: 'High'
          }
        }
        break

      case 'fetching_data':
        if (job.status === 'fetching_data' || job.status === 'building_model' || job.status === 'rendering' || job.status === 'post_production' || job.status === 'deliver' || job.status === 'completed') {
          stepData = {
            elevation: {
              status: 'complete',
              minHeight: 45,
              maxHeight: 120
            },
            satellite: {
              status: 'complete',
              resolution: '1m/pixel'
            },
            weather: {
              status: 'complete',
              conditions: 'Sunny, 72°F, Light breeze'
            },
            layout: {
              status: 'complete',
              holeCount: 18,
              totalPar: 72
            }
          }
        }
        break

      case 'building_model':
        if (job.status === 'building_model' || job.status === 'rendering' || job.status === 'post_production' || job.status === 'deliver' || job.status === 'completed') {
          const progress = job.progress || 0
          const modelProgress = Math.min(progress * 2, 100) // Scale progress for model building
          
          stepData = {
            modelProgress: {
              vertices: Math.floor(50000 * (modelProgress / 100)),
              triangles: Math.floor(25000 * (modelProgress / 100)),
              textures: Math.floor(8 * (modelProgress / 100)),
              percentage: modelProgress
            },
            finalModel: {
              vertices: 50247,
              triangles: 25123,
              textures: 8,
              fileSize: '2.4'
            }
          }
        }
        break

      case 'rendering':
        if (job.status === 'rendering' || job.status === 'post_production' || job.status === 'deliver' || job.status === 'completed') {
          const progress = job.progress || 0
          const renderProgress = Math.max(0, (progress - 50) * 2) // Scale progress for rendering
          
          stepData = {
            renderProgress: {
              currentFrame: Math.floor(3600 * (renderProgress / 100)),
              totalFrames: 3600,
              fps: 30,
              resolution: '4K',
              estimatedTime: '2:30'
            },
            finalVideo: {
              resolution: '4K (3840x2160)',
              fps: 30,
              duration: 60,
              fileSize: '45.2'
            }
          }
        }
        break

      case 'post_production':
        if (job.status === 'post_production' || job.status === 'deliver' || job.status === 'completed') {
          const progress = job.progress || 0
          const audioProgress = Math.max(0, (progress - 75) * 4) // Scale progress for audio
          
          stepData = {
            audioProgress: {
              voiceover: { status: audioProgress > 25 ? 'complete' : 'processing' },
              background_music: { status: audioProgress > 50 ? 'complete' : 'processing' },
              audio_mixing: { status: audioProgress > 75 ? 'complete' : 'processing' },
              caption_sync: { status: audioProgress > 90 ? 'complete' : 'processing' }
            },
            finalAudio: {
              voiceover: { duration: 45 },
              music: { duration: 60 },
              captions: { wordCount: 120 },
              mix: { bitrate: 192 }
            }
          }
        }
        break

      case 'deliver':
        if (job.status === 'deliver' || job.status === 'completed') {
          const progress = job.progress || 0
          const assemblyProgress = Math.max(0, (progress - 90) * 10) // Scale progress for final assembly
          
          stepData = {
            assemblyProgress: {
              mergeProgress: Math.min(100, assemblyProgress),
              captionProgress: Math.min(100, assemblyProgress),
              optimizationProgress: Math.min(100, assemblyProgress),
              overallProgress: assemblyProgress
            },
            finalFile: {
              size: '50.2',
              format: 'MP4 (H.264)',
              quality: '4K Ultra HD',
              duration: 60,
              hasCaptions: true
            }
          }
        }
        break
    }

    res.json({
      success: true,
      data: stepData
    })
  } catch (error) {
    next(error)
  }
})

export default router
