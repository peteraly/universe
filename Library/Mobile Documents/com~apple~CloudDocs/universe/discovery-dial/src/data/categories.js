export const CATEGORIES = [
  { 
    key: 'social', 
    label: 'Social & Community',
    sub: ['Parties', 'Festivals', 'Networking', 'Volunteer', 'Local'] 
  },
  { 
    key: 'education', 
    label: 'Educational & Learning',
    sub: ['Workshops', 'Lectures', 'Seminars', 'Book Clubs', 'Hackathons'] 
  },
  { 
    key: 'recreation', 
    label: 'Recreational & Leisure',
    sub: ['Sports', 'Arts', 'Music', 'Outdoors', 'Gaming'] 
  },
  { 
    key: 'professional', 
    label: 'Professional & Work-Related',
    sub: ['Conferences', 'Trade Shows', 'Panels', 'Mixers', 'Launches'] 
  },
];

// Map to compass positions (N, E, S, W clockwise)
export const CATEGORY_ORDER = ['social', 'education', 'recreation', 'professional'];

// Compass direction mapping
export const COMPASS_DIRECTIONS = {
  N: 0,    // North - Social
  E: 90,   // East - Educational  
  S: 180,  // South - Recreational
  W: 270   // West - Professional
};

// Category icons for display
export const CATEGORY_ICONS = {
  social: '🎉',
  education: '📚',
  recreation: '🎵',
  professional: '💼'
};


