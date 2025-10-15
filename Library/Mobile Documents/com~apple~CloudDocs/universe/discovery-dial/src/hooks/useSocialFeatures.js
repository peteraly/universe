/**
 * useSocialFeatures Hook
 * Manages social features like friends, sharing, and collaboration
 */

import { useState, useEffect, useCallback } from 'react';
import { createFriendRequest, validateFriendRequest, NOTIFICATION_TYPES } from '../models/playlist';

export const useSocialFeatures = () => {
  const [friends, setFriends] = useState([]);
  const [friendRequests, setFriendRequests] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  // Load social data from localStorage on mount
  useEffect(() => {
    loadSocialData();
  }, []);

  const loadSocialData = useCallback(() => {
    try {
      // Load friends
      const storedFriends = localStorage.getItem('discovery-dial-friends');
      if (storedFriends) {
        setFriends(JSON.parse(storedFriends));
      }

      // Load friend requests
      const storedRequests = localStorage.getItem('discovery-dial-friend-requests');
      if (storedRequests) {
        setFriendRequests(JSON.parse(storedRequests));
      }

      // Load notifications
      const storedNotifications = localStorage.getItem('discovery-dial-notifications');
      if (storedNotifications) {
        setNotifications(JSON.parse(storedNotifications));
      }

      // Load current user
      const storedUser = localStorage.getItem('discovery-dial-current-user');
      if (storedUser) {
        setCurrentUser(JSON.parse(storedUser));
      } else {
        // Create default user if none exists
        const defaultUser = {
          id: 'user_' + Math.random().toString(36).substr(2, 9),
          username: 'User_' + Math.random().toString(36).substr(2, 6),
          displayName: 'Anonymous User',
          email: '',
          avatar: '',
          bio: '',
          friends: [],
          friendRequests: [],
          playlists: [],
          sharedPlaylists: [],
          notifications: [],
          preferences: {
            defaultPrivacy: 'private',
            allowFriendRequests: true,
            showOnlineStatus: true,
            emailNotifications: true,
            pushNotifications: true
          },
          createdAt: new Date().toISOString(),
          lastActive: new Date().toISOString()
        };
        setCurrentUser(defaultUser);
        localStorage.setItem('discovery-dial-current-user', JSON.stringify(defaultUser));
      }
    } catch (err) {
      console.error('Error loading social data:', err);
      setError('Failed to load social data');
    }
  }, []);

  const saveFriends = useCallback((newFriends) => {
    try {
      localStorage.setItem('discovery-dial-friends', JSON.stringify(newFriends));
      setFriends(newFriends);
    } catch (err) {
      console.error('Error saving friends:', err);
      setError('Failed to save friends');
    }
  }, []);

  const saveFriendRequests = useCallback((newRequests) => {
    try {
      localStorage.setItem('discovery-dial-friend-requests', JSON.stringify(newRequests));
      setFriendRequests(newRequests);
    } catch (err) {
      console.error('Error saving friend requests:', err);
      setError('Failed to save friend requests');
    }
  }, []);

  const saveNotifications = useCallback((newNotifications) => {
    try {
      localStorage.setItem('discovery-dial-notifications', JSON.stringify(newNotifications));
      setNotifications(newNotifications);
    } catch (err) {
      console.error('Error saving notifications:', err);
      setError('Failed to save notifications');
    }
  }, []);

  const saveCurrentUser = useCallback((user) => {
    try {
      localStorage.setItem('discovery-dial-current-user', JSON.stringify(user));
      setCurrentUser(user);
    } catch (err) {
      console.error('Error saving current user:', err);
      setError('Failed to save user data');
    }
  }, []);

  const sendFriendRequest = useCallback((toUserId, message = '') => {
    setLoading(true);
    setError(null);

    try {
      const newRequest = createFriendRequest(toUserId, message);
      const validation = validateFriendRequest(newRequest);
      
      if (!validation.isValid) {
        setError(validation.errors.join(', '));
        setLoading(false);
        return false;
      }

      // Check if request already exists
      const existingRequest = friendRequests.find(
        req => req.fromUser === newRequest.fromUser && req.toUser === toUserId && req.status === 'pending'
      );

      if (existingRequest) {
        setError('Friend request already sent');
        setLoading(false);
        return false;
      }

      const updatedRequests = [...friendRequests, newRequest];
      saveFriendRequests(updatedRequests);

      // Create notification for recipient
      const notification = {
        id: 'notif_' + Math.random().toString(36).substr(2, 9),
        userId: toUserId,
        type: NOTIFICATION_TYPES.FRIEND_REQUEST,
        title: 'New Friend Request',
        message: `${currentUser?.displayName || 'Someone'} wants to be your friend`,
        data: { fromUser: newRequest.fromUser, requestId: newRequest.id },
        isRead: false,
        createdAt: new Date().toISOString(),
        actionUrl: '/friends'
      };

      const updatedNotifications = [...notifications, notification];
      saveNotifications(updatedNotifications);

      setLoading(false);
      return true;
    } catch (err) {
      console.error('Error sending friend request:', err);
      setError('Failed to send friend request');
      setLoading(false);
      return false;
    }
  }, [friendRequests, notifications, currentUser, saveFriendRequests, saveNotifications]);

  const respondToFriendRequest = useCallback((requestId, response) => {
    setLoading(true);
    setError(null);

    try {
      const updatedRequests = friendRequests.map(request => {
        if (request.id === requestId) {
          return {
            ...request,
            status: response,
            respondedAt: new Date().toISOString()
          };
        }
        return request;
      });

      saveFriendRequests(updatedRequests);

      // If accepted, add to friends list
      if (response === 'accepted') {
        const request = friendRequests.find(req => req.id === requestId);
        if (request) {
          const newFriend = {
            id: request.fromUser,
            username: `Friend_${request.fromUser.substr(-6)}`,
            displayName: `Friend ${request.fromUser.substr(-6)}`,
            avatar: '',
            addedAt: new Date().toISOString()
          };

          const updatedFriends = [...friends, newFriend];
          saveFriends(updatedFriends);

          // Update current user's friends list
          if (currentUser) {
            const updatedUser = {
              ...currentUser,
              friends: [...currentUser.friends, request.fromUser]
            };
            saveCurrentUser(updatedUser);
          }
        }
      }

      setLoading(false);
      return true;
    } catch (err) {
      console.error('Error responding to friend request:', err);
      setError('Failed to respond to friend request');
      setLoading(false);
      return false;
    }
  }, [friendRequests, friends, currentUser, saveFriendRequests, saveFriends, saveCurrentUser]);

  const removeFriend = useCallback((friendId) => {
    setLoading(true);
    setError(null);

    try {
      const updatedFriends = friends.filter(friend => friend.id !== friendId);
      saveFriends(updatedFriends);

      // Update current user's friends list
      if (currentUser) {
        const updatedUser = {
          ...currentUser,
          friends: currentUser.friends.filter(id => id !== friendId)
        };
        saveCurrentUser(updatedUser);
      }

      setLoading(false);
      return true;
    } catch (err) {
      console.error('Error removing friend:', err);
      setError('Failed to remove friend');
      setLoading(false);
      return false;
    }
  }, [friends, currentUser, saveFriends, saveCurrentUser]);

  const sharePlaylist = useCallback((playlistId, userIds, allowCollaboration = false) => {
    setLoading(true);
    setError(null);

    try {
      // Create notifications for each user
      const newNotifications = userIds.map(userId => ({
        id: 'notif_' + Math.random().toString(36).substr(2, 9),
        userId,
        type: NOTIFICATION_TYPES.PLAYLIST_SHARED,
        title: 'Playlist Shared',
        message: `${currentUser?.displayName || 'Someone'} shared a playlist with you`,
        data: { playlistId, allowCollaboration },
        isRead: false,
        createdAt: new Date().toISOString(),
        actionUrl: `/playlist/${playlistId}`
      }));

      const updatedNotifications = [...notifications, ...newNotifications];
      saveNotifications(updatedNotifications);

      setLoading(false);
      return true;
    } catch (err) {
      console.error('Error sharing playlist:', err);
      setError('Failed to share playlist');
      setLoading(false);
      return false;
    }
  }, [notifications, currentUser, saveNotifications]);

  const addCollaborator = useCallback((playlistId, userId) => {
    setLoading(true);
    setError(null);

    try {
      const notification = {
        id: 'notif_' + Math.random().toString(36).substr(2, 9),
        userId,
        type: NOTIFICATION_TYPES.COLLABORATOR_ADDED,
        title: 'Added as Collaborator',
        message: `${currentUser?.displayName || 'Someone'} added you as a collaborator`,
        data: { playlistId },
        isRead: false,
        createdAt: new Date().toISOString(),
        actionUrl: `/playlist/${playlistId}`
      };

      const updatedNotifications = [...notifications, notification];
      saveNotifications(updatedNotifications);

      setLoading(false);
      return true;
    } catch (err) {
      console.error('Error adding collaborator:', err);
      setError('Failed to add collaborator');
      setLoading(false);
      return false;
    }
  }, [notifications, currentUser, saveNotifications]);

  const markNotificationAsRead = useCallback((notificationId) => {
    try {
      const updatedNotifications = notifications.map(notification => {
        if (notification.id === notificationId) {
          return { ...notification, isRead: true };
        }
        return notification;
      });
      saveNotifications(updatedNotifications);
      return true;
    } catch (err) {
      console.error('Error marking notification as read:', err);
      return false;
    }
  }, [notifications, saveNotifications]);

  const markAllNotificationsAsRead = useCallback(() => {
    try {
      const updatedNotifications = notifications.map(notification => ({
        ...notification,
        isRead: true
      }));
      saveNotifications(updatedNotifications);
      return true;
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
      return false;
    }
  }, [notifications, saveNotifications]);

  const clearAllNotifications = useCallback(() => {
    try {
      saveNotifications([]);
      return true;
    } catch (err) {
      console.error('Error clearing notifications:', err);
      return false;
    }
  }, [saveNotifications]);

  const updateUserProfile = useCallback((updates) => {
    setLoading(true);
    setError(null);

    try {
      if (!currentUser) {
        setError('No user logged in');
        setLoading(false);
        return false;
      }

      const updatedUser = {
        ...currentUser,
        ...updates,
        updatedAt: new Date().toISOString()
      };

      saveCurrentUser(updatedUser);
      setLoading(false);
      return true;
    } catch (err) {
      console.error('Error updating user profile:', err);
      setError('Failed to update profile');
      setLoading(false);
      return false;
    }
  }, [currentUser, saveCurrentUser]);

  const getUnreadNotificationCount = useCallback(() => {
    return notifications.filter(notification => !notification.isRead).length;
  }, [notifications]);

  const getPendingFriendRequestCount = useCallback(() => {
    return friendRequests.filter(request => 
      request.toUser === currentUser?.id && request.status === 'pending'
    ).length;
  }, [friendRequests, currentUser]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    // State
    friends,
    friendRequests,
    notifications,
    currentUser,
    loading,
    error,
    
    // Actions
    sendFriendRequest,
    respondToFriendRequest,
    removeFriend,
    sharePlaylist,
    addCollaborator,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    clearAllNotifications,
    updateUserProfile,
    clearError,
    
    // Utilities
    getUnreadNotificationCount,
    getPendingFriendRequestCount,
    loadSocialData,
    saveFriends,
    saveFriendRequests,
    saveNotifications,
    saveCurrentUser
  };
};
