import React, { useState } from 'react'

const DiscoveryDial = () => {
  const [currentEvent, setCurrentEvent] = useState(null)
  const [events, setEvents] = useState([])

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <div style={{
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(10px)',
        borderRadius: '20px',
        padding: '40px',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        maxWidth: '600px',
        width: '100%',
        color: 'white',
        textAlign: 'center'
      }}>
        <h1 style={{ 
          fontSize: '3rem', 
          marginBottom: '20px',
          fontWeight: '700'
        }}>
          Discovery Dial
        </h1>
        
        <p style={{ 
          fontSize: '1.2rem', 
          marginBottom: '30px',
          opacity: 0.9
        }}>
          Discover events through intuitive gesture navigation
        </p>
        
        {events.length === 0 ? (
          <div style={{
            padding: '30px',
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '12px',
            marginBottom: '20px'
          }}>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '15px' }}>
              No events available
            </h3>
            <p style={{ opacity: 0.8, marginBottom: '20px' }}>
              Events will appear here once they're added to the system.
            </p>
            <button
              onClick={() => window.location.href = '/admin'}
              style={{
                padding: '12px 24px',
                background: 'rgba(255, 255, 255, 0.2)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                borderRadius: '8px',
                color: 'white',
                fontSize: '1rem',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = 'rgba(255, 255, 255, 0.3)'
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'rgba(255, 255, 255, 0.2)'
              }}
            >
              Admin Panel
            </button>
          </div>
        ) : (
          <div>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '20px' }}>
              Current Event
            </h3>
            {currentEvent && (
              <div style={{
                padding: '20px',
                background: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '12px',
                marginBottom: '20px'
              }}>
                <h4 style={{ fontSize: '1.2rem', marginBottom: '10px' }}>
                  {currentEvent.name}
                </h4>
                <p style={{ opacity: 0.8 }}>
                  {currentEvent.description}
                </p>
              </div>
            )}
          </div>
        )}
        
        <div style={{
          fontSize: '0.9rem',
          opacity: 0.7,
          marginTop: '20px'
        }}>
          V12.0 - Mission Control System
        </div>
      </div>
    </div>
  )
}

export default DiscoveryDial
