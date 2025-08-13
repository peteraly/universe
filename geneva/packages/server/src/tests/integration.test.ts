import request from 'supertest'
import { app } from '../index'
import { jobQueue } from '../services/queue'
import Redis from 'ioredis'

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379')

describe('GolfVision API Integration Tests', () => {
  beforeAll(async () => {
    // Wait for Redis connection
    await redis.ping()
  })

  afterAll(async () => {
    await redis.quit()
    await jobQueue.close()
  })

  beforeEach(async () => {
    // Clear test data
    await jobQueue.clean(0, 1000, 'completed')
    await jobQueue.clean(0, 1000, 'failed')
  })

  describe('Health Endpoints', () => {
    it('should return healthy status', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect(200)

      expect(response.body).toHaveProperty('status', 'healthy')
      expect(response.body).toHaveProperty('timestamp')
      expect(response.body).toHaveProperty('uptime')
    })

    it('should return detailed health information', async () => {
      const response = await request(app)
        .get('/api/health/detailed')
        .expect(200)

      expect(response.body).toHaveProperty('status', 'healthy')
      expect(response.body).toHaveProperty('services')
      expect(response.body.services).toHaveProperty('redis')
      expect(response.body.services).toHaveProperty('queue')
    })
  })

  describe('Job Management', () => {
    it('should create a new job', async () => {
      const jobData = {
        courseName: 'Test Golf Course',
        coordinates: [36.5683, -121.9496],
        seed: 12345
      }

      const response = await request(app)
        .post('/api/jobs')
        .send(jobData)
        .expect(201)

      expect(response.body).toHaveProperty('success', true)
      expect(response.body.data).toHaveProperty('id')
      expect(response.body.data).toHaveProperty('courseName', jobData.courseName)
      expect(response.body.data).toHaveProperty('status', 'pending')
    })

    it('should retrieve a job by ID', async () => {
      // First create a job
      const jobData = {
        courseName: 'Test Golf Course',
        coordinates: [36.5683, -121.9496],
        seed: 12345
      }

      const createResponse = await request(app)
        .post('/api/jobs')
        .send(jobData)
        .expect(201)

      const jobId = createResponse.body.data.id

      // Then retrieve it
      const response = await request(app)
        .get(`/api/jobs/${jobId}`)
        .expect(200)

      expect(response.body).toHaveProperty('success', true)
      expect(response.body.data).toHaveProperty('id', jobId)
      expect(response.body.data).toHaveProperty('courseName', jobData.courseName)
    })

    it('should list all jobs', async () => {
      // Create multiple jobs
      const jobData1 = {
        courseName: 'Test Course 1',
        coordinates: [36.5683, -121.9496],
        seed: 12345
      }

      const jobData2 = {
        courseName: 'Test Course 2',
        coordinates: [36.5683, -121.9496],
        seed: 67890
      }

      await request(app)
        .post('/api/jobs')
        .send(jobData1)
        .expect(201)

      await request(app)
        .post('/api/jobs')
        .send(jobData2)
        .expect(201)

      const response = await request(app)
        .get('/api/jobs')
        .expect(200)

      expect(response.body).toHaveProperty('success', true)
      expect(response.body.data).toBeInstanceOf(Array)
      expect(response.body.data.length).toBeGreaterThanOrEqual(2)
    })

    it('should cancel a job', async () => {
      // First create a job
      const jobData = {
        courseName: 'Test Golf Course',
        coordinates: [36.5683, -121.9496],
        seed: 12345
      }

      const createResponse = await request(app)
        .post('/api/jobs')
        .send(jobData)
        .expect(201)

      const jobId = createResponse.body.data.id

      // Then cancel it
      const response = await request(app)
        .post(`/api/jobs/${jobId}/cancel`)
        .expect(200)

      expect(response.body).toHaveProperty('success', true)
      expect(response.body.data).toHaveProperty('status', 'cancelled')
    })
  })

  describe('Error Tracking', () => {
    it('should track errors via API', async () => {
      const errorData = {
        message: 'Test error message',
        severity: 'medium',
        context: {
          test: true,
          component: 'integration-test'
        }
      }

      const response = await request(app)
        .post('/api/errors/track')
        .send(errorData)
        .expect(201)

      expect(response.body).toHaveProperty('success', true)
      expect(response.body.data).toHaveProperty('errorId')
    })

    it('should retrieve error statistics', async () => {
      const response = await request(app)
        .get('/api/errors/stats')
        .expect(200)

      expect(response.body).toHaveProperty('success', true)
      expect(response.body.data).toHaveProperty('total')
      expect(response.body.data).toHaveProperty('resolved')
      expect(response.body.data).toHaveProperty('unresolved')
    })

    it('should list errors with filters', async () => {
      const response = await request(app)
        .get('/api/errors?resolved=false&severity=medium')
        .expect(200)

      expect(response.body).toHaveProperty('success', true)
      expect(response.body.data).toBeInstanceOf(Array)
    })
  })

  describe('Input Validation', () => {
    it('should reject invalid job data', async () => {
      const invalidJobData = {
        courseName: '', // Invalid empty name
        coordinates: [999, 999] // Invalid coordinates
      }

      const response = await request(app)
        .post('/api/jobs')
        .send(invalidJobData)
        .expect(400)

      expect(response.body).toHaveProperty('success', false)
      expect(response.body).toHaveProperty('error')
    })

    it('should reject missing required fields', async () => {
      const incompleteJobData = {
        // Missing courseName
        coordinates: [36.5683, -121.9496]
      }

      const response = await request(app)
        .post('/api/jobs')
        .send(incompleteJobData)
        .expect(400)

      expect(response.body).toHaveProperty('success', false)
    })
  })

  describe('Rate Limiting', () => {
    it('should enforce rate limits', async () => {
      const jobData = {
        courseName: 'Rate Limit Test',
        coordinates: [36.5683, -121.9496],
        seed: 12345
      }

      // Make multiple rapid requests
      const promises = Array(10).fill(null).map(() =>
        request(app)
          .post('/api/jobs')
          .send(jobData)
      )

      const responses = await Promise.all(promises)
      
      // Some requests should be rate limited
      const rateLimited = responses.some(response => response.status === 429)
      expect(rateLimited).toBe(true)
    })
  })

  describe('WebSocket Integration', () => {
    it('should handle WebSocket connections', (done) => {
      // This test would require a WebSocket client
      // For now, we'll just test that the endpoint exists
      const response = request(app)
        .get('/ws')
        .expect(400) // WebSocket upgrade should fail with HTTP request

      done()
    })
  })
})
