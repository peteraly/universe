import React, { useRef, useEffect, useState, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

// Mobile detection utility
const isMobileDevice = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
         window.innerWidth <= 768;
};

// Network detection utility
const getNetworkInfo = () => {
  if ('connection' in navigator) {
    const connection = navigator.connection;
    return {
      effectiveType: connection.effectiveType,
      downlink: connection.downlink,
      rtt: connection.rtt
    };
  }
  return { effectiveType: 'unknown' };
};

// Simple error boundary for map component
const MapErrorBoundary = ({ children, fallback }) => {
  const [hasError, setHasError] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const handleError = (error) => {
      console.error('Map error caught:', error);
      setHasError(true);
      setError(error);
    };

    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  if (hasError) {
    return fallback || (
      <div className="map-error-fallback" style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        textAlign: 'center',
        padding: '20px'
      }}>
        <div>
          <h3>Map temporarily unavailable</h3>
          <p>Event discovery is still fully functional</p>
          <button 
            onClick={() => setHasError(false)}
            style={{
              padding: '10px 20px',
              background: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return children;
};

// Mapbox configuration
const MAPBOX_CONFIG = {
  token: 'pk.eyJ1IjoicGV0ZXJhbHkiLCJhIjoiY21lNXpuNDhwMTBqZTJwb2RicWw5YWcxaSJ9.IiIfhu1oA2ua_oUDcjlIbQ',
  style: 'mapbox://styles/mapbox/light-v11',
  center: [-122.4194, 37.7749], // [lng, lat] for Mapbox
  zoom: 13
};

const EventDiscoveryMap = ({ 
  events = [], 
  selectedCategory, 
  selectedSubcategory, 
  onEventSelect 
}) => {
  const mapContainer = useRef(null);
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState(null);
  const [pins, setPins] = useState([]);
  const [useFallback, setUseFallback] = useState(false);
  
  // Mobile-specific state
  const [isMobile, setIsMobile] = useState(false);
  const [networkInfo, setNetworkInfo] = useState({ effectiveType: 'unknown' });
  const [mapReady, setMapReady] = useState(false);
  const [mobileLoadingDelay, setMobileLoadingDelay] = useState(0);
  const [forceFallback, setForceFallback] = useState(false);

  // Create map pins from events with comprehensive validation
  const createMapPins = useCallback((events) => {
    if (!Array.isArray(events)) {
      console.warn('Events is not an array:', events);
      return [];
    }

    return events.map((event, index) => {
      try {
        // Validate required properties
        if (!event || typeof event !== 'object') {
          console.warn(`Event ${index} is not a valid object:`, event);
          return null;
        }

        // Safe string conversion with fallbacks
        const safeString = (value, fallback = '') => {
          if (typeof value === 'string') return value;
          if (value === null || value === undefined) return fallback;
          return String(value);
        };

        // Validate coordinates
        const lat = parseFloat(event.latitude);
        const lng = parseFloat(event.longitude);
        if (isNaN(lat) || isNaN(lng)) {
          console.warn(`Event ${index} has invalid coordinates:`, event);
          return null;
        }

        return {
          id: safeString(event.id, `event-${index}`),
          position: [lat, lng],
          popup: {
            title: safeString(event.name, 'Untitled Event'),
            description: safeString(event.description, 'No description available'),
            venue: safeString(event.venue, 'Venue TBD'),
            time: safeString(event.time, 'Time TBD'),
            day: safeString(event.day, 'Day TBD'),
            price: safeString(event.price, 'Price TBD'),
            attendees: safeString(event.attendees, '0')
          },
          category: safeString(event.categoryPrimary, 'Other'),
          subcategory: safeString(event.categorySecondary, 'General'),
          time: safeString(event.time, 'Time TBD'),
          day: safeString(event.day, 'Day TBD'),
          color: getCategoryColor(event.categoryPrimary),
          size: getEventSize(event.attendees),
          visible: true,
          event: event
        };
      } catch (error) {
        console.error(`Error creating pin for event ${index}:`, error, event);
        return null;
      }
    }).filter(pin => pin !== null); // Remove null pins
  }, []);

  // Get category color
  const getCategoryColor = (category) => {
    const colors = {
      'Music': '#e63946',
      'Food': '#f77f00',
      'Sports': '#2a9d8f',
      'Art': '#7209b7',
      'Tech': '#3a86ff',
      'Outdoor': '#06d6a0',
      'Nightlife': '#f72585',
      'Family': '#ffbe0b'
    };
    return colors[category] || '#6c757d';
  };

  // Get event size based on attendees
  const getEventSize = (attendees) => {
    // Safe string conversion with fallback
    const safeAttendees = typeof attendees === 'string' ? attendees : String(attendees || '0');
    const count = parseInt(safeAttendees.replace(/\D/g, ''));
    if (isNaN(count)) return 'small';
    if (count > 1000) return 'large';
    if (count > 100) return 'medium';
    return 'small';
  };

  // Mobile detection and progressive loading
  useEffect(() => {
    const mobile = isMobileDevice();
    const network = getNetworkInfo();
    
    setIsMobile(mobile);
    setNetworkInfo(network);
    
    console.log('📱 Mobile detection:', {
      isMobile: mobile,
      network: network,
      userAgent: navigator.userAgent.substring(0, 100) + '...'
    });
    
    // Progressive loading for mobile
    if (mobile) {
      // Force fallback on slow connections
      if (network.effectiveType === 'slow-2g' || network.effectiveType === '2g') {
        console.log('📱 Slow connection detected - using fallback map');
        setUseFallback(true);
        setMapReady(true);
        return;
      }
      
      // Mobile detected - enable map loading
      console.log('📱 Mobile detected - enabling map loading');
      setMapReady(true);
      
      // Add a safety timeout to force fallback if map doesn't load
      const safetyTimeout = setTimeout(() => {
        console.log('📱 Mobile safety timeout - forcing fallback map');
        setForceFallback(true);
        setUseFallback(true);
      }, 8000); // 8 second timeout
      
      return () => clearTimeout(safetyTimeout);
    } else {
      console.log('📱 Desktop detected - enabling map immediately');
      setMapReady(true);
    }
  }, []);

  // Initialize Mapbox map
  useEffect(() => {
    console.log('🗺️ Map initialization effect triggered:', {
      hasContainer: !!mapContainer.current,
      hasInstance: !!mapInstance.current,
      mapReady: mapReady,
      isMobile: isMobile
    });
    
    if (!mapContainer.current || mapInstance.current || !mapReady) {
      console.log('🗺️ Map initialization skipped:', {
        reason: !mapContainer.current ? 'No container' : 
                mapInstance.current ? 'Instance exists' : 
                !mapReady ? 'Not ready' : 'Unknown'
      });
      return;
    }

    const initializeMap = () => {
      try {
        console.log('🗺️ Initializing Mapbox GL JS');
        
        // Set Mapbox access token
        mapboxgl.accessToken = MAPBOX_CONFIG.token;
        
        // Debug container dimensions
        const containerRect = mapContainer.current.getBoundingClientRect();
        console.log('🗺️ Map container dimensions:', {
          width: containerRect.width,
          height: containerRect.height,
          top: containerRect.top,
          left: containerRect.left
        });

        // Create map instance
        mapInstance.current = new mapboxgl.Map({
          container: mapContainer.current,
          style: MAPBOX_CONFIG.style,
          center: MAPBOX_CONFIG.center,
          zoom: MAPBOX_CONFIG.zoom
        });

        // Fallback timeout - shorter timeout for mobile
        const timeoutDuration = isMobile ? 5000 : 10000;
        const fallbackTimeout = setTimeout(() => {
          if (!mapLoaded) {
            console.warn('🗺️ Mapbox taking too long to load, using fallback');
            setUseFallback(true);
            setMapError(isMobile ? 'Map loading slowly on mobile, using fallback view' : 'Map loading slowly, using fallback view');
          }
        }, timeoutDuration);

        // Map loaded successfully
        mapInstance.current.on('load', () => {
          console.log('🗺️ Mapbox map loaded successfully');
          clearTimeout(fallbackTimeout);
          setMapLoaded(true);
          setMapError(null);
          setUseFallback(false);
        });

        // Handle map errors with mobile-specific handling
        mapInstance.current.on('error', (e) => {
          console.error('🗺️ Mapbox error:', e);
          clearTimeout(fallbackTimeout);
          
          // Mobile-specific error handling
          if (isMobile) {
            console.log('📱 Mobile map error - switching to fallback');
            setMapError('Map unavailable on mobile - using fallback view');
          } else {
            setMapError('Failed to load map');
          }
          
          setMapLoaded(false);
          setUseFallback(true);
        });

      } catch (error) {
        console.error('🗺️ Mapbox initialization error:', error);
        setMapError('Failed to initialize map');
        setMapLoaded(false);
        setUseFallback(true);
      }
    };

    initializeMap();

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, [mapReady, isMobile]);

  // Update pins when events change
  useEffect(() => {
    if (!mapInstance.current || !mapLoaded || !events.length) return;

    console.log('📍 Updating map pins:', events.length, 'events');

    // Clear existing markers
    if (mapInstance.current.getLayer('event-markers')) {
      mapInstance.current.removeLayer('event-markers');
    }
    if (mapInstance.current.getSource('event-markers')) {
      mapInstance.current.removeSource('event-markers');
    }

    // Create new pins
    const newPins = createMapPins(events);
    setPins(newPins);

    // Prepare GeoJSON data for Mapbox
    const geojsonData = {
      type: 'FeatureCollection',
      features: newPins.filter(pin => pin.visible).map(pin => ({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: pin.position
        },
        properties: {
          id: pin.id,
          title: pin.popup.title,
          description: pin.popup.description,
          venue: pin.popup.venue,
          time: pin.popup.time,
          day: pin.popup.day,
          price: pin.popup.price,
          attendees: pin.popup.attendees,
          category: pin.category,
          subcategory: pin.subcategory,
          color: pin.color,
          size: pin.size,
          event: pin.event
        }
      }))
    };

    // Add source and layer to map
    mapInstance.current.addSource('event-markers', {
      type: 'geojson',
      data: geojsonData
    });

    mapInstance.current.addLayer({
      id: 'event-markers',
      type: 'circle',
      source: 'event-markers',
      paint: {
        'circle-radius': {
          'base': 1.75,
          'stops': [
            [12, 8],
            [22, 24]
          ]
        },
        'circle-color': ['get', 'color'],
        'circle-stroke-width': 2,
        'circle-stroke-color': '#ffffff'
      }
    });

    // Add click handler for markers
    mapInstance.current.on('click', 'event-markers', (e) => {
      const feature = e.features[0];
      const eventData = feature.properties;
      console.log('📍 Marker clicked:', eventData);
      
      if (onEventSelect) {
        onEventSelect(eventData.event);
      }
    });

    // Change cursor on hover
    mapInstance.current.on('mouseenter', 'event-markers', () => {
      mapInstance.current.getCanvas().style.cursor = 'pointer';
    });

    mapInstance.current.on('mouseleave', 'event-markers', () => {
      mapInstance.current.getCanvas().style.cursor = '';
    });

    console.log('📍 Map pins updated:', newPins.length, 'visible pins');
  }, [mapLoaded, events, createMapPins, onEventSelect]);

  // Filter pins based on selections
  useEffect(() => {
    if (!pins.length) return;

    const filteredPins = pins.map(pin => {
      let visible = true;

      // Filter by selected category
      if (selectedCategory && pin.category !== selectedCategory.label) {
        visible = false;
      }

      // Filter by selected subcategory
      if (selectedSubcategory && pin.subcategory !== selectedSubcategory.label) {
        visible = false;
      }

      return { ...pin, visible };
    });

    // Update marker visibility
    const markers = document.querySelectorAll('.mapboxgl-marker');
    markers.forEach((marker, index) => {
      const pin = filteredPins[index];
      if (pin) {
        marker.style.display = pin.visible ? 'block' : 'none';
      }
    });

    console.log('🔍 Pins filtered:', filteredPins.filter(p => p.visible).length, 'visible');
  }, [pins, selectedCategory, selectedSubcategory]);

  // Fallback map component
  const FallbackMap = () => {
    console.log('🗺️ Fallback map rendering with events:', events.length);
    console.log('🗺️ Fallback map events sample:', events.slice(0, 3).map(e => ({ name: e.name, category: e.categoryPrimary, subcategory: e.categorySecondary })));
    
    return (
      <div 
        className="fallback-map"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: '100%',
          height: '100%',
          background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 200,
          opacity: 1,
          minHeight: '100vh'
        }}
      >
        <div 
          className="fallback-map-content"
          style={{
            textAlign: 'center',
            color: 'white',
            padding: '20px',
            maxWidth: '600px',
            background: 'rgba(0, 0, 0, 0.7)',
            borderRadius: '12px',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}
        >
          <h3 style={{ fontSize: '24px', marginBottom: '10px', color: '#ffffff' }}>
            🗺️ Interactive Map
          </h3>
          <p style={{ marginBottom: '15px', opacity: 0.8 }}>
            Map functionality is temporarily unavailable
          </p>
          <p style={{ marginBottom: '15px', opacity: 0.8 }}>
            Event discovery is still fully functional
          </p>
          <p style={{ marginBottom: '15px', opacity: 0.8 }}>
            Showing {events.length} events
          </p>
          <div 
            className="fallback-events"
            style={{
              marginTop: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              maxHeight: '400px',
              overflowY: 'auto'
            }}
          >
            {events.slice(0, 6).map(event => (
              <div 
                key={event.id} 
                className="fallback-event" 
                onClick={() => onEventSelect?.(event)}
                style={{
                  background: 'rgba(255, 255, 255, 0.15)',
                  padding: '16px',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  backdropFilter: 'blur(5px)'
                }}
              >
                <h4 style={{ fontSize: '18px', marginBottom: '8px', color: '#ffffff', fontWeight: 600 }}>
                  {event.name}
                </h4>
                <p style={{ fontSize: '14px', margin: '4px 0', opacity: 0.9, color: '#e0e0e0' }}>
                  📍 {event.venue}
                </p>
                <p style={{ fontSize: '14px', margin: '4px 0', opacity: 0.9, color: '#e0e0e0' }}>
                  ⏰ {event.time} on {event.day}
                </p>
                <p style={{ fontSize: '14px', margin: '4px 0', opacity: 0.9, color: '#e0e0e0' }}>
                  🏷️ {event.categoryPrimary} - {event.categorySecondary}
                </p>
                <p style={{ fontSize: '14px', margin: '4px 0', opacity: 0.9, color: '#e0e0e0' }}>
                  💰 {event.price}
                </p>
              </div>
            ))}
            {events.length > 6 && (
              <div 
                className="fallback-event"
                style={{
                  background: 'rgba(255, 255, 255, 0.15)',
                  padding: '16px',
                  borderRadius: '10px',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  backdropFilter: 'blur(5px)'
                }}
              >
                <p style={{ fontSize: '14px', margin: '4px 0', opacity: 0.9, color: '#e0e0e0' }}>
                  ... and {events.length - 6} more events
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <MapErrorBoundary>
      <div 
        className="event-discovery-map"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 1
        }}
      >
      {useFallback || forceFallback ? (
        <FallbackMap />
      ) : (
        <>
          <div 
            ref={mapContainer} 
            className="map-container"
            style={{
              width: '100%',
              height: '100%',
              minHeight: '400px',
              position: 'relative'
            }}
          />
          {mapError ? (
            <div className="map-error">
              <div className="error-icon">⚠️</div>
              <p>{mapError}</p>
              <p className="error-detail">Map functionality unavailable</p>
            </div>
          ) : !mapLoaded ? (
            <div className="map-loading">
              <div className="loading-spinner" />
              <p>
                {isMobile ? '📱 Loading map for mobile...' : 'Loading map...'}
                {mobileLoadingDelay > 0 && (
                  <span style={{ fontSize: '12px', opacity: 0.7, display: 'block', marginTop: '8px' }}>
                    Optimizing for mobile experience...
                  </span>
                )}
              </p>
            </div>
          ) : null}
        </>
      )}
      </div>
    </MapErrorBoundary>
  );
};

export default EventDiscoveryMap;