// Mock event data for Event Discovery Mapbox integration
// Coordinates are centered around NYC area for demonstration

export const MOCK_EVENTS = [
  {
    id: 'event-001',
    name: 'Tech Innovation Meetup',
    categoryPrimary: 'Professional',
    categorySecondary: 'Technology',
    time: 'Evening',
    day: 'Wednesday',
    date: '2025-10-15',
    coordinates: [-74.0060, 40.7128], // NYC coordinates
    description: 'Monthly tech meetup featuring AI and machine learning discussions',
    venue: 'Tech Hub NYC',
    price: 'Free',
    attendees: 45,
    organizer: 'NYC Tech Community'
  },
  {
    id: 'event-002',
    name: 'Morning Yoga in the Park',
    categoryPrimary: 'Recreation',
    categorySecondary: 'Fitness',
    time: 'Morning',
    day: 'Saturday',
    date: '2025-10-18',
    coordinates: [-74.0059, 40.7589], // Central Park
    description: 'Outdoor yoga session in Central Park',
    venue: 'Central Park - Sheep Meadow',
    price: '$15',
    attendees: 25,
    organizer: 'NYC Yoga Collective'
  },
  {
    id: 'event-003',
    name: 'Art Gallery Opening',
    categoryPrimary: 'Education',
    categorySecondary: 'Arts',
    time: 'Evening',
    day: 'Friday',
    date: '2025-10-17',
    coordinates: [-74.0080, 40.7505], // Chelsea area
    description: 'Contemporary art exhibition opening with local artists',
    venue: 'Chelsea Gallery District',
    price: '$25',
    attendees: 80,
    organizer: 'NYC Arts Collective'
  },
  {
    id: 'event-004',
    name: 'Community Networking Brunch',
    categoryPrimary: 'Social',
    categorySecondary: 'Networking',
    time: 'Morning',
    day: 'Sunday',
    date: '2025-10-19',
    coordinates: [-74.0020, 40.7282], // SoHo area
    description: 'Professional networking brunch for local entrepreneurs',
    venue: 'SoHo House',
    price: '$35',
    attendees: 60,
    organizer: 'NYC Entrepreneurs Network'
  },
  {
    id: 'event-005',
    name: 'Basketball Tournament',
    categoryPrimary: 'Recreation',
    categorySecondary: 'Sports',
    time: 'Afternoon',
    day: 'Saturday',
    date: '2025-10-18',
    coordinates: [-74.0100, 40.7500], // West Village
    description: '3v3 basketball tournament for all skill levels',
    venue: 'West Village Courts',
    price: '$20',
    attendees: 32,
    organizer: 'NYC Basketball League'
  },
  {
    id: 'event-006',
    name: 'Coding Workshop: React Basics',
    categoryPrimary: 'Education',
    categorySecondary: 'Technology',
    time: 'Afternoon',
    day: 'Saturday',
    date: '2025-10-18',
    coordinates: [-74.0040, 40.7200], // Lower Manhattan
    description: 'Learn React fundamentals in this hands-on workshop',
    venue: 'Tech Academy NYC',
    price: '$50',
    attendees: 20,
    organizer: 'NYC Code Academy'
  },
  {
    id: 'event-007',
    name: 'Food Truck Festival',
    categoryPrimary: 'Social',
    categorySecondary: 'Food',
    time: 'Evening',
    day: 'Friday',
    date: '2025-10-17',
    coordinates: [-74.0120, 40.7400], // Union Square area
    description: 'Local food trucks showcasing diverse cuisines',
    venue: 'Union Square Park',
    price: 'Free',
    attendees: 150,
    organizer: 'NYC Food Truck Association'
  },
  {
    id: 'event-008',
    name: 'Business Strategy Seminar',
    categoryPrimary: 'Professional',
    categorySecondary: 'Business',
    time: 'Morning',
    day: 'Tuesday',
    date: '2025-10-14',
    coordinates: [-74.0060, 40.7050], // Financial District
    description: 'Advanced business strategy for growing companies',
    venue: 'Financial District Conference Center',
    price: '$75',
    attendees: 40,
    organizer: 'NYC Business Leaders'
  },
  {
    id: 'event-009',
    name: 'Jazz Night at the Lounge',
    categoryPrimary: 'Social',
    categorySecondary: 'Music',
    time: 'Evening',
    day: 'Thursday',
    date: '2025-10-16',
    coordinates: [-74.0080, 40.7300], // Greenwich Village
    description: 'Live jazz performance with local musicians',
    venue: 'Blue Note Jazz Club',
    price: '$30',
    attendees: 90,
    organizer: 'NYC Jazz Society'
  },
  {
    id: 'event-010',
    name: 'Morning Run Club',
    categoryPrimary: 'Recreation',
    categorySecondary: 'Fitness',
    time: 'Morning',
    day: 'Monday',
    date: '2025-10-13',
    coordinates: [-74.0050, 40.7600], // Upper East Side
    description: 'Group running session along the East River',
    venue: 'East River Park',
    price: 'Free',
    attendees: 15,
    organizer: 'NYC Running Club'
  },
  {
    id: 'event-011',
    name: 'Photography Workshop',
    categoryPrimary: 'Education',
    categorySecondary: 'Arts',
    time: 'Afternoon',
    day: 'Sunday',
    date: '2025-10-19',
    coordinates: [-74.0020, 40.7500], // Meatpacking District
    description: 'Street photography techniques and composition',
    venue: 'High Line Park',
    price: '$40',
    attendees: 12,
    organizer: 'NYC Photography Guild'
  },
  {
    id: 'event-012',
    name: 'Startup Pitch Night',
    categoryPrimary: 'Professional',
    categorySecondary: 'Entrepreneurship',
    time: 'Evening',
    day: 'Monday',
    date: '2025-10-13',
    coordinates: [-74.0100, 40.7200], // Tribeca
    description: 'Early-stage startups pitch to investors',
    venue: 'Tribeca Innovation Hub',
    price: '$25',
    attendees: 75,
    organizer: 'NYC Startup Accelerator'
  }
];

// Helper function to get category color for map markers
export const getCategoryColor = (category) => {
  const colors = {
    'Social': '#FF6B6B',      // Red
    'Education': '#4ECDC4',   // Teal
    'Recreation': '#45B7D1',  // Blue
    'Professional': '#96CEB4' // Green
  };
  return colors[category] || '#FF6B6B';
};

// Helper function to filter events by criteria
export const filterEvents = (events, filters) => {
  return events.filter(event => {
    const timeMatch = filters.time === 'All' || event.time === filters.time;
    const dayMatch = filters.day === 'All' || event.day === filters.day;
    const categoryMatch = filters.category === 'All' || event.categoryPrimary === filters.category;
    
    return timeMatch && dayMatch && categoryMatch;
  });
};

// Default filter state
export const DEFAULT_FILTERS = {
  time: 'All',
  day: 'Today',
  category: 'All'
};

// Filter options
export const FILTER_OPTIONS = {
  time: ['All', 'Morning', 'Afternoon', 'Evening', 'Night'],
  day: ['All', 'Today', 'Tomorrow', 'This Week', 'Weekend'],
  category: ['All', 'Social', 'Education', 'Recreation', 'Professional']
};
