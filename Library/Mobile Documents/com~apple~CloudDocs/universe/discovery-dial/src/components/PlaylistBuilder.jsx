/**
 * PlaylistBuilder Component
 * Interface for building and editing playlists with drag-and-drop functionality
 */

import React, { useState, useEffect, useRef } from 'react';
import { usePlaylists } from '../hooks/usePlaylists';
import { useSocialFeatures } from '../hooks/useSocialFeatures';
import './PlaylistBuilder.css';

const PlaylistBuilder = ({ 
  isOpen, 
  onClose, 
  playlist = null, 
  availableEvents = [], 
  onPlaylistSave 
}) => {
  const [playlistData, setPlaylistData] = useState({
    name: '',
    description: '',
    privacy: 'private',
    isCollaborative: false,
    events: [],
    collaborators: [],
    viewers: []
  });

  const [draggedEvent, setDraggedEvent] = useState(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFriends, setSelectedFriends] = useState([]);

  const { 
    updatePlaylist, 
    addEventToPlaylist, 
    removeEventFromPlaylist,
    reorderPlaylistEvents,
    loading,
    error 
  } = usePlaylists();

  const { 
    friends, 
    sharePlaylist, 
    addCollaborator 
  } = useSocialFeatures();

  const playlistRef = useRef(null);

  // Initialize playlist data
  useEffect(() => {
    if (playlist) {
      setPlaylistData({
        name: playlist.name,
        description: playlist.description,
        privacy: playlist.privacy,
        isCollaborative: playlist.isCollaborative || false,
        events: playlist.events || [],
        collaborators: playlist.collaborators || [],
        viewers: playlist.viewers || []
      });
    } else {
      setPlaylistData({
        name: '',
        description: '',
        privacy: 'private',
        isCollaborative: false,
        events: [],
        collaborators: [],
        viewers: []
      });
    }
  }, [playlist]);

  const filteredEvents = availableEvents.filter(event => 
    event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    event.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleInputChange = (field, value) => {
    setPlaylistData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleDragStart = (event, eventData) => {
    setDraggedEvent(eventData);
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/html', event.target.outerHTML);
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (event) => {
    event.preventDefault();
    
    if (draggedEvent && !playlistData.events.includes(draggedEvent.id)) {
      const newEvents = [...playlistData.events, draggedEvent.id];
      setPlaylistData(prev => ({
        ...prev,
        events: newEvents
      }));
    }
    
    setDraggedEvent(null);
  };

  const handleRemoveEvent = (eventId) => {
    setPlaylistData(prev => ({
      ...prev,
      events: prev.events.filter(id => id !== eventId)
    }));
  };

  const handleReorderEvents = (fromIndex, toIndex) => {
    const newEvents = [...playlistData.events];
    const [removed] = newEvents.splice(fromIndex, 1);
    newEvents.splice(toIndex, 0, removed);
    
    setPlaylistData(prev => ({
      ...prev,
      events: newEvents
    }));
  };

  const handleSave = async () => {
    if (!playlistData.name.trim()) {
      alert('Please enter a playlist name');
      return;
    }

    try {
      if (playlist) {
        // Update existing playlist
        const success = await updatePlaylist(playlist.id, playlistData);
        if (success && onPlaylistSave) {
          onPlaylistSave(playlistData);
        }
      } else {
        // Create new playlist (this would be handled by parent component)
        if (onPlaylistSave) {
          onPlaylistSave(playlistData);
        }
      }
      onClose();
    } catch (err) {
      console.error('Error saving playlist:', err);
    }
  };

  const handleShare = async () => {
    if (selectedFriends.length === 0) {
      alert('Please select at least one friend to share with');
      return;
    }

    try {
      const success = await sharePlaylist(playlist.id, selectedFriends, playlistData.isCollaborative);
      if (success) {
        setShowShareModal(false);
        setSelectedFriends([]);
        alert('Playlist shared successfully!');
      }
    } catch (err) {
      console.error('Error sharing playlist:', err);
    }
  };

  const handleAddCollaborator = async (friendId) => {
    try {
      const success = await addCollaborator(playlist.id, friendId);
      if (success) {
        setPlaylistData(prev => ({
          ...prev,
          collaborators: [...prev.collaborators, friendId]
        }));
      }
    } catch (err) {
      console.error('Error adding collaborator:', err);
    }
  };

  const getEventById = (eventId) => {
    return availableEvents.find(event => event.id === eventId);
  };

  if (!isOpen) return null;

  return (
    <div className="playlist-builder-overlay" onClick={onClose}>
      <div className="playlist-builder" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="playlist-builder-header">
          <h2>{playlist ? 'Edit Playlist' : 'Create New Playlist'}</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>

        <div className="playlist-builder-content">
          {/* Left Panel - Playlist Info */}
          <div className="playlist-info-panel">
            <div className="form-section">
              <h3>Playlist Details</h3>
              
              <div className="form-group">
                <label>Name *</label>
                <input
                  type="text"
                  value={playlistData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Enter playlist name"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={playlistData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Describe your playlist..."
                  className="form-textarea"
                  rows="3"
                />
              </div>

              <div className="form-group">
                <label>Privacy</label>
                <select
                  value={playlistData.privacy}
                  onChange={(e) => handleInputChange('privacy', e.target.value)}
                  className="form-select"
                >
                  <option value="private">🔒 Private</option>
                  <option value="public">🌐 Public</option>
                  <option value="link">🔗 Link Only</option>
                </select>
              </div>

              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={playlistData.isCollaborative}
                    onChange={(e) => handleInputChange('isCollaborative', e.target.checked)}
                  />
                  Allow collaboration
                </label>
              </div>
            </div>

            {/* Collaborators Section */}
            {playlist && (
              <div className="form-section">
                <h3>Collaborators</h3>
                <div className="collaborators-list">
                  {playlistData.collaborators.map(collaboratorId => {
                    const friend = friends.find(f => f.id === collaboratorId);
                    return friend ? (
                      <div key={collaboratorId} className="collaborator-item">
                        <div className="collaborator-info">
                          <div className="collaborator-avatar">
                            {friend.avatar ? (
                              <img src={friend.avatar} alt={friend.displayName} />
                            ) : (
                              <div className="avatar-placeholder">
                                {friend.displayName.charAt(0).toUpperCase()}
                              </div>
                            )}
                          </div>
                          <span className="collaborator-name">{friend.displayName}</span>
                        </div>
                        <button 
                          className="remove-collaborator"
                          onClick={() => setPlaylistData(prev => ({
                            ...prev,
                            collaborators: prev.collaborators.filter(id => id !== collaboratorId)
                          }))}
                        >
                          ×
                        </button>
                      </div>
                    ) : null;
                  })}
                </div>
                
                <div className="add-collaborator-section">
                  <select
                    onChange={(e) => {
                      if (e.target.value) {
                        handleAddCollaborator(e.target.value);
                        e.target.value = '';
                      }
                    }}
                    className="form-select"
                  >
                    <option value="">Add collaborator...</option>
                    {friends
                      .filter(friend => !playlistData.collaborators.includes(friend.id))
                      .map(friend => (
                        <option key={friend.id} value={friend.id}>
                          {friend.displayName}
                        </option>
                      ))
                    }
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Right Panel - Events */}
          <div className="events-panel">
            <div className="events-section">
              <h3>Available Events</h3>
              
              <div className="search-container">
                <input
                  type="text"
                  placeholder="Search events..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="search-input"
                />
              </div>

              <div className="events-grid">
                {filteredEvents.map(event => (
                  <div
                    key={event.id}
                    className={`event-card ${playlistData.events.includes(event.id) ? 'added' : ''}`}
                    draggable={!playlistData.events.includes(event.id)}
                    onDragStart={(e) => handleDragStart(e, event)}
                  >
                    <div className="event-header">
                      <h4 className="event-title">{event.title}</h4>
                      {playlistData.events.includes(event.id) && (
                        <span className="added-indicator">✓</span>
                      )}
                    </div>
                    <p className="event-description">{event.description}</p>
                    <div className="event-meta">
                      <span className="event-date">{event.date}</span>
                      <span className="event-category">{event.category}</span>
                    </div>
                    {!playlistData.events.includes(event.id) && (
                      <button
                        className="add-event-button"
                        onClick={() => {
                          setPlaylistData(prev => ({
                            ...prev,
                            events: [...prev.events, event.id]
                          }));
                        }}
                      >
                        Add to Playlist
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="playlist-events-section">
              <h3>Playlist Events ({playlistData.events.length})</h3>
              
              <div 
                className="playlist-events"
                ref={playlistRef}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
              >
                {playlistData.events.length === 0 ? (
                  <div className="empty-playlist">
                    <p>Drag events here or use the "Add to Playlist" buttons</p>
                  </div>
                ) : (
                  playlistData.events.map((eventId, index) => {
                    const event = getEventById(eventId);
                    if (!event) return null;
                    
                    return (
                      <div key={eventId} className="playlist-event-item">
                        <div className="event-order">{index + 1}</div>
                        <div className="event-content">
                          <h4 className="event-title">{event.title}</h4>
                          <p className="event-description">{event.description}</p>
                          <div className="event-meta">
                            <span className="event-date">{event.date}</span>
                            <span className="event-category">{event.category}</span>
                          </div>
                        </div>
                        <div className="event-actions">
                          <button
                            className="move-up-button"
                            onClick={() => handleReorderEvents(index, Math.max(0, index - 1))}
                            disabled={index === 0}
                          >
                            ↑
                          </button>
                          <button
                            className="move-down-button"
                            onClick={() => handleReorderEvents(index, Math.min(playlistData.events.length - 1, index + 1))}
                            disabled={index === playlistData.events.length - 1}
                          >
                            ↓
                          </button>
                          <button
                            className="remove-event-button"
                            onClick={() => handleRemoveEvent(eventId)}
                          >
                            ×
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="playlist-builder-footer">
          <div className="footer-actions">
            {playlist && (
              <button
                className="share-button"
                onClick={() => setShowShareModal(true)}
              >
                Share Playlist
              </button>
            )}
            <button className="cancel-button" onClick={onClose}>
              Cancel
            </button>
            <button 
              className="save-button" 
              onClick={handleSave}
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save Playlist'}
            </button>
          </div>
        </div>

        {/* Share Modal */}
        {showShareModal && (
          <div className="share-modal-overlay" onClick={() => setShowShareModal(false)}>
            <div className="share-modal" onClick={(e) => e.stopPropagation()}>
              <h3>Share Playlist</h3>
              <p>Select friends to share this playlist with:</p>
              
              <div className="friends-selection">
                {friends.map(friend => (
                  <label key={friend.id} className="friend-selection-item">
                    <input
                      type="checkbox"
                      checked={selectedFriends.includes(friend.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedFriends(prev => [...prev, friend.id]);
                        } else {
                          setSelectedFriends(prev => prev.filter(id => id !== friend.id));
                        }
                      }}
                    />
                    <div className="friend-info">
                      <div className="friend-avatar">
                        {friend.avatar ? (
                          <img src={friend.avatar} alt={friend.displayName} />
                        ) : (
                          <div className="avatar-placeholder">
                            {friend.displayName.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <span className="friend-name">{friend.displayName}</span>
                    </div>
                  </label>
                ))}
              </div>
              
              <div className="modal-actions">
                <button 
                  className="cancel-button"
                  onClick={() => setShowShareModal(false)}
                >
                  Cancel
                </button>
                <button 
                  className="share-button"
                  onClick={handleShare}
                  disabled={selectedFriends.length === 0}
                >
                  Share with {selectedFriends.length} friend{selectedFriends.length !== 1 ? 's' : ''}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}
      </div>
    </div>
  );
};

export default PlaylistBuilder;
