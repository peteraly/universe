import axios from 'axios'
import { logger } from '../utils/logger'
import { OSMData, OverpassResponse, Hole } from '../types'

const OVERPASS_URL = process.env.OVERPASS_URL || 'https://overpass-api.de/api'

export async function fetchOSMData(coordinates: [number, number]): Promise<OSMData | null> {
  try {
    const [lat, lon] = coordinates
    logger.info(`Fetching OSM data for coordinates: ${lat}, ${lon}`)

    // Define the search area (1km radius)
    const radius = 1000 // meters
    const radiusDegrees = radius / 111000 // Convert to degrees (approximate)
    
    const minLat = lat - radiusDegrees
    const maxLat = lat + radiusDegrees
    const minLon = lon - radiusDegrees
    const maxLon = lon + radiusDegrees

    // Build Overpass query
    const query = buildOverpassQuery(minLat, maxLat, minLon, maxLon)
    
    const response = await axios.get<OverpassResponse>(`${OVERPASS_URL}/interpreter`, {
      params: {
        data: query
      },
      timeout: 30000
    })

    if (!response.data || !response.data.elements) {
      logger.warn(`No OSM data found for coordinates: ${lat}, ${lon}`)
      return null
    }

    const osmData = parseOSMData(response.data.elements, coordinates)
    logger.info(`OSM data fetched successfully: ${osmData.holes.length} holes found`)
    
    return osmData

  } catch (error) {
    logger.error(`OSM data fetch failed for coordinates ${coordinates}:`, error)
    
    // Check if it's a rate limit error
    if (axios.isAxiosError(error) && error.response?.status === 429) {
      logger.warn('Rate limit exceeded for Overpass API')
    }
    
    return null
  }
}

function buildOverpassQuery(minLat: number, maxLat: number, minLon: number, maxLon: number): string {
  return `
    [out:json][timeout:25];
    (
      // Golf course areas
      way["leisure"="golf_course"](${minLat},${minLon},${maxLat},${maxLon});
      relation["leisure"="golf_course"](${minLat},${minLon},${maxLat},${maxLon});
      
      // Golf course features
      way["golf"="*"](${minLat},${minLon},${maxLat},${maxLon});
      node["golf"="*"](${minLat},${minLon},${maxLat},${maxLon});
      
      // Water features
      way["natural"="water"](${minLat},${minLon},${maxLat},${maxLon});
      way["water"="*"](${minLat},${minLon},${maxLat},${maxLon});
      
      // Buildings and amenities
      way["building"="*"](${minLat},${minLon},${maxLat},${maxLon});
      node["amenity"="*"](${minLat},${minLon},${maxLat},${maxLon});
      
      // Land use
      way["landuse"="*"](${minLat},${minLon},${maxLat},${maxLon});
    );
    out body;
    >;
    out skel qt;
  `.replace(/\s+/g, ' ').trim()
}

function parseOSMData(elements: any[], centerCoordinates: [number, number]): OSMData {
  const holes: Hole[] = []
  const amenities: string[] = []
  const boundaries: any[] = []
  const waterFeatures: any[] = []

  // Find golf course boundaries
  const golfCourseWays = elements.filter(el => 
    el.type === 'way' && 
    el.tags && 
    el.tags.leisure === 'golf_course'
  )

  // Find golf holes
  const golfHoles = elements.filter(el => 
    el.tags && 
    el.tags.golf && 
    (el.tags.golf.includes('hole') || el.tags.golf.includes('green'))
  )

  // Parse golf holes
  golfHoles.forEach((hole, index) => {
    const holeNumber = extractHoleNumber(hole.tags.golf) || index + 1
    const par = extractPar(hole.tags.golf) || 4
    const distance = extractDistance(hole.tags.golf) || 400
    
    holes.push({
      number: holeNumber,
      par,
      distance,
      coordinates: hole.lat && hole.lon ? [hole.lat, hole.lon] : centerCoordinates,
      features: extractFeatures(hole.tags)
    })
  })

  // Sort holes by number
  holes.sort((a, b) => a.number - b.number)

  // If no holes found, generate procedural holes
  if (holes.length === 0) {
    holes.push(...generateProceduralHoles(centerCoordinates))
  }

  // Parse amenities
  const amenityNodes = elements.filter(el => 
    el.type === 'node' && 
    el.tags && 
    el.tags.amenity
  )

  amenityNodes.forEach(node => {
    if (node.tags.amenity) {
      amenities.push(node.tags.amenity)
    }
  })

  // Parse water features
  const waterWays = elements.filter(el => 
    el.type === 'way' && 
    el.tags && 
    (el.tags.natural === 'water' || el.tags.water)
  )

  waterWays.forEach(way => {
    waterFeatures.push({
      type: way.tags.natural || way.tags.water,
      coordinates: way.geometry || []
    })
  })

  // Parse boundaries
  golfCourseWays.forEach(way => {
    boundaries.push({
      type: 'golf_course',
      coordinates: way.geometry || []
    })
  })

  return {
    holes,
    amenities: [...new Set(amenities)], // Remove duplicates
    boundaries,
    waterFeatures
  }
}

function extractHoleNumber(golfTag: string): number | null {
  const match = golfTag.match(/hole[:\s]*(\d+)/i)
  return match ? parseInt(match[1]) : null
}

function extractPar(golfTag: string): number | null {
  const match = golfTag.match(/par[:\s]*(\d+)/i)
  return match ? parseInt(match[1]) : null
}

function extractDistance(golfTag: string): number | null {
  const match = golfTag.match(/(\d+)\s*(m|meter|meters|yard|yards)/i)
  return match ? parseInt(match[1]) : null
}

function extractFeatures(tags: Record<string, string>): string[] {
  const features: string[] = []
  
  if (tags.golf?.includes('green')) features.push('green')
  if (tags.golf?.includes('tee')) features.push('tee')
  if (tags.golf?.includes('fairway')) features.push('fairway')
  if (tags.golf?.includes('bunker')) features.push('bunker')
  if (tags.golf?.includes('rough')) features.push('rough')
  
  return features
}

function generateProceduralHoles(centerCoordinates: [number, number]): Hole[] {
  const holes: Hole[] = []
  const [centerLat, centerLon] = centerCoordinates
  
  // Generate 18 holes in a logical layout
  for (let i = 1; i <= 18; i++) {
    // Calculate position based on hole number
    const angle = (i - 1) * (Math.PI / 9) // 20 degrees between holes
    const distance = 50 + (i % 3) * 25 // Varying distances
    const lat = centerLat + Math.cos(angle) * distance / 111000
    const lon = centerLon + Math.sin(angle) * distance / 111000
    
    holes.push({
      number: i,
      par: i <= 4 ? 3 : i <= 14 ? 4 : 5,
      distance: 150 + Math.random() * 200,
      coordinates: [lat, lon],
      features: ['fairway', 'green']
    })
  }
  
  return holes
}

// Fetch OSM data for a larger area (for course overview)
export async function fetchOSMOverview(coordinates: [number, number], radius: number = 5000): Promise<OSMData | null> {
  try {
    const [lat, lon] = coordinates
    const radiusDegrees = radius / 111000
    
    const minLat = lat - radiusDegrees
    const maxLat = lat + radiusDegrees
    const minLon = lon - radiusDegrees
    const maxLon = lon + radiusDegrees

    const query = buildOverviewQuery(minLat, maxLat, minLon, maxLon)
    
    const response = await axios.get<OverpassResponse>(`${OVERPASS_URL}/interpreter`, {
      params: { data: query },
      timeout: 60000
    })

    if (!response.data || !response.data.elements) {
      return null
    }

    return parseOSMData(response.data.elements, coordinates)

  } catch (error) {
    logger.error(`OSM overview fetch failed:`, error)
    return null
  }
}

function buildOverviewQuery(minLat: number, maxLat: number, minLon: number, maxLon: number): string {
  return `
    [out:json][timeout:60];
    (
      // Golf courses
      way["leisure"="golf_course"](${minLat},${minLon},${maxLat},${maxLon});
      relation["leisure"="golf_course"](${minLat},${minLon},${maxLat},${maxLon});
      
      // Major roads
      way["highway"="primary"](${minLat},${minLon},${maxLat},${maxLon});
      way["highway"="secondary"](${minLat},${minLon},${maxLat},${maxLon});
      
      // Water bodies
      way["natural"="water"](${minLat},${minLon},${maxLat},${maxLon});
      relation["natural"="water"](${minLat},${minLon},${maxLat},${maxLon});
      
      // Land use
      way["landuse"="*"](${minLat},${minLon},${maxLat},${maxLon});
    );
    out body;
    >;
    out skel qt;
  `.replace(/\s+/g, ' ').trim()
}
