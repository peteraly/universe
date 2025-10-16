import React, { useRef, useEffect, useState, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';

// Mapbox configuration with fallback
const MAPBOX_CONFIG = {
  // Use environment variable or fallback to public token
  token: import.meta.env.VITE_MAPBOX_TOKEN || 'pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw',
  style: 'mapbox://styles/mapbox/streets-v11',
  fallbackStyle: 'mapbox://styles/mapbox/light-v10'
};

// Set Mapbox token
mapboxgl.accessToken = MAPBOX_CONFIG.token;

const EventDiscoveryMap = ({ 
  events = [], 
  selectedCategory, 
  selectedSubcategory, 
  onEventSelect 
}) => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState(null);
  const [pins, setPins] = useState([]);
  const [useFallback, setUseFallback] = useState(false);

  // Create map pins from events
  const createMapPins = useCallback((events) => {
    return events.map(event => ({
      id: event.id,
      position: [event.longitude, event.latitude],
      popup: {
        title: event.name,
        description: event.description,
        venue: event.venue,
        time: event.time,
        day: event.day,
        price: event.price,
        attendees: event.attendees
      },
      category: event.categoryPrimary,
      subcategory: event.categorySecondary,
      time: event.time,
      day: event.day,
      color: getCategoryColor(event.categoryPrimary),
      size: getEventSize(event.attendees),
      visible: true,
      event: event
    }));
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
    const count = parseInt(attendees.replace(/\D/g, ''));
    if (count > 1000) return 'large';
    if (count > 100) return 'medium';
    return 'small';
  };

  // Initialize map with enhanced error handling
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    const initializeMap = async () => {
      try {
        // Force fallback mode due to Mapbox token issues
        console.log('🗺️ Using fallback map due to token issues');
        setMapError('Map temporarily unavailable');
        setMapLoaded(false);
        setUseFallback(true);
        return;

        // Original map initialization (commented out due to token issues)
        /*
        const response = await fetch(`https://api.mapbox.com/styles/v1/mapbox/streets-v11?access_token=${MAPBOX_CONFIG.token}`);
        
        if (!response.ok) {
          throw new Error(`Mapbox API error: ${response.status}`);
        }

        map.current = new mapboxgl.Map({
          container: mapContainer.current,
          style: MAPBOX_CONFIG.style,
          center: [-122.4194, 37.7749], // San Francisco
          zoom: 12,
          attributionControl: false
        });

        map.current.on('load', () => {
          setMapLoaded(true);
          setMapError(null);
          setUseFallback(false);
          console.log('🗺️ Map loaded successfully');
        });

        map.current.on('error', (e) => {
          console.error('🗺️ Map error:', e);
          setMapError('Failed to load map');
          setMapLoaded(false);
          setUseFallback(true);
        });
        */

      } catch (error) {
        console.error('🗺️ Map initialization error:', error);
        setMapError('Map temporarily unavailable');
        setMapLoaded(false);
        setUseFallback(true);
      }
    };

    initializeMap();

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  // Update pins when events change
  useEffect(() => {
    if (!map.current || !mapLoaded || !events.length) return;

    console.log('📍 Updating map pins:', events.length, 'events');

    // Clear existing markers
    const existingMarkers = document.querySelectorAll('.mapboxgl-marker');
    existingMarkers.forEach(marker => marker.remove());

    // Create new pins
    const newPins = createMapPins(events);
    setPins(newPins);

    // Add markers to map
    newPins.forEach(pin => {
      if (pin.visible) {
        const marker = new mapboxgl.Marker({ 
          color: pin.color,
          scale: pin.size === 'large' ? 1.2 : pin.size === 'medium' ? 1.0 : 0.8
        })
          .setLngLat(pin.position)
          .setPopup(new mapboxgl.Popup().setHTML(`
            <div class="event-popup">
              <h3>${pin.popup.title}</h3>
              <p>${pin.popup.description}</p>
              <p><strong>Venue:</strong> ${pin.popup.venue}</p>
              <p><strong>Time:</strong> ${pin.popup.time} on ${pin.popup.day}</p>
              <p><strong>Price:</strong> ${pin.popup.price}</p>
              <p><strong>Attendees:</strong> ${pin.popup.attendees}</p>
            </div>
          `))
          .addTo(map.current);

        // Add click handler
        marker.getElement().addEventListener('click', () => {
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
          zIndex: 10,
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
  );
};

export default EventDiscoveryMap;