import axios from 'axios'
import { logger } from '../utils/logger'
import { DEMData, OpenTopoDataResponse } from '../types'

const OPENTOPODATA_URL = process.env.OPENTOPODATA_URL || 'https://api.opentopodata.org/v1'

export async function fetchDEMData(coordinates: [number, number]): Promise<DEMData | null> {
  try {
    const [lat, lon] = coordinates
    logger.info(`Fetching DEM data for coordinates: ${lat}, ${lon}`)

    const response = await axios.get<OpenTopoDataResponse>(`${OPENTOPODATA_URL}/srtm30m`, {
      params: {
        locations: `${lat},${lon}`,
        interpolation: 'cubic'
      },
      timeout: 15000
    })

    if (!response.data || !response.data.results || response.data.results.length === 0) {
      logger.warn(`No DEM data found for coordinates: ${lat}, ${lon}`)
      return null
    }

    const result = response.data.results[0]
    const demData: DEMData = {
      elevation: result.elevation,
      resolution: 30, // SRTM30m resolution
      source: 'SRTM30m'
    }

    logger.info(`DEM data fetched successfully: elevation ${demData.elevation}m`)
    return demData

  } catch (error) {
    logger.error(`DEM data fetch failed for coordinates ${coordinates}:`, error)
    
    // Check if it's a rate limit error
    if (axios.isAxiosError(error) && error.response?.status === 429) {
      logger.warn('Rate limit exceeded for OpenTopoData')
    }
    
    return null
  }
}

// Fetch DEM data for a bounding box (for larger areas)
export async function fetchDEMBoundingBox(
  minLat: number, 
  maxLat: number, 
  minLon: number, 
  maxLon: number,
  resolution: number = 30
): Promise<DEMData[] | null> {
  try {
    logger.info(`Fetching DEM data for bounding box: ${minLat},${minLon} to ${maxLat},${maxLon}`)

    // Generate grid of points within the bounding box
    const points = generateGridPoints(minLat, maxLat, minLon, maxLon, resolution)
    
    const demData: DEMData[] = []
    
    // Process points in batches to avoid overwhelming the API
    const batchSize = 10
    for (let i = 0; i < points.length; i += batchSize) {
      const batch = points.slice(i, i + batchSize)
      const locations = batch.map(([lat, lon]) => `${lat},${lon}`).join('|')
      
      const response = await axios.get<OpenTopoDataResponse>(`${OPENTOPODATA_URL}/srtm30m`, {
        params: {
          locations,
          interpolation: 'cubic'
        },
        timeout: 15000
      })

      if (response.data && response.data.results) {
        response.data.results.forEach((result, index) => {
          demData.push({
            elevation: result.elevation,
            resolution: 30,
            source: 'SRTM30m',
            coordinates: batch[index]
          })
        })
      }

      // Rate limiting: wait between batches
      if (i + batchSize < points.length) {
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
    }

    logger.info(`DEM bounding box data fetched: ${demData.length} points`)
    return demData

  } catch (error) {
    logger.error(`DEM bounding box fetch failed:`, error)
    return null
  }
}

// Generate a grid of points within a bounding box
function generateGridPoints(
  minLat: number, 
  maxLat: number, 
  minLon: number, 
  maxLon: number, 
  resolution: number
): [number, number][] {
  const points: [number, number][] = []
  const step = resolution / 111000 // Convert meters to degrees (approximate)
  
  for (let lat = minLat; lat <= maxLat; lat += step) {
    for (let lon = minLon; lon <= maxLon; lon += step) {
      points.push([lat, lon])
    }
  }
  
  return points
}

// Get elevation statistics for an area
export async function getElevationStats(coordinates: [number, number], radius: number = 1000): Promise<{
  min: number
  max: number
  average: number
  stdDev: number
} | null> {
  try {
    const [lat, lon] = coordinates
    const radiusDegrees = radius / 111000 // Convert meters to degrees
    
    const minLat = lat - radiusDegrees
    const maxLat = lat + radiusDegrees
    const minLon = lon - radiusDegrees
    const maxLon = lon + radiusDegrees
    
    const demData = await fetchDEMBoundingBox(minLat, maxLat, minLon, maxLon)
    
    if (!demData || demData.length === 0) {
      return null
    }
    
    const elevations = demData.map(d => d.elevation)
    const min = Math.min(...elevations)
    const max = Math.max(...elevations)
    const average = elevations.reduce((sum, elev) => sum + elev, 0) / elevations.length
    const variance = elevations.reduce((sum, elev) => sum + Math.pow(elev - average, 2), 0) / elevations.length
    const stdDev = Math.sqrt(variance)
    
    return { min, max, average, stdDev }
    
  } catch (error) {
    logger.error(`Elevation stats calculation failed:`, error)
    return null
  }
}
