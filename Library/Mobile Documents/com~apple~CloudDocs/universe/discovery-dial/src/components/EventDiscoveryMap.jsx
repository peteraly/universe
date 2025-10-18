import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

// Debounce utility to prevent excessive updates
const debounce = (func, wait) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

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
  token: 'pk.eyJ1IjoicGV0ZXJhbHkiLCJhIjoiY21ndTJsY3VlMDh5ZjJqcTJqeGVzdGtlOCJ9.MPugLXlCQmpIg3jz76zA0g',
  style: 'mapbox://styles/mapbox/light-v11',
  center: [-122.4194, 37.7749], // [lng, lat] for Mapbox
  zoom: 13
};

const EventDiscoveryMap = ({ 
  events = [], 
  selectedCategory, 
  selectedSubcategory, 
  onEventSelect,
  highlightedEventId = null
}) => {
  const mapContainer = useRef(null);
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState(null);
  const [pins, setPins] = useState([]);
  // 🔧 TEMP FIX: Default to fallback since Mapbox token is expired
  // Change back to false once token is renewed
  const [useFallback, setUseFallback] = useState(true);
  
  // Mobile-specific state
  const [isMobile, setIsMobile] = useState(false);
  const [networkInfo, setNetworkInfo] = useState({ effectiveType: 'unknown' });
  const [mapReady, setMapReady] = useState(false);
  const [mobileLoadingDelay, setMobileLoadingDelay] = useState(0);
  const [forceFallback, setForceFallback] = useState(false);
  
  // 🔧 FIX: Memoize events to prevent unnecessary re-renders
  // Only update when event count or first event ID changes
  const memoizedEvents = useMemo(() => events, [events.length, events[0]?.id]);
  const memoizedHighlightedId = useMemo(() => highlightedEventId, [highlightedEventId]);
  
  // 🔧 NEW: Store previous events reference to prevent unnecessary pin updates
  const prevEventsRef = useRef(null);

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
          position: [lng, lat], // [longitude, latitude] for Mapbox
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

  // 🔧 OPTIMIZED: Detect ACTUAL mobile devices (not just small browser windows)
  useEffect(() => {
    const userAgent = navigator.userAgent.toLowerCase();
    // Check for actual mobile device keywords
    const actualMobile = /iphone|ipad|ipod|android|mobile|phone|tablet/.test(userAgent);
    const touchDevice = 'ontouchstart' in window;
    const network = getNetworkInfo();
    
    // Only consider it mobile if it's ACTUALLY a mobile device
    const isMobileDevice = actualMobile && touchDevice;
    
    setIsMobile(isMobileDevice);
    setNetworkInfo(network);
    
    console.log('📱 Mobile detection:', {
      isMobile: isMobileDevice,
      actualMobile,
      touchDevice,
      network: network,
      userAgent: userAgent.substring(0, 100) + '...'
    });
    
    // Progressive loading for mobile
    if (isMobileDevice) {
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
      
      // 🔧 FIX: NO AUTOMATIC TIMEOUT HERE - moved to map initialization
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
          zoom: MAPBOX_CONFIG.zoom,
          // 🔧 OPTIMIZED: Improve map stability
          preserveDrawingBuffer: true,
          refreshExpiredTiles: false,
          maxTileCacheSize: isMobile ? 50 : 200
        });

        // 🔧 FIX: Only set timeout on ACTUAL mobile devices, with longer delay in dev
        let fallbackTimeout = null;
        if (isMobile) {
          const timeoutDuration = process.env.NODE_ENV === 'development' ? 8000 : 5000;
          console.log(`📱 Setting mobile safety timeout: ${timeoutDuration}ms`);
          
          fallbackTimeout = setTimeout(() => {
            // 🔧 FIX: Only force fallback if map ACTUALLY didn't load
            if (!mapLoaded && mapInstance.current && !mapInstance.current.loaded()) {
              console.log('📱 Mobile safety timeout - map failed to load, using fallback');
              setUseFallback(true);
              setForceFallback(true);
              setMapError('Map loading slowly on mobile, using fallback view');
            } else {
              console.log('📱 Mobile safety timeout - map loaded successfully, ignoring');
            }
          }, timeoutDuration);
        } else {
          // 🔧 FIX: Desktop doesn't need aggressive timeout
          fallbackTimeout = null;
        }

        // Map loaded successfully
        mapInstance.current.on('load', () => {
          console.log('🗺️ Mapbox map loaded successfully');
          if (fallbackTimeout) clearTimeout(fallbackTimeout);
          setMapLoaded(true);
          setMapError(null);
          setUseFallback(false);
          setForceFallback(false); // 🔧 FIX: Reset force fallback flag
        });

        // Track tile errors to detect authentication/token issues
        let tileErrorCount = 0;
        const MAX_TILE_ERRORS = 3; // Switch to fallback after 3 tile errors

        // Handle map errors with mobile-specific handling
        // 🔧 FIX: Detect 403 errors and switch to fallback
        mapInstance.current.on('error', (e) => {
          // Check for tile loading errors
          const isTileError = e.error?.message?.includes('tile') || e.tile;
          const is403Error = e.error?.status === 403 || e.error?.message?.includes('403') || e.error?.message?.includes('Forbidden');
          
          if (is403Error) {
            tileErrorCount++;
            console.warn(`🗺️ Mapbox authentication error (${tileErrorCount}/${MAX_TILE_ERRORS}):`, e.error?.message || '403 Forbidden');
            
            // After multiple 403s, switch to fallback
            if (tileErrorCount >= MAX_TILE_ERRORS) {
              console.log('🗺️ Multiple 403 errors detected - Mapbox token expired/invalid');
              console.log('🗺️ Switching to fallback map...');
              clearTimeout(fallbackTimeout);
              setMapError('Map token expired - using fallback view');
              setMapLoaded(false);
              setUseFallback(true);
            }
            return;
          }
          
          if (!isTileError) {
            console.error('🗺️ Mapbox error:', e.error?.message || 'Unknown error');
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
          }
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

  // 🔧 FIX: Debounced pin update function to prevent map reload spam
  const updateMapPinsDebounced = useMemo(
    () => debounce((eventsToShow) => {
      if (!mapInstance.current || !mapLoaded || !eventsToShow.length) return;

      console.log('📍 Updating map pins:', eventsToShow.length, 'events');

      // Clear existing markers
      if (mapInstance.current.getLayer('event-markers')) {
        mapInstance.current.removeLayer('event-markers');
      }
      if (mapInstance.current.getSource('event-markers')) {
        mapInstance.current.removeSource('event-markers');
      }

      // Create new pins
      const newPins = createMapPins(eventsToShow);
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
      if (e.features && e.features.length > 0) {
        const feature = e.features[0];
        const eventData = feature.properties;
        console.log('📍 Marker clicked:', eventData);
        
        if (onEventSelect && eventData.event) {
          onEventSelect(eventData.event);
        }
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
    }, 250), // 250ms debounce
    [mapLoaded, createMapPins]
  );
  
  // 🔧 FIX: Call debounced update when memoized events change
  // Skip if events haven't actually changed (reference equality check)
  useEffect(() => {
    // Skip if events reference hasn't changed
    if (prevEventsRef.current === memoizedEvents) {
      return;
    }
    
    prevEventsRef.current = memoizedEvents;
    updateMapPinsDebounced(memoizedEvents);
  }, [memoizedEvents, updateMapPinsDebounced]);

  // 🔧 FIX: Filter pins based on selections and highlight active pin with guaranteed visibility
  // Use memoized highlightedId to prevent unnecessary updates
  useEffect(() => {
    if (!mapInstance.current || !mapLoaded || !pins.length) return;

    console.log('🗺️ Updating map pins and highlighting:', {
      totalPins: pins.length,
      highlightedEventId: memoizedHighlightedId,
      selectedCategory: selectedCategory?.label,
      selectedSubcategory: selectedSubcategory?.label
    });

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

    // Find the highlighted event in filtered pins (use memoized value)
    const highlightedPin = memoizedHighlightedId 
      ? filteredPins.find(pin => pin.id === memoizedHighlightedId)
      : null;

    console.log('🎯 Highlighted pin:', highlightedPin ? {
      id: highlightedPin.id,
      title: highlightedPin.popup.title,
      position: highlightedPin.position
    } : 'None');

    // Update GeoJSON data with visibility and highlight information
    const geojsonData = {
      type: 'FeatureCollection',
      features: filteredPins
        .filter(pin => pin.visible)
        .map(pin => ({
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
            highlighted: pin.id === memoizedHighlightedId,
            event: pin.event
          }
        }))
    };

    // Update map source with new data
    const source = mapInstance.current.getSource('event-markers');
    if (source) {
      source.setData(geojsonData);
      console.log('✅ Map pins updated:', geojsonData.features.length, 'visible');

      // Update marker styling for highlighted pin
      if (mapInstance.current.getLayer('event-markers')) {
        mapInstance.current.setPaintProperty('event-markers', 'circle-radius', [
          'case',
          ['get', 'highlighted'],
          16, // Larger radius for highlighted pin
          8  // Normal radius
        ]);

        mapInstance.current.setPaintProperty('event-markers', 'circle-stroke-width', [
          'case',
          ['get', 'highlighted'],
          4, // Thicker stroke for highlighted pin
          2
        ]);

        mapInstance.current.setPaintProperty('event-markers', 'circle-stroke-color', [
          'case',
          ['get', 'highlighted'],
          '#FFD700', // Gold stroke for highlighted pin
          '#ffffff'
        ]);
      }

      // Auto-zoom to highlighted pin with smooth animation
      if (highlightedPin && highlightedPin.position) {
        const [lng, lat] = highlightedPin.position;
        
        // Validate coordinates before flyTo
        if (lng >= -180 && lng <= 180 && lat >= -90 && lat <= 90) {
          console.log('🎯 Zooming to highlighted pin:', highlightedPin.popup.title, `[${lng}, ${lat}]`);
          
          mapInstance.current.flyTo({
            center: [lng, lat],
            zoom: 15,
            duration: 1500,
            essential: true,
            padding: { top: 100, bottom: 250, left: 50, right: 50 }
          });
        } else {
          console.error('❌ Invalid coordinates for flyTo:', { lng, lat, pin: highlightedPin });
        }
      }
    }

    console.log('🔍 Pins filtered:', filteredPins.filter(p => p.visible).length, 'visible');
    if (memoizedHighlightedId) {
      console.log('🎯 Highlighted event:', memoizedHighlightedId);
    }
  }, [mapLoaded, pins, selectedCategory, selectedSubcategory, memoizedHighlightedId]);

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
          right: 0,
          bottom: 0,
          width: '100%',
          height: '100%',
          minHeight: '100vh',
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
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              width: '100%',
              height: '100%',
              minHeight: '100vh'
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