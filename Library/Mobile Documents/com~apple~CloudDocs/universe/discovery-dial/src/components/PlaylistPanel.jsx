/**
 * PlaylistPanel Component
 * Main panel for managing playlists and social features
 */

import React, { useState, useEffect } from 'react';
import { usePlaylists } from '../hooks/usePlaylists';
import { useSocialFeatures } from '../hooks/useSocialFeatures';
import { PRIVACY_LEVELS, defaultPlaylistTemplates } from '../models/playlist';
import './PlaylistPanel.css';

const PlaylistPanel = ({ isOpen, onClose, onEventSelect, selectedEvents = [], onOpenBuilder }) => {
  const [activeTab, setActiveTab] = useState('playlists');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  const {
    playlists,
    loading,
    error,
    currentPlaylist,
    createNewPlaylist,
    deletePlaylist,
    setCurrentPlaylist,
    searchPlaylists,
    clearError
  } = usePlaylists();

  const {
    friends,
    notifications,
    getUnreadNotificationCount,
    getPendingFriendRequestCount,
    markNotificationAsRead,
    clearAllNotifications
  } = useSocialFeatures();

  const [newPlaylist, setNewPlaylist] = useState({
    name: '',
    description: '',
    privacy: PRIVACY_LEVELS.PRIVATE,
    isCollaborative: false
  });

  const filteredPlaylists = searchQuery ? searchPlaylists(searchQuery) : playlists;
  const unreadNotifications = getUnreadNotificationCount();
  const pendingRequests = getPendingFriendRequestCount();

  const handleCreatePlaylist = async () => {
    if (!newPlaylist.name.trim()) {
      alert('Please enter a playlist name');
      return;
    }

    const success = await createNewPlaylist(
      newPlaylist.name,
      newPlaylist.description,
      newPlaylist.privacy
    );

    if (success) {
      setNewPlaylist({ name: '', description: '', privacy: PRIVACY_LEVELS.PRIVATE, isCollaborative: false });
      setShowCreateForm(false);
      setSelectedTemplate(null);
    }
  };

  const handleTemplateSelect = (template) => {
    setSelectedTemplate(template);
    setNewPlaylist({
      name: template.name,
      description: template.description,
      privacy: template.privacy,
      isCollaborative: template.isCollaborative
    });
  };

  const handlePlaylistSelect = (playlist) => {
    setCurrentPlaylist(playlist);
    if (onEventSelect) {
      onEventSelect(playlist.events);
    }
  };

  const handleDeletePlaylist = async (playlistId) => {
    if (window.confirm('Are you sure you want to delete this playlist?')) {
      await deletePlaylist(playlistId);
    }
  };

  const handleNotificationClick = (notification) => {
    markNotificationAsRead(notification.id);
    // Navigate to the relevant page
    if (notification.actionUrl) {
      // This would be handled by your routing system
      console.log('Navigate to:', notification.actionUrl);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="playlist-panel-overlay" onClick={onClose}>
      <div className="playlist-panel" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="playlist-panel-header">
          <h2>🎵 Event Playlists</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>

        {/* Tabs */}
        <div className="playlist-panel-tabs">
          <button 
            className={`tab ${activeTab === 'playlists' ? 'active' : ''}`}
            onClick={() => setActiveTab('playlists')}
          >
            My Playlists ({playlists.length})
          </button>
          <button 
            className={`tab ${activeTab === 'shared' ? 'active' : ''}`}
            onClick={() => setActiveTab('shared')}
          >
            Shared ({playlists.filter(p => p.privacy !== PRIVACY_LEVELS.PRIVATE).length})
          </button>
          <button 
            className={`tab ${activeTab === 'social' ? 'active' : ''}`}
            onClick={() => setActiveTab('social')}
          >
            Social
            {unreadNotifications > 0 && (
              <span className="notification-badge">{unreadNotifications}</span>
            )}
          </button>
        </div>

        {/* Content */}
        <div className="playlist-panel-content">
          {activeTab === 'playlists' && (
            <div className="playlists-tab">
              {/* Search */}
              <div className="search-container">
                <input
                  type="text"
                  placeholder="Search playlists..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="search-input"
                />
              </div>

              {/* Create Buttons */}
              <div className="create-buttons">
                <button 
                  className="create-playlist-button"
                  onClick={() => setShowCreateForm(true)}
                >
                  + Quick Create
                </button>
                <button 
                  className="create-playlist-builder-button"
                  onClick={() => onOpenBuilder && onOpenBuilder()}
                >
                  🎵 Advanced Builder
                </button>
              </div>

              {/* Create Form */}
              {showCreateForm && (
                <div className="create-playlist-form">
                  <h3>Create New Playlist</h3>
                  
                  {/* Templates */}
                  <div className="template-selection">
                    <h4>Choose a template (optional):</h4>
                    <div className="template-grid">
                      {defaultPlaylistTemplates.map((template, index) => (
                        <button
                          key={index}
                          className={`template-card ${selectedTemplate === template ? 'selected' : ''}`}
                          onClick={() => handleTemplateSelect(template)}
                        >
                          <div className="template-name">{template.name}</div>
                          <div className="template-description">{template.description}</div>
                          <div className="template-tags">
                            {template.tags.map((tag, tagIndex) => (
                              <span key={tagIndex} className="template-tag">{tag}</span>
                            ))}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Form Fields */}
                  <div className="form-fields">
                    <input
                      type="text"
                      placeholder="Playlist name"
                      value={newPlaylist.name}
                      onChange={(e) => setNewPlaylist({...newPlaylist, name: e.target.value})}
                      className="form-input"
                    />
                    <textarea
                      placeholder="Description (optional)"
                      value={newPlaylist.description}
                      onChange={(e) => setNewPlaylist({...newPlaylist, description: e.target.value})}
                      className="form-textarea"
                      rows="3"
                    />
                    <select
                      value={newPlaylist.privacy}
                      onChange={(e) => setNewPlaylist({...newPlaylist, privacy: e.target.value})}
                      className="form-select"
                    >
                      <option value={PRIVACY_LEVELS.PRIVATE}>🔒 Private</option>
                      <option value={PRIVACY_LEVELS.PUBLIC}>🌐 Public</option>
                      <option value={PRIVACY_LEVELS.LINK}>🔗 Link Only</option>
                    </select>
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={newPlaylist.isCollaborative}
                        onChange={(e) => setNewPlaylist({...newPlaylist, isCollaborative: e.target.checked})}
                      />
                      Allow collaboration
                    </label>
                  </div>

                  {/* Form Actions */}
                  <div className="form-actions">
                    <button onClick={handleCreatePlaylist} className="save-button">
                      Create Playlist
                    </button>
                    <button onClick={() => setShowCreateForm(false)} className="cancel-button">
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Playlists List */}
              <div className="playlists-list">
                {loading && <div className="loading">Loading playlists...</div>}
                {error && <div className="error">{error}</div>}
                
                {filteredPlaylists.length === 0 ? (
                  <div className="empty-state">
                    <p>No playlists found</p>
                    <p>Create your first playlist to get started!</p>
                  </div>
                ) : (
                  filteredPlaylists.map((playlist) => (
                    <div 
                      key={playlist.id} 
                      className={`playlist-card ${currentPlaylist?.id === playlist.id ? 'selected' : ''}`}
                      onClick={() => handlePlaylistSelect(playlist)}
                    >
                      <div className="playlist-header">
                        <h4 className="playlist-name">{playlist.name}</h4>
                        <div className="playlist-actions">
                          <span className="playlist-privacy">
                            {playlist.privacy === PRIVACY_LEVELS.PRIVATE && '🔒'}
                            {playlist.privacy === PRIVACY_LEVELS.PUBLIC && '🌐'}
                            {playlist.privacy === PRIVACY_LEVELS.LINK && '🔗'}
                          </span>
                          <button 
                            className="delete-button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeletePlaylist(playlist.id);
                            }}
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                      <p className="playlist-description">{playlist.description}</p>
                      <div className="playlist-stats">
                        <span>{playlist.events.length} events</span>
                        {playlist.collaborators.length > 0 && (
                          <span>{playlist.collaborators.length} collaborators</span>
                        )}
                        <span>Updated {new Date(playlist.updatedAt).toLocaleDateString()}</span>
                      </div>
                      {playlist.tags.length > 0 && (
                        <div className="playlist-tags">
                          {playlist.tags.map((tag, index) => (
                            <span key={index} className="tag">{tag}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === 'shared' && (
            <div className="shared-tab">
              <div className="shared-playlists">
                {playlists.filter(p => p.privacy !== PRIVACY_LEVELS.PRIVATE).length === 0 ? (
                  <div className="empty-state">
                    <p>No shared playlists yet</p>
                    <p>Create a public playlist or share a private one to see it here!</p>
                  </div>
                ) : (
                  playlists
                    .filter(p => p.privacy !== PRIVACY_LEVELS.PRIVATE)
                    .map((playlist) => (
                      <div 
                        key={playlist.id} 
                        className="playlist-card shared"
                        onClick={() => handlePlaylistSelect(playlist)}
                      >
                        <div className="playlist-header">
                          <h4 className="playlist-name">{playlist.name}</h4>
                          <span className="playlist-privacy">
                            {playlist.privacy === PRIVACY_LEVELS.PUBLIC && '🌐 Public'}
                            {playlist.privacy === PRIVACY_LEVELS.LINK && '🔗 Link Shared'}
                          </span>
                        </div>
                        <p className="playlist-description">{playlist.description}</p>
                        <div className="playlist-stats">
                          <span>{playlist.events.length} events</span>
                          <span>Shared {new Date(playlist.updatedAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    ))
                )}
              </div>
            </div>
          )}

          {activeTab === 'social' && (
            <div className="social-tab">
              {/* Friends Section */}
              <div className="friends-section">
                <h3>👥 Friends ({friends.length})</h3>
                {pendingRequests > 0 && (
                  <div className="pending-requests">
                    <p>You have {pendingRequests} pending friend request(s)</p>
                    <button className="view-requests-button">View Requests</button>
                  </div>
                )}
                <div className="friends-list">
                  {friends.length === 0 ? (
                    <p className="empty-state">No friends yet. Start by sharing a playlist!</p>
                  ) : (
                    friends.map((friend) => (
                      <div key={friend.id} className="friend-card">
                        <div className="friend-avatar">
                          {friend.avatar ? (
                            <img src={friend.avatar} alt={friend.displayName} />
                          ) : (
                            <div className="avatar-placeholder">
                              {friend.displayName.charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>
                        <div className="friend-info">
                          <div className="friend-name">{friend.displayName}</div>
                          <div className="friend-username">@{friend.username}</div>
                        </div>
                        <div className="friend-status">
                          <span className="online-indicator">🟢</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Notifications Section */}
              <div className="notifications-section">
                <div className="notifications-header">
                  <h3>🔔 Notifications ({unreadNotifications})</h3>
                  {notifications.length > 0 && (
                    <button 
                      className="clear-all-button"
                      onClick={clearAllNotifications}
                    >
                      Clear All
                    </button>
                  )}
                </div>
                <div className="notifications-list">
                  {notifications.length === 0 ? (
                    <p className="empty-state">No notifications</p>
                  ) : (
                    notifications.slice(0, 10).map((notification) => (
                      <div 
                        key={notification.id} 
                        className={`notification-item ${!notification.isRead ? 'unread' : ''}`}
                        onClick={() => handleNotificationClick(notification)}
                      >
                        <div className="notification-content">
                          <div className="notification-title">{notification.title}</div>
                          <div className="notification-message">{notification.message}</div>
                          <div className="notification-time">
                            {new Date(notification.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                        {!notification.isRead && <div className="unread-indicator"></div>}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PlaylistPanel;
