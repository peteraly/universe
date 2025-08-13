export interface JobData {
  courseName: string
  coordinates?: [number, number]
  seed?: number
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

export interface GeocodingResult {
  coordinates: [number, number]
  displayName: string
  confidence: number
}

export interface DEMData {
  elevation: number
  resolution: number
  source: string
}

export interface OSMData {
  holes: Hole[]
  amenities: string[]
  boundaries: any[]
  waterFeatures: any[]
}

export interface NominatimResponse {
  place_id: number
  licence: string
  osm_type: string
  osm_id: number
  boundingbox: string[]
  lat: string
  lon: string
  display_name: string
  class: string
  type: string
  importance: number
  icon?: string
}

export interface OpenTopoDataResponse {
  status: string
  results: Array<{
    dataset: string
    elevation: number
    location: {
      lat: number
      lng: number
    }
  }>
}

export interface OverpassResponse {
  elements: Array<{
    type: string
    id: number
    lat?: number
    lon?: number
    tags?: Record<string, string>
    nodes?: number[]
    geometry?: Array<{
      lat: number
      lon: number
    }>
  }>
}
