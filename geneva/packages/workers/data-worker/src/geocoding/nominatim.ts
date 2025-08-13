import axios from 'axios'
import { logger } from '../utils/logger'
import { GeocodingResult, NominatimResponse } from '../types'

const NOMINATIM_URL = process.env.NOMINATIM_URL || 'https://nominatim.openstreetmap.org'

export async function geocodeCourse(courseName: string): Promise<[number, number] | null> {
  try {
    logger.info(`Geocoding course: ${courseName}`)

    // Add "golf course" to improve search accuracy
    const searchQuery = `${courseName} golf course`
    
    const response = await axios.get<NominatimResponse[]>(`${NOMINATIM_URL}/search`, {
      params: {
        q: searchQuery,
        format: 'json',
        limit: 5,
        addressdetails: 1,
        extratags: 1,
        namedetails: 1
      },
      headers: {
        'User-Agent': 'GolfVision/1.0 (https://github.com/your-org/golfvision)'
      },
      timeout: 10000
    })

    if (!response.data || response.data.length === 0) {
      logger.warn(`No results found for: ${courseName}`)
      return null
    }

    // Find the best match (highest importance score)
    const bestMatch = response.data.reduce((best, current) => 
      current.importance > best.importance ? current : best
    )

    const coordinates: [number, number] = [
      parseFloat(bestMatch.lat),
      parseFloat(bestMatch.lon)
    ]

    logger.info(`Geocoding successful for ${courseName}: ${coordinates[0]}, ${coordinates[1]}`)
    logger.debug(`Full result: ${bestMatch.display_name}`)

    return coordinates

  } catch (error) {
    logger.error(`Geocoding failed for ${courseName}:`, error)
    
    // Check if it's a rate limit error
    if (axios.isAxiosError(error) && error.response?.status === 429) {
      logger.warn('Rate limit exceeded for Nominatim, will retry later')
    }
    
    return null
  }
}

export async function reverseGeocode(coordinates: [number, number]): Promise<string | null> {
  try {
    const [lat, lon] = coordinates
    
    const response = await axios.get<NominatimResponse>(`${NOMINATIM_URL}/reverse`, {
      params: {
        lat,
        lon,
        format: 'json',
        addressdetails: 1,
        extratags: 1,
        namedetails: 1
      },
      headers: {
        'User-Agent': 'GolfVision/1.0 (https://github.com/your-org/golfvision)'
      },
      timeout: 10000
    })

    return response.data.display_name

  } catch (error) {
    logger.error(`Reverse geocoding failed for coordinates ${coordinates}:`, error)
    return null
  }
}

// Batch geocoding with rate limiting
export async function batchGeocode(courseNames: string[]): Promise<Map<string, [number, number]>> {
  const results = new Map<string, [number, number]>()
  
  for (const courseName of courseNames) {
    try {
      const coordinates = await geocodeCourse(courseName)
      if (coordinates) {
        results.set(courseName, coordinates)
      }
      
      // Rate limiting: wait 1 second between requests
      await new Promise(resolve => setTimeout(resolve, 1000))
      
    } catch (error) {
      logger.error(`Batch geocoding failed for ${courseName}:`, error)
    }
  }
  
  return results
}
