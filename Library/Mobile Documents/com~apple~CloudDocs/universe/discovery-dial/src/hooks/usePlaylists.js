/**
 * usePlaylists Hook
 * Manages playlist state and operations
 */

import { useState, useEffect, useCallback } from 'react';
import { createPlaylist, validatePlaylist, PRIVACY_LEVELS } from '../models/playlist';

export const usePlaylists = () => {
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPlaylist, setCurrentPlaylist] = useState(null);

  // Load playlists from localStorage on mount
  useEffect(() => {
    loadPlaylists();
  }, []);

  const loadPlaylists = useCallback(() => {
    try {
      const stored = localStorage.getItem('discovery-dial-playlists');
      if (stored) {
        const parsedPlaylists = JSON.parse(stored);
        setPlaylists(parsedPlaylists);
      }
    } catch (err) {
      console.error('Error loading playlists:', err);
      setError('Failed to load playlists');
    }
  }, []);

  const savePlaylists = useCallback((newPlaylists) => {
    try {
      localStorage.setItem('discovery-dial-playlists', JSON.stringify(newPlaylists));
      setPlaylists(newPlaylists);
    } catch (err) {
      console.error('Error saving playlists:', err);
      setError('Failed to save playlists');
    }
  }, []);

  const createNewPlaylist = useCallback((name, description = '', privacy = PRIVACY_LEVELS.PRIVATE) => {
    setLoading(true);
    setError(null);

    try {
      const newPlaylist = createPlaylist(name, description, privacy);
      const validation = validatePlaylist(newPlaylist);
      
      if (!validation.isValid) {
        setError(validation.errors.join(', '));
        setLoading(false);
        return null;
      }

      const updatedPlaylists = [...playlists, newPlaylist];
      savePlaylists(updatedPlaylists);
      setCurrentPlaylist(newPlaylist);
      setLoading(false);
      return newPlaylist;
    } catch (err) {
      console.error('Error creating playlist:', err);
      setError('Failed to create playlist');
      setLoading(false);
      return null;
    }
  }, [playlists, savePlaylists]);

  const updatePlaylist = useCallback((playlistId, updates) => {
    setLoading(true);
    setError(null);

    try {
      const updatedPlaylists = playlists.map(playlist => {
        if (playlist.id === playlistId) {
          const updatedPlaylist = {
            ...playlist,
            ...updates,
            updatedAt: new Date().toISOString()
          };
          
          const validation = validatePlaylist(updatedPlaylist);
          if (!validation.isValid) {
            setError(validation.errors.join(', '));
            setLoading(false);
            return playlist;
          }
          
          return updatedPlaylist;
        }
        return playlist;
      });

      savePlaylists(updatedPlaylists);
      
      // Update current playlist if it's the one being updated
      if (currentPlaylist && currentPlaylist.id === playlistId) {
        const updated = updatedPlaylists.find(p => p.id === playlistId);
        setCurrentPlaylist(updated);
      }
      
      setLoading(false);
      return true;
    } catch (err) {
      console.error('Error updating playlist:', err);
      setError('Failed to update playlist');
      setLoading(false);
      return false;
    }
  }, [playlists, currentPlaylist, savePlaylists]);

  const deletePlaylist = useCallback((playlistId) => {
    setLoading(true);
    setError(null);

    try {
      const updatedPlaylists = playlists.filter(playlist => playlist.id !== playlistId);
      savePlaylists(updatedPlaylists);
      
      // Clear current playlist if it's the one being deleted
      if (currentPlaylist && currentPlaylist.id === playlistId) {
        setCurrentPlaylist(null);
      }
      
      setLoading(false);
      return true;
    } catch (err) {
      console.error('Error deleting playlist:', err);
      setError('Failed to delete playlist');
      setLoading(false);
      return false;
    }
  }, [playlists, currentPlaylist, savePlaylists]);

  const addEventToPlaylist = useCallback((playlistId, eventId) => {
    setLoading(true);
    setError(null);

    try {
      const updatedPlaylists = playlists.map(playlist => {
        if (playlist.id === playlistId) {
          if (!playlist.events.includes(eventId)) {
            return {
              ...playlist,
              events: [...playlist.events, eventId],
              eventOrder: [...playlist.eventOrder, eventId],
              updatedAt: new Date().toISOString()
            };
          }
          return playlist;
        }
        return playlist;
      });

      savePlaylists(updatedPlaylists);
      
      // Update current playlist if it's the one being updated
      if (currentPlaylist && currentPlaylist.id === playlistId) {
        const updated = updatedPlaylists.find(p => p.id === playlistId);
        setCurrentPlaylist(updated);
      }
      
      setLoading(false);
      return true;
    } catch (err) {
      console.error('Error adding event to playlist:', err);
      setError('Failed to add event to playlist');
      setLoading(false);
      return false;
    }
  }, [playlists, currentPlaylist, savePlaylists]);

  const removeEventFromPlaylist = useCallback((playlistId, eventId) => {
    setLoading(true);
    setError(null);

    try {
      const updatedPlaylists = playlists.map(playlist => {
        if (playlist.id === playlistId) {
          return {
            ...playlist,
            events: playlist.events.filter(id => id !== eventId),
            eventOrder: playlist.eventOrder.filter(id => id !== eventId),
            updatedAt: new Date().toISOString()
          };
        }
        return playlist;
      });

      savePlaylists(updatedPlaylists);
      
      // Update current playlist if it's the one being updated
      if (currentPlaylist && currentPlaylist.id === playlistId) {
        const updated = updatedPlaylists.find(p => p.id === playlistId);
        setCurrentPlaylist(updated);
      }
      
      setLoading(false);
      return true;
    } catch (err) {
      console.error('Error removing event from playlist:', err);
      setError('Failed to remove event from playlist');
      setLoading(false);
      return false;
    }
  }, [playlists, currentPlaylist, savePlaylists]);

  const reorderPlaylistEvents = useCallback((playlistId, newOrder) => {
    setLoading(true);
    setError(null);

    try {
      const updatedPlaylists = playlists.map(playlist => {
        if (playlist.id === playlistId) {
          return {
            ...playlist,
            eventOrder: newOrder,
            updatedAt: new Date().toISOString()
          };
        }
        return playlist;
      });

      savePlaylists(updatedPlaylists);
      
      // Update current playlist if it's the one being updated
      if (currentPlaylist && currentPlaylist.id === playlistId) {
        const updated = updatedPlaylists.find(p => p.id === playlistId);
        setCurrentPlaylist(updated);
      }
      
      setLoading(false);
      return true;
    } catch (err) {
      console.error('Error reordering playlist events:', err);
      setError('Failed to reorder playlist events');
      setLoading(false);
      return false;
    }
  }, [playlists, currentPlaylist, savePlaylists]);

  const getPlaylistById = useCallback((playlistId) => {
    return playlists.find(playlist => playlist.id === playlistId);
  }, [playlists]);

  const getPlaylistsByPrivacy = useCallback((privacy) => {
    return playlists.filter(playlist => playlist.privacy === privacy);
  }, [playlists]);

  const searchPlaylists = useCallback((query) => {
    if (!query || query.trim().length === 0) {
      return playlists;
    }
    
    const lowercaseQuery = query.toLowerCase();
    return playlists.filter(playlist => 
      playlist.name.toLowerCase().includes(lowercaseQuery) ||
      playlist.description.toLowerCase().includes(lowercaseQuery) ||
      playlist.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery))
    );
  }, [playlists]);

  const duplicatePlaylist = useCallback((playlistId) => {
    setLoading(true);
    setError(null);

    try {
      const originalPlaylist = getPlaylistById(playlistId);
      if (!originalPlaylist) {
        setError('Playlist not found');
        setLoading(false);
        return null;
      }

      const duplicatedPlaylist = {
        ...originalPlaylist,
        id: Math.random().toString(36).substr(2, 9) + Date.now().toString(36),
        name: `${originalPlaylist.name} (Copy)`,
        owner: localStorage.getItem('userId') || 'anonymous',
        collaborators: [],
        viewers: [],
        shareUrl: `https://hyyper.co/playlist/${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const updatedPlaylists = [...playlists, duplicatedPlaylist];
      savePlaylists(updatedPlaylists);
      setCurrentPlaylist(duplicatedPlaylist);
      setLoading(false);
      return duplicatedPlaylist;
    } catch (err) {
      console.error('Error duplicating playlist:', err);
      setError('Failed to duplicate playlist');
      setLoading(false);
      return null;
    }
  }, [playlists, getPlaylistById, savePlaylists]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    // State
    playlists,
    loading,
    error,
    currentPlaylist,
    
    // Actions
    createNewPlaylist,
    updatePlaylist,
    deletePlaylist,
    addEventToPlaylist,
    removeEventFromPlaylist,
    reorderPlaylistEvents,
    setCurrentPlaylist,
    clearError,
    
    // Utilities
    getPlaylistById,
    getPlaylistsByPrivacy,
    searchPlaylists,
    duplicatePlaylist,
    loadPlaylists,
    savePlaylists
  };
};
