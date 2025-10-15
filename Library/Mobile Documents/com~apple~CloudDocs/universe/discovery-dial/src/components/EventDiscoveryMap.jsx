import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import { getCategoryColor } from '../data/mockEvents';

const EventDiscoveryMap = ({ 
  events, 
  selectedCategory, 
  selectedSubcategory, 
  onEventSelect 
}) => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const markers = useRef([]);
  const [mapLoaded, setMapLoaded] = useState(false);

  // Set Mapbox access token
  mapboxgl.accessToken = 'pk.eyJ1IjoicGV0ZXJhbHkiLCJhIjoiY21lNXpuNDhwMTBqZTJwb2RicWw5YWcxaSJ9.IiIfhu1oA2ua_oUDcjlIbQ';

  useEffect(() => {
    if (map.current) return; // Initialize map only once

    try {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/dark-v11', // Dark theme to match app
        center: [-74.0060, 40.7128], // Default center (NYC)
        zoom: 12,
        attributionControl: false, // Hide attribution for cleaner look
        // Mobile optimizations
        touchZoomRotate: true,
        dragPan: true,
        scrollZoom: true,
        boxZoom: false,
        doubleClickZoom: true,
        keyboard: false, // Disable keyboard controls on mobile
        maxZoom: 18,
        minZoom: 10
      });

      // Add navigation controls
      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

      // Add fullscreen control
      map.current.addControl(new mapboxgl.FullscreenControl(), 'top-right');

      // Wait for map to load
      map.current.on('load', () => {
        setMapLoaded(true);
        console.log('🗺️ Mapbox map loaded successfully');
      });

      // Handle map errors
      map.current.on('error', (e) => {
        console.error('🗺️ Mapbox error:', e);
      });

    } catch (error) {
      console.error('🗺️ Failed to initialize Mapbox:', error);
    }

    // Cleanup function
    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  // Update markers when events change
  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    try {
      // Clear existing markers
      markers.current.forEach(marker => marker.remove());
      markers.current = [];

      // Add new markers with enhanced styling
      events.forEach(event => {
        const isSelected = selectedCategory && 
          event.categoryPrimary === selectedCategory.name;
        
        const marker = new mapboxgl.Marker({
          color: getCategoryColor(event.categoryPrimary),
          scale: isSelected ? 1.5 : (window.innerWidth <= 768 ? 1.0 : 1.2), // Larger for selected
          opacity: isSelected ? 1.0 : 0.7 // More opaque for selected
        })
        .setLngLat(event.coordinates)
        .setPopup(
          new mapboxgl.Popup({ 
            offset: 25,
            className: 'event-popup'
          })
          .setHTML(`
            <div class="event-popup-content">
              <h3 class="event-popup-title">${event.name}</h3>
              <p class="event-popup-category">${event.categoryPrimary} • ${event.time}</p>
              <p class="event-popup-venue">📍 ${event.venue}</p>
              <p class="event-popup-price">💰 ${event.price}</p>
              <p class="event-popup-attendees">👥 ${event.attendees} attending</p>
            </div>
          `)
        )
        .addTo(map.current);

        // Add click handler to marker
        marker.getElement().addEventListener('click', () => {
          if (onEventSelect) {
            onEventSelect(event);
          }
        });

        markers.current.push(marker);
      });

      // Fit map to show all markers if there are events
      if (events.length > 0) {
        const bounds = new mapboxgl.LngLatBounds();
        events.forEach(event => bounds.extend(event.coordinates));
        
        // Add more padding for dial overlay
        map.current.fitBounds(bounds, { 
          padding: 150, // More padding for dial overlay
          maxZoom: 13, // Don't zoom in too much
          duration: 1000
        });
      }

      console.log(`🗺️ Updated map with ${events.length} event markers`);

    } catch (error) {
      console.error('🗺️ Error updating map markers:', error);
    }
  }, [events, selectedCategory, selectedSubcategory, mapLoaded, onEventSelect]);

  return (
    <div className="map-background-container">
      <div ref={mapContainer} className="map-container" />
      {!mapLoaded && (
        <div className="map-loading">
          <div className="loading-spinner"></div>
          <p>Loading map...</p>
        </div>
      )}
    </div>
  );
};

export default EventDiscoveryMap;
