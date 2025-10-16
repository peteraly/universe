import React, { useRef, useEffect, useState, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

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

// Leaflet/OpenStreetMap configuration
const LEAFLET_CONFIG = {
  // Default center (San Francisco)
  center: [37.7749, -122.4194],
  zoom: 13,
  // OpenStreetMap tile layer
  tileLayer: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  attribution: '© OpenStreetMap contributors'
};

// Fix Leaflet default markers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

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

  // Initialize Leaflet map
  useEffect(() => {
    if (!mapContainer.current || mapInstance.current) return;

    const initializeMap = () => {
      try {
        console.log('🗺️ Initializing OpenStreetMap with Leaflet');
        
        // Create map instance
        mapInstance.current = L.map(mapContainer.current).setView(LEAFLET_CONFIG.center, LEAFLET_CONFIG.zoom);

        // Add OpenStreetMap tile layer
        L.tileLayer(LEAFLET_CONFIG.tileLayer, {
          attribution: LEAFLET_CONFIG.attribution,
          maxZoom: 19
        }).addTo(mapInstance.current);

        // Map loaded successfully
        mapInstance.current.whenReady(() => {
          console.log('🗺️ OpenStreetMap loaded successfully');
          setMapLoaded(true);
          setMapError(null);
          setUseFallback(false);
        });

        // Handle map errors
        mapInstance.current.on('error', (e) => {
          console.error('🗺️ Map error:', e);
          setMapError('Failed to load map');
          setMapLoaded(false);
          setUseFallback(true);
        });

      } catch (error) {
        console.error('🗺️ Map initialization error:', error);
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
  }, []);

  // Update pins when events change
  useEffect(() => {
    if (!mapInstance.current || !mapLoaded || !events.length) return;

    console.log('📍 Updating map pins:', events.length, 'events');

    // Clear existing markers
    mapInstance.current.eachLayer((layer) => {
      if (layer instanceof L.Marker) {
        mapInstance.current.removeLayer(layer);
      }
    });

    // Create new pins
    const newPins = createMapPins(events);
    setPins(newPins);

    // Add markers to map
    newPins.forEach(pin => {
      if (pin.visible) {
        // Create custom icon based on pin size
        const iconSize = pin.size === 'large' ? [30, 30] : pin.size === 'medium' ? [25, 25] : [20, 20];
        const customIcon = L.divIcon({
          className: 'custom-marker',
          html: `<div style="
            width: ${iconSize[0]}px; 
            height: ${iconSize[1]}px; 
            background-color: ${pin.color}; 
            border-radius: 50%; 
            border: 2px solid white; 
            box-shadow: 0 2px 4px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: bold;
            font-size: 12px;
          ">📍</div>`,
          iconSize: iconSize,
          iconAnchor: [iconSize[0]/2, iconSize[1]/2]
        });

        const marker = L.marker(pin.position, { icon: customIcon })
          .bindPopup(`
            <div class="event-popup">
              <h3>${pin.popup.title}</h3>
              <p>${pin.popup.description}</p>
              <p><strong>Venue:</strong> ${pin.popup.venue}</p>
              <p><strong>Time:</strong> ${pin.popup.time} on ${pin.popup.day}</p>
              <p><strong>Price:</strong> ${pin.popup.price}</p>
              <p><strong>Attendees:</strong> ${pin.popup.attendees}</p>
            </div>
          `)
          .addTo(mapInstance.current);

        // Add click handler
        marker.on('click', () => {
          console.log('🎯 Event selected:', pin.event);
          onEventSelect?.(pin.event);
        });
      }
    });

    console.log('📍 Map pins updated:', newPins.length, 'visible pins');
  }, [mapLoaded, events, createMapPins, onEventSelect]);

  // Filter pins based on selections
  useEffect(() => {
    if (!pins.length) return;

    const filteredPins = pins.map(pin => {
      let visible = true;

      // Filter by selected category
      if (selectedCategory && pin.category !== selectedCategory.name) {
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
      {useFallback ? (
        <FallbackMap />
      ) : (
        <>
          <div ref={mapContainer} className="map-container" />
          {mapError ? (
            <div className="map-error">
              <div className="error-icon">⚠️</div>
              <p>{mapError}</p>
              <p className="error-detail">Map functionality unavailable</p>
            </div>
          ) : !mapLoaded ? (
            <div className="map-loading">
              <div className="loading-spinner" />
              <p>Loading map...</p>
            </div>
          ) : null}
        </>
      )}
      </div>
    </MapErrorBoundary>
  );
};

export default EventDiscoveryMap;