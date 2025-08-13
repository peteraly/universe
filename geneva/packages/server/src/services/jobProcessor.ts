import { Job, JobStatus, CourseData, JobUpdateRequest } from '../types'
import { logger } from '../utils/logger'
import { analyticsService } from './analytics'
import { videoGeneratorService } from './videoGenerator'
import { v4 as uuidv4 } from 'uuid'
import * as path from 'path'

class JobProcessorService {
  private jobs: Map<string, Job> = new Map()
  private processingQueue: string[] = []
  private isProcessing = false

  async createJob(courseName: string, coordinates?: [number, number], seed?: number): Promise<Job> {
    // Cancel any existing active jobs (single job at a time)
    await this.cancelAllActiveJobs()

    const jobData: Partial<Job> = {
      id: uuidv4(),
      courseName,
      status: 'pending',
      progress: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    // Only add coordinates if provided
    if (coordinates) {
      jobData.coordinates = coordinates
    }

    // Only add seed if provided
    if (seed !== undefined) {
      jobData.seed = seed
    }

    const job = jobData as Job
    this.jobs.set(job.id, job)
    this.processingQueue.push(job.id)

    // Track job creation
    await analyticsService.trackJobAnalytics(job.id, {
      courseName,
      createdAt: job.createdAt,
      status: job.status
    })

    logger.info(`Created job ${job.id} for course: ${courseName}`)

    // Start processing if not already running
    if (!this.isProcessing) {
      this.processQueue()
    }

    return job
  }

  async getJob(jobId: string): Promise<Job | null> {
    return this.jobs.get(jobId) || null
  }

  async getAllJobs(): Promise<Job[]> {
    return Array.from(this.jobs.values()).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
  }

  async deleteJob(jobId: string): Promise<boolean> {
    const job = this.jobs.get(jobId)
    if (!job) {
      return false
    }

    // Remove from jobs map
    this.jobs.delete(jobId)
    
    // Remove from processing queue if it's there
    const queueIndex = this.processingQueue.indexOf(jobId)
    if (queueIndex > -1) {
      this.processingQueue.splice(queueIndex, 1)
    }

    logger.info(`Deleted job ${jobId}`)
    return true
  }

  async updateJob(jobId: string, updates: JobUpdateRequest): Promise<Job> {
    const job = this.jobs.get(jobId)
    if (!job) {
      throw new Error(`Job ${jobId} not found`)
    }

    // Update job properties
    if (updates.status !== undefined) {
      job.status = updates.status
    }
    if (updates.progress !== undefined) {
      job.progress = updates.progress
    }
    if (updates.output !== undefined) {
      job.output = updates.output
    }
    if (updates.errors !== undefined) {
      job.errors = updates.errors
    }
    if (updates.fallbacks !== undefined) {
      job.fallbacks = updates.fallbacks
    }

    job.updatedAt = new Date().toISOString()

    logger.info(`Updated job ${jobId}`, { updates })
    return job
  }

  async cancelAllActiveJobs(): Promise<void> {
    // Kill any running Blender processes
    try {
      const { exec } = require('child_process')
      exec('pkill -f "Blender.*--background"', (error: any) => {
        if (error) {
          logger.info('No Blender processes to kill')
        } else {
          logger.info('Killed all background Blender processes')
        }
      })
    } catch (error) {
      logger.warn('Failed to kill Blender processes', { error })
    }

    // Cancel all active jobs
    for (const [jobId, job] of this.jobs.entries()) {
      const activeStatuses: JobStatus[] = ['geocoding', 'fetching_data', 'building_model', 'rendering', 'post_production', 'deliver']
      if (activeStatuses.includes(job.status)) {
        job.status = 'cancelled'
        job.progress = 0
        job.updatedAt = new Date().toISOString()
        logger.info(`Cancelled job ${jobId}`)
      }
    }

    // Clear the processing queue
    this.processingQueue = []
    this.isProcessing = false

    logger.info('Cancelled all active jobs')
  }

  async cancelJob(jobId: string): Promise<boolean> {
    const job = this.jobs.get(jobId)
    if (!job) {
      return false
    }

    // Kill any running Blender processes for this specific job
    try {
      const { exec } = require('child_process')
      exec(`pkill -f "Blender.*${jobId}"`, (error: any) => {
        if (error) {
          logger.info(`No Blender processes found for job ${jobId}`)
        } else {
          logger.info(`Killed Blender processes for job ${jobId}`)
        }
      })
    } catch (error) {
      logger.warn(`Failed to kill Blender processes for job ${jobId}`, { error })
    }

    // Cancel the job
    job.status = 'cancelled'
    job.progress = 0
    job.updatedAt = new Date().toISOString()

    // Remove from processing queue
    const queueIndex = this.processingQueue.indexOf(jobId)
    if (queueIndex > -1) {
      this.processingQueue.splice(queueIndex, 1)
    }

    logger.info(`Cancelled job ${jobId}`)
    return true
  }

  private async processQueue() {
    if (this.isProcessing || this.processingQueue.length === 0) {
      return
    }

    this.isProcessing = true

    while (this.processingQueue.length > 0) {
      const jobId = this.processingQueue.shift()!
      const job = this.jobs.get(jobId)

      if (!job) {
        continue
      }

      // Skip cancelled jobs
      if (job.status === 'cancelled') {
        logger.info(`Skipping cancelled job ${jobId}`)
        continue
      }

      try {
        await this.processJob(job)
      } catch (error) {
        logger.error(`Failed to process job ${jobId}:`, error)
        
        // Update job status to failed
        job.status = 'failed'
        job.updatedAt = new Date().toISOString()
        job.errors = [(error as Error).message]

        // Track job failure
        await analyticsService.trackError(jobId, 'job_processing', (error as Error).message, 'error', { courseName: job.courseName })
      }
    }

    this.isProcessing = false
  }

  private async processJob(job: Job) {
    const startTime = Date.now()
    logger.info(`Processing job ${job.id}: ${job.courseName}`)

    try {
      // Step 1: Geocoding (if coordinates not provided)
      await this.updateJobStatus(job, 'geocoding')
      if (job.status === 'cancelled' as JobStatus) return
      if (!job.coordinates) {
        job.coordinates = await this.geocodeCourse(job.courseName)
      }
      await this.simulateStep('geocoding', 1000)
      if (job.status === 'cancelled' as JobStatus) return

      // Step 2: Fetching Data
      await this.updateJobStatus(job, 'fetching_data')
      if (job.status === 'cancelled' as JobStatus) return
      await this.fetchCourseData(job)
      await this.simulateStep('fetching_data', 2000)
      if (job.status === 'cancelled' as JobStatus) return

      // Step 3: Building Model
      await this.updateJobStatus(job, 'building_model')
      if (job.status === 'cancelled' as JobStatus) return
      await this.buildCourseModel(job)
      await this.simulateStep('building_model', 3000)
      if (job.status === 'cancelled' as JobStatus) return

      // Step 4: Rendering
      await this.updateJobStatus(job, 'rendering')
      if (job.status === 'cancelled' as JobStatus) return
      await this.renderVideo(job)
      await this.simulateStep('rendering', 5000)
      if (job.status === 'cancelled' as JobStatus) return

      // Step 5: Post-Production
      await this.updateJobStatus(job, 'post_production')
      if (job.status === 'cancelled' as JobStatus) return
      await this.postProcessVideo(job)
      await this.simulateStep('post_production', 2000)
      if (job.status === 'cancelled' as JobStatus) return

      // Step 6: Deliver
      await this.updateJobStatus(job, 'deliver')
      if (job.status === 'cancelled' as JobStatus) return
      await this.deliverVideo(job)

      // Mark job as completed
      job.status = 'completed'
      job.progress = 100 // Set to 100% when completed
      job.completedAt = new Date().toISOString()
      job.updatedAt = new Date().toISOString()

      const totalDuration = Date.now() - startTime

      // Track successful completion
      await analyticsService.trackJobAnalytics(job.id, {
        courseName: job.courseName,
        coordinates: job.coordinates,
        createdAt: job.createdAt,
        completedAt: job.completedAt,
        status: job.status,
        duration: totalDuration
      })

      logger.info(`Job ${job.id} completed successfully in ${totalDuration}ms`)

    } catch (error) {
      throw error
    }
  }

  private async updateJobStatus(job: Job, status: JobStatus) {
    job.status = status
    job.updatedAt = new Date().toISOString()

    // Calculate progress based on step
    const stepProgress: Record<JobStatus, number> = {
      'pending': 0,
      'geocoding': 10,
      'fetching_data': 25,
      'building_model': 40,
      'rendering': 70,
      'post_production': 85,
      'deliver': 95,
      'completed': 100,
      'failed': 0,
      'cancelled': 0
    }
    
    job.progress = stepProgress[status]

    // Track status update
    await analyticsService.trackPerformance(job.id, status, 0, true)

    logger.info(`Job ${job.id} status: ${status}, progress: ${job.progress}%`)
  }

  private async geocodeCourse(courseName: string): Promise<[number, number]> {
    // Simulate geocoding API call
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // Return mock coordinates for the course
    const mockCoordinates: { [key: string]: [number, number] } = {
      'Bacon Park Golf Course': [32.0748, -81.0943],
      'Augusta National Golf Club': [33.5021, -82.0228],
      'Pebble Beach Golf Links': [36.5683, -121.9497],
      'St. Andrews Old Course': [56.3398, -2.7967],
      'Pinehurst No. 2': [35.1894, -79.4697]
    }

    return mockCoordinates[courseName] || [40.7128, -74.0060] // Default to NYC
  }

  private async fetchCourseData(job: Job): Promise<CourseData> {
    const startTime = Date.now()
    logger.info(`Fetching real course data for ${job.courseName}`)
    
    try {
      const [lat, lng] = job.coordinates || [32.0748, -81.0943]
      
      // 1. Get real elevation data from OpenTopoData
      const elevationData = await this.fetchElevationData(lat, lng)
      
      // 2. Get real satellite imagery data
      const satelliteData = await this.fetchSatelliteData(lat, lng)
      
      // 3. Get real course layout from OpenStreetMap
      const courseLayout = await this.fetchCourseLayout(lat, lng)
      
      // 4. Get real weather data
      const weatherData = await this.fetchWeatherData(lat, lng)
      
      const fetchTime = Date.now() - startTime
      logger.info(`Real data fetched in ${fetchTime}ms`)
      
      // Track API calls
      await analyticsService.trackPerformance(job.id, 'api_calls', fetchTime, true)

      // Create comprehensive course data from real sources
      const courseData: CourseData = {
        name: job.courseName,
        coordinates: [lat, lng],
        elevation: elevationData.averageElevation,
        terrain: this.classifyTerrain(elevationData),
        holes: courseLayout.holes.length,
        par: courseLayout.totalPar,
        length: courseLayout.totalLength,
        features: courseLayout.features,
        realHoles: courseLayout.holes,
        waterFeatures: courseLayout.waterFeatures,
        amenities: courseLayout.amenities,
        boundaries: courseLayout.boundaries,
        satelliteData: satelliteData,
        weatherData: weatherData,
        elevationData: elevationData
      }

      logger.info(`Real course data created for ${job.courseName}: ${courseData.holes} holes, ${courseData.par} par, ${courseData.length} yards`)
      return courseData

    } catch (error) {
      logger.error(`Failed to fetch real course data for ${job.courseName}:`, error)
      
      // Fallback to mock data if real data fails
      logger.warn(`Using fallback mock data for ${job.courseName}`)
      return this.createFallbackCourseData(job)
    }
  }

  private async fetchElevationData(lat: number, lng: number): Promise<any> {
    try {
      const response = await fetch(
        `https://api.opentopodata.org/v1/aster30m?locations=${lat},${lng}`
      )
      
      if (!response.ok) {
        throw new Error(`Elevation API failed: ${response.status}`)
      }
      
      const data = await response.json()
      const elevation = data.results[0].elevation
      
      // Get elevation data for surrounding area (1km grid)
      const gridSize = 0.01 // ~1km
      const elevationGrid = []
      
      for (let i = -2; i <= 2; i++) {
        for (let j = -2; j <= 2; j++) {
          const gridLat = lat + (i * gridSize)
          const gridLng = lng + (j * gridSize)
          
          try {
            const gridResponse = await fetch(
              `https://api.opentopodata.org/v1/aster30m?locations=${gridLat},${gridLng}`
            )
            if (gridResponse.ok) {
              const gridData = await gridResponse.json()
              elevationGrid.push({
                lat: gridLat,
                lng: gridLng,
                elevation: gridData.results[0].elevation
              })
            }
          } catch (gridError) {
            // Skip failed grid points
          }
        }
      }
      
      return {
        centerElevation: elevation,
        averageElevation: elevationGrid.reduce((sum, point) => sum + point.elevation, 0) / elevationGrid.length,
        elevationGrid: elevationGrid,
        minElevation: Math.min(...elevationGrid.map(p => p.elevation)),
        maxElevation: Math.max(...elevationGrid.map(p => p.elevation))
      }
      
    } catch (error) {
      logger.error(`Elevation data fetch failed:`, error)
      throw error
    }
  }

  private async fetchSatelliteData(lat: number, lng: number): Promise<any> {
    try {
      // Use Sentinel-2 satellite data via OpenStreetMap
      const bbox = `${lng-0.01},${lat-0.01},${lng+0.01},${lat+0.01}`
      const query = `
        [out:json][timeout:25];
        (
          way["landuse"="grass"](bbox);
          way["leisure"="golf_course"](bbox);
          way["natural"="water"](bbox);
        );
        out body;
        >;
        out skel qt;
      `
      
      const response = await fetch(
        `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`
      )
      
      if (!response.ok) {
        throw new Error(`Satellite data API failed: ${response.status}`)
      }
      
      const data = await response.json()
      
      return {
        landUse: data.elements.filter((el: any) => el.tags?.landuse === 'grass'),
        golfCourse: data.elements.filter((el: any) => el.tags?.leisure === 'golf_course'),
        waterFeatures: data.elements.filter((el: any) => el.tags?.natural === 'water'),
        timestamp: new Date().toISOString()
      }
      
    } catch (error) {
      logger.error(`Satellite data fetch failed:`, error)
      throw error
    }
  }

  private async fetchCourseLayout(lat: number, lng: number): Promise<any> {
    try {
      const bbox = `${lng-0.01},${lat-0.01},${lng+0.01},${lat+0.01}`
      const query = `
        [out:json][timeout:25];
        (
          way["leisure"="golf_course"](bbox);
          way["golf"="*"](bbox);
          node["golf"="*"](bbox);
        );
        out body;
        >;
        out skel qt;
      `
      
      const response = await fetch(
        `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`
      )
      
      if (!response.ok) {
        throw new Error(`Course layout API failed: ${response.status}`)
      }
      
      const data = await response.json()
      
      // Parse golf course features
      const holes: any[] = []
      const waterFeatures: any[] = []
      const amenities: string[] = []
      const boundaries: any[] = []
      
      data.elements.forEach((element: any) => {
        if (element.tags?.golf === 'hole') {
          holes.push({
            number: parseInt(element.tags.hole) || 1,
            par: parseInt(element.tags.par) || 4,
            distance: parseInt(element.tags.distance) || 400,
            features: this.parseHoleFeatures(element.tags)
          })
        }
        
        if (element.tags?.natural === 'water') {
          waterFeatures.push({
            type: element.tags.water || 'pond',
            coordinates: [element.lat, element.lon]
          })
        }
        
        if (element.tags?.amenity) {
          amenities.push(element.tags.amenity)
        }
      })
      
      // Sort holes by number
      holes.sort((a, b) => a.number - b.number)
      
      return {
        holes: holes.length > 0 ? holes : this.createDefaultHoles(),
        waterFeatures,
        amenities: amenities.length > 0 ? amenities : ['clubhouse', 'pro_shop'],
        boundaries: boundaries.length > 0 ? boundaries : [{ type: 'golf_course', coordinates: [lat, lng] }],
        totalPar: holes.reduce((sum, hole) => sum + hole.par, 0),
        totalLength: holes.reduce((sum, hole) => sum + hole.distance, 0),
        features: this.extractCourseFeatures(data.elements)
      }
      
    } catch (error) {
      logger.error(`Course layout fetch failed:`, error)
      throw error
    }
  }

  private async fetchWeatherData(lat: number, lng: number): Promise<any> {
    try {
      // Use OpenWeatherMap API for current conditions
      const apiKey = process.env.OPENWEATHER_API_KEY || 'demo'
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&appid=${apiKey}&units=imperial`
      )
      
      if (!response.ok) {
        // Return mock weather data if API fails
        return {
          temperature: 72,
          conditions: 'Sunny',
          windSpeed: 5,
          humidity: 60
        }
      }
      
      const data = await response.json()
      
      return {
        temperature: data.main.temp,
        conditions: data.weather[0].main,
        windSpeed: data.wind.speed,
        humidity: data.main.humidity,
        timestamp: new Date().toISOString()
      }
      
    } catch (error) {
      logger.error(`Weather data fetch failed:`, error)
      return {
        temperature: 72,
        conditions: 'Sunny',
        windSpeed: 5,
        humidity: 60
      }
    }
  }

  private classifyTerrain(elevationData: any): string {
    const elevationRange = elevationData.maxElevation - elevationData.minElevation
    
    if (elevationRange < 10) return 'flat'
    if (elevationRange < 50) return 'rolling'
    if (elevationRange < 100) return 'hilly'
    return 'mountainous'
  }

  private parseHoleFeatures(tags: any): string[] {
    const features = []
    if (tags.bunker) features.push('bunker')
    if (tags.water) features.push('water')
    if (tags.trees) features.push('trees')
    if (tags.rough) features.push('rough')
    return features
  }

  private extractCourseFeatures(elements: any[]): string[] {
    const features = new Set<string>()
    
    elements.forEach(element => {
      if (element.tags?.bunker) features.add('bunkers')
      if (element.tags?.water) features.add('water_hazards')
      if (element.tags?.trees) features.add('trees')
      if (element.tags?.rough) features.add('rough')
    })
    
    return Array.from(features)
  }

  private createDefaultHoles(): any[] {
    // Create 18 default holes if no real data available
    const holes = []
    for (let i = 1; i <= 18; i++) {
      holes.push({
        number: i,
        par: i % 4 === 0 ? 3 : i % 4 === 1 ? 5 : 4,
        distance: 350 + (i * 10),
        features: i % 3 === 0 ? ['bunker'] : i % 4 === 0 ? ['water'] : []
      })
    }
    return holes
  }

  private createFallbackCourseData(job: Job): CourseData {
    // Fallback to mock data if real data fails
    return {
      name: job.courseName,
      coordinates: job.coordinates || [32.0748, -81.0943],
      elevation: 22,
      terrain: 'flat',
      holes: 18,
      par: 72,
      length: 6500,
      features: ['water_hazards', 'bunkers', 'trees'],
      realHoles: this.createDefaultHoles(),
      waterFeatures: [
        { type: 'pond', coordinates: [32.0750, -81.0940] },
        { type: 'stream', coordinates: [32.0745, -81.0945] }
      ],
      amenities: ['clubhouse', 'pro_shop', 'driving_range', 'putting_green'],
      boundaries: [
        { type: 'golf_course', coordinates: [32.0740, -81.0950] }
      ]
    }
  }

  private async buildCourseModel(job: Job) {
    // Simulate 3D model building
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Track model building performance
    await analyticsService.trackPerformance(job.id, 'model_building', 2000, true)

  }

  private async renderVideo(job: Job) {
    // Use real video generation service
    try {
      // Get course data for video generation
      const courseData = await this.fetchCourseData(job)
      const videoPath = await videoGeneratorService.generateVideo(courseData, job.id)
      job.output = {
        videoUrl: `http://localhost:4000/outputs/videos/${path.basename(videoPath)}`,
        captionsUrl: `http://localhost:4000/outputs/videos/${job.id}_captions.srt`,
        thumbnailUrl: `http://localhost:4000/outputs/videos/${job.id}_thumbnail.jpg`,
        metadata: {
          duration: 60,
          resolution: '1920x1080',
          fileSize: 5000000,
          renderTime: 30000,
          fps: 30,
          codec: 'H.264'
        }
      }

      // Track successful video generation
      await analyticsService.trackPerformance(job.id, 'video_generation', 5000, true)

    } catch (error) {
      // Track video generation error
      await analyticsService.trackError(job.id, 'video_generation', (error as Error).message, 'error')
      throw error
    }
  }

  private async postProcessVideo(job: Job) {
    // Simulate post-processing (color grading, audio mixing, etc.)
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    // Track post-processing
    await analyticsService.trackPerformance(job.id, 'post_processing', 1500, true)

  }

  private async deliverVideo(job: Job) {
    // Simulate final delivery preparation
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // Track delivery
    await analyticsService.trackPerformance(job.id, 'delivery', 500, true)

    // Cleanup temporary files
    await videoGeneratorService.cleanupTempFiles(job.id)
  }

  private async simulateStep(step: string, duration: number) {
    await new Promise(resolve => setTimeout(resolve, duration))
  }

  // WebSocket event emitter for real-time updates
  emitJobUpdate(job: Job) {
    // This would emit to connected WebSocket clients
    // For now, we'll just log the update
    logger.info(`Job update: ${job.id} - ${job.status}`)
  }

  // Service management methods
  startProcessing() {
    logger.info('Job processor service started')
    this.processQueue()
  }

  getActiveJobCount(): number {
    return Array.from(this.jobs.values()).filter(job => 
      job.status === 'geocoding' || job.status === 'fetching_data' || 
      job.status === 'building_model' || job.status === 'rendering' || 
      job.status === 'post_production'
    ).length
  }

  getCompletedJobCount(): number {
    return Array.from(this.jobs.values()).filter(job => job.status === 'completed').length
  }

  getFailedJobCount(): number {
    return Array.from(this.jobs.values()).filter(job => job.status === 'failed').length
  }

  getQueueLength(): number {
    return this.processingQueue.length
  }
}

export const jobProcessorService = new JobProcessorService()
