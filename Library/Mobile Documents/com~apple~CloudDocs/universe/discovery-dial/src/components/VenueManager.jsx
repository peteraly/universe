import React, { useState, useEffect } from 'react';
import VenueParser from '../parsing/VenueParser.js';
import AdminInteractionTracker from '../lib/monitoring/AdminInteractionTracker.js';
import './VenueManager.css';

const VenueManager = () => {
  const [venues, setVenues] = useState([]);
  const [newVenueUrl, setNewVenueUrl] = useState('');
  const [isParsing, setIsParsing] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  
  // Initialize monitoring tracker
  const [tracker] = useState(() => new AdminInteractionTracker());

  // Load venues from localStorage on mount
  useEffect(() => {
    const savedVenues = localStorage.getItem('parsedVenues');
    if (savedVenues) {
      setVenues(JSON.parse(savedVenues));
    }
  }, []);

  // Save venues to localStorage when venues change
  useEffect(() => {
    localStorage.setItem('parsedVenues', JSON.stringify(venues));
  }, [venues]);

  const handleAddVenue = async () => {
    if (!newVenueUrl) return;
    
    setIsParsing(true);
    setError(null);
    setResults(null);
    
    // Track venue parsing start
    tracker.trackInteraction('venue_parse_start', 'VenueManager', {
      url: newVenueUrl,
      timestamp: Date.now()
    });
    
    try {
      const parser = new VenueParser();
      const startTime = Date.now();
      const result = await parser.parseVenue(newVenueUrl);
      const duration = Date.now() - startTime;
      
      if (result.error) {
        setError(result.error);
        
        // Track parsing error
        tracker.trackInteraction('venue_parse_error', 'VenueManager', {
          url: newVenueUrl,
          error: result.error,
          duration,
          timestamp: Date.now()
        });
        return;
      }
      
      const venue = {
        id: Date.now(),
        url: newVenueUrl,
        name: new URL(newVenueUrl).hostname,
        events: result.events,
        confidence: result.confidence,
        method: result.method,
        lastParsed: new Date().toISOString(),
        status: result.events.length > 0 ? 'success' : 'no_events'
      };
      
      setVenues(prev => [...prev, venue]);
      setResults(result);
      setNewVenueUrl('');
      
      // Track successful parsing
      tracker.trackInteraction('venue_parse_success', 'VenueManager', {
        url: newVenueUrl,
        eventsFound: result.events.length,
        confidence: result.confidence,
        method: result.method,
        duration,
        timestamp: Date.now()
      });
    } catch (error) {
      setError(error.message);
      
      // Track parsing exception
      tracker.trackInteraction('venue_parse_exception', 'VenueManager', {
        url: newVenueUrl,
        error: error.message,
        timestamp: Date.now()
      });
    } finally {
      setIsParsing(false);
    }
  };

  const handleRemoveVenue = (venueId) => {
    const venue = venues.find(v => v.id === venueId);
    setVenues(prev => prev.filter(venue => venue.id !== venueId));
    
    // Track venue removal
    tracker.trackInteraction('venue_remove', 'VenueManager', {
      venueId,
      venueUrl: venue?.url,
      timestamp: Date.now()
    });
  };

  const handleReparseVenue = async (venue) => {
    setIsParsing(true);
    setError(null);
    
    try {
      const parser = new VenueParser();
      const result = await parser.parseVenue(venue.url);
      
      if (result.error) {
        setError(result.error);
        return;
      }
      
      setVenues(prev => prev.map(v => 
        v.id === venue.id 
          ? { ...v, events: result.events, confidence: result.confidence, method: result.method, lastParsed: new Date().toISOString() }
          : v
      ));
      
      setResults(result);
    } catch (error) {
      setError(error.message);
    } finally {
      setIsParsing(false);
    }
  };

  return (
    <div className="venue-manager">
      <div className="venue-header">
        <h2>Venue URL Parser</h2>
        <p>Add venue URLs to automatically parse and extract events</p>
      </div>
      
      <div className="add-venue-section">
        <div className="add-venue">
          <input
            type="url"
            value={newVenueUrl}
            onChange={(e) => setNewVenueUrl(e.target.value)}
            placeholder="Enter venue URL (e.g., https://venue.com)"
            className="venue-url-input"
            disabled={isParsing}
          />
          <button 
            onClick={handleAddVenue}
            disabled={isParsing || !newVenueUrl}
            className="parse-button"
          >
            {isParsing ? 'Parsing...' : 'Parse Venue'}
          </button>
        </div>
        
        {error && (
          <div className="error-message">
            <strong>Error:</strong> {error}
          </div>
        )}
      </div>

      {results && (
        <div className="parsing-results">
          <h3>Latest Parsing Results</h3>
          <div className="results-grid">
            <div className="result-item">
              <strong>Method:</strong> {results.method}
            </div>
            <div className="result-item">
              <strong>Confidence:</strong> {(results.confidence * 100).toFixed(1)}%
            </div>
            <div className="result-item">
              <strong>Events Found:</strong> {results.events.length}
            </div>
          </div>
          
          {results.events.length > 0 && (
            <div className="events-preview">
              <h4>Sample Events:</h4>
              {results.events.slice(0, 3).map((event, index) => (
                <div key={index} className="event-preview-item">
                  <strong>{event.title}</strong>
                  {event.date && <span> - {event.date}</span>}
                  {event.location && <span> at {event.location}</span>}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="venues-list">
        <div className="venues-header">
          <h3>Parsed Venues ({venues.length})</h3>
          {venues.length > 0 && (
            <button 
              onClick={() => setVenues([])}
              className="clear-all-button"
            >
              Clear All
            </button>
          )}
        </div>
        
        {venues.length === 0 ? (
          <div className="no-venues">
            <p>No venues parsed yet. Add a venue URL above to get started.</p>
          </div>
        ) : (
          <div className="venues-grid">
            {venues.map(venue => (
              <div key={venue.id} className="venue-card">
                <div className="venue-card-header">
                  <h4>{venue.name}</h4>
                  <button 
                    onClick={() => handleRemoveVenue(venue.id)}
                    className="remove-venue-button"
                  >
                    ×
                  </button>
                </div>
                
                <div className="venue-details">
                  <p><strong>URL:</strong> {venue.url}</p>
                  <p><strong>Method:</strong> {venue.method}</p>
                  <p><strong>Confidence:</strong> {(venue.confidence * 100).toFixed(1)}%</p>
                  <p><strong>Events:</strong> {venue.events.length}</p>
                  <p><strong>Last Parsed:</strong> {new Date(venue.lastParsed).toLocaleString()}</p>
                  <p><strong>Status:</strong> 
                    <span className={`status-${venue.status}`}>
                      {venue.status === 'success' ? 'Success' : 'No Events'}
                    </span>
                  </p>
                </div>
                
                <div className="venue-actions">
                  <button 
                    onClick={() => handleReparseVenue(venue)}
                    disabled={isParsing}
                    className="reparse-button"
                  >
                    Reparse
                  </button>
                </div>
                
                {venue.events.length > 0 && (
                  <div className="events-preview">
                    <h5>Recent Events:</h5>
                    {venue.events.slice(0, 3).map((event, index) => (
                      <div key={index} className="event-item">
                        <strong>{event.title}</strong>
                        {event.date && <span> - {event.date}</span>}
                        {event.location && <span> at {event.location}</span>}
                      </div>
                    ))}
                    {venue.events.length > 3 && (
                      <p className="more-events">+{venue.events.length - 3} more events</p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default VenueManager;
