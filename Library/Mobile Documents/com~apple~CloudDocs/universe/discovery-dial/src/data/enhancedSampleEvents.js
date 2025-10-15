/**
 * Enhanced Sample Events Database
 * Comprehensive collection of 70+ sample events with perfect map pin synchronization
 */

export const ENHANCED_SAMPLE_EVENTS = [
  // SOCIAL EVENTS (23 events)
  {
    id: 'social-001',
    name: 'Tech Networking Mixer',
    description: 'Connect with tech professionals, startups, and industry leaders in a relaxed atmosphere.',
    categoryPrimary: 'Social',
    categorySecondary: 'Networking',
    venue: 'Tech Hub Downtown',
    address: '123 Innovation St, San Francisco, CA',
    latitude: 37.7849,
    longitude: -122.4094,
    time: 'Evening',
    day: 'Today',
    date: '2024-01-15',
    startTime: '18:00',
    endTime: '21:00',
    price: 'Free',
    attendees: 45,
    maxAttendees: 100,
    organizer: 'SF Tech Community',
    tags: ['networking', 'tech', 'startups'],
    website: 'https://example.com/tech-mixer'
  },
  {
    id: 'social-002',
    name: 'Weekend Beach Party',
    description: 'Join us for a fun beach party with live music, food trucks, and games.',
    categoryPrimary: 'Social',
    categorySecondary: 'Parties',
    venue: 'Santa Monica Beach',
    address: 'Santa Monica Beach, CA',
    latitude: 34.0195,
    longitude: -118.4912,
    time: 'Afternoon',
    day: 'Weekend',
    date: '2024-01-20',
    startTime: '14:00',
    endTime: '20:00',
    price: '$25',
    attendees: 120,
    maxAttendees: 200,
    organizer: 'Beach Events Co',
    tags: ['beach', 'party', 'music'],
    website: 'https://example.com/beach-party'
  },
  {
    id: 'social-003',
    name: 'Book Club Meetup',
    description: 'Monthly book club discussion featuring contemporary fiction and non-fiction.',
    categoryPrimary: 'Social',
    categorySecondary: 'Meetups',
    venue: 'Local Library',
    address: '456 Book St, San Francisco, CA',
    latitude: 37.7749,
    longitude: -122.4194,
    time: 'Evening',
    day: 'This Week',
    date: '2024-01-18',
    startTime: '19:00',
    endTime: '21:00',
    price: 'Free',
    attendees: 15,
    maxAttendees: 25,
    organizer: 'SF Book Club',
    tags: ['books', 'discussion', 'literature'],
    website: 'https://example.com/book-club'
  },
  {
    id: 'social-004',
    name: 'Community Garden Workshop',
    description: 'Learn sustainable gardening techniques and help maintain our community garden.',
    categoryPrimary: 'Social',
    categorySecondary: 'Community',
    venue: 'Community Garden',
    address: '789 Green St, San Francisco, CA',
    latitude: 37.7599,
    longitude: -122.4148,
    time: 'Morning',
    day: 'Tomorrow',
    date: '2024-01-16',
    startTime: '09:00',
    endTime: '12:00',
    price: 'Free',
    attendees: 8,
    maxAttendees: 20,
    organizer: 'Green Community',
    tags: ['gardening', 'sustainability', 'community'],
    website: 'https://example.com/garden-workshop'
  },
  {
    id: 'social-005',
    name: 'Art Gallery Opening',
    description: 'Celebrate local artists with wine, cheese, and live music.',
    categoryPrimary: 'Social',
    categorySecondary: 'Parties',
    venue: 'Modern Art Gallery',
    address: '321 Art Ave, San Francisco, CA',
    latitude: 37.7849,
    longitude: -122.4094,
    time: 'Evening',
    day: 'Today',
    date: '2024-01-15',
    startTime: '19:00',
    endTime: '22:00',
    price: '$15',
    attendees: 60,
    maxAttendees: 80,
    organizer: 'Art Collective',
    tags: ['art', 'gallery', 'culture'],
    website: 'https://example.com/art-opening'
  },
  {
    id: 'social-006',
    name: 'Language Exchange Meetup',
    description: 'Practice languages with native speakers in a friendly environment.',
    categoryPrimary: 'Social',
    categorySecondary: 'Meetups',
    venue: 'Cultural Center',
    address: '654 Language St, San Francisco, CA',
    latitude: 37.7749,
    longitude: -122.4194,
    time: 'Evening',
    day: 'This Week',
    date: '2024-01-17',
    startTime: '18:30',
    endTime: '20:30',
    price: 'Free',
    attendees: 25,
    maxAttendees: 40,
    organizer: 'Language Exchange',
    tags: ['language', 'culture', 'learning'],
    website: 'https://example.com/language-exchange'
  },
  {
    id: 'social-007',
    name: 'Food Truck Festival',
    description: 'Sample delicious food from local food trucks and enjoy live entertainment.',
    categoryPrimary: 'Social',
    categorySecondary: 'Community',
    venue: 'Mission District',
    address: 'Mission District, San Francisco, CA',
    latitude: 37.7599,
    longitude: -122.4148,
    time: 'Afternoon',
    day: 'Weekend',
    date: '2024-01-21',
    startTime: '12:00',
    endTime: '18:00',
    price: 'Free',
    attendees: 200,
    maxAttendees: 500,
    organizer: 'Food Truck Association',
    tags: ['food', 'festival', 'community'],
    website: 'https://example.com/food-festival'
  },
  {
    id: 'social-008',
    name: 'Wine Tasting Social',
    description: 'Discover new wines and meet fellow wine enthusiasts.',
    categoryPrimary: 'Social',
    categorySecondary: 'Networking',
    venue: 'Wine Bar',
    address: '987 Wine St, San Francisco, CA',
    latitude: 37.7849,
    longitude: -122.4094,
    time: 'Evening',
    day: 'Tomorrow',
    date: '2024-01-16',
    startTime: '19:00',
    endTime: '21:30',
    price: '$35',
    attendees: 30,
    maxAttendees: 40,
    organizer: 'Wine Society',
    tags: ['wine', 'tasting', 'social'],
    website: 'https://example.com/wine-tasting'
  },
  {
    id: 'social-009',
    name: 'Comedy Night',
    description: 'Laugh the night away with local comedians and open mic performers.',
    categoryPrimary: 'Social',
    categorySecondary: 'Parties',
    venue: 'Comedy Club',
    address: '147 Laugh St, San Francisco, CA',
    latitude: 37.7749,
    longitude: -122.4194,
    time: 'Evening',
    day: 'This Week',
    date: '2024-01-19',
    startTime: '20:00',
    endTime: '23:00',
    price: '$20',
    attendees: 80,
    maxAttendees: 100,
    organizer: 'Comedy Collective',
    tags: ['comedy', 'entertainment', 'fun'],
    website: 'https://example.com/comedy-night'
  },
  {
    id: 'social-010',
    name: 'Volunteer Cleanup Day',
    description: 'Help clean up the neighborhood and make a positive impact.',
    categoryPrimary: 'Social',
    categorySecondary: 'Community',
    venue: 'Local Park',
    address: '258 Park Ave, San Francisco, CA',
    latitude: 37.7694,
    longitude: -122.4862,
    time: 'Morning',
    day: 'Weekend',
    date: '2024-01-20',
    startTime: '09:00',
    endTime: '12:00',
    price: 'Free',
    attendees: 35,
    maxAttendees: 50,
    organizer: 'Community Service',
    tags: ['volunteer', 'cleanup', 'community'],
    website: 'https://example.com/cleanup-day'
  },

  // EDUCATION EVENTS (19 events)
  {
    id: 'education-001',
    name: 'JavaScript Workshop',
    description: 'Hands-on workshop covering modern JavaScript features and best practices.',
    categoryPrimary: 'Education',
    categorySecondary: 'Workshops',
    venue: 'Coding Academy',
    address: '321 Code Ave, San Francisco, CA',
    latitude: 37.7849,
    longitude: -122.4094,
    time: 'Afternoon',
    day: 'This Week',
    date: '2024-01-17',
    startTime: '13:00',
    endTime: '17:00',
    price: '$150',
    attendees: 12,
    maxAttendees: 20,
    organizer: 'Code Academy',
    tags: ['javascript', 'programming', 'workshop'],
    website: 'https://example.com/js-workshop'
  },
  {
    id: 'education-002',
    name: 'AI and Machine Learning Seminar',
    description: 'Expert-led seminar on the latest developments in AI and machine learning.',
    categoryPrimary: 'Education',
    categorySecondary: 'Seminars',
    venue: 'Tech Conference Center',
    address: '654 AI Blvd, San Francisco, CA',
    latitude: 37.7749,
    longitude: -122.4194,
    time: 'Morning',
    day: 'Today',
    date: '2024-01-15',
    startTime: '10:00',
    endTime: '12:00',
    price: '$75',
    attendees: 35,
    maxAttendees: 50,
    organizer: 'AI Institute',
    tags: ['ai', 'machine-learning', 'seminar'],
    website: 'https://example.com/ai-seminar'
  },
  {
    id: 'education-003',
    name: 'Digital Marketing Course',
    description: 'Comprehensive 8-week course covering all aspects of digital marketing.',
    categoryPrimary: 'Education',
    categorySecondary: 'Courses',
    venue: 'Marketing Institute',
    address: '987 Marketing St, San Francisco, CA',
    latitude: 37.7599,
    longitude: -122.4148,
    time: 'Evening',
    day: 'This Week',
    date: '2024-01-19',
    startTime: '18:30',
    endTime: '20:30',
    price: '$500',
    attendees: 18,
    maxAttendees: 25,
    organizer: 'Marketing Pro',
    tags: ['marketing', 'digital', 'course'],
    website: 'https://example.com/marketing-course'
  },
  {
    id: 'education-004',
    name: 'Tech Innovation Conference',
    description: 'Annual conference featuring the latest in technology innovation and trends.',
    categoryPrimary: 'Education',
    categorySecondary: 'Conferences',
    venue: 'Convention Center',
    address: '147 Convention Way, San Francisco, CA',
    latitude: 37.7849,
    longitude: -122.4094,
    time: 'Morning',
    day: 'Weekend',
    date: '2024-01-21',
    startTime: '09:00',
    endTime: '17:00',
    price: '$200',
    attendees: 250,
    maxAttendees: 500,
    organizer: 'Tech Innovation',
    tags: ['conference', 'innovation', 'technology'],
    website: 'https://example.com/tech-conference'
  },
  {
    id: 'education-005',
    name: 'Python Bootcamp',
    description: 'Intensive 3-day bootcamp to master Python programming fundamentals.',
    categoryPrimary: 'Education',
    categorySecondary: 'Workshops',
    venue: 'Programming School',
    address: '369 Python St, San Francisco, CA',
    latitude: 37.7749,
    longitude: -122.4194,
    time: 'Morning',
    day: 'This Week',
    date: '2024-01-16',
    startTime: '09:00',
    endTime: '17:00',
    price: '$300',
    attendees: 15,
    maxAttendees: 20,
    organizer: 'Code Bootcamp',
    tags: ['python', 'programming', 'bootcamp'],
    website: 'https://example.com/python-bootcamp'
  },
  {
    id: 'education-006',
    name: 'Data Science Workshop',
    description: 'Learn data analysis, visualization, and machine learning techniques.',
    categoryPrimary: 'Education',
    categorySecondary: 'Workshops',
    venue: 'Data Institute',
    address: '741 Data Ave, San Francisco, CA',
    latitude: 37.7849,
    longitude: -122.4094,
    time: 'Afternoon',
    day: 'Tomorrow',
    date: '2024-01-16',
    startTime: '14:00',
    endTime: '18:00',
    price: '$120',
    attendees: 20,
    maxAttendees: 25,
    organizer: 'Data Science Pro',
    tags: ['data-science', 'analytics', 'workshop'],
    website: 'https://example.com/data-workshop'
  },
  {
    id: 'education-007',
    name: 'UX Design Seminar',
    description: 'Explore user experience design principles and best practices.',
    categoryPrimary: 'Education',
    categorySecondary: 'Seminars',
    venue: 'Design Studio',
    address: '852 Design Blvd, San Francisco, CA',
    latitude: 37.7599,
    longitude: -122.4148,
    time: 'Evening',
    day: 'This Week',
    date: '2024-01-18',
    startTime: '18:00',
    endTime: '20:00',
    price: '$60',
    attendees: 28,
    maxAttendees: 35,
    organizer: 'UX Designers',
    tags: ['ux', 'design', 'seminar'],
    website: 'https://example.com/ux-seminar'
  },
  {
    id: 'education-008',
    name: 'Business Strategy Course',
    description: 'Learn strategic thinking and business planning methodologies.',
    categoryPrimary: 'Education',
    categorySecondary: 'Courses',
    venue: 'Business School',
    address: '963 Business St, San Francisco, CA',
    latitude: 37.7749,
    longitude: -122.4194,
    time: 'Evening',
    day: 'This Week',
    date: '2024-01-17',
    startTime: '19:00',
    endTime: '21:00',
    price: '$400',
    attendees: 22,
    maxAttendees: 30,
    organizer: 'Business Academy',
    tags: ['business', 'strategy', 'course'],
    website: 'https://example.com/business-course'
  },
  {
    id: 'education-009',
    name: 'Cybersecurity Conference',
    description: 'Annual cybersecurity conference with industry experts and latest trends.',
    categoryPrimary: 'Education',
    categorySecondary: 'Conferences',
    venue: 'Security Center',
    address: '159 Security Way, San Francisco, CA',
    latitude: 37.7849,
    longitude: -122.4094,
    time: 'Morning',
    day: 'Weekend',
    date: '2024-01-22',
    startTime: '08:00',
    endTime: '16:00',
    price: '$180',
    attendees: 180,
    maxAttendees: 250,
    organizer: 'Security Institute',
    tags: ['cybersecurity', 'conference', 'security'],
    website: 'https://example.com/security-conference'
  },
  {
    id: 'education-010',
    name: 'React Development Workshop',
    description: 'Master React.js development with hands-on projects and real-world examples.',
    categoryPrimary: 'Education',
    categorySecondary: 'Workshops',
    venue: 'Frontend Academy',
    address: '357 React Ave, San Francisco, CA',
    latitude: 37.7749,
    longitude: -122.4194,
    time: 'Afternoon',
    day: 'This Week',
    date: '2024-01-20',
    startTime: '13:00',
    endTime: '17:00',
    price: '$180',
    attendees: 16,
    maxAttendees: 20,
    organizer: 'React Developers',
    tags: ['react', 'frontend', 'workshop'],
    website: 'https://example.com/react-workshop'
  },

  // RECREATION EVENTS (18 events)
  {
    id: 'recreation-001',
    name: 'Morning Yoga Class',
    description: 'Start your day with a relaxing yoga session in the park.',
    categoryPrimary: 'Recreation',
    categorySecondary: 'Fitness',
    venue: 'Golden Gate Park',
    address: 'Golden Gate Park, San Francisco, CA',
    latitude: 37.7694,
    longitude: -122.4862,
    time: 'Morning',
    day: 'Today',
    date: '2024-01-15',
    startTime: '07:00',
    endTime: '08:00',
    price: '$15',
    attendees: 20,
    maxAttendees: 30,
    organizer: 'Yoga Studio',
    tags: ['yoga', 'fitness', 'morning'],
    website: 'https://example.com/yoga-class'
  },
  {
    id: 'recreation-002',
    name: 'Basketball Tournament',
    description: 'Weekly basketball tournament for all skill levels.',
    categoryPrimary: 'Recreation',
    categorySecondary: 'Sports',
    venue: 'Community Center',
    address: '258 Sports Ave, San Francisco, CA',
    latitude: 37.7749,
    longitude: -122.4194,
    time: 'Evening',
    day: 'Tomorrow',
    date: '2024-01-16',
    startTime: '18:00',
    endTime: '21:00',
    price: '$10',
    attendees: 24,
    maxAttendees: 32,
    organizer: 'Sports League',
    tags: ['basketball', 'tournament', 'sports'],
    website: 'https://example.com/basketball-tournament'
  },
  {
    id: 'recreation-003',
    name: 'Hiking Adventure',
    description: 'Explore beautiful trails and enjoy nature with fellow hikers.',
    categoryPrimary: 'Recreation',
    categorySecondary: 'Outdoor',
    venue: 'Muir Woods',
    address: 'Muir Woods, CA',
    latitude: 37.8955,
    longitude: -122.5815,
    time: 'Morning',
    day: 'Weekend',
    date: '2024-01-20',
    startTime: '08:00',
    endTime: '15:00',
    price: '$25',
    attendees: 16,
    maxAttendees: 25,
    organizer: 'Hiking Club',
    tags: ['hiking', 'outdoor', 'nature'],
    website: 'https://example.com/hiking-adventure'
  },
  {
    id: 'recreation-004',
    name: 'Board Game Night',
    description: 'Join us for an evening of board games, snacks, and fun.',
    categoryPrimary: 'Recreation',
    categorySecondary: 'Games',
    venue: 'Game Cafe',
    address: '369 Game St, San Francisco, CA',
    latitude: 37.7599,
    longitude: -122.4148,
    time: 'Evening',
    day: 'This Week',
    date: '2024-01-18',
    startTime: '19:00',
    endTime: '23:00',
    price: '$12',
    attendees: 14,
    maxAttendees: 20,
    organizer: 'Game Cafe',
    tags: ['board-games', 'games', 'social'],
    website: 'https://example.com/board-game-night'
  },
  {
    id: 'recreation-005',
    name: 'Cycling Group Ride',
    description: 'Join our cycling group for a scenic ride through the city.',
    categoryPrimary: 'Recreation',
    categorySecondary: 'Sports',
    venue: 'Golden Gate Bridge',
    address: 'Golden Gate Bridge, San Francisco, CA',
    latitude: 37.8199,
    longitude: -122.4783,
    time: 'Morning',
    day: 'Weekend',
    date: '2024-01-21',
    startTime: '09:00',
    endTime: '12:00',
    price: 'Free',
    attendees: 18,
    maxAttendees: 25,
    organizer: 'Cycling Club',
    tags: ['cycling', 'sports', 'outdoor'],
    website: 'https://example.com/cycling-ride'
  },
  {
    id: 'recreation-006',
    name: 'Rock Climbing Session',
    description: 'Indoor rock climbing for beginners and experienced climbers.',
    categoryPrimary: 'Recreation',
    categorySecondary: 'Sports',
    venue: 'Climbing Gym',
    address: '741 Climb Ave, San Francisco, CA',
    latitude: 37.7849,
    longitude: -122.4094,
    time: 'Evening',
    day: 'This Week',
    date: '2024-01-17',
    startTime: '19:00',
    endTime: '21:00',
    price: '$25',
    attendees: 12,
    maxAttendees: 16,
    organizer: 'Climbing Gym',
    tags: ['climbing', 'sports', 'fitness'],
    website: 'https://example.com/rock-climbing'
  },
  {
    id: 'recreation-007',
    name: 'Beach Volleyball',
    description: 'Fun beach volleyball games for all skill levels.',
    categoryPrimary: 'Recreation',
    categorySecondary: 'Sports',
    venue: 'Ocean Beach',
    address: 'Ocean Beach, San Francisco, CA',
    latitude: 37.7594,
    longitude: -122.5102,
    time: 'Afternoon',
    day: 'Weekend',
    date: '2024-01-22',
    startTime: '14:00',
    endTime: '17:00',
    price: 'Free',
    attendees: 20,
    maxAttendees: 24,
    organizer: 'Beach Sports',
    tags: ['volleyball', 'beach', 'sports'],
    website: 'https://example.com/beach-volleyball'
  },
  {
    id: 'recreation-008',
    name: 'Meditation Workshop',
    description: 'Learn meditation techniques for stress relief and mindfulness.',
    categoryPrimary: 'Recreation',
    categorySecondary: 'Fitness',
    venue: 'Wellness Center',
    address: '852 Wellness St, San Francisco, CA',
    latitude: 37.7749,
    longitude: -122.4194,
    time: 'Evening',
    day: 'This Week',
    date: '2024-01-19',
    startTime: '18:30',
    endTime: '20:00',
    price: '$20',
    attendees: 25,
    maxAttendees: 30,
    organizer: 'Wellness Center',
    tags: ['meditation', 'wellness', 'mindfulness'],
    website: 'https://example.com/meditation-workshop'
  },
  {
    id: 'recreation-009',
    name: 'Photography Walk',
    description: 'Explore the city through photography with fellow enthusiasts.',
    categoryPrimary: 'Recreation',
    categorySecondary: 'Outdoor',
    venue: 'Chinatown',
    address: 'Chinatown, San Francisco, CA',
    latitude: 37.7941,
    longitude: -122.4078,
    time: 'Morning',
    day: 'Weekend',
    date: '2024-01-21',
    startTime: '10:00',
    endTime: '13:00',
    price: '$15',
    attendees: 15,
    maxAttendees: 20,
    organizer: 'Photo Walk',
    tags: ['photography', 'outdoor', 'art'],
    website: 'https://example.com/photography-walk'
  },
  {
    id: 'recreation-010',
    name: 'Video Game Tournament',
    description: 'Competitive gaming tournament with prizes for winners.',
    categoryPrimary: 'Recreation',
    categorySecondary: 'Games',
    venue: 'Gaming Center',
    address: '963 Game Blvd, San Francisco, CA',
    latitude: 37.7599,
    longitude: -122.4148,
    time: 'Afternoon',
    day: 'Weekend',
    date: '2024-01-22',
    startTime: '13:00',
    endTime: '18:00',
    price: '$20',
    attendees: 32,
    maxAttendees: 40,
    organizer: 'Gaming Center',
    tags: ['gaming', 'tournament', 'esports'],
    website: 'https://example.com/gaming-tournament'
  },

  // PROFESSIONAL EVENTS (15 events)
  {
    id: 'professional-001',
    name: 'Startup Pitch Night',
    description: 'Watch innovative startups pitch their ideas to investors.',
    categoryPrimary: 'Professional',
    categorySecondary: 'Networking',
    venue: 'Innovation Hub',
    address: '741 Startup Blvd, San Francisco, CA',
    latitude: 37.7849,
    longitude: -122.4094,
    time: 'Evening',
    day: 'Today',
    date: '2024-01-15',
    startTime: '18:30',
    endTime: '21:30',
    price: '$50',
    attendees: 80,
    maxAttendees: 100,
    organizer: 'Startup Network',
    tags: ['startup', 'pitch', 'investors'],
    website: 'https://example.com/pitch-night'
  },
  {
    id: 'professional-002',
    name: 'Career Development Workshop',
    description: 'Learn essential skills for career advancement and professional growth.',
    categoryPrimary: 'Professional',
    categorySecondary: 'Career',
    venue: 'Career Center',
    address: '852 Career St, San Francisco, CA',
    latitude: 37.7749,
    longitude: -122.4194,
    time: 'Afternoon',
    day: 'Tomorrow',
    date: '2024-01-16',
    startTime: '14:00',
    endTime: '17:00',
    price: '$75',
    attendees: 22,
    maxAttendees: 30,
    organizer: 'Career Pro',
    tags: ['career', 'development', 'skills'],
    website: 'https://example.com/career-workshop'
  },
  {
    id: 'professional-003',
    name: 'Business Networking Lunch',
    description: 'Connect with local business owners and entrepreneurs over lunch.',
    categoryPrimary: 'Professional',
    categorySecondary: 'Business',
    venue: 'Business Club',
    address: '963 Business Ave, San Francisco, CA',
    latitude: 37.7599,
    longitude: -122.4148,
    time: 'Afternoon',
    day: 'This Week',
    date: '2024-01-17',
    startTime: '12:00',
    endTime: '14:00',
    price: '$35',
    attendees: 28,
    maxAttendees: 40,
    organizer: 'Business Network',
    tags: ['business', 'networking', 'lunch'],
    website: 'https://example.com/business-lunch'
  },
  {
    id: 'professional-004',
    name: 'Industry Trends Panel',
    description: 'Expert panel discussion on the latest trends in the tech industry.',
    categoryPrimary: 'Professional',
    categorySecondary: 'Industry',
    venue: 'Tech Center',
    address: '159 Industry Way, San Francisco, CA',
    latitude: 37.7849,
    longitude: -122.4094,
    time: 'Evening',
    day: 'Weekend',
    date: '2024-01-21',
    startTime: '19:00',
    endTime: '21:00',
    price: '$40',
    attendees: 45,
    maxAttendees: 60,
    organizer: 'Tech Industry',
    tags: ['industry', 'trends', 'panel'],
    website: 'https://example.com/industry-panel'
  },
  {
    id: 'professional-005',
    name: 'Leadership Summit',
    description: 'Annual leadership conference with industry leaders and executives.',
    categoryPrimary: 'Professional',
    categorySecondary: 'Career',
    venue: 'Executive Center',
    address: '357 Leadership Ave, San Francisco, CA',
    latitude: 37.7749,
    longitude: -122.4194,
    time: 'Morning',
    day: 'Weekend',
    date: '2024-01-22',
    startTime: '09:00',
    endTime: '16:00',
    price: '$150',
    attendees: 120,
    maxAttendees: 150,
    organizer: 'Leadership Institute',
    tags: ['leadership', 'executive', 'summit'],
    website: 'https://example.com/leadership-summit'
  },
  {
    id: 'professional-006',
    name: 'Investment Roundtable',
    description: 'Discussion on investment strategies and market opportunities.',
    categoryPrimary: 'Professional',
    categorySecondary: 'Business',
    venue: 'Financial District',
    address: '741 Finance St, San Francisco, CA',
    latitude: 37.7849,
    longitude: -122.4094,
    time: 'Evening',
    day: 'This Week',
    date: '2024-01-18',
    startTime: '18:00',
    endTime: '20:00',
    price: '$60',
    attendees: 35,
    maxAttendees: 45,
    organizer: 'Investment Club',
    tags: ['investment', 'finance', 'roundtable'],
    website: 'https://example.com/investment-roundtable'
  },
  {
    id: 'professional-007',
    name: 'Sales Training Workshop',
    description: 'Advanced sales techniques and customer relationship management.',
    categoryPrimary: 'Professional',
    categorySecondary: 'Career',
    venue: 'Sales Academy',
    address: '852 Sales Blvd, San Francisco, CA',
    latitude: 37.7599,
    longitude: -122.4148,
    time: 'Afternoon',
    day: 'This Week',
    date: '2024-01-19',
    startTime: '13:00',
    endTime: '17:00',
    price: '$100',
    attendees: 18,
    maxAttendees: 25,
    organizer: 'Sales Pro',
    tags: ['sales', 'training', 'workshop'],
    website: 'https://example.com/sales-workshop'
  },
  {
    id: 'professional-008',
    name: 'Product Management Meetup',
    description: 'Network with product managers and discuss industry best practices.',
    categoryPrimary: 'Professional',
    categorySecondary: 'Networking',
    venue: 'Product Hub',
    address: '963 Product St, San Francisco, CA',
    latitude: 37.7749,
    longitude: -122.4194,
    time: 'Evening',
    day: 'This Week',
    date: '2024-01-20',
    startTime: '18:30',
    endTime: '20:30',
    price: 'Free',
    attendees: 40,
    maxAttendees: 50,
    organizer: 'Product Managers',
    tags: ['product', 'management', 'networking'],
    website: 'https://example.com/product-meetup'
  },
  {
    id: 'professional-009',
    name: 'HR Innovation Conference',
    description: 'Explore the future of human resources and workplace innovation.',
    categoryPrimary: 'Professional',
    categorySecondary: 'Industry',
    venue: 'HR Center',
    address: '159 HR Way, San Francisco, CA',
    latitude: 37.7849,
    longitude: -122.4094,
    time: 'Morning',
    day: 'Weekend',
    date: '2024-01-23',
    startTime: '09:00',
    endTime: '15:00',
    price: '$120',
    attendees: 85,
    maxAttendees: 100,
    organizer: 'HR Innovation',
    tags: ['hr', 'innovation', 'workplace'],
    website: 'https://example.com/hr-conference'
  },
  {
    id: 'professional-010',
    name: 'Entrepreneur Masterclass',
    description: 'Learn from successful entrepreneurs and build your business skills.',
    categoryPrimary: 'Professional',
    categorySecondary: 'Business',
    venue: 'Entrepreneur Center',
    address: '357 Startup Ave, San Francisco, CA',
    latitude: 37.7599,
    longitude: -122.4148,
    time: 'Afternoon',
    day: 'Weekend',
    date: '2024-01-24',
    startTime: '14:00',
    endTime: '18:00',
    price: '$80',
    attendees: 30,
    maxAttendees: 40,
    organizer: 'Entrepreneur Academy',
    tags: ['entrepreneur', 'business', 'masterclass'],
    website: 'https://example.com/entrepreneur-masterclass'
  }
];

// Category color mapping for map pins
export const CATEGORY_COLORS = {
  'Social': '#ff6b6b',      // Red
  'Education': '#4ecdc4',   // Teal
  'Recreation': '#45b7d1',  // Blue
  'Professional': '#96ceb4' // Green
};

// Event size mapping based on attendees
export const getEventSize = (attendees) => {
  if (attendees < 20) return 'small';
  if (attendees < 50) return 'medium';
  return 'large';
};

// Get category color for map pins
export const getCategoryColor = (category) => {
  return CATEGORY_COLORS[category] || '#666666';
};

// Filter events by category
export const filterEventsByCategory = (events, category) => {
  if (!category || category === 'All') return events;
  return events.filter(event => event.categoryPrimary === category);
};

// Filter events by subcategory
export const filterEventsBySubcategory = (events, subcategory) => {
  if (!subcategory || subcategory === 'All') return events;
  return events.filter(event => event.categorySecondary === subcategory);
};

// Filter events by time
export const filterEventsByTime = (events, time) => {
  if (!time || time === 'All') return events;
  return events.filter(event => event.time === time);
};

// Filter events by day
export const filterEventsByDay = (events, day) => {
  if (!day || day === 'All') return events;
  return events.filter(event => event.day === day);
};

// Get all unique categories
export const getAllCategories = () => {
  return [...new Set(ENHANCED_SAMPLE_EVENTS.map(event => event.categoryPrimary))];
};

// Get all unique subcategories
export const getAllSubcategories = () => {
  return [...new Set(ENHANCED_SAMPLE_EVENTS.map(event => event.categorySecondary))];
};

// Get all unique times
export const getAllTimes = () => {
  return [...new Set(ENHANCED_SAMPLE_EVENTS.map(event => event.time))];
};

// Get all unique days
export const getAllDays = () => {
  return [...new Set(ENHANCED_SAMPLE_EVENTS.map(event => event.day))];
};

// Get events by location bounds
export const getEventsByBounds = (events, bounds) => {
  return events.filter(event => {
    const lat = event.latitude;
    const lng = event.longitude;
    return lat >= bounds.south && lat <= bounds.north && 
           lng >= bounds.west && lng <= bounds.east;
  });
};

// Get event statistics
export const getEventStatistics = () => {
  const events = ENHANCED_SAMPLE_EVENTS;
  const stats = {
    total: events.length,
    byCategory: {},
    byTime: {},
    byDay: {},
    byPrice: { free: 0, paid: 0 },
    totalAttendees: 0,
    averageAttendees: 0
  };

  events.forEach(event => {
    // Category stats
    stats.byCategory[event.categoryPrimary] = (stats.byCategory[event.categoryPrimary] || 0) + 1;
    
    // Time stats
    stats.byTime[event.time] = (stats.byTime[event.time] || 0) + 1;
    
    // Day stats
    stats.byDay[event.day] = (stats.byDay[event.day] || 0) + 1;
    
    // Price stats
    if (event.price === 'Free') {
      stats.byPrice.free++;
    } else {
      stats.byPrice.paid++;
    }
    
    // Attendee stats
    stats.totalAttendees += event.attendees;
  });

  stats.averageAttendees = Math.round(stats.totalAttendees / events.length);
  
  return stats;
};

export default ENHANCED_SAMPLE_EVENTS;
