/**
 * Playlist Data Models and Schemas
 * Defines the data structure for event playlists and social sharing
 */

// Playlist Schema
export const playlistSchema = {
  id: 'string',
  name: 'string',
  description: 'string',
  events: ['eventId1', 'eventId2'], // Array of event IDs
  owner: 'userId',
  collaborators: ['userId1', 'userId2'], // Users who can edit
  viewers: ['userId1', 'userId2'], // Users who can view only
  privacy: 'private' | 'public' | 'link', // Privacy level
  tags: ['tag1', 'tag2'], // Searchable tags
  createdAt: 'timestamp',
  updatedAt: 'timestamp',
  shareUrl: 'string', // Unique shareable URL
  isCollaborative: 'boolean', // Can others edit?
  maxCollaborators: 'number', // Limit on collaborators
  allowComments: 'boolean', // Allow comments on events
  eventOrder: ['eventId1', 'eventId2'] // Custom event ordering
};

// User Schema Extension for Social Features
export const userSchema = {
  id: 'string',
  username: 'string',
  email: 'string',
  displayName: 'string',
  avatar: 'string',
  bio: 'string',
  friends: ['userId1', 'userId2'], // Friend list
  friendRequests: ['userId1', 'userId2'], // Pending requests
  playlists: ['playlistId1', 'playlistId2'], // Owned playlists
  sharedPlaylists: ['playlistId1', 'playlistId2'], // Shared with user
  notifications: [], // Notification array
  preferences: {
    defaultPrivacy: 'private',
    allowFriendRequests: true,
    showOnlineStatus: true,
    emailNotifications: true,
    pushNotifications: true
  },
  createdAt: 'timestamp',
  lastActive: 'timestamp'
};

// Event in Playlist Schema
export const playlistEventSchema = {
  eventId: 'string',
  playlistId: 'string',
  addedBy: 'userId', // Who added this event
  addedAt: 'timestamp',
  order: 'number', // Position in playlist
  notes: 'string', // Optional notes about the event
  isFavorite: 'boolean' // Marked as favorite in this playlist
};

// Friend Request Schema
export const friendRequestSchema = {
  id: 'string',
  fromUser: 'userId',
  toUser: 'userId',
  message: 'string', // Optional message
  status: 'pending' | 'accepted' | 'declined',
  createdAt: 'timestamp',
  respondedAt: 'timestamp'
};

// Notification Schema
export const notificationSchema = {
  id: 'string',
  userId: 'string',
  type: 'friend_request' | 'playlist_shared' | 'playlist_updated' | 'event_added' | 'collaborator_added',
  title: 'string',
  message: 'string',
  data: {}, // Additional data (playlistId, userId, etc.)
  isRead: 'boolean',
  createdAt: 'timestamp',
  actionUrl: 'string' // URL to navigate to when clicked
};

// Share Link Schema
export const shareLinkSchema = {
  id: 'string',
  playlistId: 'string',
  createdBy: 'userId',
  token: 'string', // Unique share token
  expiresAt: 'timestamp', // Optional expiration
  maxUses: 'number', // Optional usage limit
  currentUses: 'number', // Current usage count
  requiresAuth: 'boolean', // Requires login to access
  allowCollaboration: 'boolean', // Can recipients edit
  createdAt: 'timestamp'
};

// Default Playlist Templates
export const defaultPlaylistTemplates = [
  {
    name: 'Weekend Adventures',
    description: 'Fun events for the weekend',
    tags: ['weekend', 'adventure', 'fun'],
    privacy: 'private',
    isCollaborative: false
  },
  {
    name: 'Date Night Ideas',
    description: 'Romantic events for couples',
    tags: ['date', 'romantic', 'couples'],
    privacy: 'private',
    isCollaborative: false
  },
  {
    name: 'Family Fun',
    description: 'Events suitable for the whole family',
    tags: ['family', 'kids', 'all-ages'],
    privacy: 'private',
    isCollaborative: true
  },
  {
    name: 'Work Events',
    description: 'Professional networking and work-related events',
    tags: ['work', 'networking', 'professional'],
    privacy: 'private',
    isCollaborative: false
  },
  {
    name: 'Fitness & Health',
    description: 'Health, fitness, and wellness events',
    tags: ['fitness', 'health', 'wellness'],
    privacy: 'public',
    isCollaborative: true
  }
];

// Privacy Levels
export const PRIVACY_LEVELS = {
  PRIVATE: 'private', // Only owner can see
  FRIENDS: 'friends', // Only friends can see
  PUBLIC: 'public', // Anyone can discover
  LINK: 'link' // Only accessible via share link
};

// Collaboration Permissions
export const COLLABORATION_PERMISSIONS = {
  VIEWER: 'viewer', // Can only view
  COLLABORATOR: 'collaborator', // Can add/remove events
  ADMIN: 'admin' // Can manage playlist settings
};

// Notification Types
export const NOTIFICATION_TYPES = {
  FRIEND_REQUEST: 'friend_request',
  PLAYLIST_SHARED: 'playlist_shared',
  PLAYLIST_UPDATED: 'playlist_updated',
  EVENT_ADDED: 'event_added',
  EVENT_REMOVED: 'event_removed',
  COLLABORATOR_ADDED: 'collaborator_added',
  COLLABORATOR_REMOVED: 'collaborator_removed',
  COMMENT_ADDED: 'comment_added'
};

// Utility Functions
export const createPlaylist = (name, description = '', privacy = 'private') => ({
  id: generateId(),
  name,
  description,
  events: [],
  owner: getCurrentUserId(),
  collaborators: [],
  viewers: [],
  privacy,
  tags: [],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  shareUrl: generateShareUrl(),
  isCollaborative: false,
  maxCollaborators: 10,
  allowComments: false,
  eventOrder: []
});

export const createFriendRequest = (toUser, message = '') => ({
  id: generateId(),
  fromUser: getCurrentUserId(),
  toUser,
  message,
  status: 'pending',
  createdAt: new Date().toISOString(),
  respondedAt: null
});

export const createNotification = (userId, type, title, message, data = {}) => ({
  id: generateId(),
  userId,
  type,
  title,
  message,
  data,
  isRead: false,
  createdAt: new Date().toISOString(),
  actionUrl: generateActionUrl(type, data)
});

// Helper Functions
const generateId = () => {
  return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
};

const generateShareUrl = () => {
  return `https://hyyper.co/playlist/${generateId()}`;
};

const getCurrentUserId = () => {
  // This would be replaced with actual user authentication
  return localStorage.getItem('userId') || 'anonymous';
};

const generateActionUrl = (type, data) => {
  switch (type) {
    case NOTIFICATION_TYPES.FRIEND_REQUEST:
      return '/friends';
    case NOTIFICATION_TYPES.PLAYLIST_SHARED:
      return `/playlist/${data.playlistId}`;
    case NOTIFICATION_TYPES.PLAYLIST_UPDATED:
      return `/playlist/${data.playlistId}`;
    default:
      return '/playlists';
  }
};

// Validation Functions
export const validatePlaylist = (playlist) => {
  const errors = [];
  
  if (!playlist.name || playlist.name.trim().length === 0) {
    errors.push('Playlist name is required');
  }
  
  if (playlist.name && playlist.name.length > 100) {
    errors.push('Playlist name must be less than 100 characters');
  }
  
  if (playlist.description && playlist.description.length > 500) {
    errors.push('Playlist description must be less than 500 characters');
  }
  
  if (!Object.values(PRIVACY_LEVELS).includes(playlist.privacy)) {
    errors.push('Invalid privacy level');
  }
  
  if (playlist.maxCollaborators && (playlist.maxCollaborators < 1 || playlist.maxCollaborators > 50)) {
    errors.push('Max collaborators must be between 1 and 50');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validateFriendRequest = (request) => {
  const errors = [];
  
  if (!request.toUser) {
    errors.push('Recipient is required');
  }
  
  if (request.fromUser === request.toUser) {
    errors.push('Cannot send friend request to yourself');
  }
  
  if (request.message && request.message.length > 200) {
    errors.push('Message must be less than 200 characters');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Export all schemas and utilities
export default {
  playlistSchema,
  userSchema,
  playlistEventSchema,
  friendRequestSchema,
  notificationSchema,
  shareLinkSchema,
  defaultPlaylistTemplates,
  PRIVACY_LEVELS,
  COLLABORATION_PERMISSIONS,
  NOTIFICATION_TYPES,
  createPlaylist,
  createFriendRequest,
  createNotification,
  validatePlaylist,
  validateFriendRequest
};
